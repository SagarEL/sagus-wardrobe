"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { OCCASIONS } from "@/lib/constants";
import { Occasion } from "@/types";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Plus,
  Repeat,
  Star,
  Trash2,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";

export default function OutfitHistoryPage() {
  const {
    history,
    items,
    outfits,
    getItemImageUrl,
    openDetailModal,
    logWear,
    deleteWearEntry,
    settings,
  } = useWardrobe();

  const [periodTab, setPeriodTab] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Manual Log Form State
  const [logDate, setLogDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [logOutfitId, setLogOutfitId] = useState("");
  const [logCustomItemIds, setLogCustomItemIds] = useState<string[]>([]);
  const [logOccasion, setLogOccasion] = useState<Occasion>("Office");
  const [logWeatherNote, setLogWeatherNote] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logRating, setLogRating] = useState(5);

  // Filter history based on Daily / Weekly (last 7 days) / Monthly (last 30 days)
  const filteredHistory = useMemo(() => {
    const now = new Date();
    return history.filter((entry) => {
      if (periodTab === "daily") return true;
      const entryDate = new Date(entry.date);
      const diffDays =
        (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
      if (periodTab === "weekly") return diffDays <= 7;
      if (periodTab === "monthly") return diffDays <= 31;
      return true;
    });
  }, [history, periodTab]);

  // Outfit repetition tracking (detects if identical item sets were worn within settings.avoidRepeatDays)
  const repetitionAlerts = useMemo(() => {
    const alerts: { entryId: string; message: string }[] = [];
    for (let i = 0; i < history.length; i++) {
      const current = history[i];
      for (let j = i + 1; j < history.length; j++) {
        const older = history[j];
        const d1 = new Date(current.date).getTime();
        const d2 = new Date(older.date).getTime();
        const gapDays = Math.round(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
        const sharedCount = current.clothingItemIds.filter((id) =>
          older.clothingItemIds.includes(id)
        ).length;
        if (
          gapDays <= (settings.avoidRepeatDays || 5) &&
          sharedCount >= 2 &&
          current.clothingItemIds.length >= 2
        ) {
          alerts.push({
            entryId: current.id,
            message: `Repeated within ${gapDays} ${
              gapDays === 1 ? "day" : "days"
            } of ${older.date}`,
          });
          break;
        }
      }
    }
    return alerts;
  }, [history, settings.avoidRepeatDays]);

  // Most-worn combinations
  const mostWornCombinations = useMemo(() => {
    const comboCounts = new Map<
      string,
      { label: string; count: number; itemIds: string[]; lastDate: string }
    >();

    for (const entry of history) {
      const topItem = entry.clothingItemIds
        .map((id) => items.find((i) => i.id === id))
        .find(
          (i) => i?.categoryGroup === "tops" || i?.categoryGroup === "ethnic"
        );
      const botItem = entry.clothingItemIds
        .map((id) => items.find((i) => i.id === id))
        .find((i) => i?.categoryGroup === "bottoms");

      if (topItem && botItem) {
        const key = `${topItem.id}_${botItem.id}`;
        const existing = comboCounts.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          comboCounts.set(key, {
            label: `${topItem.name} + ${botItem.name}`,
            count: 1,
            itemIds: [topItem.id, botItem.id],
            lastDate: entry.date,
          });
        }
      }
    }

    return Array.from(comboCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [history, items]);

  // Least-worn clothing & Last-worn date table
  const leastWornItems = useMemo(() => {
    return [...items]
      .sort((a, b) => a.wearCount - b.wearCount)
      .slice(0, 6);
  }, [items]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosenOutfit = logOutfitId
      ? outfits.find((o) => o.id === logOutfitId)
      : undefined;
    const itemIds = chosenOutfit
      ? chosenOutfit.items.map((oi) => oi.clothingItemId)
      : logCustomItemIds;

    if (itemIds.length === 0) return;

    await logWear({
      date: logDate,
      outfitId: chosenOutfit?.id,
      outfitName: chosenOutfit?.name,
      clothingItemIds: itemIds,
      occasion: logOccasion,
      weatherNote: logWeatherNote.trim() || undefined,
      notes: logNotes.trim() || undefined,
      rating: logRating,
    });

    setIsLogModalOpen(false);
    setLogOutfitId("");
    setLogCustomItemIds([]);
    setLogWeatherNote("");
    setLogNotes("");
  };

  const toggleCustomItem = (id: string) => {
    setLogCustomItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
            Wardrobe Rotation &amp; Wear Tracking
          </span>
          <h1 className="text-[16.5px] font-bold mt-0.5">
            Outfit History
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Record what you wear each day, monitor outfit repetition, and track
            the last-worn date of every piece.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsLogModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-xs font-semibold inline-flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Log Outfit Worn
        </button>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex p-1 rounded-2xl bg-stone-200/80 dark:bg-stone-900 border border-stone-300/60 dark:border-stone-800">
          {[
            { id: "daily", label: "All Daily Logs" },
            { id: "weekly", label: "This Week (7 Days)" },
            { id: "monthly", label: "This Month (30 Days)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriodTab(tab.id as typeof periodTab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                periodTab === tab.id
                  ? "bg-[#0288d1] text-white"
                  : "text-stone-600 dark:text-stone-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-stone-500">
          Repetition guard active: warns if repeated within{" "}
          <strong>{settings.avoidRepeatDays} days</strong>
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Chronological Wear Timeline */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-serif font-semibold">
            Wear Timeline ({filteredHistory.length})
          </h2>

          {filteredHistory.length === 0 ? (
            <div className="p-10 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 text-center space-y-3">
              <Clock className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="text-base font-serif font-semibold">
                No outfit history recorded for this period
              </h3>
              <p className="text-xs text-stone-500">
                Click &quot;Log Outfit Worn&quot; to record what you wore today
                or earlier this week.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry) => {
                const wornItems = entry.clothingItemIds
                  .map((id) => items.find((i) => i.id === id))
                  .filter(Boolean);
                const repAlert = repetitionAlerts.find(
                  (a) => a.entryId === entry.id
                );

                return (
                  <div
                    key={entry.id}
                    className="p-5 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-full bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] text-xs font-semibold inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {entry.date}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-medium">
                          {entry.occasion}
                        </span>
                        {entry.weatherNote && (
                          <span className="text-xs text-stone-400">
                            • {entry.weatherNote}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {entry.rating && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {entry.rating}/5
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteWearEntry(entry.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500"
                          title="Delete history record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {repAlert && (
                      <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs inline-flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {repAlert.message}
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-serif font-semibold">
                        {entry.outfitName ||
                          wornItems.map((w) => w!.name).join(" + ")}
                      </h3>
                      {entry.notes && (
                        <p className="text-xs text-stone-500 mt-0.5">
                          {entry.notes}
                        </p>
                      )}
                    </div>

                    {/* Worn Clothing Thumbnails */}
                    <div className="flex flex-wrap gap-2.5">
                      {wornItems.map((wi) => {
                        const u = getItemImageUrl(wi);
                        return (
                          <div
                            key={wi!.id}
                            onClick={() => openDetailModal(wi!)}
                            className="cursor-pointer flex items-center gap-2 p-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 hover:border-stone-400"
                          >
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-white dark:bg-stone-800 flex-shrink-0">
                              {u && (
                                <img
                                  src={u}
                                  alt={wi!.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="text-xs">
                              <div className="font-medium leading-tight">
                                {wi!.name}
                              </div>
                              <div className="text-[10px] text-stone-400">
                                {wi!.category}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Most-Worn Combinations, Least-Worn Clothing & Last-Worn Dates */}
        <div className="lg:col-span-5 space-y-6">
          {/* Most-Worn Combinations */}
          <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
                Signature Pairings
              </span>
              <h2 className="text-lg font-serif font-semibold">
                Most-Worn Combinations
              </h2>
            </div>

            {mostWornCombinations.length === 0 ? (
              <p className="text-xs text-stone-500">
                Log outfits with a shirt and pants to see your top combinations.
              </p>
            ) : (
              <div className="space-y-3">
                {mostWornCombinations.map((combo, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-serif font-semibold truncate">
                        {combo.label}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Last worn: {combo.lastDate}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-bronze-500/15 text-bronze-700 dark:text-bronze-300 text-xs font-bold flex-shrink-0">
                      {combo.count}×
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Least-Worn Clothing & Last-Worn Date Directory */}
          <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
                Rotation Opportunity
              </span>
              <h2 className="text-lg font-serif font-semibold">
                Least-Worn Clothing &amp; Last-Worn Dates
              </h2>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {leastWornItems.map((item) => {
                const u = getItemImageUrl(item);
                return (
                  <div
                    key={item.id}
                    onClick={() => openDetailModal(item)}
                    className="cursor-pointer p-3 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 hover:border-stone-400 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-stone-800 flex-shrink-0">
                        {u && (
                          <img
                            src={u}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-serif font-semibold truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Last worn: {item.lastWornDate || "Never worn"}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-200/70 dark:bg-stone-800 flex-shrink-0 inline-flex items-center gap-1">
                      <Repeat className="w-3 h-3" />
                      {item.wearCount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Log Wear Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-[18px] bg-[#F5F7FB] dark:bg-[#111520] border border-stone-200 dark:border-stone-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-bronze-600 font-semibold">
                  Daily Wardrobe Journal
                </span>
                <h3 className="text-xl font-serif font-semibold">
                  Record Outfit Worn
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Date Worn
                  </label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Occasion
                  </label>
                  <select
                    value={logOccasion}
                    onChange={(e) => setLogOccasion(e.target.value as Occasion)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                  >
                    {OCCASIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Choose from Saved Outfits
                </label>
                <select
                  value={logOutfitId}
                  onChange={(e) => setLogOutfitId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                >
                  <option value="">— Or select individual clothes worn —</option>
                  {outfits.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              {!logOutfitId && (
                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Select Individual Garments Worn ({logCustomItemIds.length}{" "}
                    selected)
                  </label>
                  <div className="max-h-44 overflow-y-auto grid grid-cols-2 gap-2 p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    {items.map((item) => {
                      const active = logCustomItemIds.includes(item.id);
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Weather Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={logWeatherNote}
                    onChange={(e) => setLogWeatherNote(e.target.value)}
                    placeholder="e.g. Sunny, 28°C"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Comfort / Style Rating
                  </label>
                  <select
                    value={logRating}
                    onChange={(e) => setLogRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                  >
                    <option value={5}>★★★★★ (5 - Felt Great)</option>
                    <option value={4}>★★★★☆ (4 - Very Good)</option>
                    <option value={3}>★★★☆☆ (3 - Average)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Compliments received, fit notes..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] text-xs font-semibold"
                >
                  Save to History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
