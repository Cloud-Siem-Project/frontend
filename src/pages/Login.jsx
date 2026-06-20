import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NetworkBackground from "../components/NetworkBackground";
import { IconShield } from "../components/icons";

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
    <div className="login-screen">
      <NetworkBackground />
      <div className="login-scrim" />

      <form onSubmit={handleSubmit} className="panel login-card reveal d1">
        <div className="login-brand">
          <div className="brand-glyph" style={{ width: 44, height: 44 }}>
            <IconShield size={24} />
          </div>
          <div>
            <div className="login-title">Centinel</div>
            <div className="login-tag">your eyes on the cloud</div>
          </div>
        </div>

        <div className="login-divider" />

        {error && <div className="login-error mono">⚠ {error}</div>}

        <label className="field-label">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="field"
          placeholder="username"
          autoComplete="username"
          required
        />

        <label className="field-label">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading} className="btn btn-accent login-submit">
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
