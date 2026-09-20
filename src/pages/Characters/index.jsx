import { useState, useEffect } from 'react';
import { Row, Col, Card, CardBody, CardHeader, Spinner } from 'reactstrap';
import { fetchRuns } from '../../services/api';
import ElementalBadge from '../../components/GenshinDPS/ElementalBadge';
import { getCharacterElement } from '../../utils/characterUtils';

function formatNumber(num) {
  return Number(num || 0).toLocaleString();
}

export default function CharactersPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRuns({ limit: 100 })
      .then((res) => setRuns(res.data || []))
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <div className="text-muted mt-2">Loading character telemetry...</div>
      </div>
    );
  }

  // Aggregate stats per character
  const charMap = {};
  runs.forEach((r) => {
    r.characters.forEach((c) => {
      if (!charMap[c.name]) {
        charMap[c.name] = {
          name: c.name,
          element: getCharacterElement(c.name, c.damageBonuses),
          appearances: 0,
          totalDamage: 0,
          highestDmgPercent: 0,
          critRates: [],
          critDmgs: [],
          atks: [],
          ers: [],
          runs: [],
        };
      }
      const entry = charMap[c.name];
      entry.appearances += 1;
      entry.totalDamage += Number(c.damageDealt);
      entry.highestDmgPercent = Math.max(entry.highestDmgPercent, c.damagePercent);
      entry.critRates.push(Number(c.critRate));
      entry.critDmgs.push(Number(c.critDamage));
      entry.atks.push(c.atk);
      entry.ers.push(Number(c.energyRecharge));
      entry.runs.push(r);
    });
  });

  const charList = Object.values(charMap).sort((a, b) => b.totalDamage - a.totalDamage);

  const avg = (arr) => (arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0);

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="mb-4">
        <h3 className="fw-bold m-0 text-body-emphasis">Character Substats & Telemetry Rankings</h3>
        <p className="text-muted m-0 mt-1">
          Aggregated combat contributions, average build attributes, and damage share ceilings.
        </p>
      </div>

      <Row className="g-4">
        {charList.map((char) => (
          <Col key={char.name} xs={12} md={6} xl={4}>
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <CardHeader className="border-bottom p-3 d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="fw-bold m-0 text-body-emphasis">{char.name}</h5>
                  <span className="text-muted small">{char.appearances} {char.appearances === 1 ? 'Test Run' : 'Test Runs'}</span>
                </div>
                <ElementalBadge element={char.element} />
              </CardHeader>

              <CardBody className="p-3">
                <div className="p-2 mb-3 rounded bg-body-tertiary border text-center">
                  <div className="text-muted small text-uppercase">Cumulative Damage Dealt</div>
                  <div className="fs-5 fw-bold text-primary">
                    {(char.totalDamage / 1_000_000).toFixed(2)}M
                  </div>
                  <div className="text-muted small">
                    Peak Damage Share: <strong className="text-danger">{char.highestDmgPercent}%</strong>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2" style={{ fontSize: '0.84rem' }}>
                  <div className="d-flex justify-content-between border-bottom pb-1">
                    <span className="text-muted">Avg Crit Ratio:</span>
                    <span className="fw-bold font-monospace text-danger">
                      {avg(char.critRates)}% / {avg(char.critDmgs)}%
                    </span>
                  </div>

                  <div className="d-flex justify-content-between border-bottom pb-1">
                    <span className="text-muted">Avg Total ATK:</span>
                    <span className="fw-bold font-monospace text-body-emphasis">
                      {formatNumber(avg(char.atks))}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between border-bottom pb-1">
                    <span className="text-muted">Avg Energy Recharge:</span>
                    <span className="fw-bold font-monospace text-info">
                      {avg(char.ers)}%
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
