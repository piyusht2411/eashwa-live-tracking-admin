"use client";

import { useEffect, useState } from "react";
import { X, User, Mail, Lock, Phone, Briefcase, Hash, MapPin, CreditCard, Calendar, UserCheck, ChevronDown, Loader2, Upload } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getEmployeeById, updateEmployee, fetchAdminsAndManagers } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  open: boolean;
  employeeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES = [
  { value: "employee", label: "Employee" },
  { value: "hr", label: "HR" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

export default function EditEmployeeModal({ open, employeeId, onClose, onSuccess }: Props) {
  const token = useSelector((s: RootState) => s.auth.authToken);

  const [form, setForm] = useState<any>({});
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [adminsAndManagers, setAdminsAndManagers] = useState<any[]>([]);
  const [fetchingManagers, setFetchingManagers] = useState(false);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Load employee + managers when modal opens
  useEffect(() => {
    if (!open || !employeeId || !token) return;

    const loadEmployee = async () => {
      try {
        const { data } = await getEmployeeById(token, employeeId);
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          department: data.department || "Sales",
          role: data.role || "employee",
          employeeId: data.employeeId || "",
          post: data.post || "",
          address: data.address || "",
          aadhaarNumber: data.aadhaarNumber || null,
          managerId: data.managedBy?._id || "",
          joiningDate: data.joiningDate ? data.joiningDate.split("T")[0] : "",
        });
        setExistingImage(data.profilePicture || "");
      } catch {
        toast.error("Failed to load employee details");
      }
    };

    const loadManagers = async () => {
      setFetchingManagers(true);
      try {
        const res = await fetchAdminsAndManagers();
        setAdminsAndManagers(res.data || res); // handles both {data} and direct array
      } catch {
        toast.error("Failed to load managers");
      } finally {
        setFetchingManagers(false);
      }
    };

    loadEmployee();
    loadManagers();
  }, [open, employeeId, token]);

  const set = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const payload: any = { ...form };
      if (!payload.password || payload.password.trim() === "") {
        delete payload.password; // don't send empty password on edit
      }

      await updateEmployee(token, employeeId, payload, profilePicFile);

      toast.success("Employee updated successfully!");
      onSuccess(); // ← refreshes the employee list
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const inputClass =
    "w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-gray-50 focus:bg-white transition-all";

  const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black">Edit Employee</h2>
            <p className="text-blue-100 text-xs">Update details • Profile picture optional</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-8">
            <label className="cursor-pointer group">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                {(previewUrl || existingImage) ? (
                  <img
                    src={previewUrl || existingImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-2.5 rounded-full shadow-lg group-hover:scale-110 transition">
                  <Upload className="h-4 w-4" />
                </div>
              </div>
              <input type="file" accept="image/*" onChange={handleProfileChange} className="hidden" />
            </label>
          </div>

          {/* Basic Info */}
          <div>
            <label className={labelClass}>Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" required value={form.name || ""} onChange={(e) => set("name", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="email" required value={form.email || ""} onChange={(e) => set("email", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Password (leave blank to keep current)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="New password (optional)"
                value={form.password || ""}
                onChange={(e) => set("password", e.target.value)}
                className={inputClass + " pr-16"}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 font-semibold">
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="tel" required value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Role *</label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select required value={form.role || ""} onChange={(e) => set("role", e.target.value)} className={inputClass + " appearance-none pr-8"}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <label className={labelClass}>Employee ID</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={form.employeeId || ""} onChange={(e) => set("employeeId", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Post / Designation</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={form.post || ""} onChange={(e) => set("post", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Joining Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="date" value={form.joiningDate || ""} onChange={(e) => set("joiningDate", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Manager (Optional)</label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select value={form.managerId || ""} onChange={(e) => set("managerId", e.target.value)} className={inputClass + " appearance-none pr-8"} disabled={fetchingManagers}>
                <option value="">Select a manager or admin</option>
                {adminsAndManagers.map((mgr) => (
                  <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {fetchingManagers && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Loading managers...</p>}
          </div>

          <div>
            <label className={labelClass}>Aadhaar Number</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="number" value={form.aadhaarNumber ?? ""} onChange={(e) => set("aadhaarNumber", e.target.value ? Number(e.target.value) : null)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <textarea rows={3} value={form.address || ""} onChange={(e) => set("address", e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-gray-50 focus:bg-white transition-all resize-none" />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:border-orange-300 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Employee"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}