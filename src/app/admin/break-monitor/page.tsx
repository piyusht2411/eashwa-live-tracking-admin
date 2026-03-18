"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Coffee, Search, Loader2, Clock, ChevronDown, AlertTriangle,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getBreakRecords } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

export interface BreakRecord {
  _id: string;
  employeeName: string;
  managerName?: string;
  breakStart: string;
  breakEnd?: string;
  duration?: number;
  startLocation?: { lat: number; lng: number; address: string } | null;
  endLocation?: { lat: number; lng: number; address: string } | null;
  status: "active" | "ended" | "overdue";
  date: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "On Break", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  ended: { label: "Ended", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-600", dot: "bg-red-500" },
};

const LIMIT = 20;

export default function BreakMonitorPage() {
  const [records, setRecords] = useState<BreakRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);
  const token = useSelector((state: RootState) => state.auth.authToken);

  const fetchBreaks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await getBreakRecords(token, {
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        month: !startDate && !endDate && monthFilter ? monthFilter : undefined,
      });
      setRecords(res.data || []);
      setPagination(res.pagination || null);
    } catch {
      setRecords([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedSearch, statusFilter, startDate, endDate, monthFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, startDate, endDate, monthFilter]);

  useEffect(() => {
    fetchBreaks();
  }, [fetchBreaks]);

  const clearFilters = () => {
    setSearch("");
    setMonthFilter("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setPage(1);
  };

  const hasFilters = search || monthFilter || startDate || endDate || statusFilter !== "all";

  const formatDuration = (min?: number) => {
    if (min == null) return "—";
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const activeCount = records.filter(r => r.status === "active").length;
  const overdueCount = records.filter(r => r.status === "overdue").length;
  const avgDuration = (() => {
    const withDur = records.filter(r => r.duration);
    if (!withDur.length) return 0;
    return Math.round(withDur.reduce((s, r) => s + (r.duration || 0), 0) / withDur.length);
  })();

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
          { label: "Currently On Break", value: activeCount, color: "bg-blue-50 border-blue-100 text-blue-600", icon: Coffee },
          { label: "Overdue Breaks", value: overdueCount, color: "bg-red-50 border-red-100 text-red-600", icon: AlertTriangle },
          { label: "Avg Break Duration", value: `${avgDuration} min`, color: "bg-orange-50 border-orange-100 text-orange-600", icon: Clock },
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
      {activeCount > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <p className="font-bold text-blue-800 text-sm">{activeCount} Employee{activeCount !== 1 ? "s" : ""} Currently On Break</p>
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
          onChange={e => { setMonthFilter(e.target.value); setStartDate(""); setEndDate(""); }}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        />
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setMonthFilter(""); }}
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setMonthFilter(""); }}
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
          />
        </div>
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
        {hasFilters && (
          <button
            onClick={clearFilters}
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
                {["Employee", "Manager", "Date", "Break Start", "Start Location", "Break End", "End Location", "Duration", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-400" />
                    <p className="text-sm text-gray-400">Loading break records...</p>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Coffee className="h-8 w-8 mx-auto mb-2 opacity-30 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-700">No break records found</p>
                    <p className="text-xs text-gray-400">Employee break data will appear here once available.</p>
                  </td>
                </tr>
              ) : records.map(r => {
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
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatTime(r.breakStart)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[180px]">
                      {r.startLocation?.address
                        ? <span title={r.startLocation.address} className="block truncate">{r.startLocation.address}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {r.breakEnd ? formatTime(r.breakEnd) : <span className="text-blue-500 text-xs font-medium">Ongoing</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[180px]">
                      {r.endLocation?.address
                        ? <span title={r.endLocation.address} className="block truncate">{r.endLocation.address}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${isOverdue ? "text-red-600" : "text-gray-700"}`}>
                        {formatDuration(r.duration)}
                      </span>
                      {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-red-500 inline ml-1" />}
                    </td>
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

        {/* Footer: count + pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {pagination
              ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} records`
              : `${records.length} records`}
          </p>
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={!pagination.hasPrev || loading}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      disabled={loading}
                      className={`min-w-[30px] h-[30px] text-xs rounded-lg border transition-colors ${
                        page === p
                          ? "bg-orange-500 border-orange-500 text-white font-bold"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNext || loading}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
