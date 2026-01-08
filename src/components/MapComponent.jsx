import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix for default marker icon missing
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const busIcon = L.divIcon({
    className: "custom-bus-icon",
    html: `<div style="font-size: 30px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3)); transform: translateY(-15px);">🚌</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const redBusIcon = L.divIcon({
    className: "custom-bus-icon-red",
    html: `<div style="font-size: 30px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3)); transform: translateY(-15px);">🚍</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const MapComponent = ({ center, markers = [], onLocationFound }) => {
    return (
        <MapContainer center={center} zoom={15} style={{ height: "100%", minHeight: "400px", width: "100%" }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {markers.map((marker, index) => (
                <Marker
                    key={index}
                    position={[marker.lat, marker.lng]}
                    icon={marker.type === 'bus' ? busIcon : (marker.type === 'active' ? redBusIcon : DefaultIcon)}
                >
                    <Popup>{marker.popupText}</Popup>
                </Marker>
            ))}
            <RecenterMap lat={center[0]} lng={center[1]} />
        </MapContainer>
    );
};

export default MapComponent;
