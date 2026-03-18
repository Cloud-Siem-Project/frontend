import { Outlet, useNavigate } from "react-router-dom"

function DashboardLayout() {
    const navigate = useNavigate()

    function handleLogout() {
        localStorage.removeItem("token")
        navigate("/")
    }

    return (
        <div style={{ display: "flex" }}>
            <div style={{ width: "200px", background: "#eee" }}>
                Sidebar
            </div>

            <div style={{ flex: 1 }}>
                <div style={{
                    background: "#ddd",
                    padding: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                }}>
                    Topbar
                    <button onClick={handleLogout}>Logout</button>
                </div>

                <div style={{ padding: "20px" }}>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout