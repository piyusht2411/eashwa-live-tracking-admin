"use client";

import { useState, useEffect } from "react";
import { Locate, Plus, Edit3, Save, X, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getGeofences, createGeofence, updateGeofence } from "@/lib/api";
import { toast } from "sonner";

const Map = dynamic(() => import("@/components/LiveMap"), { ssr: false });

export interface Geofence {
  _id?: string;
  name: string;
  department: string;
  center: { lat: number; lng: number };
  radius: number;
  isActive?: boolean;
}

export default function GeoFencingPage() {
  const [zones, setZones] = useState<Geofence[]>([]);
  const [selected, setSelected] = useState<Geofence | null>(null);
  const [editing, setEditing] = useState(false);
  const [radius, setRadius] = useState(500);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const token = useSelector((state: RootState) => state.auth.authToken);

  const fetchZones = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await getGeofences(token);
      setZones(res || []);
      if (res && res.length > 0 && !selected) {
        setSelected(res[0]);
        setRadius(res[0].radius);
      }
    } catch (err) {
      toast.error("Failed to load geofences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, [token]);

  const handleSave = async () => {
    if (!selected || !token) return;
    try {
      setSaving(true);
      if (selected._id) {
        await updateGeofence(token, selected._id, { radius });
        toast.success("Geofence updated successfully");
      } else {
        // If it's a "new" zone
        await createGeofence(token, { ...selected, radius });
        toast.success("Geofence created successfully");
      }
      setEditing(false);
      fetchZones(); // Refresh
    } catch (err: any) {
      toast.error(err.message || "Failed to save geofence");
    } finally {
      setSaving(false);
    }
  };

  const mapCenter: [number, number] = selected ? [selected.center.lat, selected.center.lng] : [19.076, 72.877];

  const markers = zones.map(z => ({
    position: [z.center.lat, z.center.lng] as [number, number],
    label: z.name,
    color: selected?._id === z._id ? "orange" as const : "green" as const,
    popup: `Zone: ${z.name} · Radius: ${z.radius}m`,
  }));

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-800">Geo-Fencing & Home Location</h1>
        <p className="text-sm text-gray-500">Set employee home locations and geo-fence zones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Employee list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm">Geofence Zones</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {loading ? (
               <div className="p-6 flex flex-col items-center justify-center text-gray-400">
                 <Loader2 className="h-6 w-6 animate-spin text-orange-400 mb-2" />
                 <p className="text-sm">Loading zones...</p>
               </div>
            ) : zones.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No geofences found</div>
            ) : (
              zones.map((zone) => (
                <button
                  key={zone._id || zone.name}
                  onClick={() => { setSelected(zone); setRadius(zone.radius); setEditing(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50/40 transition-colors text-left ${
                    selected?._id === zone._id ? "bg-orange-50/60 border-r-2 border-orange-400" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0 uppercase">
                    {zone.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{zone.name}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${zone.isActive !== false ? "bg-green-500" : "bg-gray-300"}`} />
                </button>
              ))
            )}
          </div>
          <div className="p-3">
            <button 
              onClick={() => {
                const newZone = {
                  name: "New Zone", department: "Sales",
                  center: { lat: 19.076, lng: 72.877 }, radius: 500
                };
                setSelected(newZone);
                setRadius(500);
                setEditing(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-orange-200 rounded-xl text-orange-500 text-sm font-semibold hover:bg-orange-50 transition-colors">
              <Plus className="h-4 w-4" /> Add Geofence
            </button>
          </div>
        </div>

        {/* Map + Config */}
        <div className="lg:col-span-2 space-y-4">
          {/* Config panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-fit">
            {selected ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center uppercase">
                      {selected.name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{selected.name}</p>
                    </div>
                  </div>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                    >
                      <Edit3 className="h-3 w-3" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin"/> : <Save className="h-3 w-3" />} Save
                      </button>
                      <button
                        onClick={() => { setEditing(false); setRadius(selected.radius); }}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Center Coordinates</p>
                    <p className="font-medium text-gray-700 font-mono text-xs">
                       {selected.center.lat.toFixed(4)}, {selected.center.lng.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Geo-fence Radius</p>
                    {editing ? (
                      <input
                        type="number"
                        value={radius}
                        onChange={e => setRadius(Number(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-orange-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                        placeholder="Meters"
                      />
                    ) : (
                      <p className="font-medium text-gray-700">{radius}m</p>
                    )}
                  </div>
                </div>
                {!editing && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                    <Locate className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    Boundary limits where team members can punch in/out and perform field operations
                  </div>
                )}
              </>
            ) : (
              <div className="py-6 text-center text-gray-500 text-sm">Select a zone to view or edit config</div>
            )}
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Locate className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-sm text-gray-800">Home Location Map</span>
              <span className="text-xs text-gray-400 ml-auto">🟠 Selected · 🟢 Others</span>
            </div>
            <div className="h-72 bg-gray-50 relative z-0">
              <Map
                center={mapCenter}
                zoom={13}
                markers={markers}
                height="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
