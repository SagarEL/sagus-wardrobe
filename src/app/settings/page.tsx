"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { AppSettings } from "@/types";
import {
  AlertTriangle,
  Database,
  Download,
  FileSpreadsheet,
  Moon,
  Sparkles,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";
import React, { useRef, useState } from "react";

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    exportJson,
    importJson,
    exportCsv,
    clearAllData,
    showToast,
  } = useWardrobe();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExportJson = async () => {
    const json = await exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sagus-wardrobe-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("JSON Backup Exported", "Full wardrobe and images downloaded.");
  };

  const handleExportCsv = async () => {
    const csv = await exportCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sagus-wardrobe-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      "CSV Inventory Exported",
      "Spreadsheet-ready wardrobe data downloaded."
    );
  };

  const handleImportJsonFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importJson(text);
    } catch {
      showToast(
        "Import Failed",
        "The selected file is not a valid Sagu's Wardrobe JSON backup.",
        "error"
      );
    }
  };

  const handleConfirmedClear = async () => {
    await clearAllData();
    setConfirmClear(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
          System Configuration &amp; Data Portability
        </span>
        <h1 className="text-[16.5px] font-bold mt-0.5">Settings</h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Configure appearance, currency, measurement systems, and manage your
          local IndexedDB backups.
        </p>
      </div>

      {/* Appearance & Regional Preferences */}
      <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-6">
        <h2 className="text-lg font-serif font-semibold">
          Appearance &amp; Regional Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Theme */}
          <div>
            <label className="block text-xs text-stone-500 mb-2">
              Interface Theme
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => updateSettings({ theme: "light" })}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  settings.theme === "light"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20"
                    : "bg-[#F5F7FB] dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                }`}
              >
                <Sun className="w-4 h-4" />
                Modern Light
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ theme: "dark" })}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  settings.theme === "dark"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20"
                    : "bg-[#F5F7FB] dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                }`}
              >
                <Moon className="w-4 h-4" />
                Midnight Dark
              </button>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs text-stone-500 mb-2">
              Currency Display (Default INR ₹)
            </label>
            <select
              value={settings.currency}
              onChange={(e) =>
                updateSettings({
                  currency: e.target.value as AppSettings["currency"],
                })
              }
              className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm font-medium"
            >
              <option value="INR">INR (₹) — Indian Rupee</option>
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — British Pound</option>
              <option value="AED">AED — UAE Dirham</option>
              <option value="JPY">JPY (¥) — Japanese Yen</option>
            </select>
          </div>

          {/* Measurement System */}
          <div>
            <label className="block text-xs text-stone-500 mb-2">
              Measurement Units
            </label>
            <select
              value={settings.measurementUnit}
              onChange={(e) =>
                updateSettings({
                  measurementUnit: e.target
                    .value as AppSettings["measurementUnit"],
                })
              }
              className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm font-medium"
            >
              <option value="metric">Metric (cm / kg)</option>
              <option value="imperial">Imperial (ft-in / lbs)</option>
            </select>
          </div>

          {/* Shoe Size Standard */}
          <div>
            <label className="block text-xs text-stone-500 mb-2">
              Shoe Size System
            </label>
            <select
              value={settings.shoeSizeSystem}
              onChange={(e) =>
                updateSettings({
                  shoeSizeSystem: e.target
                    .value as AppSettings["shoeSizeSystem"],
                })
              }
              className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm font-medium"
            >
              <option value="UK">UK / India Standard</option>
              <option value="US">US Standard</option>
              <option value="EU">EU Continental</option>
            </select>
          </div>
        </div>

        {/* Styling & Repetition Preferences */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-stone-500 mb-1.5">
              Outfit Repetition Warning Window (Days)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.avoidRepeatDays}
              onChange={(e) =>
                updateSettings({
                  avoidRepeatDays: Math.max(1, Number(e.target.value)),
                })
              }
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Data Export, Import, Backup & Restore */}
      <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-5">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-bronze-500" />
          <div>
            <h2 className="text-lg font-serif font-semibold">
              Data Export, Import &amp; Backup
            </h2>
            <p className="text-xs text-stone-500">
              All data and clothing photographs are stored locally in IndexedDB
              and can be exported or restored anytime.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleExportJson}
            className="p-4 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-stone-400 text-left flex items-center gap-3.5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] flex items-center justify-center flex-shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold">
                Export Full Backup (JSON)
              </div>
              <div className="text-[11px] text-stone-500">
                Includes all garments, images, outfits, calendar &amp; history
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="p-4 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-stone-400 text-left flex items-center gap-3.5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold">
                Export Wardrobe Inventory (CSV)
              </div>
              <div className="text-[11px] text-stone-500">
                Spreadsheet table of all clothes, colours, prices &amp; wear
                counts
              </div>
            </div>
          </button>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer p-4 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-stone-400 text-left flex items-center gap-3.5 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportJsonFile}
            />
            <div className="w-10 h-10 rounded-xl bg-bronze-600 text-white flex items-center justify-center flex-shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold">
                Import / Restore Backup (JSON)
              </div>
              <div className="text-[11px] text-stone-500">
                Restore your complete wardrobe from a saved .json file
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Clear All Application Data */}
      <div className="p-6 rounded-[18px] bg-rose-500/5 border border-rose-500/25 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Reset &amp; Clear All Application Data
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Permanently removes all clothing items, photographs, saved
              outfits, calendar schedules, and wear history from this browser.
            </p>
          </div>

          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Data
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-white dark:bg-stone-900 p-2 rounded-2xl border border-rose-500/40">
              <span className="text-xs font-semibold text-rose-600 px-2">
                Are you sure?
              </span>
              <button
                type="button"
                onClick={handleConfirmedClear}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold"
              >
                Yes, Erase Everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
