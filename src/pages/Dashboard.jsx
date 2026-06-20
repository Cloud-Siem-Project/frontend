import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SummaryCard from "../components/SummaryCard";
import { fetchNodes, fetchEvents } from "../api";
import { IconNodes, IconAlert, IconPulse, IconShield } from "../components/icons";
import { normSeverity, sevClass, sevColor, timeAgoISO } from "../utils/format";

function Dashboard() {
  const [nodes, setNodes] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchNodes();
        const list = typeof data === "object" && !Array.isArray(data)
          ? Object.values(data)
          : Array.isArray(data) ? data : [];
        if (mounted) setNodes(list);
      } catch { /* API may be unreachable */ }
      try {
        const evts = await fetchEvents();
        if (mounted) setEvents(evts);
      } catch { /* API may be unreachable */ }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const totalNodes = nodes.length;
  const onlineNodes = nodes.filter((n) => n.status === "UP").length;
  const offlineNodes = totalNodes - onlineNodes;

  const counts = { HIGH: 0, MED: 0, LOW: 0, INFO: 0 };
  for (const e of events) counts[normSeverity(e.severity)]++;
  const activeAlerts = counts.HIGH;
  const maxCount = Math.max(1, counts.HIGH, counts.MED, counts.LOW, counts.INFO);

  const dist = [
    { key: "HIGH", label: "High", color: "var(--sev-high)" },
    { key: "MED", label: "Med", color: "var(--sev-med)" },
    { key: "LOW", label: "Low", color: "var(--sev-low)" },
    { key: "INFO", label: "Info", color: "var(--ink-dim)" },
  ];

  const recent = [...events]
    .sort((a, b) => new Date(b.event_time || 0) - new Date(a.event_time || 0))
    .slice(0, 6);

  return (
    <div>
      <div className="page-head reveal d1">
        <div>
          <div className="eyebrow">Operations / Overview</div>
          <h1 className="page-title">Threat Overview</h1>
        </div>
        <div className="faint mono" style={{ fontSize: 11 }}>
          auto-refresh · 10s
        </div>
      </div>

      <div className="stat-grid cols-4">
        <div className="reveal d1">
          <SummaryCard
            title="Active Threats"
            value={activeAlerts}
            color={activeAlerts ? "var(--sev-high)" : "var(--ink)"}
            accent="var(--sev-high)"
            sub="high-severity, open"
            icon={<IconAlert size={17} />}
          />
        </div>
        <div className="reveal d2">
          <SummaryCard
            title="Events Scored"
            value={events.length}
            accent="var(--accent)"
            sub="in current window"
            icon={<IconPulse size={17} />}
          />
        </div>
        <div className="reveal d3">
          <SummaryCard
            title="Nodes Online"
            value={`${onlineNodes}/${totalNodes}`}
            color="var(--ok)"
            accent="var(--ok)"
            sub={offlineNodes ? `${offlineNodes} offline` : "all reporting"}
            icon={<IconNodes size={17} />}
          />
        </div>
        <div className="reveal d4">
          <SummaryCard
            title="Pipeline"
            value="ARMED"
            color="var(--accent)"
            accent="var(--accent)"
            sub="detect → score → respond"
            icon={<IconShield size={17} />}
          />
        </div>
      </div>

      <div className="grid-2">
        {/* severity distribution */}
        <div className="panel bracket reveal d4" style={{ position: "relative", overflow: "hidden" }}>
          <span className="sweep" />
          <div className="panel-head">
            <h3>Severity Distribution</h3>
            <span className="faint mono" style={{ fontSize: 11 }}>{events.length} events</span>
          </div>
          <div style={{ padding: "10px 0 14px" }}>
            {dist.map((d) => (
              <div className="dist-row" key={d.key}>
                <span className={sevClass(d.key)} style={{ justifyContent: "center" }}>{d.label}</span>
                <div className="dist-track">
                  <div
                    className="dist-fill"
                    style={{
                      width: `${(counts[d.key] / maxCount) * 100}%`,
                      background: d.color,
                      boxShadow: `0 0 10px ${d.color}`,
                    }}
                  />
                </div>
                <span className="dist-count" style={{ color: d.color }}>{counts[d.key]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* recent alerts */}
        <div className="panel bracket reveal d5">
          <div className="panel-head">
            <h3>Recent Activity</h3>
            <Link to="/alerts" className="faint mono" style={{ fontSize: 11 }}>view all →</Link>
          </div>
          <div className="split-list">
            {recent.length === 0 ? (
              <div className="empty">No events recorded yet.</div>
            ) : (
              recent.map((e, i) => (
                <div className="list-row" key={e.event_id || i}>
                  <div style={{ minWidth: 0 }}>
                    <div
                      className="t-mono"
                      style={{ color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {e.detail?.query_name || e.detail_type || e.source || "event"}
                    </div>
                    <div className="faint mono" style={{ fontSize: 10.5, marginTop: 3 }}>
                      {timeAgoISO(e.event_time)}
                    </div>
                  </div>
                  <span className={sevClass(e.severity)} style={{ color: sevColor(e.severity) }}>
                    {normSeverity(e.severity)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
