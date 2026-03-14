"use client";

import { useState, useEffect } from "react";
import { Trophy, Download, Medal, Loader2 } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getPerformance } from "@/lib/api";
import { toast } from "sonner";

export interface PerformanceRecord {
  _id: string;
  user?: {
    _id: string;
    name: string;
    employeeId: string;
    department: string;
  };
  score: number;
  period: string;
  metrics?: any;
}

const scoreColor = (score: number) =>
  score >= 85 ? "text-green-600" : score >= 70 ? "text-orange-500" : "text-red-500";

const rankIcon = (rank: number) => {
  if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-black text-gray-400">#{rank}</span>;
};

export default function PerformancePage() {
  const [period, setPeriod] = useState("daily");
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [selected, setSelected] = useState<PerformanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: RootState) => state.auth.authToken);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // Current spec says GET /api/performance takes ?period=daily/weekly/monthly
        // It's not in api.ts yet so we fetch all and filter client side if needed, or pass it
        // We will just invoke it and assume backend returns for the period or all periods
        const res = await getPerformance(token);
        const data = res.data || [];
        
        // Filter by period
        const periodFiltered = data.filter((r: any) => r.period === period);
        const sorted = periodFiltered.sort((a: any, b: any) => b.score - a.score);
        
        setRecords(sorted);
        if (sorted.length > 0) setSelected(sorted[0]);
        else setSelected(null);
      } catch (err) {
        toast.error("Failed to load performance metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [token, period]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Performance</h1>
          <p className="text-sm text-gray-500">Scoring leaderboard and detailed breakdown (0–100)</p>
        </div>
        <div className="flex gap-2">
          {["daily", "weekly", "monthly"].map(p => (
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
          <div className="divide-y divide-gray-50 h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-10 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin text-orange-400 mb-3" />
                <p>Loading leaderboard...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <p>No performance records found for this period.</p>
              </div>
            ) : (
              records.map((emp, idx) => {
                const rank = idx + 1;
                const uName = emp.user?.name || "Unknown";
                const dept = "Sales";

                return (
                  <button
                    key={emp._id}
                    onClick={() => setSelected(emp)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 hover:bg-orange-50/40 transition-colors text-left ${
                      selected?._id === emp._id ? "bg-orange-50/60" : ""
                    }`}
                  >
                    <div className="w-8 flex items-center justify-center flex-shrink-0">
                      {rankIcon(rank)}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0 uppercase">
                      {uName.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{uName}</p>
                      <p className="text-xs text-gray-400">{dept}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-100 rounded-full h-2 hidden sm:block">
                        <div className={`h-2 rounded-full ${emp.score >= 85 ? "bg-green-500" : emp.score >= 70 ? "bg-orange-500" : "bg-red-400"}`} style={{ width: `${emp.score}%` }} />
                      </div>
                      <span className={`text-lg font-black w-10 text-right ${scoreColor(emp.score)}`}>{emp.score}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detail breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {selected ? (
            <>
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-800 text-sm">{selected.user?.name || "Unknown"}</p>
                  <span className={`text-2xl font-black ${scoreColor(selected.score)}`}>{selected.score}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Sales · Score</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={[
                  { subject: "Distance", A: selected.metrics?.distance || 0 },
                  { subject: "Tasks", A: selected.metrics?.taskCompletion || 0 },
                  { subject: "Attendance", A: selected.metrics?.attendance || 0 },
                  { subject: "Visits", A: selected.metrics?.visits || 0 },
                ]} margin={{ top: 20, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#f3f4f6" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <Radar dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                {[
                  { label: "Distance", value: `${selected.metrics?.distance || 0} km` },
                  { label: "Tasks Done", value: selected.metrics?.taskCompletion || 0 },
                  { label: "Attendance", value: selected.metrics?.attendance || 0 },
                  { label: "Visits", value: selected.metrics?.visits || 0 },
                ].map((m: any) => (
                  <div key={m.label} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                    <span className="text-gray-500">{m.label}</span>
                    <span className={`font-bold text-gray-700`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-10 flex items-center justify-center text-gray-400 h-full">
              <p>Select an employee to view details.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
