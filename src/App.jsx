import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Nodes from "./pages/Nodes";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";

function ManageNodes() {
  return <h2>Manage Nodes - Admin Only</h2>;
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
          <Route path="alerts" element={<Dashboard />} />
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