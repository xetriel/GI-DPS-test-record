import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Card, CardBody, Spinner, Alert, Row, Col } from 'reactstrap';
import { scanScreenshot, commitRun } from '../../services/api';
import VerificationModal from '../../components/GenshinDPS/VerificationModal';

export default function UploadPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [scanImageUrl, setScanImageUrl] = useState('');
  const [scanEngine, setScanEngine] = useState('tesseract-ocr');
  const [rawTextSnippet, setRawTextSnippet] = useState('');
  const [scanStatusText, setScanStatusText] = useState('');

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles?.[0];
    if (!file) return;

    try {
      setIsScanning(true);
      setScanStatusText('Analyzing screenshot pixels with Tesseract OCR engine...');
      setError(null);
      const res = await scanScreenshot(file, false);
      setExtractedData(res.data);
      setScanImageUrl(res.imageUrl);
      setScanEngine(res.engine || 'tesseract-ocr');
      setRawTextSnippet(res.rawTextSnippet || '');
      setIsModalOpen(true);
    } catch (err) {
      setError('Vision scan failed: ' + err.message);
    } finally {
      setIsScanning(false);
      setScanStatusText('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
  });

  const handleScanSample = async () => {
    try {
      setIsScanning(true);
      setScanStatusText('Loading benchmark Abyss 12 sample run...');
      setError(null);
      const res = await scanScreenshot(null, true);
      setExtractedData(res.data);
      setScanImageUrl(res.imageUrl);
      setScanEngine(res.engine || 'reference-sample');
      setRawTextSnippet(res.rawTextSnippet || '');
      setIsModalOpen(true);
    } catch (err) {
      setError('Sample scan failed: ' + err.message);
    } finally {
      setIsScanning(false);
      setScanStatusText('');
    }
  };

  const handleCommit = async (validatedData, imageUrl) => {
    try {
      setIsCommitting(true);
      await commitRun(validatedData, imageUrl, '7.0');
      setIsModalOpen(false);
      setSuccessMessage('Run confirmed and successfully written to MySQL database archive!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      alert('Commit failed: ' + err.message);
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4" style={{ maxWidth: '1000px' }}>
      <div className="mb-4 text-center">
        <h3 className="fw-bold text-body-emphasis">Screenshot Ingestion & Vision Parser</h3>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Upload raw Genshin Impact damage meter test dummy screenshots. The multimodal vision engine will parse all variables and present them for human verification before persisting to MySQL.
        </p>
      </div>

      {successMessage && (
        <Alert color="success" className="shadow-sm mb-4">
          ✓ {successMessage}
        </Alert>
      )}

      {error && (
        <Alert color="danger" className="shadow-sm mb-4">
          ⚠️ {error}
        </Alert>
      )}

      {/* Drag & Drop Zone */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
        <CardBody className="p-4 p-md-5">
          <div
            {...getRootProps()}
            className={`p-5 text-center border-2 border-dashed rounded-3 cursor-pointer transition-all ${
              isDragActive ? 'border-primary bg-primary-subtle' : 'border-secondary bg-body-tertiary'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <input {...getInputProps()} />
            <div className="fs-1 mb-3">🖼️</div>
            {isScanning ? (
              <div>
                <Spinner color="primary" />
                <div className="fw-bold mt-2">{scanStatusText || 'OCR / Vision Engine Extracting Telemetry...'}</div>
                <small className="text-muted">Extracting combat summary, test preset, rotations, and stats from image</small>
              </div>
            ) : isDragActive ? (
              <h5 className="fw-bold text-primary">Drop screenshot to scan combat telemetry...</h5>
            ) : (
              <div>
                <h5 className="fw-bold text-body-emphasis">Drag & Drop Test Screenshot Here</h5>
                <p className="text-muted small mb-3">Supports PNG, JPG, JPEG, WEBP from DPS Test Dummy++</p>
                <Button color="primary" className="fw-bold shadow-sm px-4">
                  Browse File
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Sample Reference Card */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
        <CardBody className="p-4">
          <Row className="align-items-center">
            <Col md={3} className="text-center mb-3 mb-md-0">
              <img
                src="/sample-runs/sample-dps-run.png"
                alt="Sample Run Screenshot"
                className="img-fluid rounded border shadow-sm"
                style={{ maxHeight: '120px' }}
              />
            </Col>
            <Col md={6} className="mb-3 mb-md-0">
              <div className="badge bg-warning text-dark fw-bold mb-1">Abyss 12 Reference Run</div>
              <h5 className="fw-bold m-0 text-body-emphasis">Test Dummy++ (Varesa & Mavuika)</h5>
              <p className="text-muted small m-0 mt-1">
                143,554 DPS | 115.83s | Mitachurl Lv. 100. Test the end-to-end extraction and review pipeline using the user-provided sample screenshot.
              </p>
            </Col>
            <Col md={3} className="text-md-end">
              <Button
                color="warning"
                className="fw-bold shadow-sm px-3"
                onClick={handleScanSample}
                disabled={isScanning}
              >
                {isScanning ? <Spinner size="sm" /> : '⚡ Test With Sample'}
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Ingestion Pipeline Architecture Steps */}
      <div className="row g-3 text-center">
        <div className="col-6 col-md-3">
          <div className="p-3 card shadow-sm border h-100">
            <div className="fw-bold text-primary mb-1">1. Ingestion</div>
            <div className="text-muted small">Raw screenshot uploaded as multipart/form-data</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 card shadow-sm border h-100">
            <div className="fw-bold text-primary mb-1">2. Vision LLM</div>
            <div className="text-muted small">Gemini / GPT-4o-mini structured JSON Schema</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 card shadow-sm border h-100">
            <div className="fw-bold text-primary mb-1">3. Human Review</div>
            <div className="text-muted small">Side-by-side verification and math audit checks</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 card shadow-sm border h-100">
            <div className="fw-bold text-primary mb-1">4. MySQL Archive</div>
            <div className="text-muted small">Prisma transactional relational persistence</div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(false)}
        initialData={extractedData}
        imageUrl={scanImageUrl}
        onCommit={handleCommit}
        isSubmitting={isCommitting}
        engine={scanEngine}
        rawTextSnippet={rawTextSnippet}
      />
    </div>
  );
}
