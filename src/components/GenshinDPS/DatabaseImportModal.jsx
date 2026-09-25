import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Nav,
  NavItem,
  NavLink,
  FormGroup,
  Label,
  Input,
  Alert,
  Spinner,
  Table,
  Badge,
} from 'reactstrap';
import { useDropzone } from 'react-dropzone';
import { parseImportData } from '../../utils/databaseShareUtils';
import { importDatabaseRuns } from '../../services/api';

export default function DatabaseImportModal({ isOpen, toggle, onImportSuccess }) {
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'paste'
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importMode, setImportMode] = useState('append'); // 'append' | 'replace'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);

  const resetState = () => {
    setActiveTab('file');
    setPastedText('');
    setSelectedFile(null);
    setImportMode('append');
    setError(null);
    setParsedData(null);
    setIsSubmitting(false);
  };

  const handleToggle = () => {
    resetState();
    toggle();
  };

  // Dropzone handling
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const isJson = file.name.endsWith('.json');
      const isCsv = file.name.endsWith('.csv');
      const hint = isJson ? 'json' : isCsv ? 'csv' : 'auto';

      const result = parseImportData(content, hint);
      if (!result.valid) {
        setError(result.error || 'Failed to parse file');
        setParsedData(null);
      } else {
        setParsedData(result);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file from disk');
      setParsedData(null);
    };
    reader.readAsText(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
    multiple: false,
  });

  // Handle live paste input
  const handlePastedTextChange = (e) => {
    const val = e.target.value;
    setPastedText(val);

    if (!val.trim()) {
      setParsedData(null);
      setError(null);
      return;
    }

    const result = parseImportData(val, 'auto');
    if (!result.valid) {
      setError(result.error);
      setParsedData(null);
    } else {
      setError(null);
      setParsedData(result);
    }
  };

  const handlePrettifyJson = () => {
    try {
      const obj = JSON.parse(pastedText);
      setPastedText(JSON.stringify(obj, null, 2));
    } catch {
      // Ignore if not valid JSON
    }
  };

  const handleClear = () => {
    setPastedText('');
    setSelectedFile(null);
    setParsedData(null);
    setError(null);
  };

  const handleConfirmImport = async () => {
    if (!parsedData || !parsedData.runs || parsedData.runs.length === 0) {
      setError('Please provide valid JSON or CSV telemetry data to import.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await importDatabaseRuns(parsedData.runs, importMode);
      if (onImportSuccess) {
        onImportSuccess({
          count: res.importedCount || parsedData.runs.length,
          mode: importMode,
          total: res.totalRuns,
        });
      }
      handleToggle();
    } catch (err) {
      setError(err.message || 'Failed to update database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={handleToggle} size="lg" centered className="modal-dialog-scrollable">
      <ModalHeader toggle={handleToggle} className="px-4 pt-4 pb-2 border-bottom-0">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-4">📥</span>
          <div>
            <h5 className="modal-title fw-bold m-0 text-body-emphasis">Import &amp; Restore Database</h5>
            <small className="text-muted">
              Import combat telemetry archives from another GenshinDPS instance or community files.
            </small>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="px-4 py-3">
        {/* Navigation Tabs */}
        <Nav pills className="mb-3 border-bottom pb-2">
          <NavItem>
            <NavLink
              className={`cursor-pointer fw-bold ${activeTab === 'file' ? 'active' : ''}`}
              onClick={() => setActiveTab('file')}
              style={{ cursor: 'pointer' }}
            >
              📁 Load File Upload
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`cursor-pointer fw-bold ${activeTab === 'paste' ? 'active' : ''}`}
              onClick={() => setActiveTab('paste')}
              style={{ cursor: 'pointer' }}
            >
              📝 Paste Here (Direct JSON)
            </NavLink>
          </NavItem>
        </Nav>

        {error && (
          <Alert color="danger" className="py-2 px-3 mb-3 small d-flex align-items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </Alert>
        )}

        {/* Tab 1: File Upload */}
        {activeTab === 'file' && (
          <div className="mb-2">
            <div
              {...getRootProps()}
              className={`p-3 text-center border-2 border-dashed rounded-3 cursor-pointer transition-all ${
                isDragActive ? 'border-primary bg-primary-subtle' : 'border-secondary bg-body-tertiary'
              }`}
              style={{ cursor: 'pointer' }}
            >
              <input {...getInputProps()} />
              <div className="fs-3 mb-1">📄</div>
              {selectedFile ? (
                <div>
                  <h6 className="fw-bold text-success mb-1">✓ File Loaded: {selectedFile.name}</h6>
                  <small className="text-muted">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop another file to replace
                  </small>
                </div>
              ) : isDragActive ? (
                <h6 className="fw-bold text-primary m-0">Drop database file here to inspect...</h6>
              ) : (
                <div>
                  <h6 className="fw-bold text-body-emphasis mb-1">Drag &amp; Drop Telemetry Archive File</h6>
                  <p className="text-muted small mb-2">
                    Accepts <code>.json</code> (GenshinDPS Full Archive / Single Run) or <code>.csv</code> (Runs Overview)
                  </p>
                  <Button color="secondary" size="sm" outline>
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Paste Here Area */}
        {activeTab === 'paste' && (
          <div className="mb-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <Label className="small fw-bold text-muted m-0">
                Paste JSON-Formatted Text (Array of runs or standard bundle):
              </Label>
              <div className="d-flex gap-1">
                {pastedText && (
                  <>
                    <Button color="link" size="sm" className="p-0 text-decoration-none small me-2" onClick={handlePrettifyJson}>
                      Format JSON
                    </Button>
                    <Button color="link" size="sm" className="p-0 text-danger text-decoration-none small" onClick={handleClear}>
                      Clear
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Input
              type="textarea"
              rows={4}
              placeholder={`Paste JSON here... Example:\n[\n  {\n    "teamName": "Zibai Premium",\n    "dps": 584326,\n    "testPreset": "Stygian Dire",\n    "characters": [...]\n  }\n]`}
              value={pastedText}
              onChange={handlePastedTextChange}
              className="font-monospace small bg-body-tertiary"
              style={{ fontSize: '0.8rem', resize: 'vertical' }}
            />
          </div>
        )}

        {/* Live Validation & Preview */}
        {parsedData && (
          <div className="p-3 rounded bg-body-secondary border mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <Badge color="success" className="px-2 py-1">
                  ✓ Valid Data
                </Badge>
                <span className="fw-bold small text-body-emphasis">
                  {parsedData.runCount} {parsedData.runCount === 1 ? 'Run' : 'Runs'} ready to import
                </span>
                <span className="badge bg-secondary text-uppercase">{parsedData.format}</span>
              </div>
              {parsedData.metadata?.app && (
                <small className="text-muted">
                  Source: {parsedData.metadata.app} v{parsedData.metadata.schemaVersion}
                </small>
              )}
            </div>

            {/* Quick Preview Table */}
            <div className="table-responsive" style={{ maxHeight: '160px' }}>
              <Table size="sm" hover className="m-0 small">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Preset</th>
                    <th>DPS</th>
                    <th>Party</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.runs.slice(0, 5).map((r, i) => (
                    <tr key={r.id || i}>
                      <td className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
                        {r.teamName}
                      </td>
                      <td>{r.testPreset}</td>
                      <td className="text-success fw-bold">{(r.dps || 0).toLocaleString()}</td>
                      <td className="text-muted text-truncate" style={{ maxWidth: '180px' }}>
                        {(r.characters || []).map((c) => c.name).join(', ') || 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {parsedData.runs.length > 5 && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted font-italic">
                        ...and {parsedData.runs.length - 5} more runs
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* Database Update Strategy */}
        <div className="p-3 rounded border bg-body-tertiary">
          <Label className="fw-bold small text-body-emphasis mb-2 d-block">
            Database Update Strategy:
          </Label>
          <div className="d-flex flex-column gap-2">
            <FormGroup check className="m-0">
              <Input
                name="importMode"
                type="radio"
                id="mode-append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
              />
              <Label check for="mode-append" className="small">
                <strong>Append &amp; Merge (Recommended)</strong> — Add incoming runs to your existing archive. Conflicting IDs will automatically receive fresh unique identifiers.
              </Label>
            </FormGroup>

            <FormGroup check className="m-0">
              <Input
                name="importMode"
                type="radio"
                id="mode-replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
              />
              <Label check for="mode-replace" className="small text-danger">
                <strong>Replace Entire Database</strong> — Wipe existing local runs and restore exclusively with this imported dataset.
              </Label>
            </FormGroup>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="px-4 pt-2 pb-4 border-top-0">
        <Button color="secondary" outline onClick={handleToggle} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          color={importMode === 'replace' ? 'danger' : 'primary'}
          className="fw-bold shadow-sm d-flex align-items-center gap-2"
          onClick={handleConfirmImport}
          disabled={!parsedData || parsedData.runCount === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" />
              <span>Updating Database...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Update Database</span>
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

DatabaseImportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onImportSuccess: PropTypes.func,
};
