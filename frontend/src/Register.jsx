import { useState } from "react";

function Register({ onRegister, goToLogin }) {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {

        e.preventDefault();

        try {

            const response = await fetch(
                "https://task-management-system-1gvk.onrender.com/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                alert("Account created successfully!");

                onRegister();

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
                    Create Account
                </h1>

                <p>
                    Join TaskFlow and manage your tasks
                </p>


                <form onSubmit={handleRegister}>

                    <label>
                        Full Name
                    </label>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                    />


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
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        minLength="6"
                        required
                    />


                    <button type="submit">
                        Create Account
                    </button>

                </form>


                <div className="login-switch">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        className="switch-button"
                        onClick={goToLogin}
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Register;