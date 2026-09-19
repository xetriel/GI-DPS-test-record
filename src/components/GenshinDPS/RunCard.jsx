import React from 'react';
import TopContributorsBar from './TopContributorsBar';
import DualResistanceBadge from './DualResistanceBadge';
import ElementalMiniBar from './ElementalMiniBar';

function formatNumber(num) {
  return Number(num || 0).toLocaleString();
}

function formatDamageMillions(num) {
  const n = Number(num || 0);
  return `${(n / 1_000_000).toFixed(2)}M`;
}

export default function RunCard({ run, onSelect, onDelete }) {
  if (!run) return null;

  return (
    <div
      className="card combat-card mb-3 shadow-sm"
      onClick={() => onSelect && onSelect(run)}
    >
      <div className="card-body p-3 p-md-4">
        {/* Top Badges Header */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-warning text-dark fw-bold px-2 py-1 shadow-sm">
              👑 {run.testPreset || 'Abyss 12'}
            </span>
            <span className="badge bg-dark text-white px-2 py-1">
              v{run.gameVersion || '7.0'}
            </span>
            <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">
              Target: {run.targetName || 'Mitachurl'} Lv.{run.targetLevel || 100}
            </span>
            {run.verified && (
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                ✓ Verified
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            {run.uid && (
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                UID: {run.uid}
              </span>
            )}
            {onDelete && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger p-0 px-2"
                title="Delete run"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(run.id);
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Row 1: Hero Metric (DPS) + Summary stats */}
        <div className="row align-items-center mb-3">
          <div className="col-12 col-md-5 mb-2 mb-md-0">
            <div className="hero-dps-sub">Calculated DPS</div>
            <div className="hero-dps-badge text-primary">
              {formatNumber(run.dps)}
            </div>
          </div>

          <div className="col-12 col-md-7">
            <div className="row text-center text-md-start g-2">
              <div className="col-4">
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Total Damage
                </div>
                <div className="fw-bold text-body-emphasis fs-6">
                  {formatDamageMillions(run.totalDamage)}
                </div>
              </div>
              <div className="col-4">
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Duration
                </div>
                <div className="fw-bold text-body-emphasis fs-6">
                  {Number(run.timeElapsedSeconds).toFixed(2)}s
                </div>
              </div>
              <div className="col-4">
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Peak Hit
                </div>
                <div className="fw-bold text-danger fs-6">
                  {formatNumber(run.strongestHit)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Top-2 Contributors + Dual Element Target Resistance */}
        <div className="p-2 rounded mb-3" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div className="text-muted mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                Top Contributors
              </div>
              <TopContributorsBar characters={run.characters} />
            </div>

            <div>
              <div className="text-muted mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                Target Resistances
              </div>
              <DualResistanceBadge resistances={run.targetResistances} characters={run.characters} />
            </div>
          </div>
        </div>

        {/* Row 3: Elemental Damage Mini-Bar */}
        <div className="mb-2">
          <ElementalMiniBar breakdowns={run.elementalBreakdowns} />
        </div>

        {/* Bottom audit bar */}
        <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
          <span>Stage GUID: {run.stageGuid || '13031458938'}</span>
          <span className="text-primary fw-bold">Click to inspect rotations & builds →</span>
        </div>
      </div>
    </div>
  );
}
