"use client";

import { ClothingCard } from "@/components/wardrobe/ClothingCard";
import { useWardrobe } from "@/context/WardrobeContext";
import {
  AVAILABILITY_STATUS_CONFIG,
  CLOTHING_GROUPS,
  OCCASIONS,
  SEASONS,
} from "@/lib/constants";
import { AvailabilityStatus, ClothingGroup } from "@/types";
import {
  CheckCircle2,
  Filter,
  LayoutGrid,
  List,
  Plus,
  RotateCcw,
  Search,
  Shirt,
  Sparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";

function WardrobeContent() {
  const searchParams = useSearchParams();
  const {
    items,
    categories,
    openAddModal,
    updateItemStatus,
  } = useWardrobe();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<ClothingGroup | "all">(
    "all"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<
    AvailabilityStatus | "all"
  >("all");
  const [sortBy, setSortBy] = useState<
    "recent" | "most_worn" | "least_worn" | "price_desc" | "name"
  >("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sync URL query parameters on mount
  useEffect(() => {
    const grp = searchParams.get("group") as ClothingGroup | null;
    const col = searchParams.get("color");
    const st = searchParams.get("status") as AvailabilityStatus | null;
    if (grp) setSelectedGroup(grp);
    if (col) setSelectedColor(col);
    if (st) setSelectedStatus(st);
  }, [searchParams]);

  // Available unique brands & colours in user's wardrobe
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.brand) set.add(i.brand);
    });
    return Array.from(set).sort();
  }, [items]);

  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((i) => {
      map.set(i.mainColor.name, i.mainColor.hex);
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [items]);

  const visibleCategories = useMemo(() => {
    if (selectedGroup === "all") return categories;
    return categories.filter((c) => c.group === selectedGroup);
  }, [categories, selectedGroup]);

  // Filtered and Sorted Items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedGroup !== "all" && item.categoryGroup !== selectedGroup)
          return false;
        if (selectedCategory !== "all" && item.category !== selectedCategory)
          return false;
        if (
          selectedColor !== "all" &&
          item.mainColor.name !== selectedColor &&
          item.secondaryColor?.name !== selectedColor
        )
          return false;
        if (selectedBrand !== "all" && item.brand !== selectedBrand)
          return false;
        if (
          selectedOccasion !== "all" &&
          !item.occasions.includes(selectedOccasion as never)
        )
          return false;
        if (selectedSeason !== "all" && item.season !== selectedSeason)
          return false;
        if (selectedStatus !== "all" && item.status !== selectedStatus)
          return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchBrand = (item.brand || "").toLowerCase().includes(q);
          const matchColor = item.mainColor.name.toLowerCase().includes(q);
          const matchDesc = (item.description || "").toLowerCase().includes(q);
          if (
            !matchName &&
            !matchCat &&
            !matchBrand &&
            !matchColor &&
            !matchDesc
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "most_worn") return b.wearCount - a.wearCount;
        if (sortBy === "least_worn") return a.wearCount - b.wearCount;
        if (sortBy === "price_desc")
          return (b.purchasePrice || 0) - (a.purchasePrice || 0);
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [
    items,
    selectedGroup,
    selectedCategory,
    selectedColor,
    selectedBrand,
    selectedOccasion,
    selectedSeason,
    selectedStatus,
    searchQuery,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGroup("all");
    setSelectedCategory("all");
    setSelectedColor("all");
    setSelectedBrand("all");
    setSelectedOccasion("all");
    setSelectedSeason("all");
    setSelectedStatus("all");
    setSortBy("recent");
  };

  const laundryItems = items.filter(
    (i) => i.status === "laundry" || i.status === "ironing"
  );

  const handleMarkAllLaundryClean = async () => {
    for (const item of laundryItems) {
      await updateItemStatus(item.id, "clean");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
            Wardrobe Inventory &amp; Cataloging
          </span>
          <h1 className="text-[16.5px] font-bold mt-0.5">
            My Wardrobe
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {items.length} total garments •{" "}
            {items.filter((i) => i.status === "clean").length} clean &amp; ready
            to wear
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {laundryItems.length > 0 && (
            <button
              type="button"
              onClick={handleMarkAllLaundryClean}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark {laundryItems.length} in Laundry as Clean
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              openAddModal(selectedGroup !== "all" ? selectedGroup : undefined)
            }
            className="px-4 py-2.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-xs font-semibold inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Clothing Item
          </button>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => {
            setSelectedGroup("all");
            setSelectedCategory("all");
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
            selectedGroup === "all"
              ? "bg-[#0288d1] text-white border-[#0288d1]"
              : "bg-white dark:bg-[#121621] border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-400"
          }`}
        >
          All Garments ({items.length})
        </button>
        {CLOTHING_GROUPS.map((grp) => {
          const count = items.filter((i) => i.categoryGroup === grp.id).length;
          return (
            <button
              key={grp.id}
              type="button"
              onClick={() => {
                setSelectedGroup(grp.id);
                setSelectedCategory("all");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedGroup === grp.id
                  ? "bg-[#0288d1] text-white border-[#0288d1]"
                  : "bg-white dark:bg-[#121621] border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-400"
              }`}
            >
              {grp.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search, Sort & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shirts, trousers, colour, brand, fabric..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-bronze-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium"
          >
            <option value="all">All Categories</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium"
          >
            <option value="recent">Sort: Recently Added</option>
            <option value="most_worn">Sort: Most Worn</option>
            <option value="least_worn">Sort: Least Worn</option>
            <option value="price_desc">Sort: Highest Price</option>
            <option value="name">Sort: A – Z</option>
          </select>

          {/* Toggle Advanced Filters */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((v) => !v)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
              showAdvancedFilters
                ? "bg-[#0288d1] text-white border-[#0288d1]"
                : "border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-xl border border-stone-200 dark:border-stone-800 p-0.5 bg-[#F5F7FB] dark:bg-stone-900">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg ${
                viewMode === "grid"
                  ? "bg-white dark:bg-stone-800 shadow-xs text-stone-900 dark:text-white"
                  : "text-stone-400"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg ${
                viewMode === "list"
                  ? "bg-white dark:bg-stone-800 shadow-xs text-stone-900 dark:text-white"
                  : "text-stone-400"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Colour Swatches Quick Filter Row */}
        {availableColors.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mr-1">
              Colour:
            </span>
            <button
              type="button"
              onClick={() => setSelectedColor("all")}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                selectedColor === "all"
                  ? "bg-[#0288d1] text-white border-[#0288d1]"
                  : "border-stone-200 dark:border-stone-800 text-stone-500"
              }`}
            >
              All
            </button>
            {availableColors.map((col) => (
              <button
                key={col.name}
                type="button"
                onClick={() =>
                  setSelectedColor(
                    selectedColor === col.name ? "all" : col.name
                  )
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${
                  selectedColor === col.name
                    ? "border-stone-900 dark:border-white bg-stone-900/5 dark:bg-white/10 font-semibold"
                    : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-400"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-black/15"
                  style={{ backgroundColor: col.hex }}
                />
                {col.name}
              </button>
            ))}
          </div>
        )}

        {/* Expanded Filters (Brand, Occasion, Season, Availability) */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs"
              >
                <option value="all">All Brands</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-stone-400 mb-1">
                Occasion
              </label>
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs"
              >
                <option value="all">All Occasions</option>
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-stone-400 mb-1">
                Season
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs"
              >
                <option value="all">All Seasons</option>
                {SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-stone-400 mb-1">
                Care Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value as AvailabilityStatus | "all"
                  )
                }
                className="w-full px-3 py-1.5 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs"
              >
                <option value="all">All Statuses</option>
                {(
                  Object.keys(
                    AVAILABILITY_STATUS_CONFIG
                  ) as AvailabilityStatus[]
                ).map((st) => (
                  <option key={st} value={st}>
                    {AVAILABILITY_STATUS_CONFIG[st].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Grid / List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 mx-auto flex items-center justify-center text-stone-400">
            <Shirt className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-semibold">
              {items.length === 0
                ? "Your wardrobe is currently empty"
                : "No clothing items match your current filters"}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {items.length === 0
                ? "Start by uploading your first shirt, trouser, shoe, or perfume to your personal closet."
                : "Try clearing some filters or adding a new garment in this category."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {items.length > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => openAddModal()}
              className="px-5 py-2.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Clothing Item
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <ClothingCard key={item.id} item={item} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <ClothingCard key={item.id} item={item} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WardrobePage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-stone-500">
          Loading wardrobe...
        </div>
      }
    >
      <WardrobeContent />
    </Suspense>
  );
}
