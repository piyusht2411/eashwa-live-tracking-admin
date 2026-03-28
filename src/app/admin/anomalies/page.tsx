"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Bell, CheckCircle2, Loader2, Search, ChevronDown,
  WifiOff, Smartphone, MapPin, Clock, Activity,
  Coffee, Timer, ChevronLeft, ChevronRight,
  Mail, Phone, RefreshCw, ShieldAlert, Zap,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getAlerts, getAnomalies } from "@/lib/api";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AlertRecord {
  _id: string;
  employeeName: string;
  employeeEmail: string | null;
  employeePhone: string | null;
  type: string;
  description: string;
  duration: number | null;
  timestamp: string;
  status: "open" | "resolved";
  createdAt: string;
}

interface AnomalyRecord {
  _id: string;
  employeeName: string;
  employeeEmail: string | null;
  employeePhone: string | null;
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: T[];
}

// ── Alert Config ──────────────────────────────────────────────────────────────

type AlertCategory =
  | "GPS Disabled" | "Internet Off" | "Device Off" | "No Movement"
  | "Offline Long" | "Late Arrival" | "Location Stopped";

const alertCategoryConfig: Record<
  AlertCategory,
  { icon: React.ElementType; color: string; bg: string; border: string; dot: string; apiType: string }
> = {
  "GPS Disabled":     { icon: MapPin,     color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500",    apiType: "gps_disabled" },
  "Internet Off":     { icon: WifiOff,    color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", apiType: "internet_disabled" },
  "Device Off":       { icon: Smartphone, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", dot: "bg-purple-500", apiType: "device_off" },
  "No Movement":      { icon: Activity,   color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-500",   apiType: "no_movement" },
  "Offline Long":     { icon: Clock,      color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  dot: "bg-amber-500",  apiType: "offline_long" },
  "Late Arrival":     { icon: Timer,      color: "text-pink-600",   bg: "bg-pink-50",   border: "border-pink-200",   dot: "bg-pink-500",   apiType: "late_arrival" },
  "Location Stopped": { icon: MapPin,     color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", apiType: "location_stopped" },
};

const ALERT_TYPE_TO_CATEGORY: Record<string, AlertCategory> = {
  gps_disabled:      "GPS Disabled",
  internet_disabled: "Internet Off",
  device_off:        "Device Off",
  no_movement:       "No Movement",
  offline_long:      "Offline Long",
  late_arrival:      "Late Arrival",
  location_stopped:  "Location Stopped",
};

const matchAlertCat = (type: string): AlertCategory =>
  ALERT_TYPE_TO_CATEGORY[type.toLowerCase()] ?? "GPS Disabled";

// ── Anomaly Config ────────────────────────────────────────────────────────────

type AnomalyCategory = "Unrealistic Speed" | "Repeated Punch" | "Excessive Idle";

const anomalyCategoryConfig: Record<
  AnomalyCategory,
  { icon: React.ElementType; color: string; bg: string; border: string; dot: string; apiType: string }
> = {
  "Unrealistic Speed": { icon: Zap,       color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500",    apiType: "unrealistic_speed" },
  "Repeated Punch":    { icon: RefreshCw, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", apiType: "repeated_punch" },
  "Excessive Idle":    { icon: Coffee,    color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  dot: "bg-amber-500",  apiType: "excessive_idle" },
};

const ANOMALY_TYPE_TO_CATEGORY: Record<string, AnomalyCategory> = {
  unrealistic_speed: "Unrealistic Speed",
  repeated_punch:    "Repeated Punch",
  excessive_idle:    "Excessive Idle",
};

const matchAnomalyCat = (type: string): AnomalyCategory =>
  ANOMALY_TYPE_TO_CATEGORY[type.toLowerCase()] ?? "GPS Manipulation";

const SEVERITY_STYLE: Record<string, string> = {
  high:   "bg-red-50 text-red-700 border border-red-200",
  medium: "bg-orange-50 text-orange-700 border border-orange-200",
  low:    "bg-blue-50 text-blue-700 border border-blue-200",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtTime = (ts: string) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtDate = (ts: string) =>
  new Date(ts).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });

const fmtDuration = (h: number) => h < 1 ? `${Math.round(h * 60)}m` : `${h.toFixed(1)}h`;

const initials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

const AVATAR_COLORS = [
  "bg-orange-100 text-orange-700", "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",     "bg-teal-100 text-teal-700",
  "bg-rose-100 text-rose-700",     "bg-amber-100 text-amber-700",
];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const PAGE_SIZE = 50;

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, pages, total, label, onChange }: {
  page: number; pages: number; total: number; label: string;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-gray-400">Page {page} of {pages} · {total} total {label}</p>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          const pg = page <= 3 ? i + 1 : page - 2 + i;
          if (pg < 1 || pg > pages) return null;
          return (
            <button key={pg} onClick={() => onChange(pg)}
              className={`w-9 h-9 text-sm font-semibold rounded-xl transition-colors ${
                pg === page ? "bg-orange-500 text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {pg}
            </button>
          );
        })}
        <button onClick={() => onChange(Math.min(pages, page + 1))} disabled={page === pages}
          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AlertsAndAnomaliesPage() {
  const token = useSelector((state: RootState) => state.auth.authToken);
  const [activeTab, setActiveTab] = useState<"alerts" | "anomalies">("alerts");

  // ── Alerts state ──
  const [alerts, setAlerts]             = useState<AlertRecord[]>([]);
  const [alertTotal, setAlertTotal]     = useState(0);
  const [alertPages, setAlertPages]     = useState(1);
  const [alertPage, setAlertPage]       = useState(1);
  const [alertLoading, setAlertLoading] = useState(true);
  const [alertSearch, setAlertSearch]           = useState("");
  const [alertCatFilter, setAlertCatFilter]     = useState<AlertCategory | "all">("all");
  const [alertStatusFilter, setAlertStatusFilter] = useState("all");
  const [alertMonthFilter, setAlertMonthFilter] = useState("");
  const [alertDateFilter, setAlertDateFilter]   = useState("");

  // ── Anomalies state ──
  const [anomalies, setAnomalies]               = useState<AnomalyRecord[]>([]);
  const [anomalyTotal, setAnomalyTotal]         = useState(0);
  const [anomalyPages, setAnomalyPages]         = useState(1);
  const [anomalyPage, setAnomalyPage]           = useState(1);
  const [anomalyLoading, setAnomalyLoading]     = useState(true);
  const [anomalySearch, setAnomalySearch]             = useState("");
  const [anomalyCatFilter, setAnomalyCatFilter]       = useState<AnomalyCategory | "all">("all");
  const [anomalyMonthFilter, setAnomalyMonthFilter]   = useState("");
  const [anomalyDateFilter, setAnomalyDateFilter]     = useState("");

  // ── Fetch alerts ──
  const fetchAlerts = useCallback(async () => {
    if (!token) return;
    setAlertLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("page", String(alertPage));
      if (alertStatusFilter !== "all") params.set("status", alertStatusFilter);
      if (alertCatFilter !== "all") params.set("type", alertCategoryConfig[alertCatFilter].apiType);
      if (alertDateFilter) {
        params.set("from", alertDateFilter); params.set("to", alertDateFilter);
      } else if (alertMonthFilter) {
        const [y, m] = alertMonthFilter.split("-");
        const last = new Date(+y, +m, 0).getDate();
        params.set("from", `${alertMonthFilter}-01`);
        params.set("to", `${alertMonthFilter}-${last}`);
      }
      const res: PaginatedResponse<AlertRecord> = await getAlerts(token, params.toString());
      setAlerts(res.data || []);
      setAlertTotal(res.total ?? 0);
      setAlertPages(res.pages ?? 1);
    } catch {
      toast.error("Failed to load alerts");
    } finally {
      setAlertLoading(false);
    }
  }, [token, alertPage, alertStatusFilter, alertCatFilter, alertDateFilter, alertMonthFilter]);

  // ── Fetch anomalies ──
  const fetchAnomalies = useCallback(async () => {
    if (!token) return;
    setAnomalyLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("page", String(anomalyPage));
      if (anomalyCatFilter !== "all") params.set("type", anomalyCategoryConfig[anomalyCatFilter].apiType);
      if (anomalyDateFilter) {
        params.set("from", anomalyDateFilter); params.set("to", anomalyDateFilter);
      } else if (anomalyMonthFilter) {
        const [y, m] = anomalyMonthFilter.split("-");
        const last = new Date(+y, +m, 0).getDate();
        params.set("from", `${anomalyMonthFilter}-01`);
        params.set("to", `${anomalyMonthFilter}-${last}`);
      }
      const res: PaginatedResponse<AnomalyRecord> = await getAnomalies(token, params.toString());
      setAnomalies(res.data || []);
      setAnomalyTotal(res.total ?? 0);
      setAnomalyPages(res.pages ?? 1);
    } catch {
      toast.error("Failed to load anomalies");
    } finally {
      setAnomalyLoading(false);
    }
  }, [token, anomalyPage, anomalyCatFilter, anomalyDateFilter, anomalyMonthFilter]);

  useEffect(() => { setAlertPage(1); }, [alertStatusFilter, alertCatFilter, alertDateFilter, alertMonthFilter]);
  useEffect(() => { setAnomalyPage(1); }, [anomalyCatFilter, anomalyDateFilter, anomalyMonthFilter]);
  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);
  useEffect(() => { fetchAnomalies(); }, [fetchAnomalies]);

  // ── Derived ──
  const filteredAlerts = useMemo(() =>
    alertSearch ? alerts.filter(a => a.employeeName.toLowerCase().includes(alertSearch.toLowerCase())) : alerts,
    [alerts, alertSearch]
  );
  const filteredAnomalies = useMemo(() =>
    anomalySearch ? anomalies.filter(a => a.employeeName.toLowerCase().includes(anomalySearch.toLowerCase())) : anomalies,
    [anomalies, anomalySearch]
  );

  const alertsByEmp = useMemo(() => {
    const map: Record<string, AlertRecord[]> = {};
    filteredAlerts.forEach(a => { (map[a.employeeName] ??= []).push(a); });
    return map;
  }, [filteredAlerts]);

  const anomaliesByEmp = useMemo(() => {
    const map: Record<string, AnomalyRecord[]> = {};
    filteredAnomalies.forEach(a => { (map[a.employeeName] ??= []).push(a); });
    return map;
  }, [filteredAnomalies]);

  // Category counts for summary cards (from current page)
  const alertCatCounts = useMemo(() => {
    const c: Partial<Record<AlertCategory, number>> = {};
    alerts.forEach(a => { const cat = matchAlertCat(a.type); c[cat] = (c[cat] || 0) + 1; });
    return c;
  }, [alerts]);

  const anomalyCatCounts = useMemo(() => {
    const c: Partial<Record<AnomalyCategory, number>> = {};
    anomalies.forEach(a => { const cat = matchAnomalyCat(a.type); c[cat] = (c[cat] || 0) + 1; });
    return c;
  }, [anomalies]);

  const alertHasFilters = alertSearch || alertMonthFilter || alertDateFilter || alertCatFilter !== "all" || alertStatusFilter !== "all";
  const anomalyHasFilters = anomalySearch || anomalyMonthFilter || anomalyDateFilter || anomalyCatFilter !== "all";

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Alerts & Anomalies</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor operational flags and suspicious behavioural patterns</p>
        </div>
        <button
          onClick={() => activeTab === "alerts" ? fetchAlerts() : fetchAnomalies()}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === "alerts"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bell className="h-4 w-4" />
          Operational Alerts
          {alertTotal > 0 && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === "alerts" ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-600"
            }`}>
              {alertTotal}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("anomalies")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === "anomalies"
              ? "bg-white text-rose-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Behavioural Anomalies
          {anomalyTotal > 0 && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === "anomalies" ? "bg-rose-100 text-rose-600" : "bg-gray-200 text-gray-600"
            }`}>
              {anomalyTotal}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB: OPERATIONAL ALERTS
      ══════════════════════════════════════════════════════ */}
      {activeTab === "alerts" && (
        <div className="space-y-5">

          {/* Category Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(Object.keys(alertCategoryConfig) as AlertCategory[]).map(cat => {
              const cfg = alertCategoryConfig[cat];
              const Icon = cfg.icon;
              const count = alertCatCounts[cat] || 0;
              const active = alertCatFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setAlertCatFilter(active ? "all" : cat)}
                  className={`rounded-2xl border p-3.5 text-left transition-all ${cfg.bg} ${cfg.border} ${
                    active ? "ring-2 ring-offset-1 ring-orange-400 shadow-md" : "hover:shadow-sm hover:opacity-90"
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

          {/* Filters */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <div className="relative flex-1 min-w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employee..."
                value={alertSearch}
                onChange={e => setAlertSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-white"
              />
            </div>
            <div className="relative">
              <select
                value={alertStatusFilter}
                onChange={e => setAlertStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white appearance-none font-medium text-gray-700"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
            <input type="month" value={alertMonthFilter}
              onChange={e => { setAlertMonthFilter(e.target.value); setAlertDateFilter(""); }}
              className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
            />
            <input type="date" value={alertDateFilter}
              onChange={e => { setAlertDateFilter(e.target.value); setAlertMonthFilter(""); }}
              className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
            />
            {alertHasFilters && (
              <button
                onClick={() => { setAlertSearch(""); setAlertMonthFilter(""); setAlertDateFilter(""); setAlertCatFilter("all"); setAlertStatusFilter("all"); }}
                className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >Clear</button>
            )}
          </div>

          {/* Alert Cards */}
          <div className="space-y-4">
            {alertLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin text-orange-400 mb-3" />
                <p className="text-sm">Loading alerts...</p>
              </div>
            ) : Object.keys(alertsByEmp).length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center text-gray-400">
                <CheckCircle2 className="h-9 w-9 mx-auto mb-3 text-green-400 opacity-60" />
                <p className="text-sm font-semibold text-gray-700">All clear</p>
                <p className="text-xs mt-1">No alerts match the current filters.</p>
              </div>
            ) : Object.entries(alertsByEmp).map(([empName, empAlerts]) => {
              const first = empAlerts[0];
              const openCount = empAlerts.filter(a => a.status === "open").length;
              const empCats: Partial<Record<AlertCategory, number>> = {};
              empAlerts.forEach(a => { const c = matchAlertCat(a.type); empCats[c] = (empCats[c] || 0) + 1; });
              return (
                <div key={empName} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                                <Mail className="h-3 w-3" />{first.employeeEmail}
                              </span>
                            )}
                            {first.employeePhone && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Phone className="h-3 w-3" />{first.employeePhone}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">{empAlerts.length} alert{empAlerts.length !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 justify-end flex-shrink-0">
                        {(Object.entries(empCats) as [AlertCategory, number][]).map(([cat, count]) => {
                          const cfg = alertCategoryConfig[cat];
                          return (
                            <span key={cat} className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                              {cat} · {count}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {empAlerts.map(a => {
                      const cat = matchAlertCat(a.type);
                      const cfg = alertCategoryConfig[cat];
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
                                a.status === "open" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                              }`}>
                                {a.status === "open" ? "Active" : "Resolved"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.description}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-xs text-gray-400">{fmtDate(a.timestamp)} · {fmtTime(a.timestamp)}</span>
                              {a.duration != null && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                  <Clock className="h-3 w-3" />Offline {fmtDuration(a.duration)}
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
            })}
          </div>

          <Pagination page={alertPage} pages={alertPages} total={alertTotal} label="alerts" onChange={setAlertPage} />
          {!alertLoading && (
            <p className="text-xs text-gray-400 text-center pb-1">Showing {filteredAlerts.length} of {alertTotal} alerts</p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: BEHAVIOURAL ANOMALIES
      ══════════════════════════════════════════════════════ */}
      {activeTab === "anomalies" && (
        <div className="space-y-5">

          {/* Category Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(Object.keys(anomalyCategoryConfig) as AnomalyCategory[]).map(cat => {
              const cfg = anomalyCategoryConfig[cat];
              const Icon = cfg.icon;
              const count = anomalyCatCounts[cat] || 0;
              const active = anomalyCatFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setAnomalyCatFilter(active ? "all" : cat)}
                  className={`rounded-2xl border p-3.5 text-left transition-all ${cfg.bg} ${cfg.border} ${
                    active ? "ring-2 ring-offset-1 ring-rose-400 shadow-md" : "hover:shadow-sm hover:opacity-90"
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

          {/* Filters */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <div className="relative flex-1 min-w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employee..."
                value={anomalySearch}
                onChange={e => setAnomalySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-white"
              />
            </div>
            <input type="month" value={anomalyMonthFilter}
              onChange={e => { setAnomalyMonthFilter(e.target.value); setAnomalyDateFilter(""); }}
              className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
            />
            <input type="date" value={anomalyDateFilter}
              onChange={e => { setAnomalyDateFilter(e.target.value); setAnomalyMonthFilter(""); }}
              className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
            />
            {anomalyHasFilters && (
              <button
                onClick={() => { setAnomalySearch(""); setAnomalyMonthFilter(""); setAnomalyDateFilter(""); setAnomalyCatFilter("all"); }}
                className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >Clear</button>
            )}
          </div>

          {/* Anomaly Cards */}
          <div className="space-y-4">
            {anomalyLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin text-rose-400 mb-3" />
                <p className="text-sm">Loading anomalies...</p>
              </div>
            ) : Object.keys(anomaliesByEmp).length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center text-gray-400">
                <CheckCircle2 className="h-9 w-9 mx-auto mb-3 text-green-400 opacity-60" />
                <p className="text-sm font-semibold text-gray-700">No anomalies detected</p>
                <p className="text-xs mt-1">No suspicious patterns found for the selected filters.</p>
              </div>
            ) : Object.entries(anomaliesByEmp).map(([empName, empAnomalies]) => {
              const first = empAnomalies[0];
              const highCount = empAnomalies.filter(a => a.severity === "high").length;
              const empCats: Partial<Record<AnomalyCategory, number>> = {};
              empAnomalies.forEach(a => { const c = matchAnomalyCat(a.type); empCats[c] = (empCats[c] || 0) + 1; });
              return (
                <div key={empName} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor(empName)}`}>
                          {initials(empName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900 text-sm">{empName}</p>
                            {highCount > 0 && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                                {highCount} high severity
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {first.employeeEmail && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Mail className="h-3 w-3" />{first.employeeEmail}
                              </span>
                            )}
                            {first.employeePhone && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Phone className="h-3 w-3" />{first.employeePhone}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">{empAnomalies.length} anomal{empAnomalies.length !== 1 ? "ies" : "y"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 justify-end flex-shrink-0">
                        {(Object.entries(empCats) as [AnomalyCategory, number][]).map(([cat, count]) => {
                          const cfg = anomalyCategoryConfig[cat];
                          return (
                            <span key={cat} className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                              {cat} · {count}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {empAnomalies.map(a => {
                      const cat = matchAnomalyCat(a.type);
                      const cfg = anomalyCategoryConfig[cat];
                      const Icon = cfg.icon;
                      return (
                        <div key={a._id} className="px-5 py-3.5 flex items-start gap-4 hover:bg-rose-50/20 transition-colors">
                          <div className={`p-1.5 rounded-lg ${cfg.bg} flex-shrink-0 mt-0.5`}>
                            <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm text-gray-900">{cat}</p>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${SEVERITY_STYLE[a.severity] ?? SEVERITY_STYLE.low}`}>
                                {a.severity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.description}</p>
                            <p className="text-xs text-gray-400 mt-1.5">{fmtDate(a.timestamp)} · {fmtTime(a.timestamp)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination page={anomalyPage} pages={anomalyPages} total={anomalyTotal} label="anomalies" onChange={setAnomalyPage} />
          {!anomalyLoading && (
            <p className="text-xs text-gray-400 text-center pb-1">Showing {filteredAnomalies.length} of {anomalyTotal} anomalies</p>
          )}
        </div>
      )}

    </div>
  );
}
