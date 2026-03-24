"use client";

import { useState, useEffect, useMemo } from "react";
import { Home, Search, MapPin, Loader2, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getHomeLocations } from "@/lib/api";
import { toast } from "sonner";

const Map = dynamic(() => import("@/components/LiveMap"), { ssr: false });

interface HomeUser {
  _id: string;
  name: string;
  employeeId: string;
  role: string;
  department: string;
  phone: string;
  homeLocation: {
    lat: number;
    lng: number;
    address: string;
  };
}

const ROLE_COLORS: Record<string, string> = {
  employee: "#f97316",
  manager: "#3b82f6",
  hr: "#8b5cf6",
  admin: "#ef4444",
};

export default function GeoFencingPage() {
  const [users, setUsers] = useState<HomeUser[]>([]);
  const [selected, setSelected] = useState<HomeUser | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: RootState) => state.auth.authToken);

  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getHomeLocations(token);
        const data: HomeUser[] = (res.data || []).filter(
          (u: HomeUser) => u.homeLocation?.lat && u.homeLocation?.lng
        );
        setUsers(data);
        if (data.length > 0) setSelected(data[0]);
      } catch {
        toast.error("Failed to load home locations");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  const filtered = useMemo(() =>
    users.filter(u =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase())
    ),
    [users, search]
  );

  const markers = useMemo(() =>
    filtered.map(u => ({
      position: [u.homeLocation.lat, u.homeLocation.lng] as [number, number],
      label: u.name,
      color: selected?._id === u._id ? "#f97316" : (ROLE_COLORS[u.role] ?? "#6b7280"),
      popup: `${u.employeeId} · ${u.department}\n${u.homeLocation.address}`,
    })),
    [filtered, selected]
  );

  const mapCenter: [number, number] = selected
    ? [selected.homeLocation.lat, selected.homeLocation.lng]
    : [20.5937, 78.9629];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Home Locations</h1>
          <p className="text-sm text-gray-500">Employee registered home addresses on map</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-xl">
          <Users className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold text-orange-700">{users.length} employees</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Employee list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, ID, department..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-400 outline-none bg-gray-50"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-50 overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="p-8 flex flex-col items-center text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin text-orange-400 mb-2" />
                <p className="text-sm">Loading locations...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                <Home className="h-6 w-6 mx-auto mb-2 opacity-40" />
                No employees found
              </div>
            ) : filtered.map(u => (
              <button
                key={u._id}
                onClick={() => setSelected(u)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50/40 transition-colors text-left ${
                  selected?._id === u._id ? "bg-orange-50/60 border-r-2 border-orange-400" : ""
                }`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs uppercase"
                  style={{ backgroundColor: ROLE_COLORS[u.role] ?? "#6b7280" }}
                >
                  {u.name.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.homeLocation.address || `${u.homeLocation.lat.toFixed(4)}, ${u.homeLocation.lng.toFixed(4)}`}</p>
                </div>
                <span className="text-xs text-gray-400 capitalize flex-shrink-0">{u.role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map + selected info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Selected employee info */}
          {selected && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg uppercase flex-shrink-0"
                style={{ backgroundColor: ROLE_COLORS[selected.role] ?? "#6b7280" }}
              >
                {selected.name.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">{selected.name}</p>
                <p className="text-xs text-gray-400">{selected.employeeId} · {selected.department} · {selected.phone}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{selected.homeLocation.address || `${selected.homeLocation.lat.toFixed(5)}, ${selected.homeLocation.lng.toFixed(5)}`}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">Coordinates</p>
                <p className="text-xs font-mono text-gray-600">{selected.homeLocation.lat.toFixed(5)}</p>
                <p className="text-xs font-mono text-gray-600">{selected.homeLocation.lng.toFixed(5)}</p>
              </div>
            </div>
          )}

          {/* Map */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Home className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-sm text-gray-800">Home Location Map</span>
              <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
                {Object.entries(ROLE_COLORS).map(([role, color]) => (
                  <span key={role} className="flex items-center gap-1 capitalize">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-[420px] bg-gray-50 relative z-0">
              {loading ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
                </div>
              ) : (
                <Map
                  center={mapCenter}
                  zoom={13}
                  markers={markers}
                  autoFit={markers.length > 1}
                  height="100%"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
