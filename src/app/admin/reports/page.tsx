"use client";

import { useState } from "react";
import { FileBarChart2, Download, Calendar, Users, MapPin, Clock, Navigation, Package, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { exportReport } from "@/lib/api";
import { toast } from "sonner";

const weeklyVisits = [
  { day: "Mon", visits: 42, km: 320, hours: 8.2 },
  { day: "Tue", visits: 38, km: 290, hours: 7.8 },
  { day: "Wed", visits: 51, km: 410, hours: 9.1 },
  { day: "Thu", visits: 47, km: 380, hours: 8.6 },
  { day: "Fri", visits: 39, km: 310, hours: 7.5 },
  { day: "Sat", visits: 22, km: 170, hours: 5.2 },
];

const reportStats = [
  { label: "Total Visits", value: "239", icon: MapPin, color: "bg-orange-100 text-orange-600" },
  { label: "Distance Covered", value: "1,880 km", icon: Navigation, color: "bg-blue-100 text-blue-600" },
  { label: "Avg Working Hours", value: "7.7 h/day", icon: Clock, color: "bg-green-100 text-green-600" },
  { label: "Attendance Rate", value: "87%", icon: Users, color: "bg-purple-100 text-purple-600" },
];

const topVisitors = [
  { name: "Kavita Nair", visits: 58, km: 420 },
  { name: "Amit Verma", visits: 52, km: 390 },
  { name: "Sonal Patel", visits: 47, km: 355 },
  { name: "Deepak Joshi", visits: 44, km: 320 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState("week");
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  
  const token = useSelector((state: RootState) => state.auth.authToken);

  const handleDownload = async (type: "attendance" | "performance" | "anomalies") => {
    if (!token) return;
    setDownloadingType(type);
    try {
      const blob = await exportReport(token, type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success(`Downloaded ${type} report`);
    } catch (error: any) {
      toast.error(error.message || `Failed to download ${type} report`);
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">Auto-generated performance and activity reports</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => handleDownload("attendance")}
             disabled={downloadingType === "attendance"}
             className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
           >
             {downloadingType === "attendance" ? <Loader2 className="h-4 w-4 animate-spin"/> : <Download className="h-4 w-4 text-orange-500" />} Attendance
           </button>
           <button 
             onClick={() => handleDownload("performance")}
             disabled={downloadingType === "performance"}
             className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
           >
             {downloadingType === "performance" ? <Loader2 className="h-4 w-4 animate-spin"/> : <Download className="h-4 w-4 text-orange-500" />} Performance
           </button>
           <button 
             onClick={() => handleDownload("anomalies")}
             disabled={downloadingType === "anomalies"}
             className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-orange-200 disabled:opacity-50"
           >
             {downloadingType === "anomalies" ? <Loader2 className="h-4 w-4 animate-spin"/> : <Download className="h-4 w-4" />} Download Alerts
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {["today", "week", "month"].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg capitalize transition-all ${
                period === p ? "bg-white text-orange-600 shadow-sm" : "text-gray-500"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="h-4 w-4" />
          Mar 3 – Mar 9, 2026
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportStats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className={`p-2.5 rounded-xl w-fit ${s.color} mb-3`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-black text-gray-800">{s.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Daily Visits</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyVisits}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none" }} />
              <Bar dataKey="visits" fill="#f97316" radius={[6, 6, 0, 0]} name="Visits" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Distance Covered (km)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyVisits}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none" }} />
              <Line dataKey="km" stroke="#f97316" strokeWidth={2.5} dot={{ fill: "#f97316", strokeWidth: 0, r: 4 }} name="KM" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top visitors table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Top Performers This Week</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Rank", "Employee", "Visits", "Distance", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topVisitors.map((emp, i) => (
                <tr key={emp.name} className="border-b border-gray-50 hover:bg-orange-50/20">
                  <td className="px-3 py-3">
                    <span className={`font-black ${i === 0 ? "text-yellow-500" : "text-gray-400"}`}>#{i + 1}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center">
                        {emp.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold text-gray-700">{emp.visits}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">{emp.km} km</td>
                  <td className="px-3 py-3">
                    <button 
                       onClick={() => handleDownload("performance")}
                       disabled={downloadingType === "performance"}
                       className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 font-semibold disabled:opacity-50">
                      {downloadingType === "performance" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
