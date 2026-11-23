import {
  AvailabilityStatus,
  ClothingCategory,
  ClothingGroup,
  Colour,
  Occasion,
  Season,
} from "@/types";

export const CLOTHING_GROUPS: {
  id: ClothingGroup;
  label: string;
  description: string;
}[] = [
  {
    id: "tops",
    label: "Tops & Outerwear",
    description: "Shirts, T-shirts, polos, knitwear, jackets & blazers",
  },
  {
    id: "bottoms",
    label: "Bottoms",
    description: "Trousers, jeans, chinos, cargos, shorts & joggers",
  },
  {
    id: "ethnic",
    label: "Ethnic Wear",
    description: "Kurtas, traditional shirts & festive attire",
  },
  {
    id: "footwear",
    label: "Footwear",
    description: "Sneakers, formal shoes, loafers, boots & sandals",
  },
  {
    id: "accessories",
    label: "Accessories",
    description: "Watches, belts, sunglasses, bags, caps & fragrances",
  },
];

export const DEFAULT_CATEGORIES: Omit<ClothingCategory, "id" | "createdAt">[] = [
  // TOPS
  { name: "T-shirts", group: "tops", isCustom: false },
  { name: "Polo T-shirts", group: "tops", isCustom: false },
  { name: "Formal shirts", group: "tops", isCustom: false },
  { name: "Casual shirts", group: "tops", isCustom: false },
  { name: "Oversized shirts", group: "tops", isCustom: false },
  { name: "Sweatshirts", group: "tops", isCustom: false },
  { name: "Hoodies", group: "tops", isCustom: false },
  { name: "Sweaters", group: "tops", isCustom: false },
  { name: "Jackets", group: "tops", isCustom: false },
  { name: "Blazers", group: "tops", isCustom: false },

  // BOTTOMS
  { name: "Formal trousers", group: "bottoms", isCustom: false },
  { name: "Casual trousers", group: "bottoms", isCustom: false },
  { name: "Jeans", group: "bottoms", isCustom: false },
  { name: "Chinos", group: "bottoms", isCustom: false },
  { name: "Cargo pants", group: "bottoms", isCustom: false },
  { name: "Shorts", group: "bottoms", isCustom: false },
  { name: "Joggers", group: "bottoms", isCustom: false },

  // ETHNIC WEAR
  { name: "Kurta", group: "ethnic", isCustom: false },
  { name: "Traditional shirts", group: "ethnic", isCustom: false },
  { name: "Other ethnic clothing", group: "ethnic", isCustom: false },

  // FOOTWEAR
  { name: "Sneakers", group: "footwear", isCustom: false },
  { name: "Formal shoes", group: "footwear", isCustom: false },
  { name: "Loafers", group: "footwear", isCustom: false },
  { name: "Sandals", group: "footwear", isCustom: false },
  { name: "Slippers", group: "footwear", isCustom: false },
  { name: "Boots", group: "footwear", isCustom: false },

  // ACCESSORIES
  { name: "Watches", group: "accessories", isCustom: false },
  { name: "Belts", group: "accessories", isCustom: false },
  { name: "Sunglasses", group: "accessories", isCustom: false },
  { name: "Wallets", group: "accessories", isCustom: false },
  { name: "Bags", group: "accessories", isCustom: false },
  { name: "Caps", group: "accessories", isCustom: false },
  { name: "Bracelets", group: "accessories", isCustom: false },
  { name: "Perfumes", group: "accessories", isCustom: false },
  { name: "Other accessories", group: "accessories", isCustom: false },
];

export const CURATED_COLOURS: Colour[] = [
  { name: "Black", hex: "#181818", family: "neutral" },
  { name: "White", hex: "#F9F8F6", family: "neutral" },
  { name: "Off-White", hex: "#EFECE6", family: "neutral" },
  { name: "Cream", hex: "#F3EBD8", family: "neutral" },
  { name: "Beige", hex: "#D6C6B2", family: "neutral" },
  { name: "Tan", hex: "#C19A6B", family: "earth" },
  { name: "Camel", hex: "#B68A56", family: "earth" },
  { name: "Brown", hex: "#5C4033", family: "earth" },
  { name: "Grey", hex: "#8E9094", family: "neutral" },
  { name: "Charcoal", hex: "#383A3F", family: "neutral" },
  { name: "Navy Blue", hex: "#1B2A4A", family: "neutral" },
  { name: "Light Blue", hex: "#A8C6DF", family: "cool" },
  { name: "Sky Blue", hex: "#6CA6D9", family: "cool" },
  { name: "Royal Blue", hex: "#2454B5", family: "cool" },
  { name: "Teal", hex: "#1F6E78", family: "cool" },
  { name: "Olive Green", hex: "#556B2F", family: "earth" },
  { name: "Forest Green", hex: "#1E4620", family: "earth" },
  { name: "Sage Green", hex: "#8FA38B", family: "pastel" },
  { name: "Mint Green", hex: "#A3D9C9", family: "pastel" },
  { name: "Maroon", hex: "#631D24", family: "jewel" },
  { name: "Burgundy", hex: "#4E1629", family: "jewel" },
  { name: "Red", hex: "#C92A2A", family: "warm" },
  { name: "Rust", hex: "#A84A2B", family: "earth" },
  { name: "Orange", hex: "#E66820", family: "warm" },
  { name: "Mustard", hex: "#D49B27", family: "warm" },
  { name: "Yellow", hex: "#EBC844", family: "warm" },
  { name: "Pink", hex: "#E598AC", family: "pastel" },
  { name: "Lavender", hex: "#B8A9C9", family: "pastel" },
  { name: "Purple", hex: "#5F3DC4", family: "jewel" },
  { name: "Silver", hex: "#C0C4C8", family: "neutral" },
  { name: "Gold", hex: "#C8A456", family: "warm" },
];

export const FABRICS = [
  "Cotton",
  "Oxford Cotton",
  "Linen",
  "Denim",
  "Chino Twill",
  "Wool",
  "Merino Wool",
  "Silk",
  "Poplin",
  "Flannel",
  "Corduroy",
  "Jersey Knit",
  "Fleece",
  "Leather",
  "Suede",
  "Canvas",
  "Polyester Blend",
  "Khadi / Handloom",
];

export const PATTERNS = [
  "Solid",
  "Striped",
  "Checked / Plaid",
  "Micro-print",
  "Textured / Waffle",
  "Herringbone",
  "Graphic",
  "Floral",
  "Colourblock",
  "Embroidered",
];

export const FITS = [
  "Tailored",
  "Slim Fit",
  "Regular Fit",
  "Relaxed Fit",
  "Oversized",
  "Tapered",
  "Straight",
];

export const STYLES = [
  "Formal",
  "Smart Casual",
  "Casual",
  "Minimalist",
  "Old Money / Classic",
  "Streetwear",
  "Ethnic / Festive",
  "Athleisure",
];

export const SEASONS: Season[] = [
  "All Season",
  "Summer",
  "Winter",
  "Monsoon",
  "Spring / Autumn",
];

export const OCCASIONS: Occasion[] = [
  "Daily wear",
  "Office",
  "Formal",
  "College",
  "Casual outing",
  "Meetings",
  "Interview",
  "Party",
  "Wedding",
  "Functions",
  "Travel",
];

export const AVAILABILITY_STATUS_CONFIG: Record<
  AvailabilityStatus,
  { label: string; shortLabel: string; dotColor: string; badgeClass: string }
> = {
  clean: {
    label: "Clean / Ready to wear",
    shortLabel: "Ready",
    dotColor: "bg-emerald-500",
    badgeClass:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  laundry: {
    label: "In laundry",
    shortLabel: "Laundry",
    dotColor: "bg-amber-500",
    badgeClass:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  ironing: {
    label: "Being ironed",
    shortLabel: "Ironing",
    dotColor: "bg-sky-500",
    badgeClass:
      "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  },
  unavailable: {
    label: "Unavailable",
    shortLabel: "Unavailable",
    dotColor: "bg-rose-500",
    badgeClass:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  },
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
  JPY: "¥",
};

export function formatCurrency(amount?: number, currency: string = "INR"): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "—";
  const symbol = CURRENCY_SYMBOLS[currency] || "₹";
  return `${symbol}${amount.toLocaleString("en-IN")}`;
}
