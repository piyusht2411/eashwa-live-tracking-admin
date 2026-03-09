"use client";

import { useState } from "react";
import { Locate, Plus, Edit3, Save, X } from "lucide-react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/LiveMap"), { ssr: false });

const employees = [
  { id: "1", name: "Amit Verma", dept: "Sales", empId: "EMP001", homeLocation: [19.1196, 72.8468] as [number, number], geoFenceRadius: 500, homeAddress: "Andheri West, Mumbai", hasHome: true },
  { id: "2", name: "Sonal Patel", dept: "Technical", empId: "EMP002", homeLocation: [19.0544, 72.8376] as [number, number], geoFenceRadius: 300, homeAddress: "Bandra West, Mumbai", hasHome: true },
  { id: "3", name: "Rahul Mishra", dept: "Support", empId: "EMP003", homeLocation: [19.0211, 72.8450] as [number, number], geoFenceRadius: 400, homeAddress: "Dadar, Mumbai", hasHome: true },
  { id: "4", name: "Kavita Nair", dept: "Sales", empId: "EMP004", homeLocation: [0, 0] as [number, number], geoFenceRadius: 300, homeAddress: "—", hasHome: false },
  { id: "5", name: "Deepak Joshi", dept: "Technical", empId: "EMP005", homeLocation: [19.2285, 72.8580] as [number, number], geoFenceRadius: 500, homeAddress: "Borivali East, Mumbai", hasHome: true },
];

export default function GeoFencingPage() {
  const [selected, setSelected] = useState(employees[0]);
  const [editing, setEditing] = useState(false);
  const [radius, setRadius] = useState(selected.geoFenceRadius);

  const mapCenter: [number, number] = selected.hasHome ? selected.homeLocation : [19.076, 72.877];

  const markers = employees
    .filter(e => e.hasHome)
    .map(e => ({
      position: e.homeLocation,
      label: e.name,
      color: e.id === selected.id ? "orange" as const : "green" as const,
      popup: `${e.homeAddress} · Fence: ${e.geoFenceRadius}m`,
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
            <h3 className="font-bold text-gray-800 text-sm">Employees</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => { setSelected(emp); setRadius(emp.geoFenceRadius); setEditing(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50/40 transition-colors text-left ${
                  selected.id === emp.id ? "bg-orange-50/60 border-r-2 border-orange-400" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {emp.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{emp.name}</p>
                  <p className="text-xs text-gray-400">{emp.dept}</p>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${emp.hasHome ? "bg-green-500" : "bg-gray-300"}`} />
              </button>
            ))}
          </div>
          <div className="p-3">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-orange-200 rounded-xl text-orange-500 text-sm font-semibold hover:bg-orange-50 transition-colors">
              <Plus className="h-4 w-4" /> Add Employee
            </button>
          </div>
        </div>

        {/* Map + Config */}
        <div className="lg:col-span-2 space-y-4">
          {/* Config panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center">
                  {selected.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{selected.name}</p>
                  <p className="text-xs text-gray-400">{selected.dept} · {selected.empId}</p>
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
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                  >
                    <Save className="h-3 w-3" /> Save
                  </button>
                  <button
                    onClick={() => { setEditing(false); setRadius(selected.geoFenceRadius); }}
                    className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Home Address</p>
                <p className={`font-medium ${selected.hasHome ? "text-gray-700" : "text-gray-300"}`}>
                  {selected.hasHome ? selected.homeAddress : "Not set"}
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
            {selected.hasHome && !editing && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <Locate className="h-3.5 w-3.5 text-orange-400" />
                Inactivity alert after 1 hour outside fence zone
              </div>
            )}
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Locate className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-sm text-gray-800">Home Location Map</span>
              <span className="text-xs text-gray-400 ml-auto">🟠 Selected · 🟢 Others</span>
            </div>
            <div className="h-72">
              <Map
                center={mapCenter}
                zoom={selected.hasHome ? 14 : 11}
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
