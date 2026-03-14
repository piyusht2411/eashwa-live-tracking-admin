"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getAdminDashboard } from "@/lib/api";
import { toast } from "sonner";
import {
  Users, MapPin, TrendingUp, AlertTriangle,
  Clock, CheckCircle2, XCircle, Activity,
  ChevronUp, ChevronDown, ArrowRight, Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// Top performers can remain mocked for now unless the API also returns it
const topPerformers = [
  { name: "Amit Verma", dept: "Sales", score: 92, status: "active" },
  { name: "Sonal Patel", dept: "Technical", score: 89, status: "active" },
  { name: "Rahul Mishra", dept: "Support", score: 86, status: "active" },
  { name: "Kavita Nair", dept: "Sales", score: 84, status: "active" },
  { name: "Deepak Joshi", dept: "Technical", score: 81, status: "active" },
];

const colorMap: Record<string, string> = {
  orange: "bg-orange-100 text-orange-600",
  green: "bg-green-100 text-green-600",
  blue: "bg-blue-100 text-blue-600",
  red: "bg-red-100 text-red-600",
};

const severityColor: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

// Define the shape of our API response data
interface DashboardData {
  totalEmployees: number;
  activeNow: number;
  punctuality: { name: string; value: number }[];
  recentAnomalies: {
    id: string;
    employee: string;
    type: string;
    timestamp: string;
    severity: string;
    status: string;
    description?: string;
  }[];
}

export default function DashboardPage() {
  const [tab, setTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const token = useSelector((state: RootState) => state.auth.authToken);

  useEffect(() => {
    async function loadDashboard() {
      if (!token) return;
      try {
        setLoading(true);
        const response = await getAdminDashboard(token);
        setData(response.data);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [token, tab]); // Refetch if tab changes later (though current API doesn't use tab param)

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  // Compute stats array based on real data
  const statsData = [
    { label: "Total Employees", value: data.totalEmployees, icon: Users, color: "orange", change: "0", up: true, sub: "Total workforce" },
    { label: "Active Today", value: data.activeNow, icon: Activity, color: "green", change: "0", up: true, sub: "Punched in today" },
    { label: "Open Alerts", value: data.recentAnomalies.length, icon: AlertTriangle, color: "red", change: "0", up: false, sub: "Needs attention" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monday, March 9, 2026 · Field Operations Overview
          </p>
        </div>
        <div className="flex gap-2">
          {["today", "week", "month"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all capitalize"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${colorMap[stat.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`flex items-center text-xs font-semibold ${stat.up ? "text-green-600" : "text-red-500"}`}>
                  {stat.up ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-black text-gray-800">{stat.value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Punctuality Timeline / Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Punctuality Overview (Today)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.punctuality}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Productive vs Idle Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Time Distribution</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={data.punctuality} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                {data.punctuality.map((entry, i) => (
                  <Cell key={i} fill={entry.name === "On Time" ? "#22c55e" : "#f97316"} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => v} contentStyle={{ borderRadius: 8, border: "none" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {data.punctuality.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.name === "On Time" ? "#22c55e" : "#f97316" }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-bold text-gray-700">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Performers */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Top Performers</h3>
            <Link href="/admin/performance" className="text-xs text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topPerformers.map((emp, i) => (
              <div key={emp.name} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-orange-500 text-white" : i === 1 ? "bg-gray-200 text-gray-600" : "bg-orange-50 text-orange-400"}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{emp.name}</p>
                  <p className="text-xs text-gray-400">{emp.dept}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 bg-orange-500 rounded-full" style={{ width: `${emp.score}%` }} />
                  </div>
                  <span className="text-sm font-bold text-orange-600 w-8 text-right">{emp.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Recent Alerts</h3>
            <Link href="/admin/anomalies" className="text-xs text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {data.recentAnomalies.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent alerts</p>
            ) : (
              data.recentAnomalies.map((alert) => {
                const alertSeverity = (alert.severity || "Low").toLowerCase();
                const severityClass = severityColor[alertSeverity] || severityColor.low;

                return (
                  <div key={alert.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{alert.employee}</p>
                      <p className="text-xs text-gray-500">
                        {alert.type} · {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityClass} capitalize`}>
                      {alert.severity}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Status */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span className="text-gray-600">{data.activeNow} Active</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <XCircle className="h-3.5 w-3.5 text-red-400" />
              <span className="text-gray-600">{Math.max(0, data.totalEmployees - data.activeNow)} Absent/Off-duty</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-gray-600">{data.recentAnomalies.length} Alerts</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-gray-600">In Field</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
