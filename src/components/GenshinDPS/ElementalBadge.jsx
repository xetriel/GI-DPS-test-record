import React from 'react';

export const ELEMENT_CONFIG = {
  Pyro: { color: '#ff6036', icon: '🔥', label: 'Pyro', class: 'badge-pyro' },
  Hydro: { color: '#00b4d8', icon: '💧', label: 'Hydro', class: 'badge-hydro' },
  Electro: { color: '#b366ff', icon: '⚡', label: 'Electro', class: 'badge-electro' },
  Cryo: { color: '#72e4ff', icon: '❄️', label: 'Cryo', class: 'badge-cryo' },
  Anemo: { color: '#2dd4bf', icon: '💨', label: 'Anemo', class: 'badge-anemo' },
  Geo: { color: '#fbbf24', icon: '🪨', label: 'Geo', class: 'badge-geo' },
  Dendro: { color: '#4ade80', icon: '🌿', label: 'Dendro', class: 'badge-dendro' },
  Physical: { color: '#cbd5e1', icon: '⚔️', label: 'Physical', class: 'badge-physical' },
};

export default function ElementalBadge({ element, value, showIcon = true, className = '' }) {
  const norm = element ? element.charAt(0).toUpperCase() + element.slice(1).toLowerCase() : 'Physical';
  const cfg = ELEMENT_CONFIG[norm] || ELEMENT_CONFIG.Physical;

  return (
    <span
      className={`badge rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1 ${cfg.class} ${className}`}
      style={{ fontSize: '0.78rem', fontWeight: 600 }}
    >
      {showIcon && <span>{cfg.icon}</span>}
      <span>{cfg.label}</span>
      {value !== undefined && <span className="fw-bold opacity-90">{value}%</span>}
    </span>
  );
}
