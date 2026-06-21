import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  IconRadar,
  IconNodes,
  IconAlert,
  IconPower,
} from "../components/icons";
import centinelLogo from "../assets/centinel.svg";

function SidebarItem({ label, to, icon }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => (isActive ? "sidebar-item active" : "sidebar-item")}
    >
      <span className="si-icon">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = (user?.username || "?").slice(0, 2).toUpperCase();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="shell">
      {/* ---------- sidebar ---------- */}
      <aside className="sidebar">
        <div className="brand">
          <img src={centinelLogo} alt="Centinel" className="brand-logo" />
        </div>

        <nav className="nav-group">
          <div className="nav-group-label">Operations</div>
          <SidebarItem label="Overview" to="/dashboard" icon={<IconRadar />} />
          <SidebarItem label="Nodes" to="/nodes" icon={<IconNodes />} />
          <SidebarItem label="Alerts" to="/alerts" icon={<IconAlert />} />
        </nav>

        <div className="sidebar-foot">
          <div className="row">
            <span>REGION</span>
            <span style={{ color: "var(--ink-dim)" }}>eu-central-1</span>
          </div>
          <div className="row">
            <span>PIPELINE</span>
            <span style={{ color: "var(--ok)" }}>● ARMED</span>
          </div>
        </div>
      </aside>

      {/* ---------- main ---------- */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <span className="live-tag">
              <span className="status-dot" />
              LIVE
            </span>
            <span className="faint mono" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
              583164063950
            </span>
          </div>

          <div className="topbar-right">
            <div className="user-chip">
              <div className="user-avatar">{initials}</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ color: "var(--ink)" }}>{user?.username}</div>
                <div className="role-tag">{user?.role}</div>
              </div>
            </div>
            <button className="btn btn-danger" onClick={handleLogout}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <IconPower size={14} /> Logout
              </span>
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
