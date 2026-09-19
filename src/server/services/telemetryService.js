import crypto from 'crypto';

// In-memory / fallback store seeded with the uploaded screenshot run and comparative runs
const SEED_RUNS = [
  {
    id: 'f87a1921-6dc3-4a18-971c-4395b28710a1',
    stageGuid: '13031458938',
    uid: '835033286',
    testPreset: 'Abyss 12',
    dps: 143554,
    timeElapsedSeconds: 115.83,
    totalDamage: 16627852,
    strongestHit: 358600,
    targetName: 'Mitachurl',
    targetLevel: 100,
    targetResistances: {
      pyro: 10,
      hydro: 10,
      electro: 10,
      cryo: 10,
      anemo: 10,
      geo: 10,
      dendro: 10,
      physical: 10,
    },
    gameVersion: '7.0',
    imageUrl: '/sample-runs/sample-dps-run.png',
    verified: true,
    createdAt: new Date('2026-09-19T14:30:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-19T14:30:00.000Z').toISOString(),
    characters: [
      {
        id: 1,
        runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1',
        slotOrder: 1,
        name: 'Varesa',
        level: 90,
        damageDealt: 7504109,
        damagePercent: 45,
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
      {
        id: 2,
        runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1',
        slotOrder: 2,
        name: 'Iansan',
        level: 90,
        damageDealt: 532027,
        damagePercent: 3,
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
      {
        id: 3,
        runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1',
        slotOrder: 3,
        name: 'Chevreuse',
        level: 90,
        damageDealt: 195722,
        damagePercent: 1,
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
      {
        id: 4,
        runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1',
        slotOrder: 4,
        name: 'Mavuika',
        level: 90,
        damageDealt: 8395994,
        damagePercent: 50,
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
    ],
    rotations: [
      { id: 1, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', rotationNumber: 1, dps: 161000, damageDealt: 3065636, durationSeconds: 19.05 },
      { id: 2, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', rotationNumber: 2, dps: 137000, damageDealt: 2382932, durationSeconds: 17.37 },
      { id: 3, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', rotationNumber: 3, dps: 145000, damageDealt: 2915748, durationSeconds: 20.16 },
      { id: 4, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', rotationNumber: 4, dps: 146000, damageDealt: 2706486, durationSeconds: 18.48 },
      { id: 5, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', rotationNumber: 5, dps: 151000, damageDealt: 2965757, durationSeconds: 19.62 },
    ],
    elementalBreakdowns: [
      { id: 1, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', element: 'Pyro', percentage: 52 },
      { id: 2, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', element: 'Electro', percentage: 48 },
      { id: 3, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', element: 'Hydro', percentage: 0 },
      { id: 4, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', element: 'Cryo', percentage: 0 },
      { id: 5, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', element: 'Anemo', percentage: 0 },
      { id: 6, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', element: 'Geo', percentage: 0 },
      { id: 7, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', element: 'Dendro', percentage: 0 },
      { id: 8, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', element: 'Physical', percentage: 0 },
    ],
  },
  {
    id: 'a91b4231-7bc2-4e29-842d-5496c39821b2',
    stageGuid: '13031459999',
    uid: '835033286',
    testPreset: 'Abyss 12',
    dps: 182100,
    timeElapsedSeconds: 98.40,
    totalDamage: 17918640,
    strongestHit: 489200,
    targetName: 'Mitachurl',
    targetLevel: 100,
    targetResistances: {
      pyro: 10,
      hydro: 10,
      electro: 10,
      cryo: 10,
      anemo: 10,
      geo: 10,
      dendro: 10,
      physical: 10,
    },
    gameVersion: '7.0',
    imageUrl: '/sample-runs/sample-dps-run.png',
    verified: true,
    createdAt: new Date('2026-09-18T10:15:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-18T10:15:00.000Z').toISOString(),
    characters: [
      {
        id: 5,
        runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2',
        slotOrder: 1,
        name: 'Neuvillette',
        level: 90,
        damageDealt: 13438980,
        damagePercent: 75,
        hp: 42100,
        baseAtk: 208,
        atk: 1020,
        baseDef: 576,
        def: 650,
        critRate: 64.2,
        critDamage: 278.4,
        energyRecharge: 122.0,
        elementalMastery: 40,
        damageBonuses: { hydroDmg: 82.5 },
      },
      {
        id: 6,
        runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2',
        slotOrder: 2,
        name: 'Furina',
        level: 90,
        damageDealt: 3583728,
        damagePercent: 20,
        hp: 38900,
        baseAtk: 244,
        atk: 1100,
        baseDef: 696,
        def: 750,
        critRate: 72.0,
        critDamage: 184.0,
        energyRecharge: 175.0,
        elementalMastery: 0,
        damageBonuses: { hydroDmg: 46.6 },
      },
      {
        id: 7,
        runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2',
        slotOrder: 3,
        name: 'Kazuha',
        level: 90,
        damageDealt: 537559,
        damagePercent: 3,
        hp: 21500,
        baseAtk: 297,
        atk: 1420,
        baseDef: 807,
        def: 860,
        critRate: 35.0,
        critDamage: 90.0,
        energyRecharge: 162.0,
        elementalMastery: 980,
        damageBonuses: { anemoDmg: 15.0 },
      },
      {
        id: 8,
        runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2',
        slotOrder: 4,
        name: 'Baizhu',
        level: 90,
        damageDealt: 358373,
        damagePercent: 2,
        hp: 51200,
        baseAtk: 193,
        atk: 1050,
        baseDef: 500,
        def: 550,
        critRate: 15.0,
        critDamage: 60.0,
        energyRecharge: 190.0,
        elementalMastery: 80,
        damageBonuses: {},
      },
    ],
    rotations: [
      { id: 6, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', rotationNumber: 1, dps: 195000, damageDealt: 4680000, durationSeconds: 24.00 },
      { id: 7, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', rotationNumber: 2, dps: 188000, damageDealt: 4512000, durationSeconds: 24.00 },
      { id: 8, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', rotationNumber: 3, dps: 178000, damageDealt: 4450000, durationSeconds: 25.00 },
      { id: 9, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', rotationNumber: 4, dps: 168000, damageDealt: 4276640, durationSeconds: 25.40 },
    ],
    elementalBreakdowns: [
      { id: 9, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', element: 'Hydro', percentage: 95 },
      { id: 10, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', element: 'Anemo', percentage: 3 },
      { id: 11, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', element: 'Dendro', percentage: 2 },
      { id: 12, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', element: 'Pyro', percentage: 0 },
      { id: 13, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', element: 'Electro', percentage: 0 },
      { id: 14, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', element: 'Cryo', percentage: 0 },
      { id: 15, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', element: 'Geo', percentage: 0 },
      { id: 16, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', element: 'Physical', percentage: 0 },
    ],
  },
];

let inMemoryRuns = [...SEED_RUNS];

/**
 * Validates extraction business logic:
 * 1. Damage percent sum: 99% <= sum <= 101%
 * 2. Elemental sum: sum == 100%
 * 3. Computed DPS audit: |(totalDamage / timeElapsedSeconds) - dps| <= 50
 */
export function auditTelemetry(telemetry) {
  const issues = [];
  const warnings = [];

  // Character damage % sum
  const charPctSum = telemetry.characterContributions.reduce((acc, c) => acc + (c.damagePercent || 0), 0);
  if (charPctSum < 99 || charPctSum > 101) {
    issues.push(`Character damage % sum is ${charPctSum}%, expected between 99% and 101%`);
  }

  // Elemental sum
  const elemDist = telemetry.elementalDistribution || {};
  const elemPctSum = Object.values(elemDist).reduce((acc, v) => acc + (Number(v) || 0), 0);
  if (elemPctSum !== 100) {
    warnings.push(`Elemental damage distribution sums to ${elemPctSum}%, expected 100%`);
  }

  // DPS audit
  const summary = telemetry.testSummary || telemetry;
  const timeElapsed = Number(summary.timeElapsedSeconds) || 0;
  const totalDmg = Number(summary.totalDamage) || 0;
  const reportedDps = Number(summary.dps) || 0;
  const computedDps = timeElapsed > 0 ? Math.round(totalDmg / timeElapsed) : 0;
  const dpsDiff = Math.abs(computedDps - reportedDps);
  const dpsDiscrepancyWarning = dpsDiff > 50;
  if (dpsDiscrepancyWarning) {
    warnings.push(
      `Computed DPS (${computedDps.toLocaleString()}) deviates from reported DPS (${reportedDps.toLocaleString()}) by ${dpsDiff} DPS`
    );
  }

  return {
    valid: issues.length === 0,
    charPctSum,
    elemPctSum,
    computedDps,
    dpsDiff,
    dpsDiscrepancyWarning,
    issues,
    warnings,
  };
}

export async function getAllRuns({ testPreset, element, character, gameVersion, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 }) {
  let runs = [...inMemoryRuns];

  if (testPreset && testPreset !== 'all') {
    runs = runs.filter((r) => r.testPreset.toLowerCase() === testPreset.toLowerCase());
  }

  if (gameVersion && gameVersion !== 'all') {
    runs = runs.filter((r) => r.gameVersion === gameVersion);
  }

  if (character && character !== 'all') {
    runs = runs.filter((r) =>
      r.characters.some((c) => c.name.toLowerCase().includes(character.toLowerCase()))
    );
  }

  if (element && element !== 'all') {
    runs = runs.filter((r) => {
      const share = r.elementalBreakdowns.find(
        (e) => e.element.toLowerCase() === element.toLowerCase()
      );
      return share && share.percentage > 0;
    });
  }

  // Sort
  runs.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === 'dps' || sortBy === 'totalDamage') {
      valA = Number(valA);
      valB = Number(valB);
    }
    if (sortOrder === 'asc') return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const total = runs.length;
  const startIndex = (page - 1) * limit;
  const paginated = runs.slice(startIndex, startIndex + limit);

  return {
    data: paginated,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getRunById(id) {
  return inMemoryRuns.find((r) => r.id === id) || null;
}

export async function commitRun(telemetry, imageUrl, gameVersion = '7.0') {
  const audit = auditTelemetry(telemetry);
  const runId = crypto.randomUUID();
  const summary = telemetry.testSummary || telemetry;
  const meta = telemetry.meta || {};
  const targetMods = telemetry.targetModifiers || {};

  const newRun = {
    id: runId,
    stageGuid: meta.stageGuid || telemetry.stageGuid || null,
    uid: meta.uid || telemetry.uid || null,
    testPreset: summary.testPreset || 'Abyss 12',
    dps: Number(summary.dps) || 0,
    timeElapsedSeconds: Number(summary.timeElapsedSeconds) || 0,
    totalDamage: Number(summary.totalDamage) || 0,
    strongestHit: Number(summary.strongestHit) || 0,
    targetName: targetMods.targetName || telemetry.targetName || 'Mitachurl',
    targetLevel: targetMods.targetLevel || telemetry.targetLevel || 100,
    targetResistances: targetMods.resistances || telemetry.targetResistances || {
      pyro: 10, hydro: 10, electro: 10, cryo: 10, anemo: 10, geo: 10, dendro: 10, physical: 10
    },
    gameVersion,
    imageUrl: imageUrl || '/sample-runs/sample-dps-run.png',
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    characters: telemetry.characterContributions.map((c, idx) => ({
      id: Date.now() + idx,
      runId,
      slotOrder: idx + 1,
      name: c.name,
      level: c.level || 90,
      damageDealt: c.damageDealt,
      damagePercent: c.damagePercent,
      hp: c.stats.hp,
      baseAtk: c.stats.baseAtk,
      atk: c.stats.atk,
      baseDef: c.stats.baseDef,
      def: c.stats.def,
      critRate: c.stats.critRate,
      critDamage: c.stats.critDamage,
      energyRecharge: c.stats.energyRecharge,
      elementalMastery: c.stats.elementalMastery || 0,
      damageBonuses: c.stats.damageBonuses || {},
    })),
    rotations: telemetry.rotationResults.map((r, idx) => ({
      id: Date.now() + 100 + idx,
      runId,
      rotationNumber: r.rotationNumber,
      dps: r.dps,
      damageDealt: r.damageDealt,
      durationSeconds: r.durationSeconds,
    })),
    elementalBreakdowns: Object.entries(telemetry.elementalDistribution || {}).map(([element, percentage], idx) => ({
      id: Date.now() + 200 + idx,
      runId,
      element: element.charAt(0).toUpperCase() + element.slice(1),
      percentage: Number(percentage) || 0,
    })),
  };

  inMemoryRuns.unshift(newRun);
  return { run: newRun, audit };
}

export async function deleteRun(id) {
  const initialLength = inMemoryRuns.length;
  inMemoryRuns = inMemoryRuns.filter((r) => r.id !== id);
  return inMemoryRuns.length < initialLength;
}
