import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { ClothingItem, ImageRecord, Outfit, OutfitSchedule, WearHistory } from "@/types";

// Convert camelCase ClothingItem to snake_case DB row
function toDbClothingItem(item: ClothingItem) {
  return {
    id: item.id,
    name: item.name,
    category_group: item.categoryGroup,
    category: item.category,
    main_color: item.mainColor,
    secondary_color: item.secondaryColor || null,
    image_ids: item.imageIds || [],
    brand: item.brand || null,
    size: item.size || null,
    fabric: item.fabric || null,
    pattern: item.pattern || null,
    fit: item.fit || null,
    style: item.style || null,
    purchase_date: item.purchaseDate || null,
    purchase_price: item.purchasePrice || null,
    season: item.season,
    occasions: item.occasions || [],
    status: item.status,
    description: item.description || null,
    notes: item.notes || null,
    wear_count: item.wearCount || 0,
    last_worn_date: item.lastWornDate || null,
    is_favorite: Boolean(item.isFavorite),
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: item.updatedAt || new Date().toISOString(),
  };
}

// Convert snake_case DB row to camelCase ClothingItem
function fromDbClothingItem(row: any): ClothingItem {
  return {
    id: row.id,
    name: row.name,
    categoryGroup: row.category_group,
    category: row.category,
    mainColor: row.main_color,
    secondaryColor: row.secondary_color || undefined,
    imageIds: row.image_ids || [],
    brand: row.brand || undefined,
    size: row.size || undefined,
    fabric: row.fabric || undefined,
    pattern: row.pattern || undefined,
    fit: row.fit || undefined,
    style: row.style || undefined,
    purchaseDate: row.purchase_date || undefined,
    purchasePrice: row.purchase_price ? Number(row.purchase_price) : undefined,
    season: row.season,
    occasions: row.occasions || [],
    status: row.status,
    description: row.description || undefined,
    notes: row.notes || undefined,
    wearCount: row.wear_count || 0,
    lastWornDate: row.last_worn_date || undefined,
    isFavorite: Boolean(row.is_favorite),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert camelCase Outfit to DB row
function toDbOutfit(outfit: Outfit) {
  return {
    id: outfit.id,
    name: outfit.name,
    description: outfit.description || null,
    items: outfit.items || [],
    occasions: outfit.occasions || [],
    season: outfit.season,
    tags: outfit.tags || [],
    is_favorite: Boolean(outfit.isFavorite),
    compatibility_score: outfit.compatibilityScore || 0,
    wear_count: outfit.wearCount || 0,
    last_worn_date: outfit.lastWornDate || null,
    created_at: outfit.createdAt || new Date().toISOString(),
    updated_at: outfit.updatedAt || new Date().toISOString(),
  };
}

function fromDbOutfit(row: any): Outfit {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    items: row.items || [],
    occasions: row.occasions || [],
    season: row.season,
    tags: row.tags || [],
    isFavorite: Boolean(row.is_favorite),
    compatibilityScore: row.compatibility_score || 0,
    wearCount: row.wear_count || 0,
    lastWornDate: row.last_worn_date || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const cloudSync = {
  isEnabled(): boolean {
    return isSupabaseConfigured();
  },

  // Clothing Items
  async fetchRemoteClothingItems(): Promise<ClothingItem[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("clothing_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching remote clothing items:", error.message);
      return null;
    }
    return (data || []).map(fromDbClothingItem);
  },

  async upsertRemoteClothingItem(item: ClothingItem): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const row = toDbClothingItem(item);
    const { error } = await supabase.from("clothing_items").upsert(row);
    if (error) {
      console.warn("Error upserting clothing item to Supabase:", error.message);
      return false;
    }
    return true;
  },

  async deleteRemoteClothingItem(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from("clothing_items").delete().eq("id", id);
    if (error) {
      console.warn("Error deleting remote clothing item:", error.message);
      return false;
    }
    return true;
  },

  // Images
  async fetchRemoteImage(id: string): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("images")
      .select("data_url")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return data.data_url;
  },

  async upsertRemoteImage(record: ImageRecord): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from("images").upsert({
      id: record.id,
      data_url: record.dataUrl,
      mime_type: record.mimeType,
      created_at: record.createdAt,
    });
    if (error) {
      console.warn("Error upserting remote image:", error.message);
      return false;
    }
    return true;
  },

  async deleteRemoteImage(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from("images").delete().eq("id", id);
    return !error;
  },

  // Outfits
  async fetchRemoteOutfits(): Promise<Outfit[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("outfits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return null;
    return (data || []).map(fromDbOutfit);
  },

  async upsertRemoteOutfit(outfit: Outfit): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const row = toDbOutfit(outfit);
    const { error } = await supabase.from("outfits").upsert(row);
    return !error;
  },

  async deleteRemoteOutfit(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from("outfits").delete().eq("id", id);
    return !error;
  },

  // Subscribe to real-time events across devices
  subscribeToChanges(onChange: () => void): () => void {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const channel = supabase
      .channel("wardrobe_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clothing_items" },
        () => {
          onChange();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "outfits" },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
