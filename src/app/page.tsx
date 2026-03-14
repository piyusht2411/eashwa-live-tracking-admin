"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { MapPin, Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, authToken } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // ReduxProvider's PersistGate already waited for rehydration
    if (isAuthenticated && authToken) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, authToken, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl shadow-lg shadow-orange-200 animate-pulse">
          <MapPin className="h-8 w-8 text-white" />
        </div>
        <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading…</p>
      </div>
    </div>
  );
}
