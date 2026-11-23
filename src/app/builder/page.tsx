"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { OCCASIONS, SEASONS } from "@/lib/constants";
import {
  evaluatePairCompatibility,
  findMatchingAccessories,
  findMatchingFootwear,
  generateMatcherRecommendations,
} from "@/lib/matching-engine";
import {
  ClothingItem,
  Occasion,
  Outfit,
  OutfitItem,
  OutfitSlot,
  Season,
} from "@/types";
import {
  Check,
  Heart,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";

const SLOTS: {
  slot: OutfitSlot;
  label: string;
  required?: boolean;
  filter: (item: ClothingItem) => boolean;
}[] = [
  {
    slot: "top",
    label: "Shirt / Top",
    required: true,
    filter: (i) =>
      (i.categoryGroup === "tops" || i.categoryGroup === "ethnic") &&
      i.category !== "Jackets" &&
      i.category !== "Blazers",
  },
  {
    slot: "bottom",
    label: "Pants / Jeans",
    required: true,
    filter: (i) => i.categoryGroup === "bottoms",
  },
  {
    slot: "outerwear",
    label: "Jacket / Blazer",
    filter: (i) =>
      i.category === "Jackets" ||
      i.category === "Blazers" ||
      i.category === "Sweaters" ||
      i.category === "Hoodies",
  },
  {
    slot: "footwear",
    label: "Shoes / Footwear",
    filter: (i) => i.categoryGroup === "footwear",
  },
  {
    slot: "belt",
    label: "Belt",
    filter: (i) => i.category === "Belts",
  },
  {
    slot: "watch",
    label: "Watch",
    filter: (i) => i.category === "Watches",
  },
  {
    slot: "accessory",
    label: "Extra Accessory",
    filter: (i) =>
      i.categoryGroup === "accessories" &&
      i.category !== "Belts" &&
      i.category !== "Watches",
  },
];

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    items,
    outfits,
    profile,
    history,
    pairOverrides,
    getItemImageUrl,
    saveOutfit,
    deleteOutfit,
    openDetailModal,
    openAddModal,
  } = useWardrobe();

  const [activeSlot, setActiveSlot] = useState<OutfitSlot>("top");
  const [selectedBySlot, setSelectedBySlot] = useState<
    Partial<Record<OutfitSlot, ClothingItem>>
  >({});

  // Outfit metadata form
  const [editingOutfitId, setEditingOutfitId] = useState<string | null>(null);
  const [outfitName, setOutfitName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedOccasions, setSelectedOccasions] = useState<Occasion[]>([
    "Office",
    "Casual outing",
  ]);
  const [season, setSeason] = useState<Season>("All Season");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Curated"]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Initialize from URL params (`?edit=<outfitId>` or `?topId=...&bottomId=...` or `?itemId=...`)
  useEffect(() => {
    if (items.length === 0) return;

    const editId = searchParams.get("edit");
    if (editId) {
      const targetOutfit = outfits.find((o) => o.id === editId);
      if (targetOutfit) {
        setEditingOutfitId(targetOutfit.id);
        setOutfitName(targetOutfit.name);
        setDescription(targetOutfit.description || "");
        setSelectedOccasions(targetOutfit.occasions);
        setSeason(targetOutfit.season);
        setTags(targetOutfit.tags || []);
        setIsFavorite(targetOutfit.isFavorite);

        const nextSlots: Partial<Record<OutfitSlot, ClothingItem>> = {};
        for (const oi of targetOutfit.items) {
          const found = items.find((i) => i.id === oi.clothingItemId);
          if (found) nextSlots[oi.slot] = found;
        }
        setSelectedBySlot(nextSlots);
        return;
      }
    }

    const topId = searchParams.get("topId");
    const bottomId = searchParams.get("bottomId");
    const shoeId = searchParams.get("shoeId");
    const singleItemId = searchParams.get("itemId");

    const initialSlots: Partial<Record<OutfitSlot, ClothingItem>> = {};
    if (topId) {
      const f = items.find((i) => i.id === topId);
      if (f) initialSlots.top = f;
    }
    if (bottomId) {
      const f = items.find((i) => i.id === bottomId);
      if (f) initialSlots.bottom = f;
    }
    if (shoeId) {
      const f = items.find((i) => i.id === shoeId);
      if (f) initialSlots.footwear = f;
    }
    if (singleItemId) {
      const f = items.find((i) => i.id === singleItemId);
      if (f) {
        const matchedSlot =
          SLOTS.find((s) => s.filter(f))?.slot || "accessory";
        initialSlots[matchedSlot] = f;
        setActiveSlot(matchedSlot === "top" ? "bottom" : "top");
      }
    }

    if (Object.keys(initialSlots).length > 0) {
      setSelectedBySlot(initialSlots);
    }
  }, [searchParams, items, outfits]);

  // Live compatibility evaluation
  const compatibility = useMemo(() => {
    const top = selectedBySlot.top;
    const bottom = selectedBySlot.bottom;
    if (!top || !bottom) return null;
    return evaluatePairCompatibility(top, bottom, {
      userProfile: profile,
      recentHistory: history,
      overrides: pairOverrides,
    });
  }, [selectedBySlot.top, selectedBySlot.bottom, profile, history, pairOverrides]);

  // Smart Auto-Complete Remaining Slots
  const handleSmartAutoComplete = () => {
    const next = { ...selectedBySlot };
    let top = next.top;
    let bottom = next.bottom;

    if (!top && bottom) {
      const matches = generateMatcherRecommendations(bottom, items, {
        userProfile: profile,
        recentHistory: history,
        overrides: pairOverrides,
      });
      if (matches[0]) top = matches[0].matchedItem;
      next.top = top;
    } else if (top && !bottom) {
      const matches = generateMatcherRecommendations(top, items, {
        userProfile: profile,
        recentHistory: history,
        overrides: pairOverrides,
      });
      if (matches[0]) bottom = matches[0].matchedItem;
      next.bottom = bottom;
    } else if (!top && !bottom) {
      const cleanTops = items.filter((i) => SLOTS[0].filter(i) && i.status === "clean");
      if (cleanTops[0]) {
        top = cleanTops[0];
        next.top = top;
        const matches = generateMatcherRecommendations(top, items);
        if (matches[0]) {
          bottom = matches[0].matchedItem;
          next.bottom = bottom;
        }
      }
    }

    if (top && bottom) {
      if (!next.footwear) {
        const shoes = findMatchingFootwear(top, bottom, items);
        if (shoes[0]) next.footwear = shoes[0];
      }
      const accs = findMatchingAccessories(
        top,
        bottom,
        next.footwear,
        items
      );
      for (const acc of accs) {
        if (acc.category === "Watches" && !next.watch) next.watch = acc;
        else if (acc.category === "Belts" && !next.belt) next.belt = acc;
        else if (
          acc.category !== "Watches" &&
          acc.category !== "Belts" &&
          !next.accessory
        )
          next.accessory = acc;
      }
    }

    setSelectedBySlot(next);
    if (!outfitName && next.top && next.bottom) {
      setOutfitName(
        `${next.top.mainColor.name} ${next.top.category} & ${next.bottom.mainColor.name} ${next.bottom.category}`
      );
    }
  };

  const handleSelectItemForSlot = (slot: OutfitSlot, item: ClothingItem) => {
    setSelectedBySlot((prev) => {
      const isAlready = prev[slot]?.id === item.id;
      const updated = { ...prev };
      if (isAlready) {
        delete updated[slot];
      } else {
        updated[slot] = item;
      }
      return updated;
    });
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  };

  const toggleOccasion = (occ: Occasion) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const handleSaveOutfit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosenEntries = Object.entries(selectedBySlot).filter(([, v]) =>
      Boolean(v)
    ) as [OutfitSlot, ClothingItem][];

    if (chosenEntries.length < 2) return;

    const outfitId = editingOutfitId || `outfit_${Date.now()}`;
    const outfitItems: OutfitItem[] = chosenEntries.map(
      ([slot, item], idx) => ({
        id: `oi_${Date.now()}_${idx}`,
        outfitId,
        clothingItemId: item.id,
        slot,
      })
    );

    const defaultTitle =
      selectedBySlot.top && selectedBySlot.bottom
        ? `${selectedBySlot.top.mainColor.name} ${selectedBySlot.top.category} & ${selectedBySlot.bottom.mainColor.name} ${selectedBySlot.bottom.category}`
        : "Curated Look";

    const existingOutfit = editingOutfitId
      ? outfits.find((o) => o.id === editingOutfitId)
      : undefined;

    const fullOutfit: Outfit = {
      id: outfitId,
      name: outfitName.trim() || defaultTitle,
      description:
        description.trim() || compatibility?.reasons.join(" ") || undefined,
      items: outfitItems,
      occasions:
        selectedOccasions.length > 0 ? selectedOccasions : ["Daily wear"],
      season,
      tags,
      isFavorite,
      compatibilityScore: compatibility?.totalScore ?? 88,
      wearCount: existingOutfit?.wearCount ?? 0,
      lastWornDate: existingOutfit?.lastWornDate,
      createdAt: existingOutfit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveOutfit(fullOutfit);
    router.push("/outfits");
  };

  const handleDeleteCurrentOutfit = async () => {
    if (!editingOutfitId) return;
    await deleteOutfit(editingOutfitId);
    router.push("/outfits");
  };

  const activeSlotConfig =
    SLOTS.find((s) => s.slot === activeSlot) || SLOTS[0];
  const slotItems = items.filter(activeSlotConfig.filter);

  const selectedCount = Object.values(selectedBySlot).filter(Boolean).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
            Interactive Lookbook Studio
          </span>
          <h1 className="text-[16.5px] font-bold mt-0.5">
            {editingOutfitId ? "Edit Saved Outfit" : "Outfit Builder"}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Combine shirts, trousers, outerwear, footwear, belts, and watches
            into a complete ensemble.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSmartAutoComplete}
            className="px-4 py-2.5 rounded-xl bg-bronze-600 hover:bg-bronze-700 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            Smart Auto-Complete Look
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedBySlot({});
              setEditingOutfitId(null);
              setOutfitName("");
              setDescription("");
            }}
            className="px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-medium inline-flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Canvas
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Visual Outfit Composition Canvas */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold block">
                  Ensemble Composition
                </span>
                <h2 className="text-lg font-serif font-semibold">
                  {selectedCount} {selectedCount === 1 ? "Piece" : "Pieces"}{" "}
                  Selected
                </h2>
              </div>

              {compatibility && (
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    {compatibility.totalScore}% • {compatibility.tier}
                  </span>
                </div>
              )}
            </div>

            {/* 7-Slot Visual Flat-Lay Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SLOTS.map((slotDef) => {
                const chosen = selectedBySlot[slotDef.slot];
                const isActive = activeSlot === slotDef.slot;
                const imgUrl = chosen ? getItemImageUrl(chosen) : null;

                return (
                  <div
                    key={slotDef.slot}
                    onClick={() => setActiveSlot(slotDef.slot)}
                    className={`relative cursor-pointer rounded-2xl p-3 border transition-all flex flex-col justify-between min-h-[148px] ${
                      isActive
                        ? "border-stone-900 dark:border-white bg-stone-900/5 dark:bg-white/10 ring-1 ring-stone-900 dark:ring-white"
                        : chosen
                          ? "border-stone-200 dark:border-stone-800 bg-[#F5F7FB] dark:bg-stone-900"
                          : "border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-900/40 hover:border-stone-400"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-stone-400">
                      <span>{slotDef.label}</span>
                      {chosen && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBySlot((prev) => {
                              const copy = { ...prev };
                              delete copy[slotDef.slot];
                              return copy;
                            });
                          }}
                          className="p-0.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
                          title="Remove from slot"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {chosen ? (
                      <div className="my-1.5 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 mb-1.5">
                          {imgUrl && (
                            <img
                              src={imgUrl}
                              alt={chosen.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="text-xs font-serif font-semibold line-clamp-1">
                          {chosen.name}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-stone-500">
                          <span
                            className="w-2 h-2 rounded-full border border-black/15"
                            style={{ backgroundColor: chosen.mainColor.hex }}
                          />
                          <span>{chosen.mainColor.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="my-auto py-4 text-center text-stone-400">
                        <Plus className="w-5 h-5 mx-auto mb-1 opacity-60" />
                        <span className="text-[11px] block">
                          Select {slotDef.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Compatibility Reasoning Box */}
            {compatibility && (
              <div className="p-3.5 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-bronze-600 dark:text-bronze-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  {compatibility.harmonyType}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {compatibility.reasons.join(" ")}
                </p>
              </div>
            )}

            {/* Save Outfit Metadata Form */}
            <form
              onSubmit={handleSaveOutfit}
              className="pt-4 border-t border-stone-200/80 dark:border-stone-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Outfit Details
                </label>
                <button
                  type="button"
                  onClick={() => setIsFavorite((v) => !v)}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                    isFavorite
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                      : "border-stone-200 dark:border-stone-700 text-stone-400"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isFavorite ? "fill-rose-500" : ""
                    }`}
                  />
                  Favourite
                </button>
              </div>

              <input
                type="text"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="Name your outfit (e.g. Friday Smart-Casual)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs sm:text-sm"
              />

              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Styling notes or description..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">
                    Season
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value as Season)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                  >
                    {SEASONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">
                    Add Tag
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="e.g. Linen"
                      className="w-full px-2.5 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-xs font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() =>
                          setTags((prev) => prev.filter((x) => x !== t))
                        }
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-[11px] text-stone-400 mb-1.5">
                  Occasions
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {OCCASIONS.map((occ) => {
                    const active = selectedOccasions.includes(occ);
                    return (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => toggleOccasion(occ)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                          active
                            ? "bg-[#0288d1] text-white border-[#0288d1]"
                            : "border-stone-200 dark:border-stone-700 text-stone-500"
                        }`}
                      >
                        {occ}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={selectedCount < 2}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-xs font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {editingOutfitId
                    ? "Update Saved Outfit"
                    : "Save Outfit Combination"}
                </button>
                {editingOutfitId && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentOutfit}
                    className="p-3 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                    title="Delete Outfit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: Slot Garment Picker */}
        <div className="lg:col-span-7 space-y-5">
          {/* Slot Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {SLOTS.map((s) => {
              const hasItem = Boolean(selectedBySlot[s.slot]);
              const isCurrent = activeSlot === s.slot;
              return (
                <button
                  key={s.slot}
                  type="button"
                  onClick={() => setActiveSlot(s.slot)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border inline-flex items-center gap-1.5 transition-all ${
                    isCurrent
                      ? "bg-[#0288d1] text-white border-[#0288d1]"
                      : "bg-white dark:bg-[#121621] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                  }`}
                >
                  {hasItem && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-semibold">
                  Select {activeSlotConfig.label} ({slotItems.length})
                </h2>
                <p className="text-xs text-stone-500">
                  Click a garment to place it into the {activeSlotConfig.label}{" "}
                  slot.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openAddModal()}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New
              </button>
            </div>

            {slotItems.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Layers className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-xs text-stone-500">
                  No items in your wardrobe for {activeSlotConfig.label}.
                </p>
                <button
                  type="button"
                  onClick={() => openAddModal()}
                  className="px-4 py-2 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] text-xs font-semibold"
                >
                  Add {activeSlotConfig.label}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {slotItems.map((item) => {
                  const isChosen = selectedBySlot[activeSlot]?.id === item.id;
                  const imgUrl = getItemImageUrl(item);

                  // Show live match score with already-selected top/bottom if applicable
                  let pairScore: number | null = null;
                  if (activeSlot === "bottom" && selectedBySlot.top) {
                    pairScore = evaluatePairCompatibility(
                      selectedBySlot.top,
                      item,
                      {
                        userProfile: profile,
                        recentHistory: history,
                        overrides: pairOverrides,
                      }
                    ).totalScore;
                  } else if (activeSlot === "top" && selectedBySlot.bottom) {
                    pairScore = evaluatePairCompatibility(
                      item,
                      selectedBySlot.bottom,
                      {
                        userProfile: profile,
                        recentHistory: history,
                        overrides: pairOverrides,
                      }
                    ).totalScore;
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItemForSlot(activeSlot, item)}
                      className={`cursor-pointer rounded-2xl p-3 border transition-all flex flex-col justify-between ${
                        isChosen
                          ? "border-stone-900 dark:border-white bg-stone-900/5 dark:bg-white/10 ring-2 ring-stone-900 dark:ring-white"
                          : "border-stone-200/80 dark:border-stone-800 bg-[#F5F7FB] dark:bg-stone-900/60 hover:border-stone-400"
                      }`}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-white dark:bg-stone-800 mb-2.5">
                        {imgUrl && (
                          <img
                            src={imgUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {pairScore !== null && (
                          <span
                            className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pairScore >= 85
                                ? "bg-emerald-600 text-white"
                                : pairScore >= 70
                                  ? "bg-teal-600 text-white"
                                  : "bg-amber-600 text-white"
                            }`}
                          >
                            {pairScore}% match
                          </span>
                        )}
                        {item.status !== "clean" && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/90 text-white font-medium">
                            {item.status}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-bronze-600 dark:text-bronze-400 font-semibold truncate">
                          {item.category}
                        </div>
                        <div className="text-xs font-serif font-semibold truncate">
                          {item.name}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/15"
                              style={{ backgroundColor: item.mainColor.hex }}
                            />
                            {item.mainColor.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailModal(item);
                            }}
                            className="text-[10px] underline hover:text-stone-900 dark:hover:text-white"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OutfitBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-stone-500">
          Loading Outfit Builder...
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
