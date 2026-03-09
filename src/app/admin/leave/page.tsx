"use client";

import { useState } from "react";
import { Plus, CalendarDays, CheckCircle2, Clock, Trash2 } from "lucide-react";

const holidays = [
  { date: "Mar 14, 2026", name: "Holi", type: "National Holiday" },
  { date: "Mar 25, 2026", name: "Good Friday (Optional)", type: "Optional Holiday" },
  { date: "Apr 14, 2026", name: "Dr. Ambedkar Jayanti", type: "National Holiday" },
  { date: "Apr 18, 2026", name: "Ram Navami", type: "National Holiday" },
];

const leaveRequests = [
  { name: "Rahul Mishra", empId: "EMP003", type: "CL", from: "Mar 12", to: "Mar 13", days: 2, reason: "Personal", status: "pending" },
  { name: "Riya Gupta", empId: "EMP007", type: "Half Day", from: "Mar 10", to: "Mar 10", days: 0.5, reason: "Doctor visit", status: "approved" },
  { name: "Nitin Patil", empId: "EMP010", type: "Short Leave", from: "Mar 9", to: "Mar 9", days: 0.25, reason: "Bank work", status: "approved" },
  { name: "Preeti Shah", empId: "EMP009", type: "CL", from: "Mar 15", to: "Mar 17", days: 3, reason: "Family function", status: "pending" },
];

const leaveTypes = [
  { name: "Casual Leave (CL)", count: 12, perYear: "12 days/year", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { name: "Short Leave", count: 24, perYear: "24 per year", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { name: "Half Day", count: "—", perYear: "No limit", color: "bg-purple-50 border-purple-200 text-purple-700" },
];

const statusConfig: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

export default function LeavePage() {
  const [tab, setTab] = useState<"requests" | "holidays" | "types">("requests");

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Leave Management</h1>
          <p className="text-sm text-gray-500">Manage leaves, holidays, and leave policies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors">
          <Plus className="h-4 w-4" /> Add Holiday
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Requests", value: leaveRequests.filter(r => r.status === "pending").length, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100" },
          { label: "Approved This Month", value: leaveRequests.filter(r => r.status === "approved").length, color: "text-green-600", bg: "bg-green-50 border-green-100" },
          { label: "Upcoming Holidays", value: holidays.length, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-sm font-semibold text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex border-b border-gray-100">
          {(["requests", "holidays", "types"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-all ${
                tab === t ? "text-orange-600 border-b-2 border-orange-500 bg-orange-50/50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "requests" ? "Leave Requests" : t === "holidays" ? "Holiday Calendar" : "Leave Types"}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "requests" && (
            <div className="space-y-3">
              {leaveRequests.map((req, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-orange-50/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {req.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm text-gray-800">{req.name}</p>
                      <span className="text-xs text-gray-400">{req.empId}</span>
                    </div>
                    <p className="text-xs text-gray-500">{req.type} · {req.from} – {req.to} ({req.days}d) · {req.reason}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[req.status]}`}>{req.status}</span>
                  {req.status === "pending" && (
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors">
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "holidays" && (
            <div className="space-y-3">
              {holidays.map((h, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/40">
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100">
                    <CalendarDays className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">{h.name}</p>
                    <p className="text-xs text-gray-500">{h.date}</p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">{h.type}</span>
                  <button className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button className="w-full py-3 border-2 border-dashed border-orange-200 rounded-xl text-orange-500 hover:bg-orange-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Add Holiday
              </button>
            </div>
          )}

          {tab === "types" && (
            <div className="space-y-3">
              {leaveTypes.map((lt, i) => (
                <div key={i} className={`p-4 rounded-xl border ${lt.color} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4" />
                    <div>
                      <p className="font-semibold text-sm">{lt.name}</p>
                      <p className="text-xs opacity-70">{lt.perYear}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-black">{lt.count}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
