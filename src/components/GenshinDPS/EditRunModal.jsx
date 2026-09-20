import React, { useState, useEffect } from 'react';
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
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';

export default function EditRunModal({ isOpen, toggle, run, onSave, isSaving = false }) {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'characters' | 'rotations'
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (run) {
      setFormData({
        teamName: run.teamName || '',
        notes: run.notes || '',
        characters: (run.characters || []).map((c) => ({
          ...c,
          constellation: c.constellation !== undefined ? c.constellation : 0,
          weaponName: c.weaponName || '',
          weaponRefinement: c.weaponRefinement !== undefined ? c.weaponRefinement : 1,
          artifacts: c.artifacts || '',
          buildLabel: c.buildLabel || '',
          notes: c.notes || '',
        })),
        rotations: (run.rotations || []).map((r) => ({
          ...r,
          notes: r.notes || '',
        })),
      });
    }
  }, [run]);

  if (!formData) return null;

  const updateCharacter = (idx, field, val) => {
    setFormData((prev) => {
      const chars = [...prev.characters];
      chars[idx] = { ...chars[idx], [field]: val };
      return { ...prev, characters: chars };
    });
  };

  const updateRotation = (idx, val) => {
    setFormData((prev) => {
      const rots = [...prev.rotations];
      rots[idx] = { ...rots[idx], notes: val };
      return { ...prev, rotations: rots };
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" className="modal-dark">
      <ModalHeader toggle={toggle} className="bg-dark text-white border-bottom border-secondary">
        <div className="d-flex align-items-center gap-2">
          <span>✏️</span>
          <span>Edit Team Name, Builds, Weapons & Notes</span>
        </div>
      </ModalHeader>

      <ModalBody className="p-3 p-md-4" style={{ background: '#0e1222', color: '#e2e8f0', maxHeight: '75vh', overflowY: 'auto' }}>
        <Nav pills className="mb-3 border-bottom border-secondary pb-2">
          <NavItem>
            <NavLink
              className={`py-1 px-3 ${activeTab === 'notes' ? 'active' : 'text-light'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTab('notes')}
            >
              🏷️ Team & Notes
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`py-1 px-3 ${activeTab === 'characters' ? 'active' : 'text-light'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTab('characters')}
            >
              👥 Weapons & Artifacts ({formData.characters.length})
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`py-1 px-3 ${activeTab === 'rotations' ? 'active' : 'text-light'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTab('rotations')}
            >
              📈 Rotation Cadence ({formData.rotations.length})
            </NavLink>
          </NavItem>
        </Nav>

        {/* TAB 1: TEAM NAME & RUN NOTES */}
        {activeTab === 'notes' && (
          <div>
            <div
              className="mb-4 p-3 rounded border"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold text-primary m-0">🏷️ Manual Team Naming</h6>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5">
                  Freeform Editable
                </span>
              </div>
              <FormGroup className="mb-2">
                <Label className="small text-muted fw-bold">Team Setup Name</Label>
                <Input
                  type="text"
                  value={formData.teamName}
                  placeholder="e.g. Zibai Premium, Neuvillette Hypercarry, Raiden National..."
                  onChange={(e) => setFormData((prev) => ({ ...prev, teamName: e.target.value }))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.07)',
                    color: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.18)',
                    fontSize: '0.95rem',
                  }}
                />
              </FormGroup>
              <div className="text-muted small">
                You can freely name your team. Multiple teams with the exact same name can coexist; import & modified timestamps uniquely differentiate them.
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold text-primary m-0">Combat Telemetry Notes & Observations</h6>
              <span className="text-muted small">Shown in card notification & full inspection</span>
            </div>
            <FormGroup>
              <Input
                type="textarea"
                rows={5}
                value={formData.notes}
                placeholder="Enter run observations, team setup strategy, buff conditions, or artifact set details..."
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' }}
              />
            </FormGroup>
            <div className="p-2 rounded bg-dark border border-secondary text-secondary small">
              💡 <strong>Tip:</strong> Adding a note automatically activates the <strong>🔔 NOTE</strong> notification display on the run card and renders the full text inside the inspection drawer.
            </div>
          </div>
        )}

        {/* TAB 2: WEAPONS, ARTIFACTS, CONSTELLATIONS & REFINEMENTS */}
        {activeTab === 'characters' && (
          <div className="d-flex flex-column gap-3">
            <div className="text-muted small mb-1">
              Weapons are labeled as <strong>R1–R5</strong> and Constellations as <strong>C0–C6</strong>. They are instantly displayed on contributor cards (e.g. <code>C3 R1 Zibai</code>, <code>C2R1 Linnea</code>) without brackets.
            </div>

            {formData.characters.map((char, idx) => (
              <div
                key={char.name || idx}
                className="p-3 rounded border"
                style={{ background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="fw-bold fs-6 text-warning">
                    {idx + 1}. {char.name} <span className="text-muted small">Lv.{char.level} ({char.damagePercent}%)</span>
                  </div>
                  <span className="badge bg-secondary-subtle text-secondary border">
                    Slot {char.slotOrder || idx + 1}
                  </span>
                </div>

                <Row className="g-2">
                  <Col md={6}>
                    <FormGroup className="mb-2">
                      <Label className="small text-muted fw-bold">Weapon Name</Label>
                      <Input
                        type="text"
                        bsSize="sm"
                        value={char.weaponName}
                        placeholder="e.g. Peak Patrol Song, Surf's Up..."
                        onChange={(e) => updateCharacter(idx, 'weaponName', e.target.value)}
                        style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                      />
                    </FormGroup>
                  </Col>

                  <Col xs={6} md={3}>
                    <FormGroup className="mb-2">
                      <Label className="small text-muted fw-bold">Refinement (R)</Label>
                      <Input
                        type="select"
                        bsSize="sm"
                        value={char.weaponRefinement}
                        onChange={(e) => updateCharacter(idx, 'weaponRefinement', Number(e.target.value))}
                        style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                      >
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r} style={{ background: '#1e293b', color: '#fff' }}>
                            R{r}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>

                  <Col xs={6} md={3}>
                    <FormGroup className="mb-2">
                      <Label className="small text-muted fw-bold">Constellation (C)</Label>
                      <Input
                        type="select"
                        bsSize="sm"
                        value={char.constellation}
                        onChange={(e) => updateCharacter(idx, 'constellation', Number(e.target.value))}
                        style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map((c) => (
                          <option key={c} value={c} style={{ background: '#1e293b', color: '#fff' }}>
                            C{c}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>

                  <Col md={6}>
                    <FormGroup className="mb-2">
                      <Label className="small text-muted fw-bold">Artifacts</Label>
                      <Input
                        type="text"
                        bsSize="sm"
                        value={char.artifacts}
                        placeholder="e.g. 4pc Obsidian Codex, 4pc Scroll of the Hero..."
                        onChange={(e) => updateCharacter(idx, 'artifacts', e.target.value)}
                        style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                      />
                    </FormGroup>
                  </Col>

                  <Col md={3}>
                    <FormGroup className="mb-2">
                      <Label className="small text-muted fw-bold">Custom Label (Optional)</Label>
                      <Input
                        type="text"
                        bsSize="sm"
                        value={char.buildLabel}
                        placeholder="e.g. C3 R1 or C2R1"
                        onChange={(e) => updateCharacter(idx, 'buildLabel', e.target.value)}
                        style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                      />
                    </FormGroup>
                  </Col>

                  <Col md={3}>
                    <FormGroup className="mb-2">
                      <Label className="small text-muted fw-bold">Build Notes</Label>
                      <Input
                        type="text"
                        bsSize="sm"
                        value={char.notes}
                        placeholder="e.g. DEF sands, Geo goblet"
                        onChange={(e) => updateCharacter(idx, 'notes', e.target.value)}
                        style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: ROTATION FEATURE INTEGRATION */}
        {activeTab === 'rotations' && (
          <div>
            <div className="text-muted small mb-3">
              Document the rotation sequence, burst triggers, or combo notes for each cycle. These appear in the <strong>Rotation Cadence</strong> table during run inspection.
            </div>

            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle border border-secondary" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr className="table-secondary text-dark">
                    <th style={{ width: '85px' }}>Cycle #</th>
                    <th style={{ width: '100px' }}>DPS</th>
                    <th style={{ width: '90px' }}>Duration</th>
                    <th>Rotation Execution Notes / Combo Sequence</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.rotations.map((rot, idx) => (
                    <tr key={rot.rotationNumber || idx}>
                      <td className="fw-bold text-center">
                        <span className="badge bg-primary">Cycle {rot.rotationNumber}</span>
                      </td>
                      <td className="font-monospace">{Number(rot.dps || 0).toLocaleString()}</td>
                      <td className="font-monospace">{Number(rot.durationSeconds || 0).toFixed(2)}s</td>
                      <td>
                        <Input
                          type="text"
                          bsSize="sm"
                          value={rot.notes || ''}
                          placeholder="e.g. Illuga E -> Columbina Q -> Linnea E Q -> Zibai burst"
                          onChange={(e) => updateRotation(idx, e.target.value)}
                          style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="bg-dark border-top border-secondary d-flex justify-content-between">
        <Button color="secondary" onClick={toggle} disabled={isSaving}>
          Cancel
        </Button>
        <Button color="primary" className="fw-bold px-4 shadow-sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving Changes...' : '✓ Save Changes'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
