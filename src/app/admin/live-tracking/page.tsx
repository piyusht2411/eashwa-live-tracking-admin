"use client";

import { useState } from "react";
import { Users, Filter, RefreshCw, Navigation } from "lucide-react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/LiveMap"), { ssr: false });

const liveEmployees = [
  { id: "1", name: "Amit Verma", dept: "Sales", position: [19.1290, 72.8560] as [number, number], status: "active", lastUpdate: "Just now", speed: "42 km/h", battery: 78 },
  { id: "2", name: "Sonal Patel", dept: "Technical", position: [19.0540, 72.8375] as [number, number], status: "active", lastUpdate: "1 min ago", speed: "0 km/h", battery: 65 },
  { id: "3", name: "Rahul Mishra", dept: "Support", position: [19.0211, 72.8450] as [number, number], status: "idle", lastUpdate: "5 min ago", speed: "0 km/h", battery: 45 },
  { id: "4", name: "Kavita Nair", dept: "Sales", position: [19.1620, 72.8414] as [number, number], status: "active", lastUpdate: "30 sec ago", speed: "28 km/h", battery: 90 },
  { id: "5", name: "Deepak Joshi", dept: "Technical", position: [19.2285, 72.8580] as [number, number], status: "break", lastUpdate: "3 min ago", speed: "0 km/h", battery: 55 },
  { id: "6", name: "Mohan Lal", dept: "Sales", position: [19.2183, 72.9780] as [number, number], status: "idle", lastUpdate: "12 min ago", speed: "0 km/h", battery: 30 },
];

const statusColor: Record<string, { badge: string; dot: string; mapColor: "orange" | "green" | "default" }> = {
  active: { badge: "bg-green-100 text-green-700", dot: "bg-green-500", mapColor: "green" },
  idle: { badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500", mapColor: "orange" },
  break: { badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500", mapColor: "default" },
};

export default function LiveTrackingPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState("all");

  const filtered = liveEmployees.filter(
    (e) => deptFilter === "all" || e.dept === deptFilter
  );

  const selectedEmp = liveEmployees.find((e) => e.id === selected);
  const mapCenter: [number, number] = selectedEmp
    ? selectedEmp.position
    : [19.1, 72.87];

  const markers = filtered.map((e) => ({
    position: e.position,
    label: e.name,
    color: statusColor[e.status]?.mapColor ?? "default",
    popup: `${e.dept} · ${e.status} · ${e.lastUpdate}`,
  }));

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
            <button className="p-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">{filtered.length} employees tracked</span>
          </div>
          {/* Dept filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="mt-3 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-orange-400 outline-none bg-gray-50"
          >
            <option value="all">All Departments</option>
            <option value="Sales">Sales</option>
            <option value="Technical">Technical</option>
            <option value="Support">Support</option>
          </select>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filtered.map((emp) => {
            const sc = statusColor[emp.status];
            const isSelected = selected === emp.id;
            return (
              <button
                key={emp.id}
                onClick={() => setSelected(isSelected ? null : emp.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
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
                    <p className="text-xs text-gray-400 mt-0.5">{emp.dept}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.badge}`}>{emp.status}</span>
                  <span className="text-xs text-gray-400">{emp.lastUpdate}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                  <span>🚗 {emp.speed}</span>
                  <span>🔋 {emp.battery}%</span>
                </div>
              </button>
            );
          })}
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
