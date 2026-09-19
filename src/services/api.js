const BASE_URL = '/api/telemetry';

export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function fetchRuns(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const res = await fetch(`${BASE_URL}/runs?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch runs (${res.status})`);
  }
  return await res.json();
}

export async function fetchRunById(id) {
  const res = await fetch(`${BASE_URL}/runs/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch run details (${res.status})`);
  }
  return await res.json();
}

export async function fetchConfig() {
  try {
    const res = await fetch(`${BASE_URL}/config`);
    return await res.json();
  } catch (err) {
    return { hasGeminiKey: false, hasOpenAiKey: false, error: err.message };
  }
}

export async function saveConfig({ geminiKey, openaiKey }) {
  const res = await fetch(`${BASE_URL}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ geminiKey, openaiKey }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Save config failed (${res.status})`);
  }
  return await res.json();
}

export async function scanScreenshot(file, useSample = false, customApiKey = null) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  if (useSample) {
    formData.append('sample', 'true');
  }
  if (customApiKey) {
    formData.append('apiKey', customApiKey);
  }

  const headers = {};
  if (customApiKey) {
    headers['x-gemini-key'] = customApiKey;
  }

  const res = await fetch(`${BASE_URL}/scan`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Scan failed (${res.status})`);
  }
  return await res.json();
}

export async function commitRun(telemetry, imageUrl, gameVersion = '7.0') {
  const res = await fetch(`${BASE_URL}/commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telemetry, imageUrl, gameVersion }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Commit failed (${res.status})`);
  }
  return await res.json();
}

export async function deleteRun(id) {
  const res = await fetch(`${BASE_URL}/runs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete run (${res.status})`);
  }
  return await res.json();
}
