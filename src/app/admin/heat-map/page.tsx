"use client";

import { useState } from "react";
import { Flame, Filter, Calendar, Users } from "lucide-react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/LiveMap"), { ssr: false });

// Simulated heat map data (employee visit clusters)
const visitClusters = [
  // High density areas - these are many employees visiting here
  { position: [19.1300, 72.8560] as [number, number], label: "Andheri East Hub", popup: "42 visits this week · High density", color: "orange" as const },
  { position: [19.0544, 72.8376] as [number, number], label: "Bandra Cluster", popup: "38 visits this week · High density", color: "orange" as const },
  { position: [19.2285, 72.8580] as [number, number], label: "Borivali Zone", popup: "29 visits this week · Medium", color: "orange" as const },
  // Medium density
  { position: [19.0211, 72.8450] as [number, number], label: "Dadar Area", popup: "22 visits this week · Medium", color: "green" as const },
  { position: [19.1620, 72.8414] as [number, number], label: "Malad Market", popup: "18 visits this week · Medium", color: "green" as const },
  { position: [19.2183, 72.9780] as [number, number], label: "Thane East", popup: "15 visits this week · Medium", color: "green" as const },
];

const zones = [
  { name: "Andheri East", visits: 42, coverage: "High", color: "bg-red-100 text-red-700" },
  { name: "Bandra", visits: 38, coverage: "High", color: "bg-red-100 text-red-700" },
  { name: "Borivali", visits: 29, coverage: "Medium", color: "bg-orange-100 text-orange-700" },
  { name: "Dadar", visits: 22, coverage: "Medium", color: "bg-orange-100 text-orange-700" },
  { name: "Malad", visits: 18, coverage: "Medium", color: "bg-yellow-100 text-yellow-700" },
  { name: "Thane East", visits: 15, coverage: "Low", color: "bg-green-100 text-green-700" },
  { name: "Kurla", visits: 8, coverage: "Low", color: "bg-green-100 text-green-700" },
  { name: "Mulund", visits: 5, coverage: "Low", color: "bg-green-100 text-green-700" },
];

export default function HeatMapPage() {
  const [period, setPeriod] = useState("week");
  const [dept, setDept] = useState("all");
  const [coverageFilter, setCoverageFilter] = useState("all");

  const filteredZones = zones.filter(z => coverageFilter === "all" || z.coverage.toLowerCase() === coverageFilter);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Activity Heat Map</h1>
          <p className="text-sm text-gray-500">Visualize employee visit density and coverage zones</p>
        </div>
        <div className="flex gap-2">
          {["today", "week", "month"].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all capitalize ${
                period === p ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={dept}
          onChange={e => setDept(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        >
          <option value="all">All Departments</option>
          <option value="Sales">Sales</option>
          <option value="Technical">Technical</option>
          <option value="Support">Support</option>
        </select>
        <select
          value={coverageFilter}
          onChange={e => setCoverageFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        >
          <option value="all">All Coverage</option>
          <option value="high">High Coverage</option>
          <option value="medium">Medium Coverage</option>
          <option value="low">Low Coverage</option>
        </select>
        <div className="flex items-center gap-2 text-xs text-gray-400 ml-auto">
          <Calendar className="h-4 w-4" />
          Mar 3 – Mar 9, 2026
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "High Coverage", value: zones.filter(z => z.coverage === "High").length, note: "Dense activity", color: "bg-red-50 border-red-100 text-red-600" },
          { label: "Medium Coverage", value: zones.filter(z => z.coverage === "Medium").length, note: "Active zones", color: "bg-orange-50 border-orange-100 text-orange-600" },
          { label: "Low Coverage", value: zones.filter(z => z.coverage === "Low").length, note: "Needs attention", color: "bg-green-50 border-green-100 text-green-600" },
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
            <span className="font-semibold text-sm text-gray-800">Visit Density Map</span>
            <div className="flex items-center gap-3 ml-auto text-xs text-gray-400">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /> High</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Medium/Low</div>
            </div>
          </div>
          <div className="h-96">
            <Map
              center={[19.12, 72.87]}
              zoom={12}
              markers={visitClusters}
              height="100%"
            />
          </div>
          <div className="px-4 py-2.5 bg-orange-50 border-t border-orange-100">
            <p className="text-xs text-orange-600 font-medium flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5" />
              🟠 Orange markers = high density zones · 🟢 Green markers = medium/low coverage areas
            </p>
          </div>
        </div>

        {/* Zone list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Filter className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-sm text-gray-800">Coverage Zones</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredZones.map((zone, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-orange-50/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{zone.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{zone.visits} visits</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${zone.color}`}>
                  {zone.coverage}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
