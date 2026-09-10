export const API_BASE = '/api';

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const resp = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!resp.ok) {
    const errorData = await resp.json();
    throw new Error(errorData.detail || 'Upload failed');
  }
  return await resp.json();
}

export async function fetchSources() {
  const resp = await fetch(`${API_BASE}/sources`);
  return await resp.json();
}

export async function clearSources() {
  const resp = await fetch(`${API_BASE}/sources`, { method: 'DELETE' });
  return await resp.json();
}

export async function generateBriefing(topic, context = "") {
  const resp = await fetch(`${API_BASE}/notebooklm/briefing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, context })
  });
  return await resp.json();
}

export async function generateMindmap(topic) {
  const resp = await fetch(`${API_BASE}/notebooklm/mindmap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic })
  });
  return await resp.json();
}

export async function downloadProjectZip(files, projectName = "generated_project") {
  const resp = await fetch(`${API_BASE}/export-project-zip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files, project_name: projectName })
  });
  const blob = await resp.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}.zip`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function downloadCompleteAppZip() {
  window.open(`${API_BASE}/download-app-zip`, '_blank');
}
