"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Package, MapPin, Calendar, ChevronDown, Loader2, User, Clock } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getStockSubmissions } from "@/lib/api";
import { toast } from "sonner";

interface StockSubmission {
  taskId: string;
  employee: string;
  showroom: string;
  date: string;
  item: string;
  qty: number;
  itemType?: string;
}

export default function ShowroomDetailPage({ params }: { params: { showroom: string } }) {
  const showroomName = decodeURIComponent(params.showroom);
  const [submissions, setSubmissions] = useState<StockSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelFilter, setModelFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const token = useSelector((state: RootState) => state.auth.authToken);

  useEffect(() => {
    const fetchStock = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await getStockSubmissions(token);
        const all: StockSubmission[] = res.data || [];
        setSubmissions(all.filter(s => s.showroom === showroomName));
      } catch {
        toast.error("Failed to load stock data");
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [token, showroomName]);

  const models = useMemo(() => {
    const s = new Set(submissions.map(s => s.item));
    return Array.from(s).sort();
  }, [submissions]);

  const filtered = useMemo(() => submissions.filter(s => {
    if (modelFilter !== "all" && s.item !== modelFilter) return false;
    if (monthFilter) {
      const d = new Date(s.date);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (m !== monthFilter) return false;
    }
    return true;
  }), [submissions, modelFilter, monthFilter]);

  // Model-wise aggregates
  const modelAgg = useMemo(() => {
    const map: Record<string, { item: string; qty: number; count: number }> = {};
    filtered.forEach(s => {
      if (!map[s.item]) map[s.item] = { item: s.item, qty: 0, count: 0 };
      map[s.item].qty += s.qty;
      map[s.item].count += 1;
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [filtered]);

  const lastUpdate = submissions.length > 0
    ? submissions.reduce((latest, s) => new Date(s.date) > new Date(latest.date) ? s : latest, submissions[0])
    : null;

  const totalQty = filtered.reduce((s, r) => s + r.qty, 0);
  const totalBatteries = filtered.filter(s => s.item.toLowerCase().includes("battery") || s.item.toLowerCase().includes("bat")).reduce((s, r) => s + r.qty, 0);
  const totalScooters = totalQty - totalBatteries;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/stock-intelligence">
          <button className="p-2 rounded-xl bg-white border border-gray-200 hover:border-orange-300 text-gray-500 hover:text-orange-500 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            <h1 className="text-2xl font-black text-gray-800">{showroomName}</h1>
          </div>
          <p className="text-sm text-gray-500">Showroom stock details</p>
        </div>
      </div>

      {/* Last Update Info */}
      {lastUpdate && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-800">Last Updated</p>
            <div className="flex items-center gap-3 text-xs text-orange-600 mt-0.5">
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{lastUpdate.employee}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(lastUpdate.date).toLocaleDateString()} · {new Date(lastUpdate.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Stock", value: totalQty, color: "bg-gray-50 border-gray-200 text-gray-700" },
          { label: "Scooters", value: totalScooters, color: "bg-orange-50 border-orange-100 text-orange-600" },
          { label: "Batteries", value: totalBatteries, color: "bg-green-50 border-green-100 text-green-600" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-sm font-semibold mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select
            value={modelFilter}
            onChange={e => setModelFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white appearance-none font-medium text-gray-700"
          >
            <option value="all">All Models</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
        <input
          type="month"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        />
        {(modelFilter !== "all" || monthFilter) && (
          <button
            onClick={() => { setModelFilter("all"); setMonthFilter(""); }}
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Model-wise Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package className="h-4 w-4 text-orange-500" />
            <span className="font-bold text-gray-800">Model-wise Stock</span>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="py-10 flex flex-col items-center text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin text-orange-400 mb-2" />
                Loading...
              </div>
            ) : modelAgg.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">No stock data found.</div>
            ) : modelAgg.map(m => (
              <div key={m.item} className="px-5 py-3 flex items-center justify-between hover:bg-orange-50/20 transition-colors">
                <div>
                  <p className="font-semibold text-sm text-gray-800">{m.item}</p>
                  <p className="text-xs text-gray-400">{m.count} submission{m.count !== 1 ? "s" : ""}</p>
                </div>
                <span className="text-2xl font-black text-gray-700">{m.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Raw Submissions Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span className="font-bold text-gray-800">All Submissions</span>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-100">
                  {["Model", "Qty", "Executive", "Date & Time"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-400"><Loader2 className="h-5 w-5 animate-spin mx-auto text-orange-400" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-sm text-gray-400">No submissions found.</td></tr>
                ) : filtered.map((sub, i) => (
                  <tr key={sub.taskId + i} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{sub.item}</td>
                    <td className="px-4 py-3 text-sm font-black text-gray-700">{sub.qty}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{sub.employee}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(sub.date).toLocaleDateString()}<br />
                      <span className="text-gray-300">{new Date(sub.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
