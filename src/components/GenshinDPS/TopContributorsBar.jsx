import { formatDamage, getBuildLabels } from '../../utils/characterUtils';

export default function TopContributorsBar({ characters = [] }) {
  if (!characters || characters.length === 0) return null;

  // Sort characters by damagePercent descending
  const sorted = [...characters].sort((a, b) => b.damagePercent - a.damagePercent);
  const top2 = sorted.slice(0, 2);
  const remaining = sorted.slice(2);
  const supportNames = remaining
    .map((c) => {
      const labels = getBuildLabels(c).join('');
      const prefix = labels ? `${labels} ` : '';
      return `${prefix}${c.name} (${c.damagePercent}%)`;
    })
    .join(', ');

  return (
    <div className="d-flex align-items-center flex-wrap gap-2">
      {top2.map((char) => {
        const labels = getBuildLabels(char);
        const tooltip = [
          char.weaponName ? `Weapon: ${char.weaponName} (R${char.weaponRefinement || 1})` : null,
          char.artifacts ? `Artifacts: ${char.artifacts}` : null,
          char.constellation !== undefined ? `Constellation: C${char.constellation}` : null,
        ]
          .filter(Boolean)
          .join(' | ');

        return (
          <div
            key={char.name}
            className="d-flex align-items-center gap-1 px-2 py-1 rounded"
            title={tooltip || `${char.name} ${char.damagePercent}%`}
            style={{
              background: 'rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              fontSize: '0.82rem',
            }}
          >
            {/* Build Labels: Instantly display labels eg: C3, R1 without brackets */}
            {labels.map((lbl, idx) => (
              <span
                key={idx}
                className={`badge ${
                  lbl.includes('C') && lbl.includes('R')
                    ? 'bg-warning-subtle text-warning border border-warning-subtle'
                    : lbl.startsWith('C')
                    ? 'bg-warning text-dark'
                    : 'bg-info text-dark'
                } fw-bold`}
                style={{ fontSize: '0.7rem', padding: '0.2em 0.45em' }}
              >
                {lbl}
              </span>
            ))}
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
