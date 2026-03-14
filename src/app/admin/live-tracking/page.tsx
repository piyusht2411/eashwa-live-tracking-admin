"use client";

import { useState, useEffect } from "react";
import { Users, Filter, RefreshCw, Navigation, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getLiveLocations, getLocationHistory } from "@/lib/api";
import { toast } from "sonner";

const Map = dynamic(() => import("@/components/LiveMap"), { ssr: false });

const statusColor: Record<string, { badge: string; dot: string; mapColor: "orange" | "green" | "default" }> = {
  active: { badge: "bg-green-100 text-green-700", dot: "bg-green-500", mapColor: "green" },
  idle: { badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500", mapColor: "orange" },
  break: { badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500", mapColor: "default" },
};

export interface LiveLocation {
  id: string;      // The employeeId or Mongo _id
  userId: string;
  name: string;
  department: string;
  latitude: number;
  longitude: number;
  lastUpdate: string;
  battery: number;
  speed: number;
  status: "active" | "idle" | "break" | "offline" | string;
}

export default function LiveTrackingPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [locations, setLocations] = useState<LiveLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [routeHistory, setRouteHistory] = useState<{ lat: number, lng: number }[]>([]);
  const token = useSelector((state: RootState) => state.auth.authToken);

  const fetchLocations = async (isRefresh = false) => {
    if (!token) return;
    try {
      if (isRefresh) setRefreshing(true);
      const response = await getLiveLocations(token);
      setLocations(response.data || []);
    } catch (err: unknown) {
      if (!isRefresh) toast.error("Failed to load live tracking data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchLocations(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!selected || !token) {
      setRouteHistory([]);
      return;
    }
    const emp = locations.find(e => e.id === selected);
    if (emp) {
      getLocationHistory(token, emp.userId)
        .then(res => setRouteHistory(res.data?.route || []))
        .catch(err => toast.error("Could not fetch route history"));
    }
  }, [selected, token]);

  const filtered = locations;

  const selectedEmp = locations.find((e) => e.id === selected);
  const mapCenter: [number, number] = selectedEmp
    ? [selectedEmp.latitude, selectedEmp.longitude]
    : locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : [19.1, 72.87];

  const markers = filtered.map((e) => ({
    position: [e.latitude, e.longitude] as [number, number],
    label: e.name,
    color: statusColor[e.status]?.mapColor ?? "default",
    popup: `${e.department} · ${e.status} · ${new Date(e.lastUpdate).toLocaleTimeString()}`,
  }));

  // Create polyline format for the Map component (assuming Map supports `route` prop)
  const routePoints = routeHistory.map(p => [p.lat, p.lng] as [number, number]);

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      {/* Left Panel */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-orange-500" />
              Live Tracking
            </h2>
            <button
              onClick={() => fetchLocations(true)}
              disabled={refreshing}
              className="p-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${loading ? 'bg-orange-500' : 'bg-green-500'} rounded-full animate-pulse`} />
            <span className="text-xs text-gray-500">
              {loading ? "Connecting..." : `${filtered.length} employees tracked`}
            </span>
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mb-2 text-orange-400" />
              <p className="text-sm">Fetching live locations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No employees found
            </div>
          ) : (
            filtered.map((emp) => {
              const sc = statusColor[emp.status] || { badge: "bg-gray-100 text-gray-700", dot: "bg-gray-500", mapColor: "default" };
              const isSelected = selected === emp.id;

              const formatTime = (ts: string) => {
                const d = new Date(ts);
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              };

              return (
                <button
                  key={emp.id}
                  onClick={() => setSelected(isSelected ? null : emp.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected
                      ? "border-orange-300 bg-orange-50"
                      : "border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/40"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{emp.name}</p>
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{emp.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.badge} capitalize`}>
                      {emp.status}
                    </span>
                    <span className="text-xs text-gray-400">{formatTime(emp.lastUpdate)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span>🚗 {emp.speed} km/h</span>
                    <span>🔋 {emp.battery}%</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Summary */}
        <div className="p-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Active", value: filtered.filter(e => e.status === "active").length, color: "text-green-600" },
            { label: "Idle", value: filtered.filter(e => e.status === "idle").length, color: "text-yellow-600" },
            { label: "Break", value: filtered.filter(e => e.status === "break").length, color: "text-blue-600" },
          ].map(s => (
            <div key={s.label}>
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          center={mapCenter}
          zoom={selected ? 14 : 11}
          markers={markers}
          route={routePoints} // pass route property to Leaflet wrapper if supported
          height="100%"
        />
        {/* Map overlay legend */}
        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 space-y-2 z-10">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Legend</p>
          {[
            { color: "bg-green-500", label: "Active" },
            { color: "bg-yellow-500", label: "Idle" },
            { color: "bg-blue-500", label: "On Break" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 text-xs text-gray-600">
              <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
