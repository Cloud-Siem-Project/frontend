import { useEffect, useMemo, useState } from "react";
import ThreatTimeline from "../components/ThreatTimeline";
import { fetchEvents } from "../api";
import { normSeverity, sevClass, sevColor, timeAgoISO, clockISO, prettySignal } from "../utils/format";

const FILTERS = [
  { key: "ALL", label: "All", match: () => true },
  { key: "HIGH", label: "High", match: (s) => s === "HIGH" },
  { key: "MED", label: "Med", match: (s) => s === "MED" },
];

function Alerts() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchEvents();
        if (mounted) setEvents(data);
      } catch { /* API may not be available */ }
      if (mounted) setLoading(false);
    }
    load();
    const interval = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const active = FILTERS.find((f) => f.key === filter) || FILTERS[0];

  const rows = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(b.event_time || 0) - new Date(a.event_time || 0))
      .filter((e) => active.match(normSeverity(e.severity)))
      .slice(0, 80);
  }, [events, active]);

  return (
    <div>
      <div className="page-head reveal d1">
        <div>
          <div className="eyebrow">Operations / Detection</div>
          <h1 className="page-title">Alerts</h1>
        </div>
        <span className="faint mono" style={{ fontSize: 11 }}>r53 qlog → score → respond</span>
      </div>

      {/* threat activity over time */}
      <div className="reveal d2" style={{ marginBottom: 18 }}>
        <ThreatTimeline events={events} />
      </div>

      {/* event log */}
      <div className="panel bracket reveal d3" style={{ overflow: "hidden" }}>
        <div className="panel-head">
          <h3>Threat Event Log</h3>
          <div className="seg">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={filter === f.key ? "on" : ""}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="dtable">
            <thead>
              <tr>
                <th>Time</th>
                <th>Severity</th>
                <th>Query / Source</th>
                <th>Src IP</th>
                <th style={{ textAlign: "center" }}>Score</th>
                <th>Signals</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="empty">Loading events…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="empty">No events match this filter. Pipeline events appear here in real time.</td></tr>
              ) : (
                rows.map((e, i) => {
                  const d = e.detail || {};
                  const signals = Array.isArray(d.signals) ? d.signals : [];
                  return (
                    <tr key={e.event_id || i}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <div className="t-mono" style={{ color: "var(--ink)" }}>{timeAgoISO(e.event_time)}</div>
                        <div className="faint mono" style={{ fontSize: 10, marginTop: 2 }}>{clockISO(e.event_time)}</div>
                      </td>
                      <td>
                        <span className={sevClass(e.severity)} style={{ color: sevColor(e.severity) }}>
                          {normSeverity(e.severity)}
                        </span>
                      </td>
                      <td style={{ maxWidth: 320 }}>
                        <div
                          className="t-mono"
                          style={{ color: "var(--accent)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          title={d.query_name || ""}
                        >
                          {d.query_name || e.detail_type || "—"}
                        </div>
                        <div className="faint mono" style={{ fontSize: 10.5, marginTop: 2 }}>
                          {e.source || "—"}
                        </div>
                      </td>
                      <td className="t-mono dim">{d.src_addr || "—"}</td>
                      <td style={{ textAlign: "center" }}>
                        {d.score != null ? (
                          <span
                            className="t-mono"
                            style={{ fontWeight: 600, color: sevColor(e.severity), fontSize: 14 }}
                          >
                            {d.score}
                          </span>
                        ) : <span className="faint">—</span>}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", maxWidth: 280 }}>
                          {signals.length
                            ? signals.slice(0, 4).map((s, j) => <span className="chip" key={j}>{prettySignal(s)}</span>)
                            : <span className="faint">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Alerts;
