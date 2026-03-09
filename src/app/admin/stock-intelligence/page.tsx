"use client";

import { useState } from "react";
import { Package, TrendingUp, TrendingDown, AlertCircle, Battery, BarChart2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const models = [
  { name: "Eashwa Pro X", category: "Performance", sold: 142, stock: 8, trend: "fast", battery: 12, demandArea: "Mumbai South" },
  { name: "Eashwa City 125", category: "Commuter", sold: 128, stock: 22, trend: "fast", battery: 30, demandArea: "Thane" },
  { name: "Eashwa Cargo Plus", category: "Utility", sold: 89, stock: 15, trend: "fast", battery: 8, demandArea: "Navi Mumbai" },
  { name: "Eashwa Swift", category: "Commuter", sold: 74, stock: 45, trend: "medium", battery: 55, demandArea: "Pune" },
  { name: "Eashwa Legend", category: "Premium", sold: 61, stock: 31, trend: "medium", battery: 40, demandArea: "Mumbai North" },
  { name: "Eashwa Eco", category: "Eco", sold: 43, stock: 68, trend: "slow", battery: 90, demandArea: "Nashik" },
  { name: "Eashwa MaxLoad", category: "Utility", sold: 28, stock: 80, trend: "slow", battery: 110, demandArea: "Kolhapur" },
  { name: "Eashwa GT Sport", category: "Performance", sold: 19, stock: 54, trend: "slow", battery: 75, demandArea: "Aurangabad" },
];

const areaData = [
  { area: "Mumbai South", demand: 92 },
  { area: "Thane", demand: 78 },
  { area: "Navi Mumbai", demand: 65 },
  { area: "Pune", demand: 58 },
  { area: "Mumbai North", demand: 55 },
  { area: "Nashik", demand: 38 },
];

const trendConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  fast: { label: "Fast Moving", color: "text-green-600", icon: TrendingUp, bg: "bg-green-100" },
  medium: { label: "Moderate", color: "text-orange-500", icon: BarChart2, bg: "bg-orange-100" },
  slow: { label: "Slow Moving", color: "text-red-500", icon: TrendingDown, bg: "bg-red-100" },
};

export default function StockIntelligencePage() {
  const [filter, setFilter] = useState("all");

  const filtered = models.filter(m => filter === "all" || m.trend === filter);
  const alerts = models.filter(m => m.battery < 20);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-800">Sales & Stock Intelligence</h1>
        <p className="text-sm text-gray-500">Model-wise sales trends, stock levels, and area demand insights</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 text-sm">Battery Stock Alert</p>
            <p className="text-xs text-red-600 mt-0.5">
              {alerts.map(m => `${m.name} (${m.battery} units)`).join(", ")} have critically low battery stock.
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Fast Moving", value: models.filter(m => m.trend === "fast").length, color: "bg-green-50 border-green-100 text-green-600" },
          { label: "Slow Moving", value: models.filter(m => m.trend === "slow").length, color: "bg-red-50 border-red-100 text-red-500" },
          { label: "Low Battery Stock", value: alerts.length, color: "bg-orange-50 border-orange-100 text-orange-600" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-sm font-semibold mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Models table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-500" />
              <span className="font-bold text-gray-800">Model Overview</span>
            </div>
            <div className="flex gap-1 ml-auto">
              {["all", "fast", "medium", "slow"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                    filter === f ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-orange-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Model", "Category", "Sold", "Stock", "Battery", "Trend"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const tc = trendConfig[m.trend];
                  const TrendIcon = tc.icon;
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-orange-50/20">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                        <p className="text-xs text-gray-400">{m.demandArea}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{m.category}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-700">{m.sold}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${m.stock < 20 ? "text-red-500" : "text-gray-700"}`}>{m.stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Battery className={`h-3.5 w-3.5 ${m.battery < 20 ? "text-red-500" : "text-gray-400"}`} />
                          <span className={`text-sm ${m.battery < 20 ? "text-red-500 font-bold" : "text-gray-600"}`}>{m.battery}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit ${tc.bg}`}>
                          <TrendIcon className={`h-3 w-3 ${tc.color}`} />
                          <span className={`text-xs font-semibold ${tc.color}`}>{tc.label}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Area demand */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Area-wise Demand</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={areaData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="area" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} />
              <Bar dataKey="demand" radius={[0, 6, 6, 0]} name="Demand Score">
                {areaData.map((_, i) => (
                  <Cell key={i} fill={i < 3 ? "#f97316" : "#fed7aa"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
