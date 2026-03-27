"use client";

import { useState, useMemo, useEffect } from "react";
import { Flame, Calendar, Users, X, ChevronRight, Loader2, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { getHeatmapData } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const Map = dynamic(() => import("@/components/LiveMap"), { ssr: false });

interface ZoneEmployee {
  name: string;
  visits: number;
}

interface Zone {
  lat: number;
  lng: number;
  address: string | null;
  totalVisits: number;
  uniqueVisitors: number;
  coverage: "High" | "Medium" | "Low";
  color: string;
  employees: ZoneEmployee[];
}

const PERIOD_LABELS: Record<string, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
};

const COVERAGE_COLOR: Record<string, string> = {
  High: "#ef4444",
  Medium: "#f97316",
  Low: "#3b82f6",
};

const COVERAGE_RADIUS: Record<string, number> = {
  High: 1000,
  Medium: 700,
  Low: 400,
};

export default function HeatMapPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("today");
  const [coverageFilter, setCoverageFilter] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const token = useSelector((state: RootState) => state.auth.authToken);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      setLoading(true);
      setSelectedIndex(null);
      try {
        const res = await getHeatmapData(token, period);
        if (res.success) {
          const dataWithColors = res.data.map((z: any) => ({
            ...z,
            color: z.color || (
              z.coverage === "High" ? "bg-red-100 text-red-700 border-red-200" :
              z.coverage === "Medium" ? "bg-orange-100 text-orange-700 border-orange-200" :
              "bg-blue-100 text-blue-700 border-blue-200"
            ),
          }));
          setZones(dataWithColors);
        }
      } catch (err) {
        console.error("Heatmap fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token, period]);

  const filteredZones = useMemo(() =>
    zones.filter(z => coverageFilter === "all" || z.coverage.toLowerCase() === coverageFilter),
    [zones, coverageFilter]
  );

  const selectedZone = selectedIndex !== null ? (filteredZones[selectedIndex] ?? null) : null;

  const mapMarkers = filteredZones.map((z, i) => ({
    position: [z.lat, z.lng] as [number, number],
    label: z.address || "Unknown Location",
    popup: `${z.totalVisits} visits · ${z.uniqueVisitors} unique visitor${z.uniqueVisitors !== 1 ? "s" : ""}`,
    color: COVERAGE_COLOR[z.coverage] ?? "#6b7280",
    onClick: () => setSelectedIndex(prev => prev === i ? null : i),
  }));

  const mapCircles = filteredZones.map(z => ({
    position: [z.lat, z.lng] as [number, number],
    radius: COVERAGE_RADIUS[z.coverage] ?? 500,
    color: COVERAGE_COLOR[z.coverage] ?? "#6b7280",
    fillOpacity: 0.18,
    popup: `${z.address || "Unknown Location"}: ${z.coverage} Activity`,
  }));

  const mapCenter = useMemo<[number, number]>(
    () => zones.length > 0 ? [zones[0].lat, zones[0].lng] : [29.96, 77.55],
    [zones]
  );

  const uniqueEmployees = useMemo(() => {
    const emp = new Set<string>();
    zones.forEach(z => z.employees.forEach(e => emp.add(e.name)));
    return emp.size;
  }, [zones]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Activity Heat Map</h1>
          <p className="text-sm text-gray-500">Most visited locations — visit density and employee breakdown</p>
        </div>
        <div className="flex gap-2">
          {(["today", "week", "month"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                period === p ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={coverageFilter}
          onChange={e => { setCoverageFilter(e.target.value); setSelectedIndex(null); }}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        >
          <option value="all">All Locations</option>
          <option value="high">High Activity (50+ visits)</option>
          <option value="medium">Medium Activity (20–49 visits)</option>
          <option value="low">Low Activity (3–19 visits)</option>
        </select>
        <div className="flex items-center gap-2 text-xs text-gray-400 ml-auto">
          <Calendar className="h-4 w-4" />
          {PERIOD_LABELS[period]}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "High Activity Locations", value: zones.filter(z => z.coverage === "High").length, note: "50+ GPS pings", color: "bg-red-50 border-red-100 text-red-600" },
          { label: "Medium Activity Locations", value: zones.filter(z => z.coverage === "Medium").length, note: "20–49 GPS pings", color: "bg-orange-50 border-orange-100 text-orange-600" },
          { label: "Active Employees", value: uniqueEmployees, note: "Across all locations", color: "bg-blue-50 border-blue-100 text-blue-600" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-3xl font-black">{s.value}</span>
            </div>
            <p className="text-sm font-semibold opacity-80">{s.label}</p>
            <p className="text-xs opacity-60 mt-0.5">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-sm text-gray-800">Activity Map</span>
            <div className="flex items-center gap-3 ml-auto text-xs text-gray-400">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> High</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /> Medium</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500" /> Low</div>
            </div>
          </div>
          <div className="h-96 relative">
            {loading && (
              <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center backdrop-blur-[1px]">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
              </div>
            )}
            <Map center={mapCenter} zoom={12} markers={mapMarkers} circles={mapCircles} height="100%" />
          </div>
          <div className="px-4 py-2.5 bg-orange-50 border-t border-orange-100">
            <p className="text-xs text-orange-600 font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Click a pin on the map or a location in the list to see employee breakdown
            </p>
          </div>
        </div>

        {/* Location list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-sm text-gray-800">Hot Locations</span>
            <span className="ml-auto text-xs text-gray-400">{filteredZones.length} spot{filteredZones.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto max-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-orange-400 animate-spin" />
              </div>
            ) : filteredZones.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">No locations found</div>
            ) : filteredZones.map((zone, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50/30 transition-colors text-left ${selectedIndex === i ? "bg-orange-50" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {zone.address || `${zone.lat.toFixed(4)}, ${zone.lng.toFixed(4)}`}
                    </p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex-shrink-0 ${zone.color}`}>
                      {zone.coverage}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-400" /> {zone.totalVisits} visits
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-gray-400" /> {zone.uniqueVisitors} people
                    </span>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 text-gray-300 ml-2 flex-shrink-0 transition-transform ${selectedIndex === i ? "rotate-90 text-orange-400" : ""}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location Detail Drawer */}
      {selectedZone && (
        <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-orange-100 bg-orange-50 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">
                {selectedZone.address || `${selectedZone.lat.toFixed(4)}, ${selectedZone.lng.toFixed(4)}`}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedZone.totalVisits} total visits · {selectedZone.uniqueVisitors} unique visitor{selectedZone.uniqueVisitors !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => setSelectedIndex(null)}
              className="p-1.5 rounded-lg hover:bg-orange-100 text-gray-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...selectedZone.employees].sort((a, b) => b.visits - a.visits).map((emp, i) => {
                const pct = Math.round((emp.visits / selectedZone.totalVisits) * 100);
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                        {emp.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.visits} visits · {pct}% of location</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                <span className="font-medium text-gray-600">
                  {selectedZone.uniqueVisitors} person{selectedZone.uniqueVisitors !== 1 ? "s" : ""}
                </span> visited this location during {PERIOD_LABELS[period].toLowerCase()},&nbsp;
                <span className="font-medium text-gray-600">
                  {selectedZone.employees.filter(e => e.visits > 3).length}
                </span> with repeated activity (3+ visits).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
