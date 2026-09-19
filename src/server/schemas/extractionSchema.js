import { z } from 'zod';

export const ExtractionSchema = z.object({
  meta: z.object({
    stageGuid: z.string().nullable().describe('Alphanumeric string from the bottom right corner (Stage GUID)'),
    uid: z.string().nullable().describe('Player UID from the bottom right corner'),
  }),
  testSummary: z.object({
    testPreset: z.string().describe('Name of the test preset, e.g., Abyss 12'),
    dps: z.number().int().describe('Calculated DPS value (integer, spaces removed)'),
    timeElapsedSeconds: z.number().describe('Time elapsed formatted as floating point number in seconds'),
    totalDamage: z.number().int().describe('Sum of total party damage dealt'),
    strongestHit: z.number().int().describe('Peak damage hit across all characters'),
  }),
  targetModifiers: z.object({
    targetName: z.string().describe('Name of the target dummy, e.g., Mitachurl'),
    targetLevel: z.number().int().default(100).describe('Target level'),
    resistances: z.object({
      pyro: z.number().int(),
      hydro: z.number().int(),
      electro: z.number().int(),
      cryo: z.number().int(),
      anemo: z.number().int(),
      geo: z.number().int(),
      dendro: z.number().int(),
      physical: z.number().int(),
    }),
  }),
  elementalDistribution: z.object({
    pyro: z.number().int().default(0),
    hydro: z.number().int().default(0),
    electro: z.number().int().default(0),
    cryo: z.number().int().default(0),
    anemo: z.number().int().default(0),
    geo: z.number().int().default(0),
    dendro: z.number().int().default(0),
    physical: z.number().int().default(0),
  }),
  characterContributions: z.array(
    z.object({
      name: z.string(),
      level: z.number().int().default(90),
      damageDealt: z.number().int(),
      damagePercent: z.number().int(),
      stats: z.object({
        hp: z.number().int(),
        baseAtk: z.number().int(),
        atk: z.number().int(),
        baseDef: z.number().int(),
        def: z.number().int(),
        critRate: z.number().describe('Crit rate float, without the percent sign'),
        critDamage: z.number().describe('Crit damage float, without the percent sign'),
        energyRecharge: z.number().describe('Energy recharge float, without the percent sign'),
        elementalMastery: z.number().int().default(0),
        damageBonuses: z.record(z.string(), z.number()).default({}).describe('Key-value pair of bonus stats, e.g., {"electroDmg": 47.0}'),
      }),
    })
  ).length(4),
  rotationResults: z.array(
    z.object({
      rotationNumber: z.number().int(),
      dps: z.number().int().describe('Raw or scaled DPS in thousands/units'),
      damageDealt: z.number().int(),
      durationSeconds: z.number(),
    })
  ),
});

export default ExtractionSchema;
