"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Layers,
  Repeat,
  TrendingUp,
} from "lucide-react";
import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function WardrobeAnalyticsPage() {
  const { items, history, getItemImageUrl, openDetailModal } = useWardrobe();

  const totalWearEvents = useMemo(
    () => items.reduce((sum, i) => sum + (i.wearCount || 0), 0),
    [items]
  );

  // 2. Category Distribution
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.category, (map.get(item.category) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  // 3. Colour Distribution
  const colorData = useMemo(() => {
    const map = new Map<string, { name: string; hex: string; value: number }>();
    for (const item of items) {
      const existing = map.get(item.mainColor.name);
      if (existing) {
        existing.value += 1;
      } else {
        map.set(item.mainColor.name, {
          name: item.mainColor.name,
          hex: item.mainColor.hex,
          value: 1,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [items]);

  // 4. Most-used & Least-used clothing
  const mostUsedItems = useMemo(
    () =>
      [...items]
        .filter((i) => i.wearCount > 0)
        .sort((a, b) => b.wearCount - a.wearCount)
        .slice(0, 5),
    [items]
  );

  const leastUsedItems = useMemo(
    () =>
      [...items].sort((a, b) => a.wearCount - b.wearCount).slice(0, 5),
    [items]
  );

  // 5. Clothing not worn recently (30+ days or never worn)
  const neglectedItems = useMemo(() => {
    const now = Date.now();
    return items.filter((item) => {
      if (!item.lastWornDate) return true;
      const diffDays =
        (now - new Date(item.lastWornDate).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 21;
    });
  }, [items]);

  // 6. Most-used shirt and pant combinations
  const topShirtPantCombos = useMemo(() => {
    const map = new Map<
      string,
      { topName: string; bottomName: string; count: number }
    >();
    for (const entry of history) {
      const top = entry.clothingItemIds
        .map((id) => items.find((i) => i.id === id))
        .find(
          (i) => i?.categoryGroup === "tops" || i?.categoryGroup === "ethnic"
        );
      const bottom = entry.clothingItemIds
        .map((id) => items.find((i) => i.id === id))
        .find((i) => i?.categoryGroup === "bottoms");

      if (top && bottom) {
        const key = `${top.id}_${bottom.id}`;
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(key, {
            topName: top.name,
            bottomName: bottom.name,
            count: 1,
          });
        }
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [history, items]);

  // 7. Monthly outfit frequency
  const monthlyFrequencyData = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of history) {
      const monthKey = entry.date.slice(0, 7); // YYYY-MM
      map.set(monthKey, (map.get(monthKey) || 0) + 1);
    }
    // Also include current month if empty
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (!map.has(currentMonth)) map.set(currentMonth, 0);

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, outfitsLogged]) => ({ month, outfitsLogged }));
  }, [history]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
          Wardrobe Intelligence
        </span>
        <h1 className="text-[16.5px] font-bold mt-0.5">
          Wardrobe Analytics
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Visual insights into your wardrobe composition, colour balance, and
          wear patterns.
        </p>
      </div>

      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="uppercase tracking-wider font-semibold">
              Total Clothing Count
            </span>
            <Layers className="w-4 h-4 text-bronze-500" />
          </div>
          <div className="text-[16.5px] font-bold mt-2">
            {items.length}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Across {categoryData.length} active categories
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="uppercase tracking-wider font-semibold">
              Total Garment Wears
            </span>
            <Repeat className="w-4 h-4 text-bronze-500" />
          </div>
          <div className="text-[16.5px] font-bold mt-2">
            {totalWearEvents}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            {history.length} logged daily outfits
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="uppercase tracking-wider font-semibold">
              Not Worn Recently
            </span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-[16.5px] font-bold mt-2">
            {neglectedItems.length}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Unworn in 21+ days or never worn
          </div>
        </div>
      </div>

      {/* Charts Row: Category Distribution & Colour Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Distribution Bar Chart */}
        <div className="lg:col-span-7 p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-bronze-600 font-semibold">
                Inventory Breakdown
              </span>
              <h2 className="text-lg font-serif font-semibold">
                Category Distribution
              </h2>
            </div>
            <BarChart3 className="w-4 h-4 text-stone-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 10, right: 16, left: -16, bottom: 24 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(140,130,120,0.18)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64708A" }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64708A" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(140,130,120,0.25)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Colour Distribution Pie Chart */}
        <div className="lg:col-span-5 p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-bronze-600 font-semibold">
              Chromatic Spectrum
            </span>
            <h2 className="text-lg font-serif font-semibold">
              Colour Distribution
            </h2>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={colorData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {colorData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.hex}
                      stroke="#64708A"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {colorData.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: c.hex }}
                />
                {c.name} ({c.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboards Row: Most-Used, Least-Used & Monthly Outfit Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most-Used Clothing */}
        <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-bronze-600 font-semibold">
                Workhorse Essentials
              </span>
              <h2 className="text-lg font-serif font-semibold">
                Most-Used Clothing
              </h2>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="space-y-2.5">
            {mostUsedItems.map((item) => {
              const u = getItemImageUrl(item);
              return (
                <div
                  key={item.id}
                  onClick={() => openDetailModal(item)}
                  className="cursor-pointer p-2.5 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 overflow-hidden flex-shrink-0">
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
                      <div className="text-[10px] text-stone-400">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    {item.wearCount}×
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Least-Used & Not Worn Recently */}
        <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-bronze-600 font-semibold">
              Under-Utilized Pieces
            </span>
            <h2 className="text-lg font-serif font-semibold">
              Least-Used &amp; Unworn Recently
            </h2>
          </div>

          <div className="space-y-2.5">
            {leastUsedItems.map((item) => {
              const u = getItemImageUrl(item);
              return (
                <div
                  key={item.id}
                  onClick={() => openDetailModal(item)}
                  className="cursor-pointer p-2.5 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 overflow-hidden flex-shrink-0">
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
                      <div className="text-[10px] text-stone-400">
                        Last: {item.lastWornDate || "Never worn"}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-stone-200/70 dark:bg-stone-800 text-xs font-semibold">
                    {item.wearCount}×
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most-Used Shirt & Pant Combinations + Monthly Frequency */}
        <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-5">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-bronze-600 font-semibold">
              Pairing Habits
            </span>
            <h2 className="text-lg font-serif font-semibold">
              Top Shirt &amp; Pant Combinations
            </h2>
          </div>

          <div className="space-y-2.5">
            {topShirtPantCombos.length === 0 ? (
              <p className="text-xs text-stone-500">
                Log outfits to see your most frequent shirt and pant pairings.
              </p>
            ) : (
              topShirtPantCombos.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-serif font-semibold truncate">
                      {c.topName}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate">
                      + {c.bottomName}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-bronze-500/15 text-bronze-700 dark:text-bronze-300 text-xs font-bold">
                    {c.count}×
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-bronze-500" />
                Monthly Outfit Frequency
              </span>
            </div>
            <div className="space-y-1.5">
              {monthlyFrequencyData.map((m) => (
                <div
                  key={m.month}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-stone-500 font-mono">{m.month}</span>
                  <span className="font-semibold">
                    {m.outfitsLogged} outfits logged
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
