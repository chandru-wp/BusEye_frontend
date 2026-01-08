import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">

            <h1 className="text-xl font-bold">
                🚌 Bus Tracker
            </h1>

            <div className="space-x-4">

                {role === "ADMIN" && (
                    <Link to="/admin" className="hover:underline">
                        Admin Dashboard
                    </Link>
                )}

                {role === "DRIVER" && (
                    <Link to="/driver" className="hover:underline">
                        Driver Dashboard
                    </Link>
                )}

                {role === "USER" && (
                    <Link to="/user" className="hover:underline">
                        User Dashboard
                    </Link>
                )}

                <button
                    onClick={logout}
                    className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
