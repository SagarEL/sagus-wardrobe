"use client";

import { ClothingCard } from "@/components/wardrobe/ClothingCard";
import { useWardrobe } from "@/context/WardrobeContext";
import { ClothingItem, OutfitSlot } from "@/types";
import { Link2, Plus, Watch, X } from "lucide-react";
import React, { useMemo, useState } from "react";

const ACCESSORY_TABS = [
  "All",
  "Watches",
  "Belts",
  "Shoes",
  "Sunglasses",
  "Wallets",
  "Bags",
  "Caps",
  "Perfumes",
  "Bracelets",
  "Other accessories",
];

export default function AccessoriesPage() {
  const { items, outfits, openAddModal, saveOutfit } = useWardrobe();

  const [selectedTab, setSelectedTab] = useState("All");
  const [attachingItem, setAttachingItem] = useState<ClothingItem | null>(null);

  const accessoryAndShoeItems = useMemo(() => {
    return items.filter(
      (i) =>
        i.categoryGroup === "accessories" || i.categoryGroup === "footwear"
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedTab === "All") return accessoryAndShoeItems;
    if (selectedTab === "Shoes") {
      return accessoryAndShoeItems.filter(
        (i) => i.categoryGroup === "footwear"
      );
    }
    return accessoryAndShoeItems.filter((i) => i.category === selectedTab);
  }, [accessoryAndShoeItems, selectedTab]);

  const handleAttachToOutfit = async (outfitId: string) => {
    if (!attachingItem) return;
    const outfit = outfits.find((o) => o.id === outfitId);
    if (!outfit) return;

    const alreadyIn = outfit.items.some(
      (oi) => oi.clothingItemId === attachingItem.id
    );
    if (alreadyIn) {
      setAttachingItem(null);
      return;
    }

    const slot: OutfitSlot =
      attachingItem.categoryGroup === "footwear"
        ? "footwear"
        : attachingItem.category === "Watches"
          ? "watch"
          : attachingItem.category === "Belts"
            ? "belt"
            : "accessory";

    const updatedItems = [
      ...outfit.items,
      {
        id: `oi_${Date.now()}`,
        outfitId: outfit.id,
        clothingItemId: attachingItem.id,
        slot,
      },
    ];

    await saveOutfit({
      ...outfit,
      items: updatedItems,
    });
    setAttachingItem(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
            Finishing Touches &amp; Footwear Vault
          </span>
          <h1 className="text-[16.5px] font-bold mt-0.5">
            Accessories &amp; Footwear
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage watches, belts, shoes, sunglasses, wallets, bags, caps, and
            perfumes — and attach them to your saved outfits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => openAddModal("footwear")}
            className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Shoes
          </button>
          <button
            type="button"
            onClick={() => openAddModal("accessories")}
            className="px-4 py-2.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Accessory
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {ACCESSORY_TABS.map((tab) => {
          const isActive = selectedTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                isActive
                  ? "bg-[#0288d1] text-white border-[#0288d1]"
                  : "bg-white dark:bg-[#121621] border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Inventory Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 text-center space-y-4">
          <Watch className="w-10 h-10 text-stone-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-semibold">
              No {selectedTab === "All" ? "accessories" : selectedTab} cataloged
              yet
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Add your watches, leather belts, shoes, sunglasses, bags, or
              signature fragrances to complete your outfits.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openAddModal("accessories")}
            className="px-5 py-2.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Accessory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const linkedOutfits = outfits.filter((o) =>
              o.items.some((oi) => oi.clothingItemId === item.id)
            );

            return (
              <div key={item.id} className="flex flex-col space-y-2">
                <ClothingCard item={item} showMatchAction={false} />
                <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500 truncate">
                    In {linkedOutfits.length}{" "}
                    {linkedOutfits.length === 1 ? "outfit" : "outfits"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachingItem(item)}
                    className="font-semibold text-bronze-600 dark:text-bronze-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Link2 className="w-3 h-3" />
                    Attach to Outfit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attach to Saved Outfit Modal */}
      {attachingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-[18px] bg-[#F5F7FB] dark:bg-[#111520] border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-bronze-600 font-semibold">
                  Link Accessory
                </span>
                <h3 className="text-lg font-serif font-semibold">
                  Attach &quot;{attachingItem.name}&quot; to Outfit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAttachingItem(null)}
                className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {outfits.length === 0 ? (
              <p className="text-xs text-stone-500">
                You don&apos;t have any saved outfits yet. Create one in the
                Outfit Builder first!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {outfits.map((outfit) => {
                  const alreadyAttached = outfit.items.some(
                    (oi) => oi.clothingItemId === attachingItem.id
                  );
                  return (
                    <div
                      key={outfit.id}
                      className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-serif font-semibold">
                          {outfit.name}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {outfit.items.length} pieces
                        </div>
                      </div>
                      {alreadyAttached ? (
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          Attached ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAttachToOutfit(outfit.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] text-xs font-semibold"
                        >
                          Attach
                        </button>
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
