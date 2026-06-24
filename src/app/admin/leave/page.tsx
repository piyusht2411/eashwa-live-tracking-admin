"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Trash2,
  Loader2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  UserCheck,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  getLeaveRequests,
  updateLeaveStatus,
  deleteLeave,
  exportLeaves,
  LeaveRequestRaw,
  LeaveSummary,
} from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const statusConfig: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const leaveTypeLabel: Record<string, string> = {
  casual: "Casual",
  short: "Short",
  "half-day": "Half Day",
  half_day: "Half Day",
};

/** Inclusive leave-day count excluding Sundays (office working days are Mon–Sat). */
function countLeaveDays(start: string, end?: string | null): number {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date(start);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  if (e < s) return 1;
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    if (cur.getDay() !== 0) count++; // 0 = Sunday → skipped
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(count, 1);
}

/** Formats a leave date as a single day, or a range with working-day count. */
function formatLeaveDateRange(date: string, endDate?: string | null): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (!endDate || endDate === date) return fmt(date);
  return `${fmt(date)} → ${fmt(endDate)} (${countLeaveDays(date, endDate)} days)`;
}

export default function LeavePage() {
  const now = new Date();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestRaw[]>([]);
  const [summary, setSummary] = useState<LeaveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Month filter stored as "YYYY-MM" string (html month input value)
  const [monthFilter, setMonthFilter] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const LIMIT = 20;

  const token = useSelector((state: RootState) => state.auth.authToken);
  const { user } = useAuth();
  const role = user?.role ?? "admin";

  const fetchLeaves = useCallback(
    async (pg: number, mf: string) => {
      if (!token) return;
      try {
        setLoading(true);

        const params: { month?: number; year?: number; page: number; limit: number } = {
          page: pg,
          limit: LIMIT,
        };

        if (mf) {
          const [yr, mo] = mf.split("-").map(Number);
          params.year = yr;
          params.month = mo;
        }

        const res = await getLeaveRequests(token, params);
        setLeaveRequests(res.data || []);
        setSummary(res.summary || null);
        setTotalPages(res.pagination?.pages ?? 1);
        setTotalRecords(res.pagination?.total ?? 0);
      } catch {
        toast.error("Failed to load leave requests");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Re-fetch whenever page or month filter changes
  useEffect(() => {
    fetchLeaves(page, monthFilter);
  }, [page, monthFilter, fetchLeaves]);

  // When month changes, reset to page 1
  const handleMonthChange = (val: string) => {
    setMonthFilter(val);
    setPage(1);
  };

  const handleExport = async () => {
    if (!token) return;
    try {
      setExporting(true);

      const params: { month?: number; year?: number } = {};
      if (monthFilter) {
        const [yr, mo] = monthFilter.split("-").map(Number);
        params.year = yr;
        params.month = mo;
      }

      const res = await exportLeaves(token, params);
      const leaves = res.data || [];
      const sum = res.summary;
      const meta = res.meta;

      // Build data rows
      const rows = leaves.map((req) => ({
        "Employee Name": req.user?.name || "Unknown",
        "Employee ID": req.user?.employeeId || "",
        Department: req.user?.department || "",
        "Employee Type": req.user?.employeeType || "",
        "Leave Type": req.type,
        "Short Leave (hrs)": req.shortLeaveDuration ?? "",
        Date: req.date ? new Date(req.date).toLocaleDateString("en-IN") : "",
        "End Date":
          req.endDate && req.endDate !== req.date
            ? new Date(req.endDate).toLocaleDateString("en-IN")
            : "",
        Days: req.date ? countLeaveDays(req.date, req.endDate) : "",
        Reason: req.reason || "",
        Status: req.status,
        "Approved/Rejected By": req.approvedBy?.name || "",
        "Applied On": req.createdAt
          ? new Date(req.createdAt).toLocaleDateString("en-IN")
          : "",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);

      // Append summary block after a blank row
      if (sum) {
        const summaryStart = rows.length + 3; // +2 header + 1 blank
        XLSX.utils.sheet_add_aoa(
          ws,
          [
            [""],
            ["Summary"],
            ["Total", sum.total],
            ["Approved", sum.totalApproved],
            ["Pending", sum.totalPending],
            ["Rejected", sum.totalRejected],
            ["Casual Leaves", sum.casualTaken],
            ["Half Days", sum.halfDayTaken],
            ["Short Leave Hours", sum.shortLeaveHours],
          ],
          { origin: { r: summaryStart, c: 0 } }
        );
      }

      // Column widths (order matches the row keys above)
      ws["!cols"] = [
        { wch: 22 }, // Employee Name
        { wch: 14 }, // Employee ID
        { wch: 14 }, // Department
        { wch: 14 }, // Employee Type
        { wch: 12 }, // Leave Type
        { wch: 18 }, // Short Leave (hrs)
        { wch: 14 }, // Date
        { wch: 14 }, // End Date
        { wch: 8 },  // Days
        { wch: 50 }, // Reason
        { wch: 10 }, // Status
        { wch: 22 }, // Approved/Rejected By
        { wch: 14 }, // Applied On
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leaves");

      const monthLabel = meta
        ? `${String(meta.month).padStart(2, "0")}-${meta.year}`
        : monthFilter || "all";
      XLSX.writeFile(wb, `leaves_${monthLabel}.xlsx`);
    } catch {
      // toast imported above
      toast.error("Failed to export leave data");
    } finally {
      setExporting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    if (!token) return;
    if (role !== "manager") {
      toast.error("Only managers can approve or reject leave requests");
      return;
    }
    try {
      setUpdating(id);
      await updateLeaveStatus(token, id, status);
      toast.success(`Leave request ${status}`);
      setLeaveRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status } : req))
      );
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (role !== "admin") {
      toast.error("Only admin can delete leave records");
      return;
    }
    if (!confirm("Delete this leave record?")) return;
    try {
      await deleteLeave(token, id);
      toast.success("Leave record deleted");
      setLeaveRequests((prev) => prev.filter((req) => req._id !== id));
      setTotalRecords((p) => p - 1);
    } catch {
      toast.error("Failed to delete leave record");
    }
  };

  const displayMonth = monthFilter
    ? new Date(`${monthFilter}-01`).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "All Time";

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-800">Leave Management</h1>
        <p className="text-sm text-gray-500">
          {role === "manager"
            ? "Manage and approve leave requests"
            : "View leave records"}{" "}
          · {displayMonth}
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Pending",
              value: summary.totalPending,
              color: "text-yellow-600",
              bg: "bg-yellow-50 border-yellow-100",
            },
            {
              label: "Approved",
              value: summary.totalApproved,
              color: "text-green-600",
              bg: "bg-green-50 border-green-100",
            },
            {
              label: "Rejected",
              value: summary.totalRejected,
              color: "text-red-600",
              bg: "bg-red-50 border-red-100",
            },
            {
              label: "Casual Leaves",
              value: summary.casualTaken,
              color: "text-blue-600",
              bg: "bg-blue-50 border-blue-100",
            },
            {
              label: "Half Days",
              value: summary.halfDayTaken,
              color: "text-purple-600",
              bg: "bg-purple-50 border-purple-100",
            },
            {
              label: "Short Leave Hrs",
              value: `${summary.shortLeaveHours}h`,
              color: "text-orange-600",
              bg: "bg-orange-50 border-orange-100",
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Top bar */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-bold text-gray-700 mr-auto">Leave Requests</h2>

          {/* Month filter */}
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
          />
          {monthFilter && (
            <button
              onClick={() => handleMonthChange("")}
              className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}

          <span className="text-xs text-gray-400">{totalRecords} total records</span>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {exporting ? "Exporting..." : "Export Excel"}
          </button>
        </div>

        <div className="p-5 space-y-3">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin text-orange-400 mb-2" />
              <p className="text-sm">Loading leave requests...</p>
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              No leave requests found.
            </div>
          ) : (
            leaveRequests.map((req) => {
              const uName = req.user?.name || "Unknown";
              const empId = req.user?.employeeId || "—";
              const dept = req.user?.department || "";
              const empType = req.user?.employeeType || "";
              const dateStr = req.date
                ? formatLeaveDateRange(req.date, req.endDate)
                : "—";
              const typeLabel = leaveTypeLabel[req.type] || req.type;
              const shortDur = req.shortLeaveDuration
                ? `${req.shortLeaveDuration}h`
                : null;

              return (
                <div
                  key={req._id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-orange-50/30 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0 uppercase">
                    {uName.slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-semibold text-sm text-gray-800">{uName}</p>
                      <span className="text-xs text-gray-400">{empId}</span>
                      {dept && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                          {dept}
                        </span>
                      )}
                      {empType && (
                        <span className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-md capitalize">
                          {empType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1 font-medium capitalize">
                        <Clock className="h-3 w-3" />
                        {typeLabel}
                        {shortDur && ` (${shortDur})`}
                      </span>
                    </div>

                    {req.reason && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{req.reason}</p>
                    )}

                    {req.approvedBy && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        {req.status === "rejected" ? "Rejected" : "Approved"} by{" "}
                        {req.approvedBy.name}
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${
                      statusConfig[req.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {req.status}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    {role === "manager" && req.status === "pending" && (
                      <>
                        <button
                          disabled={updating === req._id}
                          onClick={() => handleUpdateStatus(req._id, "approved")}
                          className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          {updating === req._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          disabled={updating === req._id}
                          onClick={() => handleUpdateStatus(req._id, "rejected")}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {role === "admin" && (
                      <button
                        onClick={() => handleDelete(req._id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 pb-4 border-t border-gray-100 pt-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Page {page} of {totalPages} · {totalRecords} records
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>

              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
                )
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="text-xs text-gray-400 px-1">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      disabled={loading}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                        page === p
                          ? "bg-orange-500 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
