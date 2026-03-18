"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Bell, CheckCircle2, Loader2, Search, ChevronDown,
  WifiOff, Smartphone, MapPin, Clock, Activity,
  AlertTriangle, Coffee, Timer, ChevronLeft, ChevronRight,
  Mail, Phone, RefreshCw,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getAlerts } from "@/lib/api";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AlertRecord {
  _id: string;
  employeeName: string;
  employeeEmail: string | null;
  employeePhone: string | null;
  type: string;
  description: string;
  duration: number | null;   // hours (offline_long only), null otherwise
  timestamp: string;
  status: "open" | "resolved";
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: AlertRecord[];
}

type AlertCategory =
  | "GPS Disabled"
  | "Internet Off"
  | "Device Off"
  | "No Movement"
  | "Suspicious Activity"
  | "Offline Long"
  | "Break Exceeded"
  | "Late Arrival"
  | "Location Stopped"
  | "Auto Punch-Out";

// ── Config ────────────────────────────────────────────────────────────────────

const categoryConfig: Record<
  AlertCategory,
  { icon: React.ElementType; color: string; bg: string; border: string; dot: string }
> = {
  "GPS Disabled":         { icon: MapPin,         color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500" },
  "Internet Off":         { icon: WifiOff,         color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  "Device Off":           { icon: Smartphone,      color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", dot: "bg-purple-500" },
  "No Movement":          { icon: Activity,        color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-500" },
  "Suspicious Activity":  { icon: AlertTriangle,   color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-200",   dot: "bg-rose-500" },
  "Offline Long":         { icon: Clock,           color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  dot: "bg-amber-500" },
  "Break Exceeded":       { icon: Coffee,          color: "text-teal-600",   bg: "bg-teal-50",   border: "border-teal-200",   dot: "bg-teal-500" },
  "Late Arrival":         { icon: Timer,           color: "text-pink-600",   bg: "bg-pink-50",   border: "border-pink-200",   dot: "bg-pink-500" },
  "Location Stopped":     { icon: MapPin,          color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  "Auto Punch-Out":       { icon: Clock,           color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500" },
};

const TYPE_TO_CATEGORY: Record<string, AlertCategory> = {
  gps_disabled:        "GPS Disabled",
  internet_disabled:   "Internet Off",
  device_off:          "Device Off",
  no_movement:         "No Movement",
  suspicious_activity: "Suspicious Activity",
  offline_long:        "Offline Long",
  break_exceeded:      "Break Exceeded",
  late_arrival:        "Late Arrival",
  location_stopped:    "Location Stopped",
  auto_punch_out:      "Auto Punch-Out",
};

const matchCategory = (type: string): AlertCategory =>
  TYPE_TO_CATEGORY[type.toLowerCase()] ?? "GPS Disabled";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtTime = (ts: string) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtDate = (ts: string) =>
  new Date(ts).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });

const fmtDuration = (hours: number) => {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
};

const initials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

const AVATAR_COLORS = [
  "bg-orange-100 text-orange-700",
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const PAGE_SIZE = 50;

// ── Component ─────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const [search, setSearch]                 = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter]     = useState("all");
  const [monthFilter, setMonthFilter]       = useState("");
  const [dateFilter, setDateFilter]         = useState("");
  const [page, setPage]                     = useState(1);

  const [alerts, setAlerts]   = useState<AlertRecord[]>([]);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);

  const token = useSelector((state: RootState) => state.auth.authToken);

  const fetchAlerts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("page", String(page));
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") {
        const apiType = Object.entries(TYPE_TO_CATEGORY).find(([, v]) => v === categoryFilter)?.[0];
        if (apiType) params.set("type", apiType);
      }
      if (dateFilter) {
        params.set("from", dateFilter);
        params.set("to", dateFilter);
      } else if (monthFilter) {
        const [y, m] = monthFilter.split("-");
        const last = new Date(+y, +m, 0).getDate();
        params.set("from", `${monthFilter}-01`);
        params.set("to", `${monthFilter}-${last}`);
      }

      const res: ApiResponse = await getAlerts(token, params.toString());
      setAlerts(res.data || []);
      setTotal(res.total ?? 0);
      setPages(res.pages ?? 1);
    } catch {
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, categoryFilter, dateFilter, monthFilter]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [statusFilter, categoryFilter, dateFilter, monthFilter]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // Client-side name search (server doesn't support text search without index)
  const filtered = useMemo(() =>
    search
      ? alerts.filter(a => a.employeeName.toLowerCase().includes(search.toLowerCase()))
      : alerts,
    [alerts, search]
  );

  // Category counts from current page data
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    alerts.forEach(a => {
      const cat = matchCategory(a.type);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [alerts]);

  // Group by employee
  const byEmployee = useMemo(() => {
    const map: Record<string, AlertRecord[]> = {};
    filtered.forEach(a => {
      if (!map[a.employeeName]) map[a.employeeName] = [];
      map[a.employeeName].push(a);
    });
    return map;
  }, [filtered]);

  const hasFilters = search || monthFilter || dateFilter || categoryFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    setSearch(""); setMonthFilter(""); setDateFilter("");
    setCategoryFilter("all"); setStatusFilter("all");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-orange-500" />
            Alerts
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Employee activity alerts · {total} total
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* ── Category Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(categoryConfig) as AlertCategory[]).map(cat => {
          const cfg = categoryConfig[cat];
          const Icon = cfg.icon;
          const count = catCounts[cat] || 0;
          const active = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(active ? "all" : cat)}
              className={`rounded-2xl border p-3.5 text-left transition-all ${cfg.bg} ${cfg.border} ${
                active
                  ? "ring-2 ring-offset-1 ring-orange-400 shadow-md"
                  : "hover:shadow-sm hover:opacity-90"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-4 w-4 ${cfg.color}`} />
                {count > 0 && <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />}
              </div>
              <p className={`text-2xl font-black ${cfg.color}`}>{count}</p>
              <p className={`text-xs font-semibold ${cfg.color} opacity-75 leading-tight mt-0.5`}>{cat}</p>
            </button>
          );
        })}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-white"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white appearance-none font-medium text-gray-700"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>

        <input
          type="month"
          value={monthFilter}
          onChange={e => { setMonthFilter(e.target.value); setDateFilter(""); }}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        />

        <input
          type="date"
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setMonthFilter(""); }}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        />

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Alert Cards ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-orange-400 mb-3" />
            <p className="text-sm">Loading alerts...</p>
          </div>
        ) : Object.keys(byEmployee).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center text-gray-400">
            <CheckCircle2 className="h-9 w-9 mx-auto mb-3 text-green-400 opacity-60" />
            <p className="text-sm font-semibold text-gray-700">All clear</p>
            <p className="text-xs mt-1">No alerts match the current filters.</p>
          </div>
        ) : (
          Object.entries(byEmployee).map(([empName, empAlerts]) => {
            const first = empAlerts[0];
            const openCount = empAlerts.filter(a => a.status === "open").length;

            const empCats: Record<string, number> = {};
            empAlerts.forEach(a => {
              const cat = matchCategory(a.type);
              empCats[cat] = (empCats[cat] || 0) + 1;
            });

            return (
              <div key={empName} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Employee Header */}
                <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor(empName)}`}>
                        {initials(empName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900 text-sm">{empName}</p>
                          {openCount > 0 && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                              {openCount} open
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {first.employeeEmail && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Mail className="h-3 w-3" />
                              {first.employeeEmail}
                            </span>
                          )}
                          {first.employeePhone && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Phone className="h-3 w-3" />
                              {first.employeePhone}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {empAlerts.length} alert{empAlerts.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category badges */}
                    <div className="flex flex-wrap gap-1.5 justify-end flex-shrink-0">
                      {Object.entries(empCats).map(([cat, count]) => {
                        const cfg = categoryConfig[cat as AlertCategory];
                        return (
                          <span
                            key={cat}
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg?.bg} ${cfg?.color} ${cfg?.border}`}
                          >
                            {cat} · {count}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Alert Rows */}
                <div className="divide-y divide-gray-50">
                  {empAlerts.map(a => {
                    const cat = matchCategory(a.type);
                    const cfg = categoryConfig[cat];
                    const Icon = cfg.icon;

                    return (
                      <div key={a._id} className="px-5 py-3.5 flex items-start gap-4 hover:bg-orange-50/20 transition-colors">
                        <div className={`p-1.5 rounded-lg ${cfg.bg} flex-shrink-0 mt-0.5`}>
                          <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-gray-900">{cat}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              a.status === "open"
                                ? "bg-red-50 text-red-600"
                                : "bg-green-50 text-green-600"
                            }`}>
                              {a.status === "open" ? "Active" : "Resolved"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.description}</p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-xs text-gray-400">
                              {fmtDate(a.timestamp)} · {fmtTime(a.timestamp)}
                            </span>
                            {a.duration !== null && a.duration !== undefined && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                <Clock className="h-3 w-3" />
                                Offline {fmtDuration(a.duration)}
                              </span>
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

      {/* ── Pagination ── */}
      {!loading && pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            Page {page} of {pages} · {total} total alerts
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const pg = page <= 3 ? i + 1 : page - 2 + i;
              if (pg < 1 || pg > pages) return null;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-9 h-9 text-sm font-semibold rounded-xl transition-colors ${
                    pg === page
                      ? "bg-orange-500 text-white shadow-sm"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {!loading && (
        <p className="text-xs text-gray-400 text-center pb-2">
          Showing {filtered.length} of {total} alerts
        </p>
      )}
    </div>
  );
}