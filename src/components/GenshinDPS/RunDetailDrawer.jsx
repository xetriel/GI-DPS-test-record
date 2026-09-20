import { useState } from 'react';
import Chart from 'react-apexcharts';
import ElementalBadge from './ElementalBadge';
import { getCharacterElement, getBuildLabels } from '../../utils/characterUtils';
import EditRunModal from './EditRunModal';

function formatNumber(num) {
  return Number(num || 0).toLocaleString();
}

function formatDamage(val) {
  const num = Number(val || 0);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toLocaleString();
}

function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return (
      d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) +
      ' ' +
      d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    );
  } catch {
    return String(dateStr);
  }
}

export default function RunDetailDrawer({ run, isOpen, onClose, onUpdateRun }) {
  const [activeTab, setActiveTab] = useState('builds'); // 'builds' | 'rotations' | 'proof'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !run) return null;

  const handleSaveEdit = async (formData) => {
    try {
      setIsSaving(true);
      if (onUpdateRun) {
        await onUpdateRun(run.id, formData);
      }
      setIsEditOpen(false);
    } catch (err) {
      alert('Failed to update run: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  // ApexCharts series & options for Rotation Cadence
  const rotations = [...(run.rotations || [])].sort((a, b) => a.rotationNumber - b.rotationNumber);
  const rotationCategories = rotations.map((r) => `Rot ${r.rotationNumber}`);
  const rotationDps = rotations.map((r) => r.dps);
  const rotationDurations = rotations.map((r) => Number(r.durationSeconds));

  const apexChartSeries = [
    {
      name: 'Rotation DPS',
      type: 'column',
      data: rotationDps,
    },
    {
      name: 'Cycle Duration (s)',
      type: 'line',
      data: rotationDurations,
    },
  ];

  const apexChartOptions = {
    chart: {
      height: 350,
      type: 'line',
      toolbar: { show: true },
      fontFamily: 'inherit',
    },
    theme: { mode: 'dark' },
    grid: { borderColor: 'rgba(255, 255, 255, 0.08)' },
    stroke: {
      width: [0, 3],
      curve: 'smooth',
    },
    title: {
      text: 'Rotation DPS Spikes & Cycle Durations',
      style: { fontSize: '14px', fontWeight: 600, color: '#f8fafc' },
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [0],
      formatter: (val) => `${(val / 1000).toFixed(0)}K`,
    },
    labels: rotationCategories,
    xaxis: {
      type: 'category',
    },
    yaxis: [
      {
        title: {
          text: 'DPS',
        },
        labels: {
          formatter: (val) => `${(val / 1000).toFixed(0)}K`,
        },
      },
      {
        opposite: true,
        title: {
          text: 'Duration (Seconds)',
        },
        labels: {
          formatter: (val) => `${val}s`,
        },
      },
    ],
    colors: ['#4f46e5', '#f59e0b'],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y, { seriesIndex }) => {
          if (seriesIndex === 0) return `${Number(y).toLocaleString()} DPS`;
          return `${y}s`;
        },
      },
    },
  };

  // Image pan & zoom handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoomLevel((prev) => Math.min(Math.max(0.6, prev + delta), 3.5));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <>
      <div className="slide-over-backdrop" onClick={onClose} />
      <div className="slide-over-panel shadow-2xl">
        {/* Drawer Header */}
        <div
          className="p-3 p-md-4 border-bottom d-flex justify-content-between align-items-center"
          style={{ background: '#0e1222', borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <span className="badge bg-warning text-dark fw-bold">
                {run.testPreset}
              </span>
              <span className="badge bg-dark text-white">
                v{run.gameVersion}
              </span>
              <h5 className="m-0 fw-bold text-white">
                {run.teamName || 'Combat Telemetry Deep-Dive'}
              </h5>
            </div>
            <div className="text-muted d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: '0.78rem' }}>
              <span>Run ID: <span className="font-monospace">{run.id}</span></span>
              <span>•</span>
              <span>Target: {run.targetName} Lv.{run.targetLevel}</span>
              <span>•</span>
              <span>📅 Added: <span className="font-monospace text-body-secondary">{formatDateTime(run.createdAt)}</span></span>
              <span>•</span>
              <span>✏️ Modified: <span className="font-monospace text-body-secondary">{formatDateTime(run.updatedAt || run.createdAt)}</span></span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 shadow-sm"
              onClick={() => setIsEditOpen(true)}
              title="Manually edit team name, weapons, artifacts, constellations, refinements, and notes"
            >
              <span>✏️</span>
              <span className="d-none d-sm-inline">Edit Team & Builds</span>
            </button>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pt-3 border-bottom" style={{ background: '#11162a', borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}>
          <ul className="nav nav-tabs border-0">
            <li className="nav-item">
              <button
                className={`nav-link fw-bold ${activeTab === 'builds' ? 'active' : ''}`}
                onClick={() => setActiveTab('builds')}
              >
                👥 Complete Party Builds
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold ${activeTab === 'rotations' ? 'active' : ''}`}
                onClick={() => setActiveTab('rotations')}
              >
                📈 Rotation Cadence
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold ${activeTab === 'proof' ? 'active' : ''}`}
                onClick={() => setActiveTab('proof')}
              >
                🔍 Verification Proof
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="p-3 p-md-4 flex-grow-1 overflow-auto">
          {/* Full Note Inspection Card */}
          {run.notes && (
            <div
              className="p-3 mb-4 rounded border shadow-sm"
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                borderColor: 'rgba(56, 189, 248, 0.25)',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-5">🔔</span>
                  <h6 className="fw-bold m-0 text-info">Combat Telemetry Notes & Observations</h6>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-info text-dark fw-bold">Full Note Inspection</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-info py-0 px-2"
                    style={{ fontSize: '0.72rem' }}
                    onClick={() => setIsEditOpen(true)}
                  >
                    Edit Note
                  </button>
                </div>
              </div>
              <p className="m-0 text-light" style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap', lineHeight: '1.55' }}>
                {run.notes}
              </p>
            </div>
          )}

          {/* TAB 1: Complete Party Builds */}
          {activeTab === 'builds' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold m-0 text-uppercase text-secondary" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                  4-Character Substat & Attribute Sheets
                </h6>
                <div className="badge bg-primary px-2 py-1">
                  Total Party Dmg: {formatDamage(run.totalDamage)}
                </div>
              </div>

              <div className="row g-3">
                {run.characters.map((char) => {
                  const elem = getCharacterElement(char.name, char.damageBonuses);
                  const labels = getBuildLabels(char);
                  return (
                    <div key={char.name} className="col-12 col-md-6 col-xl-3">
                      <div
                        className="card h-100 shadow-sm border"
                        style={{ borderRadius: '10px', overflow: 'hidden', background: '#151b32', borderColor: 'rgba(255, 255, 255, 0.08)' }}
                      >
                        <div
                          className="p-3 border-bottom d-flex justify-content-between align-items-center"
                          style={{ background: 'rgba(255,255,255,0.03)', borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}
                        >
                          <div>
                            <div className="d-flex align-items-center gap-1 mb-1">
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
                                  style={{ fontSize: '0.68rem', padding: '0.2em 0.4em' }}
                                >
                                  {lbl}
                                </span>
                              ))}
                              <span className="fw-bold fs-6 text-body-emphasis">{char.name}</span>
                            </div>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Lv. {char.level}</span>
                          </div>
                          <ElementalBadge element={elem} />
                        </div>

                        <div className="p-3">
                          {/* Weapons & Artifacts Sheet */}
                          <div
                            className="p-2 mb-3 rounded border"
                            style={{ background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.08)', fontSize: '0.78rem' }}
                          >
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <span className="text-muted fw-bold" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Equipped Weapon</span>
                              <span className="badge bg-dark text-info">
                                R{char.weaponRefinement || 1}
                              </span>
                            </div>
                            <div className="fw-bold text-light mb-1 text-truncate" title={char.weaponName || 'Unspecified'}>
                              ⚔️ {char.weaponName || 'Weapon Unspecified'}
                            </div>
                            <div className="text-muted fw-bold mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Artifacts</div>
                            <div className="text-secondary text-truncate" title={char.artifacts || 'Unspecified'}>
                              🛡️ {char.artifacts || 'Artifacts Unspecified'}
                            </div>
                            {char.notes && (
                              <div className="mt-1 pt-1 border-top border-secondary text-muted" style={{ fontSize: '0.72rem' }}>
                                📝 {char.notes}
                              </div>
                            )}
                          </div>
                          {/* Damage share */}
                          <div
                            className="p-2 mb-3 rounded border text-center"
                            style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
                          >
                            <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                              Damage Contribution
                            </div>
                            <div className="fw-bold text-primary fs-5">
                              {char.damagePercent}%
                            </div>
                            <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                              {formatDamage(char.damageDealt)}
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="d-flex flex-column gap-1" style={{ fontSize: '0.8rem' }}>
                            <div className="d-flex justify-content-between py-1 border-bottom">
                              <span className="text-muted">HP:</span>
                              <span className="fw-bold font-monospace">{formatNumber(char.hp)}</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 border-bottom">
                              <span className="text-muted">ATK:</span>
                              <span className="fw-bold font-monospace">
                                {formatNumber(char.atk)} <span className="text-muted" style={{ fontSize: '0.72rem' }}>({char.baseAtk})</span>
                              </span>
                            </div>
                            <div className="d-flex justify-content-between py-1 border-bottom">
                              <span className="text-muted">DEF:</span>
                              <span className="fw-bold font-monospace">
                                {formatNumber(char.def)} <span className="text-muted" style={{ fontSize: '0.72rem' }}>({char.baseDef})</span>
                              </span>
                            </div>
                            <div className="d-flex justify-content-between py-1 border-bottom">
                              <span className="text-muted">Crit Rate:</span>
                              <span className="fw-bold text-danger font-monospace">{Number(char.critRate).toFixed(1)}%</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 border-bottom">
                              <span className="text-muted">Crit DMG:</span>
                              <span className="fw-bold text-danger font-monospace">{Number(char.critDamage).toFixed(1)}%</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 border-bottom">
                              <span className="text-muted">Energy Recharge:</span>
                              <span className="fw-bold text-info font-monospace">{Number(char.energyRecharge).toFixed(1)}%</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 border-bottom">
                              <span className="text-muted">Elemental Mastery:</span>
                              <span className="fw-bold text-success font-monospace">{char.elementalMastery || 0}</span>
                            </div>

                            {/* Damage Bonuses */}
                            {char.damageBonuses && Object.keys(char.damageBonuses).length > 0 && (
                              <div className="pt-2">
                                <div className="text-muted mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                                  Damage Bonuses
                                </div>
                                {Object.entries(char.damageBonuses).map(([k, v]) => (
                                  <div key={k} className="badge bg-secondary-subtle text-secondary me-1 mb-1">
                                    {k}: {v}%
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Rotation Cadence */}
          {activeTab === 'rotations' && (
            <div>
              {/* Party Equipment Overview in Rotation Feature */}
              <div
                className="p-3 mb-4 rounded border shadow-sm"
                style={{ background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold m-0 text-secondary text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                    ⚔️ Party Equipment & Artifact Configurations in Rotation
                  </h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary py-0 px-2"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setIsEditOpen(true)}
                  >
                    Edit Builds
                  </button>
                </div>
                <div className="row g-2">
                  {run.characters.map((c) => {
                    const labels = getBuildLabels(c);
                    return (
                      <div key={c.name} className="col-12 col-md-6 col-xl-3">
                        <div className="p-2 rounded bg-dark border border-secondary d-flex flex-column gap-1" style={{ fontSize: '0.78rem' }}>
                          <div className="d-flex align-items-center gap-1">
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
                                style={{ fontSize: '0.66rem' }}
                              >
                                {lbl}
                              </span>
                            ))}
                            <strong className="text-white">{c.name}</strong>
                          </div>
                          <div className="text-secondary text-truncate" title={c.weaponName || 'Weapon Unset'}>
                            ⚔️ {c.weaponName || 'Weapon Unset'} (R{c.weaponRefinement || 1})
                          </div>
                          <div className="text-muted text-truncate" title={c.artifacts || 'Artifacts Unset'}>
                            🛡️ {c.artifacts || 'Artifacts Unset'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card shadow-sm p-3 mb-4">
                <Chart
                  options={apexChartOptions}
                  series={apexChartSeries}
                  type="line"
                  height={320}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold m-0 text-secondary text-uppercase" style={{ fontSize: '0.85rem' }}>
                  Cycle Breakdowns & Execution Notes
                </h6>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info py-0 px-2"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setIsEditOpen(true)}
                >
                  Edit Rotation Notes
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: '100px' }}>Rotation #</th>
                      <th style={{ width: '110px' }}>DPS</th>
                      <th style={{ width: '120px' }}>Damage Dealt</th>
                      <th style={{ width: '100px' }}>Cycle Duration</th>
                      <th>Rotation Execution Notes / Combo</th>
                      <th style={{ width: '130px' }}>Cycle DPS Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rotations.map((r) => (
                      <tr key={r.rotationNumber}>
                        <td>
                          <span className="badge bg-primary px-2 py-1">
                            Cycle {r.rotationNumber}
                          </span>
                        </td>
                        <td className="fw-bold font-monospace text-primary">
                          {formatNumber(r.dps)}
                        </td>
                        <td className="font-monospace">
                          {formatNumber(r.damageDealt)}
                        </td>
                        <td className="font-monospace">
                          {Number(r.durationSeconds).toFixed(2)}s
                        </td>
                        <td>
                          {r.notes ? (
                            <div className="d-flex align-items-center gap-1.5 text-light" style={{ fontSize: '0.82rem' }}>
                              <span>⚡</span>
                              <span>{r.notes}</span>
                            </div>
                          ) : (
                            <span className="text-muted small fst-italic">No rotation notes set</span>
                          )}
                        </td>
                        <td>
                          <div className="progress" style={{ height: '6px', width: '110px' }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${Math.min(100, (r.dps / (run.dps * 1.3)) * 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Verification Proof Canvas */}
          {activeTab === 'proof' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Scroll mouse wheel or use buttons to zoom. Click and drag to pan around high-density test results.
                </span>
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-secondary" onClick={() => setZoomLevel((z) => Math.min(3.5, z + 0.2))}>
                    Zoom In (+)
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}>
                    Zoom Out (-)
                  </button>
                  <button className="btn btn-outline-primary" onClick={resetZoom}>
                    Reset View
                  </button>
                </div>
              </div>

              <div
                className="image-zoom-canvas border shadow-inner"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={run.imageUrl || '/sample-runs/sample-dps-run.png'}
                  alt="Original Screenshot Verification Proof"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
                  }}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mt-2 text-muted" style={{ fontSize: '0.78rem' }}>
                <span>Image Asset: <span className="font-monospace">{run.imageUrl}</span></span>
                <span>Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div
          className="p-3 border-top d-flex justify-content-between align-items-center"
          style={{ background: '#0e1222', borderTopColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              Stage GUID: <strong className="font-monospace text-light">{run.stageGuid}</strong> | UID: <strong className="font-monospace text-light">{run.uid}</strong>
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-info"
              onClick={() => setIsEditOpen(true)}
            >
              ✏️ Edit Builds & Notes
            </button>
          </div>
          <button className="btn btn-secondary px-4" onClick={onClose}>
            Close Inspection
          </button>
        </div>
      </div>

      {/* Manual Input / Edit Modal */}
      <EditRunModal
        isOpen={isEditOpen}
        toggle={() => setIsEditOpen(false)}
        run={run}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />
    </>
  );
}
