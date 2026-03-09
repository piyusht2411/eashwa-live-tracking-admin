"use client";

import { useState } from "react";
import { ArrowLeft, MapPin, Phone, Clock, TrendingUp, Shield, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/LiveMap"), { ssr: false });

const mockEmployee = {
  id: "1", name: "Amit Verma", empId: "EMP001", dept: "Sales", manager: "Vikram Singh",
  phone: "9876543210", email: "amit.verma@eashwa.in", score: 92,
  status: "active", location: "Andheri, Mumbai", punchIn: "9:02 AM",
  homeLocation: [19.1196, 72.8468] as [number, number],
  currentLocation: [19.1300, 72.8600] as [number, number],
};

const radarData = [
  { subject: "Attendance", A: 95 }, { subject: "Punctuality", A: 88 },
  { subject: "Visits", A: 90 }, { subject: "Productive", A: 85 },
  { subject: "Distance", A: 80 }, { subject: "Tasks", A: 96 },
  { subject: "Breaks", A: 92 }, { subject: "Stock", A: 88 },
];

const weekData = [
  { day: "Mon", productive: 6.2, idle: 1.3, break: 1.5 },
  { day: "Tue", productive: 5.8, idle: 1.8, break: 1.4 },
  { day: "Wed", productive: 6.5, idle: 1.0, break: 1.5 },
  { day: "Thu", productive: 7.0, idle: 0.5, break: 1.5 },
  { day: "Fri", productive: 6.8, idle: 1.2, break: 1.0 },
  { day: "Sat", productive: 4.5, idle: 0.5, break: 1.0 },
];

const timeline = [
  { time: "9:02 AM", event: "Punch In", location: "Andheri West", type: "punch" },
  { time: "10:15 AM", event: "Visit: Raj Motors", location: "Andheri East", type: "visit" },
  { time: "11:30 AM", event: "Visit: Speed Bikes", location: "Jogeshwari", type: "visit" },
  { time: "12:45 PM", event: "Break Start", location: "Jogeshwari", type: "break" },
  { time: "1:30 PM", event: "Break End", location: "Jogeshwari", type: "break" },
  { time: "2:10 PM", event: "Visit: Moto Hub", location: "Goregaon", type: "visit" },
];

const typeConfig: Record<string, { color: string; bg: string; dot: string }> = {
  punch: { color: "text-orange-600", bg: "bg-orange-100", dot: "bg-orange-500" },
  visit: { color: "text-green-600", bg: "bg-green-100", dot: "bg-green-500" },
  break: { color: "text-blue-600", bg: "bg-blue-100", dot: "bg-blue-500" },
};

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState<"timeline" | "performance" | "hours">("timeline");
  const emp = mockEmployee;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/employees">
          <button className="p-2 rounded-xl bg-white border border-gray-200 hover:border-orange-300 text-gray-500 hover:text-orange-500 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-gray-800">{emp.name}</h1>
          <p className="text-sm text-gray-500">{emp.empId} · {emp.dept} Department</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-green-700">Active</span>
        </div>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-2xl">
              {emp.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="font-bold text-gray-800">{emp.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="text-2xl font-black text-orange-500">{emp.score}</div>
                <div className="text-xs text-gray-400">/100</div>
              </div>
              <p className="text-xs text-gray-400">Performance Score</p>
            </div>
          </div>
          <div className="space-y-2.5 text-sm">
            {[
              { icon: Phone, label: emp.phone },
              { icon: MapPin, label: emp.location },
              { icon: Briefcase, label: emp.dept },
              { icon: Shield, label: `Manager: ${emp.manager}` },
              { icon: Clock, label: `Punched in: ${emp.punchIn}` },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-gray-600">
                <Icon className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
            {[
              { label: "Visits", value: "12" },
              { label: "Distance", value: "38km" },
              { label: "Hours", value: "6.2h" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-black text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-sm text-gray-800">Current Location</span>
            </div>
            <span className="text-xs text-gray-400">Live · Updated just now</span>
          </div>
          <div className="h-64">
            <Map center={emp.currentLocation} markers={[{ position: emp.currentLocation, label: emp.name, color: "orange" }]} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex border-b border-gray-100">
          {(["timeline", "performance", "hours"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-all ${
                tab === t
                  ? "text-orange-600 border-b-2 border-orange-500 bg-orange-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "timeline" ? "Today's Timeline" : t === "performance" ? "Performance" : "Weekly Hours"}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "timeline" && (
            <div className="relative space-y-0">
              {timeline.map((item, i) => {
                const tc = typeConfig[item.type];
                return (
                  <div key={i} className="flex gap-4 pb-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${tc.dot} z-10`} />
                      {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>{item.event}</span>
                        <span className="text-xs text-gray-400">{item.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {item.location}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "performance" && (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#f3f4f6" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {tab === "hours" && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none" }} />
                <Bar dataKey="productive" fill="#f97316" name="Productive" radius={[4, 4, 0, 0]} />
                <Bar dataKey="break" fill="#fbbf24" name="Break" radius={[4, 4, 0, 0]} />
                <Bar dataKey="idle" fill="#e5e7eb" name="Idle" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
