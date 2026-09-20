import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { extractCombatTelemetryFromImage, REFERENCE_COMBAT_TELEMETRY } from './services/visionParser.js';
import { getAllRuns, getRunById, commitRun, updateRun, deleteRun, auditTelemetry } from './services/telemetryService.js';
import { ExtractionSchema } from './schemas/extractionSchema.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.SERVER_PORT || 5001;

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage for uploaded screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const uniqueName = `run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check & Engine Status
app.get('/api/telemetry/health', (req, res) => {
  const aiEngine = process.env.GEMINI_API_KEY
    ? 'gemini-2.5-flash'
    : process.env.OPENAI_API_KEY
    ? 'gpt-4o-mini'
    : 'tesseract-ocr';

  res.json({
    status: 'ok',
    gameVersion: '7.0',
    timestamp: new Date().toISOString(),
    aiEngine,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
  });
});

// Config: Get & Set API Keys
app.get('/api/telemetry/config', (req, res) => {
  res.json({
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    geminiKeyPreview: process.env.GEMINI_API_KEY
      ? `${process.env.GEMINI_API_KEY.slice(0, 6)}...${process.env.GEMINI_API_KEY.slice(-4)}`
      : '',
    openAiKeyPreview: process.env.OPENAI_API_KEY
      ? `${process.env.OPENAI_API_KEY.slice(0, 6)}...${process.env.OPENAI_API_KEY.slice(-4)}`
      : '',
  });
});

app.post('/api/telemetry/config', (req, res) => {
  try {
    const { geminiKey, openaiKey } = req.body;
    const envPath = path.resolve(__dirname, '../../.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    if (geminiKey !== undefined) {
      process.env.GEMINI_API_KEY = geminiKey.trim();
      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${geminiKey.trim()}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${geminiKey.trim()}`;
      }
    }

    if (openaiKey !== undefined) {
      process.env.OPENAI_API_KEY = openaiKey.trim();
      if (envContent.includes('OPENAI_API_KEY=')) {
        envContent = envContent.replace(/OPENAI_API_KEY=.*/g, `OPENAI_API_KEY=${openaiKey.trim()}`);
      } else {
        envContent += `\nOPENAI_API_KEY=${openaiKey.trim()}`;
      }
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

    res.json({
      success: true,
      message: 'API configuration saved successfully',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Scan Screenshot
app.post('/api/telemetry/scan', upload.single('file'), async (req, res) => {
  try {
    let imageBuffer;
    let imageUrl = '/sample-runs/sample-dps-run.png';
    let mimeType = 'image/png';
    const isSample = Boolean(req.body.sample && req.body.sample !== 'false');
    const customApiKey = req.headers['x-gemini-key'] || req.body.apiKey;

    if (req.file) {
      imageBuffer = fs.readFileSync(req.file.path);
      imageUrl = `/uploads/${req.file.filename}`;
      mimeType = req.file.mimetype || 'image/png';
    } else if (isSample) {
      const samplePath = path.resolve(__dirname, '../../public/sample-runs/sample-dps-run.png');
      if (fs.existsSync(samplePath)) {
        imageBuffer = fs.readFileSync(samplePath);
      } else {
        imageBuffer = Buffer.from('');
      }
    } else {
      return res.status(400).json({ error: 'No file uploaded or sample requested' });
    }

    const { telemetry, engine, rawTextSnippet } = await extractCombatTelemetryFromImage(
      imageBuffer,
      mimeType,
      { isSample, customApiKey }
    );
    const audit = auditTelemetry(telemetry);

    res.json({
      success: true,
      data: telemetry,
      imageUrl,
      engine,
      rawTextSnippet,
      audit,
    });
  } catch (error) {
    console.error('[API Scan Error]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to parse screenshot',
      fallbackData: REFERENCE_COMBAT_TELEMETRY,
      imageUrl: '/sample-runs/sample-dps-run.png',
      engine: 'fallback-error',
      audit: auditTelemetry(REFERENCE_COMBAT_TELEMETRY),
    });
  }
});

// Commit Verified Telemetry Record
app.post('/api/telemetry/commit', async (req, res) => {
  try {
    const { telemetry, imageUrl, gameVersion } = req.body;
    if (!telemetry) {
      return res.status(400).json({ error: 'Missing telemetry payload' });
    }

    // Validate structure against Zod schema
    const validatedTelemetry = ExtractionSchema.parse(telemetry);
    const result = await commitRun(validatedTelemetry, imageUrl, gameVersion || '7.0');

    res.status(201).json({
      success: true,
      message: 'Combat run committed to archive',
      data: result.run,
      audit: result.audit,
    });
  } catch (error) {
    console.error('[API Commit Error]:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Validation or commit failed',
    });
  }
});

// Get Paginated DPS Runs
app.get('/api/telemetry/runs', async (req, res) => {
  try {
    const { testPreset, element, character, gameVersion, sortBy, sortOrder, page, limit } = req.query;
    const result = await getAllRuns({
      testPreset,
      element,
      character,
      gameVersion,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[API Runs Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Run Details by ID
app.get('/api/telemetry/runs/:id', async (req, res) => {
  try {
    const run = await getRunById(req.params.id);
    if (!run) {
      return res.status(404).json({ success: false, error: 'Run not found' });
    }
    const audit = auditTelemetry({
      meta: { stageGuid: run.stageGuid, uid: run.uid },
      testSummary: {
        testPreset: run.testPreset,
        dps: run.dps,
        timeElapsedSeconds: Number(run.timeElapsedSeconds),
        totalDamage: Number(run.totalDamage),
        strongestHit: run.strongestHit,
      },
      targetModifiers: {
        targetName: run.targetName,
        targetLevel: run.targetLevel,
        resistances: run.targetResistances,
      },
      elementalDistribution: run.elementalBreakdowns.reduce((acc, item) => {
        acc[item.element.toLowerCase()] = item.percentage;
        return acc;
      }, {}),
      characterContributions: run.characters.map((c) => ({
        name: c.name,
        level: c.level,
        damageDealt: Number(c.damageDealt),
        damagePercent: c.damagePercent,
        stats: {
          hp: c.hp,
          baseAtk: c.baseAtk,
          atk: c.atk,
          baseDef: c.baseDef,
          def: c.def,
          critRate: Number(c.critRate),
          critDamage: Number(c.critDamage),
          energyRecharge: Number(c.energyRecharge),
          elementalMastery: c.elementalMastery,
          damageBonuses: c.damageBonuses,
        },
      })),
      rotationResults: run.rotations.map((r) => ({
        rotationNumber: r.rotationNumber,
        dps: r.dps,
        damageDealt: Number(r.damageDealt),
        durationSeconds: Number(r.durationSeconds),
        notes: r.notes || '',
      })),
    });

    res.json({ success: true, data: run, audit });
  } catch (error) {
    console.error('[API Run By Id Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Run (Manual Input of Weapons, Artifacts, Notes, Rotations)
app.patch('/api/telemetry/runs/:id', async (req, res) => {
  try {
    const updated = await updateRun(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Run builds and notes updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('[API Update Run Error]:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/telemetry/runs/:id', async (req, res) => {
  try {
    const updated = await updateRun(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Run builds and notes updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('[API Update Run Error]:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete Run
app.delete('/api/telemetry/runs/:id', async (req, res) => {
  try {
    const success = await deleteRun(req.params.id);
    res.json({ success });
  } catch (error) {
    console.error('[API Delete Run Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[GenshinDPS Server] Telemetry API running on port ${PORT}`);
});
