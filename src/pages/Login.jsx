import { useNavigate } from "react-router-dom"

function Login() {
    const navigate = useNavigate()

    function handleLogin() {
        localStorage.setItem("token", "demo-token")
        navigate("/dashboard")
    }

    return (
        <div>
            <h2>Login Page</h2>
            <button onClick={handleLogin}>Login</button>
        </div>
    )
}

export default Login