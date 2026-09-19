import React from 'react';
import { ELEMENT_CONFIG } from './ElementalBadge';

export default function ElementalMiniBar({ breakdowns = [] }) {
  // Normalize if breakdowns is an object or array
  let shares = [];
  if (Array.isArray(breakdowns)) {
    shares = breakdowns.filter((b) => b.percentage > 0);
  } else if (typeof breakdowns === 'object' && breakdowns !== null) {
    shares = Object.entries(breakdowns)
      .map(([element, percentage]) => ({
        element: element.charAt(0).toUpperCase() + element.slice(1).toLowerCase(),
        percentage: Number(percentage) || 0,
      }))
      .filter((b) => b.percentage > 0);
  }

  // Sort descending
  shares.sort((a, b) => b.percentage - a.percentage);

  if (shares.length === 0) {
    return (
      <div className="progress" style={{ height: '7px', borderRadius: '4px' }}>
        <div className="progress-bar bg-secondary" style={{ width: '100%' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1 text-muted" style={{ fontSize: '0.75rem' }}>
        <div className="d-flex gap-2">
          {shares.slice(0, 3).map((s) => {
            const cfg = ELEMENT_CONFIG[s.element] || ELEMENT_CONFIG.Physical;
            return (
              <span key={s.element} className="d-inline-flex align-items-center gap-1 fw-bold" style={{ color: cfg.color }}>
                <span>{cfg.icon}</span>
                <span>{s.element} {s.percentage}%</span>
              </span>
            );
          })}
        </div>
        <span className="text-secondary opacity-75">Element Share</span>
      </div>
      <div className="progress" style={{ height: '8px', borderRadius: '5px', overflow: 'hidden', background: 'rgba(0,0,0,0.08)' }}>
        {shares.map((s) => {
          const cfg = ELEMENT_CONFIG[s.element] || ELEMENT_CONFIG.Physical;
          return (
            <div
              key={s.element}
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${s.percentage}%`,
                backgroundColor: cfg.color,
              }}
              title={`${s.element}: ${s.percentage}%`}
            />
          );
        })}
      </div>
    </div>
  );
}
