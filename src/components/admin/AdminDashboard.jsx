import { useEffect, useState } from "react";
import api from "../../services/api";
import MapComponent from "../MapComponent";

export default function AdminDashboard() {
    const [buses, setBuses] = useState([]);
    const [newBus, setNewBus] = useState({ busNo: "", route: "" });
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [center, setCenter] = useState([20.5937, 78.9629]);
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedBus, setSelectedBus] = useState(null);

    const fetchBuses = async () => {
        try {
            const res = await api.get("/bus");
            console.log("📊 Admin: Fetched buses:", res.data);
            console.log("📍 Admin: Buses with location:", res.data.filter(b => b.latitude && b.longitude));
            setBuses(res.data);
        } catch (err) {
            console.error("❌ Admin: Failed to fetch buses", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get("/auth/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    useEffect(() => {
        fetchBuses();
        fetchUsers();

        // Poll for live bus updates every 5 seconds
        const interval = setInterval(fetchBuses, 5000);
        return () => clearInterval(interval);
    }, []);

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/auth/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/auth/users/${editingUser.id}`, editingUser);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            alert("Failed to update user");
        }
    };

    const addBus = async (e) => {
        e.preventDefault();
        try {
            await api.post("/bus", newBus);
            setNewBus({ busNo: "", route: "" });
            fetchBuses();
            alert("Bus added!");
        } catch (err) {
            console.error(err);
            alert("Error adding bus");
        }
    };

    const handleBusClick = (bus) => {
        if (bus.latitude && bus.longitude) {
            setSelectedBus(bus);
            setCenter([bus.latitude, bus.longitude]);
            setIsFullScreen(true); // Auto-open fullscreen when clicking a bus
        } else {
            alert(`Bus ${bus.busNo} is not currently sharing location`);
        }
    };

    const handleClearSelection = () => {
        setSelectedBus(null);
        setCenter([20.5937, 78.9629]); // Reset to India center
    };

    // Show only selected bus if one is selected, otherwise show all buses
    const markers = selectedBus
        ? (selectedBus.latitude && selectedBus.longitude
            ? [{
                lat: selectedBus.latitude,
                lng: selectedBus.longitude,
                type: 'active',
                popupText: `🚍 Bus: ${selectedBus.busNo} - ${selectedBus.route}`
            }]
            : [])
        : buses
            .filter(bus => bus.latitude && bus.longitude)
            .map(bus => ({
                lat: bus.latitude,
                lng: bus.longitude,
                type: 'active',
                popupText: `🚍 Bus: ${bus.busNo}`
            }));

    return (
        <div className="min-h-screen bg-gray-50 p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

                {/* User Management Section */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">User Management</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100/50 text-gray-600 text-sm uppercase">
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                        <td className="p-3 font-medium text-gray-800">{user.name}</td>
                                        <td className="p-3 text-gray-600">{user.email}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'DRIVER' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-3 space-x-2">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit User Modal Form */}
                {editingUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-2xl w-96 transform transition-all scale-100">
                            <h3 className="text-xl font-bold mb-4">Edit User</h3>
                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <input
                                    className="w-full border p-2 rounded"
                                    value={editingUser.name}
                                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                    placeholder="Name"
                                />
                                <input
                                    className="w-full border p-2 rounded"
                                    value={editingUser.email}
                                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                                    placeholder="Email"
                                />
                                <select
                                    className="w-full border p-2 rounded bg-white"
                                    value={editingUser.role}
                                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                >
                                    <option value="USER">USER</option>
                                    <option value="DRIVER">DRIVER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Bus Management Section (Re-styled) */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Fleet Management</h2>
                    <form onSubmit={addBus} className="flex gap-2 mb-4">
                        <input
                            className="flex-1 border p-2 rounded"
                            placeholder="Bus No"
                            value={newBus.busNo}
                            onChange={e => setNewBus({ ...newBus, busNo: e.target.value })}
                            required />
                        <input
                            className="flex-1 border p-2 rounded"
                            placeholder="Route"
                            value={newBus.route}
                            onChange={e => setNewBus({ ...newBus, route: e.target.value })}
                            required />
                        <button className="bg-green-600 text-white px-4 py-2 rounded font-medium">Add</button>
                    </form>

                    {selectedBus && (
                        <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-lg flex justify-between items-center">
                            <span className="text-blue-800 font-semibold">📍 Viewing: {selectedBus.busNo}</span>
                            <button
                                onClick={handleClearSelection}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
                            >
                                Show All Buses
                            </button>
                        </div>
                    )}

                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {buses.map(bus => (
                            <li
                                key={bus.id}
                                onClick={() => handleBusClick(bus)}
                                className={`border-b py-3 px-3 flex justify-between items-center last:border-0 rounded-lg cursor-pointer transition-all ${selectedBus?.id === bus.id
                                    ? 'bg-blue-100 border-blue-300 shadow-md'
                                    : 'hover:bg-gray-50 hover:shadow-sm'
                                    } ${bus.latitude && bus.longitude ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300 opacity-60'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{bus.latitude && bus.longitude ? '🟢' : '⚫'}</span>
                                    <div>
                                        <span className="font-semibold text-gray-800 block">{bus.busNo}</span>
                                        <span className="font-normal text-gray-500 text-sm">{bus.route}</span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">{bus.id.slice(-6)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className={`transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
                <div className={`bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col ${isFullScreen ? 'h-full p-0 rounded-none border-0' : 'p-4 h-[calc(100vh-2rem)] sticky top-4'}`}>
                    <div className={`flex justify-between items-center shrink-0 ${isFullScreen ? 'p-4 mb-0 bg-white border-b border-gray-200' : 'mb-4'}`}>
                        <h2 className="text-xl font-bold text-gray-700">Live Services Map</h2>
                        <button
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-semibold flex items-center transition-colors border border-gray-300"
                        >
                            {isFullScreen ? "✖ Exit" : "⛶ Fullscreen"}
                        </button>
                    </div>
                    <div className={`flex-1 overflow-hidden relative min-h-0 ${isFullScreen ? 'rounded-none border-0' : 'rounded-lg border border-gray-300'}`}>
                        <MapComponent center={center} markers={markers} />
                    </div>
                </div>
            </div>
        </div>
    );
}
