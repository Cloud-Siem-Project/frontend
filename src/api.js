const BASE = "";

export async function fetchNodes() {
  const res = await fetch(`${BASE}/api/nodes`);
  if (!res.ok) throw new Error(`Failed to fetch nodes: ${res.status}`);
  return res.json();
}

export async function fetchEvents() {
  const res = await fetch(`${BASE}/api/events`);
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.events || [];
}

export async function fetchPipeline() {
  const res = await fetch(`${BASE}/api/pipeline`);
  if (!res.ok) throw new Error(`Failed to fetch pipeline: ${res.status}`);
  return res.json();
}
