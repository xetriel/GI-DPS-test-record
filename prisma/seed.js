import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GenshinDPS database with reference Abyss 12 telemetry...');

  const run = await prisma.dpsRun.create({
    data: {
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
      characters: {
        create: [
          {
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
      },
      rotations: {
        create: [
          { rotationNumber: 1, dps: 161000, damageDealt: 3065636, durationSeconds: 19.05 },
          { rotationNumber: 2, dps: 137000, damageDealt: 2382932, durationSeconds: 17.37 },
          { rotationNumber: 3, dps: 145000, damageDealt: 2915748, durationSeconds: 20.16 },
          { rotationNumber: 4, dps: 146000, damageDealt: 2706486, durationSeconds: 18.48 },
          { rotationNumber: 5, dps: 151000, damageDealt: 2965757, durationSeconds: 19.62 },
        ],
      },
      elementalBreakdowns: {
        create: [
          { element: 'Pyro', percentage: 52 },
          { element: 'Electro', percentage: 48 },
          { element: 'Hydro', percentage: 0 },
          { element: 'Cryo', percentage: 0 },
          { element: 'Anemo', percentage: 0 },
          { element: 'Geo', percentage: 0 },
          { element: 'Dendro', percentage: 0 },
          { element: 'Physical', percentage: 0 },
        ],
      },
    },
  });

  console.log(`Successfully seeded run: ${run.id} (${run.dps.toLocaleString()} DPS)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
