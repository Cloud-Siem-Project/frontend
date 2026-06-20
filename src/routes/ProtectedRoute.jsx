import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// component wraps other components 
function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default ProtectedRoute