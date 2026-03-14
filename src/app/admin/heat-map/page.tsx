"use client";

import { useState, useMemo } from "react";
import { Flame, Calendar, Users, X, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/LiveMap"), { ssr: false });

interface ZoneEmployee {
  name: string;
  visits: number;
}

interface Zone {
  name: string;
  totalVisits: number;
  coverage: "High" | "Medium" | "Low";
  color: string;
  employees: ZoneEmployee[];
  mapPosition: [number, number];
}

const zones: Zone[] = [
  {
    name: "Andheri East",
    totalVisits: 42,
    coverage: "High",
    color: "bg-red-100 text-red-700 border-red-200",
    mapPosition: [19.1300, 72.8560],
    employees: [
      { name: "Rahul Sharma", visits: 18 },
      { name: "Priya Singh", visits: 14 },
      { name: "Amit Kumar", visits: 10 },
    ],
  },
  {
    name: "Bandra",
    totalVisits: 38,
    coverage: "High",
    color: "bg-red-100 text-red-700 border-red-200",
    mapPosition: [19.0544, 72.8376],
    employees: [
      { name: "Sunita Patel", visits: 22 },
      { name: "Rahul Sharma", visits: 16 },
    ],
  },
  {
    name: "Borivali",
    totalVisits: 29,
    coverage: "Medium",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    mapPosition: [19.2285, 72.8580],
    employees: [
      { name: "Amit Kumar", visits: 15 },
      { name: "Deepak Joshi", visits: 14 },
    ],
  },
  {
    name: "Dadar",
    totalVisits: 22,
    coverage: "Medium",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    mapPosition: [19.0211, 72.8450],
    employees: [
      { name: "Priya Singh", visits: 12 },
      { name: "Ravi Rao", visits: 10 },
    ],
  },
  {
    name: "Malad",
    totalVisits: 18,
    coverage: "Medium",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    mapPosition: [19.1620, 72.8414],
    employees: [
      { name: "Deepak Joshi", visits: 10 },
      { name: "Sunita Patel", visits: 8 },
    ],
  },
  {
    name: "Thane East",
    totalVisits: 15,
    coverage: "Low",
    color: "bg-green-100 text-green-700 border-green-200",
    mapPosition: [19.2183, 72.9780],
    employees: [
      { name: "Ravi Rao", visits: 9 },
      { name: "Amit Kumar", visits: 6 },
    ],
  },
  {
    name: "Kurla",
    totalVisits: 8,
    coverage: "Low",
    color: "bg-green-100 text-green-700 border-green-200",
    mapPosition: [19.0726, 72.8793],
    employees: [
      { name: "Rahul Sharma", visits: 8 },
    ],
  },
  {
    name: "Mulund",
    totalVisits: 5,
    coverage: "Low",
    color: "bg-green-100 text-green-700 border-green-200",
    mapPosition: [19.1726, 72.9560],
    employees: [
      { name: "Priya Singh", visits: 5 },
    ],
  },
];

export default function HeatMapPage() {
  const [period, setPeriod] = useState("week");
  const [coverageFilter, setCoverageFilter] = useState("all");
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const filteredZones = useMemo(() =>
    zones.filter(z => coverageFilter === "all" || z.coverage.toLowerCase() === coverageFilter),
    [coverageFilter]
  );

  const mapMarkers = filteredZones.map(z => ({
    position: z.mapPosition,
    label: z.name,
    popup: `${z.totalVisits} visits · ${z.coverage} coverage · ${z.employees.length} employee${z.employees.length !== 1 ? "s" : ""}`,
    color: (z.coverage === "High" ? "orange" : "green") as "orange" | "green",
  }));

  // Unique employees across all zones
  const uniqueEmployees = useMemo(() => {
    const emp = new Set<string>();
    zones.forEach(z => z.employees.forEach(e => emp.add(e.name)));
    return emp.size;
  }, []);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Activity Heat Map</h1>
          <p className="text-sm text-gray-500">Coverage zone analysis – visit density and employee distribution</p>
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
          { label: "High Coverage Zones", value: zones.filter(z => z.coverage === "High").length, note: "Dense activity", color: "bg-red-50 border-red-100 text-red-600" },
          { label: "Medium Coverage Zones", value: zones.filter(z => z.coverage === "Medium").length, note: "Active zones", color: "bg-orange-50 border-orange-100 text-orange-600" },
          { label: "Active Employees", value: uniqueEmployees, note: "Across all zones", color: "bg-blue-50 border-blue-100 text-blue-600" },
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
            <span className="font-semibold text-sm text-gray-800">Coverage Zone Map</span>
            <div className="flex items-center gap-3 ml-auto text-xs text-gray-400">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /> High</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Med/Low</div>
            </div>
          </div>
          <div className="h-96">
            <Map center={[19.12, 72.87]} zoom={12} markers={mapMarkers} height="100%" />
          </div>
          <div className="px-4 py-2.5 bg-orange-50 border-t border-orange-100">
            <p className="text-xs text-orange-600 font-medium flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5" />
              Click a zone in the list to see employee breakdown
            </p>
          </div>
        </div>

        {/* Zone list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-sm text-gray-800">Coverage Zones</span>
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto max-h-[400px]">
            {filteredZones.map((zone, i) => (
              <button
                key={i}
                onClick={() => setSelectedZone(selectedZone?.name === zone.name ? null : zone)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50/30 transition-colors text-left ${selectedZone?.name === zone.name ? "bg-orange-50" : ""}`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800">{zone.name}</p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${zone.color}`}>
                      {zone.coverage}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-400" /> {zone.totalVisits} total visits
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" /> {zone.employees.length} employees
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-purple-500 font-medium">
                        Same: {Math.max(...zone.employees.map(e => e.visits))} visits
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-blue-500 font-medium">
                        Diff: {zone.employees.length} employees
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 text-gray-300 ml-2 flex-shrink-0 transition-transform ${selectedZone?.name === zone.name ? "rotate-90 text-orange-400" : ""}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Zone Detail Drawer */}
      {selectedZone && (
        <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-orange-100 bg-orange-50 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">{selectedZone.name} – Employee Breakdown</p>
              <p className="text-xs text-gray-500 mt-0.5">{selectedZone.totalVisits} total visits · {selectedZone.employees.length} employees</p>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="p-1.5 rounded-lg hover:bg-orange-100 text-gray-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedZone.employees.sort((a, b) => b.visits - a.visits).map((emp, i) => {
                const pct = Math.round((emp.visits / selectedZone.totalVisits) * 100);
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                        {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.visits} visits · {pct}% of zone</p>
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
                <span className="font-medium text-gray-600">{selectedZone.employees.length} employee{selectedZone.employees.length !== 1 ? "s" : ""}</span> visited this zone,&nbsp;
                <span className="font-medium text-gray-600">{selectedZone.employees.filter(e => e.visits > 3).length}</span> with repeated activity (3+ visits).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
