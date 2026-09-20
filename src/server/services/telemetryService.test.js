import { describe, it, expect } from 'vitest';
import { ExtractionSchema } from '../schemas/extractionSchema.js';
import { auditTelemetry, commitRun, updateRun, getAllRuns } from './telemetryService.js';
import { REFERENCE_COMBAT_TELEMETRY } from './visionParser.js';
import { getBuildLabels } from '../../utils/characterUtils.js';

describe('GenshinDPS Telemetry & Extraction Suite', () => {
  it('validates the reference combat screenshot telemetry with strict Zod schema', () => {
    const validated = ExtractionSchema.parse(REFERENCE_COMBAT_TELEMETRY);
    expect(validated.testSummary.testPreset).toBe('Abyss 12');
    expect(validated.testSummary.dps).toBe(143554);
    expect(validated.characterContributions).toHaveLength(4);
    expect(validated.rotationResults).toHaveLength(5);
  });

  it('audits computed DPS against reported DPS and detects discrepancies > 50', () => {
    // Exact matching case
    const validAudit = auditTelemetry(REFERENCE_COMBAT_TELEMETRY);
    expect(validAudit.valid).toBe(true);
    expect(validAudit.dpsDiscrepancyWarning).toBe(false);

    // Discrepant case
    const modifiedTelemetry = {
      ...REFERENCE_COMBAT_TELEMETRY,
      testSummary: {
        ...REFERENCE_COMBAT_TELEMETRY.testSummary,
        dps: 120000, // Deliberate discrepancy from 143554
      },
    };
    const discrepantAudit = auditTelemetry(modifiedTelemetry);
    expect(discrepantAudit.dpsDiscrepancyWarning).toBe(true);
    expect(discrepantAudit.warnings.some((w) => w.includes('deviates from reported DPS'))).toBe(true);
  });

  it('validates character damage percentage sums (99% - 101%)', () => {
    const invalidCharPct = {
      ...REFERENCE_COMBAT_TELEMETRY,
      characterContributions: REFERENCE_COMBAT_TELEMETRY.characterContributions.map((c, idx) => ({
        ...c,
        damagePercent: idx === 0 ? 10 : c.damagePercent, // sum will be 64%
      })),
    };
    const audit = auditTelemetry(invalidCharPct);
    expect(audit.valid).toBe(false);
    expect(audit.issues.some((i) => i.includes('Character damage % sum is 64%'))).toBe(true);
  });

  it('correctly extracts and formats C and R labels without brackets', () => {
    // 1. Separate constellation and refinement
    const charZibai = { constellation: 3, weaponRefinement: 1, buildLabel: '[C3] [R1]' };
    expect(getBuildLabels(charZibai)).toEqual(['C3', 'R1']);

    // 2. Combined notation
    const charLinnea = { constellation: 2, weaponRefinement: 1, buildLabel: '[C2R1]' };
    expect(getBuildLabels(charLinnea)).toEqual(['C2R1']);

    // 3. Fallback when buildLabel is omitted
    const charDefault = { constellation: 6, weaponRefinement: 5 };
    expect(getBuildLabels(charDefault)).toEqual(['C6', 'R5']);

    // 4. Bracket stripping ensures no brackets leak into display
    const formatted = getBuildLabels(charZibai).join(' ');
    expect(formatted).not.toContain('[');
    expect(formatted).not.toContain(']');
    expect(formatted).toBe('C3 R1');
  });

  it('commits and updates weapon, artifacts, constellations, refinements, and notes across runs and rotations', async () => {
    const customPayload = {
      ...REFERENCE_COMBAT_TELEMETRY,
      notes: 'Test dummy trial with C3R1 Zibai hypercarry',
      characterContributions: REFERENCE_COMBAT_TELEMETRY.characterContributions.map((c, idx) => ({
        ...c,
        constellation: idx === 0 ? 3 : 0,
        weaponName: idx === 0 ? 'Peak Patrol Song' : 'Favonius Weapon',
        weaponRefinement: 1,
        artifacts: idx === 0 ? '4pc Obsidian Codex' : '4pc Noblesse Oblige',
        buildLabel: idx === 0 ? 'C3 R1' : 'C0 R1',
        notes: idx === 0 ? 'Main DPS setup' : 'Support',
      })),
      rotationResults: REFERENCE_COMBAT_TELEMETRY.rotationResults.map((r, idx) => ({
        ...r,
        notes: `Rotation ${idx + 1} burst combo execution`,
      })),
    };

    const validated = ExtractionSchema.parse(customPayload);
    const { run } = await commitRun(validated, '/sample-runs/sample-dps-run.png');

    expect(run.notes).toBe('Test dummy trial with C3R1 Zibai hypercarry');
    expect(run.characters[0].constellation).toBe(3);
    expect(run.characters[0].weaponName).toBe('Peak Patrol Song');
    expect(run.characters[0].weaponRefinement).toBe(1);
    expect(run.characters[0].artifacts).toBe('4pc Obsidian Codex');
    expect(run.rotations[0].notes).toBe('Rotation 1 burst combo execution');

    // Test updateRun
    const updated = await updateRun(run.id, {
      notes: 'Updated notes from inspection drawer',
      characters: [
        {
          id: run.characters[0].id,
          name: run.characters[0].name,
          constellation: 4,
          weaponRefinement: 2,
          weaponName: 'Peak Patrol Song Refined',
          artifacts: '4pc Obsidian Codex God-Roll',
        },
      ],
      rotations: [
        {
          rotationNumber: 1,
          notes: 'Updated opening sequence with fast cancel',
        },
      ],
    });

    expect(updated.notes).toBe('Updated notes from inspection drawer');
    expect(updated.characters[0].constellation).toBe(4);
    expect(updated.characters[0].weaponRefinement).toBe(2);
    expect(updated.characters[0].weaponName).toBe('Peak Patrol Song Refined');
    expect(updated.characters[0].artifacts).toBe('4pc Obsidian Codex God-Roll');
    expect(updated.rotations[0].notes).toBe('Updated opening sequence with fast cancel');
  });

  it('ensures SEED_RUNS contains the Stygian Dire Zibai showcase run with clean C/R labels and notes', async () => {
    const { data: runs } = await getAllRuns({ testPreset: 'Stygian Dire' });
    expect(runs.length).toBeGreaterThanOrEqual(1);

    const zibaiRun = runs.find((r) => r.characters.some((c) => c.name === 'Zibai'));
    expect(zibaiRun).toBeDefined();
    expect(zibaiRun.notes).toContain('Stygian Dire');

    const zibai = zibaiRun.characters.find((c) => c.name === 'Zibai');
    expect(zibai.constellation).toBe(3);
    expect(zibai.weaponRefinement).toBe(1);
    expect(getBuildLabels(zibai)).toEqual(['C3', 'R1']);

    const linnea = zibaiRun.characters.find((c) => c.name === 'Linnea');
    expect(linnea.constellation).toBe(2);
    expect(linnea.weaponRefinement).toBe(1);
    expect(getBuildLabels(linnea)).toEqual(['C2R1']);

    // Check rotations in rotation feature
    expect(zibaiRun.rotations.length).toBe(4);
    expect(zibaiRun.rotations[0].notes).toContain('Opening setup');
  });

  it('supports freeform manual team naming, duplicate coexistence, and timestamp tracking', async () => {
    // 1. Check seed runs have requested team names
    const { data: allSeedRuns } = await getAllRuns({});
    const zibaiSeed = allSeedRuns.find((r) => r.teamName === 'Zibai Premium');
    const neuvilletteSeed = allSeedRuns.find((r) => r.teamName === 'Neuvillette Hypercarry');
    const varesaSeed = allSeedRuns.find((r) => r.teamName === 'Varesa & Mavuika Overload');

    expect(zibaiSeed).toBeDefined();
    expect(neuvilletteSeed).toBeDefined();
    expect(varesaSeed).toBeDefined();
    expect(zibaiSeed.createdAt).toBeDefined();
    expect(zibaiSeed.updatedAt).toBeDefined();

    // 2. Commit a new team with manual name
    const payload1 = {
      ...REFERENCE_COMBAT_TELEMETRY,
      teamName: 'Zibai Premium', // Coexisting duplicate name!
      notes: 'Second Zibai Premium setup for comparison',
    };
    const validated1 = ExtractionSchema.parse(payload1);
    const { run: run1 } = await commitRun(validated1, '/sample-runs/sample-dps-run.png');

    expect(run1.teamName).toBe('Zibai Premium');
    expect(run1.createdAt).toBeDefined();
    expect(run1.updatedAt).toBeDefined();

    // Verify multiple runs with exact same team name coexist
    const { data: zibaiTeams } = await getAllRuns({ character: 'Zibai Premium' });
    const matchingNames = zibaiTeams.filter((r) => r.teamName === 'Zibai Premium');
    expect(matchingNames.length).toBeGreaterThanOrEqual(2);
    // They coexist with unique IDs and distinct timestamps
    expect(matchingNames[0].id).not.toBe(matchingNames[1].id);

    // 3. Edit team name and verify updatedAt changes while createdAt stays immutable
    const originalCreatedAt = run1.createdAt;
    const originalUpdatedAt = run1.updatedAt;

    // Small delay to ensure timestamp advancement
    await new Promise((resolve) => setTimeout(resolve, 10));

    const updatedRun = await updateRun(run1.id, {
      teamName: 'Zibai Hypercarry 2.0',
      notes: 'Renamed team setup after refinement',
    });

    expect(updatedRun.teamName).toBe('Zibai Hypercarry 2.0');
    expect(updatedRun.createdAt).toBe(originalCreatedAt);
    expect(new Date(updatedRun.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(originalUpdatedAt).getTime());

    // 4. Searching by new team name succeeds
    const { data: searchResults } = await getAllRuns({ character: 'Zibai Hypercarry 2.0' });
    expect(searchResults.some((r) => r.id === run1.id)).toBe(true);
  });
});

