"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { OCCASIONS, SEASONS } from "@/lib/constants";
import { Outfit } from "@/types";
import {
  Calendar,
  CheckCircle2,
  Edit3,
  FolderHeart,
  Heart,
  Layers,
  Plus,
  Repeat,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

export default function MyOutfitsPage() {
  const router = useRouter();
  const {
    outfits,
    items,
    getItemImageUrl,
    openDetailModal,
    toggleOutfitFavorite,
    deleteOutfit,
    logWear,
  } = useWardrobe();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "most_worn" | "score">(
    "recent"
  );

  const filteredOutfits = useMemo(() => {
    return outfits
      .filter((outfit) => {
        if (onlyFavorites && !outfit.isFavorite) return false;
        if (
          selectedOccasion !== "all" &&
          !outfit.occasions.includes(selectedOccasion as never)
        )
          return false;
        if (selectedSeason !== "all" && outfit.season !== selectedSeason)
          return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = outfit.name.toLowerCase().includes(q);
          const matchDesc = (outfit.description || "")
            .toLowerCase()
            .includes(q);
          const matchTags = outfit.tags.some((t) =>
            t.toLowerCase().includes(q)
          );
          if (!matchName && !matchDesc && !matchTags) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "most_worn") return b.wearCount - a.wearCount;
        if (sortBy === "score")
          return b.compatibilityScore - a.compatibilityScore;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [
    outfits,
    onlyFavorites,
    selectedOccasion,
    selectedSeason,
    searchQuery,
    sortBy,
  ]);

  const handleWearOutfitToday = async (outfit: Outfit) => {
    await logWear({
      date: new Date().toISOString().split("T")[0],
      outfitId: outfit.id,
      outfitName: outfit.name,
      clothingItemIds: outfit.items.map((oi) => oi.clothingItemId),
      occasion: outfit.occasions[0] || "Daily wear",
      rating: 5,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
            Curated Lookbook
          </span>
          <h1 className="text-[16.5px] font-bold mt-0.5">
            My Outfits
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {outfits.length} saved outfit combinations • Track wear frequency
            and dress in one click.
          </p>
        </div>

        <Link
          href="/builder"
          className="px-5 py-2.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-xs font-semibold inline-flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Outfit
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved outfits by name, description, or #tag..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm"
          />
        </div>

        <select
          value={selectedOccasion}
          onChange={(e) => setSelectedOccasion(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium"
        >
          <option value="all">All Occasions</option>
          {OCCASIONS.map((occ) => (
            <option key={occ} value={occ}>
              {occ}
            </option>
          ))}
        </select>

        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium"
        >
          <option value="all">All Seasons</option>
          {SEASONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setOnlyFavorites((v) => !v)}
          className={`px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
            onlyFavorites
              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
              : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-rose-500" : ""}`}
          />
          Favourites Only
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium"
        >
          <option value="recent">Sort: Recently Created</option>
          <option value="most_worn">Sort: Most Worn</option>
          <option value="score">Sort: Highest Compatibility</option>
        </select>
      </div>

      {/* Outfits Grid */}
      {filteredOutfits.length === 0 ? (
        <div className="p-12 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 text-center space-y-4">
          <FolderHeart className="w-10 h-10 text-stone-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-semibold">
              No saved outfits found
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Combine your favourite shirts, pants, footwear, and accessories in
              the Outfit Builder or save matches directly from the Outfit
              Matcher.
            </p>
          </div>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] text-xs font-semibold"
          >
            <Layers className="w-4 h-4" />
            Open Outfit Builder
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutfits.map((outfit) => {
            const resolvedPieces = outfit.items
              .map((oi) => ({
                slot: oi.slot,
                item: items.find((i) => i.id === oi.clothingItemId),
              }))
              .filter((x) => Boolean(x.item));

            const allClean = resolvedPieces.every(
              (p) => p.item?.status === "clean"
            );

            return (
              <div
                key={outfit.id}
                className="rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial hover:shadow-editorial-lg transition-all p-5 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          {outfit.compatibilityScore}% Match
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            allClean
                              ? "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {allClean ? "All Pieces Ready" : "Item in Laundry"}
                        </span>
                      </div>
                      <h3 className="text-xl font-serif font-semibold mt-2">
                        {outfit.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleOutfitFavorite(outfit.id)}
                      className={`p-2 rounded-full border ${
                        outfit.isFavorite
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                          : "border-stone-200 dark:border-stone-800 text-stone-400"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          outfit.isFavorite ? "fill-rose-500" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Composite Visual Preview */}
                  <div className="grid grid-cols-3 gap-2.5 bg-[#F5F7FB] dark:bg-stone-900/90 p-3 rounded-2xl border border-stone-200/60 dark:border-stone-800">
                    {resolvedPieces.slice(0, 6).map(({ slot, item }) => {
                      const u = getItemImageUrl(item);
                      return (
                        <div
                          key={`${outfit.id}_${item!.id}_${slot}`}
                          onClick={() => openDetailModal(item!)}
                          className="cursor-pointer group rounded-xl bg-white dark:bg-stone-800 p-1.5 border border-stone-200/60 dark:border-stone-700 text-center"
                        >
                          <div className="aspect-square rounded-lg overflow-hidden mb-1">
                            {u && (
                              <img
                                src={u}
                                alt={item!.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            )}
                          </div>
                          <div className="text-[9px] uppercase tracking-wider text-stone-400">
                            {slot}
                          </div>
                          <div className="text-[11px] font-medium truncate">
                            {item!.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {outfit.description && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {outfit.description}
                    </p>
                  )}

                  {/* Occasions & Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {outfit.occasions.map((occ) => (
                      <span
                        key={occ}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                      >
                        {occ}
                      </span>
                    ))}
                    {outfit.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] text-bronze-600 dark:text-bronze-400 bg-bronze-500/10"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1">
                      <Repeat className="w-3.5 h-3.5" />
                      Worn {outfit.wearCount} times
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {outfit.lastWornDate
                        ? `Last: ${outfit.lastWornDate}`
                        : "Never worn"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleWearOutfitToday(outfit)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Wear Today
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/builder?edit=${outfit.id}`)
                      }
                      className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                      title="Edit Outfit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteOutfit(outfit.id)}
                      className="p-2 rounded-xl border border-rose-500/25 text-rose-500 hover:bg-rose-500/10"
                      title="Delete Outfit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
