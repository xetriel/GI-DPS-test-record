import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ButtonGroup,
  Collapse,
} from 'reactstrap';
import {
  exportRunsToJson,
  exportRunsToSummaryCsv,
  exportCharactersToCsv,
  downloadBlob,
} from '../../utils/databaseShareUtils';

export default function DatabaseExportModal({
  isOpen,
  toggle,
  allRuns = [],
  filteredRuns = [],
  singleRun = null,
}) {
  const [scope, setScope] = useState(singleRun ? 'single' : 'all');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Compute runs to export based on selected scope
  const targetRuns = useMemo(() => {
    if (scope === 'single' && singleRun) {
      return [singleRun];
    }
    if (scope === 'filtered' && filteredRuns) {
      return filteredRuns;
    }
    return allRuns;
  }, [scope, singleRun, filteredRuns, allRuns]);

  // Generate preview snippet of JSON
  const previewJson = useMemo(() => {
    return exportRunsToJson(targetRuns.slice(0, 2), {
      source: 'GenshinDPS Telemetry Archive',
    });
  }, [targetRuns]);

  // Handlers for the 4 download / share options
  const handleDownloadJson = () => {
    const jsonStr = exportRunsToJson(targetRuns, {
      source: 'GenshinDPS Telemetry Archive',
    });
    const filename = `genshindps_archive_${scope}_${new Date().toISOString().slice(0, 10)}.json`;
    downloadBlob(jsonStr, filename, 'application/json');
  };

  const handleDownloadRunsCsv = () => {
    const csvStr = exportRunsToSummaryCsv(targetRuns);
    const filename = `genshindps_runs_${scope}_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadBlob(csvStr, filename, 'text/csv;charset=utf-8');
  };

  const handleDownloadCharactersCsv = () => {
    const csvStr = exportCharactersToCsv(targetRuns);
    const filename = `genshindps_character_builds_${scope}_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadBlob(csvStr, filename, 'text/csv;charset=utf-8');
  };

  const handleCopyToClipboard = async () => {
    try {
      const jsonStr = exportRunsToJson(targetRuns, {
        source: 'GenshinDPS Telemetry Archive',
      });
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = jsonStr;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      alert('Failed to copy to clipboard: ' + err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle} className="px-4 pt-4 pb-2 border-bottom-0">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">📤</span>
          <div>
            <h5 className="modal-title fw-bold m-0 text-body-emphasis" style={{ fontSize: '1.15rem' }}>
              Export &amp; Share Database
            </h5>
            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
              Export combat telemetry records for spreadsheets, backups, or Discord sharing.
            </small>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="px-4 py-3">
        {/* Compact Scope Selector Bar */}
        <div className="d-flex align-items-center justify-content-between p-2.5 px-3 mb-3 rounded-3 bg-body-tertiary border flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
              Scope:
            </span>
            <ButtonGroup size="sm">
              <Button
                color={scope === 'all' ? 'primary' : 'outline-secondary'}
                className="py-1 px-2.5 fw-semibold"
                onClick={() => setScope('all')}
              >
                All Runs ({allRuns.length})
              </Button>
              {filteredRuns && filteredRuns.length !== allRuns.length && (
                <Button
                  color={scope === 'filtered' ? 'primary' : 'outline-secondary'}
                  className="py-1 px-2.5 fw-semibold"
                  onClick={() => setScope('filtered')}
                >
                  Filtered ({filteredRuns.length})
                </Button>
              )}
              {singleRun && (
                <Button
                  color={scope === 'single' ? 'primary' : 'outline-secondary'}
                  className="py-1 px-2.5 fw-semibold"
                  onClick={() => setScope('single')}
                >
                  Single: {singleRun.teamName || 'Party'}
                </Button>
              )}
            </ButtonGroup>
          </div>

          <span className="badge bg-primary px-2.5 py-1 text-white">
            {targetRuns.length} {targetRuns.length === 1 ? 'Run' : 'Runs'} Selected
          </span>
        </div>

        {/* Four Export Options (Horizontal Action Rows, Generous Spacing) */}
        <div className="d-flex flex-column gap-2.5 mb-3">
          {/* Option 1: Full Relational JSON Archive */}
          <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-body-tertiary flex-wrap gap-3 shadow-sm">
            <div className="d-flex align-items-center gap-2.5 flex-grow-1" style={{ minWidth: '220px' }}>
              <div
                className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontSize: '1.25rem' }}
              >
                💾
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-1.5 mb-0.5">
                  <strong className="text-body-emphasis small">1. Full JSON Archive</strong>
                  <span className="badge bg-primary px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>.JSON</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.76rem', lineHeight: '1.4' }}>
                  Complete relational archive with stats, builds, rotations, and resistances. Lossless &amp; re-importable.
                </div>
              </div>
            </div>
            <Button
              color="primary"
              size="sm"
              className="fw-bold px-3 py-1.5 text-nowrap shadow-sm d-flex align-items-center gap-1 ms-auto ms-sm-0"
              onClick={handleDownloadJson}
              disabled={targetRuns.length === 0}
            >
              <span>💾</span> Download JSON
            </Button>
          </div>

          {/* Option 2: Runs Overview CSV */}
          <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-body-tertiary flex-wrap gap-3 shadow-sm">
            <div className="d-flex align-items-center gap-2.5 flex-grow-1" style={{ minWidth: '220px' }}>
              <div
                className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '1.25rem' }}
              >
                📊
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-1.5 mb-0.5">
                  <strong className="text-body-emphasis small">2. DPS Runs Summary</strong>
                  <span className="badge bg-success px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>.CSV</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.76rem', lineHeight: '1.4' }}>
                  1 row per test run for Excel or Google Sheets (DPS, duration, total damage, party members, date).
                </div>
              </div>
            </div>
            <Button
              color="success"
              size="sm"
              className="fw-bold px-3 py-1.5 text-nowrap shadow-sm d-flex align-items-center gap-1 text-white ms-auto ms-sm-0"
              onClick={handleDownloadRunsCsv}
              disabled={targetRuns.length === 0}
            >
              <span>📊</span> Download Runs CSV
            </Button>
          </div>

          {/* Option 3: Character Builds Matrix CSV */}
          <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-body-tertiary flex-wrap gap-3 shadow-sm">
            <div className="d-flex align-items-center gap-2.5 flex-grow-1" style={{ minWidth: '220px' }}>
              <div
                className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                style={{ width: '40px', height: '40px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', fontSize: '1.25rem' }}
              >
                👥
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-1.5 mb-0.5">
                  <strong className="text-body-emphasis small">3. Character Builds Matrix</strong>
                  <span className="badge bg-info px-1.5 py-0.5 text-white" style={{ fontSize: '0.65rem' }}>.CSV</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.76rem', lineHeight: '1.4' }}>
                  1 row per character build with weapon, refinements, artifacts, constellations, damage %, and stats.
                </div>
              </div>
            </div>
            <Button
              color="info"
              size="sm"
              className="fw-bold px-3 py-1.5 text-nowrap shadow-sm d-flex align-items-center gap-1 text-white ms-auto ms-sm-0"
              onClick={handleDownloadCharactersCsv}
              disabled={targetRuns.length === 0}
            >
              <span>👥</span> Download Builds CSV
            </Button>
          </div>

          {/* Option 4: Quick Copy JSON (Vibrant, High-Contrast Amber / Gold Button) */}
          <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-body-tertiary flex-wrap gap-3 shadow-sm">
            <div className="d-flex align-items-center gap-2.5 flex-grow-1" style={{ minWidth: '220px' }}>
              <div
                className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                style={{ width: '40px', height: '40px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontSize: '1.25rem' }}
              >
                📋
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-1.5 mb-0.5">
                  <strong className="text-body-emphasis small">4. Quick Copy JSON</strong>
                  <span className="badge bg-warning text-dark px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>CLIPBOARD</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.76rem', lineHeight: '1.4' }}>
                  1-click copy directly to clipboard for instantly sharing in Discord, bot channels, or forums.
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm fw-bold px-3 py-1.5 text-nowrap shadow-sm d-flex align-items-center gap-1 ms-auto ms-sm-0"
              style={{
                background: copied ? '#10b981' : '#f59e0b',
                color: copied ? '#ffffff' : '#111827',
                border: copied ? '1px solid #059669' : '1px solid #d97706',
                fontWeight: '700',
                transition: 'all 0.2s ease-in-out',
                cursor: targetRuns.length === 0 ? 'not-allowed' : 'pointer',
              }}
              onClick={handleCopyToClipboard}
              disabled={targetRuns.length === 0}
            >
              <span>{copied ? '✓' : '📋'}</span>
              <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Preview Toggle */}
        <div className="pt-1">
          <Button
            color="link"
            size="sm"
            className="p-0 text-decoration-none small text-muted d-flex align-items-center gap-1"
            onClick={() => setShowPreview(!showPreview)}
          >
            <span>{showPreview ? '▼' : '▶'}</span>
            <span>{showPreview ? 'Hide JSON Preview Snippet' : 'Show JSON Preview Snippet'}</span>
          </Button>

          <Collapse isOpen={showPreview}>
            <div className="mt-2 p-2.5 rounded-3 bg-dark border border-secondary text-light">
              <pre
                className="m-0 text-info small font-monospace"
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  fontSize: '0.72rem',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {previewJson}
              </pre>
            </div>
          </Collapse>
        </div>
      </ModalBody>

      <ModalFooter className="px-4 pt-2 pb-4 border-top-0">
        <Button color="secondary" size="sm" outline onClick={toggle} className="px-3">
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

DatabaseExportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  allRuns: PropTypes.array,
  filteredRuns: PropTypes.array,
  singleRun: PropTypes.object,
};
