import React, { useState } from 'react';
import { getCharacterElement } from './TopContributorsBar';
import { ELEMENT_CONFIG } from './ElementalBadge';

export default function DualResistanceBadge({ resistances = {}, characters = [] }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine elements from top 2 characters
  const sortedChars = [...characters].sort((a, b) => b.damagePercent - a.damagePercent);
  const top2Elements = sortedChars.slice(0, 2).map((c) => getCharacterElement(c.name, c.damageBonuses));

  // Ensure unique elements; if less than 2, pick popular combat elements
  const activeElements = Array.from(new Set(top2Elements));
  if (activeElements.length < 2) {
    if (!activeElements.includes('Pyro')) activeElements.push('Pyro');
    else if (!activeElements.includes('Electro')) activeElements.push('Electro');
  }

  // All 8 resistances for tooltip
  const allRes = [
    { name: 'Pyro', val: resistances?.pyro ?? 10 },
    { name: 'Hydro', val: resistances?.hydro ?? 10 },
    { name: 'Electro', val: resistances?.electro ?? 10 },
    { name: 'Cryo', val: resistances?.cryo ?? 10 },
    { name: 'Anemo', val: resistances?.anemo ?? 10 },
    { name: 'Geo', val: resistances?.geo ?? 10 },
    { name: 'Dendro', val: resistances?.dendro ?? 10 },
    { name: 'Physical', val: resistances?.physical ?? 10 },
  ];

  return (
    <div className="position-relative d-inline-block">
      <div
        className="d-flex align-items-center gap-1 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ cursor: 'pointer' }}
      >
        <span className="text-muted fw-bold me-1" style={{ fontSize: '0.75rem' }}>
          Res:
        </span>
        {activeElements.slice(0, 2).map((elem) => {
          const cfg = ELEMENT_CONFIG[elem] || ELEMENT_CONFIG.Physical;
          const key = elem.toLowerCase();
          const val = resistances ? resistances[key] ?? 10 : 10;
          return (
            <span
              key={elem}
              className="badge px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1"
              style={{
                backgroundColor: `${cfg.color}18`,
                color: cfg.color,
                border: `1px solid ${cfg.color}50`,
                fontSize: '0.75rem',
              }}
            >
              <span>{cfg.icon}</span>
              <span>{elem}</span>
              <span className="fw-bold">{val}%</span>
            </span>
          );
        })}
        <span className="badge bg-secondary-subtle text-muted border" style={{ fontSize: '0.72rem' }}>
          +6 Res
        </span>
      </div>

      {showTooltip && (
        <div
          className="position-absolute shadow-lg rounded p-2 bg-dark text-white"
          style={{
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            zIndex: 999,
            minWidth: '220px',
          }}
        >
          <div className="fw-bold mb-1 pb-1 border-bottom border-secondary text-warning" style={{ fontSize: '0.78rem' }}>
            Target Dummy Resistances
          </div>
          <div className="d-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.74rem' }}>
            {allRes.map((r) => {
              const cfg = ELEMENT_CONFIG[r.name];
              return (
                <div key={r.name} className="d-flex justify-content-between align-items-center px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <span>{cfg.icon} {r.name}:</span>
                  <span className="fw-bold text-info">{r.val}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
