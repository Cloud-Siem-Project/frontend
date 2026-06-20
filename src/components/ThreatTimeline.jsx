import { useMemo } from "react";
import { normSeverity } from "../utils/format";

const CHART_H = 150; // px
const N = 24; // buckets

const SEGMENTS = [
  { key: "LOW", color: "var(--sev-low)" },
  { key: "MED", color: "var(--sev-med)" },
  { key: "HIGH", color: "var(--sev-high)" },
];

function fmt(ms) {
  // UTC HH:MM, matching the rest of the console
  return new Date(ms).toISOString().slice(11, 16);
}

function build(events) {
  const times = [];
  for (const e of events) {
    const t = new Date(e.event_time || 0).getTime();
    if (!Number.isNaN(t) && t > 0) times.push(t);
  }
  if (!times.length) return null;

  const end = Date.now();
  let start = Math.min(...times);
  // guarantee a sensible minimum span so a single burst doesn't render one fat bar
  const minSpan = N * 60 * 1000; // N minutes
  if (end - start < minSpan) start = end - minSpan;
  const size = (end - start) / N;

  const buckets = Array.from({ length: N }, () => ({ HIGH: 0, MED: 0, LOW: 0, INFO: 0, total: 0 }));
  for (const e of events) {
    const t = new Date(e.event_time || 0).getTime();
    if (Number.isNaN(t) || t <= 0) continue;
    let i = Math.floor((t - start) / size);
    if (i < 0) i = 0;
    if (i >= N) i = N - 1;
    const sev = normSeverity(e.severity);
    buckets[i][sev] += 1;
    buckets[i].total += 1;
  }
  const max = Math.max(1, ...buckets.map((b) => b.total));
  return { buckets, start, end, size, max };
}

function ThreatTimeline({ events }) {
  const data = useMemo(() => build(events), [events]);

  return (
    <div className="panel bracket" style={{ overflow: "hidden" }}>
      <div className="panel-head">
        <h3>Threat Activity</h3>
        <div className="tl-legend">
          {SEGMENTS.slice().reverse().map((s) => (
            <span key={s.key} className="tl-key">
              <span className="tl-swatch" style={{ background: s.color }} />
              {s.key === "MED" ? "Med" : s.key.charAt(0) + s.key.slice(1).toLowerCase()}
            </span>
          ))}
        </div>
      </div>

      {!data ? (
        <div className="empty">No events yet — activity will chart here in real time.</div>
      ) : (
        <div className="tl-wrap">
          <div className="tl-bars" style={{ height: CHART_H }}>
            {data.buckets.map((b, i) => {
              const bStart = data.start + i * data.size;
              const bEnd = bStart + data.size;
              const title =
                b.total === 0
                  ? `${fmt(bStart)}–${fmt(bEnd)} · no events`
                  : `${fmt(bStart)}–${fmt(bEnd)} · ${b.HIGH} high, ${b.MED} med, ${b.LOW} low`;
              return (
                <div className="tl-col" key={i} title={title}>
                  {SEGMENTS.map((s) => {
                    const c = b[s.key];
                    if (!c) return null;
                    const h = Math.max(3, (c / data.max) * CHART_H);
                    return <div key={s.key} className="tl-seg" style={{ height: h, background: s.color }} />;
                  })}
                </div>
              );
            })}
          </div>
          <div className="tl-axis">
            <span>{fmt(data.start)}</span>
            <span>{fmt(data.start + data.size * (N / 2))}</span>
            <span>now</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThreatTimeline;
