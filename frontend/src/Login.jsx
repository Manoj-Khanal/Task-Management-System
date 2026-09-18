import { useState } from "react";

function Login({ onLogin, goToRegister }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
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

                localStorage.setItem(
    "token",
    data.token
);

localStorage.setItem(
    "user",
    JSON.stringify(data.user)
);

onLogin(data.user);
            } else {

                alert(data.message);

            }

        } catch (error) {

            console.error(error);
            alert("Unable to connect to server");

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

                    <button type="submit">
                        Login
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