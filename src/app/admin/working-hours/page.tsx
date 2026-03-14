"use client";

import { useState } from "react";
import { Clock, Save } from "lucide-react";
import { toast } from "sonner";

type BreakType = "fixed" | "flexible";

interface WorkingConfig {
  startTime: string;
  endTime: string;
  lateThreshold: number;
  overtime: boolean;
  breakType: BreakType;
  breakDuration: number;
  breakStart: string;
}

const defaultConfig: WorkingConfig = {
  startTime: "09:00",
  endTime: "18:00",
  lateThreshold: 15,
  overtime: true,
  breakType: "flexible",
  breakDuration: 60,
  breakStart: "13:00",
};

export default function WorkingHoursPage() {
  const [config, setConfig] = useState(defaultConfig);

  const update = (field: keyof WorkingConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast.success("Working hours configuration saved!");
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Working Hours Configuration</h1>
          <p className="text-sm text-gray-500">Define shifts, break policies, and overtime rules for the Sales team</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-orange-200">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      {/* Policy label */}
      <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3">
        <div className="p-2 rounded-xl bg-orange-100">
          <Clock className="h-4 w-4 text-orange-500" />
        </div>
        <div>
          <p className="font-bold text-orange-800 text-sm">Sales — Active Policy</p>
          <p className="text-xs text-orange-600">{config.startTime} – {config.endTime} · {config.breakType} break · {config.breakDuration} min</p>
        </div>
      </div>

      {/* Config form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
        <h3 className="font-bold text-gray-800">Sales Team — Working Hours Policy</h3>

        {/* Work hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Work Start Time", field: "startTime" as const, type: "time" },
            { label: "Work End Time", field: "endTime" as const, type: "time" },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-gray-600 mb-2">{f.label}</label>
              <input
                type={f.type}
                value={config[f.field] as string}
                onChange={e => update(f.field, e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-gray-50 focus:bg-white"
              />
            </div>
          ))}
        </div>

        {/* Late & Overtime */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Late Arrival Grace (minutes)</label>
            <input
              type="number"
              value={config.lateThreshold}
              onChange={e => update("lateThreshold", Number(e.target.value))}
              min={0} max={60}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-gray-50 focus:bg-white"
            />
            <p className="text-xs text-gray-400 mt-1">Arrivals within {config.lateThreshold} min marked on-time</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Overtime Tracking</label>
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => update("overtime", !config.overtime)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.overtime ? "bg-orange-500" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${config.overtime ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm font-medium text-gray-700">{config.overtime ? "Enabled" : "Disabled"}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Track hours beyond {config.endTime} as overtime</p>
          </div>
        </div>

        {/* Break Policy */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <h4 className="font-bold text-gray-700 text-sm">Break Policy</h4>
          <div className="grid grid-cols-2 gap-3">
            {(["fixed", "flexible"] as BreakType[]).map(bt => (
              <button
                key={bt}
                onClick={() => update("breakType", bt)}
                className={`p-3 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                  config.breakType === bt
                    ? "border-orange-400 bg-orange-50 text-orange-600"
                    : "border-gray-200 text-gray-500 hover:border-orange-200"
                }`}
              >
                <div className="font-bold mb-0.5">{bt} Break</div>
                <div className="text-xs font-normal opacity-70">
                  {bt === "fixed" ? "Set fixed break time" : "Flexible with max limit"}
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                {config.breakType === "fixed" ? "Break Start Time" : "Earliest Break Time"}
              </label>
              <input
                type="time"
                value={config.breakStart}
                onChange={e => update("breakStart", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-gray-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Max Break Duration (minutes)</label>
              <input
                type="number"
                value={config.breakDuration}
                onChange={e => update("breakDuration", Number(e.target.value))}
                min={15} max={120}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-gray-50 focus:bg-white"
              />
              <p className="text-xs text-gray-400 mt-1">Alert triggered after {config.breakDuration} min</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-gray-100">
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">Policy Summary</p>
            <p className="text-sm text-gray-700">
              <strong>Sales</strong>: Work {config.startTime}–{config.endTime} ·
              Late after +{config.lateThreshold}min ·
              {config.breakType === "fixed" ? ` Fixed break at ${config.breakStart}` : ` Flexible break`} ({config.breakDuration} min max) ·
              Overtime {config.overtime ? "tracked" : "not tracked"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
