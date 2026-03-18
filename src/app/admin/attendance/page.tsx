"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, XCircle, Clock, Download, ChevronLeft, ChevronRight, Loader2, Clock1, Clock10 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getAttendance } from "@/lib/api";
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
  isLate?:boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  present: { label: "Present", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  absent: { label: "Absent", color: "bg-red-100 text-red-600", icon: XCircle },
  leave: { label: "On Leave", color: "bg-blue-100 text-blue-700", icon: Clock },
};

const toDateString = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const isToday = (d: Date) => toDateString(d) === toDateString(new Date());

export default function AttendancePage() {
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [autoPunchOutOnly, setAutoPunchOutOnly] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: RootState) => state.auth.authToken);

  const fetchAttendance = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Pass date only if not today (API defaults to today when no date given)
      const dateParam = isToday(currentDate) ? undefined : toDateString(currentDate);
      const res = await getAttendance(token, dateParam);
      setAttendanceRecords(res.data || []);
    } catch (err) {
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [token, currentDate]);

  const dayLabel = isToday(currentDate)
    ? "Today"
    : currentDate.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const prevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const canGoNext = !isToday(currentDate);

  const filtered = attendanceRecords.filter((r) => {
    if (employeeFilter !== "All" && r.user?.name !== employeeFilter) return false;
    if (autoPunchOutOnly && !r.isAutomatic && r.selfie !== null) return false;
    return true;
  });

  // Extract unique employee names for filter
  const uniqueEmployees = ["All", ...Array.from(new Set(attendanceRecords.map((r) => r.user?.name).filter(Boolean)))];


  // Group to calculate stats simply initially
  const stats = {
    records: attendanceRecords.length,
    punchesIn: attendanceRecords.filter(r => r.type === "in").length,
    punchesOut: attendanceRecords.filter(r => r.type === "out").length,
    employeesTracked: uniqueEmployees.length - 1,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Attendance</h1>
          <p className="text-sm text-gray-500">Punch In / Out records and attendance tracking</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors">
          <Download className="h-4 w-4" /> Export Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Punches", value: stats.records, color: "bg-blue-50 border-blue-100 text-blue-600" },
          { label: "Punch Ins", value: stats.punchesIn, color: "bg-green-50 border-green-100 text-green-600" },
          { label: "Punch Outs", value: stats.punchesOut, color: "bg-orange-50 border-orange-100 text-orange-600" },
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
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
          <button onClick={prevDay} className="text-gray-400 hover:text-orange-500 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm font-semibold text-gray-700 w-40 text-center">{dayLabel}</span>
          <button
            onClick={nextDay}
            disabled={!canGoNext}
            className="text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        >
          {uniqueEmployees.map(e => <option key={e || "unknown"}>{e}</option>)}
        </select>
        {/* <button
          onClick={() => setAutoPunchOutOnly(v => !v)}
          className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl border font-medium transition-colors ${autoPunchOutOnly ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-200 text-gray-600 hover:border-red-200"}`}
        >
          <Clock className="h-4 w-4" />
          Auto Punch-Outs Only
        </button> */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-4 w-4 text-orange-400" />
          {dayLabel} records
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Employee", "Emp ID", "Date", "Time", "Type", "Selfie", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-400" />
                    <p className="text-sm text-gray-400">Loading attendance data...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-gray-400">
                    No attendance records found for {dayLabel.toLowerCase()}.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const uName = row.user?.name || "Unknown";
                  const formatTime = new Date(row.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const formatDate = new Date(row.time).toLocaleDateString();
                  const isPunchIn = row.type === "in";
                  const isAuto = row.isAutomatic || row.selfie === null;

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
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">{formatTime}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${isPunchIn ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            {isPunchIn ? "Punch In" : "Punch Out"}
                          </span>
                          {isAuto && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit bg-red-100 text-red-600">
                              Auto Punch-Out
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isAuto ? (
                          <span className="text-xs text-red-500 font-medium">{row.reason || "Location sharing stopped"}</span>
                        ) : row.selfie ? (
                          <img src={row.selfie} alt="Selfie" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {row.isLate ? (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          )}

                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${row.isLate
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                              }`}
                          >
                            {row.isLate ? "Late" : "On Time"}
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
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} records for {employeeFilter === "All" ? "all employees" : employeeFilter} · {dayLabel}
        </div>
      </div>
    </div>
  );
}
