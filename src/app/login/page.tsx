"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser, setAuthToken } from "@/store/authSlice";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, MapPin, Shield } from "lucide-react";

const MOCK_USERS = [
  { email: "admin@eashwa.in", password: "admin123", name: "Rajesh Kumar", role: "admin" as const, id: "1" },
  { email: "hr@eashwa.in", password: "hr123", name: "Priya Sharma", role: "hr" as const, id: "2" },
  { email: "manager@eashwa.in", password: "manager123", name: "Vikram Singh", role: "manager" as const, id: "3" },
];

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (found) {
      dispatch(setUser({ id: found.id, name: found.name, email: found.email, role: found.role }));
      dispatch(setAuthToken("mock-token-" + found.id));
      toast.success(`Welcome back, ${found.name}!`);
      router.push("/admin/dashboard");
    } else {
      toast.error("Invalid email or password");
    }

    setLoading(false);
  };

  const fillDemo = (role: "admin" | "hr" | "manager") => {
    const u = MOCK_USERS.find((u) => u.role === role)!;
    setEmail(u.email);
    setPassword(u.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-300 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl shadow-lg shadow-orange-200 mb-4">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-800">Eashwa</h1>
          <p className="text-orange-600 font-semibold text-sm uppercase tracking-widest mt-1">
            Live Tracking Admin
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Field Employee Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-orange-100/50 border border-orange-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Sign in to your account</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm bg-gray-50 focus:bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3 flex items-center gap-2 justify-center">
              <Shield className="h-3 w-3" /> Demo credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(["admin", "hr", "manager"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => fillDemo(role)}
                  className="text-xs py-2 px-3 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors capitalize font-semibold"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 Eashwa Live Tracking. All rights reserved.
        </p>
      </div>
    </div>
  );
}