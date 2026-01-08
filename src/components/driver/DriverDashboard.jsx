import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import MapComponent from "../MapComponent";

export default function DriverDashboard() {
    const [buses, setBuses] = useState([]);
    const [selectedBusId, setSelectedBusId] = useState("");
    const [tracking, setTracking] = useState(false);
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState("Not Tracking");
    const [isFullScreen, setIsFullScreen] = useState(false);
    const watchIdRef = useRef(null);

    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const res = await api.get("/bus");
                setBuses(res.data);
            } catch (err) {
                console.error("Failed to fetch buses", err);
            }
        };
        fetchBuses();
    }, []);

    const toggleTracking = () => {
        if (tracking) {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            setTracking(false);
            setStatus("Tracking Stopped");
            return;
        }

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setStatus("Requesting Location Access...");

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const lat = parseFloat(latitude);
                const lng = parseFloat(longitude);

                setLocation({ lat, lng });

                if (selectedBusId) {
                    setStatus("Broadcasting Location to Users");
                    console.log("📡 Driver: Sending location update:", { busId: selectedBusId, lat, lng });
                    api.put("/bus/location", {
                        busId: selectedBusId,
                        latitude: lat,
                        longitude: lng
                    })
                        .then(response => {
                            console.log("✅ Driver: Location update successful:", response.data);
                        })
                        .catch(err => {
                            console.error("❌ Driver: Failed to update location", err);
                        });
                } else {
                    setStatus("GPS Active (Not Broadcasting - Select Bus to Share)");
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                setStatus(`Error: ${error.message}`);
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50 p-6">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold text-gray-900">🚗 Driver Console</h1>
                    <p className="text-gray-600">Manage your bus location and share it with passengers</p>
                </div>

                {/* Bus Selection Card */}
                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 space-y-6">
                    <div className="space-y-3">
                        <label className="block text-gray-800 font-bold mb-3 text-xl">
                            🚍 Select Your Bus
                        </label>
                        <p className="text-sm text-gray-600 mb-4">Required to be visible to Admin and Users</p>
                        <select
                            className={`w-full p-5 border-2 rounded-2xl bg-gray-50 focus:ring-4 focus:ring-blue-300 outline-none transition-all text-lg font-medium ${!selectedBusId && tracking ? 'border-red-400 ring-4 ring-red-100' : 'border-gray-200 hover:border-gray-300'
                                }`}
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

                    {/* Action Buttons */}
                    <div className="flex flex-col items-center space-y-5 pt-4">
                        <button
                            onClick={toggleTracking}
                            disabled={!selectedBusId && !tracking}
                            className={`w-full py-6 text-2xl font-extrabold rounded-2xl transition-all shadow-xl transform hover:scale-105 ${!selectedBusId && !tracking ? 'bg-gray-200 text-gray-400 cursor-not-allowed scale-100 hover:scale-100' : ''
                                } ${tracking
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-200'
                                    : (!selectedBusId ? 'hidden' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200')
                                }`}
                        >
                            {tracking ? (selectedBusId ? "⏹ STOP TRACKING" : "⏹ STOP GPS TEST") : "▶ START SHARING LOCATION"}
                        </button>

                        {/* Warning Message */}
                        {!selectedBusId && !tracking && (
                            <div className="w-full text-center p-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl space-y-4 shadow-lg">
                                <div className="text-6xl">⚠️</div>
                                <p className="font-extrabold text-2xl text-yellow-900">GPS Check Mode Only</p>
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    To share your location with users and admins, please <b className="text-yellow-900">select a bus</b> from the dropdown above first.
                                </p>
                                <button
                                    onClick={toggleTracking}
                                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105"
                                >
                                    🧪 Test My GPS Locally
                                </button>
                            </div>
                        )}

                        {/* Status Indicator */}
                        <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl w-full shadow-inner border border-gray-200">
                            <div className={`w-5 h-5 rounded-full shadow-lg ${tracking ? 'bg-green-500 animate-pulse ring-4 ring-green-200' : 'bg-gray-400'}`}></div>
                            <span className="text-gray-800 font-bold text-xl">{status}</span>
                        </div>
                    </div>
                </div>

                {/* Live Location Map */}
                {location && (
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 space-y-6">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                                <span className="text-4xl">📍</span> Live Location
                            </h2>
                            <a
                                href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-bold flex items-center gap-3 transition-all shadow-xl transform hover:scale-105"
                            >
                                <span className="text-2xl">🗺️</span> Open in Google Maps
                            </a>
                        </div>

                        <div className="rounded-2xl overflow-hidden border-4 border-gray-200 shadow-2xl h-[500px]">
                            <MapComponent
                                center={[location.lat, location.lng]}
                                markers={[{ lat: location.lat, lng: location.lng, type: 'active', popupText: "🚍 You are here" }]}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
