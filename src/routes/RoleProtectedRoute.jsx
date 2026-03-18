import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleProtectedRoute({ children, allowedRoles }) {
    const { user, isAuthenticated } = useAuth();

    // 1. Not logged in
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // 2. Logged in but no permission
    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    // 3. Authorized
    return children;
}

export default RoleProtectedRoute;