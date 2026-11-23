"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import {
  extractColorsFromImage,
  findClosestNamedColor,
  processUploadedImageFile,
} from "@/lib/color-engine";
import {
  AVAILABILITY_STATUS_CONFIG,
  CLOTHING_GROUPS,
  CURATED_COLOURS,
  FABRICS,
  FITS,
  OCCASIONS,
  PATTERNS,
  SEASONS,
  STYLES,
} from "@/lib/constants";
import { generateGarmentStudioDataUrl } from "@/lib/sample-wardrobe";
import {
  AvailabilityStatus,
  ClothingGroup,
  Colour,
  Occasion,
  Season,
} from "@/types";
import {
  Camera,
  Check,
  ImagePlus,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export function AddClothingModal() {
  const {
    isAddModalOpen,
    editingItem,
    defaultAddGroup,
    closeAddModal,
    categories,
    imagesMap,
    saveClothingWithImages,
    addCustomCategory,
    settings,
  } = useWardrobe();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [categoryGroup, setCategoryGroup] = useState<ClothingGroup>("tops");
  const [category, setCategory] = useState("Formal shirts");
  const [mainColor, setMainColor] = useState<Colour>(CURATED_COLOURS[0]);
  const [secondaryColor, setSecondaryColor] = useState<Colour | undefined>(
    undefined
  );
  const [extractedPalette, setExtractedPalette] = useState<Colour[]>([]);
  const [isExtractingColor, setIsExtractingColor] = useState(false);

  const [keptImageIds, setKeptImageIds] = useState<string[]>([]);
  const [newImageDataUrls, setNewImageDataUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [fabric, setFabric] = useState("");
  const [pattern, setPattern] = useState("Solid");
  const [fit, setFit] = useState("Regular Fit");
  const [style, setStyle] = useState("Smart Casual");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [season, setSeason] = useState<Season>("All Season");
  const [occasions, setOccasions] = useState<Occasion[]>(["Daily wear"]);
  const [status, setStatus] = useState<AvailabilityStatus>("clean");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  // Custom Category Input
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Custom Colour Input
  const [customHex, setCustomHex] = useState("#2454B5");
  const [customColorName, setCustomColorName] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAddModalOpen) return;
    setErrorMsg(null);
    setExtractedPalette([]);

    if (editingItem) {
      setName(editingItem.name);
      setCategoryGroup(editingItem.categoryGroup);
      setCategory(editingItem.category);
      setMainColor(editingItem.mainColor);
      setSecondaryColor(editingItem.secondaryColor);
      setKeptImageIds(editingItem.imageIds || []);
      setNewImageDataUrls([]);
      setBrand(editingItem.brand || "");
      setSize(editingItem.size || "");
      setFabric(editingItem.fabric || "");
      setPattern(editingItem.pattern || "Solid");
      setFit(editingItem.fit || "Regular Fit");
      setStyle(editingItem.style || "Smart Casual");
      setPurchaseDate(editingItem.purchaseDate || "");
      setPurchasePrice(
        editingItem.purchasePrice !== undefined
          ? String(editingItem.purchasePrice)
          : ""
      );
      setSeason(editingItem.season || "All Season");
      setOccasions(
        editingItem.occasions.length > 0
          ? editingItem.occasions
          : ["Daily wear"]
      );
      setStatus(editingItem.status || "clean");
      setDescription(editingItem.description || "");
      setNotes(editingItem.notes || "");
    } else {
      const initialGroup = defaultAddGroup || "tops";
      setName("");
      setCategoryGroup(initialGroup);
      const groupCats = categories.filter((c) => c.group === initialGroup);
      setCategory(groupCats[0]?.name || "Formal shirts");
      setMainColor(
        CURATED_COLOURS.find((c) => c.name === "Light Blue") ||
          CURATED_COLOURS[0]
      );
      setSecondaryColor(undefined);
      setKeptImageIds([]);
      setNewImageDataUrls([]);
      setBrand("");
      setSize("");
      setFabric("Cotton");
      setPattern("Solid");
      setFit("Tailored");
      setStyle("Smart Casual");
      setPurchaseDate(new Date().toISOString().split("T")[0]);
      setPurchasePrice("");
      setSeason("All Season");
      setOccasions(["Office", "Casual outing"]);
      setStatus("clean");
      setDescription("");
      setNotes("");
    }
  }, [isAddModalOpen, editingItem, defaultAddGroup, categories]);

  if (!isAddModalOpen) return null;

  const groupCategories = categories.filter((c) => c.group === categoryGroup);

  const handleGroupChange = (newGroup: ClothingGroup) => {
    setCategoryGroup(newGroup);
    const matching = categories.filter((c) => c.group === newGroup);
    if (matching.length > 0) {
      setCategory(matching[0].name);
    }
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setIsExtractingColor(true);

    try {
      const processedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await processUploadedImageFile(file);
        processedUrls.push(dataUrl);
      }

      if (processedUrls.length > 0) {
        setNewImageDataUrls((prev) => [...prev, ...processedUrls]);
        // Run browser-side dominant colour extraction on the first uploaded image
        const extracted = await extractColorsFromImage(processedUrls[0]);
        setMainColor(extracted.mainColor);
        if (extracted.secondaryColor) {
          setSecondaryColor(extracted.secondaryColor);
        }
        setExtractedPalette(extracted.palette);
      }
    } catch {
      setErrorMsg("Could not process the selected image file.");
    } finally {
      setIsExtractingColor(false);
    }
  };

  const handleGenerateStudioPreview = async () => {
    setErrorMsg(null);
    const svgUrl = generateGarmentStudioDataUrl(
      category,
      mainColor.hex,
      secondaryColor?.hex,
      name || `${mainColor.name} ${category}`
    );
    // Replace or add studio preview
    setNewImageDataUrls([svgUrl]);
    const extracted = await extractColorsFromImage(svgUrl);
    setExtractedPalette(extracted.palette);
  };

  const removeKeptImage = (id: string) => {
    setKeptImageIds((prev) => prev.filter((item) => item !== id));
  };

  const removeNewImage = (index: number) => {
    setNewImageDataUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  const toggleOccasion = (occ: Occasion) => {
    setOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const handleAddCustomCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    await addCustomCategory(trimmed, categoryGroup);
    setCategory(trimmed);
    setNewCategoryName("");
    setShowNewCatInput(false);
  };

  const handleApplyCustomHex = (asSecondary = false) => {
    const closest = findClosestNamedColor(customHex);
    const customColour: Colour = {
      name: customColorName.trim() || closest.name,
      hex: customHex.toUpperCase(),
      family: closest.family,
    };
    if (asSecondary) {
      setSecondaryColor(customColour);
    } else {
      setMainColor(customColour);
    }
    setCustomColorName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Please enter a garment name (e.g. Oxford Light Blue Shirt).");
      return;
    }

    const totalImages = keptImageIds.length + newImageDataUrls.length;
    let finalNewUrls = [...newImageDataUrls];

    // If user didn't upload an image, offer automatic studio render so required photograph is always present
    if (totalImages === 0) {
      const autoStudio = generateGarmentStudioDataUrl(
        category,
        mainColor.hex,
        secondaryColor?.hex,
        name.trim()
      );
      finalNewUrls = [autoStudio];
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      await saveClothingWithImages(
        {
          id:
            editingItem?.id ||
            `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: name.trim(),
          categoryGroup,
          category,
          mainColor,
          secondaryColor,
          brand: brand.trim() || undefined,
          size: size.trim() || undefined,
          fabric: fabric.trim() || undefined,
          pattern: pattern || undefined,
          fit: fit || undefined,
          style: style || undefined,
          purchaseDate: purchaseDate || undefined,
          purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
          season,
          occasions: occasions.length > 0 ? occasions : ["Daily wear"],
          status,
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          wearCount: editingItem?.wearCount ?? 0,
          lastWornDate: editingItem?.lastWornDate,
          isFavorite: editingItem?.isFavorite ?? false,
          createdAt: editingItem?.createdAt || now,
          updatedAt: now,
        },
        finalNewUrls,
        keptImageIds
      );
      closeAddModal();
    } catch {
      setErrorMsg("Failed to save clothing item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allPreviewImages: {
    id: string;
    url: string;
    isExisting: boolean;
    newIdx: number;
  }[] = [
    ...keptImageIds
      .map((id) => ({ id, url: imagesMap[id], isExisting: true, newIdx: -1 }))
      .filter((x) => Boolean(x.url)),
    ...newImageDataUrls.map((url, idx) => ({
      id: `new_${idx}`,
      url,
      isExisting: false,
      newIdx: idx,
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#F5F7FB] dark:bg-[#111520] border border-stone-200/80 dark:border-stone-800 shadow-2xl text-stone-900 dark:text-stone-100">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#F5F7FB]/95 dark:bg-[#111520]/95 backdrop-blur border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
              {editingItem ? "Update Garment Record" : "Digital Wardrobe Cataloging"}
            </span>
            <h2 className="text-xl font-serif font-semibold">
              {editingItem ? `Edit ${editingItem.name}` : "Add New Clothing Item"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeAddModal}
            className="p-2 rounded-full hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {/* Top Grid: Photograph & Colour Detection + Core Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Image Upload & Studio Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  1. Garment Photograph *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateStudioPreview}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-bronze-600 dark:text-bronze-400 hover:underline"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Generate Studio Silhouette
                </button>
              </div>

              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFilesSelected(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all p-5 text-center ${
                  isDragging
                    ? "border-bronze-500 bg-bronze-500/10"
                    : "border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-100/60 dark:bg-stone-900/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
                {allPreviewImages.length > 0 ? (
                  <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="relative aspect-square w-full max-w-[230px] mx-auto rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                      <img
                        src={allPreviewImages[0].url}
                        alt="Garment preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Thumbnails */}
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {allPreviewImages.map((img, i) => (
                        <div
                          key={img.id}
                          className="relative w-14 h-14 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700 group"
                        >
                          <img
                            src={img.url}
                            alt={`Thumb ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              img.isExisting
                                ? removeKeptImage(img.id)
                                : removeNewImage(img.newIdx)
                            }
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                            title="Remove photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-14 h-14 rounded-lg border border-dashed border-stone-400 dark:border-stone-600 flex flex-col items-center justify-center text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-[10px]"
                      >
                        <ImagePlus className="w-4 h-4 mb-0.5" />
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 space-y-2.5">
                    <div className="w-12 h-12 rounded-full bg-stone-200/80 dark:bg-stone-800 mx-auto flex items-center justify-center text-stone-600 dark:text-stone-300">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Drag & drop clothing photo, or{" "}
                        <span className="text-bronze-600 dark:text-bronze-400 underline">
                          browse device
                        </span>
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        Auto-detects dominant garment colours in your browser
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Extracted Dominant Colours Banner */}
              {isExtractingColor && (
                <div className="flex items-center gap-2 text-xs text-bronze-600 dark:text-bronze-400 bg-bronze-500/10 px-3 py-2 rounded-xl">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analysing garment pixels for dominant colours...
                </div>
              )}

              {extractedPalette.length > 0 && (
                <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-300">
                    <Sparkles className="w-3.5 h-3.5 text-bronze-500" />
                    Detected from Image (Click to set Main / Secondary):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {extractedPalette.map((col, idx) => (
                      <div
                        key={`${col.hex}_${idx}`}
                        className="inline-flex items-center gap-1.5 bg-white dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-xs"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="font-medium">{col.name}</span>
                        <button
                          type="button"
                          onClick={() => setMainColor(col)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-[#0288d1] text-white"
                        >
                          1st
                        </button>
                        <button
                          type="button"
                          onClick={() => setSecondaryColor(col)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700"
                        >
                          2nd
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Required Identity & Category */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  2. Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Oxford Light Blue Button-Down Shirt"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-bronze-500"
                />
              </div>

              {/* Department / Group */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  3. Department & Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                  {CLOTHING_GROUPS.map((grp) => (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => handleGroupChange(grp.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        categoryGroup === grp.id
                          ? "bg-[#0288d1] text-white border-[#0288d1]"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-400"
                      }`}
                    >
                      {grp.id === "tops"
                        ? "Tops"
                        : grp.id === "bottoms"
                          ? "Bottoms"
                          : grp.id === "ethnic"
                            ? "Ethnic"
                            : grp.id === "footwear"
                              ? "Footwear"
                              : "Accessories"}
                    </button>
                  ))}
                </div>

                {/* Specific Category Selector + Add Custom Category */}
                <div className="flex items-center gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-bronze-500"
                  >
                    {groupCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.isCustom ? "(Custom)" : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput((v) => !v)}
                    className="px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-medium inline-flex items-center gap-1 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Custom
                  </button>
                </div>

                {showNewCatInput && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New category name (e.g. Linen Overshirts)"
                      className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="px-3 py-2 rounded-xl bg-bronze-600 text-white text-xs font-medium"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Availability Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  Availability Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    Object.keys(
                      AVAILABILITY_STATUS_CONFIG
                    ) as AvailabilityStatus[]
                  ).map((st) => {
                    const cfg = AVAILABILITY_STATUS_CONFIG[st];
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(st)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          status === st
                            ? "border-stone-900 dark:border-stone-100 bg-stone-900/5 dark:bg-stone-100/10 font-semibold"
                            : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400"
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
            </div>
          </div>

          {/* Colour Selection Section */}
          <div className="p-5 rounded-2xl bg-stone-100/80 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  4. Garment Colour Profile *
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Select main colour and optional secondary/accent colour
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Selected Main Colour Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs">
                  <span className="text-stone-400">Main:</span>
                  <span
                    className="w-4 h-4 rounded-full border border-black/20"
                    style={{ backgroundColor: mainColor.hex }}
                  />
                  <span className="font-semibold">{mainColor.name}</span>
                  <span className="font-mono text-[10px] text-stone-400">
                    {mainColor.hex}
                  </span>
                </div>

                {/* Selected Secondary Colour Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs">
                  <span className="text-stone-400">2nd:</span>
                  {secondaryColor ? (
                    <>
                      <span
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: secondaryColor.hex }}
                      />
                      <span className="font-semibold">
                        {secondaryColor.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSecondaryColor(undefined)}
                        className="text-stone-400 hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-stone-400 italic">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Swatch Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-11 gap-2">
              {CURATED_COLOURS.map((col) => {
                const isMain = mainColor.name === col.name;
                const isSec = secondaryColor?.name === col.name;
                return (
                  <div
                    key={col.name}
                    className={`group relative flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                      isMain
                        ? "border-stone-900 dark:border-white bg-white dark:bg-stone-800 shadow-sm"
                        : isSec
                          ? "border-bronze-500 bg-white/60 dark:bg-stone-800/60"
                          : "border-transparent hover:bg-white/60 dark:hover:bg-stone-800/40"
                    }`}
                    onClick={() => setMainColor(col)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSecondaryColor(col);
                    }}
                    title={`Click for Main Colour (${col.name}), or click '2nd' button`}
                  >
                    <div
                      className="w-7 h-7 rounded-full border border-black/15 flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: col.hex }}
                    >
                      {isMain && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            col.name === "White" ||
                            col.name === "Cream" ||
                            col.name === "Off-White" ||
                            col.name === "Yellow"
                              ? "text-stone-900"
                              : "text-white"
                          }`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-center leading-tight mt-1 truncate w-full">
                      {col.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSecondaryColor(
                          secondaryColor?.name === col.name ? undefined : col
                        );
                      }}
                      className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 text-[9px] px-1 rounded bg-stone-800 text-white"
                    >
                      2nd
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Custom HEX Picker */}
            <div className="pt-2 border-t border-stone-200/70 dark:border-stone-800 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-500">Custom Colour:</span>
              <input
                type="color"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                placeholder="Optional custom colour name"
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs"
              />
              <button
                type="button"
                onClick={() => handleApplyCustomHex(false)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0288d1] text-white font-medium"
              >
                Set as Main
              </button>
              <button
                type="button"
                onClick={() => handleApplyCustomHex(true)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 font-medium"
              >
                Set as Secondary
              </button>
            </div>
          </div>

          {/* Optional Specifications Grid (Collapsible for simplicity) */}
          <details className="group rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-4">
            <summary className="cursor-pointer list-none flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              <span>+ Optional Details (Brand, Size, Fabric, Occasions, Notes)</span>
              <span className="text-[11px] font-normal text-stone-400 group-open:hidden">
                Click to expand
              </span>
            </summary>
            <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Brand / Label
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Massimo Dutti, Zara"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g. M, 32, UK 9"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Fabric / Material
                </label>
                <select
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm"
                >
                  <option value="">Select fabric...</option>
                  {FABRICS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Pattern
                </label>
                <select
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm"
                >
                  {PATTERNS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1">Fit</label>
                <select
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm"
                >
                  {FITS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Style Aesthetic
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm"
                >
                  {STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Season
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value as Season)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Purchase Price ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="e.g. 3490"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm"
                />
              </div>
            </div>

            {/* Occasions Multi-select */}
            <div>
              <label className="block text-xs text-stone-500 mb-2">
                Suitable Occasions
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((occ) => {
                  const active = occasions.includes(occ);
                  return (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => toggleOccasion(occ)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "bg-[#0288d1] text-white border-[#0288d1]"
                          : "bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400"
                      }`}
                    >
                      {occ}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Purchase Date, Description & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Collar style, weave, or tailoring notes..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Care / Styling Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dry clean only, pairs great with loafers..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm"
                />
              </div>
            </div>
            </div>
          </details>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200/80 dark:border-stone-800">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-sm font-medium inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {editingItem ? "Save Changes" : "Save to My Wardrobe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
