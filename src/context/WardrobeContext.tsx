"use client";

import {
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  wardrobeRepository,
} from "@/lib/db/repository";
import { cloudSync } from "@/lib/db/supabase-sync";
import { resolveGarmentPhotoUrl } from "@/lib/garment-photos";
import { generateGarmentStudioDataUrl } from "@/lib/sample-wardrobe";
import {
  AppSettings,
  AvailabilityStatus,
  ClothingCategory,
  ClothingGroup,
  ClothingItem,
  Outfit,
  OutfitSchedule,
  PairOverride,
  UserProfile,
  WearHistory,
  WishlistItem,
} from "@/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info";
}

interface WardrobeContextValue {
  isLoading: boolean;
  items: ClothingItem[];
  imagesMap: Record<string, string>;
  categories: ClothingCategory[];
  outfits: Outfit[];
  pairOverrides: PairOverride[];
  schedules: OutfitSchedule[];
  history: WearHistory[];
  wishlist: WishlistItem[];
  profile: UserProfile;
  settings: AppSettings;
  toasts: ToastMessage[];

  // Global UI Modals
  isAddModalOpen: boolean;
  editingItem: ClothingItem | null;
  defaultAddGroup: ClothingGroup | null;
  viewingItem: ClothingItem | null;

  openAddModal: (defaultGroup?: ClothingGroup, itemToEdit?: ClothingItem) => void;
  closeAddModal: () => void;
  openDetailModal: (item: ClothingItem) => void;
  closeDetailModal: () => void;

  // Data Actions
  refreshAll: () => Promise<void>;
  saveClothingWithImages: (
    itemData: Omit<ClothingItem, "imageIds"> & { imageIds?: string[] },
    newImageDataUrls: string[],
    keptImageIds?: string[]
  ) => Promise<ClothingItem>;
  updateItemStatus: (id: string, status: AvailabilityStatus) => Promise<void>;
  toggleItemFavorite: (id: string) => Promise<void>;
  deleteClothing: (id: string) => Promise<void>;
  addCustomCategory: (name: string, group: ClothingGroup) => Promise<void>;

  saveOutfit: (outfit: Outfit) => Promise<Outfit>;
  deleteOutfit: (id: string) => Promise<void>;
  toggleOutfitFavorite: (id: string) => Promise<void>;

  togglePairFavorite: (itemAId: string, itemBId: string) => Promise<void>;

  saveSchedule: (schedule: OutfitSchedule) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  logWear: (entry: Omit<WearHistory, "id" | "createdAt">) => Promise<void>;
  deleteWearEntry: (id: string) => Promise<void>;

  saveWishlist: (
    item: WishlistItem,
    newImageDataUrl?: string
  ) => Promise<void>;
  deleteWishlist: (id: string) => Promise<void>;
  moveWishlistToWardrobe: (wishItem: WishlistItem) => Promise<void>;

  updateProfile: (
    profile: UserProfile,
    newAvatarDataUrl?: string
  ) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;

  // Auth Actions
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    username: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;

  clearAllData: () => Promise<void>;
  exportJson: () => Promise<string>;
  importJson: (jsonStr: string) => Promise<void>;
  exportCsv: () => Promise<string>;

  getItemImageUrl: (item?: ClothingItem | null) => string | null;
  showToast: (
    title: string,
    description?: string,
    type?: "success" | "error" | "info"
  ) => void;
  dismissToast: (id: string) => void;
}

const WardrobeContext = createContext<WardrobeContextValue | undefined>(
  undefined
);

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [imagesMap, setImagesMap] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<ClothingCategory[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [pairOverrides, setPairOverrides] = useState<PairOverride[]>([]);
  const [schedules, setSchedules] = useState<OutfitSchedule[]>([]);
  const [history, setHistory] = useState<WearHistory[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [defaultAddGroup, setDefaultAddGroup] = useState<ClothingGroup | null>(
    null
  );
  const [viewingItem, setViewingItem] = useState<ClothingItem | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSession = window.localStorage.getItem(
        "sagus_wardrobe_auth_session"
      );
      if (savedSession === "authenticated") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const showToast = useCallback(
    (
      title: string,
      description?: string,
      type: "success" | "error" | "info" = "success"
    ) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      await wardrobeRepository.purgeLegacyMockData();

      const [
        loadedItems,
        loadedImages,
        loadedCategories,
        loadedOutfits,
        loadedOverrides,
        loadedSchedules,
        loadedHistory,
        loadedWishlist,
        loadedProfile,
        loadedSettings,
      ] = await Promise.all([
        wardrobeRepository.getAllClothingItems(),
        wardrobeRepository.getAllImagesMap(),
        wardrobeRepository.getCategories(),
        wardrobeRepository.getAllOutfits(),
        wardrobeRepository.getPairOverrides(),
        wardrobeRepository.getSchedules(),
        wardrobeRepository.getWearHistory(),
        wardrobeRepository.getWishlist(),
        wardrobeRepository.getUserProfile(),
        wardrobeRepository.getSettings(),
      ]);

      // Automatically upgrade any legacy flat SVG silhouettes in IndexedDB to the new 3D-shaded studio renders
      for (const item of loadedItems) {
        const firstImgId = item.imageIds?.[0];
        if (!firstImgId) continue;
        const currentUrl = loadedImages[firstImgId];
        if (
          currentUrl &&
          currentUrl.startsWith("data:image/svg+xml") &&
          (!currentUrl.includes("sideShade") || currentUrl.includes("%26AMP%3B"))
        ) {
          const upgradedUrl = generateGarmentStudioDataUrl(
            item.category,
            item.mainColor.hex,
            item.secondaryColor?.hex,
            item.name
          );
          loadedImages[firstImgId] = upgradedUrl;
          await wardrobeRepository.saveImage(upgradedUrl, firstImgId);
        }
      }

      setItems(loadedItems);
      setImagesMap(loadedImages);
      setCategories(loadedCategories);
      setOutfits(loadedOutfits);
      setPairOverrides(loadedOverrides);
      setSchedules(loadedSchedules);
      setHistory(loadedHistory);
      setWishlist(loadedWishlist);
      setProfile(loadedProfile);
      setSettings(loadedSettings);
    } catch (err) {
      console.error("Failed to load wardrobe from IndexedDB:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();

    // Subscribe to real-time changes across devices (PC <-> Mobile)
    if (cloudSync.isEnabled()) {
      const unsubscribe = cloudSync.subscribeToChanges(() => {
        refreshAll();
      });
      return () => {
        unsubscribe();
      };
    }
  }, [refreshAll]);

  // Sync theme to document root
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (settings.theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [settings.theme]);

  // Keep viewingItem updated if items change
  useEffect(() => {
    if (viewingItem) {
      const updated = items.find((i) => i.id === viewingItem.id);
      setViewingItem(updated || null);
    }
  }, [items, viewingItem]);

  const openAddModal = useCallback(
    (defaultGroup?: ClothingGroup, itemToEdit?: ClothingItem) => {
      setDefaultAddGroup(defaultGroup || null);
      setEditingItem(itemToEdit || null);
      setIsAddModalOpen(true);
    },
    []
  );

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingItem(null);
    setDefaultAddGroup(null);
  }, []);

  const openDetailModal = useCallback((item: ClothingItem) => {
    setViewingItem(item);
  }, []);

  const closeDetailModal = useCallback(() => {
    setViewingItem(null);
  }, []);

  const saveClothingWithImages = useCallback(
    async (
      itemData: Omit<ClothingItem, "imageIds"> & { imageIds?: string[] },
      newImageDataUrls: string[],
      keptImageIds: string[] = []
    ): Promise<ClothingItem> => {
      const savedNewIds: string[] = [];
      for (const dataUrl of newImageDataUrls) {
        const imgId = await wardrobeRepository.saveImage(dataUrl);
        savedNewIds.push(imgId);
      }

      const finalImageIds = [...keptImageIds, ...savedNewIds];
      const fullItem: ClothingItem = {
        ...itemData,
        imageIds: finalImageIds,
      };

      const saved = await wardrobeRepository.saveClothingItem(fullItem);
      await refreshAll();
      showToast(
        editingItem ? "Garment Updated" : "Added to Wardrobe",
        `${saved.name} (${saved.mainColor.name}) saved.`
      );
      return saved;
    },
    [editingItem, refreshAll, showToast]
  );

  const updateItemStatus = useCallback(
    async (id: string, status: AvailabilityStatus) => {
      const target = items.find((i) => i.id === id);
      if (!target) return;
      await wardrobeRepository.saveClothingItem({ ...target, status });
      await refreshAll();
      showToast("Status Updated", `${target.name} marked as ${status}.`, "info");
    },
    [items, refreshAll, showToast]
  );

  const toggleItemFavorite = useCallback(
    async (id: string) => {
      const target = items.find((i) => i.id === id);
      if (!target) return;
      await wardrobeRepository.saveClothingItem({
        ...target,
        isFavorite: !target.isFavorite,
      });
      await refreshAll();
    },
    [items, refreshAll]
  );

  const deleteClothing = useCallback(
    async (id: string) => {
      const target = items.find((i) => i.id === id);
      await wardrobeRepository.deleteClothingItem(id);
      if (viewingItem?.id === id) setViewingItem(null);
      await refreshAll();
      showToast(
        "Item Removed",
        target ? `${target.name} was deleted from your wardrobe.` : "Deleted.",
        "info"
      );
    },
    [items, viewingItem, refreshAll, showToast]
  );

  const addCustomCategory = useCallback(
    async (name: string, group: ClothingGroup) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const newCat: ClothingCategory = {
        id: `custom_cat_${Date.now()}`,
        name: trimmed,
        group,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      await wardrobeRepository.addCustomCategory(newCat);
      await refreshAll();
      showToast("Category Created", `"${trimmed}" added under ${group}.`);
    },
    [refreshAll, showToast]
  );

  const saveOutfit = useCallback(
    async (outfit: Outfit) => {
      const saved = await wardrobeRepository.saveOutfit(outfit);
      await refreshAll();
      showToast("Outfit Saved", `"${outfit.name}" is ready in My Outfits.`);
      return saved;
    },
    [refreshAll, showToast]
  );

  const deleteOutfit = useCallback(
    async (id: string) => {
      await wardrobeRepository.deleteOutfit(id);
      await refreshAll();
      showToast("Outfit Deleted", "Removed from your saved collection.", "info");
    },
    [refreshAll, showToast]
  );

  const toggleOutfitFavorite = useCallback(
    async (id: string) => {
      const target = outfits.find((o) => o.id === id);
      if (!target) return;
      await wardrobeRepository.saveOutfit({
        ...target,
        isFavorite: !target.isFavorite,
      });
      await refreshAll();
    },
    [outfits, refreshAll]
  );

  const togglePairFavorite = useCallback(
    async (itemAId: string, itemBId: string) => {
      const pairId = [itemAId, itemBId].sort().join("_");
      const existing = pairOverrides.find((p) => p.id === pairId);
      const nextFav = existing ? !existing.isFavorite : true;
      await wardrobeRepository.savePairOverride({
        id: pairId,
        itemAId,
        itemBId,
        isFavorite: nextFav,
        updatedAt: new Date().toISOString(),
      });
      await refreshAll();
      showToast(
        nextFav ? "Combination Favourited" : "Removed from Favourites",
        nextFav
          ? "Boosted in Outfit Matcher & Smart Stylist."
          : "Standard compatibility scoring restored.",
        "info"
      );
    },
    [pairOverrides, refreshAll, showToast]
  );

  const saveSchedule = useCallback(
    async (schedule: OutfitSchedule) => {
      await wardrobeRepository.saveSchedule(schedule);
      await refreshAll();
      showToast(
        "Calendar Updated",
        `Scheduled for ${schedule.date} (${schedule.occasion}).`
      );
    },
    [refreshAll, showToast]
  );

  const deleteSchedule = useCallback(
    async (id: string) => {
      await wardrobeRepository.deleteSchedule(id);
      await refreshAll();
      showToast("Schedule Removed", "Calendar slot cleared.", "info");
    },
    [refreshAll, showToast]
  );

  const logWear = useCallback(
    async (entry: Omit<WearHistory, "id" | "createdAt">) => {
      const full: WearHistory = {
        ...entry,
        id: `wear_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      await wardrobeRepository.logWearHistory(full);
      await refreshAll();
      showToast(
        "Logged to Wear History",
        `Recorded for ${entry.date} (${entry.occasion}). Wear counts updated.`
      );
    },
    [refreshAll, showToast]
  );

  const deleteWearEntry = useCallback(
    async (id: string) => {
      await wardrobeRepository.deleteWearHistory(id);
      await refreshAll();
      showToast("History Entry Removed", undefined, "info");
    },
    [refreshAll, showToast]
  );

  const saveWishlist = useCallback(
    async (item: WishlistItem, newImageDataUrl?: string) => {
      let imageId = item.imageId;
      if (newImageDataUrl) {
        imageId = await wardrobeRepository.saveImage(newImageDataUrl);
      }
      await wardrobeRepository.saveWishlistItem({ ...item, imageId });
      await refreshAll();
      showToast("Wishlist Updated", `"${item.name}" saved to your wishlist.`);
    },
    [refreshAll, showToast]
  );

  const deleteWishlist = useCallback(
    async (id: string) => {
      await wardrobeRepository.deleteWishlistItem(id);
      await refreshAll();
      showToast("Removed from Wishlist", undefined, "info");
    },
    [refreshAll, showToast]
  );

  const moveWishlistToWardrobe = useCallback(
    async (wishItem: WishlistItem) => {
      const now = new Date().toISOString();
      const newClothing: ClothingItem = {
        id: `item_${Date.now()}`,
        name: wishItem.name,
        categoryGroup: wishItem.categoryGroup,
        category: wishItem.category,
        mainColor: wishItem.color,
        imageIds: wishItem.imageId ? [wishItem.imageId] : [],
        brand: wishItem.brand,
        purchasePrice: wishItem.estimatedPrice,
        purchaseDate: now.split("T")[0],
        season: "All Season",
        occasions: ["Daily wear", "Casual outing"],
        status: "clean",
        notes: wishItem.notes,
        wearCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      await wardrobeRepository.saveClothingItem(newClothing);
      // Remove wishlist record without deleting its image since wardrobe item now uses it
      await wardrobeRepository.saveWishlistItem({
        ...wishItem,
        imageId: undefined,
      });
      await wardrobeRepository.deleteWishlistItem(wishItem.id);
      await refreshAll();
      showToast(
        "Moved to My Wardrobe!",
        `${wishItem.name} is now in your active wardrobe.`
      );
    },
    [refreshAll, showToast]
  );

  const updateProfile = useCallback(
    async (updatedProfile: UserProfile, newAvatarDataUrl?: string) => {
      let avatarImageId = updatedProfile.avatarImageId;
      if (newAvatarDataUrl) {
        avatarImageId = await wardrobeRepository.saveImage(newAvatarDataUrl);
      }
      await wardrobeRepository.saveUserProfile({
        ...updatedProfile,
        avatarImageId,
      });
      await refreshAll();
      showToast("Profile Saved", "Your personal style profile has been updated.");
    },
    [refreshAll, showToast]
  );

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      const merged: AppSettings = {
        ...settings,
        ...partial,
        updatedAt: new Date().toISOString(),
      };
      await wardrobeRepository.saveSettings(merged);
      setSettings(merged);
      showToast("Settings Updated", "Preferences saved.");
    },
    [settings, showToast]
  );

  const login = useCallback(
    async (usernameInput: string, passwordInput: string): Promise<boolean> => {
      const u = usernameInput.trim().toLowerCase();
      const p = passwordInput.trim();
      if (!u || !p) return false;

      if (typeof window !== "undefined") {
        const rawAccounts = window.localStorage.getItem(
          "sagus_wardrobe_accounts"
        );
        const accounts: Record<string, { password: string; name: string }> =
          rawAccounts
            ? JSON.parse(rawAccounts)
            : {
                sagu: { password: "sagu", name: "Sagu" },
                "sagu@wardrobe.com": { password: "sagu", name: "Sagu" },
              };

        const found = accounts[u];
        if (found && found.password !== p) {
          showToast(
            "Invalid Credentials",
            "Please check your username or password.",
            "error"
          );
          return false;
        }

        // If user logs in with a new username for the first time, register or sign them in
        const displayName =
          found?.name ||
          (u.includes("@")
            ? u.split("@")[0].charAt(0).toUpperCase() + u.split("@")[0].slice(1)
            : usernameInput.trim());

        accounts[u] = { password: p, name: displayName };
        window.localStorage.setItem(
          "sagus_wardrobe_accounts",
          JSON.stringify(accounts)
        );
        window.localStorage.setItem(
          "sagus_wardrobe_auth_session",
          "authenticated"
        );
        setIsAuthenticated(true);

        if (displayName && profile.name !== displayName) {
          await wardrobeRepository.saveUserProfile({
            ...profile,
            name: displayName,
          });
          await refreshAll();
        }
        showToast(
          `Welcome back, ${displayName}!`,
          "Signed in to Sagu's Wardrobe."
        );
        return true;
      }
      return false;
    },
    [profile, refreshAll, showToast]
  );

  const register = useCallback(
    async (
      nameInput: string,
      usernameInput: string,
      passwordInput: string
    ): Promise<boolean> => {
      const u = usernameInput.trim().toLowerCase();
      const p = passwordInput.trim();
      const n = nameInput.trim() || "Sagu";
      if (!u || !p) return false;

      if (typeof window !== "undefined") {
        const rawAccounts = window.localStorage.getItem(
          "sagus_wardrobe_accounts"
        );
        const accounts: Record<string, { password: string; name: string }> =
          rawAccounts ? JSON.parse(rawAccounts) : {};
        accounts[u] = { password: p, name: n };
        window.localStorage.setItem(
          "sagus_wardrobe_accounts",
          JSON.stringify(accounts)
        );
        window.localStorage.setItem(
          "sagus_wardrobe_auth_session",
          "authenticated"
        );
        setIsAuthenticated(true);
        await wardrobeRepository.saveUserProfile({
          ...profile,
          name: n,
        });
        await refreshAll();
        showToast("Account Created", `Welcome to Sagu's Wardrobe, ${n}!`);
        return true;
      }
      return false;
    },
    [profile, refreshAll, showToast]
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("sagus_wardrobe_auth_session");
    }
    setIsAuthenticated(false);
    showToast("Signed Out", "You have logged out of Sagu's Wardrobe.", "info");
  }, [showToast]);

  const clearAllData = useCallback(async () => {
    setIsLoading(true);
    await wardrobeRepository.clearAllData();
    await refreshAll();
    showToast(
      "Wardrobe Reset",
      "All clothing, outfits, and history have been cleared.",
      "info"
    );
  }, [refreshAll, showToast]);

  const exportJson = useCallback(async () => {
    return wardrobeRepository.exportFullBackupJson();
  }, []);

  const importJson = useCallback(
    async (jsonStr: string) => {
      await wardrobeRepository.importFullBackupJson(jsonStr);
      await refreshAll();
      showToast(
        "Backup Restored",
        "Your wardrobe and outfits have been imported."
      );
    },
    [refreshAll, showToast]
  );

  const exportCsv = useCallback(async () => {
    return wardrobeRepository.exportWardrobeCsv();
  }, []);

  const getItemImageUrl = useCallback(
    (item?: ClothingItem | null): string | null => {
      if (!item) return null;
      const firstId = item.imageIds?.[0];
      const storedUrl = firstId ? imagesMap[firstId] : null;
      return resolveGarmentPhotoUrl(item, storedUrl);
    },
    [imagesMap]
  );

  return (
    <WardrobeContext.Provider
      value={{
        isLoading,
        items,
        imagesMap,
        categories,
        outfits,
        pairOverrides,
        schedules,
        history,
        wishlist,
        profile,
        settings,
        toasts,
        isAddModalOpen,
        editingItem,
        defaultAddGroup,
        viewingItem,
        openAddModal,
        closeAddModal,
        openDetailModal,
        closeDetailModal,
        refreshAll,
        saveClothingWithImages,
        updateItemStatus,
        toggleItemFavorite,
        deleteClothing,
        addCustomCategory,
        saveOutfit,
        deleteOutfit,
        toggleOutfitFavorite,
        togglePairFavorite,
        saveSchedule,
        deleteSchedule,
        logWear,
        deleteWearEntry,
        saveWishlist,
        deleteWishlist,
        moveWishlistToWardrobe,
        updateProfile,
        updateSettings,
        isAuthenticated,
        login,
        register,
        logout,
        clearAllData,
        exportJson,
        importJson,
        exportCsv,
        getItemImageUrl,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const ctx = useContext(WardrobeContext);
  if (!ctx) {
    throw new Error("useWardrobe must be used inside a WardrobeProvider");
  }
  return ctx;
}
