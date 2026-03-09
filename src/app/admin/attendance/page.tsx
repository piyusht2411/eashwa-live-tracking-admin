"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, XCircle, Clock, Download, ChevronLeft, ChevronRight } from "lucide-react";

const employees = ["All", "Amit Verma", "Sonal Patel", "Rahul Mishra", "Kavita Nair", "Deepak Joshi"];

const attendanceData = [
  { date: "2026-03-09", name: "Amit Verma", empId: "EMP001", punchIn: "9:02", punchOut: "6:30", hours: "9h 28m", status: "present", late: false },
  { date: "2026-03-09", name: "Sonal Patel", empId: "EMP002", punchIn: "9:15", punchOut: "6:45", hours: "9h 30m", status: "present", late: false },
  { date: "2026-03-09", name: "Rahul Mishra", empId: "EMP003", punchIn: "9:55", punchOut: "—", hours: "—", status: "present", late: true },
  { date: "2026-03-09", name: "Kavita Nair", empId: "EMP004", punchIn: "9:05", punchOut: "6:00", hours: "8h 55m", status: "present", late: false },
  { date: "2026-03-09", name: "Deepak Joshi", empId: "EMP005", punchIn: "—", punchOut: "—", hours: "—", status: "absent", late: false },
  { date: "2026-03-09", name: "Mohan Lal", empId: "EMP006", punchIn: "9:45", punchOut: "—", hours: "—", status: "present", late: true },
  { date: "2026-03-09", name: "Riya Gupta", empId: "EMP007", punchIn: "—", punchOut: "—", hours: "—", status: "leave", late: false },
  { date: "2026-03-09", name: "Suresh Kumar", empId: "EMP008", punchIn: "10:10", punchOut: "5:30", hours: "7h 20m", status: "present", late: true },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  present: { label: "Present", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  absent: { label: "Absent", color: "bg-red-100 text-red-600", icon: XCircle },
  leave: { label: "On Leave", color: "bg-blue-100 text-blue-700", icon: Clock },
};

export default function AttendancePage() {
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [month, setMonth] = useState("March 2026");

  const filtered = attendanceData.filter(
    (r) => employeeFilter === "All" || r.name === employeeFilter
  );

  const stats = {
    present: attendanceData.filter(r => r.status === "present").length,
    absent: attendanceData.filter(r => r.status === "absent").length,
    leave: attendanceData.filter(r => r.status === "leave").length,
    late: attendanceData.filter(r => r.late).length,
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
          { label: "Present", value: stats.present, color: "bg-green-50 border-green-100 text-green-600" },
          { label: "Absent", value: stats.absent, color: "bg-red-50 border-red-100 text-red-500" },
          { label: "On Leave", value: stats.leave, color: "bg-blue-50 border-blue-100 text-blue-600" },
          { label: "Late Arrivals", value: stats.late, color: "bg-orange-50 border-orange-100 text-orange-500" },
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
          <button className="text-gray-400 hover:text-orange-500 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm font-semibold text-gray-700 w-28 text-center">{month}</span>
          <button className="text-gray-400 hover:text-orange-500 transition-colors"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        >
          {employees.map(e => <option key={e}>{e}</option>)}
        </select>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-4 w-4 text-orange-400" />
          Today: March 9, 2026
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Employee", "Emp ID", "Punch In", "Punch Out", "Hours", "Late?", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const sc = statusConfig[row.status];
                const StatusIcon = sc.icon;
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {row.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{row.empId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{row.punchIn}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.punchOut}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.hours}</td>
                    <td className="px-4 py-3">
                      {row.late ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">Late</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusIcon className={`h-3.5 w-3.5 ${row.status === "present" ? "text-green-500" : row.status === "absent" ? "text-red-400" : "text-blue-500"}`} />
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} records for {employeeFilter === "All" ? "all employees" : employeeFilter}
        </div>
      </div>
    </div>
  );
}
