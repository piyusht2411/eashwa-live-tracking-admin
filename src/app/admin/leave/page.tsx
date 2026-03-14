"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, Trash2, Loader2, XCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getLeaveRequests, updateLeaveStatus, deleteLeave } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface LeaveRequest {
  _id: string;
  user?: {
    _id: string;
    name: string;
    employeeId: string;
    department: string;
  };
  type: string;
  date: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
}

const statusConfig: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

export default function LeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState("");
  const token = useSelector((state: RootState) => state.auth.authToken);
  const { user } = useAuth();
  const role = user?.role ?? "admin";

  const fetchLeaves = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await getLeaveRequests(token);
      setLeaveRequests(res.data || []);
    } catch {
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, [token]);

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    if (!token) return;
    if (role !== "manager") {
      toast.error("Only managers can approve or reject leave requests");
      return;
    }
    try {
      setUpdating(id);
      await updateLeaveStatus(token, id, status);
      toast.success(`Leave request ${status}`);
      setLeaveRequests(prev => prev.map(req => req._id === id ? { ...req, status } : req));
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (role !== "admin") {
      toast.error("Only admin can delete leave records");
      return;
    }
    if (!confirm("Delete this leave record?")) return;
    try {
      await deleteLeave(token, id);
      toast.success("Leave record deleted");
      setLeaveRequests(prev => prev.filter(req => req._id !== id));
    } catch {
      toast.error("Failed to delete leave record");
    }
  };

  const filteredRequests = useMemo(() => leaveRequests.filter(req => {
    if (!monthFilter) return true;
    const dateStr = req.startDate || req.date;
    if (!dateStr) return true;
    const d = new Date(dateStr);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return m === monthFilter;
  }), [leaveRequests, monthFilter]);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-800">Leave Management</h1>
        <p className="text-sm text-gray-500">
          {role === "manager" ? "Manage and approve leave requests" : "View leave records"}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Pending Requests", value: leaveRequests.filter(r => r.status === "pending").length, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100" },
          { label: "Approved", value: leaveRequests.filter(r => r.status === "approved").length, color: "text-green-600", bg: "bg-green-50 border-green-100" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-sm font-semibold text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Leave Requests */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 pt-4 pb-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-700">Leave Requests</h2>
        </div>
        <div className="p-5 space-y-3">
          {/* Month Filter */}
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white font-medium text-gray-700"
            />
            {monthFilter && (
              <button
                onClick={() => setMonthFilter("")}
                className="px-3 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">{filteredRequests.length} records</span>
          </div>

          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin text-orange-400 mb-2" />
              <p className="text-sm">Loading leave requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No leave requests found.</div>
          ) : (
            filteredRequests.map(req => {
              const uName = req.user?.name || "Unknown";
              const empId = req.user?.employeeId || "—";
              const fromDate = req.startDate ? new Date(req.startDate).toLocaleDateString() : req.date ? new Date(req.date).toLocaleDateString() : "—";
              const toDate = req.endDate ? new Date(req.endDate).toLocaleDateString() : req.date ? new Date(req.date).toLocaleDateString() : "—";

              return (
                <div key={req._id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-orange-50/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0 uppercase">
                    {uName.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm text-gray-800">{uName}</p>
                      <span className="text-xs text-gray-400">{empId}</span>
                    </div>
                    <p className="text-xs text-gray-500 capitalize">
                      {req.type} · {fromDate}{fromDate !== toDate ? ` – ${toDate}` : ""}{req.reason ? ` · ${req.reason}` : ""}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusConfig[req.status] || "bg-gray-100 text-gray-700"}`}>
                    {req.status}
                  </span>
                  <div className="flex gap-1.5 ml-2 flex-shrink-0">
                    {role === "manager" && req.status === "pending" && (
                      <>
                        <button
                          disabled={updating === req._id}
                          onClick={() => handleUpdateStatus(req._id, "approved")}
                          className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          {updating === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <button
                          disabled={updating === req._id}
                          onClick={() => handleUpdateStatus(req._id, "rejected")}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {role === "admin" && (
                      <button
                        onClick={() => handleDelete(req._id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
