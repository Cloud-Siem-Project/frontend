import { useEffect } from "react";
import { normSeverity, sevClass, sevColor, timeAgoISO, clockISO, prettySignal } from "../utils/format";

function Row({ label, value, mono = true }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="kv">
      <span className="kv-k">{label}</span>
      <span className={mono ? "kv-v mono" : "kv-v"}>{value}</span>
    </div>
  );
}

function EventDetail({ event, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!event) return null;
  const d = event.detail || {};
  const signals = Array.isArray(d.signals) ? d.signals : [];
  const geo = d.geo || {};
  const artifact = d.artifact || d.evidence;
  const ports = [d.src_port, d.dst_port].filter(Boolean).join(" → ");

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={sevClass(event.severity)} style={{ color: sevColor(event.severity) }}>
              {normSeverity(event.severity)}
            </span>
            <span className="mono" style={{ fontSize: 13, color: "var(--ink)" }}>
              {event.detail_type || event.source || "event"}
            </span>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="drawer-body">
          <div className="drawer-when mono">
            {timeAgoISO(event.event_time)} · {clockISO(event.event_time)}
          </div>

          <div className="drawer-sec">
            <div className="drawer-sec-t">Event</div>
            <Row label="event_id" value={event.event_id} />
            <Row label="source" value={event.source} />
            <Row label="detail_type" value={event.detail_type} />
            <Row label="severity" value={normSeverity(event.severity)} />
            <Row label="score" value={d.score} />
            <Row label="ingested" value={event.ingested_at} />
          </div>

          {(d.query_name || d.tld || d.entropy != null || d.label_length != null) && (
            <div className="drawer-sec">
              <div className="drawer-sec-t">DNS</div>
              <Row label="query" value={d.query_name} />
              <Row label="tld" value={d.tld} />
              <Row label="entropy" value={d.entropy} />
              <Row label="label_len" value={d.label_length} />
            </div>
          )}

          {(d.src_addr || d.dst_addr || d.blacklisted_ip || d.protocol || ports) && (
            <div className="drawer-sec">
              <div className="drawer-sec-t">Connection</div>
              <Row label="src_addr" value={d.src_addr} />
              <Row label="dst_addr" value={d.dst_addr} />
              <Row label="blacklisted_ip" value={d.blacklisted_ip} />
              <Row label="direction" value={d.direction} />
              <Row label="protocol" value={d.conn_type || d.protocol} />
              <Row label="ports" value={ports} />
              <Row label="intel_source" value={d.intel_source} />
            </div>
          )}

          {/* Geo / ASN — populated once the enrichment phase lands */}
          {(geo.country || geo.city || geo.asn || geo.org) && (
            <div className="drawer-sec">
              <div className="drawer-sec-t">Geo / ASN</div>
              <Row label="country" value={geo.country} mono={false} />
              <Row label="city" value={geo.city} mono={false} />
              <Row label="asn" value={geo.asn} />
              <Row label="org" value={geo.org} mono={false} />
            </div>
          )}

          {/* Captured artifact — populated once evidence capture lands */}
          {artifact && (
            <div className="drawer-sec">
              <div className="drawer-sec-t">Captured artifact</div>
              <Row label="filename" value={artifact.filename || artifact.name} />
              <Row label="sha256" value={artifact.sha256} />
              <Row label="size" value={artifact.size != null ? `${artifact.size} B` : undefined} />
              <Row label="source" value={artifact.source} />
              <Row label="s3" value={artifact.s3_uri} />
              {artifact.url && (
                <a className="btn drawer-dl" href={artifact.url} target="_blank" rel="noreferrer">
                  Download for analysis ↓
                </a>
              )}
            </div>
          )}

          {signals.length > 0 && (
            <div className="drawer-sec">
              <div className="drawer-sec-t">Signals</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {signals.map((s, j) => <span className="chip" key={j}>{prettySignal(s)}</span>)}
              </div>
            </div>
          )}

          <div className="drawer-sec">
            <div className="drawer-sec-t">Raw</div>
            <pre className="cmd-box" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default EventDetail;
