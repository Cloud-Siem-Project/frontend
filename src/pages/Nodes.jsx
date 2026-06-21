import { useCallback, useEffect, useState } from "react";
import SummaryCard from "../components/SummaryCard";
import { fetchNodes, deregisterNode } from "../api";
import { IconNodes } from "../components/icons";
import { timeAgoSecs } from "../utils/format";

function buildCommand(master, name) {
  const node = name.trim() || "node-01";
  return [
    `curl -sSL ${master}/api/worker.py -o /tmp/centinel-agent.py`,
    `sudo nohup python3 /tmp/centinel-agent.py \\`,
    `  --master ${master} --node-id ${node} --interval 20 \\`,
    `  >/var/log/centinel-agent.log 2>&1 &`,
  ].join("\n");
}

function Nodes() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // register panel
  const [showReg, setShowReg] = useState(false);
  const [nodeName, setNodeName] = useState("node-01");
  const [copied, setCopied] = useState(false);

  // per-node deregister state
  const [busy, setBusy] = useState(null); // node_id being removed
  const [error, setError] = useState("");

  const master = typeof window !== "undefined" ? window.location.origin : "";
  const command = buildCommand(master, nodeName);

  const load = useCallback(async () => {
    try {
      const data = await fetchNodes();
      const list =
        typeof data === "object" && !Array.isArray(data)
          ? Object.values(data)
          : Array.isArray(data) ? data : [];
      setNodes(list);
    } catch {
      // API may not be reachable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn't copy to clipboard — select and copy manually.");
    }
  }

  async function handleDeregister(id) {
    if (!window.confirm(`Deregister "${id}"? It will disappear until it re-registers.`)) return;
    setError("");
    setBusy(id);
    try {
      await deregisterNode(id);
      setNodes((ns) => ns.filter((n) => n.node_id !== id));
    } catch (e) {
      setError(`Could not deregister ${id}: ${e.message}`);
    } finally {
      setBusy(null);
    }
  }

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
        <button
          className={showReg ? "btn" : "btn btn-accent"}
          onClick={() => setShowReg((v) => !v)}
        >
          {showReg ? "Close" : "+ Register node"}
        </button>
      </div>

      {showReg && (
        <div className="panel bracket reg-panel reveal d1">
          <div className="panel-head">
            <h3>Register a node</h3>
            <span className="faint mono" style={{ fontSize: 11 }}>run on the target EC2 / VM</span>
          </div>
          <div className="reg-body">
            <label className="field-label">Node name</label>
            <input
              className="field reg-name"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="node-01"
              spellCheck={false}
            />
            <div className="reg-cmd-head">
              <span className="faint mono" style={{ fontSize: 11 }}>install command</span>
              <button className="btn reg-copy" onClick={copyCommand}>
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <pre className="cmd-box">{command}</pre>
            <p className="reg-hint mono">
              The agent registers over HTTPS to this console, then heartbeats every 20s. It will
              show up below within a few seconds.
            </p>
          </div>
        </div>
      )}

      {error && <div className="login-error mono" style={{ marginBottom: 16 }}>⚠ {error}</div>}

      <div className="stat-grid cols-3">
        <div className="reveal d1">
          <SummaryCard title="Total Nodes" value={totalNodes} accent="var(--accent)" sub="registered fleet" icon={<IconNodes size={17} />} />
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
          <div className="empty">No nodes registered. Use “Register node” to add one.</div>
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
                  <th style={{ textAlign: "right" }}>Action</th>
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
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn btn-danger reg-drop"
                          disabled={busy === node.node_id}
                          onClick={() => handleDeregister(node.node_id)}
                        >
                          {busy === node.node_id ? "Removing…" : "Deregister"}
                        </button>
                      </td>
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
