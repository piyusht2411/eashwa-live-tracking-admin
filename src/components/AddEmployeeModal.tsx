"use client";

import { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  Briefcase,
  Hash,
  MapPin,
  CreditCard,
  Calendar,
  UserCheck,
  ChevronDown,
  Loader2,
  Upload,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { addEmployee } from "@/store/employeeSlice";
import { fetchAdminsAndManagers, registerEmployee, RegisterEmployeePayload } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AdminOrManager {
  id: string;
  name: string;
}

const ROLES = [
  { value: "employee", label: "Employee" },
  { value: "hr", label: "HR" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

// Extend initialForm with the new home fields
const initialForm: Omit<RegisterEmployeePayload, "joiningDate" | "homeLat" | "homeLng" | "homeAddress"> & {
  joiningDate: string;
  homeLat: string;
  homeLng: string;
  homeAddress: string;
} = {
  name: "",
  email: "",
  password: "",
  phone: "",
  department: "Sales",
  role: "employee",
  employeeId: "",
  post: "",
  address: "",
  aadhaarNumber: null,
  managerId: "",
  joiningDate: "",
  homeLat: "",
  homeLng: "",
  homeAddress: "",
};

export default function AddEmployeeModal({ open, onClose, onSuccess }: Props) {
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.authToken);

  const [form, setForm] = useState(initialForm);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [adminsAndManagers, setAdminsAndManagers] = useState<AdminOrManager[]>([]);
  const [fetchingManagers, setFetchingManagers] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setFetchingManagers(true);
        try {
          const { data } = await fetchAdminsAndManagers();
          setAdminsAndManagers(data);
        } catch (err) {
          toast.error("Failed to load managers/admins");
          console.error(err);
        } finally {
          setFetchingManagers(false);
        }
      };
      fetchData();
    }
  }, [open]);

  if (!open) return null;

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    setLoading(true);

    try {
      // Build homeLocation object safely
      const homeLocation: { lat?: number; lng?: number; address?: string } = {};

      if (form.homeLat.trim()) {
        const latNum = parseFloat(form.homeLat);
        if (!isNaN(latNum)) homeLocation.lat = latNum;
      }

      if (form.homeLng.trim()) {
        const lngNum = parseFloat(form.homeLng);
        if (!isNaN(lngNum)) homeLocation.lng = lngNum;
      }

      if (form.homeAddress.trim()) {
        homeLocation.address = form.homeAddress.trim();
      }

      const payload: RegisterEmployeePayload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        department: "Sales",
        role: form.role,
        ...(form.employeeId && { employeeId: form.employeeId }),
        ...(form.post && { post: form.post }),
        ...(form.address && { address: form.address }),
        ...(form.aadhaarNumber && { aadhaarNumber: Number(form.aadhaarNumber) }),
        ...(form.managerId && { managerId: form.managerId }),
        ...(form.joiningDate && { joiningDate: form.joiningDate }),
      };

      // Only add home fields if at least one is valid
      if (homeLocation.lat !== undefined || homeLocation.lng !== undefined || homeLocation.address) {
        if (homeLocation.lat !== undefined) payload.homeLat = homeLocation.lat;
        if (homeLocation.lng !== undefined) payload.homeLng = homeLocation.lng;
        if (homeLocation.address) payload.homeAddress = homeLocation.address;
      }

      const data = await registerEmployee(payload, profilePicFile, token);

      dispatch(
        addEmployee({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || form.phone,
          role: data.user.role,
          department: "Sales",
          employeeId: data.user.employeeId,
          post: data.user.post,
          address: data.user.address,
          aadhaarNumber: data.user.aadhaarNumber,
          managedBy: data.user.managerId || null,
          isActive: true,
          joiningDate: form.joiningDate || new Date().toISOString(),
          profilePicture: data.user.profilePicture || "",
        })
      );

      toast.success(`Employee "${form.name}" added successfully!`);
      onSuccess?.();
      setForm(initialForm);
      setProfilePicFile(null);
      setPreviewUrl(null);
      setStep(1);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-gray-50 focus:bg-white transition-all";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-600">
          <div>
            <h2 className="text-lg font-black text-white">Add New Employee</h2>
            <p className="text-orange-100 text-xs mt-0.5">Sales Department · Fill in the details to register</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          {[
            { num: 1, label: "Basic Info" },
            { num: 2, label: "Additional Info" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num as 1 | 2)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                step === s.num
                  ? "text-orange-600 border-b-2 border-orange-500 bg-orange-50/50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {s.num}. {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {step === 1 && (
              <>
                <div className="flex flex-col items-center mb-8">
                  <label className="cursor-pointer group">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <User className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-orange-500 text-white p-2.5 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                        <Upload className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center leading-tight">
                      Click to upload profile picture
                      <br />
                      <span className="text-[10px]">(optional • JPG/PNG)</span>
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className={labelClass}>Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amit Verma"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="employee@eashwa.in"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={(e) => updateForm("password", e.target.value)}
                      className={inputClass + " pr-16"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-500 font-semibold"
                    >
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Role *</label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      required
                      value={form.role}
                      onChange={(e) =>
                        updateForm("role", e.target.value as "admin" | "hr" | "manager" | "employee")
                      }
                      className={inputClass + " appearance-none pr-8"}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all"
                >
                  Next → Additional Info
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className={labelClass}>
                    Employee ID <span className="text-gray-400 normal-case font-normal">(auto-generated if left blank)</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. EMP001"
                      value={form.employeeId ?? ""}
                      onChange={(e) => updateForm("employeeId", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Post / Designation</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Sales Executive"
                      value={form.post ?? ""}
                      onChange={(e) => updateForm("post", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Joining Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={form.joiningDate}
                      onChange={(e) => updateForm("joiningDate", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Manager (Optional)</label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={form.managerId}
                      onChange={(e) => updateForm("managerId", e.target.value || "")}
                      className={inputClass + " appearance-none pr-8"}
                      disabled={fetchingManagers}
                    >
                      <option value="">Select a manager or admin</option>
                      {fetchingManagers ? (
                        <option value="" disabled>
                          Loading...
                        </option>
                      ) : (
                        adminsAndManagers.map((mgr) => (
                          <option key={mgr.id} value={mgr.id}>
                            {mgr.name}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {fetchingManagers && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Loading managers...
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Aadhaar Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="12-digit Aadhaar number"
                      value={form.aadhaarNumber ?? ""}
                      onChange={(e) =>
                        updateForm("aadhaarNumber", e.target.value ? Number(e.target.value) : null)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <textarea
                      rows={3}
                      placeholder="Home address"
                      value={form.address ?? ""}
                      onChange={(e) => updateForm("address", e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-gray-50 focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>

                {/* ──────────────────────────────────────────────── */}
                {/*                Home Location Section                 */}
                {/* ──────────────────────────────────────────────── */}
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
                          value={form.homeLat}
                          onChange={(e) => updateForm("homeLat", e.target.value)}
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
                          value={form.homeLng}
                          onChange={(e) => updateForm("homeLng", e.target.value)}
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
                        value={form.homeAddress}
                        onChange={(e) => updateForm("homeAddress", e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-gray-50 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:border-orange-300 hover:text-orange-600 transition-all"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding…
                      </>
                    ) : (
                      "Add Employee"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </>
  );
}