import { useEffect, useState } from "react";
import SummaryCard from "../components/SummaryCard";
import { fetchNodes } from "../api";
import { IconNodes } from "../components/icons";
import { timeAgoSecs } from "../utils/format";

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
      <div className="page-head reveal d1">
        <div>
          <div className="eyebrow">Operations / Fleet</div>
          <h1 className="page-title">Worker Nodes</h1>
        </div>
        <span className="faint mono" style={{ fontSize: 11 }}>heartbeat · /api/nodes</span>
      </div>

      <div className="stat-grid cols-3">
        <div className="reveal d1">
          <SummaryCard title="Total Nodes" value={totalNodes} accent="var(--accent)" icon={<IconNodes size={17} />} />
        </div>
        <div className="reveal d2">
          <SummaryCard title="Online" value={onlineNodes} color="var(--ok)" accent="var(--ok)" sub="reporting heartbeat" />
        </div>
        <div className="reveal d3">
          <SummaryCard title="Offline" value={offlineNodes} color={offlineNodes ? "var(--sev-high)" : "var(--ink)"} accent="var(--sev-high)" sub={offlineNodes ? "missed heartbeat" : "none"} />
        </div>
      </div>

      <div className="panel bracket reveal d4" style={{ overflow: "hidden" }}>
        <div className="panel-head">
          <h3>Fleet Status</h3>
          <span className="faint mono" style={{ fontSize: 11 }}>{totalNodes} registered</span>
        </div>
        {loading ? (
          <div className="empty">Establishing link…</div>
        ) : nodes.length === 0 ? (
          <div className="empty">No nodes registered. Workers appear here once they connect to the master.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dtable">
              <thead>
                <tr>
                  <th>Node</th>
                  <th>Status</th>
                  <th>Kernel</th>
                  <th>Worker</th>
                  <th>Last Seen</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => {
                  const up = node.status === "UP";
                  return (
                    <tr key={node.node_id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--ink)" }}>{node.hostname || node.node_id}</div>
                        <div className="mono faint" style={{ fontSize: 11.5, marginTop: 3 }}>{node.ip || "—"}</div>
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 12, color: up ? "var(--ok)" : "var(--down)" }}>
                          <span className={up ? "status-dot" : "status-dot down"} />
                          {node.status || "—"}
                        </span>
                      </td>
                      <td className="t-mono dim">{node.kernel || "—"}</td>
                      <td className="t-mono dim">{node.worker_version || "—"}</td>
                      <td className="t-mono dim">{timeAgoSecs(node.last_heartbeat)}</td>
                      <td className="t-mono faint" style={{ fontSize: 11.5 }}>{node.registered_at || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Nodes;
