import crypto from 'crypto';

// In-memory / fallback store seeded with the uploaded screenshot run and comparative runs
const SEED_RUNS = [
  {
    id: 'b82c5342-8cd4-4f39-953e-6507d40932c3',
    teamName: 'Zibai Premium',
    stageGuid: '13031459100',
    uid: '835033286',
    testPreset: 'Stygian Dire',
    dps: 584326,
    timeElapsedSeconds: 120.52,
    totalDamage: 70425281,
    strongestHit: 1523710,
    targetName: 'Target Dummy',
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
    notes: 'Stygian Dire Lv. 100 test dummy benchmark with C3R1 Zibai & C2R1 Linnea Geo hypercarry rotation. Verified 584K DPS.',
    createdAt: new Date('2026-09-20T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-20T10:00:00.000Z').toISOString(),
    characters: [
      {
        id: 101,
        runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3',
        slotOrder: 1,
        name: 'Zibai',
        level: 100,
        damageDealt: 39438157,
        damagePercent: 56,
        constellation: 3,
        weaponName: 'Peak Patrol Song',
        weaponRefinement: 1,
        buildLabel: 'C3 R1',
        artifacts: '4pc Obsidian Codex',
        notes: 'Primary Geo Hypercarry. DEF/Geo DMG/Crit DMG scaling.',
        hp: 21684,
        baseAtk: 817,
        atk: 1217,
        baseDef: 1025,
        def: 3151,
        critRate: 54.0,
        critDamage: 315.0,
        energyRecharge: 100.0,
        elementalMastery: 0,
        damageBonuses: { geoDmg: 85.0 },
      },
      {
        id: 102,
        runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3',
        slotOrder: 2,
        name: 'Linnea',
        level: 90,
        damageDealt: 16902067,
        damagePercent: 24,
        constellation: 2,
        weaponName: 'Silvershower Heartstrings',
        weaponRefinement: 1,
        buildLabel: 'C2R1',
        artifacts: '4pc Scroll of the Hero',
        notes: 'Sub-DPS & Nightsoul burst enabler.',
        hp: 15183,
        baseAtk: 685,
        atk: 1028,
        baseDef: 907,
        def: 2603,
        critRate: 92.0,
        critDamage: 227.0,
        energyRecharge: 100.0,
        elementalMastery: 0,
        damageBonuses: { geoDmg: 45.0 },
      },
      {
        id: 103,
        runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3',
        slotOrder: 3,
        name: 'Columbina',
        level: 90,
        damageDealt: 11268045,
        damagePercent: 16,
        constellation: 0,
        weaponName: 'A Thousand Floating Dreams',
        weaponRefinement: 1,
        buildLabel: 'C0 R1',
        artifacts: '4pc Archaic Petra',
        notes: 'Hydro off-field resonance support & crystallization trigger.',
        hp: 33372,
        baseAtk: 638,
        atk: 1015,
        baseDef: 515,
        def: 515,
        critRate: 78.0,
        critDamage: 228.0,
        energyRecharge: 184.0,
        elementalMastery: 120,
        damageBonuses: { hydroDmg: 46.6 },
      },
      {
        id: 104,
        runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3',
        slotOrder: 4,
        name: 'Illuga',
        level: 90,
        damageDealt: 2817011,
        damagePercent: 4,
        constellation: 6,
        weaponName: 'Favonius Lance',
        weaponRefinement: 5,
        buildLabel: 'C6 R5',
        artifacts: '4pc Noblesse Oblige',
        notes: 'Energy battery and teamwide ATK/DEF buffer.',
        hp: 18535,
        baseAtk: 646,
        atk: 995,
        baseDef: 814,
        def: 1327,
        critRate: 11.0,
        critDamage: 99.0,
        energyRecharge: 179.0,
        elementalMastery: 0,
        damageBonuses: {},
      },
    ],
    rotations: [
      {
        id: 101,
        runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3',
        rotationNumber: 1,
        dps: 606000,
        damageDealt: 24011732,
        durationSeconds: 39.60,
        notes: 'Opening setup: Illuga E -> Columbina Q -> Linnea E Q -> Zibai burst sequence',
      },
      {
        id: 102,
        runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3',
        rotationNumber: 2,
        dps: 588000,
        damageDealt: 11080394,
        durationSeconds: 18.84,
        notes: 'Re-apply Geo resonance & Linnea buffs -> Zibai plunge combo',
      },
      {
        id: 103,
        runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3',
        rotationNumber: 3,
        dps: 645000,
        damageDealt: 11773207,
        durationSeconds: 18.24,
        notes: 'Full burst uptime cycle -> Peak DPS hit 1.52M',
      },
      {
        id: 104,
        runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3',
        rotationNumber: 4,
        dps: 625000,
        damageDealt: 11966757,
        durationSeconds: 19.14,
        notes: 'Finishing rotation with optimal cooldown alignment',
      },
    ],
    elementalBreakdowns: [
      { id: 101, runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3', element: 'Geo', percentage: 99 },
      { id: 102, runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3', element: 'Hydro', percentage: 1 },
      { id: 103, runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3', element: 'Pyro', percentage: 0 },
      { id: 104, runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3', element: 'Electro', percentage: 0 },
      { id: 105, runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3', element: 'Cryo', percentage: 0 },
      { id: 106, runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3', element: 'Anemo', percentage: 0 },
      { id: 107, runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3', element: 'Dendro', percentage: 0 },
      { id: 108, runId: 'b82c5342-8cd4-4f39-953e-6507d40932c3', element: 'Physical', percentage: 0 },
    ],
  },
  {
    id: 'f87a1921-6dc3-4a18-971c-4395b28710a1',
    teamName: 'Varesa & Mavuika Overload',
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
    notes: 'Abyss 12 Chamber 1 Overload benchmark. Clean 5-cycle rotation with consistent DPS spikes.',
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
        constellation: 2,
        weaponName: 'A Thousand Floating Dreams',
        weaponRefinement: 1,
        buildLabel: 'C2 R1',
        artifacts: '4pc Thundering Fury',
        notes: 'Electro on-field driver with rapid skill resets.',
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
        constellation: 6,
        weaponName: 'Favonius Lance',
        weaponRefinement: 5,
        buildLabel: 'C6 R5',
        artifacts: '4pc Noblesse Oblige',
        notes: 'Electro particle generation & ATK buffing.',
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
        constellation: 6,
        weaponName: 'Rightful Reward',
        weaponRefinement: 5,
        buildLabel: 'C6 R5',
        artifacts: '4pc Song of Days Past',
        notes: '40% Pyro & Electro RES shred via Overload.',
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
        constellation: 0,
        weaponName: 'Verdict',
        weaponRefinement: 1,
        buildLabel: 'C0 R1',
        artifacts: '4pc Obsidian Codex',
        notes: 'Co-hypercarry Burst damage & Pyro aura provider.',
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
      { id: 1, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', rotationNumber: 1, dps: 161000, damageDealt: 3065636, durationSeconds: 19.05, notes: 'Rotation 1: Chevreuse hold E -> Iansan Q -> Mavuika Q -> Varesa drive' },
      { id: 2, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', rotationNumber: 2, dps: 137000, damageDealt: 2382932, durationSeconds: 17.37, notes: 'Rotation 2: Energy recovery phase with Favonius procs' },
      { id: 3, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', rotationNumber: 3, dps: 145000, damageDealt: 2915748, durationSeconds: 20.16, notes: 'Rotation 3: Second full burst window with Chevreuse C6 buff peak' },
      { id: 4, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', rotationNumber: 4, dps: 146000, damageDealt: 2706486, durationSeconds: 18.48, notes: 'Rotation 4: High uptime DPS cadence' },
      { id: 5, runId: 'f87a1921-6dc3-4a18-971c-4395b28710a1', rotationNumber: 5, dps: 151000, damageDealt: 2965757, durationSeconds: 19.62, notes: 'Rotation 5: Final burst burn-down cycle' },
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
    teamName: 'Neuvillette Hypercarry',
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
    notes: 'Hydro hypercarry single-target DPS test. Kazuha VV shred + Furina Fanfare ramp.',
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
        constellation: 1,
        weaponName: 'Tome of the Eternal Flow',
        weaponRefinement: 1,
        buildLabel: 'C1 R1',
        artifacts: '4pc Marechaussee Hunter',
        notes: 'Hydro carry charged attack beam cannon.',
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
        constellation: 2,
        weaponName: 'Splendor of Tranquil Waters',
        weaponRefinement: 1,
        buildLabel: 'C2 R1',
        artifacts: '4pc Golden Troupe',
        notes: 'Max Fanfare buff stacks and off-field salon members.',
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
        constellation: 2,
        weaponName: 'Freedom-Sworn',
        weaponRefinement: 1,
        buildLabel: 'C2 R1',
        artifacts: '4pc Viridescent Venerer',
        notes: 'Hydro swirl & 40% elemental damage bonus.',
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
        constellation: 0,
        weaponName: 'Prototype Amber',
        weaponRefinement: 5,
        buildLabel: 'C0 R5',
        artifacts: '4pc Ocean-Hued Clam',
        notes: 'Partywide team healing and bloom shield.',
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
      { id: 6, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', rotationNumber: 1, dps: 195000, damageDealt: 4680000, durationSeconds: 24.00, notes: 'Furina E Q -> Neuvillette E -> Kazuha hold E Q -> Baizhu E Q -> Neuv CA x2' },
      { id: 7, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', rotationNumber: 2, dps: 188000, damageDealt: 4512000, durationSeconds: 24.00, notes: 'Hydro swirl refresh with Kazuha tap E -> Neuvillette burst CA' },
      { id: 8, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', rotationNumber: 3, dps: 178000, damageDealt: 4450000, durationSeconds: 25.00, notes: 'Full Fanfare uptime wave clear' },
      { id: 9, runId: 'a91b4231-7bc2-4e29-842d-5496c39821b2', rotationNumber: 4, dps: 168000, damageDealt: 4276640, durationSeconds: 25.40, notes: 'Final charged attack sweep' },
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
      (r.teamName && r.teamName.toLowerCase().includes(character.toLowerCase())) ||
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
    teamName:
      telemetry.teamName ||
      summary.teamName ||
      (telemetry.characterContributions?.length
        ? `${telemetry.characterContributions[0].name} Team`
        : 'Custom Party'),
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
    notes: summary.notes || telemetry.notes || '',
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
      constellation: c.constellation !== undefined ? Number(c.constellation) : 0,
      weaponName: c.weaponName || '',
      weaponRefinement: c.weaponRefinement !== undefined ? Number(c.weaponRefinement) : 1,
      artifacts: c.artifacts || '',
      buildLabel: c.buildLabel || '',
      notes: c.notes || '',
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
      notes: r.notes || '',
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

export async function updateRun(id, updates = {}) {
  const index = inMemoryRuns.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new Error(`Run with id ${id} not found`);
  }

  const existing = inMemoryRuns[index];
  const updatedRun = {
    ...existing,
    teamName: updates.teamName !== undefined ? updates.teamName : existing.teamName,
    notes: updates.notes !== undefined ? updates.notes : existing.notes,
    testPreset: updates.testPreset !== undefined ? updates.testPreset : existing.testPreset,
    targetName: updates.targetName !== undefined ? updates.targetName : existing.targetName,
    targetLevel: updates.targetLevel !== undefined ? Number(updates.targetLevel) : existing.targetLevel,
    updatedAt: new Date().toISOString(),
  };

  if (Array.isArray(updates.characters)) {
    updatedRun.characters = existing.characters.map((char, idx) => {
      const patch = updates.characters[idx] || updates.characters.find((c) => c.name === char.name || c.id === char.id);
      if (!patch) return char;
      return {
        ...char,
        ...patch,
        constellation: patch.constellation !== undefined ? Number(patch.constellation) : char.constellation,
        weaponName: patch.weaponName !== undefined ? patch.weaponName : char.weaponName,
        weaponRefinement: patch.weaponRefinement !== undefined ? Number(patch.weaponRefinement) : char.weaponRefinement,
        artifacts: patch.artifacts !== undefined ? patch.artifacts : char.artifacts,
        buildLabel: patch.buildLabel !== undefined ? patch.buildLabel : char.buildLabel,
        notes: patch.notes !== undefined ? patch.notes : char.notes,
      };
    });
  }

  if (Array.isArray(updates.rotations)) {
    updatedRun.rotations = existing.rotations.map((rot, idx) => {
      const patch = updates.rotations[idx] || updates.rotations.find((r) => r.rotationNumber === rot.rotationNumber || r.id === rot.id);
      if (!patch) return rot;
      return {
        ...rot,
        ...patch,
        notes: patch.notes !== undefined ? patch.notes : rot.notes,
      };
    });
  }

  inMemoryRuns[index] = updatedRun;
  return updatedRun;
}

export async function deleteRun(id) {
  const initialLength = inMemoryRuns.length;
  inMemoryRuns = inMemoryRuns.filter((r) => r.id !== id);
  return inMemoryRuns.length < initialLength;
}
