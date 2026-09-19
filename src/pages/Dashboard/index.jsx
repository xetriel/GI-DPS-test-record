import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Chart from 'react-apexcharts';
import { Spinner, Row, Col, Card, CardBody, CardHeader } from 'reactstrap';
import { fetchRuns } from '../../services/api';

export default function DashboardPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRuns({ limit: 100 })
      .then((res) => setRuns(res.data || []))
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, []);

  const totalRuns = runs.length;
  const highestDpsRun = runs.length > 0 ? [...runs].sort((a, b) => b.dps - a.dps)[0] : null;
  const avgDps = runs.length > 0 ? Math.round(runs.reduce((acc, r) => acc + r.dps, 0) / runs.length) : 0;
  const highestHit = runs.length > 0 ? Math.max(...runs.map((r) => r.strongestHit || 0)) : 0;

  // Aggregate elemental breakdown across all runs
  const elementTotals = {};
  runs.forEach((r) => {
    (r.elementalBreakdowns || []).forEach((e) => {
      elementTotals[e.element] = (elementTotals[e.element] || 0) + e.percentage;
    });
  });

  const pieLabels = Object.keys(elementTotals);
  const pieValues = Object.values(elementTotals);

  const donutOptions = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: pieLabels,
    colors: ['#ff6036', '#b366ff', '#00b4d8', '#72e4ff', '#2dd4bf', '#fbbf24', '#4ade80', '#cbd5e1'],
    legend: { position: 'bottom', labels: { colors: '#cbd5e1' } },
    theme: { mode: 'dark' },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Runs Share',
              color: '#94a3b8',
              formatter: () => `${totalRuns} Runs`,
            },
            value: {
              color: '#f8fafc',
            },
          },
        },
      },
    },
  };

  // Top DPS archetypes bar chart
  const topRuns = [...runs].sort((a, b) => b.dps - a.dps).slice(0, 5);
  const barSeries = [
    {
      name: 'DPS',
      data: topRuns.map((r) => r.dps),
    },
  ];
  const barOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    theme: { mode: 'dark' },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        distributed: true,
      },
    },
    colors: ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'],
    xaxis: {
      categories: topRuns.map((r) => `${r.characters?.[0]?.name || 'Party'} (${r.testPreset})`),
      labels: {
        style: { colors: '#94a3b8' },
        formatter: (val) => `${(val / 1000).toFixed(0)}K`,
      },
    },
    yaxis: {
      labels: {
        style: { colors: '#cbd5e1' },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Number(val).toLocaleString()} DPS`,
    },
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <div className="text-muted mt-2">Loading executive telemetry...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header Banner */}
      <div className="p-4 mb-4 rounded-3 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-warning text-dark fw-bold">Active Patch 7.0</span>
              <span className="badge bg-dark text-white border border-secondary">Damage Simulator++</span>
            </div>
            <h2 className="fw-bold m-0">GenshinDPS Combat Analytics</h2>
            <p className="m-0 mt-1 opacity-75" style={{ maxWidth: '650px' }}>
              Multimodal Vision LLM extraction and structured telemetry archive for Genshin Impact combat simulators, rotation timelines, and damage distributions.
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link to="/runs" className="btn btn-warning fw-bold shadow-sm">
              Explore DPS Archive →
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow-sm border-0 h-100">
            <CardBody className="p-3">
              <div className="text-muted small text-uppercase fw-bold">Archived Runs</div>
              <div className="fs-3 fw-bold text-body-emphasis mt-1">{totalRuns}</div>
              <div className="text-success small fw-semibold mt-1">✓ Fully Normalized Relational</div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow-sm border-0 h-100">
            <CardBody className="p-3">
              <div className="text-muted small text-uppercase fw-bold">Highest Recorded DPS</div>
              <div className="fs-3 fw-bold text-primary mt-1">
                {highestDpsRun ? Number(highestDpsRun.dps).toLocaleString() : '—'}
              </div>
              <div className="text-muted small mt-1">
                Preset: {highestDpsRun?.testPreset || 'Abyss 12'}
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow-sm border-0 h-100">
            <CardBody className="p-3">
              <div className="text-muted small text-uppercase fw-bold">Average Team DPS</div>
              <div className="fs-3 fw-bold text-success mt-1">
                {avgDps.toLocaleString()}
              </div>
              <div className="text-muted small mt-1">Across all archived presets</div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow-sm border-0 h-100">
            <CardBody className="p-3">
              <div className="text-muted small text-uppercase fw-bold">Strongest Hit Peak</div>
              <div className="fs-3 fw-bold text-danger mt-1">
                {highestHit.toLocaleString()}
              </div>
              <div className="text-muted small mt-1">Single damage instance</div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-4 mb-4">
        <Col xs={12} lg={7}>
          <Card className="shadow-sm border-0 h-100">
            <CardHeader className="border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold m-0">Top Performing Combat Archetypes</h6>
              <span className="badge bg-body-secondary text-body border">Abyss 12</span>
            </CardHeader>
            <CardBody>
              {topRuns.length > 0 ? (
                <Chart options={barOptions} series={barSeries} type="bar" height={280} />
              ) : (
                <div className="text-center text-muted p-5">No runs available</div>
              )}
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card className="shadow-sm border-0 h-100">
            <CardHeader className="border-0 pt-3 pb-0">
              <h6 className="fw-bold m-0">Elemental Damage Distribution</h6>
            </CardHeader>
            <CardBody>
              {pieValues.length > 0 ? (
                <Chart options={donutOptions} series={pieValues} type="donut" height={280} />
              ) : (
                <div className="text-center text-muted p-5">No elemental data</div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Recent Combat Ingestions Table */}
      <Card className="shadow-sm border-0 mb-4">
        <CardHeader className="border-0 pt-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold m-0">Recent Telemetry Ingestions</h6>
          <Link to="/runs" className="text-primary text-decoration-none small fw-bold">
            View All Runs →
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="ps-3">Preset & Target</th>
                  <th>DPS</th>
                  <th>Total Damage</th>
                  <th>Duration</th>
                  <th>Party Members</th>
                  <th className="text-end pe-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td className="ps-3">
                      <div className="fw-bold text-body-emphasis">{r.testPreset}</div>
                      <span className="text-muted small">{r.targetName} Lv.{r.targetLevel}</span>
                    </td>
                    <td className="fw-bold font-monospace text-primary">
                      {Number(r.dps).toLocaleString()}
                    </td>
                    <td className="font-monospace">
                      {(Number(r.totalDamage) / 1_000_000).toFixed(2)}M
                    </td>
                    <td className="font-monospace">
                      {Number(r.timeElapsedSeconds).toFixed(2)}s
                    </td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        {r.characters.map((c) => (
                          <span key={c.name} className="badge bg-body-secondary text-body border" style={{ fontSize: '0.72rem' }}>
                            {c.name} ({c.damagePercent}%)
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-end pe-3">
                      <Link to="/runs" className="btn btn-sm btn-outline-primary">
                        Inspect →
                      </Link>
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
