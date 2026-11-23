"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { OCCASIONS } from "@/lib/constants";
import { Occasion, OutfitSchedule } from "@/types";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";

const CALENDAR_OCCASIONS: Occasion[] = [
  "College",
  "Interview",
  "Office",
  "Meetings",
  "Party",
  "Wedding",
  "Functions",
  "Casual outing",
  "Travel",
];

export default function OutfitCalendarPage() {
  const {
    schedules,
    outfits,
    items,
    getItemImageUrl,
    saveSchedule,
    deleteSchedule,
    logWear,
  } = useWardrobe();

  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Assignment modal state
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(
    null
  );
  const [selectedOutfitId, setSelectedOutfitId] = useState<string>("");
  const [selectedCustomIds, setSelectedCustomIds] = useState<string[]>([]);
  const [occasion, setOccasion] = useState<Occasion>("Office");
  const [notes, setNotes] = useState("");

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Build calendar days for Monthly or Weekly view
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewMode === "week") {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
      const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] =
        [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push({
          dateStr: d.toISOString().split("T")[0],
          dayNum: d.getDate(),
          isCurrentMonth: d.getMonth() === month,
        });
      }
      return days;
    }

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startPad = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] =
      [];

    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({
        dateStr: d.toISOString().split("T")[0],
        dayNum: d.getDate(),
        isCurrentMonth: false,
      });
    }

    for (let dNum = 1; dNum <= totalDays; dNum++) {
      const d = new Date(year, month, dNum);
      // Format YYYY-MM-DD in local time
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      days.push({
        dateStr: `${yyyy}-${mm}-${dd}`,
        dayNum: dNum,
        isCurrentMonth: true,
      });
    }

    while (days.length % 7 !== 0) {
      const nextIdx = days.length - (startPad + totalDays) + 1;
      const d = new Date(year, month + 1, nextIdx);
      days.push({
        dateStr: d.toISOString().split("T")[0],
        dayNum: d.getDate(),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate, viewMode]);

  const navigatePeriod = (dir: -1 | 1) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "month") {
        next.setMonth(prev.getMonth() + dir);
      } else {
        next.setDate(prev.getDate() + dir * 7);
      }
      return next;
    });
  };

  const openScheduleModal = (dateStr: string, existing?: OutfitSchedule) => {
    setSelectedDateStr(dateStr);
    if (existing) {
      setEditingScheduleId(existing.id);
      setSelectedOutfitId(existing.outfitId || "");
      setSelectedCustomIds(existing.customItemIds || []);
      setOccasion(existing.occasion);
      setNotes(existing.notes || "");
    } else {
      setEditingScheduleId(null);
      setSelectedOutfitId(outfits[0]?.id || "");
      setSelectedCustomIds([]);
      setOccasion("Office");
      setNotes("");
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateStr) return;

    const now = new Date().toISOString();
    const record: OutfitSchedule = {
      id: editingScheduleId || `sched_${Date.now()}`,
      date: selectedDateStr,
      outfitId: selectedOutfitId || undefined,
      customItemIds:
        selectedCustomIds.length > 0 ? selectedCustomIds : undefined,
      occasion,
      notes: notes.trim() || undefined,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    };

    await saveSchedule(record);
    setSelectedDateStr(null);
  };

  const handleMarkCompletedAndLog = async (sched: OutfitSchedule) => {
    const outfit = sched.outfitId
      ? outfits.find((o) => o.id === sched.outfitId)
      : undefined;
    const itemIds = outfit
      ? outfit.items.map((oi) => oi.clothingItemId)
      : sched.customItemIds || [];

    await logWear({
      date: sched.date,
      outfitId: outfit?.id,
      outfitName: outfit?.name || `${sched.occasion} Scheduled Look`,
      clothingItemIds: itemIds,
      occasion: sched.occasion,
      notes: sched.notes,
      rating: 5,
    });
    await saveSchedule({ ...sched, isCompleted: true });
  };

  const toggleCustomItem = (id: string) => {
    setSelectedCustomIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
            Forward Style Planning
          </span>
          <h1 className="text-[16.5px] font-bold mt-0.5">
            Outfit Calendar
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Click any date to schedule outfits for college, interviews, office,
            meetings, parties, weddings, or travel.
          </p>
        </div>

        {/* View Mode & Month Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1 rounded-xl bg-stone-200/80 dark:bg-stone-900 border border-stone-300/60 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
                viewMode === "month"
                  ? "bg-[#0288d1] text-white"
                  : "text-stone-600 dark:text-stone-400"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
                viewMode === "week"
                  ? "bg-[#0288d1] text-white"
                  : "text-stone-600 dark:text-stone-400"
              }`}
            >
              Weekly
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-[#121621] px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => navigatePeriod(-1)}
              className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-serif font-semibold min-w-[130px] text-center">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              onClick={() => navigatePeriod(1)}
              className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-stone-200/80 dark:border-stone-800 bg-[#F5F7FB] dark:bg-stone-900/60">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-stone-400"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-stone-200/70 dark:divide-stone-800/80">
          {calendarDays.map((day) => {
            const daySchedules = schedules.filter(
              (s) => s.date === day.dateStr
            );
            const isToday = day.dateStr === todayStr;

            return (
              <div
                key={day.dateStr}
                onClick={() => openScheduleModal(day.dateStr, daySchedules[0])}
                className={`cursor-pointer p-2 sm:p-3 transition-colors hover:bg-stone-100/60 dark:hover:bg-stone-800/40 ${
                  viewMode === "week"
                    ? "min-h-[240px]"
                    : "min-h-[115px] sm:min-h-[145px]"
                } ${
                  !day.isCurrentMonth
                    ? "opacity-40 bg-stone-50/40 dark:bg-stone-950/30"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-semibold ${
                      isToday
                        ? "bg-bronze-600 text-white"
                        : "text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {day.dayNum}
                  </span>
                  <Plus className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 opacity-0 hover:opacity-100" />
                </div>

                {/* Scheduled Outfit Previews */}
                <div className="space-y-1.5">
                  {daySchedules.map((sched) => {
                    const outfit = sched.outfitId
                      ? outfits.find((o) => o.id === sched.outfitId)
                      : undefined;
                    const previewIds = outfit
                      ? outfit.items.map((oi) => oi.clothingItemId)
                      : sched.customItemIds || [];
                    const previewItems = previewIds
                      .map((id) => items.find((i) => i.id === id))
                      .filter(Boolean);

                    return (
                      <div
                        key={sched.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openScheduleModal(day.dateStr, sched);
                        }}
                        className="p-1.5 rounded-xl bg-[#EEF1F7] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-bronze-600 dark:text-bronze-400 truncate">
                            {sched.occasion}
                          </span>
                          {sched.isCompleted && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] font-serif font-semibold truncate">
                          {outfit?.name || "Custom Selection"}
                        </div>
                        {previewItems.length > 0 && (
                          <div className="flex items-center gap-1 pt-0.5">
                            {previewItems.slice(0, 3).map((pi) => {
                              const u = getItemImageUrl(pi);
                              return (
                                <div
                                  key={pi!.id}
                                  className="w-6 h-6 rounded-md bg-white dark:bg-stone-800 overflow-hidden border border-stone-200/60 dark:border-stone-700"
                                >
                                  {u && (
                                    <img
                                      src={u}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Scheduled Outfits List */}
      {schedules.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-semibold">
            Scheduled Outfit Lineup ({schedules.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {schedules
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((sched) => {
                const outfit = sched.outfitId
                  ? outfits.find((o) => o.id === sched.outfitId)
                  : undefined;
                return (
                  <div
                    key={sched.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-bronze-600 dark:text-bronze-400">
                          {sched.date}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px] font-medium">
                          {sched.occasion}
                        </span>
                      </div>
                      <h3 className="text-base font-serif font-semibold">
                        {outfit?.name || "Custom Wardrobe Combination"}
                      </h3>
                      {sched.notes && (
                        <p className="text-xs text-stone-500">{sched.notes}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                      {!sched.isCompleted ? (
                        <button
                          type="button"
                          onClick={() => handleMarkCompletedAndLog(sched)}
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 hover:underline"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Worn &amp; Log
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Logged in History
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openScheduleModal(sched.date, sched)}
                          className="text-xs text-stone-500 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSchedule(sched.id)}
                          className="text-rose-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Assign Outfit Modal */}
      {selectedDateStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-[18px] bg-[#F5F7FB] dark:bg-[#111520] border border-stone-200 dark:border-stone-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-bronze-600 font-semibold">
                  Schedule Outfit
                </span>
                <h3 className="text-xl font-serif font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-bronze-500" />
                  {selectedDateStr}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Occasion
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CALENDAR_OCCASIONS.map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setOccasion(occ)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                        occasion === occ
                          ? "bg-[#0288d1] text-white border-[#0288d1]"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400"
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Select Saved Outfit
                </label>
                <select
                  value={selectedOutfitId}
                  onChange={(e) => setSelectedOutfitId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs sm:text-sm"
                >
                  <option value="">— Or choose individual clothes below —</option>
                  {outfits.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.compatibilityScore}% Match)
                    </option>
                  ))}
                </select>
              </div>

              {!selectedOutfitId && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Pick Individual Garments ({selectedCustomIds.length} chosen)
                  </label>
                  <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-2 p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    {items.map((item) => {
                      const active = selectedCustomIds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleCustomItem(item.id)}
                          className={`p-2 rounded-lg text-left text-xs border truncate ${
                            active
                              ? "border-stone-900 dark:border-white bg-stone-900/10 font-semibold"
                              : "border-stone-200 dark:border-stone-800"
                          }`}
                        >
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Event / Schedule Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Client pitch at 10 AM, dinner afterwards..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {editingScheduleId ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteSchedule(editingScheduleId);
                      setSelectedDateStr(null);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-rose-500/30 text-rose-500 text-xs font-semibold"
                  >
                    Remove Assignment
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDateStr(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] text-xs font-semibold"
                  >
                    Save Schedule
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
