"use client";

import { useState } from "react";
import { AlertTriangle, Eye, CheckCircle2, ChevronDown, Zap } from "lucide-react";

type Severity = "high" | "medium" | "low";

const anomalies = [
  { id: 1, employee: "Riya Gupta", empId: "EMP007", type: "GPS Disabled", description: "GPS turned off for 45 minutes during field hours", time: "10:15 AM", date: "Mar 9, 2026", severity: "high" as Severity, status: "open" },
  { id: 2, employee: "Mohan Lal", empId: "EMP006", type: "Long Idle Time", description: "No movement detected for 90 minutes at same location", time: "11:42 AM", date: "Mar 9, 2026", severity: "medium" as Severity, status: "open" },
  { id: 3, employee: "Suresh Kumar", empId: "EMP008", type: "Same Location Punch", description: "Punched in/out from same coordinates 3 times", time: "9:30 AM", date: "Mar 9, 2026", severity: "low" as Severity, status: "reviewed" },
  { id: 4, employee: "Preeti Shah", empId: "EMP009", type: "Unrealistic Speed", description: "Travel speed detected at 180 km/h between two locations", time: "2:20 PM", date: "Mar 8, 2026", severity: "high" as Severity, status: "open" },
  { id: 5, employee: "Nitin Patil", empId: "EMP010", type: "Very Short Visit", description: "Visit logged for only 2 minutes at Sharma Motors", time: "3:45 PM", date: "Mar 8, 2026", severity: "low" as Severity, status: "reviewed" },
  { id: 6, employee: "Mohan Lal", empId: "EMP006", type: "GPS Manipulation", description: "Location coordinates showed impossible jump of 50km in 5 seconds", time: "4:10 PM", date: "Mar 7, 2026", severity: "high" as Severity, status: "escalated" },
];

const sevConfig: Record<Severity, { badge: string; dot: string; row: string }> = {
  high: { badge: "bg-red-100 text-red-700", dot: "bg-red-500", row: "border-l-4 border-l-red-400" },
  medium: { badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500", row: "border-l-4 border-l-yellow-400" },
  low: { badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500", row: "border-l-4 border-l-blue-300" },
};

const statusConfig: Record<string, string> = {
  open: "bg-red-50 text-red-600",
  reviewed: "bg-gray-100 text-gray-600",
  escalated: "bg-purple-100 text-purple-700",
};

const typeIcons: Record<string, string> = {
  "GPS Disabled": "📵",
  "Long Idle Time": "⏸️",
  "Same Location Punch": "📍",
  "Unrealistic Speed": "🚀",
  "Very Short Visit": "⚡",
  "GPS Manipulation": "🚨",
};

export default function AnomaliesPage() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = anomalies.filter(a => {
    const matchSev = severityFilter === "all" || a.severity === severityFilter;
    const matchStat = statusFilter === "all" || a.status === statusFilter;
    return matchSev && matchStat;
  });

  const counts = {
    high: anomalies.filter(a => a.severity === "high").length,
    medium: anomalies.filter(a => a.severity === "medium").length,
    low: anomalies.filter(a => a.severity === "low").length,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-800">Smart Anomaly Detection</h1>
        <p className="text-sm text-gray-500">System-flagged suspicious activities and policy violations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "High Severity", value: counts.high, color: "bg-red-50 border-red-100 text-red-600" },
          { label: "Medium", value: counts.medium, color: "bg-yellow-50 border-yellow-100 text-yellow-600" },
          { label: "Low", value: counts.low, color: "bg-blue-50 border-blue-100 text-blue-600" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-bold text-2xl">{s.value}</span>
            </div>
            <p className="text-sm font-semibold opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white appearance-none font-medium text-gray-700"
          >
            <option value="all">All Severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white appearance-none font-medium text-gray-700"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="reviewed">Reviewed</option>
            <option value="escalated">Escalated</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Anomaly Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtered.map((anomaly) => {
            const sc = sevConfig[anomaly.severity];
            return (
              <div key={anomaly.id} className={`p-4 flex items-start gap-4 hover:bg-orange-50/20 transition-colors ${sc.row}`}>
                <div className="text-2xl flex-shrink-0 mt-0.5">{typeIcons[anomaly.type] || "⚠️"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-bold text-sm text-gray-800">{anomaly.type}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.badge}`}>{anomaly.severity}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[anomaly.status]}`}>{anomaly.status}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1.5">{anomaly.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-medium text-gray-600">{anomaly.employee}</span>
                    <span>{anomaly.empId}</span>
                    <span>{anomaly.date} · {anomaly.time}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-500 transition-colors" title="View Details">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {anomaly.status === "open" && (
                    <button className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-500 transition-colors" title="Mark Reviewed">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors" title="Escalate">
                    <Zap className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No anomalies match your filters</p>
          </div>
        )}
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {anomalies.length} flagged events
        </div>
      </div>
    </div>
  );
}
