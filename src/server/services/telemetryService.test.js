import { describe, it, expect } from 'vitest';
import { ExtractionSchema } from '../schemas/extractionSchema.js';
import { auditTelemetry } from './telemetryService.js';
import { REFERENCE_COMBAT_TELEMETRY } from './visionParser.js';

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
});
