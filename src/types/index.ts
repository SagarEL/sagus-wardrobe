export type ClothingGroup =
  | "tops"
  | "bottoms"
  | "ethnic"
  | "footwear"
  | "accessories";

export type AvailabilityStatus =
  | "clean"
  | "laundry"
  | "ironing"
  | "unavailable";

export type Season =
  | "All Season"
  | "Summer"
  | "Winter"
  | "Monsoon"
  | "Spring / Autumn";

export type Occasion =
  | "Formal"
  | "Office"
  | "Casual outing"
  | "College"
  | "Party"
  | "Wedding"
  | "Interview"
  | "Travel"
  | "Daily wear"
  | "Functions"
  | "Meetings";

export type OutfitSlot =
  | "top"
  | "bottom"
  | "outerwear"
  | "footwear"
  | "belt"
  | "watch"
  | "accessory";

export interface Colour {
  name: string;
  hex: string;
  family?: "neutral" | "warm" | "cool" | "earth" | "pastel" | "jewel";
}

export interface ClothingCategory {
  id: string;
  name: string;
  group: ClothingGroup;
  isCustom: boolean;
  createdAt: string;
}

export interface ImageRecord {
  id: string;
  dataUrl: string;
  mimeType: string;
  createdAt: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  categoryGroup: ClothingGroup;
  category: string;
  mainColor: Colour;
  secondaryColor?: Colour;
  imageIds: string[];
  brand?: string;
  size?: string;
  fabric?: string;
  pattern?: string;
  fit?: string;
  style?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  season: Season;
  occasions: Occasion[];
  status: AvailabilityStatus;
  description?: string;
  notes?: string;
  wearCount: number;
  lastWornDate?: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OutfitItem {
  id: string;
  outfitId: string;
  clothingItemId: string;
  slot: OutfitSlot;
}

export interface Outfit {
  id: string;
  name: string;
  description?: string;
  items: OutfitItem[];
  occasions: Occasion[];
  season: Season;
  tags: string[];
  isFavorite: boolean;
  compatibilityScore: number;
  wearCount: number;
  lastWornDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PairOverride {
  id: string; // sorted `${itemA}_${itemB}`
  itemAId: string;
  itemBId: string;
  isFavorite: boolean;
  customScore?: number;
  note?: string;
  updatedAt: string;
}

export interface OutfitSchedule {
  id: string;
  date: string; // YYYY-MM-DD
  outfitId?: string;
  customItemIds?: string[];
  occasion: Occasion;
  notes?: string;
  isCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WearHistory {
  id: string;
  date: string; // YYYY-MM-DD
  outfitId?: string;
  outfitName?: string;
  clothingItemIds: string[];
  occasion: Occasion;
  weatherNote?: string;
  notes?: string;
  rating?: number;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  imageId?: string;
  categoryGroup: ClothingGroup;
  category: string;
  color: Colour;
  brand?: string;
  estimatedPrice?: number;
  productUrl?: string;
  priority: "High" | "Medium" | "Low";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarImageId?: string;
  height?: string;
  preferredSizes?: string;
  shirtSize?: string;
  pantWaistSize?: string;
  shoeSize?: string;
  preferredFit?: string;
  favoriteColors: Colour[];
  dislikedColors: Colour[];
  preferredStyles: string[];
  commonOccasions: Occasion[];
  updatedAt: string;
}

export interface AppSettings {
  id: string;
  theme: "light" | "dark";
  currency: "INR" | "USD" | "EUR" | "GBP" | "AED" | "JPY";
  measurementUnit: "metric" | "imperial";
  shoeSizeSystem: "UK" | "US" | "EU";
  avoidRepeatDays: number;
  includeLaundryInMatcher: boolean;
  updatedAt: string;
}

export interface MatchBreakdown {
  totalScore: number; // 0 to 100
  tier: "Excellent" | "Very good" | "Good" | "Less recommended";
  colorScore: number;
  styleScore: number;
  patternScore: number;
  occasionScore: number;
  freshnessBonus: number;
  harmonyType:
    | "Classic Neutral Anchor"
    | "Complementary Contrast"
    | "Analogous Harmony"
    | "Monochromatic Tonal"
    | "Earth & Classic Pairing"
    | "Smart Contrast"
    | "Bold Statement"
    | "Challenging Clash";
  reasons: string[];
  stylistNote: string;
  isUserFavorite?: boolean;
}

export interface RecommendedCombination {
  anchorItem: ClothingItem;
  matchedItem: ClothingItem;
  breakdown: MatchBreakdown;
  recommendedShoes: ClothingItem[];
  recommendedAccessories: ClothingItem[];
  recommendedOuterwear?: ClothingItem;
}
