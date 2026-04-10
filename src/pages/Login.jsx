import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()

    function loginAsAdmin() {
        login(
            { username: "admin", role: "Admin" },
            "demo-token-admin"
        );

        navigate("/dashboard");
    }

    function loginAsObserver() {
        login(
            { username: "observer", role: "Observer" },
            "demo-token-observer"
        );

        navigate("/dashboard");
    }

    return (
        <div style={{ padding: "40px" }}>
            <h2>AWSIEM Login</h2>
            <p>Select a role for mock authentication:</p>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button onClick={loginAsAdmin}>Login as Admin</button>
                <button onClick={loginAsObserver}>Login as Observer</button>
            </div>
        </div>
    );
}

export default Login;