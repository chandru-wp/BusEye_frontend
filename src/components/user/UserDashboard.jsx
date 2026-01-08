import { useEffect, useState } from "react";
import api from "../../services/api";
import MapComponent from "../MapComponent";

export default function UserDashboard() {
    const [buses, setBuses] = useState([]);
    const [center, setCenter] = useState([20.5937, 78.9629]); // Default India center

    const [hasCentered, setHasCentered] = useState(false);

    const fetchBuses = async () => {
        try {
            const res = await api.get("/bus");
            setBuses(res.data);

            // Recenter only on first successful load with data
            if (!hasCentered && res.data.length > 0) {
                const firstActiveBus = res.data.find(b => b.latitude);
                if (firstActiveBus) {
                    setCenter([firstActiveBus.latitude, firstActiveBus.longitude]);
                    setHasCentered(true);
                }
            }
        } catch (err) {
            console.error("Failed to fetch buses");
        }
    };

    useEffect(() => {
        fetchBuses();
        const interval = setInterval(fetchBuses, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handleLocateCheck = (bus) => {
        if (bus.latitude && bus.longitude) {
            setCenter([bus.latitude, bus.longitude]);
        } else {
            alert("This bus has no location data yet.");
        }
    };

    const markers = buses
        .filter(bus => bus.latitude && bus.longitude)
        .map(bus => ({
            lat: bus.latitude,
            lng: bus.longitude,
            type: 'active', // Uses the new 🚍 icon
            popupText: `Bus: ${bus.busNo} (${bus.route})`
        }));

    const [isFullScreen, setIsFullScreen] = useState(false);

    return (
        <div className={`flex flex-col overflow-hidden bg-gray-50 ${isFullScreen ? 'fixed inset-0 z-50 h-screen' : 'h-[calc(100vh-64px)]'}`}>
            {/* Map Section */}
            <div className="flex-1 relative z-0">
                <MapComponent center={center} markers={markers} />

                {/* Fullscreen Toggle Button - Top Right of Map */}
                <div className="absolute top-4 right-4 z-[400]">
                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg font-bold border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        {isFullScreen ? "✖ Exit" : "⛶ Fullscreen"}
                    </button>
                </div>
            </div>

            {/* Bus List Panel - Hidden in Fullscreen or overlaid */}
            <div className={`bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-10 transition-transform duration-300
                ${isFullScreen ? 'translate-y-full absolute bottom-0 w-full' : 'md:w-96 md:absolute md:top-4 md:left-4 md:bottom-4 md:rounded-xl md:shadow-xl md:flex md:flex-col md:translate-y-0 h-1/3 md:h-[calc(100%-2rem)]'}
            `}>
                <div className="p-4 border-b bg-white sticky top-0 md:bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <span className="bg-green-500 w-2 h-2 rounded-full mr-2 animate-pulse"></span>
                        Live Buses
                    </h2>
                    <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{buses.length}</span>
                </div>

                <div className="overflow-y-auto p-2 space-y-2 flex-1 scrollbar-hide">
                    {buses.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <p>No buses currently active.</p>
                        </div>
                    ) : (
                        buses.map(bus => (
                            <div key={bus.id} className="group border border-gray-100 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-all flex justify-between items-center cursor-pointer hover:bg-blue-50"
                                onClick={() => {
                                    handleLocateCheck(bus);
                                    if (isFullScreen) setIsFullScreen(false); // Exit fullscreen if they select a bus to see details
                                }}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                                        🚍
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">{bus.busNo}</div>
                                        <div className="text-xs text-gray-500 max-w-[150px] truncate">{bus.route}</div>
                                    </div>
                                </div>
                                <button className="text-blue-500 p-2 rounded-full hover:bg-blue-100 transition-colors" title="Locate on Map">
                                    🔭
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
