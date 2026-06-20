import { useMemo } from "react";

const N = 40;          // time buckets
const W = 1000;        // viewBox width (scales to container)
const H = 190;         // viewBox height
const PAD_X = 10;
const PAD_TOP = 16;
const PAD_BOTTOM = 6;
const PLOT_H = H - PAD_TOP - PAD_BOTTOM;

function fmt(ms) {
  return new Date(ms).toISOString().slice(11, 16); // UTC HH:MM
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
  const minSpan = N * 60 * 1000;
  if (end - start < minSpan) start = end - minSpan;
  const size = (end - start) / N;

  const counts = new Array(N).fill(0);
  for (const t of times) {
    let i = Math.floor((t - start) / size);
    if (i < 0) i = 0;
    if (i >= N) i = N - 1;
    counts[i] += 1;
  }
  const peak = Math.max(1, ...counts);
  const ymax = peak * 1.15; // headroom so the peak isn't glued to the top

  const pts = counts.map((c, i) => {
    const x = PAD_X + (i / (N - 1)) * (W - 2 * PAD_X);
    const y = PAD_TOP + (1 - c / ymax) * PLOT_H;
    return [x, y, c];
  });

  return { pts, start, end, size, peak, total: times.length };
}

// Catmull-Rom → cubic bezier for a smooth, stock-chart-like line
function smooth(pts) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function ThreatTimeline({ events }) {
  const data = useMemo(() => build(events), [events]);

  const line = data ? smooth(data.pts) : "";
  const area = data
    ? `${line} L${(W - PAD_X).toFixed(1)},${H - PAD_BOTTOM} L${PAD_X.toFixed(1)},${H - PAD_BOTTOM} Z`
    : "";
  const last = data ? data.pts[data.pts.length - 1] : null;
  const bucketW = data ? (W - 2 * PAD_X) / (N - 1) : 0;

  // faint horizontal gridlines
  const grid = [0.5, 1];

  return (
    <div className="panel bracket" style={{ overflow: "hidden" }}>
      <div className="panel-head">
        <h3>Event Volume</h3>
        <span className="faint mono" style={{ fontSize: 11 }}>
          {data ? `${data.total} logs · peak ${data.peak}/interval` : "logs over time"}
        </span>
      </div>

      {!data ? (
        <div className="empty">No events yet — log volume will chart here in real time.</div>
      ) : (
        <div className="chart-wrap">
          <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img">
            <defs>
              <linearGradient id="tlFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(170,178,189,0.28)" />
                <stop offset="100%" stopColor="rgba(170,178,189,0)" />
              </linearGradient>
            </defs>

            {grid.map((g) => {
              const y = PAD_TOP + g * PLOT_H;
              return (
                <line
                  key={g}
                  x1={PAD_X}
                  x2={W - PAD_X}
                  y1={y}
                  y2={y}
                  className="chart-grid"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            <path d={area} className="chart-area" />
            <path d={line} className="chart-line" vectorEffect="non-scaling-stroke" />

            {last && (
              <>
                <circle cx={last[0]} cy={last[1]} r="7" className="chart-dot-halo" />
                <circle cx={last[0]} cy={last[1]} r="3.5" className="chart-dot" vectorEffect="non-scaling-stroke" />
              </>
            )}

            {/* invisible hover columns → native tooltips per interval */}
            {data.pts.map((p, i) => {
              const bStart = data.start + i * data.size;
              return (
                <rect
                  key={i}
                  x={p[0] - bucketW / 2}
                  y={0}
                  width={bucketW}
                  height={H}
                  fill="transparent"
                >
                  <title>{`${fmt(bStart)} · ${p[2]} log${p[2] === 1 ? "" : "s"}`}</title>
                </rect>
              );
            })}
          </svg>

          <div className="chart-axis">
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
