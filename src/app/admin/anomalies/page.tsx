"use client";

import { useState, useEffect, useMemo } from "react";
import { Bell, CheckCircle2, Loader2, Search, ChevronDown, Wifi, WifiOff, Smartphone, MapPin, Package, Clock } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getAnomalies } from "@/lib/api";
import { toast } from "sonner";

export interface AnomalyRecord {
  _id: string;
  user?: string | {
    _id: string;
    name: string;
    employeeId: string;
    department: string;
  };
  type: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  duration?: number; // minutes GPS was disabled, etc.
}

type AlertCategory = "GPS Disabled" | "Phone Switched Off" | "Internet Off" | "App Uninstalled" | "Same Location Activity" | "Location Sharing Stopped" | "Auto Punch-Out by System";

const categoryConfig: Record<AlertCategory, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  "GPS Disabled": { icon: MapPin, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  "Phone Switched Off": { icon: Smartphone, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  "Internet Off": { icon: WifiOff, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  "App Uninstalled": { icon: Package, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
  "Same Location Activity": { icon: MapPin, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  "Location Sharing Stopped": { icon: MapPin, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  "Auto Punch-Out by System": { icon: Clock, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
};

function matchCategory(type: string): AlertCategory {
  const t = type.toLowerCase();
  if (t === "location_stopped" || t.includes("location sharing stopped")) return "Location Sharing Stopped";
  if (t === "auto_punch_out" || t.includes("auto punch-out")) return "Auto Punch-Out by System";
  if (t.includes("gps")) return "GPS Disabled";
  if (t.includes("phone") || t.includes("switched off") || t.includes("device off")) return "Phone Switched Off";
  if (t.includes("internet") || t.includes("wifi") || t.includes("network")) return "Internet Off";
  if (t.includes("uninstall") || t.includes("app")) return "App Uninstalled";
  if (t.includes("same location") || t.includes("location punch")) return "Same Location Activity";
  return "GPS Disabled";
}

export default function AlertsPage() {
  const [monthFilter, setMonthFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: RootState) => state.auth.authToken);

  useEffect(() => {
    const fetchAnomalies = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await getAnomalies(token);
        setAnomalies(res.data || []);
      } catch {
        toast.error("Failed to load alerts");
      } finally {
        setLoading(false);
      }
    };
    fetchAnomalies();
  }, [token]);

  const mapped = useMemo(() => anomalies.map(a => ({
    ...a,
    category: matchCategory(a.type),
    employeeName: typeof a.user === "object" ? a.user?.name : "Unknown",
    employeeId: typeof a.user === "object" ? a.user?.employeeId : "—",
  })), [anomalies]);

  const filtered = useMemo(() => mapped.filter(a => {
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (search && !a.employeeName.toLowerCase().includes(search.toLowerCase())) return false;
    if (monthFilter) {
      const d = new Date(a.timestamp);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (m !== monthFilter) return false;
    }
    if (dateFilter) {
      const d = new Date(a.timestamp).toISOString().slice(0, 10);
      if (d !== dateFilter) return false;
    }
    return true;
  }), [mapped, categoryFilter, search, monthFilter, dateFilter]);

  // Group by employee name
  const byEmployee = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach(a => {
      const key = a.employeeName;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [filtered]);

  // Category counts
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (Object.keys(categoryConfig) as AlertCategory[]).forEach(k => {
      counts[k] = mapped.filter(a => a.category === k).length;
    });
    return counts;
  }, [mapped]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-800">Alerts</h1>
        <p className="text-sm text-gray-500">Employee activity alerts and policy violations</p>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(categoryConfig) as AlertCategory[]).map(cat => {
          const cfg = categoryConfig[cat];
          const Icon = cfg.icon;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
              className={`rounded-2xl border p-3 text-left transition-all ${cfg.bg} ${cfg.border} ${categoryFilter === cat ? "ring-2 ring-orange-400" : "hover:opacity-80"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${cfg.color}`} />
                <span className={`text-2xl font-black ${cfg.color}`}>{catCounts[cat] || 0}</span>
              </div>
              <p className={`text-xs font-semibold ${cfg.color} opacity-80 leading-tight`}>{cat}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by executive name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-white"
          />
        </div>
        <input
          type="month"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        />
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white appearance-none font-medium text-gray-700"
          >
            <option value="all">All Categories</option>
            {(Object.keys(categoryConfig) as AlertCategory[]).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
        {(search || monthFilter || dateFilter || categoryFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setMonthFilter(""); setDateFilter(""); setCategoryFilter("all"); }}
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Alert Cards by Employee */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-orange-400 mb-3" />
            <p>Loading alerts...</p>
          </div>
        ) : Object.keys(byEmployee).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-12 text-center text-gray-400">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50 text-green-400" />
            <p className="text-sm font-semibold text-gray-700">All clear!</p>
            <p className="text-xs">No alerts match the current filters.</p>
          </div>
        ) : (
          Object.entries(byEmployee).map(([empName, alerts]) => {
            // Count per category for this employee
            const empCats: Record<string, number> = {};
            alerts.forEach(a => {
              empCats[a.category] = (empCats[a.category] || 0) + 1;
            });

            return (
              <div key={empName} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Employee Header */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                      {empName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{empName}</p>
                      <p className="text-xs text-gray-400">{alerts[0].employeeId} · {alerts.length} alert{alerts.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(empCats).map(([cat, count]) => {
                      const cfg = categoryConfig[cat as AlertCategory];
                      return (
                        <span key={cat} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg?.bg} ${cfg?.color} border ${cfg?.border}`}>
                          {cat}: {count}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Alerts */}
                <div className="divide-y divide-gray-50">
                  {alerts.map(a => {
                    const cfg = categoryConfig[a.category];
                    const Icon = cfg.icon;
                    const dateStr = a.timestamp ? new Date(a.timestamp).toLocaleDateString() : "—";
                    const timeStr = a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
                    return (
                      <div key={a._id} className="px-5 py-3 flex items-start gap-4 hover:bg-orange-50/20 transition-colors">
                        <div className={`p-1.5 rounded-lg ${cfg.bg} flex-shrink-0 mt-0.5`}>
                          <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-gray-800">{a.category}</p>
                            {!a.resolved && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Active</span>
                            )}
                            {a.resolved && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">Resolved</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>{dateStr} · {timeStr}</span>
                            {a.duration && (
                              <span className="text-orange-500 font-medium">Duration: {a.duration} min</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-xs text-gray-400 text-center">
        Showing {filtered.length} of {anomalies.length} alerts
      </div>
    </div>
  );
}
