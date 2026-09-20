import React from 'react';
import { Row, Col, Input, FormGroup, Label, Button } from 'reactstrap';
import { ELEMENT_CONFIG } from './ElementalBadge';

export default function FilterToolbar({ filters, setFilters, onReset, totalCount = 0 }) {
  const handleChange = (field, val) => {
    setFilters((prev) => ({ ...prev, [field]: val }));
  };

  const elements = ['all', 'Pyro', 'Hydro', 'Electro', 'Cryo', 'Anemo', 'Geo', 'Dendro', 'Physical'];
  const presets = ['all', 'Abyss 12', 'Local Legend', 'Overworld Boss', 'Stygian Beast'];
  const versions = ['all', '7.0', '6.0', '5.3'];

  return (
    <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: '12px' }}>
      <div className="card-body p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold fs-6 text-body-emphasis">Filter & Search Runs</span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
              {totalCount} {totalCount === 1 ? 'Run' : 'Runs'} Found
            </span>
          </div>

          <Button color="link" size="sm" className="text-secondary text-decoration-none p-0" onClick={onReset}>
            ↺ Reset Filters
          </Button>
        </div>

        <Row className="g-2 g-md-3">
          {/* Test Preset */}
          <Col xs={6} md={3} lg={2}>
            <FormGroup className="m-0">
              <Label className="small text-muted fw-bold mb-1">Preset</Label>
              <Input
                type="select"
                bsSize="sm"
                value={filters.testPreset || 'all'}
                onChange={(e) => handleChange('testPreset', e.target.value)}
              >
                {presets.map((p) => (
                  <option key={p} value={p}>
                    {p === 'all' ? 'All Presets' : p}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>

          {/* Elemental Damage Share Filter */}
          <Col xs={6} md={3} lg={2}>
            <FormGroup className="m-0">
              <Label className="small text-muted fw-bold mb-1">Element</Label>
              <Input
                type="select"
                bsSize="sm"
                value={filters.element || 'all'}
                onChange={(e) => handleChange('element', e.target.value)}
              >
                {elements.map((el) => {
                  const cfg = ELEMENT_CONFIG[el];
                  return (
                    <option key={el} value={el}>
                      {el === 'all' ? 'All Elements' : `${cfg?.icon || ''} ${el}`}
                    </option>
                  );
                })}
              </Input>
            </FormGroup>
          </Col>

          {/* Character Search / Filter */}
          <Col xs={6} md={3} lg={3}>
            <FormGroup className="m-0">
              <Label className="small text-muted fw-bold mb-1">Party Member</Label>
              <Input
                type="text"
                bsSize="sm"
                placeholder="e.g. Mavuika, Varesa..."
                value={filters.character === 'all' ? '' : (filters.character || '')}
                onChange={(e) => handleChange('character', e.target.value || 'all')}
              />
            </FormGroup>
          </Col>

          {/* Patch Version */}
          <Col xs={6} md={3} lg={2}>
            <FormGroup className="m-0">
              <Label className="small text-muted fw-bold mb-1">Version</Label>
              <Input
                type="select"
                bsSize="sm"
                value={filters.gameVersion || 'all'}
                onChange={(e) => handleChange('gameVersion', e.target.value)}
              >
                {versions.map((v) => (
                  <option key={v} value={v}>
                    {v === 'all' ? 'All Versions' : `v${v} ${v === '7.0' ? '(Active)' : ''}`}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>

          {/* Sort By */}
          <Col xs={12} md={6} lg={3}>
            <FormGroup className="m-0">
              <Label className="small text-muted fw-bold mb-1">Sort Metric</Label>
              <Input
                type="select"
                bsSize="sm"
                value={`${filters.sortBy || 'createdAt'}_${filters.sortOrder || 'desc'}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('_');
                  setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
                }}
              >
                <option value="dps_desc">Highest DPS First</option>
                <option value="dps_asc">Lowest DPS First</option>
                <option value="totalDamage_desc">Highest Total Damage</option>
                <option value="createdAt_desc">Most Recent Scan</option>
              </Input>
            </FormGroup>
          </Col>
        </Row>
      </div>
    </div>
  );
}
