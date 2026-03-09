"use client";

import { useState } from "react";
import { Trophy, TrendingUp, Download, Medal } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const performanceData = [
  { rank: 1, name: "Amit Verma", dept: "Sales", score: 92, attendance: 95, punctuality: 88, visits: 90, productive: 85, distance: 80, tasks: 96, breaks: 92, stock: 88 },
  { rank: 2, name: "Sonal Patel", dept: "Technical", score: 89, attendance: 92, punctuality: 85, visits: 86, productive: 90, distance: 88, tasks: 90, breaks: 85, stock: 82 },
  { rank: 3, name: "Rahul Mishra", dept: "Support", score: 86, attendance: 88, punctuality: 80, visits: 85, productive: 88, distance: 84, tasks: 87, breaks: 80, stock: 85 },
  { rank: 4, name: "Kavita Nair", dept: "Sales", score: 84, attendance: 90, punctuality: 82, visits: 80, productive: 82, distance: 78, tasks: 84, breaks: 86, stock: 80 },
  { rank: 5, name: "Deepak Joshi", dept: "Technical", score: 81, attendance: 85, punctuality: 78, visits: 82, productive: 80, distance: 76, tasks: 81, breaks: 82, stock: 78 },
  { rank: 6, name: "Riya Gupta", dept: "Support", score: 71, attendance: 75, punctuality: 70, visits: 72, productive: 70, distance: 65, tasks: 71, breaks: 72, stock: 70 },
  { rank: 7, name: "Mohan Lal", dept: "Sales", score: 65, attendance: 70, punctuality: 62, visits: 65, productive: 60, distance: 60, tasks: 66, breaks: 68, stock: 62 },
  { rank: 8, name: "Suresh Kumar", dept: "Technical", score: 58, attendance: 62, punctuality: 55, visits: 60, productive: 55, distance: 52, tasks: 58, breaks: 60, stock: 56 },
];

const radarMetrics = (emp: typeof performanceData[0]) => [
  { subject: "Attendance", A: emp.attendance },
  { subject: "Punctuality", A: emp.punctuality },
  { subject: "Visits", A: emp.visits },
  { subject: "Productive", A: emp.productive },
  { subject: "Distance", A: emp.distance },
  { subject: "Tasks", A: emp.tasks },
  { subject: "Breaks", A: emp.breaks },
  { subject: "Stock", A: emp.stock },
];

const scoreColor = (score: number) =>
  score >= 85 ? "text-green-600" : score >= 70 ? "text-orange-500" : "text-red-500";

const rankIcon = (rank: number) => {
  if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-black text-gray-400">#{rank}</span>;
};

export default function PerformancePage() {
  const [period, setPeriod] = useState("month");
  const [selected, setSelected] = useState(performanceData[0]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Performance</h1>
          <p className="text-sm text-gray-500">Scoring leaderboard and detailed breakdown (0–100)</p>
        </div>
        <div className="flex gap-2">
          {["today", "week", "month"].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all capitalize ${
                period === p ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-orange-500" />
              <span className="font-bold text-gray-800">Leaderboard</span>
            </div>
            <button className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-semibold">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {performanceData.map((emp) => (
              <button
                key={emp.rank}
                onClick={() => setSelected(emp)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 hover:bg-orange-50/40 transition-colors text-left ${
                  selected.rank === emp.rank ? "bg-orange-50/60" : ""
                }`}
              >
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  {rankIcon(emp.rank)}
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {emp.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{emp.name}</p>
                  <p className="text-xs text-gray-400">{emp.dept}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-100 rounded-full h-2 hidden sm:block">
                    <div className={`h-2 rounded-full ${emp.score >= 85 ? "bg-green-500" : emp.score >= 70 ? "bg-orange-500" : "bg-red-400"}`} style={{ width: `${emp.score}%` }} />
                  </div>
                  <span className={`text-lg font-black w-10 text-right ${scoreColor(emp.score)}`}>{emp.score}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-800 text-sm">{selected.name}</p>
              <span className={`text-2xl font-black ${scoreColor(selected.score)}`}>{selected.score}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{selected.dept} · Rank #{selected.rank}</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarMetrics(selected)} margin={{ top: 20, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <Radar dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            {[
              { label: "Attendance", value: selected.attendance },
              { label: "Punctuality", value: selected.punctuality },
              { label: "Visits", value: selected.visits },
              { label: "Productive", value: selected.productive },
              { label: "Tasks", value: selected.tasks },
              { label: "Stock", value: selected.stock },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                <span className="text-gray-500">{m.label}</span>
                <span className={`font-bold ${scoreColor(m.value)}`}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department comparison */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-orange-500" />
          <h3 className="font-bold text-gray-800">Department Comparison</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[
            { dept: "Sales", avg: Math.round([92,84,65].reduce((a,b)=>a+b,0)/3) },
            { dept: "Technical", avg: Math.round([89,81,58].reduce((a,b)=>a+b,0)/3) },
            { dept: "Support", avg: Math.round([86,71].reduce((a,b)=>a+b,0)/2) },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="dept" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "none" }} />
            <Bar dataKey="avg" fill="#f97316" radius={[8, 8, 0, 0]} name="Avg Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
