import { useState, useEffect } from 'react';
import { Button, Spinner, Alert } from 'reactstrap';
import FilterToolbar from '../../components/GenshinDPS/FilterToolbar';
import RunCard from '../../components/GenshinDPS/RunCard';
import RunDetailDrawer from '../../components/GenshinDPS/RunDetailDrawer';
import VerificationModal from '../../components/GenshinDPS/VerificationModal';
import { fetchRuns, scanScreenshot, commitRun, deleteRun } from '../../services/api';

export default function DpsRunsPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    testPreset: 'all',
    element: 'all',
    character: 'all',
    gameVersion: 'all',
    sortBy: 'dps',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  // Slide-over drawer state
  const [selectedRun, setSelectedRun] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Verification modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [scanImageUrl, setScanImageUrl] = useState('');
  const [scanEngine, setScanEngine] = useState('tesseract-ocr');
  const [rawTextSnippet, setRawTextSnippet] = useState('');
  const [_scanStatusText, setScanStatusText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  const loadRuns = () => {
    setLoading(true);
    fetchRuns(filters)
      .then((res) => {
        setRuns(res.data || []);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load telemetry runs');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;
    fetchRuns(filters)
      .then((res) => {
        if (!ignore) {
          setRuns(res.data || []);
          setError(null);
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Failed to load telemetry runs');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      testPreset: 'all',
      element: 'all',
      character: 'all',
      gameVersion: 'all',
      sortBy: 'dps',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
    });
  };

  const handleCardClick = (run) => {
    setSelectedRun(run);
    setIsDrawerOpen(true);
  };

  const handleDeleteRun = async (id) => {
    if (!window.confirm('Are you sure you want to delete this combat telemetry record?')) return;
    try {
      await deleteRun(id);
      setSuccessMessage('Run removed from archive');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadRuns();
    } catch (err) {
      alert('Failed to delete run: ' + err.message);
    }
  };

  // Upload or Sample Run scanning
  const handleScanSample = async () => {
    try {
      setIsScanning(true);
      setScanStatusText('Loading reference Abyss 12 sample run...');
      setError(null);
      const res = await scanScreenshot(null, true);
      setExtractedData(res.data);
      setScanImageUrl(res.imageUrl);
      setScanEngine(res.engine || 'reference-sample');
      setRawTextSnippet(res.rawTextSnippet || '');
      setIsModalOpen(true);
    } catch (err) {
      setError('Scan error: ' + err.message);
    } finally {
      setIsScanning(false);
      setScanStatusText('');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsScanning(true);
      setScanStatusText('Analyzing screenshot with Tesseract OCR / Multimodal Vision...');
      setError(null);
      const res = await scanScreenshot(file, false);
      setExtractedData(res.data);
      setScanImageUrl(res.imageUrl);
      setScanEngine(res.engine || 'tesseract-ocr');
      setRawTextSnippet(res.rawTextSnippet || '');
      setIsModalOpen(true);
    } catch (err) {
      setError('Failed to scan uploaded image: ' + err.message);
    } finally {
      setIsScanning(false);
      setScanStatusText('');
      event.target.value = '';
    }
  };

  const handleCommitData = async (validatedData, imageUrl) => {
    try {
      setIsCommitting(true);
      await commitRun(validatedData, imageUrl, '7.0');
      setIsModalOpen(false);
      setSuccessMessage('Combat telemetry successfully persisted to archive!');
      setTimeout(() => setSuccessMessage(null), 4000);
      loadRuns();
    } catch (err) {
      alert('Commit failed: ' + err.message);
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Page Title & Action Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="m-0 fw-bold text-body-emphasis">DPS Runs Archive</h3>
            <span className="badge bg-primary px-2 py-1">Enterprise Combat Telemetry</span>
          </div>
          <p className="text-muted m-0 mt-1" style={{ fontSize: '0.9rem' }}>
            Browse, filter, and inspect normalized damage simulator dummy test records.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Hidden File Input */}
          <input
            id="quick-file-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          <Button
            color="outline-primary"
            className="fw-bold shadow-sm d-flex align-items-center gap-2"
            onClick={handleScanSample}
            disabled={isScanning}
          >
            {isScanning ? <Spinner size="sm" /> : '⚡'} Try Sample Screenshot
          </Button>

          <Button
            color="primary"
            className="fw-bold shadow-sm d-flex align-items-center gap-2"
            onClick={() => document.getElementById('quick-file-upload')?.click()}
            disabled={isScanning}
          >
            {isScanning ? <Spinner size="sm" /> : '📤'} Upload New Screenshot
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <Alert color="success" className="shadow-sm py-2 px-3 mb-3">
          ✓ {successMessage}
        </Alert>
      )}

      {error && (
        <Alert color="danger" className="shadow-sm py-2 px-3 mb-3">
          ⚠️ {error}
        </Alert>
      )}

      {/* Filter Toolbar */}
      <FilterToolbar
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        totalCount={runs.length}
      />

      {/* Runs Grid */}
      {loading ? (
        <div className="text-center p-5">
          <Spinner color="primary" />
          <div className="text-muted mt-2">Loading telemetry runs...</div>
        </div>
      ) : runs.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0">
          <div className="fs-1 mb-2">📊</div>
          <h5 className="fw-bold">No Combat Runs Match Your Filters</h5>
          <p className="text-muted">Try resetting filters or upload a new test result screenshot.</p>
          <div className="d-flex justify-content-center gap-2 mt-2">
            <Button color="secondary" outline onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button color="primary" onClick={handleScanSample}>
              Load Sample Run
            </Button>
          </div>
        </div>
      ) : (
        <div className="row">
          {runs.map((run) => (
            <div key={run.id} className="col-12 col-lg-6 col-xxl-4">
              <RunCard
                run={run}
                onSelect={handleCardClick}
                onDelete={handleDeleteRun}
              />
            </div>
          ))}
        </div>
      )}

      {/* Tier 2: Slide-Over Deep-Dive Drawer */}
      <RunDetailDrawer
        run={selectedRun}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Human Verification & Correction Modal */}
      <VerificationModal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(false)}
        initialData={extractedData}
        imageUrl={scanImageUrl}
        onCommit={handleCommitData}
        isSubmitting={isCommitting}
        engine={scanEngine}
        rawTextSnippet={rawTextSnippet}
      />
    </div>
  );
}
