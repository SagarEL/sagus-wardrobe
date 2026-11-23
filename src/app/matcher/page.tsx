"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { generateMatcherRecommendations } from "@/lib/matching-engine";
import { ClothingItem, Outfit, OutfitItem } from "@/types";
import {
  ArrowLeftRight,
  BookmarkCheck,
  CheckCircle2,
  Heart,
  Layers,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";

function MatcherContent() {
  const searchParams = useSearchParams();
  const {
    items,
    profile,
    history,
    pairOverrides,
    getItemImageUrl,
    openDetailModal,
    openAddModal,
    togglePairFavorite,
    saveOutfit,
    logWear,
  } = useWardrobe();

  const [mode, setMode] = useState<"shirt_to_pant" | "pant_to_shirt">(
    "shirt_to_pant"
  );
  const [selectedAnchorId, setSelectedAnchorId] = useState<string>("");
  const [includeUnavailable, setIncludeUnavailable] = useState(false);
  const [filterTier, setFilterTier] = useState<string>("all");

  // Available shirts/tops for Mode A and pants/bottoms for Mode B
  const availableTops = useMemo(
    () =>
      items.filter(
        (i) =>
          (i.categoryGroup === "tops" || i.categoryGroup === "ethnic") &&
          (includeUnavailable || i.status === "clean")
      ),
    [items, includeUnavailable]
  );

  const availableBottoms = useMemo(
    () =>
      items.filter(
        (i) =>
          i.categoryGroup === "bottoms" &&
          (includeUnavailable || i.status === "clean")
      ),
    [items, includeUnavailable]
  );

  // Check URL query param `?itemId=...`
  useEffect(() => {
    const queryItemId = searchParams.get("itemId");
    if (queryItemId) {
      const target = items.find((i) => i.id === queryItemId);
      if (target) {
        if (target.categoryGroup === "bottoms") {
          setMode("pant_to_shirt");
          setSelectedAnchorId(target.id);
        } else if (
          target.categoryGroup === "tops" ||
          target.categoryGroup === "ethnic"
        ) {
          setMode("shirt_to_pant");
          setSelectedAnchorId(target.id);
        }
      }
    }
  }, [searchParams, items]);

  // Ensure a valid anchor item is selected when switching modes
  const activePool =
    mode === "shirt_to_pant" ? availableTops : availableBottoms;

  const anchorItem: ClothingItem | undefined = useMemo(() => {
    const found = activePool.find((i) => i.id === selectedAnchorId);
    return found || activePool[0];
  }, [activePool, selectedAnchorId]);

  const recommendations = useMemo(() => {
    if (!anchorItem) return [];
    return generateMatcherRecommendations(anchorItem, items, {
      includeUnavailable,
      userProfile: profile,
      recentHistory: history,
      overrides: pairOverrides,
    });
  }, [anchorItem, items, includeUnavailable, profile, history, pairOverrides]);

  const filteredRecs = useMemo(() => {
    if (filterTier === "all") return recommendations;
    if (filterTier === "favorites")
      return recommendations.filter((r) => r.breakdown.isUserFavorite);
    return recommendations.filter((r) => r.breakdown.tier === filterTier);
  }, [recommendations, filterTier]);

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case "Excellent":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25";
      case "Very good":
        return "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25";
      case "Good":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25";
      default:
        return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25";
    }
  };

  const handleQuickSaveOutfit = async (
    rec: (typeof recommendations)[number]
  ) => {
    const isAnchorTop =
      rec.anchorItem.categoryGroup === "tops" ||
      rec.anchorItem.categoryGroup === "ethnic";
    const top = isAnchorTop ? rec.anchorItem : rec.matchedItem;
    const bottom = isAnchorTop ? rec.matchedItem : rec.anchorItem;
    const shoe = rec.recommendedShoes[0];

    const outfitId = `outfit_${Date.now()}`;
    const outfitItems: OutfitItem[] = [
      {
        id: `oi_${Date.now()}_1`,
        outfitId,
        clothingItemId: top.id,
        slot: "top",
      },
      {
        id: `oi_${Date.now()}_2`,
        outfitId,
        clothingItemId: bottom.id,
        slot: "bottom",
      },
    ];
    if (shoe) {
      outfitItems.push({
        id: `oi_${Date.now()}_3`,
        outfitId,
        clothingItemId: shoe.id,
        slot: "footwear",
      });
    }
    rec.recommendedAccessories.forEach((acc, idx) => {
      outfitItems.push({
        id: `oi_${Date.now()}_acc_${idx}`,
        outfitId,
        clothingItemId: acc.id,
        slot:
          acc.category === "Watches"
            ? "watch"
            : acc.category === "Belts"
              ? "belt"
              : "accessory",
      });
    });

    const newOutfit: Outfit = {
      id: outfitId,
      name: `${top.mainColor.name} ${top.category} & ${bottom.mainColor.name} ${bottom.category}`,
      description: rec.breakdown.reasons.join(" "),
      items: outfitItems,
      occasions: top.occasions.length > 0 ? top.occasions : ["Daily wear"],
      season: top.season,
      tags: [rec.breakdown.harmonyType, rec.breakdown.tier],
      isFavorite: Boolean(rec.breakdown.isUserFavorite),
      compatibilityScore: rec.breakdown.totalScore,
      wearCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveOutfit(newOutfit);
  };

  const handleWearCombinationToday = async (
    rec: (typeof recommendations)[number]
  ) => {
    const shoe = rec.recommendedShoes[0];
    const ids = [
      rec.anchorItem.id,
      rec.matchedItem.id,
      ...(shoe ? [shoe.id] : []),
      ...rec.recommendedAccessories.map((a) => a.id),
    ];
    await logWear({
      date: new Date().toISOString().split("T")[0],
      outfitName: `${rec.anchorItem.name} + ${rec.matchedItem.name}`,
      clothingItemIds: ids,
      occasion: rec.anchorItem.occasions[0] || "Daily wear",
      notes: `Matched via Sagu's Wardrobe (${rec.breakdown.totalScore}% compatibility)`,
      rating: 5,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
            Sartorial Colour &amp; Style Engine
          </span>
          <h1 className="text-[16.5px] font-bold mt-0.5">
            Outfit Matcher
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Select any shirt or trouser from your wardrobe to discover compatible
            combinations, shoes, and accessories.
          </p>
        </div>

        {/* Mode A / Mode B Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-stone-200/80 dark:bg-stone-900 border border-stone-300/60 dark:border-stone-800">
          <button
            type="button"
            onClick={() => {
              setMode("shirt_to_pant");
              setSelectedAnchorId("");
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              mode === "shirt_to_pant"
                ? "bg-[#0288d1] text-white shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            Mode A: Select Shirt → Find Pants
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("pant_to_shirt");
              setSelectedAnchorId("");
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              mode === "pant_to_shirt"
                ? "bg-[#0288d1] text-white shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            Mode B: Select Pants → Find Shirts
          </button>
        </div>
      </div>

      {/* Step 1: Select Anchor Garment Carousel */}
      <div className="p-5 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">
              1. Choose a{" "}
              {mode === "shirt_to_pant"
                ? "Shirt / Top from Your Wardrobe"
                : "Pair of Pants / Jeans from Your Wardrobe"}{" "}
              ({activePool.length} available)
            </h2>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-stone-500 cursor-pointer">
            <input
              type="checkbox"
              checked={includeUnavailable}
              onChange={(e) => setIncludeUnavailable(e.target.checked)}
              className="rounded border-stone-300 text-bronze-600 focus:ring-bronze-500"
            />
            Include items currently in laundry
          </label>
        </div>

        {activePool.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-stone-500">
              No available{" "}
              {mode === "shirt_to_pant" ? "shirts or tops" : "pants or bottoms"}{" "}
              found in your wardrobe.
            </p>
            <button
              type="button"
              onClick={() =>
                openAddModal(mode === "shirt_to_pant" ? "tops" : "bottoms")
              }
              className="px-4 py-2 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add {mode === "shirt_to_pant" ? "Shirt / Top" : "Pants / Jeans"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {activePool.map((item) => {
              const isSelected = anchorItem?.id === item.id;
              const imgUrl = getItemImageUrl(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedAnchorId(item.id)}
                  className={`flex-shrink-0 w-36 p-2.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-stone-900 dark:border-white bg-stone-900/5 dark:bg-white/10 shadow-sm ring-1 ring-stone-900 dark:ring-white"
                      : "border-stone-200/80 dark:border-stone-800 bg-[#F5F7FB] dark:bg-stone-900/60 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-stone-800 mb-2">
                    {imgUrl && (
                      <img
                        src={imgUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="text-[10px] text-bronze-600 dark:text-bronze-400 font-semibold uppercase truncate">
                    {item.category}
                  </div>
                  <div className="text-xs font-serif font-semibold truncate">
                    {item.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-500">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/15"
                      style={{ backgroundColor: item.mainColor.hex }}
                    />
                    <span className="truncate">{item.mainColor.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Anchor Details + Matched Results */}
      {anchorItem && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sticky Anchor Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
                Selected Anchor Piece
              </span>
              <span className="text-xs font-medium text-stone-400">
                {anchorItem.category}
              </span>
            </div>

            <div
              onClick={() => openDetailModal(anchorItem)}
              className="cursor-pointer aspect-square rounded-2xl overflow-hidden bg-[#EEF1F7] dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800"
            >
              {getItemImageUrl(anchorItem) && (
                <img
                  src={getItemImageUrl(anchorItem)!}
                  alt={anchorItem.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div>
              <h3 className="text-xl font-serif font-semibold">
                {anchorItem.name}
              </h3>
              {anchorItem.brand && (
                <p className="text-xs text-stone-500 mt-0.5">
                  {anchorItem.brand} • {anchorItem.fit || "Regular Fit"} •{" "}
                  {anchorItem.fabric || "Cotton"}
                </p>
              )}
            </div>

            {/* Anchor Colour Analysis */}
            <div className="p-3.5 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 space-y-2.5">
              <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                Detected Colour Analysis
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-6 h-6 rounded-full border border-black/15"
                    style={{ backgroundColor: anchorItem.mainColor.hex }}
                  />
                  <div>
                    <div className="text-xs font-semibold">
                      {anchorItem.mainColor.name}
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      Primary • {anchorItem.mainColor.hex}
                    </div>
                  </div>
                </div>
                {anchorItem.secondaryColor && (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border border-black/15"
                      style={{
                        backgroundColor: anchorItem.secondaryColor.hex,
                      }}
                    />
                    <div>
                      <div className="text-xs font-medium">
                        {anchorItem.secondaryColor.name}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Secondary
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Compatibility Tier Legend */}
            <div className="space-y-1.5 text-[11px] text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="font-semibold text-stone-700 dark:text-stone-300">
                Heuristic Scoring Guide:
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span>• 90–100: Excellent</span>
                <span>• 75–89: Very good</span>
                <span>• 60–74: Good</span>
                <span>• Below 60: Less rec.</span>
              </div>
            </div>
          </div>

          {/* Right: Ranked Matching Recommendations */}
          <div className="lg:col-span-8 space-y-5">
            {/* Tier Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-serif font-semibold">
                {mode === "shirt_to_pant"
                  ? `Matching Pants in Your Wardrobe (${filteredRecs.length})`
                  : `Matching Shirts in Your Wardrobe (${filteredRecs.length})`}
              </h2>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All Matches" },
                  { id: "Excellent", label: "Excellent (90+)" },
                  { id: "Very good", label: "Very Good (75–89)" },
                  { id: "Good", label: "Good (60–74)" },
                  { id: "favorites", label: "★ Favourites" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterTier(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      filterTier === tab.id
                        ? "bg-[#0288d1] text-white border-[#0288d1]"
                        : "bg-white dark:bg-[#121621] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredRecs.length === 0 ? (
              <div className="p-10 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 text-center space-y-3">
                <p className="text-sm font-serif font-semibold">
                  No matching items found for this filter.
                </p>
                <p className="text-xs text-stone-500">
                  Try switching to &quot;All Matches&quot; or adding more{" "}
                  {mode === "shirt_to_pant" ? "trousers/jeans" : "shirts"} to
                  your wardrobe.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredRecs.map((rec) => {
                  const matchedImg = getItemImageUrl(rec.matchedItem);
                  const anchorImg = getItemImageUrl(rec.anchorItem);
                  const isAnchorTop =
                    rec.anchorItem.categoryGroup === "tops" ||
                    rec.anchorItem.categoryGroup === "ethnic";
                  const topItem = isAnchorTop
                    ? rec.anchorItem
                    : rec.matchedItem;
                  const bottomItem = isAnchorTop
                    ? rec.matchedItem
                    : rec.anchorItem;

                  return (
                    <div
                      key={rec.matchedItem.id}
                      className="p-5 sm:p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-5 transition-all hover:border-stone-300 dark:hover:border-stone-700"
                    >
                      {/* Top Header: Compatibility Badge & Favourite Override */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getTierBadgeStyle(
                              rec.breakdown.tier
                            )}`}
                          >
                            {rec.breakdown.totalScore} / 100 •{" "}
                            {rec.breakdown.tier}
                          </span>
                          <span className="text-xs font-semibold text-bronze-600 dark:text-bronze-400">
                            {rec.breakdown.harmonyType}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            togglePairFavorite(
                              rec.anchorItem.id,
                              rec.matchedItem.id
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                            rec.breakdown.isUserFavorite
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold"
                              : "border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white"
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              rec.breakdown.isUserFavorite
                                ? "fill-rose-500 text-rose-500"
                                : ""
                            }`}
                          />
                          {rec.breakdown.isUserFavorite
                            ? "Favourite Pair"
                            : "Favourite"}
                        </button>
                      </div>

                      {/* Main Combination Visual + Explanation */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        {/* Visual Pair Preview */}
                        <div className="md:col-span-5 flex items-center gap-2">
                          <div
                            onClick={() => openDetailModal(rec.anchorItem)}
                            className="cursor-pointer flex-1 aspect-square rounded-2xl bg-[#EEF1F7] dark:bg-stone-900 p-2 border border-stone-200/70 dark:border-stone-800 overflow-hidden"
                          >
                            {anchorImg && (
                              <img
                                src={anchorImg}
                                alt={rec.anchorItem.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            )}
                          </div>

                          <div className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 flex-shrink-0">
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </div>

                          <div
                            onClick={() => openDetailModal(rec.matchedItem)}
                            className="cursor-pointer flex-1 aspect-square rounded-2xl bg-[#EEF1F7] dark:bg-stone-900 p-2 border border-stone-200/70 dark:border-stone-800 overflow-hidden"
                          >
                            {matchedImg && (
                              <img
                                src={matchedImg}
                                alt={rec.matchedItem.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            )}
                          </div>
                        </div>

                        {/* Matching Logic Explanation */}
                        <div className="md:col-span-7 space-y-3">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-stone-400">
                              <span>{rec.matchedItem.category}</span>
                              {rec.matchedItem.brand && (
                                <span>• {rec.matchedItem.brand}</span>
                              )}
                            </div>
                            <h3
                              onClick={() => openDetailModal(rec.matchedItem)}
                              className="cursor-pointer text-lg font-serif font-semibold hover:text-bronze-600 transition-colors"
                            >
                              {rec.matchedItem.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-xs">
                              <span className="inline-flex items-center gap-1.5 font-medium">
                                <span
                                  className="w-3 h-3 rounded-full border border-black/15"
                                  style={{
                                    backgroundColor:
                                      rec.matchedItem.mainColor.hex,
                                  }}
                                />
                                {rec.matchedItem.mainColor.name}
                              </span>
                              <span className="text-stone-300 dark:text-stone-700">
                                |
                              </span>
                              <span className="text-stone-500">
                                {rec.matchedItem.fit || "Tailored"} •{" "}
                                {rec.matchedItem.fabric || "Cotton"}
                              </span>
                            </div>
                          </div>

                          {/* Why it works bullet list */}
                          <div className="p-3.5 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900/90 border border-stone-200/60 dark:border-stone-800 space-y-1.5">
                            <div className="text-[10px] uppercase tracking-wider text-bronze-600 dark:text-bronze-400 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Why This Combination Works
                            </div>
                            <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                              {rec.breakdown.reasons.map((r, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-bronze-500 mt-0.5">
                                    •
                                  </span>
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Sub-scores bar */}
                          <div className="grid grid-cols-3 gap-2 text-[11px]">
                            <div className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/70">
                              <span className="text-stone-400">Colour: </span>
                              <strong className="font-semibold">
                                {rec.breakdown.colorScore}%
                              </strong>
                            </div>
                            <div className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/70">
                              <span className="text-stone-400">Style: </span>
                              <strong className="font-semibold">
                                {rec.breakdown.styleScore}%
                              </strong>
                            </div>
                            <div className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/70">
                              <span className="text-stone-400">Pattern: </span>
                              <strong className="font-semibold">
                                {rec.breakdown.patternScore}%
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Matching Shoes & Accessories Row */}
                      {(rec.recommendedShoes.length > 0 ||
                        rec.recommendedAccessories.length > 0) && (
                        <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                              Recommended Shoes &amp; Accessories from Your
                              Wardrobe
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {[
                                ...rec.recommendedShoes.slice(0, 2),
                                ...rec.recommendedAccessories.slice(0, 2),
                              ].map((completingItem) => {
                                const cImg = getItemImageUrl(completingItem);
                                return (
                                  <div
                                    key={completingItem.id}
                                    onClick={() =>
                                      openDetailModal(completingItem)
                                    }
                                    className="cursor-pointer inline-flex items-center gap-2 pr-3 pl-1.5 py-1 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-stone-400 transition-colors"
                                  >
                                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-white dark:bg-stone-800 flex-shrink-0">
                                      {cImg && (
                                        <img
                                          src={cImg}
                                          alt={completingItem.name}
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <div className="text-left">
                                      <div className="text-[11px] font-medium leading-tight">
                                        {completingItem.name}
                                      </div>
                                      <div className="text-[9px] text-stone-400">
                                        {completingItem.category}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleWearCombinationToday(rec)}
                              className="px-3.5 py-2 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-xs font-semibold inline-flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Wear Today
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickSaveOutfit(rec)}
                              className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              Save Outfit
                            </button>
                            <Link
                              href={`/builder?topId=${topItem.id}&bottomId=${bottomItem.id}${
                                rec.recommendedShoes[0]
                                  ? `&shoeId=${rec.recommendedShoes[0].id}`
                                  : ""
                              }`}
                              className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-medium inline-flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              Builder
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OutfitMatcherPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-stone-500">
          Loading Outfit Matcher...
        </div>
      }
    >
      <MatcherContent />
    </Suspense>
  );
}
