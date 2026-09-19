import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Row, Col, Card, CardBody, CardHeader, Spinner } from 'reactstrap';
import { fetchRuns } from '../../services/api';

export default function AnalyticsPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRuns({ limit: 50 })
      .then((res) => setRuns(res.data || []))
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <div className="text-muted mt-2">Loading combat analytics...</div>
      </div>
    );
  }

  // Rotation timelines across runs
  const rotationSeries = runs.slice(0, 3).map((r) => ({
    name: `${r.characters?.[0]?.name || 'Party'} (${r.testPreset})`,
    data: (r.rotations || []).map((rot) => rot.dps),
  }));

  const rotationOptions = {
    chart: { type: 'line', toolbar: { show: true } },
    theme: { mode: 'dark' },
    stroke: { curve: 'straight', width: 3 },
    grid: { borderColor: 'rgba(255, 255, 255, 0.08)' },
    xaxis: {
      categories: ['Rotation 1', 'Rotation 2', 'Rotation 3', 'Rotation 4', 'Rotation 5'],
      labels: { style: { colors: '#94a3b8' } },
    },
    yaxis: {
      title: { text: 'Rotation DPS', style: { color: '#94a3b8' } },
      labels: {
        style: { colors: '#cbd5e1' },
        formatter: (val) => `${(val / 1000).toFixed(0)}K`,
      },
    },
    markers: { size: 5 },
    colors: ['#ff6036', '#00b4d8', '#b366ff'],
  };

  // Character Damage Percent Breakdown comparison
  const characterNames = [];
  const characterTotalDmg = {};

  runs.forEach((r) => {
    r.characters.forEach((c) => {
      if (!characterNames.includes(c.name)) characterNames.push(c.name);
      characterTotalDmg[c.name] = (characterTotalDmg[c.name] || 0) + Number(c.damageDealt);
    });
  });

  const sortedChars = characterNames.sort((a, b) => characterTotalDmg[b] - characterTotalDmg[a]).slice(0, 8);
  const charDmgSeries = [
    {
      name: 'Total Cumulative Damage Dealt',
      data: sortedChars.map((n) => characterTotalDmg[n]),
    },
  ];

  const charDmgOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    theme: { mode: 'dark' },
    grid: { borderColor: 'rgba(255, 255, 255, 0.08)' },
    plotOptions: { bar: { columnWidth: '50%', borderRadius: 4 } },
    xaxis: {
      categories: sortedChars,
      labels: { style: { colors: '#94a3b8' } },
    },
    yaxis: {
      labels: {
        style: { colors: '#cbd5e1' },
        formatter: (val) => `${(val / 1_000_000).toFixed(1)}M`,
      },
    },
    colors: ['#6366f1'],
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="mb-4">
        <h3 className="fw-bold m-0 text-body-emphasis">Cross-Run Combat Analytics</h3>
        <p className="text-muted m-0 mt-1">
          Comparative telemetry across rotation cycles, character damage distributions, and single-hit ceilings.
        </p>
      </div>

      <Row className="g-4 mb-4">
        <Col xs={12} lg={6}>
          <Card className="shadow-sm border-0 h-100">
            <CardHeader className="border-0 pt-3">
              <h6 className="fw-bold m-0">Rotation Cadence & DPS Consistency</h6>
              <span className="text-muted small">Tracking cycle-by-cycle damage delivery stability</span>
            </CardHeader>
            <CardBody>
              <Chart options={rotationOptions} series={rotationSeries} type="line" height={320} />
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card className="shadow-sm border-0 h-100">
            <CardHeader className="border-0 pt-3">
              <h6 className="fw-bold m-0">Top Damage Contributors Across Runs</h6>
              <span className="text-muted small">Total party damage aggregated by character</span>
            </CardHeader>
            <CardBody>
              <Chart options={charDmgOptions} series={charDmgSeries} type="bar" height={320} />
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Target Dummy Resistance Comparison */}
      <Card className="shadow-sm border-0 mb-4">
        <CardHeader className="border-0 pt-3">
          <h6 className="fw-bold m-0">Enemy Resistance Profiles Tested</h6>
        </CardHeader>
        <CardBody className="p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="ps-3">Target Name</th>
                  <th>Level</th>
                  <th>Pyro</th>
                  <th>Hydro</th>
                  <th>Electro</th>
                  <th>Cryo</th>
                  <th>Anemo</th>
                  <th>Geo</th>
                  <th>Dendro</th>
                  <th>Physical</th>
                  <th className="pe-3">Tested In Preset</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id}>
                    <td className="ps-3 fw-bold">{r.targetName}</td>
                    <td>Lv. {r.targetLevel}</td>
                    <td>{r.targetResistances?.pyro ?? 10}%</td>
                    <td>{r.targetResistances?.hydro ?? 10}%</td>
                    <td>{r.targetResistances?.electro ?? 10}%</td>
                    <td>{r.targetResistances?.cryo ?? 10}%</td>
                    <td>{r.targetResistances?.anemo ?? 10}%</td>
                    <td>{r.targetResistances?.geo ?? 10}%</td>
                    <td>{r.targetResistances?.dendro ?? 10}%</td>
                    <td>{r.targetResistances?.physical ?? 10}%</td>
                    <td className="pe-3">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                        {r.testPreset}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
