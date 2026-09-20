import React from 'react';

// Character element mapping helper
const KNOWN_ELEMENTS = {
  mavuika: 'Pyro',
  chevreuse: 'Pyro',
  varesa: 'Electro',
  iansan: 'Electro',
  neuvillette: 'Hydro',
  furina: 'Hydro',
  kazuha: 'Anemo',
  baizhu: 'Dendro',
};

export function getCharacterElement(name, bonuses = {}) {
  const lower = (name || '').toLowerCase();
  if (KNOWN_ELEMENTS[lower]) return KNOWN_ELEMENTS[lower];
  if (bonuses) {
    for (const k of Object.keys(bonuses)) {
      if (k.toLowerCase().includes('pyro')) return 'Pyro';
      if (k.toLowerCase().includes('hydro')) return 'Hydro';
      if (k.toLowerCase().includes('electro')) return 'Electro';
      if (k.toLowerCase().includes('cryo')) return 'Cryo';
      if (k.toLowerCase().includes('anemo')) return 'Anemo';
      if (k.toLowerCase().includes('geo')) return 'Geo';
      if (k.toLowerCase().includes('dendro')) return 'Dendro';
    }
  }
  return 'Physical';
}

function formatDamage(val) {
  const num = Number(val);
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`;
  }
  return num.toLocaleString();
}

export default function TopContributorsBar({ characters = [] }) {
  if (!characters || characters.length === 0) return null;

  // Sort characters by damagePercent descending
  const sorted = [...characters].sort((a, b) => b.damagePercent - a.damagePercent);
  const top2 = sorted.slice(0, 2);
  const remaining = sorted.slice(2);
  const supportNames = remaining.map((c) => `${c.name} (${c.damagePercent}%)`).join(', ');

  return (
    <div className="d-flex align-items-center flex-wrap gap-2">
      {top2.map((char) => {
        const elem = getCharacterElement(char.name, char.damageBonuses);
        return (
          <div
            key={char.name}
            className="d-flex align-items-center gap-1 px-2 py-1 rounded"
            style={{
              background: 'rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              fontSize: '0.82rem',
            }}
          >
            <span className="fw-bold text-white">{char.name}</span>
            <span className="badge bg-primary text-white" style={{ fontSize: '0.72rem' }}>
              {char.damagePercent}%
            </span>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              ({formatDamage(char.damageDealt)})
            </span>
          </div>
        );
      })}

      {remaining.length > 0 && (
        <span
          className="badge bg-secondary-subtle text-secondary border px-2 py-1"
          style={{ fontSize: '0.75rem', cursor: 'help' }}
          title={supportNames}
        >
          +{remaining.length} Support
        </span>
      )}
    </div>
  );
}
