import { generateGarmentStudioDataUrl } from "@/lib/sample-wardrobe";
import { ClothingItem } from "@/types";

/**
 * Curated high-resolution editorial & studio menswear and perfume photography
 * for sample wardrobe items, blueprint recommendations, and category defaults.
 */
const ITEM_PHOTO_BY_ID: Record<string, string> = {
  // Sample Wardrobe Items
  "item-shirt-lightblue":
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85",
  "item-shirt-white":
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=85",
  "item-shirt-olive-linen":
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=85",
  "item-shirt-navy-polo":
    "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=85",
  "item-tshirt-black":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",
  "item-shirt-maroon":
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=85",
  "item-blazer-charcoal":
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85",
  "item-kurta-cream":
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
  "item-pant-beige-chino":
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=85",
  "item-pant-black-trouser":
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85",
  "item-pant-navy-trouser":
    "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=85",
  "item-pant-grey-trouser":
    "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=85",
  "item-pant-indigo-jeans":
    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=85",
  "item-shoe-white-sneaker":
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=85",
  "item-shoe-brown-loafer":
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=85",
  "item-shoe-black-oxford":
    "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=85",
  "item-acc-watch-brown":
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=85",
  "item-acc-belt-brown":
    "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=85",

  // Men's Classy Blueprint IDs
  "cap-white-dress-shirt":
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=85",
  "cap-lightblue-oxford":
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85",
  "cap-navy-polo":
    "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=85",
  "cap-olive-linen-shirt":
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=85",
  "cap-camel-sweater":
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=85",
  "cap-charcoal-blazer":
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85",
  "cap-burgundy-evening-shirt":
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=85",
  "cap-ivory-kurta":
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
  "cap-beige-chinos":
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=85",
  "cap-black-trousers":
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85",
  "cap-navy-trousers":
    "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=85",
  "cap-grey-trousers":
    "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=85",
  "cap-dark-indigo-jeans":
    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=85",
  "cap-white-sneakers":
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=85",
  "cap-brown-loafers":
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=85",
  "cap-black-oxfords":
    "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=85",
  "cap-chelsea-boots":
    "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=85",
  "cap-perfume-bleu-fresh":
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=85",
  "cap-perfume-warm-amber":
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85",
  "cap-perfume-vetiver-formal":
    "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=85",
  "cap-perfume-royal-oud":
    "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=85",
  "cap-perfume-summer-neroli":
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
  "cap-leather-watch":
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=85",
  "cap-brown-belt":
    "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=85",
  "cap-sunglasses":
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=85",
};

const CATEGORY_DEFAULT_PHOTOS: Record<string, string> = {
  "formal shirts":
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=85",
  "casual shirts":
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85",
  "polo t-shirts":
    "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=85",
  "t-shirts":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",
  sweaters:
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=85",
  blazers:
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85",
  jackets:
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85",
  kurta:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
  chinos:
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=85",
  "formal trousers":
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85",
  "casual trousers":
    "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=85",
  jeans:
    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=85",
  sneakers:
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=85",
  loafers:
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=85",
  "formal shoes":
    "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=85",
  boots:
    "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=85",
  watches:
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=85",
  belts:
    "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=85",
  perfumes:
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=85",
  sunglasses:
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=85",
};

/**
 * Resolves the best studio photograph for a garment or blueprint item.
 * If the user uploaded a real custom photo (data:image/webp or data:image/jpeg or data:image/png),
 * always prioritize their uploaded photo! If it's a generated SVG placeholder, upgrade to
 * our curated studio photography.
 */
export function resolveGarmentPhotoUrl(
  item: {
    id: string;
    name: string;
    category: string;
    mainColor?: { hex: string; name?: string };
  },
  storedUrl?: string | null
): string {
  // If user uploaded a real raster photo from their device, use it directly
  if (
    storedUrl &&
    !storedUrl.startsWith("data:image/svg") &&
    storedUrl.startsWith("data:image/")
  ) {
    return storedUrl;
  }

  // Check exact ID match (sample items or blueprint items)
  if (ITEM_PHOTO_BY_ID[item.id]) {
    return ITEM_PHOTO_BY_ID[item.id];
  }

  // Check if item ID contains a blueprint ID prefix (e.g. `item_cap-perfume-bleu-fresh_173...`)
  for (const [bpId, photoUrl] of Object.entries(ITEM_PHOTO_BY_ID)) {
    if (item.id.includes(bpId)) {
      return photoUrl;
    }
  }

  // Check by category + colour heuristics
  const catLower = item.category.toLowerCase();
  const nameLower = item.name.toLowerCase();

  if (catLower === "perfumes" || nameLower.includes("edp") || nameLower.includes("parfum")) {
    if (nameLower.includes("amber") || nameLower.includes("cardamom"))
      return ITEM_PHOTO_BY_ID["cap-perfume-warm-amber"];
    if (nameLower.includes("vetiver"))
      return ITEM_PHOTO_BY_ID["cap-perfume-vetiver-formal"];
    if (nameLower.includes("oud"))
      return ITEM_PHOTO_BY_ID["cap-perfume-royal-oud"];
    if (nameLower.includes("neroli") || nameLower.includes("fig"))
      return ITEM_PHOTO_BY_ID["cap-perfume-summer-neroli"];
    return ITEM_PHOTO_BY_ID["cap-perfume-bleu-fresh"];
  }

  if (CATEGORY_DEFAULT_PHOTOS[catLower]) {
    return CATEGORY_DEFAULT_PHOTOS[catLower];
  }

  return (
    storedUrl ||
    generateGarmentStudioDataUrl(
      item.category,
      item.mainColor?.hex || "#1E293B",
      undefined,
      item.name
    )
  );
}
