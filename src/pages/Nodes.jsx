import { useEffect, useState } from "react";
import SummaryCard from "../components/SummaryCard";
import { fetchNodes } from "../api";

function timeAgo(ts) {
  if (!ts) return "—";
  const delta = Math.floor(Date.now() / 1000 - ts);
  if (delta < 60) return `${delta}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

function Nodes() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchNodes();
        const list = typeof data === "object" && !Array.isArray(data)
          ? Object.values(data)
          : Array.isArray(data) ? data : [];
        if (mounted) setNodes(list);
      } catch {
        // API may not be reachable
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const totalNodes = nodes.length;
  const onlineNodes = nodes.filter((n) => n.status === "UP").length;
  const offlineNodes = totalNodes - onlineNodes;

  return (
    <div>
      <h1 style={{ marginBottom: "24px" }}>Nodes</h1>

      <div style={summaryCardsWrapperStyle}>
        <SummaryCard title="Total Nodes" value={totalNodes} />
        <SummaryCard title="Nodes Online" value={onlineNodes} color="#16a34a" />
        <SummaryCard title="Nodes Offline" value={offlineNodes} color="#dc2626" />
      </div>

      <div style={tableCardStyle}>
        {loading ? (
          <div style={{ padding: "24px", color: "#64748b" }}>Loading...</div>
        ) : nodes.length === 0 ? (
          <div style={{ padding: "24px", color: "#64748b" }}>
            No nodes registered. Workers will appear here once they connect to the master.
          </div>
        ) : (
          <>
            <div style={headerRowStyle}>
              <div>Node</div>
              <div>Status</div>
              <div>Kernel</div>
              <div>Worker Version</div>
              <div>Last Seen</div>
              <div>Registered</div>
            </div>
            {nodes.map((node) => (
              <div key={node.node_id} style={dataRowStyle}>
                <div>
                  <div style={{ fontWeight: "600" }}>{node.hostname}</div>
                  <div style={{ color: "#64748b", marginTop: "4px", fontSize: "12px" }}>{node.ip}</div>
                </div>
                <div
                  style={{
                    color: node.status === "UP" ? "#16a34a" : "#dc2626",
                    fontWeight: "500",
                  }}
                >
                  {node.status}
                </div>
                <div style={{ color: "#64748b", fontSize: "13px" }}>{node.kernel || "—"}</div>
                <div style={{ color: "#64748b", fontSize: "13px" }}>{node.worker_version || "—"}</div>
                <div style={{ color: "#64748b" }}>{timeAgo(node.last_heartbeat)}</div>
                <div style={{ color: "#64748b", fontSize: "12px" }}>{node.registered_at || "—"}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

const tableCardStyle = {
  background: "white",
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  marginTop: "24px",
};

const headerRowStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1.5fr 1.2fr 1.2fr 1.5fr",
  padding: "20px 24px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  fontWeight: "700",
};

const dataRowStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1.5fr 1.2fr 1.2fr 1.5fr",
  padding: "20px 24px",
  borderBottom: "1px solid #e2e8f0",
  alignItems: "center",
};

const summaryCardsWrapperStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px",
};

export default Nodes;
