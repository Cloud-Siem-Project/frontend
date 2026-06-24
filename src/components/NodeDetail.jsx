import { useEffect } from "react";
import { timeAgoSecs } from "../utils/format";

function Row({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="kv">
      <span className="kv-k">{label}</span>
      <span className="kv-v mono">{value}</span>
    </div>
  );
}

function Gauge({ label, pct, sub }) {
  if (pct == null) return null;
  const color = pct >= 85 ? "var(--sev-high)" : pct >= 60 ? "var(--sev-med)" : "var(--sev-low)";
  return (
    <div className="gauge">
      <div className="gauge-top">
        <span>{label}</span>
        <span className="mono" style={{ color }}>{pct}%</span>
      </div>
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
      {sub && <div className="gauge-sub mono">{sub}</div>}
    </div>
  );
}

function NodeDetail({ node, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!node) return null;
  const m = node.metrics || {};
  const up = node.status === "UP";
  const ports = Array.isArray(node.ports) ? node.ports : [];
  const load = Array.isArray(m.load) ? m.load.join(" / ") : undefined;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={up ? "status-dot" : "status-dot down"} />
            <span className="mono" style={{ fontSize: 13, color: "var(--ink)" }}>
              {node.hostname || node.node_id}
            </span>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="drawer-body">
          <div className="drawer-when mono">
            {node.status} · last seen {timeAgoSecs(node.last_heartbeat)}
          </div>

          <div className="drawer-sec">
            <div className="drawer-sec-t">Resources</div>
            <Gauge label="CPU" pct={m.cpu_percent} sub={load ? `load ${load}` : undefined} />
            <Gauge
              label="Memory"
              pct={m.mem_percent}
              sub={m.mem_used_mb != null ? `${m.mem_used_mb} / ${m.mem_total_mb} MB` : undefined}
            />
            <Gauge label="Disk" pct={m.disk_percent} />
            {(m.net_rx_kbps != null || m.net_tx_kbps != null) && (
              <div className="kv" style={{ marginTop: 10 }}>
                <span className="kv-k">network</span>
                <span className="kv-v mono">↓ {m.net_rx_kbps ?? 0} kbps · ↑ {m.net_tx_kbps ?? 0} kbps</span>
              </div>
            )}
            {Object.keys(m).length === 0 && (
              <div className="faint mono" style={{ fontSize: 11.5 }}>
                No metrics yet — agent v0.2+ reports CPU/RAM/net on heartbeat.
              </div>
            )}
          </div>

          <div className="drawer-sec">
            <div className="drawer-sec-t">System</div>
            <Row label="node_id" value={node.node_id} />
            <Row label="ip" value={node.ip} />
            <Row label="kernel" value={node.kernel} />
            <Row label="worker" value={node.worker_version} />
            <Row label="registered" value={node.registered_at} />
          </div>

          <div className="drawer-sec">
            <div className="drawer-sec-t">Listening ports ({ports.length})</div>
            {ports.length === 0 ? (
              <div className="faint mono" style={{ fontSize: 11.5 }}>none reported</div>
            ) : (
              ports.map((p, i) => (
                <div className="kv" key={i}>
                  <span className="kv-k">:{p.port}</span>
                  <span className="kv-v mono">{p.proto} · {p.process || "—"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default NodeDetail;
