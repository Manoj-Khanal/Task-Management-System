import { useState } from "react";

function Login({ onLogin, goToRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await fetch(
                "https://task-management-system-1gvk.onrender.com/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                // Save login only for the current browser session
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                // Tell App.jsx that login was successful
                onLogin(data.user);
            } else {
                alert(data.message || "Invalid email or password");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-logo">
                    ✓
                </div>

                <h1>
                    Welcome Back
                </h1>

                <p>
                    Login to your TaskFlow account
                </p>

                <form onSubmit={handleLogin}>

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <div className="login-switch">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        type="button"
                        className="switch-button"
                        onClick={goToRegister}
                    >
                        Create Account
                    </button>

                </div>

            </div>
        </div>
    );
}

export default Login;