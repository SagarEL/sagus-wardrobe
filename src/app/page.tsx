"use client";

import { ClothingCard } from "@/components/wardrobe/ClothingCard";
import { useWardrobe } from "@/context/WardrobeContext";
import {
  evaluatePairCompatibility,
  findMatchingAccessories,
  findMatchingFootwear,
} from "@/lib/matching-engine";
import { ClothingGroup } from "@/types";
import {
  CheckCircle2,
  Compass,
  Footprints,
  Loader2,
  Plus,
  RefreshCw,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Watch,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

export default function DashboardPage() {
  const {
    isLoading,
    items,
    history,
    profile,
    pairOverrides,
    openAddModal,
    openDetailModal,
    getItemImageUrl,
    logWear,
  } = useWardrobe();

  const [recIndex, setRecIndex] = useState(0);
  const [closetFilterGroup, setClosetFilterGroup] = useState<
    ClothingGroup | "all"
  >("all");

  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  const totalItems = items.length;
  const cleanCount = items.filter((i) => i.status === "clean").length;
  const topsCount = items.filter(
    (i) => i.categoryGroup === "tops" || i.categoryGroup === "ethnic"
  ).length;
  const bottomsCount = items.filter(
    (i) => i.categoryGroup === "bottoms"
  ).length;
  const footwearCount = items.filter(
    (i) => i.categoryGroup === "footwear"
  ).length;
  const accessoriesCount = items.filter(
    (i) => i.categoryGroup === "accessories"
  ).length;

  const liveRecommendations = useMemo(() => {
    const cleanTops = items.filter(
      (i) =>
        (i.categoryGroup === "tops" || i.categoryGroup === "ethnic") &&
        i.status === "clean" &&
        i.category !== "Blazers" &&
        i.category !== "Jackets"
    );
    const cleanBottoms = items.filter(
      (i) => i.categoryGroup === "bottoms" && i.status === "clean"
    );

    if (cleanTops.length === 0 || cleanBottoms.length === 0) return [];

    const combos = [];
    for (const top of cleanTops) {
      for (const bottom of cleanBottoms) {
        const breakdown = evaluatePairCompatibility(top, bottom, {
          userProfile: profile,
          recentHistory: history,
          overrides: pairOverrides,
        });

        if (breakdown.totalScore >= 60) {
          const shoes = findMatchingFootwear(top, bottom, items, false);
          const accs = findMatchingAccessories(
            top,
            bottom,
            shoes[0],
            items,
            false
          );
          combos.push({
            id: `${top.id}_${bottom.id}`,
            top,
            bottom,
            shoe: shoes[0],
            accessories: accs,
            breakdown,
          });
        }
      }
    }

    return combos.sort(
      (a, b) => b.breakdown.totalScore - a.breakdown.totalScore
    );
  }, [items, profile, history, pairOverrides]);

  const filteredClosetItems = useMemo(() => {
    if (closetFilterGroup === "all") return items.slice(0, 8);
    return items
      .filter((i) => i.categoryGroup === closetFilterGroup)
      .slice(0, 8);
  }, [items, closetFilterGroup]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2 text-[#666666]">
        <Loader2 className="w-6 h-6 animate-spin text-[#0288d1]" />
        <p className="text-[13.5px]">Loading wardrobe...</p>
      </div>
    );
  }

  // Clean Empty State (Zero Mock Data, Focused on Wardrobe & Matching)
  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-[25px] bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.12)] text-center space-y-4">
          <div className="w-16 h-16 rounded-[18px] overflow-hidden bg-[#2E2E2E] mx-auto border-2 border-[#0288d1]/30 shadow-[0_6px_16px_rgba(2,136,209,0.18)]">
            <img
              src="/logo.png"
              alt="Sagu's Wardrobe Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h1 className="text-[16.5px] font-bold text-[#090909] dark:text-white">
              Welcome to Sagu&apos;s Wardrobe
            </h1>
            <p className="text-[13.5px] text-[#666666] dark:text-slate-400 leading-relaxed">
              Add your shirts, trousers, footwear, and accessories to discover
              matching combinations and plan daily outfits.
            </p>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => openAddModal()}
              className="w-full sm:flex-1 h-11 px-5 rounded-[12px] bg-[#0288d1] hover:bg-[#0277bd] text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(2,136,209,0.18)] transition-all duration-fast"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add First Clothing Item</span>
            </button>

            <Link
              href="/matcher"
              className="w-full sm:flex-1 h-11 px-5 rounded-[12px] bg-[#f5f8ff] dark:bg-slate-800 hover:bg-slate-100 text-[#0288d1] border border-[#0288d1]/25 text-[13.5px] font-semibold inline-flex items-center justify-center gap-1.5 transition-all duration-fast"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Outfit Matcher</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const featuredRec =
    liveRecommendations.length > 0
      ? liveRecommendations[recIndex % liveRecommendations.length]
      : null;

  const alreadyWornToday = history.some((h) => h.date === todayIso);

  const handleWearRecommendedToday = async () => {
    if (!featuredRec) return;
    const itemIds = [
      featuredRec.top.id,
      featuredRec.bottom.id,
      ...(featuredRec.shoe ? [featuredRec.shoe.id] : []),
      ...featuredRec.accessories.map((a) => a.id),
    ];
    await logWear({
      date: todayIso,
      outfitName: `${featuredRec.top.mainColor.name} ${featuredRec.top.category} & ${featuredRec.bottom.mainColor.name} ${featuredRec.bottom.category}`,
      clothingItemIds: itemIds,
      occasion: "Daily wear",
      notes: "Logged from Home Recommendation",
      rating: 5,
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. COMPACT GREETING & QUICK MATCHING ACTIONS */}
      <div className="rounded-[18px] bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800 p-4 shadow-[0_2px_4px_rgba(0,0,0,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[16px] font-bold text-[#090909] dark:text-white">
              Hello, {profile.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-[10px] bg-[#269238] text-white text-[12px] font-semibold">
              {cleanCount}/{totalItems} Ready
            </span>
          </div>
          <p className="text-[13px] text-[#666666] dark:text-slate-400 mt-0.5">
            Match your shirts and pants or get an instant outfit recommendation.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <Link
            href="/matcher"
            className="h-10 px-3.5 rounded-[12px] bg-[#0288d1] hover:bg-[#0277bd] text-white text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 shadow-[0_6px_16px_rgba(2,136,209,0.18)]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Outfit Matcher</span>
          </Link>

          <Link
            href="/stylist"
            className="h-10 px-3.5 rounded-[12px] bg-[#f5f8ff] dark:bg-slate-800 text-[#0288d1] border border-[#0288d1]/25 text-[13px] font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>What to Wear</span>
          </Link>
        </div>
      </div>

      {/* 2. SYMMETRICAL 4-CARD CATEGORY SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Shirts & Tops",
            count: topsCount,
            icon: Shirt,
            href: "/wardrobe?group=tops",
          },
          {
            label: "Trousers & Jeans",
            count: bottomsCount,
            icon: Compass,
            href: "/wardrobe?group=bottoms",
          },
          {
            label: "Footwear",
            count: footwearCount,
            icon: Footprints,
            href: "/wardrobe?group=footwear",
          },
          {
            label: "Perfumes & Acc.",
            count: accessoriesCount,
            icon: Watch,
            href: "/accessories",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-3.5 rounded-[18px] bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2 hover:border-[#0288d1] transition-colors"
            >
              <div className="min-w-0">
                <div className="text-[13px] text-[#666666] dark:text-slate-400 truncate">
                  {stat.label}
                </div>
                <div className="text-[16.5px] font-bold text-[#090909] dark:text-white mt-0.5">
                  {stat.count}
                </div>
              </div>
              <div className="w-9 h-9 rounded-[10px] bg-[#f5f8ff] dark:bg-slate-800 text-[#0288d1] flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. TODAY'S MATCHED OUTFIT (ALIGNED 3-COLUMN GRID) */}
      {featuredRec && (
        <div className="rounded-[18px] bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800 p-4 shadow-[0_2px_4px_rgba(0,0,0,0.12)] space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14.5px] font-bold text-[#090909] dark:text-white">
                  Top Matched Outfit
                </span>
                <span className="px-2 py-0.5 rounded-[10px] bg-[#269238] text-white text-[12px] font-semibold">
                  {featuredRec.breakdown.totalScore}% Match
                </span>
              </div>
              <p className="text-[13px] text-[#666666] dark:text-slate-400 mt-0.5">
                {featuredRec.breakdown.harmonyType} •{" "}
                {featuredRec.top.mainColor.name} +{" "}
                {featuredRec.bottom.mainColor.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRecIndex((i) => i + 1)}
              className="w-9 h-9 rounded-[10px] bg-[#f5f8ff] dark:bg-slate-800 text-[#0288d1] flex items-center justify-center flex-shrink-0"
              aria-label="Next outfit suggestion"
              title="Next matched outfit"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Equal 3-Column Outfit Row */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {[
              { item: featuredRec.top, role: "Top" },
              { item: featuredRec.bottom, role: "Bottom" },
              ...(featuredRec.shoe
                ? [{ item: featuredRec.shoe, role: "Shoes" }]
                : []),
            ].map(({ item, role }) => {
              const url = getItemImageUrl(item);
              return (
                <div
                  key={item.id}
                  onClick={() => openDetailModal(item)}
                  className="cursor-pointer rounded-[12px] bg-[#f5f8ff] dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-2 flex flex-col justify-between"
                >
                  <div className="aspect-square w-full rounded-[10px] bg-white dark:bg-slate-800 overflow-hidden mb-1.5">
                    {url && (
                      <img
                        src={url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-1 text-[11px] text-[#666666]">
                      <span>{role}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20 flex-shrink-0"
                        style={{ backgroundColor: item.mainColor.hex }}
                      />
                    </div>
                    <div className="text-[13px] font-semibold text-[#090909] dark:text-white truncate">
                      {item.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleWearRecommendedToday}
              className="h-10 px-4 rounded-[12px] bg-[#269238] hover:opacity-95 text-white text-[13.5px] font-semibold inline-flex items-center justify-center gap-1.5 shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{alreadyWornToday ? "Log Look Again" : "Wear Today"}</span>
            </button>

            <Link
              href={`/matcher?itemId=${featuredRec.top.id}`}
              className="h-10 px-4 rounded-[12px] bg-[#f5f8ff] dark:bg-slate-800 text-[#0288d1] border border-[#0288d1]/25 text-[13.5px] font-semibold inline-flex items-center justify-center"
            >
              See All Matches
            </Link>
          </div>
        </div>
      )}

      {/* 4. MY DIGITAL CLOSET GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-bold text-[#090909] dark:text-white">
            My Closet ({items.length})
          </h2>
          <Link
            href="/wardrobe"
            className="text-[13px] font-semibold text-[#0288d1] hover:underline"
          >
            View All →
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "all", label: `All (${items.length})` },
            { id: "tops", label: `Tops (${topsCount})` },
            { id: "bottoms", label: `Bottoms (${bottomsCount})` },
            { id: "footwear", label: `Footwear (${footwearCount})` },
            { id: "accessories", label: `Perfumes & Acc. (${accessoriesCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setClosetFilterGroup(tab.id as ClothingGroup | "all")
              }
              className={`h-9 px-3.5 rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-fast ${
                closetFilterGroup === tab.id
                  ? "bg-[#0288d1] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)]"
                  : "bg-white dark:bg-[#121824] text-[#666666] dark:text-slate-300 border border-slate-200/90 dark:border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredClosetItems.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
