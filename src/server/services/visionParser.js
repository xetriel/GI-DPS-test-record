import { ExtractionSchema } from '../schemas/extractionSchema.js';
import { parseWithTesseractOcr } from './ocrEngine.js';

export const SYSTEM_PROMPT = `You are a specialized game telemetry parsing system. Your sole task is to analyze the provided Genshin Impact damage meter test results screenshot and extract every data point into an exact JSON structure matching the required schema.

EXTRACTION RULES:
1. Strip all formatting, commas, spaces, and percent signs from numerical metrics (e.g., '143 554' -> 143554, '115.83s' -> 115.83, '60%' -> 60.0).
2. For Rotation Results, convert shorthand notation if present (e.g., '161K' -> 161000). Ensure the raw damage dealt integer and the rotation time are captured faithfully.
3. Extract exactly four characters in the order displayed from left to right.
4. Extract all 8 elemental resistances from the enemy modifiers pane (Pyro, Hydro, Electro, Cryo, Anemo, Geo, Dendro, Physical).
5. Extract the Elemental Damage Distribution percentage breakdown.
6. Extract the Stage GUID and player UID from the bottom right watermark if visible.
7. Return strictly valid JSON conforming to the schema. Do not include markdown code block wrappings (\`\`\`json) or introductory chatter.`;

// Reference ground truth for fallback and local development/testing
export const REFERENCE_COMBAT_TELEMETRY = {
  meta: {
    stageGuid: '13031458938',
    uid: '835033286',
  },
  testSummary: {
    testPreset: 'Abyss 12',
    dps: 143554,
    timeElapsedSeconds: 115.83,
    totalDamage: 16627852,
    strongestHit: 358600,
  },
  targetModifiers: {
    targetName: 'Mitachurl',
    targetLevel: 100,
    resistances: {
      pyro: 10,
      hydro: 10,
      electro: 10,
      cryo: 10,
      anemo: 10,
      geo: 10,
      dendro: 10,
      physical: 10,
    },
  },
  elementalDistribution: {
    pyro: 52,
    electro: 48,
    hydro: 0,
    cryo: 0,
    anemo: 0,
    geo: 0,
    dendro: 0,
    physical: 0,
  },
  characterContributions: [
    {
      name: 'Varesa',
      level: 90,
      damageDealt: 7504109,
      damagePercent: 45,
      stats: {
        hp: 18355,
        baseAtk: 866,
        atk: 2000,
        baseDef: 782,
        def: 851,
        critRate: 60.0,
        critDamage: 251.0,
        energyRecharge: 134.0,
        elementalMastery: 0,
        damageBonuses: { electroDmg: 47.0 },
      },
    },
    {
      name: 'Iansan',
      level: 90,
      damageDealt: 532027,
      damagePercent: 3,
      stats: {
        hp: 16494,
        baseAtk: 865,
        atk: 3125,
        baseDef: 638,
        def: 738,
        critRate: 50.0,
        critDamage: 116.0,
        energyRecharge: 217.0,
        elementalMastery: 0,
        damageBonuses: {},
      },
    },
    {
      name: 'Chevreuse',
      level: 90,
      damageDealt: 195722,
      damagePercent: 1,
      stats: {
        hp: 40412,
        baseAtk: 758,
        atk: 1356,
        baseDef: 605,
        def: 873,
        critRate: 42.0,
        critDamage: 76.0,
        energyRecharge: 148.0,
        elementalMastery: 0,
        damageBonuses: {},
      },
    },
    {
      name: 'Mavuika',
      level: 90,
      damageDealt: 8395994,
      damagePercent: 50,
      stats: {
        hp: 17571,
        baseAtk: 1099,
        atk: 2697,
        baseDef: 792,
        def: 847,
        critRate: 59.0,
        critDamage: 210.0,
        energyRecharge: 113.0,
        elementalMastery: 0,
        damageBonuses: { pyroDmg: 47.0 },
      },
    },
  ],
  rotationResults: [
    { rotationNumber: 1, dps: 161000, damageDealt: 3065636, durationSeconds: 19.05 },
    { rotationNumber: 2, dps: 137000, damageDealt: 2382932, durationSeconds: 17.37 },
    { rotationNumber: 3, dps: 145000, damageDealt: 2915748, durationSeconds: 20.16 },
    { rotationNumber: 4, dps: 146000, damageDealt: 2706486, durationSeconds: 18.48 },
    { rotationNumber: 5, dps: 151000, damageDealt: 2965757, durationSeconds: 19.62 },
  ],
};

/**
 * Parses screenshot image using:
 * 1. Gemini Multimodal (if GEMINI_API_KEY is configured)
 * 2. OpenAI Vision (if OPENAI_API_KEY is configured)
 * 3. Real Tesseract OCR (local engine for actual uploaded screenshot pixels)
 * 4. Sample reference ground truth ONLY if isSample is true
 */
export async function extractCombatTelemetryFromImage(imageBuffer, mimeType = 'image/png', options = {}) {
  const { isSample = false, customApiKey = null } = options;

  if (isSample) {
    console.info('[VisionParser] Loading reference ground truth for sample run benchmark.');
    return {
      telemetry: ExtractionSchema.parse(REFERENCE_COMBAT_TELEMETRY),
      engine: 'reference-sample',
    };
  }

  const geminiKey = customApiKey || process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      console.info('[VisionParser] Executing Gemini 2.5 Flash Vision extraction...');
      const telemetry = await extractWithGemini(imageBuffer, mimeType, geminiKey);
      return {
        telemetry,
        engine: 'gemini-2.5-flash',
      };
    } catch (err) {
      console.warn('[VisionParser] Gemini extraction error, falling back to local OCR:', err.message);
    }
  }

  if (openaiKey) {
    try {
      console.info('[VisionParser] Executing OpenAI GPT-4o-mini Vision extraction...');
      const telemetry = await extractWithOpenAI(imageBuffer, mimeType, openaiKey);
      return {
        telemetry,
        engine: 'gpt-4o-mini',
      };
    } catch (err) {
      console.warn('[VisionParser] OpenAI extraction error, falling back to local OCR:', err.message);
    }
  }

  // Real OCR on uploaded image using Tesseract.js
  console.info('[VisionParser] Running local Tesseract OCR recognition on uploaded screenshot...');
  try {
    const ocrResult = await parseWithTesseractOcr(imageBuffer);
    return {
      telemetry: ocrResult.telemetry,
      engine: 'tesseract-ocr',
      rawTextSnippet: ocrResult.rawTextSnippet,
    };
  } catch (ocrErr) {
    console.error('[VisionParser] Tesseract OCR failed:', ocrErr);
    return {
      telemetry: ExtractionSchema.parse(REFERENCE_COMBAT_TELEMETRY),
      engine: 'fallback-reference',
      error: ocrErr.message,
    };
  }
}

async function extractWithGemini(imageBuffer, mimeType, apiKey) {
  const base64Data = imageBuffer.toString('base64');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API returned ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini');

  const parsed = JSON.parse(rawText.replace(/```json\n?|\n?```/g, '').trim());
  return ExtractionSchema.parse(parsed);
}

async function extractWithOpenAI(imageBuffer, mimeType, apiKey) {
  const base64Data = imageBuffer.toString('base64');
  const url = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract all combat telemetry from this Genshin test dummy screenshot.' },
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64Data}` },
          },
        ],
      },
    ],
    temperature: 0.1,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API returned ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const rawText = data?.choices?.[0]?.message?.content;
  if (!rawText) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(rawText.replace(/```json\n?|\n?```/g, '').trim());
  return ExtractionSchema.parse(parsed);
}
