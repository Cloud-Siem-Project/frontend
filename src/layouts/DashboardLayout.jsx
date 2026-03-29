import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext";

function DashboardLayout() {
    const navigate = useNavigate()

    const { user, logout } = useAuth();

    const isAdmin = user?.role === "Admin";

    function handleLogout() {
        logout();
        navigate("/")
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <div
                style={{
                    width: "220px",
                    background: "#eeeeee",
                    padding: "20px",
                    borderRight: "1px solid #ccc",
                }}
            >
                <h2>Cloud SIEM</h2>

                <div style={{ marginTop: "24px" }}>
                    <p>Dashboard</p>
                    <p>Nodes</p>
                    <p>Alerts</p>
                    {isAdmin && <p>Manage Nodes</p>}
                </div>
            </div>

            <div style={{ flex: 1 }}>
                <div
                    style={{
                        background: "#dddddd",
                        padding: "12px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div>
                        {user ? `${user.username} - ${user.role}` : "Unknown User"}
                    </div>

                    <button onClick={handleLogout}>Logout</button>
                </div>

                <div style={{ padding: "20px" }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout