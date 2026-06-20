import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Nodes from "./pages/Nodes";
import Alerts from "./pages/Alerts";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";

function ManageNodes() {
  return (
    <div>
      <div className="page-head reveal d1">
        <div>
          <div className="eyebrow">Admin / Fleet Control</div>
          <h1 className="page-title">Manage Nodes</h1>
        </div>
      </div>
      <div className="panel bracket empty reveal d2" style={{ padding: "56px 24px" }}>
        Admin controls are not wired yet. Node provisioning is managed via Terraform.
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="nodes" element={<Nodes />} />
          <Route path="alerts" element={<Alerts />} />
          <Route
            path="nodes/manage"
            element={
              <RoleProtectedRoute allowedRoles={["Admin"]}>
                <ManageNodes />
              </RoleProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App