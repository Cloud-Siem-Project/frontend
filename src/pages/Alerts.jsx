import { useEffect, useMemo, useState } from "react";
import ThreatTimeline from "../components/ThreatTimeline";
import EventDetail from "../components/EventDetail";
import { fetchEvents } from "../api";
import { normSeverity, sevClass, sevColor, timeAgoISO, clockISO, prettySignal } from "../utils/format";

const FILTERS = [
  { key: "ALL", label: "All", match: () => true },
  { key: "HIGH", label: "High", match: (s) => s === "HIGH" },
  { key: "MED", label: "Med", match: (s) => s === "MED" },
];

// flatten an event into one searchable lowercase string
function haystack(e) {
  const d = e.detail || {};
  return [
    e.source, e.detail_type, e.severity, e.event_id,
    d.query_name, d.tld, d.src_addr, d.dst_addr, d.blacklisted_ip,
    d.direction, d.protocol, d.conn_type, d.intel_source,
    ...(Array.isArray(d.signals) ? d.signals : []),
  ].filter(Boolean).join(" ").toLowerCase();
}

function Alerts() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchEvents({ limit: 200 });
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
    const q = query.trim().toLowerCase();
    return [...events]
      .sort((a, b) => new Date(b.event_time || 0) - new Date(a.event_time || 0))
      .filter((e) => active.match(normSeverity(e.severity)))
      .filter((e) => !q || haystack(e).includes(q))
      .slice(0, 200);
  }, [events, active, query]);

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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              className="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ip, domain, signal…"
              spellCheck={false}
            />
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
                <tr><td colSpan={6} className="empty">{query ? "No events match your search." : "No events match this filter. Pipeline events appear here in real time."}</td></tr>
              ) : (
                rows.map((e, i) => {
                  const d = e.detail || {};
                  const signals = Array.isArray(d.signals) ? d.signals : [];
                  return (
                    <tr key={e.event_id || i} onClick={() => setSelected(e)} style={{ cursor: "pointer" }}>
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

      <EventDetail event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default Alerts;
