import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            if (res.data.role === "ADMIN") navigate("/admin");
            else if (res.data.role === "DRIVER") navigate("/driver");
            else navigate("/user");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Login Failed");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">Login</h2>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200"
                    >
                        Login
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
