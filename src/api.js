const BASE = "";

export async function fetchNodes() {
  const res = await fetch(`${BASE}/api/nodes`);
  if (!res.ok) throw new Error(`Failed to fetch nodes: ${res.status}`);
  return res.json();
}

export async function deregisterNode(nodeId) {
  const res = await fetch(`${BASE}/api/nodes/${encodeURIComponent(nodeId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Deregister failed: ${res.status}`);
  return res.json().catch(() => ({}));
}

export async function fetchEvents({ limit = 200 } = {}) {
  const res = await fetch(`${BASE}/api/events?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.events || [];
}

export async function fetchPipeline() {
  const res = await fetch(`${BASE}/api/pipeline`);
  if (!res.ok) throw new Error(`Failed to fetch pipeline: ${res.status}`);
  return res.json();
}
