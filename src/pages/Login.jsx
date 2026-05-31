import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ margin: "0 0 4px", color: "#1e293b", fontFamily: "'Ubuntu Mono', monospace", textAlign: "center", fontSize: "28px" }}>
          cloud loggers
        </h2>
        <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: "13px", textAlign: "center" }}>
          your eyes on the cloud
        </p>

        {error && <div style={errorStyle}>{error}</div>}

        <label style={labelStyle}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
          autoComplete="username"
          required
        />

        <label style={labelStyle}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "#f1f5f9",
};

const formStyle = {
  background: "white",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  width: "360px",
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#334155",
  marginBottom: "6px",
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  marginBottom: "16px",
  outline: "none",
};

const buttonStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#1e293b",
  color: "white",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: "8px",
};

const errorStyle = {
  background: "#fef2f2",
  color: "#dc2626",
  padding: "10px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  marginBottom: "16px",
  border: "1px solid #fecaca",
};

export default Login;
