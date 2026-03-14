"use client";

import { useState, useEffect, useMemo } from "react";
import { Coffee, Search, Loader2, Clock, ChevronDown, AlertTriangle } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getBreakRecords } from "@/lib/api";
import { toast } from "sonner";

export interface BreakRecord {
  _id: string;
  employeeName: string;
  managerName?: string;
  breakStart: string;
  breakEnd?: string;
  duration?: number; // minutes
  location?: string;
  status: "active" | "ended" | "overdue";
  date: string;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "On Break", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  ended: { label: "Ended", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-600", dot: "bg-red-500" },
};

export default function BreakMonitorPage() {
  const [records, setRecords] = useState<BreakRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const token = useSelector((state: RootState) => state.auth.authToken);

  useEffect(() => {
    const fetchBreaks = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await getBreakRecords(token);
        setRecords(res.data || []);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBreaks();
  }, [token]);

  const filtered = useMemo(() => records.filter(r => {
    if (search && !r.employeeName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (monthFilter) {
      const d = new Date(r.date);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (m !== monthFilter) return false;
    }
    if (dateFilter && r.date.slice(0, 10) !== dateFilter) return false;
    return true;
  }), [records, search, monthFilter, dateFilter, statusFilter]);

  const stats = useMemo(() => ({
    active: records.filter(r => r.status === "active").length,
    overdue: records.filter(r => r.status === "overdue").length,
    avgDuration: records.filter(r => r.duration).length > 0
      ? Math.round(records.filter(r => r.duration).reduce((s, r) => s + (r.duration || 0), 0) / records.filter(r => r.duration).length)
      : 0,
  }), [records]);

  const formatDuration = (min?: number) => {
    if (min == null) return "—";
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-800">Break Monitor</h1>
        <p className="text-sm text-gray-500">Track employee break activity and durations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Currently On Break", value: stats.active, color: "bg-blue-50 border-blue-100 text-blue-600", icon: Coffee },
          { label: "Overdue Breaks", value: stats.overdue, color: "bg-red-50 border-red-100 text-red-600", icon: AlertTriangle },
          { label: "Avg Break Duration", value: `${stats.avgDuration} min`, color: "bg-orange-50 border-orange-100 text-orange-600", icon: Clock },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4" />
                <span className="text-3xl font-black">{s.value}</span>
              </div>
              <p className="text-sm font-semibold opacity-80">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Currently Active Breaks */}
      {stats.active > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <p className="font-bold text-blue-800 text-sm">{stats.active} Employee{stats.active !== 1 ? "s" : ""} Currently On Break</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {records.filter(r => r.status === "active").map(r => (
              <div key={r._id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-blue-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {r.employeeName.slice(0, 1).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-800">{r.employeeName}</span>
                <span className="text-xs text-blue-500">since {formatTime(r.breakStart)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee..."
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
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white appearance-none font-medium text-gray-700"
          >
            <option value="all">All Status</option>
            <option value="active">On Break</option>
            <option value="ended">Ended</option>
            <option value="overdue">Overdue</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
        {(search || monthFilter || dateFilter || statusFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setMonthFilter(""); setDateFilter(""); setStatusFilter("all"); }}
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Employee", "Manager", "Date", "Break Start", "Break End", "Duration", "Location", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-400" />
                    <p className="text-sm text-gray-400">Loading break records...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Coffee className="h-8 w-8 mx-auto mb-2 opacity-30 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-700">No break records found</p>
                    <p className="text-xs text-gray-400">Employee break data will appear here once available.</p>
                  </td>
                </tr>
              ) : filtered.map(r => {
                const sc = statusConfig[r.status] || statusConfig.ended;
                const isOverdue = r.status === "overdue";
                return (
                  <tr key={r._id} className={`border-b border-gray-50 hover:bg-orange-50/20 transition-colors ${isOverdue ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                          {r.employeeName.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{r.employeeName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.managerName || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatTime(r.breakStart)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.breakEnd ? formatTime(r.breakEnd) : <span className="text-blue-500 text-xs font-medium">Ongoing</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${isOverdue ? "text-red-600" : "text-gray-700"}`}>
                        {formatDuration(r.duration)}
                      </span>
                      {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-red-500 inline ml-1" />}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{r.location || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {records.length} break records
        </div>
      </div>
    </div>
  );
}
