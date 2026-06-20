// shared formatting + severity helpers used across pages.

export function normSeverity(sev) {
  const s = (sev || "").toUpperCase();
  if (s === "CRITICAL" || s === "HIGH") return "HIGH";
  if (s === "MEDIUM" || s === "MED") return "MED";
  if (s === "LOW") return "LOW";
  return "INFO";
}

export function sevClass(sev) {
  switch (normSeverity(sev)) {
    case "HIGH": return "sev sev-high";
    case "MED": return "sev sev-med";
    case "LOW": return "sev sev-low";
    default: return "sev sev-info";
  }
}

export function sevColor(sev) {
  switch (normSeverity(sev)) {
    case "HIGH": return "var(--sev-high)";
    case "MED": return "var(--sev-med)";
    case "LOW": return "var(--sev-low)";
    default: return "var(--ink-dim)";
  }
}

// unix seconds → "12s ago"
export function timeAgoSecs(ts) {
  if (!ts) return "—";
  const delta = Math.floor(Date.now() / 1000 - ts);
  if (delta < 0) return "now";
  if (delta < 60) return `${delta}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

// ISO string → "12s ago"
export function timeAgoISO(iso) {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const delta = Math.floor((Date.now() - then) / 1000);
  if (delta < 0) return "now";
  if (delta < 60) return `${delta}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

export function clockISO(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(11, 19) + " UTC";
}
