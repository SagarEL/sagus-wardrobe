"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { AVAILABILITY_STATUS_CONFIG, formatCurrency } from "@/lib/constants";
import { AvailabilityStatus } from "@/types";
import {
  Calendar,
  Edit3,
  Heart,
  Layers,
  Repeat,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export function ClothingDetailModal() {
  const {
    viewingItem,
    closeDetailModal,
    imagesMap,
    getItemImageUrl,
    updateItemStatus,
    toggleItemFavorite,
    openAddModal,
    deleteClothing,
    settings,
  } = useWardrobe();

  const router = useRouter();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!viewingItem) return null;

  const resolvedPrimary = getItemImageUrl(viewingItem);
  const itemImages = (viewingItem.imageIds || [])
    .map((id, i) => (i === 0 && resolvedPrimary ? resolvedPrimary : imagesMap[id]))
    .filter(Boolean);
  const mainImg =
    itemImages[activeImgIdx] || resolvedPrimary || itemImages[0] || null;

  const costPerWear =
    viewingItem.purchasePrice && viewingItem.wearCount > 0
      ? Math.round(viewingItem.purchasePrice / viewingItem.wearCount)
      : viewingItem.purchasePrice;

  const canMatch =
    viewingItem.categoryGroup === "tops" ||
    viewingItem.categoryGroup === "bottoms" ||
    viewingItem.categoryGroup === "ethnic";

  const handleOpenInMatcher = () => {
    const id = viewingItem.id;
    closeDetailModal();
    router.push(`/matcher?itemId=${id}`);
  };

  const handleOpenInBuilder = () => {
    const id = viewingItem.id;
    closeDetailModal();
    router.push(`/builder?itemId=${id}`);
  };

  const handleEdit = () => {
    const item = viewingItem;
    closeDetailModal();
    openAddModal(item.categoryGroup, item);
  };

  const handleDeleteConfirmed = async () => {
    await deleteClothing(viewingItem.id);
    setConfirmDelete(false);
    closeDetailModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#F5F7FB] dark:bg-[#111520] border border-stone-200/80 dark:border-stone-800 shadow-2xl text-stone-900 dark:text-stone-100">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#F5F7FB]/95 dark:bg-[#111520]/95 backdrop-blur border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-bronze-600 dark:text-bronze-400 font-semibold">
              {viewingItem.category}
            </span>
            {viewingItem.brand && (
              <>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="text-xs font-medium text-stone-500">
                  {viewingItem.brand}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleItemFavorite(viewingItem.id)}
              className={`p-2 rounded-full border transition-colors ${
                viewingItem.isFavorite
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                  : "border-stone-200 dark:border-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              }`}
              title="Toggle favourite"
            >
              <Heart
                className={`w-4 h-4 ${
                  viewingItem.isFavorite ? "fill-rose-500" : ""
                }`}
              />
            </button>
            <button
              type="button"
              onClick={closeDetailModal}
              className="p-2 rounded-full hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Garment Photo & Swatches */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-stone-200/70 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center justify-center">
              {mainImg ? (
                <img
                  src={mainImg}
                  alt={viewingItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full border border-black/15"
                  style={{ backgroundColor: viewingItem.mainColor.hex }}
                />
              )}
            </div>

            {itemImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {itemImages.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImgIdx === idx
                        ? "border-stone-900 dark:border-white"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Colour Swatch Card */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2.5">
              <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                Colour Profile
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-6 h-6 rounded-full border border-black/15 shadow-inner"
                    style={{ backgroundColor: viewingItem.mainColor.hex }}
                  />
                  <div>
                    <div className="text-xs font-semibold">
                      {viewingItem.mainColor.name}
                    </div>
                    <div className="text-[10px] font-mono text-stone-400">
                      Main • {viewingItem.mainColor.hex}
                    </div>
                  </div>
                </div>
                {viewingItem.secondaryColor && (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border border-black/15"
                      style={{
                        backgroundColor: viewingItem.secondaryColor.hex,
                      }}
                    />
                    <div>
                      <div className="text-xs font-medium">
                        {viewingItem.secondaryColor.name}
                      </div>
                      <div className="text-[10px] font-mono text-stone-400">
                        2nd • {viewingItem.secondaryColor.hex}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Details, Status, Metrics & Actions */}
          <div className="md:col-span-7 space-y-5">
            <div>
              <h2 className="text-2xl font-serif font-semibold leading-snug">
                {viewingItem.name}
              </h2>
              {viewingItem.description && (
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                  {viewingItem.description}
                </p>
              )}
            </div>

            {/* Direct Availability Status Selector */}
            <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 space-y-2">
              <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                Wardrobe Care Status (Click to change)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(
                  Object.keys(
                    AVAILABILITY_STATUS_CONFIG
                  ) as AvailabilityStatus[]
                ).map((st) => {
                  const cfg = AVAILABILITY_STATUS_CONFIG[st];
                  const isCurrent = viewingItem.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateItemStatus(viewingItem.id, st)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all ${
                        isCurrent
                          ? "bg-[#0288d1] text-white border-[#0288d1] shadow-sm"
                          : "bg-white dark:bg-stone-800 border-stone-200/80 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-400"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${cfg.dotColor}`}
                      />
                      <span className="truncate">{cfg.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wear & Value Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center gap-1 text-[11px] text-stone-400">
                  <Repeat className="w-3.5 h-3.5" />
                  Times Worn
                </div>
                <div className="text-lg font-semibold mt-0.5">
                  {viewingItem.wearCount}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center gap-1 text-[11px] text-stone-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Last Worn
                </div>
                <div className="text-sm font-semibold mt-1 truncate">
                  {viewingItem.lastWornDate || "Never worn"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center gap-1 text-[11px] text-stone-400">
                  <Tag className="w-3.5 h-3.5" />
                  Cost / Wear
                </div>
                <div className="text-sm font-semibold mt-1">
                  {formatCurrency(costPerWear, settings.currency)}
                </div>
              </div>
            </div>

            {/* Specifications Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
              <div>
                <span className="text-stone-400 block">Size</span>
                <span className="font-medium">{viewingItem.size || "—"}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Fabric</span>
                <span className="font-medium">{viewingItem.fabric || "—"}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Pattern</span>
                <span className="font-medium">
                  {viewingItem.pattern || "Solid"}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">Fit</span>
                <span className="font-medium">{viewingItem.fit || "—"}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Style</span>
                <span className="font-medium">{viewingItem.style || "—"}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Season</span>
                <span className="font-medium">{viewingItem.season}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Purchase Price</span>
                <span className="font-medium">
                  {formatCurrency(viewingItem.purchasePrice, settings.currency)}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">Purchase Date</span>
                <span className="font-medium">
                  {viewingItem.purchaseDate || "—"}
                </span>
              </div>
            </div>

            {/* Occasion Pills */}
            {viewingItem.occasions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {viewingItem.occasions.map((occ) => (
                  <span
                    key={occ}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                  >
                    {occ}
                  </span>
                ))}
              </div>
            )}

            {viewingItem.notes && (
              <div className="p-3 rounded-xl bg-bronze-500/10 border border-bronze-500/20 text-xs text-stone-700 dark:text-stone-300">
                <strong className="font-semibold">Stylist / Care Note:</strong>{" "}
                {viewingItem.notes}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              {canMatch && (
                <button
                  type="button"
                  onClick={handleOpenInMatcher}
                  className="flex-1 min-w-[170px] px-4 py-2.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-bronze-400 dark:text-bronze-600" />
                  {viewingItem.categoryGroup === "bottoms"
                    ? "Find Matching Shirts"
                    : "Find Matching Pants"}
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenInBuilder}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <Layers className="w-4 h-4" />
                Build Outfit
              </button>
              <button
                type="button"
                onClick={handleEdit}
                className="px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-medium inline-flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-3.5 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium inline-flex items-center gap-1 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-rose-500/10 px-2.5 py-1.5 rounded-xl border border-rose-500/30">
                  <span className="text-xs text-rose-600 dark:text-rose-300 font-medium">
                    Confirm?
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteConfirmed}
                    className="px-2 py-1 rounded bg-rose-600 text-white text-xs font-semibold"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 rounded bg-stone-200 dark:bg-stone-800 text-xs"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
