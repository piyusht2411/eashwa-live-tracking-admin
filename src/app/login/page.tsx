"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setUser, setAuthToken } from "@/store/authSlice";
import { loginUser } from "@/lib/api";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, MapPin, Shield } from "lucide-react";

const DEMO_CREDENTIALS = [
  { label: "admin", userName: "admin@eashwa.in", password: "admin123" },
  { label: "hr", userName: "hr@eashwa.in", password: "hr123" },
  { label: "manager", userName: "manager@eashwa.in", password: "manager123" },
];

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, authToken } = useSelector(
    (state: RootState) => state.auth
  );
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect already-authenticated users away from login
  useEffect(() => {
    // ReduxProvider's PersistGate already waited for rehydration
    if (isAuthenticated && authToken) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, authToken, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser(userName, password);

      dispatch(
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        })
      );
      dispatch(setAuthToken(data.token));
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred: { userName: string; password: string }) => {
    setUserName(cred.userName);
    setPassword(cred.password);
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
            {/* Email or Employee ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email or Employee ID
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                placeholder="Enter your email or Employee ID"
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
          {/* <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3 flex items-center gap-2 justify-center">
              <Shield className="h-3 w-3" /> Demo credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.label}
                  onClick={() => fillDemo(cred)}
                  className="text-xs py-2 px-3 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors capitalize font-semibold"
                >
                  {cred.label}
                </button>
              ))}
            </div>
          </div> */}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 Eashwa Live Tracking. All rights reserved.
        </p>
      </div>
    </div>
  );
}