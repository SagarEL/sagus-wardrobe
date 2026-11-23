"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { STYLES } from "@/lib/constants";
import {
  evaluatePairCompatibility,
  findMatchingAccessories,
  findMatchingFootwear,
} from "@/lib/matching-engine";
import { ClothingItem, Occasion, Outfit, OutfitItem } from "@/types";
import {
  BookmarkCheck,
  CheckCircle2,
  CloudSun,
  Footprints,
  Layers,
  Palette,
  Shuffle,
  Sparkles,
  Watch,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

const STYLIST_OCCASIONS: Occasion[] = [
  "College",
  "Casual outing",
  "Formal",
  "Interview",
  "Party",
  "Wedding",
  "Travel",
  "Daily wear",
];

const WEATHER_OPTIONS = [
  { id: "any", label: "Any Weather", seasonHint: "All Season" },
  { id: "warm", label: "Warm & Sunny", seasonHint: "Summer" },
  { id: "mild", label: "Mild & Pleasant", seasonHint: "Spring / Autumn" },
  { id: "cool", label: "Cool / Crisp (Layering)", seasonHint: "Winter" },
  { id: "rainy", label: "Monsoon / Humid", seasonHint: "Monsoon" },
];

export default function SmartStylistPage() {
  const {
    items,
    profile,
    history,
    pairOverrides,
    getItemImageUrl,
    openDetailModal,
    saveOutfit,
    logWear,
  } = useWardrobe();

  const [selectedOccasion, setSelectedOccasion] =
    useState<Occasion>("Casual outing");
  const [preferredColor, setPreferredColor] = useState<string>("any");
  const [preferredFormality, setPreferredFormality] = useState<string>("any");
  const [selectedWeather, setSelectedWeather] = useState<string>("any");
  const [preferredStyle, setPreferredStyle] = useState<string>("any");
  const [surpriseSeed, setSurpriseSeed] = useState<number>(0);
  const [isSurpriseMode, setIsSurpriseMode] = useState(false);

  // Available unique colours in clean wardrobe
  const wardrobeColors = useMemo(() => {
    const map = new Map<string, string>();
    items
      .filter((i) => i.status === "clean")
      .forEach((i) => map.set(i.mainColor.name, i.mainColor.hex));
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [items]);

  // Generate tailored multi-outfit recommendations from actual clean wardrobe
  const stylistOutfits = useMemo(() => {
    const cleanItems = items.filter((i) => i.status === "clean");
    const tops = cleanItems.filter(
      (i) =>
        (i.categoryGroup === "tops" || i.categoryGroup === "ethnic") &&
        i.category !== "Blazers" &&
        i.category !== "Jackets"
    );
    const bottoms = cleanItems.filter((i) => i.categoryGroup === "bottoms");
    const outerwearPool = cleanItems.filter(
      (i) => i.category === "Blazers" || i.category === "Jackets"
    );

    if (tops.length === 0 || bottoms.length === 0) return [];

    const candidates: {
      id: string;
      top: ClothingItem;
      bottom: ClothingItem;
      outerwear?: ClothingItem;
      shoe?: ClothingItem;
      accessories: ClothingItem[];
      score: number;
      colorExplanation: string;
      styleExplanation: string;
      shoeExplanation: string;
      accessoryExplanation: string;
      harmonyType: string;
    }[] = [];

    for (const top of tops) {
      for (const bottom of bottoms) {
        const baseBreakdown = evaluatePairCompatibility(top, bottom, {
          targetOccasion: selectedOccasion,
          userProfile: profile,
          recentHistory: history,
          overrides: pairOverrides,
        });

        let adjustedScore = baseBreakdown.totalScore;

        // Occasion filter boost
        if (
          top.occasions.includes(selectedOccasion) &&
          bottom.occasions.includes(selectedOccasion)
        ) {
          adjustedScore += 6;
        } else if (
          top.occasions.includes(selectedOccasion) ||
          bottom.occasions.includes(selectedOccasion)
        ) {
          adjustedScore += 2;
        } else {
          adjustedScore -= 10;
        }

        // Preferred colour boost
        if (preferredColor !== "any") {
          if (
            top.mainColor.name === preferredColor ||
            bottom.mainColor.name === preferredColor
          ) {
            adjustedScore += 10;
          } else {
            adjustedScore -= 8;
          }
        }

        // Preferred style boost
        if (preferredStyle !== "any") {
          if (top.style === preferredStyle || bottom.style === preferredStyle) {
            adjustedScore += 6;
          }
        }

        // Preferred formality
        if (preferredFormality === "formal") {
          if (
            top.category.includes("Formal") ||
            bottom.category.includes("Formal")
          )
            adjustedScore += 7;
        } else if (preferredFormality === "casual") {
          if (
            !top.category.includes("Formal") &&
            !bottom.category.includes("Formal")
          )
            adjustedScore += 5;
        }

        // Weather context adjustment
        let chosenOuterwear: ClothingItem | undefined;
        if (
          selectedWeather === "cool" ||
          selectedOccasion === "Interview" ||
          selectedOccasion === "Formal"
        ) {
          chosenOuterwear = outerwearPool[0];
          if (chosenOuterwear) adjustedScore += 4;
        } else if (selectedWeather === "warm") {
          if (
            top.fabric?.toLowerCase().includes("linen") ||
            top.fabric?.toLowerCase().includes("cotton")
          ) {
            adjustedScore += 4;
          }
        }

        const shoes = findMatchingFootwear(top, bottom, cleanItems, false);
        const primaryShoe = shoes[0];
        const accs = findMatchingAccessories(
          top,
          bottom,
          primaryShoe,
          cleanItems,
          false
        );

        const finalScore = Math.max(20, Math.min(99, Math.round(adjustedScore)));

        const colorExplanation = baseBreakdown.reasons[0];
        const styleExplanation = `The ${
          top.fit || "tailored"
        } ${top.category.toLowerCase()} (${
          top.fabric || "cotton"
        }) pairs naturally with the ${
          bottom.fit || "structured"
        } ${bottom.category.toLowerCase()} for ${selectedOccasion.toLowerCase()} settings.`;

        const shoeExplanation = primaryShoe
          ? `${primaryShoe.name} (${primaryShoe.mainColor.name} ${primaryShoe.category.toLowerCase()}) grounds the ${bottom.mainColor.name.toLowerCase()} trousers and matches the ${selectedOccasion.toLowerCase()} dress code.`
          : "Pair with clean neutral leather footwear from your collection.";

        const accessoryExplanation =
          accs.length > 0
            ? `Complemented by ${accs
                .map((a) => `${a.name} (${a.mainColor.name})`)
                .join(" and ")} for cohesive hardware and leather tone continuity.`
            : "Add a minimal watch or leather belt to complete the silhouette.";

        candidates.push({
          id: `${top.id}_${bottom.id}`,
          top,
          bottom,
          outerwear: chosenOuterwear,
          shoe: primaryShoe,
          accessories: accs,
          score: finalScore,
          colorExplanation,
          styleExplanation,
          shoeExplanation,
          accessoryExplanation,
          harmonyType: baseBreakdown.harmonyType,
        });
      }
    }

    if (isSurpriseMode && surpriseSeed > 0) {
      // Filter to genuinely good combinations (>= 75) and shuffle deterministically by surpriseSeed
      const strongPool = candidates.filter((c) => c.score >= 72);
      const pool = strongPool.length > 0 ? strongPool : candidates;
      return pool
        .slice()
        .sort((a, b) => {
          const hashA =
            (a.id.charCodeAt(0) * 31 + a.id.charCodeAt(a.id.length - 1) * 17 + surpriseSeed * 13) %
            97;
          const hashB =
            (b.id.charCodeAt(0) * 31 + b.id.charCodeAt(b.id.length - 1) * 17 + surpriseSeed * 13) %
            97;
          return hashB - hashA;
        })
        .slice(0, 4);
    }

    return candidates.sort((a, b) => b.score - a.score).slice(0, 6);
  }, [
    items,
    selectedOccasion,
    preferredColor,
    preferredFormality,
    selectedWeather,
    preferredStyle,
    profile,
    history,
    pairOverrides,
    isSurpriseMode,
    surpriseSeed,
  ]);

  const handleSurpriseMe = () => {
    setIsSurpriseMode(true);
    setSurpriseSeed((s) => s + 1);
  };

  const handleSaveRecommendation = async (
    rec: (typeof stylistOutfits)[number]
  ) => {
    const outfitId = `outfit_${Date.now()}`;
    const outfitItems: OutfitItem[] = [
      {
        id: `oi_${Date.now()}_1`,
        outfitId,
        clothingItemId: rec.top.id,
        slot: "top",
      },
      {
        id: `oi_${Date.now()}_2`,
        outfitId,
        clothingItemId: rec.bottom.id,
        slot: "bottom",
      },
    ];
    if (rec.outerwear) {
      outfitItems.push({
        id: `oi_${Date.now()}_ow`,
        outfitId,
        clothingItemId: rec.outerwear.id,
        slot: "outerwear",
      });
    }
    if (rec.shoe) {
      outfitItems.push({
        id: `oi_${Date.now()}_sh`,
        outfitId,
        clothingItemId: rec.shoe.id,
        slot: "footwear",
      });
    }
    rec.accessories.forEach((acc, i) => {
      outfitItems.push({
        id: `oi_${Date.now()}_ac_${i}`,
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
      name: `${selectedOccasion}: ${rec.top.mainColor.name} & ${rec.bottom.mainColor.name}`,
      description: `${rec.colorExplanation} ${rec.styleExplanation}`,
      items: outfitItems,
      occasions: [selectedOccasion],
      season: rec.top.season,
      tags: ["Smart Stylist", rec.harmonyType],
      isFavorite: true,
      compatibilityScore: rec.score,
      wearCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveOutfit(newOutfit);
  };

  const handleWearRecommended = async (
    rec: (typeof stylistOutfits)[number]
  ) => {
    const ids = [
      rec.top.id,
      rec.bottom.id,
      ...(rec.outerwear ? [rec.outerwear.id] : []),
      ...(rec.shoe ? [rec.shoe.id] : []),
      ...rec.accessories.map((a) => a.id),
    ];
    await logWear({
      date: new Date().toISOString().split("T")[0],
      outfitName: `${rec.top.name} + ${rec.bottom.name}`,
      clothingItemIds: ids,
      occasion: selectedOccasion,
      notes: "Selected via Smart Stylist",
      rating: 5,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
            Personal Styling Concierge
          </span>
          <h1 className="text-[16.5px] font-bold mt-0.5">
            Smart Outfit Stylist
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Tell Sagu's Wardrobe where you&apos;re headed. Every outfit below is
            composed strictly from clean items in your actual wardrobe.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSurpriseMe}
          className="px-5 py-3 rounded-2xl bg-bronze-600 hover:bg-bronze-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-md transition-all"
        >
          <Shuffle className="w-4 h-4" />
          Surprise Me!
        </button>
      </div>

      {/* Step 1: Occasion & Preferences Control Panel */}
      <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-6">
        {/* Occasion Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5">
            1. Select Your Occasion
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {STYLIST_OCCASIONS.map((occ) => {
              const active = selectedOccasion === occ;
              return (
                <button
                  key={occ}
                  type="button"
                  onClick={() => {
                    setIsSurpriseMode(false);
                    setSelectedOccasion(occ);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    active
                      ? "bg-[#0288d1] text-white border-[#0288d1] shadow-sm"
                      : "bg-[#F5F7FB] dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-400"
                  }`}
                >
                  {occ}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Preferences Grid */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Preferred Colour */}
          <div>
            <label className="block text-xs text-stone-500 mb-1.5">
              Preferred Colour (Optional)
            </label>
            <select
              value={preferredColor}
              onChange={(e) => {
                setIsSurpriseMode(false);
                setPreferredColor(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium"
            >
              <option value="any">Any Wardrobe Colour</option>
              {wardrobeColors.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Formality */}
          <div>
            <label className="block text-xs text-stone-500 mb-1.5">
              Formality Preference
            </label>
            <select
              value={preferredFormality}
              onChange={(e) => {
                setIsSurpriseMode(false);
                setPreferredFormality(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium"
            >
              <option value="any">Auto-match Occasion</option>
              <option value="formal">Sharp &amp; Tailored</option>
              <option value="smart_casual">Smart Casual</option>
              <option value="casual">Relaxed / Casual</option>
            </select>
          </div>

          {/* Weather Context (Integration-ready, never fabricates live weather) */}
          <div>
            <label className="block text-xs text-stone-500 mb-1.5">
              <span className="inline-flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5 text-bronze-500" />
                Weather Context (Manual / API-Ready)
              </span>
            </label>
            <select
              value={selectedWeather}
              onChange={(e) => {
                setIsSurpriseMode(false);
                setSelectedWeather(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium"
            >
              {WEATHER_OPTIONS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Style */}
          <div>
            <label className="block text-xs text-stone-500 mb-1.5">
              Preferred Style Aesthetic
            </label>
            <select
              value={preferredStyle}
              onChange={(e) => {
                setIsSurpriseMode(false);
                setPreferredStyle(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium"
            >
              <option value="any">All Personal Styles</option>
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Generated Outfits Display */}
      {stylistOutfits.length === 0 ? (
        <div className="p-12 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-bronze-500 mx-auto" />
          <h3 className="text-lg font-serif font-semibold">
            Not enough clean garments to compose full outfits
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Make sure you have at least one clean shirt/top and one clean pair
            of pants/jeans in My Wardrobe.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold">
              {isSurpriseMode
                ? "Surprise Stylist Curations"
                : `Recommended Outfits for ${selectedOccasion}`}
            </h2>
            <span className="text-xs text-stone-500">
              Showing top {stylistOutfits.length} complete looks from your
              wardrobe
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stylistOutfits.map((rec, idx) => {
              const pieces = [
                { role: "Shirt / Top", item: rec.top },
                { role: "Pants", item: rec.bottom },
                ...(rec.outerwear
                  ? [{ role: "Layer", item: rec.outerwear }]
                  : []),
                ...(rec.shoe ? [{ role: "Footwear", item: rec.shoe }] : []),
                ...rec.accessories
                  .slice(0, 2)
                  .map((a) => ({ role: a.category, item: a })),
              ];

              return (
                <div
                  key={rec.id}
                  className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
                          Look 0{idx + 1} • {rec.harmonyType}
                        </span>
                        <h3 className="text-xl font-serif font-semibold mt-0.5">
                          {rec.top.name} &amp; {rec.bottom.name}
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex-shrink-0">
                        {rec.score}% Match
                      </span>
                    </div>

                    {/* Visual Flat-Lay Row */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 bg-[#F5F7FB] dark:bg-stone-900 p-3 rounded-2xl border border-stone-200/60 dark:border-stone-800">
                      {pieces.slice(0, 5).map(({ role, item }) => {
                        const u = getItemImageUrl(item);
                        return (
                          <div
                            key={`${rec.id}_${item.id}`}
                            onClick={() => openDetailModal(item)}
                            className="cursor-pointer group rounded-xl bg-white dark:bg-stone-800 p-1.5 border border-stone-200/60 dark:border-stone-700 text-center"
                          >
                            <div className="aspect-square rounded-lg overflow-hidden mb-1">
                              {u && (
                                <img
                                  src={u}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              )}
                            </div>
                            <div className="text-[9px] uppercase tracking-wider text-stone-400 truncate">
                              {role}
                            </div>
                            <div className="text-[10px] font-medium truncate">
                              {item.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 4-Part Structured Stylist Explanation (Section 16 Requirement) */}
                    <div className="space-y-2.5 p-4 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800 text-xs">
                      <div className="flex items-start gap-2">
                        <Palette className="w-4 h-4 text-bronze-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-stone-900 dark:text-stone-100">
                            Why the colours match:{" "}
                          </strong>
                          <span className="text-stone-600 dark:text-stone-300">
                            {rec.colorExplanation}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Layers className="w-4 h-4 text-bronze-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-stone-900 dark:text-stone-100">
                            Why the styles work together:{" "}
                          </strong>
                          <span className="text-stone-600 dark:text-stone-300">
                            {rec.styleExplanation}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Footprints className="w-4 h-4 text-bronze-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-stone-900 dark:text-stone-100">
                            Suitable footwear:{" "}
                          </strong>
                          <span className="text-stone-600 dark:text-stone-300">
                            {rec.shoeExplanation}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Watch className="w-4 h-4 text-bronze-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-stone-900 dark:text-stone-100">
                            Complementing accessories:{" "}
                          </strong>
                          <span className="text-stone-600 dark:text-stone-300">
                            {rec.accessoryExplanation}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleWearRecommended(rec)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Wear This Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveRecommendation(rec)}
                      className="py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      Save Outfit
                    </button>
                    <Link
                      href={`/builder?topId=${rec.top.id}&bottomId=${rec.bottom.id}${
                        rec.shoe ? `&shoeId=${rec.shoe.id}` : ""
                      }`}
                      className="py-2.5 px-3.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      Customize
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
