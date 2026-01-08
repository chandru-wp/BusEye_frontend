import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import MapComponent from "../MapComponent";

export default function DriverDashboard() {
    const [location, setLocation] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [buses, setBuses] = useState([]);
    const [selectedBusId, setSelectedBusId] = useState("");
    const [status, setStatus] = useState("Idle");
    const watchIdRef = useRef(null);

    // Fetch available buses so driver can select which one they are driving
    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const res = await api.get("/bus");
                setBuses(res.data);
            } catch (err) {
                console.error("Failed to fetch buses");
            }
        };
        fetchBuses();
    }, []);

    // Cleanup watcher on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    const toggleTracking = () => {
        if (tracking) {
            // Stop Tracking
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
            setTracking(false);
            setStatus("Stopped");
            return;
        }

        // Start Tracking
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setStatus("Requesting Location Access...");

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Force precision and type
                const lat = parseFloat(latitude);
                const lng = parseFloat(longitude);

                setLocation({ lat, lng });

                if (selectedBusId) {
                    setStatus("Broadcasting Location to Users");
                    // Send update to backend
                    api.put("/bus/location", {
                        busId: selectedBusId,
                        latitude: lat,
                        longitude: lng
                    }).catch(err => console.error("Failed to update location", err));
                } else {
                    setStatus("GPS Active (Not Broadcasting - Select Bus to Share)");
                }
            },
            (error) => {
                console.error(error);
                setStatus("Error: Unable to access location");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        watchIdRef.current = id;
        setTracking(true);
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Driver Console</h1>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6">
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Select Your Bus (Required to be seen by Admin/Users)</label>
                    <select
                        className={`w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none ${!selectedBusId && tracking ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
                        value={selectedBusId}
                        onChange={(e) => setSelectedBusId(e.target.value)}
                        disabled={tracking}
                    >
                        <option value="">-- 🛑 OFF-LINE (Select Bus to Go Live) --</option>
                        {buses.map(bus => (
                            <option key={bus.id} value={bus.id}>
                                🚍 {bus.busNo} - {bus.route}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col items-center">
                    <button
                        onClick={toggleTracking}
                        disabled={!selectedBusId && !tracking}
                        className={`w-full py-4 text-xl font-bold rounded-lg transition-all shadow-lg ${!selectedBusId && !tracking ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''
                            } ${tracking
                                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                : (!selectedBusId ? 'hidden' : 'bg-green-600 hover:bg-green-700 text-white')
                            }`}
                    >
                        {tracking ? (selectedBusId ? "STOP TRACKING" : "STOP LOCAL GPS TESTING") : "START SHARING LOCATION"}
                    </button>
                    {!selectedBusId && !tracking && (
                        <div className="text-center mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                            <p className="font-bold">⚠️ GPS Check Mode Only</p>
                            <p className="text-sm">To share location with users, please <b>select a bus</b> from the dropdown above first.</p>
                            <button onClick={toggleTracking} className="mt-2 text-blue-600 underline text-sm">
                                Just Test My GPS Locally
                            </button>
                        </div>
                    )}

                    <div className="mt-4 flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${tracking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-gray-600 font-medium">{status}</span>
                    </div>
                </div>
            </div>

            {location && (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Live Location</h2>
                        <a
                            href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors"
                        >
                            <span className="mr-2">📍</span> Open in Google Maps
                        </a>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-gray-300">
                        <MapComponent
                            center={[location.lat, location.lng]}
                            markers={[{ lat: location.lat, lng: location.lng, type: 'active', popupText: "You are here" }]}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
