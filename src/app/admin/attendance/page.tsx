"use client";

import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { Calendar, CheckCircle2, XCircle, Clock, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getAttendance, exportAttendance } from "@/lib/api";
import { toast } from "sonner";

export interface AttendanceRecord {
  _id: string;
  user?: {
    _id: string;
    name: string;
    employeeId: string;
    department: string;
  };
  type: "in" | "out";
  date: string;
  time: string;
  location?: { lat: number; lng: number; address: string };
  selfie?: string | null;
  isAutomatic?: boolean;
  reason?: string;
  isLate?: boolean;
}

/** One employee-day row returned when groupByDay=true. */
interface GroupedAttendanceDay {
  _id: string;
  user?: { _id: string; name: string; employeeId: string; department: string };
  date: string;
  punchIn: { time: string; isLate?: boolean; selfie?: string | null } | null;
  punchOut: { time: string; isAutomatic?: boolean; selfie?: string | null; reason?: string | null } | null;
  totalHours: string;
}

interface UserOption { _id: string; name: string; employeeId: string; }
interface Pagination {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const toDateString = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Earliest plausible punch timestamp — guards against epoch/garbage values that
// would otherwise produce an absurd total (same guard as the mobile app).
const MIN_VALID_TS = new Date("2020-01-01T00:00:00Z").getTime();
const MAX_SESSION_MS = 24 * 60 * 60 * 1000;

/** Worked hours between a day's punch-in and punch-out, e.g. "8h 12m". */
function calcTotalHours(inISO?: string, outISO?: string): string {
  if (!inISO || !outISO) return "—";
  const inMs = new Date(inISO).getTime();
  const outMs = new Date(outISO).getTime();
  if (!Number.isFinite(inMs) || !Number.isFinite(outMs)) return "—";
  if (inMs < MIN_VALID_TS) return "—";
  const diff = outMs - inMs;
  if (diff < 0 || diff > MAX_SESSION_MS) return "—";
  const mins = Math.floor(diff / 60000);
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

/** Groups punch events by employee + calendar day → earliest in / latest out. */
function buildDayPairs(records: AttendanceRecord[]): Map<string, { in?: string; out?: string }> {
  const pairs = new Map<string, { in?: string; out?: string }>();
  for (const r of records) {
    const d = new Date(r.time);
    const key = `${r.user?._id ?? "?"}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const entry = pairs.get(key) ?? {};
    if (r.type === "in") {
      if (!entry.in || new Date(r.time) < new Date(entry.in)) entry.in = r.time;
    } else {
      if (!entry.out || new Date(r.time) > new Date(entry.out)) entry.out = r.time;
    }
    pairs.set(key, entry);
  }
  return pairs;
}

/** Returns the pairing key for a single record (must match buildDayPairs). */
function dayPairKey(r: AttendanceRecord): string {
  const d = new Date(r.time);
  return `${r.user?._id ?? "?"}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function AttendancePage() {
  const token = useSelector((state: RootState) => state.auth.authToken);

  // Filter state
  const [filterMode, setFilterMode] = useState<"day" | "month">("day");
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedUserId, setSelectedUserId] = useState("");
  const [page, setPage] = useState(1);

  // Data state — day-grouped rows (one per employee per day, with total hours)
  const [attendanceRecords, setAttendanceRecords] = useState<GroupedAttendanceDay[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const fetchAttendance = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: "20", groupByDay: "true" };
      if (filterMode === "day") {
        params.date = selectedDate;
      } else {
        params.month = String(selectedMonth);
        params.year = String(selectedYear);
      }
      if (selectedUserId) params.userId = selectedUserId;

      const res = await getAttendance(token, params);
      setAttendanceRecords(res.data || []);
      setPagination(res.pagination || null);
      if (res.users?.length) setUsers(res.users);
    } catch (err) {
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [token, filterMode, selectedDate, selectedMonth, selectedYear, selectedUserId, page]);

  // Reset to page 1 when filters change
  const changeFilter = (fn: () => void) => {
    setPage(1);
    fn();
  };

  const prevDay = () => changeFilter(() => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(toDateString(d));
  });

  const nextDay = () => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + 1);
    if (toDateString(d) <= toDateString(new Date())) {
      changeFilter(() => setSelectedDate(toDateString(d)));
    }
  };

  const canGoNext = selectedDate < toDateString(new Date());

  const exportToExcel = async () => {
    if (!token) return;
    try {
      setExportLoading(true);
      const params: Record<string, string> = {};
      if (filterMode === "day") {
        params.date = selectedDate;
      } else {
        params.month = String(selectedMonth);
        params.year = String(selectedYear);
      }
      if (selectedUserId) params.userId = selectedUserId;

      const res = await exportAttendance(token, params);
      const records: AttendanceRecord[] = res.data || [];

      const exportPairs = buildDayPairs(records);
      const rows = records.map((r) => ({
        Employee: r.user?.name || "Unknown",
        "Emp ID": r.user?.employeeId || "—",
        Department: r.user?.department || "—",
        Date: new Date(r.time).toLocaleDateString(),
        Time: new Date(r.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        Type: r.type === "in" ? "Punch In" : "Punch Out",
        Total: r.type === "out"
          ? calcTotalHours(exportPairs.get(dayPairKey(r))?.in, exportPairs.get(dayPairKey(r))?.out)
          : "—",
        "Auto Punch-Out": r.isAutomatic || r.selfie === null ? "Yes" : "No",
        Status: r.isLate ? "Late" : "On Time",
        Reason: r.reason || "—",
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");
      const suffix = filterMode === "day" ? selectedDate : `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
      XLSX.writeFile(wb, `attendance_${suffix}.xlsx`);
      toast.success(`Exported ${records.length} records`);
    } catch {
      toast.error("Failed to export attendance");
    } finally {
      setExportLoading(false);
    }
  };

  const stats = {
    records: pagination?.totalRecords ?? attendanceRecords.length,
    punchesIn: attendanceRecords.filter(r => r.punchIn).length,
    punchesOut: attendanceRecords.filter(r => r.punchOut).length,
    employeesTracked: new Set(attendanceRecords.map(r => r.user?._id).filter(Boolean)).size,
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const dayLabel =
    selectedDate === toDateString(new Date())
      ? "Today"
      : new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "short", day: "numeric", month: "short", year: "numeric",
        });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Attendance</h1>
          <p className="text-sm text-gray-500">Punch In / Out records and attendance tracking</p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={exportLoading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {exportLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exportLoading ? "Exporting..." : "Export Excel"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Records (days)", value: stats.records, color: "bg-blue-50 border-blue-100 text-blue-600" },
          { label: "Punched In", value: stats.punchesIn, color: "bg-green-50 border-green-100 text-green-600" },
          { label: "Punched Out", value: stats.punchesOut, color: "bg-orange-50 border-orange-100 text-orange-600" },
          { label: "Staff Recorded", value: stats.employeesTracked, color: "bg-purple-50 border-purple-100 text-purple-500" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-sm font-semibold mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Mode toggle */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
          <button
            onClick={() => changeFilter(() => setFilterMode("day"))}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${filterMode === "day" ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Day
          </button>
          <button
            onClick={() => changeFilter(() => setFilterMode("month"))}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${filterMode === "month" ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Month
          </button>
        </div>

        {/* Day filter: prev / calendar picker / next */}
        {filterMode === "day" && (
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
            <button onClick={prevDay} className="text-gray-400 hover:text-orange-500 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div
              className="relative flex items-center gap-1.5 cursor-pointer"
              onClick={() => dateInputRef.current?.showPicker?.()}
            >
              <Calendar className="h-4 w-4 text-orange-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700 w-40 text-center select-none">{dayLabel}</span>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                max={toDateString(new Date())}
                onChange={(e) => { if (e.target.value) changeFilter(() => setSelectedDate(e.target.value)); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
            <button
              onClick={nextDay}
              disabled={!canGoNext}
              className="text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Month & Year filter */}
        {filterMode === "month" && (
          <>
            <select
              value={selectedMonth}
              onChange={(e) => changeFilter(() => setSelectedMonth(Number(e.target.value)))}
              className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
            >
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => changeFilter(() => setSelectedYear(Number(e.target.value)))}
              className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </>
        )}

        {/* User filter (populated from API response) */}
        <select
          value={selectedUserId}
          onChange={(e) => changeFilter(() => setSelectedUserId(e.target.value))}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        >
          <option value="">All Employees</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>{u.name} ({u.employeeId})</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Employee", "Emp ID", "Date", "Punch In", "Punch Out", "Total", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-400" />
                    <p className="text-sm text-gray-400">Loading attendance data...</p>
                  </td>
                </tr>
              ) : attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-sm text-gray-400">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((row) => {
                  const uName = row.user?.name || "Unknown";
                  const fmtTime = (t?: string | null) =>
                    t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
                  const dateStr = new Date(row.date).toLocaleDateString();
                  const isLate = row.punchIn?.isLate ?? false;
                  const isAuto = row.punchOut?.isAutomatic ?? false;

                  return (
                    <tr key={row._id} className={`border-b border-gray-50 hover:bg-orange-50/20 transition-colors ${isAuto ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center flex-shrink-0 uppercase">
                            {uName.slice(0, 2)}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{uName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{row.user?.employeeId || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{dateStr}</td>
                      {/* Punch In */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {row.punchIn?.selfie ? (
                            <img src={row.punchIn.selfie} alt="In" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                          ) : null}
                          <span className="text-sm font-medium text-gray-700">{fmtTime(row.punchIn?.time)}</span>
                          {isLate && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Late</span>
                          )}
                        </div>
                      </td>
                      {/* Punch Out */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {row.punchOut?.selfie ? (
                            <img src={row.punchOut.selfie} alt="Out" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                          ) : null}
                          <span className="text-sm font-medium text-gray-700">{fmtTime(row.punchOut?.time)}</span>
                          {isAuto && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Auto</span>
                          )}
                        </div>
                      </td>
                      {/* Total */}
                      <td className="px-4 py-3 text-sm font-bold text-gray-800">{row.totalHours}</td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {isLate ? (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          )}
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${isLate ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {isLate ? "Late" : "On Time"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: record count + pagination */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400">
            {pagination
              ? `Showing ${Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalRecords)}–${Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)} of ${pagination.totalRecords} records`
              : `${attendanceRecords.length} records`}
          </span>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={!pagination.hasPrevPage}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <span className="text-xs text-gray-500 font-medium">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
