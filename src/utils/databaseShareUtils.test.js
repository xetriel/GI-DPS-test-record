import { describe, it, expect } from 'vitest';
import {
  exportRunsToJson,
  exportRunsToSummaryCsv,
  exportCharactersToCsv,
  parseImportData,
} from './databaseShareUtils.js';

describe('databaseShareUtils Suite', () => {
  const sampleRun = {
    id: 'test-run-123',
    teamName: 'Zibai Premium',
    testPreset: 'Stygian Dire',
    gameVersion: '7.0',
    dps: 584326,
    timeElapsedSeconds: 120.52,
    totalDamage: 70425281,
    strongestHit: 1523710,
    targetName: 'Target Dummy',
    targetLevel: 100,
    notes: 'Benchmark run',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
    characters: [
      {
        slotOrder: 1,
        name: 'Zibai',
        level: 100,
        damagePercent: 56,
        damageDealt: 39438157,
        constellation: 3,
        weaponName: 'Peak Patrol Song',
        weaponRefinement: 1,
        buildLabel: 'C3 R1',
        artifacts: '4pc Obsidian Codex',
        hp: 21684,
        baseAtk: 817,
        atk: 1217,
        baseDef: 1025,
        def: 3151,
        critRate: 54.0,
        critDamage: 315.0,
        energyRecharge: 100.0,
        elementalMastery: 0,
      },
      {
        slotOrder: 2,
        name: 'Linnea',
        level: 90,
        damagePercent: 24,
        damageDealt: 16902067,
        constellation: 2,
        weaponName: 'Silvershower Heartstrings',
        weaponRefinement: 1,
        buildLabel: 'C2R1',
        artifacts: '4pc Scroll of the Hero',
        hp: 15183,
        baseAtk: 685,
        atk: 1028,
        baseDef: 907,
        def: 2603,
        critRate: 92.0,
        critDamage: 227.0,
        energyRecharge: 100.0,
        elementalMastery: 0,
      },
    ],
    rotations: [
      { rotationNumber: 1, dps: 606000, damageDealt: 24011732, durationSeconds: 39.6 },
    ],
    elementalBreakdowns: [{ element: 'Geo', percentage: 80 }, { element: 'Hydro', percentage: 20 }],
  };

  it('exports runs to a valid JSON bundle', () => {
    const jsonStr = exportRunsToJson([sampleRun]);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.app).toBe('GenshinDPS');
    expect(parsed.runCount).toBe(1);
    expect(parsed.runs[0].teamName).toBe('Zibai Premium');
    expect(parsed.runs[0].dps).toBe(584326);
  });

  it('exports runs to a summary CSV format', () => {
    const csvStr = exportRunsToSummaryCsv([sampleRun]);
    expect(csvStr).toContain('Run ID,Team Name,Test Preset');
    expect(csvStr).toContain('test-run-123,Zibai Premium,Stygian Dire');
    expect(csvStr).toContain('Zibai (C3 R1)');
  });

  it('exports characters to a detailed breakdown CSV format', () => {
    const csvStr = exportCharactersToCsv([sampleRun]);
    expect(csvStr).toContain('Run ID,Team Name,Slot Order,Character Name');
    expect(csvStr).toContain('test-run-123,Zibai Premium,1,Zibai,100,3,Peak Patrol Song,1,4pc Obsidian Codex,C3 R1,39438157,56');
    expect(csvStr).toContain('test-run-123,Zibai Premium,2,Linnea,90,2,Silvershower Heartstrings,1,4pc Scroll of the Hero,C2R1,16902067,24');
  });

  it('correctly parses imported JSON bundle and sanitizes fields', () => {
    const jsonStr = exportRunsToJson([sampleRun]);
    const res = parseImportData(jsonStr);
    expect(res.valid).toBe(true);
    expect(res.format).toBe('json');
    expect(res.runCount).toBe(1);
    expect(res.runs[0].teamName).toBe('Zibai Premium');
    expect(res.runs[0].characters).toHaveLength(2);
  });

  it('correctly parses raw array of runs without bundle wrapper', () => {
    const rawArrayStr = JSON.stringify([sampleRun]);
    const res = parseImportData(rawArrayStr);
    expect(res.valid).toBe(true);
    expect(res.runCount).toBe(1);
    expect(res.runs[0].id).toBe('test-run-123');
  });

  it('correctly parses single run JSON object', () => {
    const singleRunStr = JSON.stringify(sampleRun);
    const res = parseImportData(singleRunStr);
    expect(res.valid).toBe(true);
    expect(res.runCount).toBe(1);
    expect(res.runs[0].id).toBe('test-run-123');
  });

  it('handles invalid JSON gracefully', () => {
    const invalidJson = '{ teamName: "Broken JSON"';
    const res = parseImportData(invalidJson, 'json');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Invalid JSON');
  });

  it('correctly parses summary CSV back into runs', () => {
    const csvStr = exportRunsToSummaryCsv([sampleRun]);
    const res = parseImportData(csvStr);
    expect(res.valid).toBe(true);
    expect(res.format).toBe('csv');
    expect(res.runCount).toBe(1);
    expect(res.runs[0].teamName).toBe('Zibai Premium');
    expect(res.runs[0].dps).toBe(584326);
    expect(res.runs[0].characters[0].name).toBe('Zibai');
  });
});
