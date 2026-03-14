"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const orangeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

interface MarkerData {
  position: [number, number];
  label: string;
  color?: "orange" | "green" | "default";
  popup?: string;
}

interface LiveMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  route?: [number, number][];
  height?: string;
}

export default function LiveMap({
  center = [19.076, 72.8777],
  zoom = 12,
  markers = [],
  route = [],
  height = "100%",
}: LiveMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapRecenter center={center} />
      {markers.map((m, i) => (
        <Marker
          key={i}
          position={m.position}
          icon={m.color === "orange" ? orangeIcon : m.color === "green" ? greenIcon : new L.Icon.Default()}
        >
          <Popup>
            <div className="font-semibold text-sm">{m.label}</div>
            {m.popup && <div className="text-xs text-gray-500 mt-0.5">{m.popup}</div>}
          </Popup>
        </Marker>
      ))}

      {route.length > 1 && (
        <Polyline positions={route} color="#f97316" weight={4} dashArray="8, 8" opacity={0.7} />
      )}
    </MapContainer>
  );
}
