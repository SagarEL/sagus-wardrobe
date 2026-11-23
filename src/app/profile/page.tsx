"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { processUploadedImageFile } from "@/lib/color-engine";
import { CURATED_COLOURS, FITS } from "@/lib/constants";
import { Colour } from "@/types";
import { Check, Save, Upload, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function PersonalProfilePage() {
  const { profile, imagesMap, updateProfile } = useWardrobe();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [preferredSizes, setPreferredSizes] = useState("");
  const [shirtSize, setShirtSize] = useState("");
  const [pantWaistSize, setPantWaistSize] = useState("");
  const [shoeSize, setShoeSize] = useState("");
  const [preferredFit, setPreferredFit] = useState("Tailored");
  const [favoriteColors, setFavoriteColors] = useState<Colour[]>([]);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    setName(profile.name || "");
    setHeight(profile.height || "");
    setPreferredSizes(profile.preferredSizes || "");
    setShirtSize(profile.shirtSize || "");
    setPantWaistSize(profile.pantWaistSize || "");
    setShoeSize(profile.shoeSize || "");
    setPreferredFit(profile.preferredFit || "Tailored");
    setFavoriteColors(profile.favoriteColors || []);
  }, [profile]);

  const currentAvatarUrl =
    newAvatarUrl ||
    (profile.avatarImageId ? imagesMap[profile.avatarImageId] : "/logo.png");

  const handleAvatarUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const dataUrl = await processUploadedImageFile(files[0]);
    setNewAvatarUrl(dataUrl);
  };

  const toggleFavColor = (col: Colour) => {
    setFavoriteColors((prev) =>
      prev.some((c) => c.name === col.name)
        ? prev.filter((c) => c.name !== col.name)
        : [...prev, col]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(
      {
        ...profile,
        name: name.trim() || "My Wardrobe",
        height: height.trim(),
        preferredSizes: preferredSizes.trim(),
        shirtSize: shirtSize.trim(),
        pantWaistSize: pantWaistSize.trim(),
        shoeSize: shoeSize.trim(),
        preferredFit,
        favoriteColors,
        dislikedColors: [],
      },
      newAvatarUrl
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400 font-semibold">
          Sartorial Identity &amp; Measurements
        </span>
        <h1 className="text-[16.5px] font-bold mt-0.5">
          Personal Style Profile
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Your measurements, preferred fits, and colour preferences directly
          personalize Outfit Matcher and Smart Stylist scores.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity & Avatar Card */}
        <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800 border-2 border-bronze-500/40 flex items-center justify-center">
              {currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-stone-400" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAvatarUpload(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 w-full px-3 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold inline-flex items-center justify-center gap-1 hover:bg-stone-200"
            >
              <Upload className="w-3 h-3" />
              Photo
            </button>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1">
                Full Name / Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-500 mb-1">
                Height
              </label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 178 cm / 5'10&quot;"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Measurements & Sizing Card */}
        <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-4">
          <h2 className="text-lg font-serif font-semibold">
            Standard Sizing &amp; Fit Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1">
                Preferred Clothing Sizes
              </label>
              <input
                type="text"
                value={preferredSizes}
                onChange={(e) => setPreferredSizes(e.target.value)}
                placeholder="e.g. M / L"
                className="w-full px-3 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-500 mb-1">
                Shirt Size
              </label>
              <input
                type="text"
                value={shirtSize}
                onChange={(e) => setShirtSize(e.target.value)}
                placeholder="e.g. M (40)"
                className="w-full px-3 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-500 mb-1">
                Pant Waist Size
              </label>
              <input
                type="text"
                value={pantWaistSize}
                onChange={(e) => setPantWaistSize(e.target.value)}
                placeholder="e.g. 32"
                className="w-full px-3 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-500 mb-1">
                Shoe Size
              </label>
              <input
                type="text"
                value={shoeSize}
                onChange={(e) => setShoeSize(e.target.value)}
                placeholder="e.g. UK 9 / EU 43"
                className="w-full px-3 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-500 mb-1">
                Preferred Fit
              </label>
              <select
                value={preferredFit}
                onChange={(e) => setPreferredFit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F5F7FB] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm"
              >
                {FITS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Favourite Colours */}
        <div className="p-6 rounded-[18px] bg-white dark:bg-[#121621] border border-stone-200/80 dark:border-stone-800 shadow-editorial space-y-5">
          <div>
            <h2 className="text-lg font-serif font-semibold">
              Favourite Colours ({favoriteColors.length})
            </h2>
            <p className="text-xs text-stone-500 mb-3">
              Outfits featuring these colours receive a priority boost in your
              recommendations.
            </p>
            <div className="flex flex-wrap gap-2">
              {CURATED_COLOURS.map((col) => {
                const isFav = favoriteColors.some((c) => c.name === col.name);
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => toggleFavColor(col)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                      isFav
                        ? "border-stone-900 dark:border-white bg-[#0288d1] text-white font-semibold"
                        : "border-stone-200 dark:border-stone-800 bg-[#F5F7FB] dark:bg-stone-900 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: col.hex }}
                    />
                    {col.name}
                    {isFav && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-[0_6px_16px_rgba(2,136,209,0.18)] shadow-xs text-sm font-semibold inline-flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Profile Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
