import { useEffect, useState } from "react";
import InfraGraph from "../components/InfraGraph";
import { fetchEvents, fetchNodes } from "../api";

function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const delta = Math.floor((Date.now() - then) / 1000);
  if (delta < 60) return `${delta}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

function severityColor(severity) {
  switch (severity?.toUpperCase()) {
    case "CRITICAL": return "#ef4444";
    case "HIGH": return "#f97316";
    case "MEDIUM": case "MED": return "#eab308";
    case "LOW": return "#22c55e";
    default: return "#64748b";
  }
}

function Alerts() {
  const [events, setEvents] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchEvents();
        if (mounted) setEvents(data);
      } catch { /* API may not be available */ }
      try {
        const nodeData = await fetchNodes();
        const list = typeof nodeData === "object" && !Array.isArray(nodeData)
          ? Object.values(nodeData)
          : Array.isArray(nodeData) ? nodeData : [];
        if (mounted) setNodes(list);
      } catch { /* API may not be available */ }
      if (mounted) setLoading(false);
    }

    load();
    const interval = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <div>
      <h2 style={{ margin: "0 0 16px", color: "#1e293b", fontSize: "20px" }}>
        Infrastructure Graph
      </h2>

      <InfraGraph nodes={nodes} />

      <h3 style={{ margin: "32px 0 12px", color: "#1e293b", fontSize: "16px" }}>
        Event Log
      </h3>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Severity</th>
              <th style={thStyle}>Source</th>
              <th style={thStyle}>Event</th>
              <th style={thStyle}>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={tdStyle}>Loading events...</td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={5} style={tdStyle}>No events recorded yet. Pipeline events will appear here in real time.</td></tr>
            ) : (
              events.slice(0, 50).map((event, i) => (
                <tr key={event.event_id || i} style={i % 2 === 0 ? rowEvenStyle : {}}>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{timeAgo(event.event_time || event.timestamp)}</td>
                  <td style={tdStyle}>
                    <span style={{ ...severityBadge, background: severityColor(event.severity) }}>
                      {event.severity || "info"}
                    </span>
                  </td>
                  <td style={tdStyle}>{event.source || "—"}</td>
                  <td style={tdStyle}>{event.detail_type || event.event_type || "—"}</td>
                  <td style={{ ...tdStyle, maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Ubuntu Mono', monospace", fontSize: "12px" }}>
                    {event.detail?.query_name || event.message || JSON.stringify(event.detail || "").slice(0, 100)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const tableWrapperStyle = {
  background: "white",
  borderRadius: "8px",
  overflow: "auto",
  border: "1px solid #e2e8f0",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
};

const thStyle = {
  textAlign: "left",
  padding: "10px 12px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "8px 12px",
  borderBottom: "1px solid #f1f5f9",
  color: "#334155",
};

const rowEvenStyle = {
  background: "#f8fafc",
};

const severityBadge = {
  padding: "2px 8px",
  borderRadius: "10px",
  color: "white",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
};

export default Alerts;
