"use client";

import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { Search, Navigation, Download, Loader2, ChevronDown, Eye, Check, X, Image, Phone, MapPin, Clock, MessageSquare, Battery, Bike } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getVisitRecords, getVisitById } from "@/lib/api";
import { toast } from "sonner";

interface StockItem {
  _id: string;
  kind: "scooter" | "battery";
  model?: string;
  variation?: string;
  quantity?: number;
  batteryType?: string;
  batteryQuantity?: number;
}

interface TaskDetail {
  _id: string;
  user: { _id: string; name: string; employeeId: string };
  date: string;
  showroomName: string;
  phone: string;
  address: { lat: number; lng: number; fullAddress: string };
  photos: string[];
  stock: StockItem[];
  feedback?: string;
  nextOrderPlan?: string;
  duration?: number;
  createdAt: string;
}

export interface VisitRecord {
  _id: string;
  employeeName: string;
  managerName?: string;
  visitDate: string;
  visitTime?: string;
  showroomName: string;
  address?: string;
  timeSpent?: number; // minutes
  distance?: number;
  stockUpdated?: boolean;
  totalVehicles?: number;
  batteryCount?: number;
  photoUrl?: string;
  status: "completed" | "pending" | "cancelled";
}

const statusConfig: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600" },
};

export default function VisitsPage() {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [searchManager, setSearchManager] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [photoModal, setPhotoModal] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<TaskDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const token = useSelector((state: RootState) => state.auth.authToken);

  const openDetail = async (id: string) => {
    if (!token) return;
    try {
      setDetailLoading(true);
      setDetailModal(null);
      const data = await getVisitById(token, id);
      setDetailModal(data);
    } catch {
      toast.error("Failed to load visit details");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const fetchVisits = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await getVisitRecords(token);
        setVisits(res.data || []);
      } catch {
        // If endpoint not ready, silently show empty state
        setVisits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, [token]);

  const filtered = useMemo(() => visits.filter(v => {
    if (searchEmployee && !v.employeeName.toLowerCase().includes(searchEmployee.toLowerCase())) return false;
    if (searchManager && !(v.managerName || "").toLowerCase().includes(searchManager.toLowerCase())) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    if (monthFilter) {
      const d = new Date(v.visitDate);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (m !== monthFilter) return false;
    }
    if (dateFilter && v.visitDate.slice(0, 10) !== dateFilter) return false;
    return true;
  }), [visits, searchEmployee, searchManager, monthFilter, dateFilter, statusFilter]);

  const exportCSV = () => {
    const rows = filtered.map(v => ({
      "Employee Name": v.employeeName,
      Manager: v.managerName || "—",
      "Visit Date": new Date(v.visitDate).toLocaleDateString(),
      "Visit Time": v.visitTime || "—",
      Showroom: v.showroomName,
      Address: v.address || "—",
      "Time Spent (min)": v.timeSpent ?? "—",
      "Distance (km)": v.distance ?? "—",
      "Stock Updated": v.stockUpdated ? "Yes" : "No",
      "Total Vehicles": v.totalVehicles ?? "—",
      "Battery Count": v.batteryCount ?? "—",
      Photo: v.photoUrl ? "Yes" : "No",
      Status: v.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Visits");
    XLSX.writeFile(wb, "visit_records.xlsx");
  };

  const clearFilters = () => {
    setSearchEmployee("");
    setSearchManager("");
    setMonthFilter("");
    setDateFilter("");
    setStatusFilter("all");
  };

  const hasFilters = searchEmployee || searchManager || monthFilter || dateFilter || statusFilter !== "all";

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Visit Records</h1>
          <p className="text-sm text-gray-500">Showroom visit logs by field executives</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors"
        >
          <Download className="h-4 w-4" /> Export Excel
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Visits", value: visits.length, color: "bg-blue-50 border-blue-100 text-blue-600" },
          { label: "Completed", value: visits.filter(v => v.status === "completed").length, color: "bg-green-50 border-green-100 text-green-600" },
          { label: "Filtered Results", value: filtered.length, color: "bg-orange-50 border-orange-100 text-orange-600" },
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchEmployee}
            onChange={e => setSearchEmployee(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white w-44"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search manager..."
            value={searchManager}
            onChange={e => setSearchManager(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white w-44"
          />
        </div>
        <input
          type="month"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
        />
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white appearance-none font-medium text-gray-700"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {[
                  "Employee", "Manager", "Visit Date", "Time", "Showroom",
                  "Address", "Time Spent", "Distance", "Stock Updated",
                  "Vehicles", "Batteries", "Photo", "Status", "Action"
                ].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-400" />
                    <p className="text-sm text-gray-400">Loading visits...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center">
                    <Navigation className="h-8 w-8 mx-auto mb-2 opacity-30 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-700">No visit records found</p>
                    <p className="text-xs text-gray-400">Visits submitted by employees will appear here.</p>
                  </td>
                </tr>
              ) : filtered.map(v => {
                const sc = statusConfig[v.status] || statusConfig.pending;
                return (
                  <tr key={v._id} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{v.employeeName}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{v.managerName || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(v.visitDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{v.visitTime || "—"}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{v.showroomName}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{v.address || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{v.timeSpent != null ? `${v.timeSpent} min` : "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{v.distance != null ? `${v.distance} km` : "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {v.stockUpdated ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-gray-300 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-semibold text-gray-700">{v.totalVehicles ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-center font-semibold text-gray-700">{v.batteryCount ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {v.photoUrl ? (
                        <button onClick={() => setPhotoModal(v.photoUrl!)} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 transition-colors mx-auto block">
                          <Image className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openDetail(v._id)} className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-500 transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {visits.length} visit records
        </div>
      </div>

      {/* Visit Detail Modal */}
      {(detailLoading || detailModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
              </div>
            ) : detailModal && (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <div>
                    <p className="font-bold text-gray-800">{detailModal.showroomName}</p>
                    <p className="text-xs text-gray-400">{new Date(detailModal.date).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setDetailModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Employee & Meta */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Employee</p>
                      <p className="font-semibold text-gray-800 text-sm">{detailModal.user.name}</p>
                      <p className="text-xs text-gray-400">{detailModal.user.employeeId}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1"><Clock className="h-3 w-3" />Duration</p>
                      <p className="font-semibold text-gray-800 text-sm">{detailModal.duration != null ? `${detailModal.duration} min` : "—"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1"><Phone className="h-3 w-3" />Phone</p>
                      <p className="font-semibold text-gray-800 text-sm">{detailModal.phone}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 col-span-1">
                      <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" />Address</p>
                      <p className="font-medium text-gray-700 text-xs">{detailModal.address.fullAddress}</p>
                    </div>
                  </div>

                  {/* Stock */}
                  {detailModal.stock.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Stock</p>
                      <div className="space-y-2">
                        {detailModal.stock.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                            {item.kind === "scooter" ? (
                              <Bike className="h-4 w-4 text-orange-400 shrink-0" />
                            ) : (
                              <Battery className="h-4 w-4 text-blue-400 shrink-0" />
                            )}
                            {item.kind === "scooter" ? (
                              <div className="flex-1 flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">{item.model}</p>
                                  {item.variation && <p className="text-xs text-gray-400">{item.variation}</p>}
                                </div>
                                <span className="text-sm font-bold text-orange-500">×{item.quantity}</span>
                              </div>
                            ) : (
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-800">{item.batteryType}</p>
                                <span className="text-sm font-bold text-blue-500">×{item.batteryQuantity}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback & Next Order */}
                  {(detailModal.feedback || detailModal.nextOrderPlan) && (
                    <div className="grid grid-cols-1 gap-3">
                      {detailModal.feedback && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MessageSquare className="h-3 w-3" />Feedback</p>
                          <p className="text-sm text-gray-700">{detailModal.feedback}</p>
                        </div>
                      )}
                      {detailModal.nextOrderPlan && (
                        <div className="bg-blue-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">Next Order Plan</p>
                          <p className="text-sm text-gray-700">{detailModal.nextOrderPlan}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Photos */}
                  {detailModal.photos.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Photos</p>
                      <div className="grid grid-cols-3 gap-2">
                        {detailModal.photos.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-24 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setPhotoModal(url)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {photoModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPhotoModal(null)}
        >
          <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-800 text-sm">Showroom Photo</p>
              <button onClick={() => setPhotoModal(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <img src={photoModal} alt="Showroom" className="w-full object-contain max-h-96" />
          </div>
        </div>
      )}
    </div>
  );
}
