"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import {
  evaluatePairCompatibility,
  findMatchingAccessories,
  findMatchingFootwear,
} from "@/lib/matching-engine";
import { ClothingItem, Occasion, Outfit } from "@/types";
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Footprints,
  RefreshCw,
  Shirt,
  Sparkles,
  Watch,
  Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";

const OCCASIONS: { id: Occasion; label: string; icon: string }[] = [
  { id: "Office", label: "Office", icon: "🏢" },
  { id: "Casual outing", label: "Casual Outing", icon: "☕" },
  { id: "Meetings", label: "Meetings", icon: "🤝" },
  { id: "Party", label: "Party", icon: "🎉" },
  { id: "College", label: "College", icon: "🎓" },
  { id: "Travel", label: "Travel", icon: "✈️" },
];

export function OneTapMorningStylist() {
  const {
    items,
    profile,
    history,
    pairOverrides,
    getItemImageUrl,
    openDetailModal,
    logWear,
    saveOutfit,
  } = useWardrobe();

  // Smart default occasion based on day of week
  const defaultOccasion = useMemo<Occasion>(() => {
    const day = new Date().getDay();
    // Monday (1) to Friday (5) = Office, Weekend = Casual
    return day >= 1 && day <= 5 ? "Office" : "Casual outing";
  }, []);

  const [selectedOccasion, setSelectedOccasion] =
    useState<Occasion>(defaultOccasion);
  const [rotationIdx, setRotationIdx] = useState(0);
  const [isWornState, setIsWornState] = useState(false);
  const [isSavedState, setIsSavedState] = useState(false);

  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Today's formatted friendly date
  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Find candidate outfits
  const recommendedLooks = useMemo(() => {
    const cleanItems = items.filter((i) => i.status === "clean");

    const tops = cleanItems.filter(
      (i) =>
        (i.categoryGroup === "tops" || i.categoryGroup === "ethnic") &&
        i.category !== "Blazers" &&
        i.category !== "Jackets"
    );
    const bottoms = cleanItems.filter((i) => i.categoryGroup === "bottoms");

    if (tops.length === 0 || bottoms.length === 0) return [];

    const candidates = [];

    // Filter recent history (last 4 days)
    const recentWornIds = new Set(
      history
        .filter((h) => {
          const diffDays =
            (new Date(todayIso).getTime() - new Date(h.date).getTime()) /
            (1000 * 3600 * 24);
          return diffDays >= 0 && diffDays <= 4;
        })
        .flatMap((h) => h.clothingItemIds)
    );

    for (const top of tops) {
      for (const bottom of bottoms) {
        // Occasion filter match bonus
        const topMatches =
          top.occasions.length === 0 ||
          top.occasions.includes(selectedOccasion);
        const bottomMatches =
          bottom.occasions.length === 0 ||
          bottom.occasions.includes(selectedOccasion);

        const breakdown = evaluatePairCompatibility(top, bottom, {
          userProfile: profile,
          recentHistory: history,
          overrides: pairOverrides,
        });

        let finalScore = breakdown.totalScore;

        // Bonus if occasion fits
        if (topMatches && bottomMatches) {
          finalScore += 12;
        }

        // Heavy penalty if worn in the last 4 days (ensures fresh rotation!)
        if (recentWornIds.has(top.id) || recentWornIds.has(bottom.id)) {
          finalScore -= 35;
        }

        const shoes = findMatchingFootwear(top, bottom, cleanItems, false);
        const accs = findMatchingAccessories(
          top,
          bottom,
          shoes[0],
          cleanItems,
          false
        );

        candidates.push({
          id: `${top.id}_${bottom.id}`,
          top,
          bottom,
          shoe: shoes[0],
          accessories: accs,
          score: Math.min(99, Math.max(50, finalScore)),
          harmonyType: breakdown.harmonyType,
          topRecentlyWorn: recentWornIds.has(top.id),
          bottomRecentlyWorn: recentWornIds.has(bottom.id),
        });
      }
    }

    return candidates.sort((a, b) => b.score - a.score);
  }, [items, selectedOccasion, profile, history, pairOverrides, todayIso]);

  const activeLook =
    recommendedLooks.length > 0
      ? recommendedLooks[rotationIdx % recommendedLooks.length]
      : null;

  // Check if today already has a look logged
  const alreadyLoggedToday = useMemo(() => {
    return history.some((h) => h.date === todayIso);
  }, [history, todayIso]);

  const handleWearToday = async () => {
    if (!activeLook) return;

    const itemIds = [
      activeLook.top.id,
      activeLook.bottom.id,
      ...(activeLook.shoe ? [activeLook.shoe.id] : []),
      ...activeLook.accessories.map((a) => a.id),
    ];

    await logWear({
      date: todayIso,
      outfitName: `${activeLook.top.name} + ${activeLook.bottom.name}`,
      clothingItemIds: itemIds,
      occasion: selectedOccasion,
      notes: `One-Tap Morning Pick (${activeLook.harmonyType})`,
      rating: 5,
    });

    setIsWornState(true);
  };

  const handleSaveOutfit = async () => {
    if (!activeLook) return;

    const newOutfit: Outfit = {
      id: `outfit_${Date.now()}`,
      name: `${activeLook.top.name} & ${activeLook.bottom.name}`,
      description: `${selectedOccasion} style with ${activeLook.harmonyType} harmony`,
      items: [
        {
          id: `oi_top_${Date.now()}`,
          outfitId: "",
          clothingItemId: activeLook.top.id,
          slot: "top",
        },
        {
          id: `oi_bot_${Date.now()}`,
          outfitId: "",
          clothingItemId: activeLook.bottom.id,
          slot: "bottom",
        },
        ...(activeLook.shoe
          ? [
              {
                id: `oi_shoe_${Date.now()}`,
                outfitId: "",
                clothingItemId: activeLook.shoe.id,
                slot: "footwear" as const,
              },
            ]
          : []),
      ],
      occasions: [selectedOccasion],
      season: "All Season",
      tags: [selectedOccasion, activeLook.harmonyType],
      isFavorite: true,
      compatibilityScore: activeLook.score,
      wearCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveOutfit(newOutfit);
    setIsSavedState(true);
  };

  if (!activeLook) {
    return null;
  }

  const topImg = getItemImageUrl(activeLook.top);
  const bottomImg = getItemImageUrl(activeLook.bottom);
  const shoeImg = activeLook.shoe ? getItemImageUrl(activeLook.shoe) : null;
  const accItem = activeLook.accessories[0];
  const accImg = accItem ? getItemImageUrl(accItem) : null;

  return (
    <div className="rounded-[22px] bg-gradient-to-br from-white via-white to-[#f0f7ff] dark:from-[#121824] dark:to-[#172033] border-2 border-[#0288d1]/30 p-4 sm:p-5 shadow-[0_4px_16px_rgba(2,136,209,0.12)] space-y-4">
      {/* Header with Occasion Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[8px] bg-[#0288d1] text-white">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </span>
            <h2 className="text-[15.5px] font-bold text-[#090909] dark:text-white tracking-tight">
              One-Tap Morning Pick
            </h2>
            <span className="text-[12px] font-medium text-[#666666] dark:text-slate-400">
              • {todayLabel}
            </span>
          </div>
          <p className="text-[12.5px] text-[#666666] dark:text-slate-400 mt-1">
            Fresh rotation filtered for clean clothes & zero repeats this week.
          </p>
        </div>

        {/* Shuffle Button */}
        <button
          type="button"
          onClick={() => {
            setRotationIdx((prev) => prev + 1);
            setIsWornState(false);
            setIsSavedState(false);
          }}
          className="self-start sm:self-auto h-9 px-3 rounded-[12px] bg-[#0288d1]/10 hover:bg-[#0288d1]/20 text-[#0288d1] font-semibold text-[12.5px] inline-flex items-center gap-1.5 transition-colors"
          title="Try next best combination"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Shuffle Look ({activeLook.score}%)</span>
        </button>
      </div>

      {/* Occasion Quick Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {OCCASIONS.map((occ) => (
          <button
            key={occ.id}
            type="button"
            onClick={() => {
              setSelectedOccasion(occ.id);
              setRotationIdx(0);
              setIsWornState(false);
              setIsSavedState(false);
            }}
            className={`h-8 px-3 rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-fast flex items-center gap-1.5 ${
              selectedOccasion === occ.id
                ? "bg-[#0288d1] text-white shadow-[0_4px_12px_rgba(2,136,209,0.25)]"
                : "bg-white/80 dark:bg-slate-800 text-[#555555] dark:text-slate-300 border border-slate-200/90 dark:border-slate-700"
            }`}
          >
            <span>{occ.icon}</span>
            <span>{occ.label}</span>
          </button>
        ))}
      </div>

      {/* Outfit Showcase Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* TOP */}
        <div
          onClick={() => openDetailModal(activeLook.top)}
          className="cursor-pointer group rounded-[16px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-2.5 flex flex-col justify-between hover:border-[#0288d1] transition-all"
        >
          <div className="aspect-square w-full rounded-[12px] bg-[#f8fafc] dark:bg-slate-800/60 overflow-hidden mb-2 relative">
            {topImg ? (
              <img
                src={topImg}
                alt={activeLook.top.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Shirt className="w-8 h-8 opacity-40" />
              </div>
            )}
            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-[6px] bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold">
              TOP
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#666666] mb-0.5">
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/15 flex-shrink-0"
                style={{ backgroundColor: activeLook.top.mainColor.hex }}
              />
              <span className="truncate">{activeLook.top.category}</span>
            </div>
            <p className="text-[13px] font-bold text-[#090909] dark:text-white truncate">
              {activeLook.top.name}
            </p>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          onClick={() => openDetailModal(activeLook.bottom)}
          className="cursor-pointer group rounded-[16px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-2.5 flex flex-col justify-between hover:border-[#0288d1] transition-all"
        >
          <div className="aspect-square w-full rounded-[12px] bg-[#f8fafc] dark:bg-slate-800/60 overflow-hidden mb-2 relative">
            {bottomImg ? (
              <img
                src={bottomImg}
                alt={activeLook.bottom.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <span className="text-xl">👖</span>
              </div>
            )}
            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-[6px] bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold">
              BOTTOM
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#666666] mb-0.5">
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/15 flex-shrink-0"
                style={{ backgroundColor: activeLook.bottom.mainColor.hex }}
              />
              <span className="truncate">{activeLook.bottom.category}</span>
            </div>
            <p className="text-[13px] font-bold text-[#090909] dark:text-white truncate">
              {activeLook.bottom.name}
            </p>
          </div>
        </div>

        {/* FOOTWEAR */}
        {activeLook.shoe ? (
          <div
            onClick={() => openDetailModal(activeLook.shoe!)}
            className="cursor-pointer group rounded-[16px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-2.5 flex flex-col justify-between hover:border-[#0288d1] transition-all"
          >
            <div className="aspect-square w-full rounded-[12px] bg-[#f8fafc] dark:bg-slate-800/60 overflow-hidden mb-2 relative">
              {shoeImg ? (
                <img
                  src={shoeImg}
                  alt={activeLook.shoe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Footprints className="w-8 h-8 opacity-40" />
                </div>
              )}
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-[6px] bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold">
                SHOES
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#666666] mb-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/15 flex-shrink-0"
                  style={{ backgroundColor: activeLook.shoe.mainColor.hex }}
                />
                <span className="truncate">{activeLook.shoe.category}</span>
              </div>
              <p className="text-[13px] font-bold text-[#090909] dark:text-white truncate">
                {activeLook.shoe.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-[16px] bg-white/50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 p-3 flex flex-col items-center justify-center text-center text-slate-400">
            <Footprints className="w-6 h-6 mb-1 opacity-40" />
            <span className="text-[11px] font-medium">Add shoes for complete look</span>
          </div>
        )}

        {/* ACCESSORY / PERFUME */}
        {accItem ? (
          <div
            onClick={() => openDetailModal(accItem)}
            className="cursor-pointer group rounded-[16px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-2.5 flex flex-col justify-between hover:border-[#0288d1] transition-all"
          >
            <div className="aspect-square w-full rounded-[12px] bg-[#f8fafc] dark:bg-slate-800/60 overflow-hidden mb-2 relative">
              {accImg ? (
                <img
                  src={accImg}
                  alt={accItem.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Watch className="w-8 h-8 opacity-40" />
                </div>
              )}
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-[6px] bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold">
                FINISH
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#666666] mb-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/15 flex-shrink-0"
                  style={{ backgroundColor: accItem.mainColor.hex }}
                />
                <span className="truncate">{accItem.category}</span>
              </div>
              <p className="text-[13px] font-bold text-[#090909] dark:text-white truncate">
                {accItem.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-[16px] bg-white/50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 p-3 flex flex-col items-center justify-center text-center text-slate-400">
            <Sparkles className="w-6 h-6 mb-1 opacity-40" />
            <span className="text-[11px] font-medium">Accessories auto-pair</span>
          </div>
        )}
      </div>

      {/* Harmony Explanation Pill & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-[8px] bg-[#269238]/10 text-[#269238] text-[12px] font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{activeLook.score}% Harmony ({activeLook.harmonyType})</span>
          </span>
          <span className="text-[12px] text-[#666666] dark:text-slate-400 truncate">
            {activeLook.top.mainColor.name} + {activeLook.bottom.mainColor.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Outfit Button */}
          <button
            type="button"
            onClick={handleSaveOutfit}
            disabled={isSavedState}
            className={`h-10 px-3.5 rounded-[12px] text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-all ${
              isSavedState
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                : "bg-white dark:bg-slate-800 text-[#0288d1] border border-[#0288d1]/30 hover:bg-[#0288d1]/5"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSavedState ? "Saved" : "Save Look"}</span>
          </button>

          {/* One-Tap Wear Today Button */}
          <button
            type="button"
            onClick={handleWearToday}
            className={`h-10 px-4 rounded-[12px] text-white text-[13px] font-bold inline-flex items-center gap-2 shadow-[0_4px_12px_rgba(38,146,56,0.25)] transition-all ${
              isWornState || alreadyLoggedToday
                ? "bg-[#269238] opacity-90"
                : "bg-[#269238] hover:bg-[#208030]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isWornState
                ? "Logged for Today!"
                : alreadyLoggedToday
                ? "Log This Look Too"
                : "Wear This Today"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
