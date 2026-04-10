import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const logoutButtonStyle = {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
};


function SidebarItem({ label, to, end = false }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                isActive ? "sidebar-item active" : "sidebar-item"
            }
        >
            {label}
        </NavLink>
    );
}

function DashboardLayout() {
    const navigate = useNavigate()
    const { user, logout } = useAuth();
    const isAdmin = user?.role === "Admin";
    const [activeItem, setActiveItem] = useState("dashboard");

    const menuItems = [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Nodes", to: "/nodes" },
        { label: "Alerts", to: "/alerts" },
    ];

    const adminItems = [
        { label: "Manage Nodes", to: "/nodes/manage" },
    ];

    function handleLogout() {
        logout();
        navigate("/")
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial" }}>

            {/* Sidebar */}
            <div
                style={{
                    width: "240px",
                    background: "#1e293b",
                    color: "white",
                    padding: "0px 20px",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <h2 style={{ marginBottom: "30px" }}>AWSIEM</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {menuItems.map((item) => (
                        <SidebarItem key={item.to} label={item.label} to={item.to} end={true} />
                    ))}

                    {isAdmin &&
                        adminItems.map((item) => (
                            <SidebarItem key={item.to} label={item.label} to={item.to} end={true} />
                        ))}
                </div>
            </div>

            {/* Main Area */}
            <div style={{ flex: 1, background: "#f1f5f9" }}>

                {/* Topbar */}
                <div
                    style={{
                        background: "white",
                        padding: "16px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #e2e8f0",
                    }}
                >
                    <h3 style={{ margin: 0 }}></h3>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span>
                            {user?.username} ({user?.role})
                        </span>
                        <button style={logoutButtonStyle} onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                <div style={{ padding: "24px" }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout