"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { AVAILABILITY_STATUS_CONFIG } from "@/lib/constants";
import { generateGarmentStudioDataUrl } from "@/lib/sample-wardrobe";
import { ClothingItem } from "@/types";
import { Heart, Repeat, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface ClothingCardProps {
  item: ClothingItem;
  viewMode?: "grid" | "list";
  onSelect?: (item: ClothingItem) => void;
  showMatchAction?: boolean;
}

export function ClothingCard({
  item,
  viewMode = "grid",
  onSelect,
  showMatchAction = true,
}: ClothingCardProps) {
  const { getItemImageUrl, openDetailModal, toggleItemFavorite } =
    useWardrobe();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const primaryUrl = getItemImageUrl(item);
  const fallbackSvg = generateGarmentStudioDataUrl(
    item.category,
    item.mainColor.hex,
    item.secondaryColor?.hex,
    item.name
  );
  const imgUrl = imgError ? fallbackSvg : primaryUrl || fallbackSvg;

  const statusCfg = AVAILABILITY_STATUS_CONFIG[item.status || "clean"];
  const isClean = (item.status || "clean") === "clean";
  const canMatch =
    item.categoryGroup === "tops" ||
    item.categoryGroup === "bottoms" ||
    item.categoryGroup === "ethnic";

  const handleClick = () => {
    if (onSelect) {
      onSelect(item);
    } else {
      openDetailModal(item);
    }
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={handleClick}
        className="group cursor-pointer flex items-center gap-3 p-3 rounded-[18px] bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800 hover:border-[#0288d1] transition-all duration-fast shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
      >
        <div className="w-16 h-16 rounded-[12px] overflow-hidden bg-[#f5f8ff] dark:bg-slate-900 flex-shrink-0">
          <img
            src={imgUrl}
            alt={item.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-[#0288d1] truncate">
            {item.category}
          </div>
          <h3 className="text-[14.5px] font-bold truncate text-[#090909] dark:text-white">
            {item.name}
          </h3>
          <div className="flex items-center gap-2.5 mt-0.5 text-[13px] text-[#666666]">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border border-black/15"
                style={{ backgroundColor: item.mainColor.hex }}
              />
              {item.mainColor.name}
            </span>
            <span className="inline-flex items-center gap-1">
              <Repeat className="w-3 h-3" /> {item.wearCount}×
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={`px-2 py-0.5 rounded-[10px] text-[11px] font-semibold ${
              isClean
                ? "bg-[#269238] text-white"
                : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
            }`}
          >
            {statusCfg.shortLabel}
          </span>
          {canMatch && showMatchAction && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/matcher?itemId=${item.id}`);
              }}
              className="h-8 px-2.5 rounded-[10px] bg-[#0288d1] text-white text-[12px] font-semibold inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Match</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-[18px] bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800 hover:border-[#0288d1] transition-all duration-fast shadow-[0_2px_4px_rgba(0,0,0,0.12)] p-2.5 flex flex-col justify-between h-full"
    >
      {/* Square Image Container */}
      <div className="relative aspect-square w-full rounded-[12px] bg-[#f5f8ff] dark:bg-slate-900 overflow-hidden mb-2">
        <img
          src={imgUrl}
          alt={item.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />

        {/* Top Left Availability Pill */}
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 rounded-[10px] text-[11px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1)] ${
            isClean
              ? "bg-[#269238] text-white"
              : "bg-amber-500 text-white"
          }`}
        >
          {statusCfg.shortLabel}
        </span>

        {/* Top Right Favourite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleItemFavorite(item.id);
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center text-[#666666] hover:text-rose-500 shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
          aria-label="Favourite item"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              item.isFavorite ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {/* Bottom Right Match Action */}
        {canMatch && showMatchAction && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/matcher?itemId=${item.id}`);
            }}
            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-[10px] bg-[#0288d1] text-white text-[11px] font-semibold inline-flex items-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
          >
            <Sparkles className="w-3 h-3" />
            <span>Match</span>
          </button>
        )}
      </div>

      {/* Aligned Card Body */}
      <div className="px-0.5 space-y-1">
        <div className="text-[12px] font-semibold text-[#0288d1] truncate">
          {item.category}
        </div>
        <h3 className="text-[14px] font-bold text-[#090909] dark:text-white truncate">
          {item.name}
        </h3>

        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[12.5px] text-[#666666] dark:text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-3 h-3 rounded-full border border-black/15 flex-shrink-0"
              style={{ backgroundColor: item.mainColor.hex }}
            />
            <span className="truncate">{item.mainColor.name}</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-[8px] bg-[#f5f8ff] dark:bg-slate-800 text-[11px] font-semibold text-[#090909] dark:text-slate-200 flex-shrink-0">
            {item.wearCount}×
          </span>
        </div>
      </div>
    </div>
  );
}
