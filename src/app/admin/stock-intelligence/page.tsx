"use client";

import { useState, useEffect, useMemo } from "react";
import { Package, MapPin, Calendar, Search, ChevronRight, Loader2, User } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getStockSubmissions } from "@/lib/api";
import { toast } from "sonner";

export interface StockSubmission {
  taskId: string;
  employee: string;
  showroom: string;
  date: string;
  item: string;
  qty: number;
  itemType?: "scooter" | "battery" | string;
}

export default function StockIntelligencePage() {
  const [submissions, setSubmissions] = useState<StockSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const token = useSelector((state: RootState) => state.auth.authToken);

  useEffect(() => {
    const fetchStock = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await getStockSubmissions(token);
        const rawData: any[] = Array.isArray(res) ? res : (res.data || []);
        const flattened: StockSubmission[] = rawData.flatMap((submission: any) =>
          (submission.stock || []).map((stockItem: any) => ({
            taskId: submission._id,
            employee: submission.user?.name || "Unknown",
            showroom: submission.showroomName || "Unknown",
            date: submission.date || submission.createdAt,
            item: stockItem.kind === "battery" ? stockItem.batteryType : stockItem.model,
            qty: stockItem.kind === "battery" ? (stockItem.batteryQuantity ?? 0) : (stockItem.quantity ?? 0),
            itemType: stockItem.kind,
          }))
        );
        setSubmissions(flattened);
      } catch {
        toast.error("Failed to load stock data");
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [token]);

  // Aggregate by showroom
  const showroomData = useMemo(() => {
    const map: Record<string, {
      showroom: string;
      totalStock: number;
      scooters: number;
      batteries: number;
      lastExecutive: string;
      lastDate: string;
      submissions: StockSubmission[];
    }> = {};

    submissions.forEach(sub => {
      if (!map[sub.showroom]) {
        map[sub.showroom] = {
          showroom: sub.showroom,
          totalStock: 0,
          scooters: 0,
          batteries: 0,
          lastExecutive: sub.employee,
          lastDate: sub.date,
          submissions: [],
        };
      }
      map[sub.showroom].totalStock += sub.qty;
      map[sub.showroom].submissions.push(sub);
      // Determine type by item name heuristic or itemType field
      const isBattery = (sub.itemType === "battery") || sub.item.toLowerCase().includes("battery") || sub.item.toLowerCase().includes("bat");
      if (isBattery) {
        map[sub.showroom].batteries += sub.qty;
      } else {
        map[sub.showroom].scooters += sub.qty;
      }
      // Track most recent update
      if (new Date(sub.date) >= new Date(map[sub.showroom].lastDate)) {
        map[sub.showroom].lastExecutive = sub.employee;
        map[sub.showroom].lastDate = sub.date;
      }
    });

    return Object.values(map).sort((a, b) => b.totalStock - a.totalStock);
  }, [submissions]);

  // Filter showrooms
  const filtered = useMemo(() => showroomData.filter(s => {
    if (search && !s.lastExecutive.toLowerCase().includes(search.toLowerCase())) return false;
    if (monthFilter) {
      const d = new Date(s.lastDate);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (m !== monthFilter) return false;
    }
    return true;
  }), [showroomData, search, monthFilter]);

  const totalScooters = showroomData.reduce((s, r) => s + r.scooters, 0);
  const totalBatteries = showroomData.reduce((s, r) => s + r.batteries, 0);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-800">Sales & Stock Intelligence</h1>
        <p className="text-sm text-gray-500">Showroom-wise stock visibility and inventory insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Showrooms", value: showroomData.length, color: "bg-blue-50 border-blue-100 text-blue-600" },
          { label: "Total Scooters", value: totalScooters, color: "bg-orange-50 border-orange-100 text-orange-600" },
          { label: "Total Batteries", value: totalBatteries, color: "bg-green-50 border-green-100 text-green-600" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-sm font-semibold mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by executive name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-white"
          />
        </div>
        <input
          type="month"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        />
        {(search || monthFilter) && (
          <button
            onClick={() => { setSearch(""); setMonthFilter(""); }}
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Showroom Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400 mb-3" />
          <p>Loading stock data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-12 text-center text-gray-400">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-gray-700">No showroom data found</p>
          <p className="text-xs">No stock submissions match the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <Link
              key={s.showroom}
              href={`/admin/stock-intelligence/${encodeURIComponent(s.showroom)}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-300 hover:shadow-md transition-all group"
            >
              <div className="p-5 space-y-4">
                {/* Showroom Name */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-orange-50 border border-orange-100">
                      <MapPin className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm leading-tight">{s.showroom}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Click to view details</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-orange-400 flex-shrink-0 mt-1 transition-colors" />
                </div>

                {/* Stock Numbers */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-black text-gray-800">{s.totalStock}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Total</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-black text-orange-600">{s.scooters}</p>
                    <p className="text-xs text-orange-400 mt-0.5">Scooters</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-black text-green-600">{s.batteries}</p>
                    <p className="text-xs text-green-400 mt-0.5">Batteries</p>
                  </div>
                </div>

                {/* Executive & Date */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="font-medium">{s.lastExecutive}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {new Date(s.lastDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
