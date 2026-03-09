"use client";

import { useState } from "react";
import { Search, Filter, MapPin, TrendingUp, Eye, Phone, Plus, ChevronDown } from "lucide-react";
import Link from "next/link";

const employees = [
  { id: "1", name: "Amit Verma", empId: "EMP001", dept: "Sales", manager: "Vikram Singh", phone: "9876543210", score: 92, status: "active", location: "Andheri, Mumbai", punchIn: "9:02 AM" },
  { id: "2", name: "Sonal Patel", empId: "EMP002", dept: "Technical", manager: "Arun Kumar", phone: "9765432109", score: 89, status: "active", location: "Bandra, Mumbai", punchIn: "9:15 AM" },
  { id: "3", name: "Rahul Mishra", empId: "EMP003", dept: "Support", manager: "Neha Agarwal", phone: "9654321098", score: 86, status: "active", location: "Dadar, Mumbai", punchIn: "9:30 AM" },
  { id: "4", name: "Kavita Nair", empId: "EMP004", dept: "Sales", manager: "Vikram Singh", phone: "9543210987", score: 84, status: "active", location: "Goregaon, Mumbai", punchIn: "9:05 AM" },
  { id: "5", name: "Deepak Joshi", empId: "EMP005", dept: "Technical", manager: "Arun Kumar", phone: "9432109876", score: 81, status: "active", location: "Borivali, Mumbai", punchIn: "9:22 AM" },
  { id: "6", name: "Mohan Lal", empId: "EMP006", dept: "Sales", manager: "Vikram Singh", phone: "9321098765", score: 65, status: "idle", location: "Thane, Mumbai", punchIn: "9:45 AM" },
  { id: "7", name: "Riya Gupta", empId: "EMP007", dept: "Support", manager: "Neha Agarwal", phone: "9210987654", score: 71, status: "break", location: "Mulund, Mumbai", punchIn: "10:01 AM" },
  { id: "8", name: "Suresh Kumar", empId: "EMP008", dept: "Technical", manager: "Arun Kumar", phone: "9109876543", score: 58, status: "active", location: "Kurla, Mumbai", punchIn: "10:15 AM" },
  { id: "9", name: "Preeti Shah", empId: "EMP009", dept: "Sales", manager: "Vikram Singh", phone: "9098765432", score: 77, status: "absent", location: "—", punchIn: "—" },
  { id: "10", name: "Nitin Patil", empId: "EMP010", dept: "Support", manager: "Neha Agarwal", phone: "8987654321", score: 69, status: "absent", location: "—", punchIn: "—" },
];

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  idle: { label: "Idle", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  break: { label: "On Break", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  absent: { label: "Absent", color: "bg-red-100 text-red-600", dot: "bg-red-400" },
};

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.empId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    const matchDept = deptFilter === "all" || e.dept === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const scoreColor = (score: number) =>
    score >= 85 ? "text-green-600" : score >= 70 ? "text-orange-500" : "text-red-500";

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Employees</h1>
          <p className="text-sm text-gray-500">Manage all field employees · {employees.length} total</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-orange-200">
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white appearance-none font-medium text-gray-700"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="break">On Break</option>
            <option value="absent">Absent</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-white appearance-none font-medium text-gray-700"
          >
            <option value="all">All Departments</option>
            <option value="Sales">Sales</option>
            <option value="Technical">Technical</option>
            <option value="Support">Support</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Employee</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Department</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Location</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Punch In</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Score</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => {
                const sc = statusConfig[emp.status];
                return (
                  <tr key={emp.id} className={`border-b border-gray-50 hover:bg-orange-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/20"}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                          {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{emp.name}</p>
                          <p className="text-xs text-gray-400">{emp.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{emp.dept}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        {emp.location !== "—" && <MapPin className="h-3 w-3 text-orange-400 flex-shrink-0" />}
                        <span className="truncate max-w-28">{emp.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{emp.punchIn}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 bg-orange-500 rounded-full" style={{ width: `${emp.score}%` }} />
                        </div>
                        <span className={`text-sm font-bold ${scoreColor(emp.score)}`}>{emp.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/admin/employees/${emp.id}`}>
                          <button className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-500 transition-colors">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                        <button className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 transition-colors">
                          <MapPin className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-500 transition-colors">
                          <Phone className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No employees match your filters</p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">Showing {filtered.length} of {employees.length} employees</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs text-gray-500">Avg score: <strong className="text-orange-500">75.2</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
