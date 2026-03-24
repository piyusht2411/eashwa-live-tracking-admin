"use client";

import { useState, useEffect, useMemo, use } from "react";
import { ArrowLeft, MapPin, Phone, Clock, TrendingUp, Shield, Briefcase, Calendar, Loader2, Download, Package } from "lucide-react";
import Link from "next/link";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getEmployeeById, getEmployeeLocationHistory, getVisitRecords, getEmployeePerformance, getEmployeeStock } from "@/lib/api";
import { toast } from "sonner";

const Map = dynamic(() => import("@/components/LiveMap"), { ssr: false });


const weekData = [
  { day: "Mon", productive: 6.2, idle: 1.3, break: 1.5 },
  { day: "Tue", productive: 5.8, idle: 1.8, break: 1.4 },
  { day: "Wed", productive: 6.5, idle: 1.0, break: 1.5 },
  { day: "Thu", productive: 7.0, idle: 0.5, break: 1.5 },
  { day: "Fri", productive: 6.8, idle: 1.2, break: 1.0 },
  { day: "Sat", productive: 4.5, idle: 0.5, break: 1.0 },
];

interface LocationRecord {
  _id: string;
  date: string;
  time?: string;
  showroomName?: string;
  location: string;
  distance?: number;
  timeSpent?: number; // minutes
}

interface StockSubmission {
  taskId: string;
  showroom: string;
  address: string;
  date: string;
  itemType: string;
  item: string;
  qty: number;
}

type TabType = "tracking" | "performance" | "stock";

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<TabType>("tracking");
  const [emp, setEmp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locationRecords, setLocationRecords] = useState<LocationRecord[]>([]);
  const [stockRecords, setStockRecords] = useState<StockSubmission[]>([]);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);

  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [performance, setPerformance] = useState<Record<string, number> | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [monthFilter, setMonthFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [repeatFilter, setRepeatFilter] = useState(false);
  const [stockMonthFilter, setStockMonthFilter] = useState("");
  const [stockModelFilter, setStockModelFilter] = useState("all");
  const token = useSelector((state: RootState) => state.auth.authToken);

  useEffect(() => {
    const fetchEmp = async () => {
      console.log("token", token);
      console.log("params.id", id);
      if (!token || !id) return;
      try {
        setLoading(true);
        const res = await getEmployeeById(token, id);
        setEmp(res.data);
      } catch {
        toast.error("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };
    fetchEmp();
  }, [token, id]);

  // Fetch route on mount (for map center + polyline)
  useEffect(() => {
    if (!token || !id) return;
    const fetchRoute = async () => {
      try {
        const res = await getEmployeeLocationHistory(token, id);
        const route: { lat: number; lng: number; distance: number }[] = res?.data?.route ?? [];
        const pts: [number, number][] = route.map(p => [p.lat, p.lng]);
        setRoutePoints(pts);
if (pts.length > 0) setMapCenter(pts[pts.length - 1]);
      } catch {
        // silently ignore
      }
    };
    fetchRoute();
  }, [token, id]);

  // Fetch performance data
  useEffect(() => {
    if (!token || !id) return;
    getEmployeePerformance(token, id)
      .then(res => setPerformance(res.data ?? res))
      .catch(() => {});
  }, [token, id]);

  // Fetch visit records for tracking table
  useEffect(() => {
    if (tab !== "tracking") return;
    if (!token || !emp) return;

    const fetchVisits = async () => {
      try {
        setLocLoading(true);
        const res = await getVisitRecords(token, { employeeName: emp.name });
        const visits: any[] = res?.data ?? [];
        setLocationRecords(visits.map(v => ({
          _id: v._id,
          date: v.visitDate,
          time: v.visitTime,
          showroomName: v.showroomName,
          location: v.address,
          distance: v.distance,
          timeSpent: v.timeSpent,
        })));
      } catch {
        setLocationRecords([]);
      } finally {
        setLocLoading(false);
      }
    };
    fetchVisits();
  }, [tab, token, emp]);

  useEffect(() => {
    if (tab !== "stock" || !token || !id) return;
    const fetchStock = async () => {
      try {
        let start: string | undefined;
        let end: string | undefined;
        if (stockMonthFilter) {
          const [y, m] = stockMonthFilter.split("-");
          const last = new Date(+y, +m, 0).getDate();
          start = `${stockMonthFilter}-01`;
          end = `${stockMonthFilter}-${last}`;
        }
        const res = await getEmployeeStock(token, id, start, end);
        setStockRecords(res.data ?? []);
      } catch {
        // Silently handle
      }
    };
    fetchStock();
  }, [tab, token, id, stockMonthFilter]);

  // Filter location records
  const filteredLocations = useMemo(() => locationRecords.filter(r => {
    const d = new Date(r.date);
    if (monthFilter) {
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (m !== monthFilter) return false;
    }
    if (dateFilter && r.date.slice(0, 10) !== dateFilter) return false;
    return true;
  }), [locationRecords, monthFilter, dateFilter]);

  // Repeated locations (visited more than once)
  const locationCounts = useMemo(() => {
    const map: Record<string, number> = {};
    locationRecords.forEach(r => {
      const key = r.showroomName || r.location;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [locationRecords]);

  const repeatedLocations = useMemo(() =>
    Object.entries(locationCounts).filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]),
    [locationCounts]
  );

  function formatToLocalDateTime(utcString?: string | null): string {
    if (!utcString) return "—";

    const date = new Date(utcString);
    if (isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  const displayedLocations = repeatFilter
    ? filteredLocations.filter(r => locationCounts[r.showroomName || r.location] > 1)
    : filteredLocations;

  // Summary metrics — distance from route API (GPS-accurate), visits/hours from visit records
  const summaryMetrics = useMemo(() => ({
    visits: filteredLocations.length,
    distance: filteredLocations.reduce((s, r) => s + (r.distance || 0), 0).toFixed(2),
    hours: (filteredLocations.reduce((s, r) => s + (r.timeSpent || 0), 0) / 60).toFixed(1),
  }), [filteredLocations]);

  // Stock filters
  const stockModels = useMemo(() => [...new Set(stockRecords.map(s => s.item))].sort(), [stockRecords]);
  // Month filter is applied server-side; only model filter is applied client-side
  const filteredStock = useMemo(() =>
    stockModelFilter === "all" ? stockRecords : stockRecords.filter(s => s.item === stockModelFilter),
    [stockRecords, stockModelFilter]
  );

  const exportToExcel = (withFilters: boolean) => {
    const data = withFilters ? displayedLocations : locationRecords;
    const headers = ["Sr. No", "Date", "Time", "Showroom Name", "Location", "Distance (km)", "Time Spent (min)"];
    const rows = data.map((r, i) => [
      i + 1,
      new Date(r.date).toLocaleDateString(),
      r.time || new Date(r.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      r.showroomName || "—",
      r.location,
      r.distance ?? "—",
      r.timeSpent ?? "—",
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `location_tracking_${emp?.name || id}_${withFilters ? "filtered" : "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400 mb-3" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!emp) {
    return (
      <div className="p-10 text-center text-gray-500">
        <p>Employee not found.</p>
        <Link href="/admin/employees" className="text-orange-500 hover:underline mt-2 inline-block">Go back to list</Link>
      </div>
    );
  }

  const currentStatus = emp.isActive ? "Active" : "Inactive";
  const managerName = emp.managedBy?.name || "Unassigned";
  const punchInTime = emp.punchInTime || "—";
  const punchOutTime = emp.punchOutTime || "—";
  const mockScore = performance?.score ?? emp.score ?? "—";
  const mockLocation = emp.location || "Office";
  const resolvedMapCenter: [number, number] = mapCenter ?? emp.currentLocation ?? [29.9352, 77.5666];

  const tabs: { key: TabType; label: string }[] = [
    { key: "tracking", label: "Visits" },
    { key: "performance", label: "Performance" },
    { key: "stock", label: "Stock Details" },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/employees">
          <button className="p-2 rounded-xl bg-white border border-gray-200 hover:border-orange-300 text-gray-500 hover:text-orange-500 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-gray-800">{emp.name}</h1>
          <p className="text-sm text-gray-500">{emp.employeeId} · Sales</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${emp.isActive ? "bg-green-100" : "bg-red-100"}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${emp.isActive ? "bg-green-500" : "bg-red-500"}`} />
          <span className={`text-sm font-semibold ${emp.isActive ? "text-green-700" : "text-red-700"}`}>{currentStatus}</span>
        </div>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-2xl">
              {emp.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="font-bold text-gray-800">{emp.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="text-2xl font-black text-orange-500">{mockScore}</div>
                <div className="text-xs text-gray-400">/100</div>
              </div>
              <p className="text-xs text-gray-400">Performance Score</p>
            </div>
          </div>
          <div className="space-y-2.5 text-sm">
            {[
              { icon: Phone, label: emp.phone || "—" },
              { icon: MapPin, label: mockLocation },
              { icon: Briefcase, label: "Sales" },
              { icon: Shield, label: `Manager: ${managerName}` },
              { icon: Clock, label: `Punched in: ${formatToLocalDateTime(punchInTime)}` },
              { icon: Clock, label: `Punched out: ${formatToLocalDateTime(punchOutTime)}` },
            ].map(({ icon: Icon, label }, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-gray-600">
                <Icon className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
            {[
              { label: "Visits", value: summaryMetrics.visits },
              { label: "Distance", value: `${summaryMetrics.distance}km` },
              { label: "Hours", value: `${summaryMetrics.hours}h` },
            ].map(s => (
              <div key={s.label}>
                <p className="font-black text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-sm text-gray-800">Current Location</span>
            </div>
            <span className="text-xs text-gray-400">Live · Updated just now</span>
          </div>
          <div className="h-64">
            <Map center={resolvedMapCenter} markers={[{ position: resolvedMapCenter, label: emp.name, color: "orange" }]} route={routePoints} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-semibold transition-all ${tab === t.key
                ? "text-orange-600 border-b-2 border-orange-500 bg-orange-50/50"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* LOCATION TRACKING TAB */}
          {tab === "tracking" && (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Visits", value: summaryMetrics.visits },
                  { label: "Distance (km)", value: summaryMetrics.distance },
                  { label: "Hours", value: summaryMetrics.hours },
                ].map(s => (
                  <div key={s.label} className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-orange-600">{s.value}</p>
                    <p className="text-xs text-orange-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Filters + Export */}
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="month"
                  value={monthFilter}
                  onChange={e => setMonthFilter(e.target.value)}
                  className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
                />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
                />
                <button
                  onClick={() => setRepeatFilter(!repeatFilter)}
                  className={`px-3 py-2 text-sm rounded-xl border font-medium transition-colors ${repeatFilter ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}
                >
                  Repeated Locations
                </button>
                {(monthFilter || dateFilter || repeatFilter) && (
                  <button
                    onClick={() => { setMonthFilter(""); setDateFilter(""); setRepeatFilter(false); }}
                    className="px-3 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => exportToExcel(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> With Filters
                  </button>
                  <button
                    onClick={() => exportToExcel(false)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> All Records
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      {["Sr. No", "Date", "Time", "Showroom Name", "Location", "Distance", "Time Spent"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {locLoading ? (
                      <tr><td colSpan={7} className="py-10 text-center text-gray-400"><Loader2 className="h-5 w-5 animate-spin mx-auto text-orange-400" /></td></tr>
                    ) : displayedLocations.length === 0 ? (
                      <tr><td colSpan={7} className="py-8 text-center text-sm text-gray-400">No location records found.</td></tr>
                    ) : displayedLocations.map((r, i) => (
                      <tr key={r._id} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{new Date(r.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{r.time || new Date(r.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.showroomName || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{r.location}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{r.distance != null ? `${r.distance} km` : "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{r.timeSpent != null ? `${r.timeSpent} min` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PERFORMANCE TAB */}
          {tab === "performance" && (
            <div className="space-y-4">
              {performance ? (
                <>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Overall Score", value: performance.score },
                      { label: "Attendance", value: performance.attendance },
                      { label: "Punctuality", value: performance.punctuality },
                      { label: "Stock Updates", value: performance.stock },
                    ].map(s => (
                      <div key={s.label} className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-orange-600">{s.value ?? "—"}</p>
                        <p className="text-xs text-orange-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={[
                      { subject: "Attendance", A: performance.attendance },
                      { subject: "Punctuality", A: performance.punctuality },
                      { subject: "Visits", A: performance.visits },
                      { subject: "Productive", A: performance.productive },
                      { subject: "Distance", A: performance.distance },
                      { subject: "Tasks", A: performance.tasks },
                      { subject: "Breaks", A: performance.breaks },
                      { subject: "Stock", A: performance.stock },
                    ]}>
                      <PolarGrid stroke="#f3f4f6" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                      <Radar dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="py-16 flex items-center justify-center text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-400 mr-2" />
                  Loading performance data...
                </div>
              )}
            </div>
          )}

          {/* STOCK DETAILS TAB */}
          {tab === "stock" && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Submissions", value: filteredStock.length, color: "bg-blue-50 border-blue-100 text-blue-600" },
                  { label: "Total Qty", value: filteredStock.reduce((s, r) => s + r.qty, 0), color: "bg-orange-50 border-orange-100 text-orange-600" },
                  { label: "Showrooms Covered", value: new Set(filteredStock.map(s => s.showroom)).size, color: "bg-green-50 border-green-100 text-green-600" },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
                    <p className="text-xl font-black">{s.value}</p>
                    <p className="text-xs font-semibold mt-0.5 opacity-80">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="flex gap-3 flex-wrap">
                <select
                  value={stockModelFilter}
                  onChange={e => setStockModelFilter(e.target.value)}
                  className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
                >
                  <option value="all">All Models</option>
                  {stockModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input
                  type="month"
                  value={stockMonthFilter}
                  onChange={e => setStockMonthFilter(e.target.value)}
                  className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
                />
                {(stockModelFilter !== "all" || stockMonthFilter) && (
                  <button onClick={() => { setStockModelFilter("all"); setStockMonthFilter(""); }} className="px-3 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">Clear</button>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      {["Model/Item", "Showroom", "Quantity", "Date"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.length === 0 ? (
                      <tr><td colSpan={4} className="py-8 text-center text-sm text-gray-400">
                        <Package className="h-6 w-6 mx-auto mb-2 opacity-40" />
                        No stock records found.
                      </td></tr>
                    ) : filteredStock.map((s, i) => (
                      <tr key={s.taskId + i} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">{s.item}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{s.showroom}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-700">{s.qty}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(s.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
