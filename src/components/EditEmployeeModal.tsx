"use client";

import { useEffect, useState } from "react";
import { X, User, Mail, Lock, Phone, Briefcase, Hash, MapPin, CreditCard, Calendar, UserCheck, ChevronDown, Loader2, Upload } from "lucide-react";

const MAP_COLOR_PALETTE = [
  "#E63946", "#2196F3", "#4CAF50", "#FF9800", "#9C27B0",
  "#00BCD4", "#F44336", "#3F51B5", "#8BC34A", "#FF5722",
  "#607D8B", "#E91E63", "#009688", "#FFC107", "#673AB7",
  "#03A9F4", "#CDDC39", "#FF4081", "#00ACC1", "#7B1FA2",
];
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
  { value: "super_manager", label: "Super Manager" },
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
          homeLat: data.homeLocation?.lat != null ? String(data.homeLocation.lat) : "",
          homeLng: data.homeLocation?.lng != null ? String(data.homeLocation.lng) : "",
          homeAddress: data.homeLocation?.address || "",
          mapColor: data.mapColor || "",
          employeeType: data.employeeType || "asm",
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
        setAdminsAndManagers(res.data || res);
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
        delete payload.password;
      }

      // Build homeLocation as nested object (matches DB schema)
      const homeLocation: { lat?: number; lng?: number; address?: string } = {};
      if (payload.homeLat !== "" && payload.homeLat != null) {
        const lat = parseFloat(payload.homeLat);
        if (!isNaN(lat)) homeLocation.lat = lat;
      }
      if (payload.homeLng !== "" && payload.homeLng != null) {
        const lng = parseFloat(payload.homeLng);
        if (!isNaN(lng)) homeLocation.lng = lng;
      }
      if (payload.homeAddress?.trim()) {
        homeLocation.address = payload.homeAddress.trim();
      }

      // Remove flat fields, send nested object instead
      delete payload.homeLat;
      delete payload.homeLng;
      delete payload.homeAddress;
      if (Object.keys(homeLocation).length > 0) {
        payload.homeLocation = homeLocation;
      }

      await updateEmployee(token, employeeId, payload, profilePicFile);

      toast.success("Employee updated successfully!");
      onSuccess();
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
            <p className="text-orange-100 text-xs">Update details • Profile picture optional</p>
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
                <div className="absolute bottom-2 right-2 bg-orange-500 text-white p-2.5 rounded-full shadow-lg group-hover:scale-110 transition">
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
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-500 font-semibold">
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

          {form.role === "employee" && (
            <div>
              <label className={labelClass}>Employee Type *</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select required value={form.employeeType || "asm"} onChange={(e) => set("employeeType", e.target.value)} className={inputClass + " appearance-none pr-8"}>
                  <option value="asm">ASM (Field)</option>
                  <option value="office">Office</option>
                  <option value="both">Both (ASM + Office)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

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
                <option value="">Select a manager</option>
                {adminsAndManagers.filter((m: any) => m.role === "super_manager").length > 0 && (
                  <optgroup label="Super Managers">
                    {adminsAndManagers.filter((m: any) => m.role === "super_manager").map((mgr: any) => (
                      <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                    ))}
                  </optgroup>
                )}
                {adminsAndManagers.filter((m: any) => m.role === "manager").length > 0 && (
                  <optgroup label="Managers">
                    {adminsAndManagers.filter((m: any) => m.role === "manager").map((mgr: any) => (
                      <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                    ))}
                  </optgroup>
                )}
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

          {/* Home Location */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Home Location <span className="text-gray-400 text-xs font-normal">(for accurate attendance / geofencing)</span>
            </label>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Latitude</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 28.7041"
                    value={form.homeLat ?? ""}
                    onChange={(e) => set("homeLat", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Required for correct location</p>
              </div>

              <div>
                <label className={labelClass}>Longitude</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 77.1025"
                    value={form.homeLng ?? ""}
                    onChange={(e) => set("homeLng", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Required for correct location</p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Home Address (optional)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <textarea
                  rows={2}
                  placeholder="e.g. 123 Main Street, Delhi"
                  value={form.homeAddress || ""}
                  onChange={(e) => set("homeAddress", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-gray-50 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Map Marker Color */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Map Marker Color <span className="text-gray-400 text-xs font-normal">(auto-assigned if not set)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {MAP_COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => set("mapColor", form.mapColor === color ? "" : color)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    background: color,
                    borderColor: form.mapColor === color ? "#1f2937" : "transparent",
                    boxShadow: form.mapColor === color ? "0 0 0 2px white inset" : "none",
                  }}
                  title={color}
                />
              ))}
            </div>
            {form.mapColor && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: form.mapColor }} />
                Selected: {form.mapColor}
                <button type="button" onClick={() => set("mapColor", "")} className="text-red-400 hover:text-red-600 ml-1">✕ clear</button>
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:border-orange-300 hover:text-orange-600 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
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
