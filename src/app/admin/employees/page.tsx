"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, MapPin, TrendingUp, Eye, Phone, Plus, Loader2, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import AddEmployeeModal from "@/components/AddEmployeeModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getEmployees, deleteEmployee } from "@/lib/api";
import { toast } from "sonner";
import EditEmployeeModal from "@/components/EditEmployeeModal";

export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
  phone: string;
  isActive: boolean;
  joiningDate: string;
  managedBy?: { _id: string; name: string };
  score?: number;
  status?: string;
  location?: string;
  punchIn?: string;
  profilePicture?: string;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  idle: { label: "Idle", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  break: { label: "On Break", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  absent: { label: "Absent", color: "bg-red-100 text-red-600", dot: "bg-red-400" },
};

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.authToken);

  const fetchEmployees = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await getEmployees(token, "", "");
      setEmployees(response.data || []);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  // Client-side search: by employee name OR manager name
  const filtered = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter(e => {
      const nameMatch = e.name.toLowerCase().includes(q);
      const managerMatch = e.managedBy?.name?.toLowerCase().includes(q);
      return nameMatch || managerMatch;
    });
  }, [employees, search]);

  const scoreColor = (score: number) =>
    score >= 85 ? "text-green-600" : score >= 70 ? "text-orange-500" : "text-red-500";

  // DELETE HANDLER
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete employee "${name}"? This action cannot be undone.`)) return;

    try {
      if (!token) {
        toast.error("Authentication token missing. Please login again.");
        return;
      }
      await deleteEmployee(token, id);
      await fetchEmployees();
      toast.success(`Employee "${name}" deleted successfully`);
    } catch {
      toast.error("Failed to delete employee");
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Employees</h1>
          <p className="text-sm text-gray-500">All field employees · {employees.length} total</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-orange-200"
        >
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      <AddEmployeeModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchEmployees} />
      <EditEmployeeModal
        open={!!editingId}
        employeeId={editingId!}
        onClose={() => setEditingId(null)}
        onSuccess={fetchEmployees}           // ← NEW
      />

      {/* Search */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee name or manager name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-white"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400 mb-3" />
          <p className="text-sm">Loading employees...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-gray-700">No employees found</p>
          <p className="text-xs">Try a different name or clear the search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(emp => {
            const derivedStatus = emp.status || (emp.isActive ? "active" : "absent");
            const sc = statusConfig[derivedStatus] || statusConfig.active;
            const mockScore = emp.score || 85;
            const initials = emp.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div
                key={emp._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all group"
              >
                <div className="p-5 space-y-4">
                  {/* Avatar & Status */}
                  <div className="flex items-start justify-between">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-orange-100 shadow-inner">
                      {emp.profilePicture ? (
                        <img
                          src={emp.profilePicture}
                          alt={emp.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xl">
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                    </div>
                  </div>

                  {/* Name & ID */}
                  <div>
                    <p className="font-bold text-gray-800 text-sm leading-tight">{emp.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{emp.employeeId}</p>
                    {emp.managedBy?.name && (
                      <p className="text-xs text-gray-400 mt-0.5">Manager: <span className="text-gray-600 font-medium">{emp.managedBy.name}</span></p>
                    )}
                  </div>

                  {/* Location & Punch In */}
                  <div className="space-y-1.5 text-xs text-gray-500">
                    {emp.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-orange-400 flex-shrink-0" />
                        <span className="truncate">{emp.location}</span>
                      </div>
                    )}
                    {emp.punchIn && (
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span>Punched in: {emp.punchIn}</span>
                      </div>
                    )}
                  </div>

                  {/* Score Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Performance</span>
                      <span className={`text-xs font-bold ${scoreColor(mockScore)}`}>{mockScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 bg-orange-500 rounded-full transition-all" style={{ width: `${mockScore}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Link href={`/admin/employees/${emp._id}`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold transition-colors">
                        <Eye className="h-3.5 w-3.5" /> View Profile
                      </button>
                    </Link>
                    <button
                      onClick={() => setEditingId(emp._id)}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(emp._id, emp.name)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Showing {filtered.length} of {employees.length} employees
      </p>
    </div>
  );
}
