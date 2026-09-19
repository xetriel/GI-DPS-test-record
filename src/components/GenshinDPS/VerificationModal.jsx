import { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Alert,
} from 'reactstrap';

export default function VerificationModal({
  isOpen,
  toggle,
  initialData,
  imageUrl,
  onCommit,
  isSubmitting = false,
  engine = 'tesseract-ocr',
  rawTextSnippet = '',
}) {
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [formData, setFormData] = useState(() => (initialData ? JSON.parse(JSON.stringify(initialData)) : null));
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setFormData(initialData ? JSON.parse(JSON.stringify(initialData)) : null);
  }
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'characters' | 'rotations' | 'resistances' | 'sql'
  const [copiedSql, setCopiedSql] = useState(false);

  const generateSqlScript = () => {
    if (!formData) return '';
    const meta = formData.meta || {};
    const sum = formData.testSummary || {};
    const tgt = formData.targetModifiers || {};
    const resMap = tgt.resistances || {};
    const chars = formData.characterContributions || [];
    const rots = formData.rotationResults || [];
    const elem = formData.elementalDistribution || {};

    let sql = `-- =====================================================================\n`;
    sql += `-- GenshinDPS Ingestion Script (Generated from Verification Modal)\n`;
    sql += `-- Target: MySQL 8.0+ / MariaDB | Database: genshindps\n`;
    sql += `-- =====================================================================\n\n`;
    sql += `START TRANSACTION;\n\n`;
    sql += `SET @RUN_ID = UUID();\n\n`;

    // 1. dps_runs
    sql += `-- 1. Core Run Summary\n`;
    sql += `INSERT INTO \`dps_runs\` (\n`;
    sql += `  \`id\`, \`stage_guid\`, \`uid\`, \`test_preset\`, \`dps\`,\n`;
    sql += `  \`time_elapsed_seconds\`, \`total_damage\`, \`strongest_hit\`,\n`;
    sql += `  \`target_name\`, \`target_level\`, \`target_resistances\`,\n`;
    sql += `  \`gameVersion\`, \`image_url\`, \`verified\`, \`created_at\`, \`updated_at\`\n`;
    sql += `) VALUES (\n`;
    sql += `  @RUN_ID,\n`;
    sql += `  ${meta.stageGuid ? `'${meta.stageGuid}'` : 'NULL'},\n`;
    sql += `  ${meta.uid ? `'${meta.uid}'` : 'NULL'},\n`;
    sql += `  '${(sum.testPreset || 'Abyss 12').replace(/'/g, "''")}',\n`;
    sql += `  ${Number(sum.dps) || 0},\n`;
    sql += `  ${Number(sum.timeElapsedSeconds) || 0},\n`;
    sql += `  ${Number(sum.totalDamage) || 0},\n`;
    sql += `  ${Number(sum.strongestHit) || 0},\n`;
    sql += `  '${(tgt.targetName || 'Target Dummy').replace(/'/g, "''")}',\n`;
    sql += `  ${Number(tgt.targetLevel) || 100},\n`;
    sql += `  '${JSON.stringify(resMap)}',\n`;
    sql += `  '7.0',\n`;
    sql += `  '${(imageUrl || '/uploads/combat-run.png').replace(/'/g, "''")}',\n`;
    sql += `  1,\n`;
    sql += `  NOW(3),\n`;
    sql += `  NOW(3)\n`;
    sql += `);\n\n`;

    // 2. run_characters
    if (chars.length > 0) {
      sql += `-- 2. Party Members\n`;
      sql += `INSERT INTO \`run_characters\` (\n`;
      sql += `  \`run_id\`, \`slot_order\`, \`name\`, \`level\`, \`damage_dealt\`, \`damage_percent\`,\n`;
      sql += `  \`hp\`, \`base_atk\`, \`atk\`, \`base_def\`, \`def\`, \`crit_rate\`, \`crit_damage\`,\n`;
      sql += `  \`energy_recharge\`, \`elemental_mastery\`, \`damage_bonuses\`\n`;
      sql += `) VALUES\n`;
      const charValues = chars.map((c, idx) => {
        const stats = c.stats || {};
        const bonuses = JSON.stringify(stats.damageBonuses || {});
        return `(\n  @RUN_ID, ${idx + 1}, '${(c.name || 'Character').replace(/'/g, "''")}', ${Number(c.level) || 90}, ${Number(c.damageDealt) || 0}, ${Number(c.damagePercent) || 0},\n  ${Number(stats.hp) || 0}, ${Number(stats.baseAtk) || 0}, ${Number(stats.atk) || 0}, ${Number(stats.baseDef) || 0}, ${Number(stats.def) || 0},\n  ${Number(stats.critRate) || 0}, ${Number(stats.critDamage) || 0}, ${Number(stats.energyRecharge) || 0}, ${Number(stats.elementalMastery) || 0},\n  '${bonuses.replace(/'/g, "''")}'\n)`;
      });
      sql += charValues.join(',\n') + ';\n\n';
    }

    // 3. run_rotations
    if (rots.length > 0) {
      sql += `-- 3. Rotations\n`;
      sql += `INSERT INTO \`run_rotations\` (\`run_id\`, \`rotation_number\`, \`dps\`, \`damage_dealt\`, \`duration_seconds\`) VALUES\n`;
      const rotValues = rots.map((r, idx) => {
        return `(@RUN_ID, ${r.rotationNumber || idx + 1}, ${Number(r.dps) || 0}, ${Number(r.damageDealt) || 0}, ${Number(r.durationSeconds) || 0})`;
      });
      sql += rotValues.join(',\n') + ';\n\n';
    }

    // 4. run_elemental_shares
    const elements = ['Pyro', 'Hydro', 'Electro', 'Cryo', 'Anemo', 'Geo', 'Dendro', 'Physical'];
    sql += `-- 4. Elemental Distribution\n`;
    sql += `INSERT INTO \`run_elemental_shares\` (\`run_id\`, \`element\`, \`percentage\`) VALUES\n`;
    const elemValues = elements.map((el) => {
      const key = el.toLowerCase();
      const val = Number(elem[key]) || 0;
      return `(@RUN_ID, '${el}', ${val})`;
    });
    sql += elemValues.join(',\n') + ';\n\n';

    sql += `COMMIT;\n`;
    return sql;
  };

  const handleCopySql = () => {
    const script = generateSqlScript();
    navigator.clipboard.writeText(script);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (!formData) return null;

  // Real-time mathematical audits
  const totalDmg = Number(formData.testSummary?.totalDamage) || 0;
  const timeElapsed = Number(formData.testSummary?.timeElapsedSeconds) || 0;
  const reportedDps = Number(formData.testSummary?.dps) || 0;
  const computedDps = timeElapsed > 0 ? Math.round(totalDmg / timeElapsed) : 0;
  const dpsDiff = Math.abs(computedDps - reportedDps);
  const dpsDiscrepancy = dpsDiff > 50;

  // Character damage % sum check
  const charPctSum = (formData.characterContributions || []).reduce(
    (acc, c) => acc + (Number(c.damagePercent) || 0),
    0
  );
  const charPctValid = charPctSum >= 99 && charPctSum <= 101;

  // Elemental sum check
  const elemDist = formData.elementalDistribution || {};
  const elemPctSum = Object.values(elemDist).reduce(
    (acc, v) => acc + (Number(v) || 0),
    0
  );
  const elemPctValid = elemPctSum === 100;

  // Form field updaters
  const updateSummary = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      testSummary: {
        ...prev.testSummary,
        [field]: val,
      },
    }));
  };

  const updateMeta = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        [field]: val,
      },
    }));
  };

  const updateCharacter = (index, field, val) => {
    setFormData((prev) => {
      const copy = [...prev.characterContributions];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, characterContributions: copy };
    });
  };

  const updateCharacterStat = (index, statField, val) => {
    setFormData((prev) => {
      const copy = [...prev.characterContributions];
      copy[index] = {
        ...copy[index],
        stats: {
          ...copy[index].stats,
          [statField]: val,
        },
      };
      return { ...prev, characterContributions: copy };
    });
  };

  const updateResistance = (elem, val) => {
    setFormData((prev) => ({
      ...prev,
      targetModifiers: {
        ...prev.targetModifiers,
        resistances: {
          ...prev.targetModifiers.resistances,
          [elem]: Number(val),
        },
      },
    }));
  };

  const updateElementDist = (elem, val) => {
    setFormData((prev) => ({
      ...prev,
      elementalDistribution: {
        ...prev.elementalDistribution,
        [elem]: Number(val),
      },
    }));
  };

  const updateRotation = (index, field, val) => {
    setFormData((prev) => {
      const copy = [...prev.rotationResults];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, rotationResults: copy };
    });
  };

  const handleCommit = () => {
    if (onCommit) {
      onCommit(formData, imageUrl);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="verification-modal-dialog" size="xl" backdrop="static">
      <ModalHeader
        toggle={toggle}
        className="border-bottom"
        style={{ background: '#11162a', color: '#f8fafc', borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="fs-5 fw-bold text-white">Human Verification &amp; Correction Review</span>
          {engine === 'gemini-2.5-flash' && <span className="badge bg-warning text-dark fw-bold">✨ Gemini 2.5 Flash Vision</span>}
          {engine === 'gpt-4o-mini' && <span className="badge bg-success text-white fw-bold">✨ GPT-4o-mini Vision</span>}
          {engine === 'tesseract-ocr' && <span className="badge bg-info text-dark fw-bold">🔍 Tesseract OCR Engine (Local)</span>}
          {engine === 'reference-sample' && <span className="badge bg-secondary text-white fw-bold">📄 Reference Sample Benchmark</span>}
        </div>
      </ModalHeader>

      <ModalBody className="p-0">
        <div className="row g-0">
          {/* LEFT PANE: Sticky zoomable screenshot viewport */}
          <div className="col-12 col-lg-5 p-3 bg-dark text-white border-end d-flex flex-column" style={{ minHeight: '600px', maxHeight: '75vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold" style={{ fontSize: '0.85rem' }}>Original Test Screenshot</span>
              <div className="btn-group btn-group-sm">
                <Button color="secondary" outline size="sm" onClick={() => setZoom((z) => Math.min(3, z + 0.2))}>+</Button>
                <Button color="secondary" outline size="sm" onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}>-</Button>
                <Button color="secondary" outline size="sm" onClick={() => setZoom(1)}>Reset</Button>
              </div>
            </div>

            <div className="flex-grow-1 overflow-auto rounded position-relative d-flex align-items-center justify-content-center border border-secondary" style={{ background: '#0a0d18' }}>
              <img
                src={imageUrl || '/sample-runs/sample-dps-run.png'}
                alt="Source Screenshot"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  maxWidth: '100%',
                  transition: 'transform 0.1s ease',
                }}
              />
            </div>

            {/* Audit Warnings on Left */}
            <div className="mt-3">
              {dpsDiscrepancy ? (
                <div className="warning-callout-amber mb-2">
                  <div className="fw-bold d-flex align-items-center gap-1">
                    ⚠️ Computed vs Reported DPS Discrepancy ({dpsDiff} DPS)
                  </div>
                  <div style={{ fontSize: '0.78rem' }}>
                    Reported: <strong>{reportedDps.toLocaleString()}</strong> | Calculated (Total Dmg / Time): <strong>{computedDps.toLocaleString()}</strong>. Likely due to rotation dead-time or rounding.
                  </div>
                </div>
              ) : (
                <div className="success-callout-green mb-2">
                  ✓ Reported DPS ({reportedDps.toLocaleString()}) matches computed rate ({computedDps.toLocaleString()}).
                </div>
              )}

              {!charPctValid && (
                <Alert color="danger" className="py-2 px-3 mb-2" style={{ fontSize: '0.78rem' }}>
                  Character damage sum is <strong>{charPctSum}%</strong> (Expected 99% - 101%).
                </Alert>
              )}

              {!elemPctValid && (
                <Alert color="warning" className="py-2 px-3 mb-2" style={{ fontSize: '0.78rem' }}>
                  Elemental share sum is <strong>{elemPctSum}%</strong> (Expected 100%).
                </Alert>
              )}
              {engine === 'tesseract-ocr' && (
                <div className="p-2 rounded bg-dark border border-info mb-2" style={{ fontSize: '0.74rem' }}>
                  <div className="fw-bold text-info mb-1">🔍 Local Tesseract OCR Recognition</div>
                  <div className="text-light opacity-75">
                    Scanned text directly from uploaded screenshot pixels. Review detected values and adjust any gaming font discrepancies in the form.
                  </div>
                  {rawTextSnippet && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-warning" style={{ cursor: 'pointer' }}>View Raw OCR Dump</summary>
                      <pre className="p-1 rounded bg-black text-light font-monospace mt-1 mb-0" style={{ fontSize: '0.68rem', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto' }}>
                        {rawTextSnippet}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: Verification Form Controls */}
          <div className="col-12 col-lg-7 p-3 p-md-4 overflow-auto" style={{ maxHeight: '75vh' }}>
            {/* Sub-nav */}
            <ul className="nav nav-pills mb-3 border-bottom pb-2">
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('summary')}
                >
                  Summary & Target
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 ${activeTab === 'characters' ? 'active' : ''}`}
                  onClick={() => setActiveTab('characters')}
                >
                  Party Stats ({charPctSum}%)
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 ${activeTab === 'rotations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rotations')}
                >
                  Rotations ({formData.rotationResults?.length || 0})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 ${activeTab === 'resistances' ? 'active' : ''}`}
                  onClick={() => setActiveTab('resistances')}
                >
                  Elements & Resistances
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 ${activeTab === 'sql' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sql')}
                >
                  ⚡ Export SQL Script
                </button>
              </li>
            </ul>

            {/* TAB: SUMMARY */}
            {activeTab === 'summary' && (
              <div>
                <h6 className="fw-bold border-bottom pb-1 text-primary">Combat Summary Metrics</h6>
                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <FormGroup>
                      <Label className="small text-muted fw-bold">Test Preset</Label>
                      <Input
                        type="text"
                        value={formData.testSummary?.testPreset || ''}
                        onChange={(e) => updateSummary('testPreset', e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label className="small text-muted fw-bold">Reported DPS</Label>
                      <Input
                        type="number"
                        value={formData.testSummary?.dps || 0}
                        onChange={(e) => updateSummary('dps', Number(e.target.value))}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label className="small text-muted fw-bold">Total Damage</Label>
                      <Input
                        type="number"
                        value={formData.testSummary?.totalDamage || 0}
                        onChange={(e) => updateSummary('totalDamage', Number(e.target.value))}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label className="small text-muted fw-bold">Time Elapsed (s)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.testSummary?.timeElapsedSeconds || 0}
                        onChange={(e) => updateSummary('timeElapsedSeconds', Number(e.target.value))}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label className="small text-muted fw-bold">Strongest Hit</Label>
                      <Input
                        type="number"
                        value={formData.testSummary?.strongestHit || 0}
                        onChange={(e) => updateSummary('strongestHit', Number(e.target.value))}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <h6 className="fw-bold border-bottom pb-1 text-primary mt-3">Target Dummy Modifiers</h6>
                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <FormGroup>
                      <Label className="small text-muted fw-bold">Target Name</Label>
                      <Input
                        type="text"
                        value={formData.targetModifiers?.targetName || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            targetModifiers: { ...prev.targetModifiers, targetName: e.target.value },
                          }))
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label className="small text-muted fw-bold">Target Level</Label>
                      <Input
                        type="number"
                        value={formData.targetModifiers?.targetLevel || 100}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            targetModifiers: { ...prev.targetModifiers, targetLevel: Number(e.target.value) },
                          }))
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <h6 className="fw-bold border-bottom pb-1 text-primary mt-3">Watermark Identification</h6>
                <Row className="g-2">
                  <Col md={6}>
                    <FormGroup>
                      <Label className="small text-muted fw-bold">Stage GUID</Label>
                      <Input
                        type="text"
                        value={formData.meta?.stageGuid || ''}
                        onChange={(e) => updateMeta('stageGuid', e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label className="small text-muted fw-bold">Player UID</Label>
                      <Input
                        type="text"
                        value={formData.meta?.uid || ''}
                        onChange={(e) => updateMeta('uid', e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </div>
            )}

            {/* TAB: CHARACTERS */}
            {activeTab === 'characters' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold text-primary m-0">4 Participating Characters</h6>
                  <span className={`badge ${charPctValid ? 'bg-success' : 'bg-danger'}`}>
                    Sum: {charPctSum}%
                  </span>
                </div>

                {formData.characterContributions?.map((c, idx) => (
                  <div
                    key={idx}
                    className="card mb-3 p-3 border shadow-none"
                    style={{ background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
                  >
                    <Row className="g-2 mb-2 align-items-center">
                      <Col md={4}>
                        <Label className="small text-muted fw-bold">Character {idx + 1} Name</Label>
                        <Input
                          type="text"
                          value={c.name}
                          onChange={(e) => updateCharacter(idx, 'name', e.target.value)}
                        />
                      </Col>
                      <Col md={4}>
                        <Label className="small text-muted fw-bold">Damage Dealt</Label>
                        <Input
                          type="number"
                          value={c.damageDealt}
                          onChange={(e) => updateCharacter(idx, 'damageDealt', Number(e.target.value))}
                        />
                      </Col>
                      <Col md={4}>
                        <Label className="small text-muted fw-bold">Damage Share (%)</Label>
                        <Input
                          type="number"
                          value={c.damagePercent}
                          onChange={(e) => updateCharacter(idx, 'damagePercent', Number(e.target.value))}
                        />
                      </Col>
                    </Row>

                    <Row className="g-2">
                      <Col xs={6} md={3}>
                        <Label className="small text-muted">HP</Label>
                        <Input
                          type="number"
                          bsSize="sm"
                          value={c.stats.hp}
                          onChange={(e) => updateCharacterStat(idx, 'hp', Number(e.target.value))}
                        />
                      </Col>
                      <Col xs={6} md={3}>
                        <Label className="small text-muted">ATK</Label>
                        <Input
                          type="number"
                          bsSize="sm"
                          value={c.stats.atk}
                          onChange={(e) => updateCharacterStat(idx, 'atk', Number(e.target.value))}
                        />
                      </Col>
                      <Col xs={6} md={3}>
                        <Label className="small text-muted">Crit Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          bsSize="sm"
                          value={c.stats.critRate}
                          onChange={(e) => updateCharacterStat(idx, 'critRate', Number(e.target.value))}
                        />
                      </Col>
                      <Col xs={6} md={3}>
                        <Label className="small text-muted">Crit DMG (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          bsSize="sm"
                          value={c.stats.critDamage}
                          onChange={(e) => updateCharacterStat(idx, 'critDamage', Number(e.target.value))}
                        />
                      </Col>
                      <Col xs={6} md={3}>
                        <Label className="small text-muted">Energy Recharge (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          bsSize="sm"
                          value={c.stats.energyRecharge}
                          onChange={(e) => updateCharacterStat(idx, 'energyRecharge', Number(e.target.value))}
                        />
                      </Col>
                      <Col xs={6} md={3}>
                        <Label className="small text-muted">Elemental Mastery</Label>
                        <Input
                          type="number"
                          bsSize="sm"
                          value={c.stats.elementalMastery || 0}
                          onChange={(e) => updateCharacterStat(idx, 'elementalMastery', Number(e.target.value))}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: ROTATIONS */}
            {activeTab === 'rotations' && (
              <div>
                <h6 className="fw-bold text-primary mb-3">Rotation Intervals</h6>
                <div className="table-responsive">
                  <table className="table table-bordered table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>DPS</th>
                        <th>Damage Dealt</th>
                        <th>Duration (s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.rotationResults?.map((r, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold text-center">{r.rotationNumber}</td>
                          <td>
                            <Input
                              type="number"
                              bsSize="sm"
                              value={r.dps}
                              onChange={(e) => updateRotation(idx, 'dps', Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <Input
                              type="number"
                              bsSize="sm"
                              value={r.damageDealt}
                              onChange={(e) => updateRotation(idx, 'damageDealt', Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <Input
                              type="number"
                              step="0.01"
                              bsSize="sm"
                              value={r.durationSeconds}
                              onChange={(e) => updateRotation(idx, 'durationSeconds', Number(e.target.value))}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: RESISTANCES & ELEMENTS */}
            {activeTab === 'resistances' && (
              <div>
                <h6 className="fw-bold text-primary mb-2">Enemy Resistances (All 8 Elements)</h6>
                <Row className="g-2 mb-4">
                  {['pyro', 'hydro', 'electro', 'cryo', 'anemo', 'geo', 'dendro', 'physical'].map((elem) => (
                    <Col xs={6} sm={3} key={elem}>
                      <FormGroup>
                        <Label className="small text-capitalize text-muted fw-bold">{elem} (%)</Label>
                        <Input
                          type="number"
                          bsSize="sm"
                          value={formData.targetModifiers?.resistances?.[elem] ?? 10}
                          onChange={(e) => updateResistance(elem, e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                  ))}
                </Row>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold text-primary m-0">Elemental Damage Shares</h6>
                  <span className={`badge ${elemPctValid ? 'bg-success' : 'bg-warning'}`}>
                    Sum: {elemPctSum}%
                  </span>
                </div>
                <Row className="g-2">
                  {['pyro', 'hydro', 'electro', 'cryo', 'anemo', 'geo', 'dendro', 'physical'].map((elem) => (
                    <Col xs={6} sm={3} key={elem}>
                      <FormGroup>
                        <Label className="small text-capitalize text-muted fw-bold">{elem} Share (%)</Label>
                        <Input
                          type="number"
                          bsSize="sm"
                          value={formData.elementalDistribution?.[elem] ?? 0}
                          onChange={(e) => updateElementDist(elem, e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* TAB: GENERATED SQL SCRIPT */}
            {activeTab === 'sql' && (
              <div>
                <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-3">
                  <div>
                    <h6 className="fw-bold text-info m-0">Generated MySQL Ingestion Script</h6>
                    <small className="text-muted">Semi-Fallback: Ready-to-run transaction matching <code>gi-dps-stat-db.sql</code></small>
                  </div>
                  <Button
                    color="info"
                    size="sm"
                    className="fw-bold shadow-sm"
                    onClick={handleCopySql}
                  >
                    {copiedSql ? '✓ Copied SQL Script!' : '📋 Copy SQL to Clipboard'}
                  </Button>
                </div>

                {copiedSql && (
                  <Alert color="success" className="py-2 px-3 small mb-3">
                    ✓ SQL script copied to your clipboard! You can paste and run it directly in MySQL Workbench, phpMyAdmin, or CLI.
                  </Alert>
                )}

                <div className="p-2 rounded bg-black border border-secondary">
                  <pre
                    className="m-0 font-monospace text-light"
                    style={{
                      fontSize: '0.73rem',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '400px',
                      overflowY: 'auto',
                    }}
                  >
                    {generateSqlScript()}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalBody>

      <ModalFooter
        className="d-flex justify-content-between border-top"
        style={{ background: '#11162a', borderTopColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <Button color="secondary" onClick={toggle} disabled={isSubmitting}>
          Cancel
        </Button>
        <div className="d-flex gap-2">
          <Button
            color="info"
            outline
            className="fw-bold shadow-sm"
            onClick={handleCopySql}
          >
            {copiedSql ? '✓ Copied SQL!' : '📋 Copy SQL'}
          </Button>
          <Button
            color="primary"
            className="px-4 fw-bold shadow-sm"
            onClick={handleCommit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Committing to MySQL...' : '✓ Confirm & Commit to Database'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
