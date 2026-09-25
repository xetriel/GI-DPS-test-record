/**
 * GenshinDPS Database Sharing & Export Utilities
 * Provides serialization and parsing for JSON database archives and CSV tables.
 */

/**
 * Escapes a single CSV field value according to RFC-4180
 */
function escapeCsvValue(val) {
  if (val === null || val === undefined) return '';
  const stringVal = String(val);
  if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r')) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return stringVal;
}

/**
 * Converts runs into a formatted JSON archive bundle with metadata
 */
export function exportRunsToJson(runs = [], options = {}) {
  const safeRuns = Array.isArray(runs) ? runs : [runs].filter(Boolean);
  const bundle = {
    app: 'GenshinDPS',
    schemaVersion: '1.0',
    exportedAt: new Date().toISOString(),
    gameVersion: options.gameVersion || '7.0',
    source: options.source || 'GenshinDPS Telemetry Archive',
    runCount: safeRuns.length,
    runs: safeRuns,
  };

  return JSON.stringify(bundle, null, 2);
}

/**
 * Converts runs into a flattened summary CSV (1 row per run)
 */
export function exportRunsToSummaryCsv(runs = []) {
  const safeRuns = Array.isArray(runs) ? runs : [runs].filter(Boolean);

  const headers = [
    'Run ID',
    'Team Name',
    'Test Preset',
    'Game Version',
    'Reported DPS',
    'Time Elapsed (s)',
    'Total Damage',
    'Strongest Hit',
    'Target Name',
    'Target Level',
    'Character 1',
    'Character 2',
    'Character 3',
    'Character 4',
    'Created At',
    'Updated At',
    'Notes',
  ];

  const rows = safeRuns.map((run) => {
    const chars = run.characters || [];
    const charNames = [0, 1, 2, 3].map((idx) => {
      const c = chars[idx];
      if (!c) return '';
      const build = c.buildLabel ? ` (${c.buildLabel})` : '';
      return `${c.name || 'Unknown'}${build}`;
    });

    return [
      escapeCsvValue(run.id),
      escapeCsvValue(run.teamName || 'Custom Party'),
      escapeCsvValue(run.testPreset || 'Abyss 12'),
      escapeCsvValue(run.gameVersion || '7.0'),
      escapeCsvValue(run.dps || 0),
      escapeCsvValue(run.timeElapsedSeconds || 0),
      escapeCsvValue(run.totalDamage || 0),
      escapeCsvValue(run.strongestHit || 0),
      escapeCsvValue(run.targetName || 'Target Dummy'),
      escapeCsvValue(run.targetLevel || 100),
      escapeCsvValue(charNames[0]),
      escapeCsvValue(charNames[1]),
      escapeCsvValue(charNames[2]),
      escapeCsvValue(charNames[3]),
      escapeCsvValue(run.createdAt || ''),
      escapeCsvValue(run.updatedAt || ''),
      escapeCsvValue(run.notes || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Converts character telemetry from all runs into a detailed CSV (1 row per character build)
 */
export function exportCharactersToCsv(runs = []) {
  const safeRuns = Array.isArray(runs) ? runs : [runs].filter(Boolean);

  const headers = [
    'Run ID',
    'Team Name',
    'Slot Order',
    'Character Name',
    'Level',
    'Constellation',
    'Weapon Name',
    'Weapon Refinement',
    'Artifacts',
    'Build Label',
    'Damage Dealt',
    'Damage %',
    'HP',
    'Base ATK',
    'Total ATK',
    'Base DEF',
    'Total DEF',
    'Crit Rate %',
    'Crit DMG %',
    'Energy Recharge %',
    'Elemental Mastery',
    'Notes',
  ];

  const rows = [];

  safeRuns.forEach((run) => {
    const chars = run.characters || [];
    chars.forEach((c, idx) => {
      const stats = c.stats || {};
      rows.push(
        [
          escapeCsvValue(run.id),
          escapeCsvValue(run.teamName || 'Custom Party'),
          escapeCsvValue(c.slotOrder || idx + 1),
          escapeCsvValue(c.name || 'Unknown'),
          escapeCsvValue(c.level || 90),
          escapeCsvValue(c.constellation ?? 0),
          escapeCsvValue(c.weaponName || ''),
          escapeCsvValue(c.weaponRefinement ?? 1),
          escapeCsvValue(c.artifacts || ''),
          escapeCsvValue(c.buildLabel || ''),
          escapeCsvValue(c.damageDealt || 0),
          escapeCsvValue(c.damagePercent || 0),
          escapeCsvValue(c.hp ?? stats.hp ?? 0),
          escapeCsvValue(c.baseAtk ?? stats.baseAtk ?? 0),
          escapeCsvValue(c.atk ?? stats.atk ?? 0),
          escapeCsvValue(c.baseDef ?? stats.baseDef ?? 0),
          escapeCsvValue(c.def ?? stats.def ?? 0),
          escapeCsvValue(c.critRate ?? stats.critRate ?? 0),
          escapeCsvValue(c.critDamage ?? stats.critDamage ?? 0),
          escapeCsvValue(c.energyRecharge ?? stats.energyRecharge ?? 0),
          escapeCsvValue(c.elementalMastery ?? stats.elementalMastery ?? 0),
          escapeCsvValue(c.notes || ''),
        ].join(',')
      );
    });
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Parses raw imported string (from file or "Paste here" area)
 * Supports JSON bundles, raw JSON arrays, single JSON runs, and summary CSVs.
 */
export function parseImportData(rawContent, formatHint = 'auto') {
  if (!rawContent || typeof rawContent !== 'string') {
    return { valid: false, error: 'No data provided', runs: [] };
  }

  const trimmed = rawContent.trim();
  if (!trimmed) {
    return { valid: false, error: 'Input text is empty', runs: [] };
  }

  // Attempt JSON parsing if hint is json or if starts with '{' or '['
  const isLikelyJson = formatHint === 'json' || trimmed.startsWith('{') || trimmed.startsWith('[');

  if (isLikelyJson) {
    try {
      const parsed = JSON.parse(trimmed);
      let runsArray = [];

      if (Array.isArray(parsed)) {
        runsArray = parsed;
      } else if (parsed && Array.isArray(parsed.runs)) {
        runsArray = parsed.runs;
      } else if (parsed && typeof parsed === 'object') {
        runsArray = [parsed];
      }

      if (runsArray.length === 0) {
        return { valid: false, error: 'Parsed JSON contains no combat telemetry runs', runs: [] };
      }

      // Sanitize and validate runs
      const sanitizedRuns = runsArray.map((run, idx) => sanitizeImportedRun(run, idx));

      return {
        valid: true,
        format: 'json',
        runCount: sanitizedRuns.length,
        runs: sanitizedRuns,
        metadata: {
          app: parsed.app || 'GenshinDPS',
          schemaVersion: parsed.schemaVersion || '1.0',
          exportedAt: parsed.exportedAt || null,
        },
      };
    } catch (jsonErr) {
      if (formatHint === 'json') {
        return { valid: false, error: `Invalid JSON format: ${jsonErr.message}`, runs: [] };
      }
      // If auto-detect, fall through to CSV parser
    }
  }

  // Attempt CSV parsing
  try {
    const lines = trimmed.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      return { valid: false, error: 'CSV file must contain a header and at least one data row', runs: [] };
    }

    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
    const runs = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length === 0 || (cols.length === 1 && cols[0] === '')) continue;

      const rowMap = {};
      header.forEach((h, colIdx) => {
        rowMap[h] = cols[colIdx] || '';
      });

      const run = {
        id: rowMap['run id'] || `imported_${Date.now()}_${i}`,
        teamName: rowMap['team name'] || `Imported Team ${i}`,
        testPreset: rowMap['test preset'] || 'Abyss 12',
        gameVersion: rowMap['game version'] || '7.0',
        dps: parseInt(rowMap['reported dps'] || rowMap['dps'], 10) || 0,
        timeElapsedSeconds: parseFloat(rowMap['time elapsed (s)'] || rowMap['time elapsed'] || 120),
        totalDamage: parseInt(rowMap['total damage'] || 0, 10),
        strongestHit: parseInt(rowMap['strongest hit'] || 0, 10),
        targetName: rowMap['target name'] || 'Target Dummy',
        targetLevel: parseInt(rowMap['target level'] || 100, 10),
        notes: rowMap['notes'] || 'Imported via CSV',
        createdAt: rowMap['created at'] || new Date().toISOString(),
        updatedAt: rowMap['updated at'] || new Date().toISOString(),
        verified: true,
        characters: [],
        rotations: [],
        elementalBreakdowns: [],
      };

      // Extract character names if present
      ['character 1', 'character 2', 'character 3', 'character 4'].forEach((charKey, slotIdx) => {
        const rawName = rowMap[charKey];
        if (rawName) {
          const match = rawName.match(/^([^(]+)(?:\(([^)]+)\))?$/);
          const name = match ? match[1].trim() : rawName.trim();
          const buildLabel = match && match[2] ? match[2].trim() : '';
          run.characters.push({
            id: Date.now() + i * 10 + slotIdx,
            slotOrder: slotIdx + 1,
            name,
            buildLabel,
            level: 90,
            damagePercent: slotIdx === 0 ? 50 : slotIdx === 1 ? 30 : slotIdx === 2 ? 15 : 5,
            damageDealt: Math.round((run.totalDamage || 1000000) * (slotIdx === 0 ? 0.5 : slotIdx === 1 ? 0.3 : slotIdx === 2 ? 0.15 : 0.05)),
            constellation: 0,
            weaponName: '',
            weaponRefinement: 1,
            artifacts: '',
            hp: 20000,
            baseAtk: 700,
            atk: 1500,
            baseDef: 800,
            def: 800,
            critRate: 60,
            critDamage: 180,
            energyRecharge: 120,
            elementalMastery: 0,
            damageBonuses: {},
          });
        }
      });

      runs.push(sanitizeImportedRun(run, i));
    }

    if (runs.length === 0) {
      return { valid: false, error: 'No valid data rows found in CSV', runs: [] };
    }

    return {
      valid: true,
      format: 'csv',
      runCount: runs.length,
      runs,
    };
  } catch (csvErr) {
    return { valid: false, error: `Failed to parse data: ${csvErr.message}`, runs: [] };
  }
}

/**
 * Basic RFC-4180 CSV line parser
 */
function parseCsvLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  result.push(cur.trim());
  return result;
}

/**
 * Ensures an imported run conforms to expected structure with default values
 */
function sanitizeImportedRun(run, index) {
  const id = run.id || `run_${Date.now()}_${index}`;
  const totalDamage = Number(run.totalDamage) || 0;
  const timeElapsed = Number(run.timeElapsedSeconds) || 120;
  const dps = Number(run.dps) || (timeElapsed > 0 ? Math.round(totalDamage / timeElapsed) : 0);

  return {
    id,
    teamName: run.teamName || (run.characters?.[0]?.name ? `${run.characters[0].name} Team` : `Run ${index + 1}`),
    stageGuid: run.stageGuid || null,
    uid: run.uid || null,
    testPreset: run.testPreset || 'Abyss 12',
    dps,
    timeElapsedSeconds: timeElapsed,
    totalDamage,
    strongestHit: Number(run.strongestHit) || 0,
    targetName: run.targetName || 'Target Dummy',
    targetLevel: Number(run.targetLevel) || 100,
    targetResistances: run.targetResistances || {
      pyro: 10,
      hydro: 10,
      electro: 10,
      cryo: 10,
      anemo: 10,
      geo: 10,
      dendro: 10,
      physical: 10,
    },
    gameVersion: run.gameVersion || '7.0',
    imageUrl: run.imageUrl || '/sample-runs/sample-dps-run.png',
    verified: Boolean(run.verified ?? true),
    notes: run.notes || '',
    createdAt: run.createdAt || new Date().toISOString(),
    updatedAt: run.updatedAt || new Date().toISOString(),
    characters: Array.isArray(run.characters)
      ? run.characters.map((c, cIdx) => ({
          id: c.id || Date.now() + cIdx,
          runId: id,
          slotOrder: c.slotOrder || cIdx + 1,
          name: c.name || `Character ${cIdx + 1}`,
          level: Number(c.level) || 90,
          damageDealt: Number(c.damageDealt) || 0,
          damagePercent: Number(c.damagePercent) || 0,
          constellation: Number(c.constellation ?? 0),
          weaponName: c.weaponName || '',
          weaponRefinement: Number(c.weaponRefinement ?? 1),
          artifacts: c.artifacts || '',
          buildLabel: c.buildLabel || '',
          notes: c.notes || '',
          hp: Number(c.hp ?? c.stats?.hp ?? 20000),
          baseAtk: Number(c.baseAtk ?? c.stats?.baseAtk ?? 700),
          atk: Number(c.atk ?? c.stats?.atk ?? 1500),
          baseDef: Number(c.baseDef ?? c.stats?.baseDef ?? 800),
          def: Number(c.def ?? c.stats?.def ?? 800),
          critRate: Number(c.critRate ?? c.stats?.critRate ?? 60),
          critDamage: Number(c.critDamage ?? c.stats?.critDamage ?? 180),
          energyRecharge: Number(c.energyRecharge ?? c.stats?.energyRecharge ?? 120),
          elementalMastery: Number(c.elementalMastery ?? c.stats?.elementalMastery ?? 0),
          damageBonuses: c.damageBonuses || c.stats?.damageBonuses || {},
        }))
      : [],
    rotations: Array.isArray(run.rotations)
      ? run.rotations.map((r, rIdx) => ({
          id: r.id || Date.now() + 100 + rIdx,
          runId: id,
          rotationNumber: Number(r.rotationNumber) || rIdx + 1,
          dps: Number(r.dps) || 0,
          damageDealt: Number(r.damageDealt) || 0,
          durationSeconds: Number(r.durationSeconds) || 20,
          notes: r.notes || '',
        }))
      : [],
    elementalBreakdowns: Array.isArray(run.elementalBreakdowns)
      ? run.elementalBreakdowns.map((e, eIdx) => ({
          id: e.id || Date.now() + 200 + eIdx,
          runId: id,
          element: e.element || 'Physical',
          percentage: Number(e.percentage) || 0,
        }))
      : [],
  };
}

/**
 * Triggers a browser file download for a generated string/blob
 */
export function downloadBlob(content, filename, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
