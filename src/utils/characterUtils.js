// Character element mapping helper
export const KNOWN_ELEMENTS = {
  mavuika: 'Pyro',
  chevreuse: 'Pyro',
  varesa: 'Electro',
  iansan: 'Electro',
  neuvillette: 'Hydro',
  furina: 'Hydro',
  kazuha: 'Anemo',
  baizhu: 'Dendro',
  zibai: 'Geo',
  columbina: 'Hydro',
  linnea: 'Geo',
  illuga: 'Geo',
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

export function formatDamage(val) {
  const num = Number(val);
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`;
  }
  return num.toLocaleString();
}

/**
 * Extracts clean constellation & refinement labels without brackets,
 * e.g., ['C3', 'R1'] or ['C2R1']
 */
export function getBuildLabels(char) {
  if (char?.buildLabel) {
    // Strip brackets eg: "[C3] [R1]" -> "C3 R1", "[C2R1]" -> "C2R1"
    const cleaned = char.buildLabel.replace(/[[\]]/g, '').trim();
    return cleaned.split(/\s+/).filter(Boolean);
  }
  const labels = [];
  if (char?.constellation !== undefined && char?.constellation !== null) {
    labels.push(`C${char.constellation}`);
  }
  if (char?.weaponRefinement !== undefined && char?.weaponRefinement !== null) {
    labels.push(`R${char.weaponRefinement}`);
  }
  return labels;
}
