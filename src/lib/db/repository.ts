import { CURATED_COLOURS, DEFAULT_CATEGORIES } from "@/lib/constants";
import { cloudSync } from "@/lib/db/supabase-sync";
import {
  AppSettings,
  ClothingCategory,
  ClothingItem,
  ImageRecord,
  Outfit,
  OutfitSchedule,
  PairOverride,
  UserProfile,
  WearHistory,
  WishlistItem,
} from "@/types";
import { DBSchema, IDBPDatabase, openDB } from "idb";

const DB_NAME = "closetiq_wardrobe_db";
const DB_VERSION = 1;

interface SagusWardrobeDatabase extends DBSchema {
  clothing_items: {
    key: string;
    value: ClothingItem;
    indexes: { "by-category": string; "by-group": string };
  };
  images: {
    key: string;
    value: ImageRecord;
  };
  custom_categories: {
    key: string;
    value: ClothingCategory;
  };
  outfits: {
    key: string;
    value: Outfit;
  };
  pair_overrides: {
    key: string;
    value: PairOverride;
  };
  outfit_schedules: {
    key: string;
    value: OutfitSchedule;
    indexes: { "by-date": string };
  };
  wear_history: {
    key: string;
    value: WearHistory;
    indexes: { "by-date": string };
  };
  wishlist_items: {
    key: string;
    value: WishlistItem;
  };
  user_profile: {
    key: string;
    value: UserProfile;
  };
  app_settings: {
    key: string;
    value: AppSettings;
  };
}

let dbPromise: Promise<IDBPDatabase<SagusWardrobeDatabase>> | null = null;

function getDb(): Promise<IDBPDatabase<SagusWardrobeDatabase>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is only available in browser"));
  }
  if (!dbPromise) {
    dbPromise = openDB<SagusWardrobeDatabase>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("clothing_items")) {
          const itemStore = db.createObjectStore("clothing_items", {
            keyPath: "id",
          });
          itemStore.createIndex("by-category", "category");
          itemStore.createIndex("by-group", "categoryGroup");
        }
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("custom_categories")) {
          db.createObjectStore("custom_categories", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("outfits")) {
          db.createObjectStore("outfits", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("pair_overrides")) {
          db.createObjectStore("pair_overrides", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("outfit_schedules")) {
          const schedStore = db.createObjectStore("outfit_schedules", {
            keyPath: "id",
          });
          schedStore.createIndex("by-date", "date");
        }
        if (!db.objectStoreNames.contains("wear_history")) {
          const histStore = db.createObjectStore("wear_history", {
            keyPath: "id",
          });
          histStore.createIndex("by-date", "date");
        }
        if (!db.objectStoreNames.contains("wishlist_items")) {
          db.createObjectStore("wishlist_items", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("user_profile")) {
          db.createObjectStore("user_profile", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("app_settings")) {
          db.createObjectStore("app_settings", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export const DEFAULT_PROFILE: UserProfile = {
  id: "default_profile",
  name: "Sagu",
  height: "178 cm",
  preferredSizes: "M / 32",
  shirtSize: "M (40)",
  pantWaistSize: "32",
  shoeSize: "UK 9",
  preferredFit: "Tailored",
  favoriteColors: [
    CURATED_COLOURS.find((c) => c.name === "Navy Blue")!,
    CURATED_COLOURS.find((c) => c.name === "Light Blue")!,
    CURATED_COLOURS.find((c) => c.name === "Beige")!,
    CURATED_COLOURS.find((c) => c.name === "Olive Green")!,
    CURATED_COLOURS.find((c) => c.name === "White")!,
  ],
  dislikedColors: [],
  preferredStyles: ["Smart Casual", "Old Money / Classic", "Minimalist", "Formal"],
  commonOccasions: ["Office", "Casual outing", "Meetings", "College", "Travel"],
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_SETTINGS: AppSettings = {
  id: "default_settings",
  theme: "light",
  currency: "INR",
  measurementUnit: "metric",
  shoeSizeSystem: "UK",
  avoidRepeatDays: 5,
  includeLaundryInMatcher: false,
  updatedAt: new Date().toISOString(),
};

export const wardrobeRepository = {
  // IMAGES (Stored separately from JSON metadata records)
  async saveImage(dataUrl: string, id?: string): Promise<string> {
    const db = await getDb();
    const imageId =
      id || `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const record: ImageRecord = {
      id: imageId,
      dataUrl,
      mimeType: dataUrl.startsWith("data:image/svg")
        ? "image/svg+xml"
        : "image/webp",
      createdAt: new Date().toISOString(),
    };
    await db.put("images", record);

    // Sync to Supabase - await so it is persisted in the cloud before clothing item points to it!
    if (cloudSync.isEnabled()) {
      try {
        await cloudSync.upsertRemoteImage(record);
      } catch (err) {
        console.warn("Supabase image upload error:", err);
      }
    }

    return imageId;
  },

  async getImage(imageId: string): Promise<string | null> {
    const db = await getDb();
    const rec = await db.get("images", imageId);
    if (rec) return rec.dataUrl;

    // If not found in local cache, try fetching from Supabase
    if (cloudSync.isEnabled()) {
      const remoteDataUrl = await cloudSync.fetchRemoteImage(imageId);
      if (remoteDataUrl) {
        // Cache locally for instant next load
        await db.put("images", {
          id: imageId,
          dataUrl: remoteDataUrl,
          mimeType: remoteDataUrl.startsWith("data:image/svg")
            ? "image/svg+xml"
            : "image/webp",
          createdAt: new Date().toISOString(),
        });
        return remoteDataUrl;
      }
    }

    return null;
  },

  async getAllImagesMap(requiredIds?: string[]): Promise<Record<string, string>> {
    const db = await getDb();
    const all = await db.getAll("images");
    const map: Record<string, string> = {};
    for (const img of all) {
      map[img.id] = img.dataUrl;
    }

    if (cloudSync.isEnabled()) {
      try {
        if (requiredIds && requiredIds.length > 0) {
          const missing = requiredIds.filter((id) => !map[id]);
          if (missing.length > 0) {
            const remoteImgs = await cloudSync.fetchRemoteImagesByIds(missing);
            for (const rImg of remoteImgs) {
              map[rImg.id] = rImg.dataUrl;
              await db.put("images", rImg);
            }
          }
        } else {
          // If no specific IDs passed, fetch any remote images that might be missing locally
          const remoteImgs = await cloudSync.fetchAllRemoteImages();
          if (remoteImgs) {
            for (const rImg of remoteImgs) {
              map[rImg.id] = rImg.dataUrl;
              await db.put("images", rImg);
            }
          }
        }
      } catch (err) {
        console.warn("Error syncing images with cloud:", err);
      }
    }

    return map;
  },

  async deleteImage(imageId: string): Promise<void> {
    const db = await getDb();
    await db.delete("images", imageId);
    if (cloudSync.isEnabled()) {
      cloudSync.deleteRemoteImage(imageId).catch(console.warn);
    }
  },

  // CLOTHING ITEMS
  async getAllClothingItems(): Promise<ClothingItem[]> {
    const db = await getDb();

    // If cloud sync is active, try to fetch fresh items from Supabase
    if (cloudSync.isEnabled()) {
      try {
        const remoteItems = await cloudSync.fetchRemoteClothingItems();
        if (remoteItems) {
          // Update local cache
          for (const item of remoteItems) {
            await db.put("clothing_items", item);
          }
          return remoteItems;
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to local storage:", err);
      }
    }

    const items = await db.getAll("clothing_items");
    return items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async saveClothingItem(item: ClothingItem): Promise<ClothingItem> {
    const db = await getDb();
    const updated: ClothingItem = {
      ...item,
      updatedAt: new Date().toISOString(),
    };
    await db.put("clothing_items", updated);

    // Sync to Supabase
    if (cloudSync.isEnabled()) {
      cloudSync.upsertRemoteClothingItem(updated).catch((err) =>
        console.warn("Supabase item save error:", err)
      );
    }

    return updated;
  },

  async deleteClothingItem(id: string): Promise<void> {
    const db = await getDb();
    const existing = await db.get("clothing_items", id);
    if (existing) {
      for (const imgId of existing.imageIds) {
        await db.delete("images", imgId);
        if (cloudSync.isEnabled()) {
          cloudSync.deleteRemoteImage(imgId).catch(console.warn);
        }
      }
    }
    await db.delete("clothing_items", id);

    if (cloudSync.isEnabled()) {
      cloudSync.deleteRemoteClothingItem(id).catch(console.warn);
    }

    // Keep relationships consistent in saved outfits
    const outfits = await db.getAll("outfits");
    for (const outfit of outfits) {
      if (outfit.items.some((oi) => oi.clothingItemId === id)) {
        const filteredItems = outfit.items.filter(
          (oi) => oi.clothingItemId !== id
        );
        const updatedOutfit = {
          ...outfit,
          items: filteredItems,
          updatedAt: new Date().toISOString(),
        };
        await db.put("outfits", updatedOutfit);
        if (cloudSync.isEnabled()) {
          cloudSync.upsertRemoteOutfit(updatedOutfit).catch(console.warn);
        }
      }
    }
  },

  // CATEGORIES
  async getCategories(): Promise<ClothingCategory[]> {
    const db = await getDb();
    const custom = await db.getAll("custom_categories");
    const defaults: ClothingCategory[] = DEFAULT_CATEGORIES.map((c, idx) => ({
      ...c,
      id: `default_cat_${idx}`,
      createdAt: "2026-01-01T00:00:00.000Z",
    }));
    return [...defaults, ...custom];
  },

  async addCustomCategory(category: ClothingCategory): Promise<void> {
    const db = await getDb();
    await db.put("custom_categories", category);
  },

  // OUTFITS
  async getAllOutfits(): Promise<Outfit[]> {
    const db = await getDb();

    if (cloudSync.isEnabled()) {
      try {
        const remoteOutfits = await cloudSync.fetchRemoteOutfits();
        if (remoteOutfits) {
          for (const outfit of remoteOutfits) {
            await db.put("outfits", outfit);
          }
          return remoteOutfits;
        }
      } catch (err) {
        console.warn("Supabase outfit fetch failed:", err);
      }
    }

    const outfits = await db.getAll("outfits");
    return outfits.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async saveOutfit(outfit: Outfit): Promise<Outfit> {
    const db = await getDb();
    const updated = { ...outfit, updatedAt: new Date().toISOString() };
    await db.put("outfits", updated);

    if (cloudSync.isEnabled()) {
      cloudSync.upsertRemoteOutfit(updated).catch(console.warn);
    }

    return updated;
  },

  async deleteOutfit(id: string): Promise<void> {
    const db = await getDb();
    await db.delete("outfits", id);
    if (cloudSync.isEnabled()) {
      cloudSync.deleteRemoteOutfit(id).catch(console.warn);
    }
    const schedules = await db.getAll("outfit_schedules");
    for (const s of schedules) {
      if (s.outfitId === id) {
        await db.delete("outfit_schedules", s.id);
      }
    }
  },

  // PAIR OVERRIDES (Favourites in Matcher)
  async getPairOverrides(): Promise<PairOverride[]> {
    const db = await getDb();
    return db.getAll("pair_overrides");
  },

  async savePairOverride(override: PairOverride): Promise<void> {
    const db = await getDb();
    await db.put("pair_overrides", override);
  },

  // CALENDAR SCHEDULES
  async getSchedules(): Promise<OutfitSchedule[]> {
    const db = await getDb();
    return db.getAll("outfit_schedules");
  },

  async saveSchedule(schedule: OutfitSchedule): Promise<OutfitSchedule> {
    const db = await getDb();
    await db.put("outfit_schedules", schedule);
    return schedule;
  },

  async deleteSchedule(id: string): Promise<void> {
    const db = await getDb();
    await db.delete("outfit_schedules", id);
  },

  // WEAR HISTORY
  async getWearHistory(): Promise<WearHistory[]> {
    const db = await getDb();
    const history = await db.getAll("wear_history");
    return history.sort((a, b) => b.date.localeCompare(a.date));
  },

  async logWearHistory(entry: WearHistory): Promise<WearHistory> {
    const db = await getDb();
    await db.put("wear_history", entry);

    // Increment wearCount and update lastWornDate on each worn clothing item
    for (const itemId of entry.clothingItemIds) {
      const item = await db.get("clothing_items", itemId);
      if (item) {
        const shouldUpdateDate =
          !item.lastWornDate || entry.date >= item.lastWornDate;
        await db.put("clothing_items", {
          ...item,
          wearCount: (item.wearCount || 0) + 1,
          lastWornDate: shouldUpdateDate ? entry.date : item.lastWornDate,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // If linked to a saved outfit, increment its wearCount and lastWornDate too
    if (entry.outfitId) {
      const outfit = await db.get("outfits", entry.outfitId);
      if (outfit) {
        const shouldUpdateDate =
          !outfit.lastWornDate || entry.date >= outfit.lastWornDate;
        await db.put("outfits", {
          ...outfit,
          wearCount: (outfit.wearCount || 0) + 1,
          lastWornDate: shouldUpdateDate ? entry.date : outfit.lastWornDate,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return entry;
  },

  async deleteWearHistory(id: string): Promise<void> {
    const db = await getDb();
    await db.delete("wear_history", id);
  },

  // WISHLIST
  async getWishlist(): Promise<WishlistItem[]> {
    const db = await getDb();
    const list = await db.getAll("wishlist_items");
    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async saveWishlistItem(item: WishlistItem): Promise<WishlistItem> {
    const db = await getDb();
    await db.put("wishlist_items", item);
    return item;
  },

  async deleteWishlistItem(id: string): Promise<void> {
    const db = await getDb();
    const existing = await db.get("wishlist_items", id);
    if (existing?.imageId) {
      await db.delete("images", existing.imageId);
    }
    await db.delete("wishlist_items", id);
  },

  // PROFILE & SETTINGS
  async getUserProfile(): Promise<UserProfile> {
    const db = await getDb();
    const existing = await db.get("user_profile", "default_profile");
    if (existing) {
      if (existing.name === "Aarav") {
        const migrated = { ...existing, name: "Sagu" };
        await db.put("user_profile", migrated);
        return migrated;
      }
      return existing;
    }
    await db.put("user_profile", DEFAULT_PROFILE);
    return DEFAULT_PROFILE;
  },

  async saveUserProfile(profile: UserProfile): Promise<UserProfile> {
    const db = await getDb();
    const updated = {
      ...profile,
      id: "default_profile",
      updatedAt: new Date().toISOString(),
    };
    await db.put("user_profile", updated);
    return updated;
  },

  async getSettings(): Promise<AppSettings> {
    const db = await getDb();
    const existing = await db.get("app_settings", "default_settings");
    if (existing) return existing;
    await db.put("app_settings", DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    const db = await getDb();
    const updated = {
      ...settings,
      id: "default_settings",
      updatedAt: new Date().toISOString(),
    };
    await db.put("app_settings", updated);
    return updated;
  },

  // PURGE LEGACY MOCK DATA ONCE
  async purgeLegacyMockData(): Promise<void> {
    if (typeof window === "undefined") return;
    const PURGE_KEY = "sagus_wardrobe_mock_purged_v2";
    if (window.localStorage.getItem(PURGE_KEY) === "true") return;

    const db = await getDb();
    const allItems = await db.getAll("clothing_items");
    const mockPrefixes = [
      "item-shirt-",
      "item-tshirt-",
      "item-blazer-",
      "item-kurta-",
      "item-pant-",
      "item-shoe-",
      "item-acc-",
      "item_cap-",
    ];

    for (const item of allItems) {
      if (
        mockPrefixes.some((p) => item.id.startsWith(p)) ||
        item.name === "Royal Blue Linen Casual Shirt"
      ) {
        for (const imgId of item.imageIds || []) {
          await db.delete("images", imgId);
        }
        await db.delete("clothing_items", item.id);
      }
    }

    const mockOutfitIds = [
      "outfit-continental-smart",
      "outfit-boardroom-monolith",
      "outfit-mediterranean-linen",
    ];
    for (const oid of mockOutfitIds) {
      await db.delete("outfits", oid);
    }

    const mockSchedIds = ["sched-today", "sched-tomorrow", "sched-weekend"];
    for (const sid of mockSchedIds) {
      await db.delete("outfit_schedules", sid);
    }

    const mockHistIds = ["hist-1", "hist-2", "hist-3", "hist-4"];
    for (const hid of mockHistIds) {
      await db.delete("wear_history", hid);
    }

    const mockWishIds = ["wish-1", "wish-2", "wish-3"];
    for (const wid of mockWishIds) {
      await db.delete("wishlist_items", wid);
      await db.delete("images", `img_${wid}`);
    }

    window.localStorage.setItem(PURGE_KEY, "true");
  },

  // EXPORT & IMPORT BACKUP
  async exportFullBackupJson(): Promise<string> {
    const db = await getDb();
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      clothing_items: await db.getAll("clothing_items"),
      images: await db.getAll("images"),
      custom_categories: await db.getAll("custom_categories"),
      outfits: await db.getAll("outfits"),
      pair_overrides: await db.getAll("pair_overrides"),
      outfit_schedules: await db.getAll("outfit_schedules"),
      wear_history: await db.getAll("wear_history"),
      wishlist_items: await db.getAll("wishlist_items"),
      user_profile: await db.getAll("user_profile"),
      app_settings: await db.getAll("app_settings"),
    };
    return JSON.stringify(payload, null, 2);
  },

  async importFullBackupJson(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    const db = await getDb();

    await this.clearAllData();

    if (Array.isArray(data.images)) {
      for (const rec of data.images) await db.put("images", rec);
    }
    if (Array.isArray(data.clothing_items)) {
      for (const rec of data.clothing_items) await db.put("clothing_items", rec);
    }
    if (Array.isArray(data.custom_categories)) {
      for (const rec of data.custom_categories)
        await db.put("custom_categories", rec);
    }
    if (Array.isArray(data.outfits)) {
      for (const rec of data.outfits) await db.put("outfits", rec);
    }
    if (Array.isArray(data.pair_overrides)) {
      for (const rec of data.pair_overrides)
        await db.put("pair_overrides", rec);
    }
    if (Array.isArray(data.outfit_schedules)) {
      for (const rec of data.outfit_schedules)
        await db.put("outfit_schedules", rec);
    }
    if (Array.isArray(data.wear_history)) {
      for (const rec of data.wear_history) await db.put("wear_history", rec);
    }
    if (Array.isArray(data.wishlist_items)) {
      for (const rec of data.wishlist_items)
        await db.put("wishlist_items", rec);
    }
    if (Array.isArray(data.user_profile)) {
      for (const rec of data.user_profile) await db.put("user_profile", rec);
    }
    if (Array.isArray(data.app_settings)) {
      for (const rec of data.app_settings) await db.put("app_settings", rec);
    }
  },

  async exportWardrobeCsv(): Promise<string> {
    const items = await this.getAllClothingItems();
    const headers = [
      "ID",
      "Name",
      "Group",
      "Category",
      "Main Colour",
      "Main Colour HEX",
      "Secondary Colour",
      "Brand",
      "Size",
      "Fabric",
      "Pattern",
      "Fit",
      "Style",
      "Season",
      "Occasions",
      "Status",
      "Purchase Price",
      "Purchase Date",
      "Wear Count",
      "Last Worn Date",
    ];
    const escapeCsv = (val: unknown) => {
      if (val === undefined || val === null) return "";
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    const rows = items.map((i) =>
      [
        i.id,
        i.name,
        i.categoryGroup,
        i.category,
        i.mainColor.name,
        i.mainColor.hex,
        i.secondaryColor?.name || "",
        i.brand || "",
        i.size || "",
        i.fabric || "",
        i.pattern || "",
        i.fit || "",
        i.style || "",
        i.season,
        i.occasions.join("; "),
        i.status,
        i.purchasePrice ?? "",
        i.purchaseDate || "",
        i.wearCount,
        i.lastWornDate || "",
      ]
        .map(escapeCsv)
        .join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  },

  async clearAllData(): Promise<void> {
    const db = await getDb();
    await db.clear("clothing_items");
    await db.clear("images");
    await db.clear("custom_categories");
    await db.clear("outfits");
    await db.clear("pair_overrides");
    await db.clear("outfit_schedules");
    await db.clear("wear_history");
    await db.clear("wishlist_items");
  },
};
