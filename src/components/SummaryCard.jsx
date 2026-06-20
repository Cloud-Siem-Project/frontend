// HUD telemetry tile. backwards-compatible props (title, value, color)
// plus optional sub, icon, and accent for the bracket/glow tint.

function SummaryCard({ title, value, color = "var(--ink)", sub, icon, accent }) {
  const tint = accent || color;
  return (
    <div className="panel bracket stat-card" style={{ "--tint": tint }}>
      <div className="stat-top">
        <span className="eyebrow">{title}</span>
        {icon && <span className="stat-icon" style={{ color: tint }}>{icon}</span>}
      </div>
      <div className="stat-value" style={{ color }}>
        {value}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
      <span className="stat-bar" style={{ background: tint }} />
    </div>
  );
}

export default SummaryCard;
