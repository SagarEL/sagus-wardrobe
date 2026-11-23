"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { processUploadedImageFile } from "@/lib/color-engine";
import {
  CLOTHING_GROUPS,
  CURATED_COLOURS,
  formatCurrency,
} from "@/lib/constants";
import { evaluateColorHarmony } from "@/lib/matching-engine";
import { generateGarmentStudioDataUrl } from "@/lib/sample-wardrobe";
import { ClothingGroup, Colour, WishlistItem } from "@/types";
import {
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";

export default function WishlistPage() {
  const {
    wishlist,
    items,
    categories,
    imagesMap,
    settings,
    saveWishlist,
    deleteWishlist,
    moveWishlistToWardrobe,
  } = useWardrobe();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Form state
  const [name, setName] = useState("");
  const [categoryGroup, setCategoryGroup] = useState<ClothingGroup>("tops");
  const [category, setCategory] = useState("Sweaters");
  const [color, setColor] = useState<Colour>(CURATED_COLOURS[6]); // Camel
  const [brand, setBrand] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("High");
  const [notes, setNotes] = useState("");
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");

  const groupCategories = useMemo(
    () => categories.filter((c) => c.group === categoryGroup),
    [categories, categoryGroup]
  );

  const filteredWishlist = useMemo(() => {
    if (filterPriority === "all") return wishlist;
    return wishlist.filter((w) => w.priority === filterPriority);
  }, [wishlist, filterPriority]);

  const totalEstimatedBudget = useMemo(
    () =>
      filteredWishlist.reduce((sum, w) => sum + (w.estimatedPrice || 0), 0),
    [filteredWishlist]
  );

  // Wardrobe Gap Analysis helper for a Wishlist Item
  const analyzeWardrobeGap = (wish: WishlistItem) => {
    const existingInCategory = items.filter(
      (i) => i.category.toLowerCase() === wish.category.toLowerCase()
    ).length;
    const existingInColor = items.filter(
      (i) => i.mainColor.name.toLowerCase() === wish.color.name.toLowerCase()
    ).length;

    // Count how many existing wardrobe items harmonize well with this wishlist colour
    const compatibleExistingCount = items.filter((i) => {
      if (wish.categoryGroup === "tops" && i.categoryGroup !== "bottoms")
        return false;
      if (wish.categoryGroup === "bottoms" && i.categoryGroup !== "tops")
        return false;
      return evaluateColorHarmony(wish.color, i.mainColor).score >= 80;
    }).length;

    return {
      isMissingCategory: existingInCategory === 0,
      existingInCategory,
      isMissingColor: existingInColor === 0,
      existingInColor,
      compatibleExistingCount,
    };
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const url = await processUploadedImageFile(files[0]);
    setPreviewDataUrl(url);
  };

  const handleCreateWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalImage =
      previewDataUrl ||
      generateGarmentStudioDataUrl(
        category,
        color.hex,
        undefined,
        name.trim()
      );

    const now = new Date().toISOString();
    const newItem: WishlistItem = {
      id: `wish_${Date.now()}`,
      name: name.trim(),
      categoryGroup,
      category,
      color,
      brand: brand.trim() || undefined,
      estimatedPrice: estimatedPrice ? Number(estimatedPrice) : undefined,
      productUrl: productUrl.trim() || undefined,
      priority,
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    await saveWishlist(newItem, finalImage);
    setIsModalOpen(false);
    setName("");
    setBrand("");
    setEstimatedPrice("");
    setProductUrl("");
    setNotes("");
    setPreviewDataUrl("");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
            Intentional Acquisition &amp; Gap Analysis
          </span>
          <h1 className="text-[16.5px] font-bold mt-0.5">
            Wardrobe Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Save garments you intend to purchase and see whether each item fills
            a missing category or colour in your existing wardrobe.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-xs font-semibold inline-flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Wishlist Item
        </button>
      </div>

      {/* Priority Filter & Budget Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial">
        <div className="flex items-center gap-2">
          {["all", "High", "Medium", "Low"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPriority(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterPriority === p
                  ? "bg-[#0288d1] text-white border-[#0288d1]"
                  : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
              }`}
            >
              {p === "all" ? "All Priorities" : `${p} Priority`}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-500">
          Estimated Acquisition Total:{" "}
          <strong className="font-semibold text-stone-900 dark:text-stone-100">
            {formatCurrency(totalEstimatedBudget, settings.currency)}
          </strong>
        </div>
      </div>

      {/* Wishlist Grid */}
      {filteredWishlist.length === 0 ? (
        <div className="p-12 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 text-center space-y-4">
          <Bookmark className="w-10 h-10 text-stone-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-semibold">
              Your wishlist is empty
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Plan future purchases thoughtfully. Sagu's Wardrobe automatically checks
              whether a wishlist item fills a gap in your wardrobe.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Wishlist Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishlist.map((wish) => {
            const imgUrl = wish.imageId ? imagesMap[wish.imageId] : null;
            const gap = analyzeWardrobeGap(wish);

            return (
              <div
                key={wish.id}
                className="rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image & Priority Pill */}
                  <div className="relative aspect-[4/3.4] bg-[#EEF1F7] dark:bg-stone-900 overflow-hidden">
                    {imgUrl && (
                      <img
                        src={imgUrl}
                        alt={wish.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        wish.priority === "High"
                          ? "bg-rose-600 text-white"
                          : wish.priority === "Medium"
                            ? "bg-amber-500 text-white"
                            : "bg-stone-700 text-white"
                      }`}
                    >
                      {wish.priority} Priority
                    </span>
                    {wish.estimatedPrice !== undefined && (
                      <span className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-white/90 dark:bg-stone-900/90 backdrop-blur text-xs font-bold">
                        {formatCurrency(wish.estimatedPrice, settings.currency)}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span className="uppercase tracking-wider text-bronze-600 dark:text-bronze-400 font-semibold">
                          {wish.category}
                        </span>
                        {wish.brand && <span>{wish.brand}</span>}
                      </div>
                      <h3 className="text-lg font-serif font-semibold mt-0.5">
                        {wish.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: wish.color.hex }}
                        />
                        <span>{wish.color.name}</span>
                      </div>
                    </div>

                    {/* Wardrobe Gap Analysis Intelligence Box */}
                    <div className="p-3 rounded-2xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-bronze-600 dark:text-bronze-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Wardrobe Gap Intelligence
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {gap.isMissingCategory ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                            ✓ Fills Missing Category ({wish.category})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[11px]">
                            You own {gap.existingInCategory} in {wish.category}
                          </span>
                        )}

                        {gap.isMissingColor ? (
                          <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300 text-[11px] font-semibold">
                            ✓ Introduces New Colour ({wish.color.name})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[11px]">
                            You own {gap.existingInColor} in {wish.color.name}
                          </span>
                        )}
                      </div>
                      {gap.compatibleExistingCount > 0 && (
                        <p className="text-[11px] text-stone-500">
                          Matches{" "}
                          <strong>{gap.compatibleExistingCount} pieces</strong>{" "}
                          already in your wardrobe.
                        </p>
                      )}
                    </div>

                    {wish.notes && (
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {wish.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => moveWishlistToWardrobe(wish)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Purchased → Move to Wardrobe
                  </button>

                  {wish.productUrl && (
                    <a
                      href={wish.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                      title="Open Product Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteWishlist(wish.id)}
                    className="p-2 rounded-xl border border-rose-500/25 text-rose-500 hover:bg-rose-500/10"
                    title="Delete from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Wishlist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-[18px] bg-[#F5F7FB] dark:bg-[#111520] border border-stone-200 dark:border-stone-800 p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-bronze-600 font-semibold">
                  Future Wardrobe Addition
                </span>
                <h3 className="text-xl font-serif font-semibold flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-bronze-500" />
                  Add to Wishlist
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWishlist} className="space-y-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Camel Cashmere Crewneck Sweater"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Department
                  </label>
                  <select
                    value={categoryGroup}
                    onChange={(e) => {
                      const g = e.target.value as ClothingGroup;
                      setCategoryGroup(g);
                      const firstCat = categories.find((c) => c.group === g);
                      if (firstCat) setCategory(firstCat.name);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                  >
                    {CLOTHING_GROUPS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                  >
                    {groupCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Colour Picker */}
              <div>
                <label className="block text-xs text-stone-500 mb-1.5">
                  Colour ({color.name})
                </label>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  {CURATED_COLOURS.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => setColor(col)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border ${
                        color.name === col.name
                          ? "border-stone-900 dark:border-white font-semibold bg-stone-100 dark:bg-stone-800"
                          : "border-transparent"
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
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Uniqlo"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Est. Price ({settings.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    placeholder="6990"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(
                        e.target.value as "High" | "Medium" | "Low"
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Product URL
                  </label>
                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Photo (Optional)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-xs inline-flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {previewDataUrl ? "Photo Selected ✓" : "Upload Photo"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Why you want it, size to buy..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] text-xs font-semibold"
                >
                  Save to Wishlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
