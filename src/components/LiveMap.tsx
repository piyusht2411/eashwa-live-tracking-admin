"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function createColorIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
}

function FitBounds({ markers }: { markers: MarkerData[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || markers.length === 0) return;
    if (markers.length === 1) {
      map.setView(markers[0].position, 15);
    } else {
      const bounds = L.latLngBounds(markers.map((m) => m.position));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    fitted.current = true;
  }, [markers.length]);

  return null;
}

function MapRecenter({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface MarkerData {
  position: [number, number];
  label: string;
  color?: string; // hex color
  popup?: string;
  onClick?: () => void;
}

interface CircleData {
  position: [number, number];
  radius: number;
  color?: string;
  fillOpacity?: number;
  popup?: string;
}

interface LiveMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  circles?: CircleData[];
  route?: [number, number][];
  height?: string;
  autoFit?: boolean;
}

export default function LiveMap({
  center = [19.076, 72.8777],
  zoom = 12,
  markers = [],
  circles = [],
  route = [],
  height = "100%",
  autoFit = true,
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
      {autoFit ? <FitBounds markers={markers} /> : <MapRecenter center={center} zoom={zoom} />}
      {markers.map((m, i) => (
        <Marker
          key={i}
          position={m.position}
          icon={createColorIcon(m.color ?? "#6b7280")}
          eventHandlers={m.onClick ? { click: m.onClick } : undefined}
        >
          <Popup>
            <div className="font-semibold text-sm">{m.label}</div>
            {m.popup && <div className="text-xs text-gray-500 mt-0.5">{m.popup}</div>}
          </Popup>
        </Marker>
      ))}

      {circles.map((c, i) => (
        <Circle
          key={i}
          center={c.position}
          radius={c.radius}
          pathOptions={{
            color: c.color ?? "#f97316",
            fillColor: c.color ?? "#f97316",
            fillOpacity: c.fillOpacity ?? 0.2,
            weight: 1,
          }}
        >
          {c.popup && (
            <Popup>
              <div className="text-xs font-semibold">{c.popup}</div>
            </Popup>
          )}
        </Circle>
      ))}

      {route.length > 1 && (
        <Polyline positions={route} color="#f97316" weight={4} dashArray="8, 8" opacity={0.7} />
      )}
    </MapContainer>
  );
}
