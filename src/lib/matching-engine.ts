import { hexToHsl, inferColorFamily } from "@/lib/color-engine";
import {
  ClothingItem,
  Colour,
  MatchBreakdown,
  Occasion,
  PairOverride,
  RecommendedCombination,
  UserProfile,
  WearHistory,
} from "@/types";

const NEUTRAL_NAMES = new Set([
  "Black",
  "White",
  "Off-White",
  "Cream",
  "Beige",
  "Grey",
  "Charcoal",
  "Navy Blue",
  "Silver",
]);

const EARTH_NAMES = new Set([
  "Tan",
  "Camel",
  "Brown",
  "Olive Green",
  "Forest Green",
  "Sage Green",
  "Rust",
  "Beige",
  "Cream",
]);

/**
 * Curated sartorial colour affinity matrix for classic menswear/unisex styling.
 * Values represent base colour harmony score (out of 100) before HSL nuance & style weighting.
 */
const CLASSIC_COLOR_AFFINITY: Record<string, Record<string, number>> = {
  "Light Blue": {
    Black: 96,
    Beige: 96,
    Cream: 93,
    "Off-White": 92,
    White: 91,
    "Navy Blue": 86,
    Charcoal: 88,
    Grey: 84,
    Tan: 88,
    Camel: 86,
    "Olive Green": 82,
    Brown: 83,
    Maroon: 74,
    Orange: 42,
    Red: 46,
    Yellow: 48,
    Purple: 52,
  },
  "Sky Blue": {
    Black: 94,
    Beige: 95,
    "Navy Blue": 87,
    Charcoal: 88,
    Grey: 84,
    White: 92,
    Cream: 92,
    Tan: 86,
    Orange: 44,
    Red: 45,
  },
  White: {
    Black: 97,
    "Navy Blue": 96,
    Beige: 95,
    Charcoal: 95,
    Grey: 92,
    "Olive Green": 93,
    Tan: 92,
    Camel: 91,
    Brown: 90,
    "Light Blue": 91,
    "Sky Blue": 90,
    Maroon: 88,
    Burgundy: 89,
    "Forest Green": 90,
    White: 74,
  },
  Black: {
    White: 96,
    Grey: 92,
    Charcoal: 91,
    Beige: 92,
    Cream: 93,
    "Light Blue": 95,
    "Olive Green": 89,
    Black: 90,
    Tan: 88,
    Camel: 90,
    Maroon: 86,
    "Navy Blue": 72,
    Brown: 68,
  },
  "Navy Blue": {
    Beige: 96,
    Cream: 95,
    White: 96,
    Grey: 91,
    Charcoal: 86,
    "Light Blue": 87,
    "Sky Blue": 86,
    Tan: 92,
    Camel: 90,
    "Olive Green": 87,
    Maroon: 84,
    Burgundy: 85,
    Pink: 88,
    Black: 72,
    "Navy Blue": 74,
  },
  "Olive Green": {
    Black: 93,
    Beige: 94,
    Cream: 95,
    White: 94,
    "Navy Blue": 89,
    Charcoal: 88,
    Tan: 87,
    Brown: 86,
    "Light Blue": 82,
    Grey: 84,
    Orange: 55,
    Purple: 48,
    Red: 50,
  },
  Maroon: {
    Black: 92,
    Beige: 93,
    Grey: 91,
    Charcoal: 92,
    "Navy Blue": 88,
    White: 90,
    Cream: 92,
    Tan: 85,
    Red: 45,
    Orange: 42,
    Purple: 48,
  },
  Burgundy: {
    Black: 92,
    Beige: 94,
    Grey: 92,
    Charcoal: 93,
    "Navy Blue": 89,
    White: 90,
    Cream: 92,
    Camel: 88,
    Orange: 42,
    Red: 46,
  },
  Beige: {
    "Navy Blue": 96,
    Black: 93,
    White: 95,
    "Olive Green": 94,
    "Light Blue": 95,
    Brown: 91,
    Charcoal: 89,
    Maroon: 91,
    Burgundy: 92,
    "Forest Green": 93,
    Rust: 89,
    Beige: 78,
  },
  Charcoal: {
    White: 96,
    "Light Blue": 91,
    Black: 90,
    Grey: 88,
    "Navy Blue": 85,
    Maroon: 90,
    Burgundy: 91,
    Beige: 88,
    Cream: 91,
    Pink: 87,
    "Olive Green": 86,
  },
  Grey: {
    Black: 93,
    White: 94,
    "Navy Blue": 92,
    "Light Blue": 86,
    Charcoal: 89,
    Maroon: 90,
    Burgundy: 90,
    Pink: 88,
    "Olive Green": 84,
    Beige: 80,
  },
};

function getFormalityLevel(item: ClothingItem): number {
  const cat = item.category.toLowerCase();
  const style = (item.style || "").toLowerCase();

  if (
    cat.includes("formal") ||
    cat.includes("blazer") ||
    style === "formal"
  ) {
    return 5; // Sharp formal
  }
  if (
    cat.includes("chino") ||
    cat.includes("polo") ||
    cat.includes("loafer") ||
    cat.includes("kurta") ||
    cat.includes("traditional") ||
    cat.includes("sweater") ||
    style === "smart casual" ||
    style === "old money / classic"
  ) {
    return 4; // Smart casual
  }
  if (
    cat.includes("casual shirt") ||
    cat.includes("casual trouser") ||
    cat.includes("jeans") ||
    cat.includes("jacket") ||
    cat.includes("boot")
  ) {
    return 3; // Everyday versatile
  }
  if (
    cat.includes("t-shirt") ||
    cat.includes("oversized") ||
    cat.includes("sneaker") ||
    cat.includes("cargo") ||
    cat.includes("sweatshirt")
  ) {
    return 2; // Casual / Streetwear
  }
  if (
    cat.includes("hoodie") ||
    cat.includes("jogger") ||
    cat.includes("short") ||
    cat.includes("sandal") ||
    cat.includes("slipper")
  ) {
    return 1; // Relaxed / Lounge / Athleisure
  }
  return 3;
}

export function evaluateColorHarmony(
  colorA: Colour,
  colorB: Colour
): {
  score: number;
  harmonyType: MatchBreakdown["harmonyType"];
  explanation: string;
} {
  const nameA = colorA.name;
  const nameB = colorB.name;

  // 1. Check direct lookup in classic sartorial affinity table (both directions)
  const direct =
    CLASSIC_COLOR_AFFINITY[nameA]?.[nameB] ??
    CLASSIC_COLOR_AFFINITY[nameB]?.[nameA];

  const hslA = hexToHsl(colorA.hex);
  const hslB = hexToHsl(colorB.hex);
  const famA = colorA.family || inferColorFamily(colorA.hex);
  const famB = colorB.family || inferColorFamily(colorB.hex);

  const isNeutralA = NEUTRAL_NAMES.has(nameA) || famA === "neutral";
  const isNeutralB = NEUTRAL_NAMES.has(nameB) || famB === "neutral";
  const isEarthA = EARTH_NAMES.has(nameA) || famA === "earth";
  const isEarthB = EARTH_NAMES.has(nameB) || famB === "earth";

  const lightnessDiff = Math.abs(hslA.l - hslB.l);
  const rawHueDiff = Math.abs(hslA.h - hslB.h);
  const hueDiff = rawHueDiff > 180 ? 360 - rawHueDiff : rawHueDiff;

  // Handle explicit low-score clashes from lookup (e.g., Light Blue + Bright Orange)
  if (direct !== undefined && direct < 60) {
    return {
      score: direct,
      harmonyType: "Challenging Clash",
      explanation: `${nameA} and ${nameB} compete strongly in saturation and temperature, making the combination visually jarring.`,
    };
  }

  // Handle high-saturation warm vs cool clash when neither is neutral/earth
  if (
    !isNeutralA &&
    !isNeutralB &&
    !isEarthA &&
    !isEarthB &&
    hslA.s > 55 &&
    hslB.s > 60 &&
    hueDiff > 90
  ) {
    const score = direct ?? 48;
    return {
      score,
      harmonyType: "Challenging Clash",
      explanation: `Pairing high-chroma ${nameA} with vibrant ${nameB} creates intense visual tension without a grounding neutral.`,
    };
  }

  // Both Neutrals
  if (isNeutralA && isNeutralB) {
    const base =
      direct ?? (lightnessDiff >= 25 ? 94 : nameA === "Black" && nameB === "Black" ? 90 : 82);
    return {
      score: base,
      harmonyType: "Classic Neutral Anchor",
      explanation:
        lightnessDiff >= 25
          ? `${nameA} and ${nameB} create crisp, effortless neutral contrast with timeless versatility.`
          : `Tonal ${nameA} and ${nameB} deliver a sleek, understated minimalist silhouette.`,
    };
  }

  // One Neutral + One Accent/Earth/Cool/Warm
  if (isNeutralA || isNeutralB) {
    const neutralName = isNeutralA ? nameA : nameB;
    const accentName = isNeutralA ? nameB : nameA;
    const base = direct ?? (lightnessDiff >= 20 ? 92 : 85);
    return {
      score: base,
      harmonyType: "Classic Neutral Anchor",
      explanation: `${neutralName} grounds the ${accentName} piece, allowing its tone to stand out cleanly with balanced sophistication.`,
    };
  }

  // Earth-tone pairing
  if (isEarthA && isEarthB) {
    const base = direct ?? (lightnessDiff >= 18 ? 90 : 80);
    return {
      score: base,
      harmonyType: "Earth & Classic Pairing",
      explanation: `Natural earth tones (${nameA} and ${nameB}) harmonize organically with rich textural warmth.`,
    };
  }

  // Cool + Earth (e.g., Light Blue / Sky Blue / Navy + Tan / Camel / Olive)
  if ((famA === "cool" && isEarthB) || (isEarthA && famB === "cool")) {
    const base = direct ?? 87;
    return {
      score: base,
      harmonyType: "Smart Contrast",
      explanation: `Cool ${famA === "cool" ? nameA : nameB} balances warm earthy ${isEarthA ? nameA : nameB} for a refined, editorial contrast.`,
    };
  }

  // Monochromatic Tonal (same hue family)
  if (hueDiff <= 20) {
    const base = direct ?? (lightnessDiff >= 25 ? 85 : 66);
    return {
      score: base,
      harmonyType: "Monochromatic Tonal",
      explanation:
        lightnessDiff >= 25
          ? `${nameA} and ${nameB} share the same colour family with strong tonal depth.`
          : `${nameA} and ${nameB} are very close in tone; adding a contrasting belt or jacket will help define the silhouette.`,
    };
  }

  // Analogous Harmony
  if (hueDiff > 20 && hueDiff <= 60) {
    const base = direct ?? 79;
    return {
      score: base,
      harmonyType: "Analogous Harmony",
      explanation: `Adjacent hues ${nameA} and ${nameB} transition smoothly across the colour wheel.`,
    };
  }

  // Complementary Contrast (muted/balanced saturation)
  if (hueDiff >= 145 && hueDiff <= 215) {
    const avgSat = (hslA.s + hslB.s) / 2;
    const base = direct ?? (avgSat < 55 ? 83 : 54);
    return {
      score: base,
      harmonyType: avgSat < 55 ? "Complementary Contrast" : "Challenging Clash",
      explanation:
        avgSat < 55
          ? `Muted complementary tones (${nameA} and ${nameB}) offer a confident, balanced contrast.`
          : `${nameA} and ${nameB} sit opposite on the colour wheel with high saturation, which can feel overly bold for everyday wear.`,
    };
  }

  const fallback = direct ?? 72;
  return {
    score: fallback,
    harmonyType: fallback >= 75 ? "Smart Contrast" : "Bold Statement",
    explanation: `${nameA} paired with ${nameB} creates a distinctive contemporary colour story.`,
  };
}

export function scoreTier(
  score: number
): "Excellent" | "Very good" | "Good" | "Less recommended" {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Very good";
  if (score >= 60) return "Good";
  return "Less recommended";
}

/**
 * Evaluates full compatibility between two clothing items (primarily Top + Bottom).
 */
export function evaluatePairCompatibility(
  itemA: ClothingItem,
  itemB: ClothingItem,
  options?: {
    targetOccasion?: Occasion;
    userProfile?: UserProfile | null;
    recentHistory?: WearHistory[];
    overrides?: PairOverride[];
  }
): MatchBreakdown {
  const reasons: string[] = [];

  // 1. Primary colour harmony (weight: 55%)
  const primaryHarmony = evaluateColorHarmony(itemA.mainColor, itemB.mainColor);
  let colorScore = primaryHarmony.score;
  reasons.push(primaryHarmony.explanation);

  // Secondary colour bonus if secondary colour bridges the other item's main colour
  if (
    itemA.secondaryColor &&
    itemA.secondaryColor.name === itemB.mainColor.name
  ) {
    colorScore = Math.min(100, colorScore + 5);
    reasons.push(
      `The ${itemA.secondaryColor.name} accent in ${itemA.name} echoes the ${itemB.mainColor.name} of ${itemB.name}.`
    );
  } else if (
    itemB.secondaryColor &&
    itemB.secondaryColor.name === itemA.mainColor.name
  ) {
    colorScore = Math.min(100, colorScore + 5);
    reasons.push(
      `The ${itemB.secondaryColor.name} detail in ${itemB.name} ties seamlessly into ${itemA.name}.`
    );
  }

  // 2. Formality & Style compatibility (weight: 25%)
  const formA = getFormalityLevel(itemA);
  const formB = getFormalityLevel(itemB);
  const formDiff = Math.abs(formA - formB);

  let styleScore = 92;
  if (formDiff === 0) {
    styleScore = 98;
    reasons.push(
      `Both ${itemA.category.toLowerCase()} and ${itemB.category.toLowerCase()} share a cohesive formality level.`
    );
  } else if (formDiff === 1) {
    styleScore = 90;
    reasons.push(
      `Smart high-low balance between ${itemA.category.toLowerCase()} and ${itemB.category.toLowerCase()}.`
    );
  } else if (formDiff === 2) {
    styleScore = 72;
    reasons.push(
      `Slightly relaxed dress-code contrast between ${itemA.category.toLowerCase()} and ${itemB.category.toLowerCase()}.`
    );
  } else {
    styleScore = 45;
    reasons.push(
      `Noticeable formality mismatch between ${itemA.category.toLowerCase()} and ${itemB.category.toLowerCase()}.`
    );
  }

  // 3. Pattern compatibility (weight: 10%)
  const patA = (itemA.pattern || "Solid").toLowerCase();
  const patB = (itemB.pattern || "Solid").toLowerCase();
  let patternScore = 95;

  if (patA === "solid" && patB === "solid") {
    patternScore = 96;
  } else if (patA === "solid" || patB === "solid") {
    patternScore = 98;
    const patternedItem = patA !== "solid" ? itemA : itemB;
    const solidItem = patA === "solid" ? itemA : itemB;
    reasons.push(
      `Solid ${solidItem.name} balances the ${patternedItem.pattern?.toLowerCase()} texture of ${patternedItem.name}.`
    );
  } else {
    patternScore = 58;
    reasons.push(
      `Combining ${itemA.pattern} and ${itemB.pattern} can compete visually; keep accessories minimal.`
    );
  }

  // 4. Occasion & Season alignment (weight: 10%)
  let occasionScore = 88;
  if (options?.targetOccasion) {
    const hasA = itemA.occasions.includes(options.targetOccasion);
    const hasB = itemB.occasions.includes(options.targetOccasion);
    if (hasA && hasB) {
      occasionScore = 98;
      reasons.push(`Both pieces are tailored for ${options.targetOccasion}.`);
    } else if (hasA || hasB) {
      occasionScore = 82;
    } else {
      occasionScore = 62;
    }
  } else {
    const sharedOccasions = itemA.occasions.filter((o) =>
      itemB.occasions.includes(o)
    );
    if (sharedOccasions.length > 0) {
      occasionScore = 94;
      reasons.push(
        `Versatile for ${sharedOccasions.slice(0, 2).join(" & ")}.`
      );
    }
  }

  // 5. Freshness / Wear History & User Profile adjustments
  let freshnessBonus = 0;
  if (options?.recentHistory && options.recentHistory.length > 0) {
    const last5Days = options.recentHistory.slice(0, 5);
    const wornTogetherRecently = last5Days.some(
      (h) =>
        h.clothingItemIds.includes(itemA.id) &&
        h.clothingItemIds.includes(itemB.id)
    );
    if (wornTogetherRecently) {
      freshnessBonus -= 6;
      reasons.push("Worn together recently — consider rotating for variety.");
    } else if (itemA.wearCount === 0 || itemB.wearCount === 0) {
      freshnessBonus += 2;
    }
  }

  if (options?.userProfile) {
    const favNames = new Set(
      options.userProfile.favoriteColors.map((c) => c.name)
    );
    if (
      favNames.has(itemA.mainColor.name) ||
      favNames.has(itemB.mainColor.name)
    ) {
      freshnessBonus += 2;
    }
  }

  // Calculate weighted score
  let weighted =
    colorScore * 0.58 +
    styleScore * 0.22 +
    patternScore * 0.1 +
    occasionScore * 0.1 +
    freshnessBonus;

  // If primary colour clash (< 55), cap total score below 60 so poor colour matches never masquerade as good
  if (colorScore < 55) {
    weighted = Math.min(54, weighted);
  }
  // If formality mismatch is severe (e.g. Formal shirt + Joggers), cap below 62
  if (styleScore <= 45) {
    weighted = Math.min(58, weighted);
  }

  let totalScore = Math.max(15, Math.min(99, Math.round(weighted)));

  // Check if user has an explicit override or favourite for this pair
  const pairId = [itemA.id, itemB.id].sort().join("_");
  const override = options?.overrides?.find((o) => o.id === pairId);
  let isUserFavorite = false;
  if (override) {
    isUserFavorite = override.isFavorite;
    if (override.customScore !== undefined) {
      totalScore = override.customScore;
    } else if (override.isFavorite && totalScore < 92) {
      totalScore = Math.min(98, totalScore + 8);
    }
  }

  const tier = scoreTier(totalScore);

  const stylistNote =
    totalScore >= 90
      ? `An effortless ${primaryHarmony.harmonyType.toLowerCase()} pairing that looks sharp and intentional.`
      : totalScore >= 75
        ? `A strong, dependable combination with balanced proportion and tone.`
        : totalScore >= 60
          ? `A workable everyday pairing; ground it with clean neutral footwear.`
          : `Less recommended — the tones or formality levels pull in different directions.`;

  return {
    totalScore,
    tier,
    colorScore: Math.round(colorScore),
    styleScore: Math.round(styleScore),
    patternScore: Math.round(patternScore),
    occasionScore: Math.round(occasionScore),
    freshnessBonus,
    harmonyType: primaryHarmony.harmonyType,
    reasons,
    stylistNote,
    isUserFavorite,
  };
}

/**
 * Recommends matching shoes from the user's actual available wardrobe for a Top + Bottom pair.
 */
export function findMatchingFootwear(
  top: ClothingItem,
  bottom: ClothingItem,
  allItems: ClothingItem[],
  includeUnavailable = false
): ClothingItem[] {
  const footwear = allItems.filter(
    (item) =>
      item.categoryGroup === "footwear" &&
      (includeUnavailable || item.status === "clean")
  );

  const pairFormality = (getFormalityLevel(top) + getFormalityLevel(bottom)) / 2;

  return footwear
    .map((shoe) => {
      const shoeFormality = getFormalityLevel(shoe);
      const formDiff = Math.abs(pairFormality - shoeFormality);
      const colorWithBottom = evaluateColorHarmony(
        bottom.mainColor,
        shoe.mainColor
      ).score;
      const colorWithTop = evaluateColorHarmony(
        top.mainColor,
        shoe.mainColor
      ).score;

      // Classic menswear rule: Dark brown/tan loafers & formal shoes love navy/beige/grey/olive; white sneakers love jeans/chinos/casual
      let score =
        colorWithBottom * 0.5 +
        colorWithTop * 0.25 +
        Math.max(0, 100 - formDiff * 22) * 0.25;

      // Penalize black formal shoes with very casual shorts/joggers or brown trousers
      if (
        shoe.mainColor.name === "Brown" &&
        bottom.mainColor.name === "Black" &&
        shoe.category === "Formal shoes"
      ) {
        score -= 15;
      }

      return { shoe, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.shoe);
}

/**
 * Recommends matching accessories (watches, belts, sunglasses, etc.) from the user's wardrobe.
 */
export function findMatchingAccessories(
  top: ClothingItem,
  bottom: ClothingItem,
  selectedShoe: ClothingItem | undefined,
  allItems: ClothingItem[],
  includeUnavailable = false
): ClothingItem[] {
  const accessories = allItems.filter(
    (item) =>
      item.categoryGroup === "accessories" &&
      (includeUnavailable || item.status === "clean")
  );

  const pairFormality = (getFormalityLevel(top) + getFormalityLevel(bottom)) / 2;

  const scored = accessories
    .map((acc) => {
      let score = 80;
      // Match belt leather tone with shoe colour if possible
      if (acc.category === "Belts" && selectedShoe) {
        if (acc.mainColor.name === selectedShoe.mainColor.name) {
          score += 18;
        } else if (
          EARTH_NAMES.has(acc.mainColor.name) &&
          EARTH_NAMES.has(selectedShoe.mainColor.name)
        ) {
          score += 12;
        }
      }
      // Match watch with formality
      if (acc.category === "Watches") {
        score += 14;
      }
      const sharedOccasion = acc.occasions.some(
        (o) => top.occasions.includes(o) || bottom.occasions.includes(o)
      );
      if (sharedOccasion) score += 8;
      if (pairFormality >= 4 && acc.category === "Caps") score -= 25;

      return { acc, score };
    })
    .sort((a, b) => b.score - a.score);

  // Pick at most one per accessory category (e.g., 1 Watch, 1 Belt, 1 Sunglasses/Bag)
  const picked: ClothingItem[] = [];
  const usedCats = new Set<string>();
  for (const { acc } of scored) {
    if (!usedCats.has(acc.category)) {
      usedCats.add(acc.category);
      picked.push(acc);
    }
    if (picked.length >= 3) break;
  }
  return picked;
}

/**
 * Generates ranked outfit combinations for Mode A (Shirt -> Pants) or Mode B (Pants -> Shirts).
 */
export function generateMatcherRecommendations(
  anchorItem: ClothingItem,
  allItems: ClothingItem[],
  options?: {
    includeUnavailable?: boolean;
    targetOccasion?: Occasion;
    userProfile?: UserProfile | null;
    recentHistory?: WearHistory[];
    overrides?: PairOverride[];
  }
): RecommendedCombination[] {
  const includeUnavailable = options?.includeUnavailable ?? false;
  const isAnchorTop =
    anchorItem.categoryGroup === "tops" ||
    anchorItem.categoryGroup === "ethnic";

  const candidatePool = allItems.filter((item) => {
    if (item.id === anchorItem.id) return false;
    if (!includeUnavailable && item.status !== "clean") return false;
    if (isAnchorTop) {
      return item.categoryGroup === "bottoms";
    } else {
      return (
        item.categoryGroup === "tops" || item.categoryGroup === "ethnic"
      );
    }
  });

  const combinations: RecommendedCombination[] = candidatePool.map(
    (candidate) => {
      const top = isAnchorTop ? anchorItem : candidate;
      const bottom = isAnchorTop ? candidate : anchorItem;

      const breakdown = evaluatePairCompatibility(top, bottom, options);
      const recommendedShoes = findMatchingFootwear(
        top,
        bottom,
        allItems,
        includeUnavailable
      );
      const recommendedAccessories = findMatchingAccessories(
        top,
        bottom,
        recommendedShoes[0],
        allItems,
        includeUnavailable
      );

      // Optional layering outerwear if available
      const outerwearCandidates = allItems.filter(
        (i) =>
          i.id !== top.id &&
          (includeUnavailable || i.status === "clean") &&
          (i.category === "Jackets" || i.category === "Blazers")
      );
      let recommendedOuterwear: ClothingItem | undefined;
      if (outerwearCandidates.length > 0) {
        const bestOuter = outerwearCandidates
          .map((ow) => ({
            ow,
            score:
              evaluateColorHarmony(ow.mainColor, top.mainColor).score * 0.5 +
              evaluateColorHarmony(ow.mainColor, bottom.mainColor).score * 0.5,
          }))
          .sort((a, b) => b.score - a.score)[0];
        if (bestOuter && bestOuter.score >= 80) {
          recommendedOuterwear = bestOuter.ow;
        }
      }

      return {
        anchorItem,
        matchedItem: candidate,
        breakdown,
        recommendedShoes,
        recommendedAccessories,
        recommendedOuterwear,
      };
    }
  );

  return combinations.sort(
    (a, b) => b.breakdown.totalScore - a.breakdown.totalScore
  );
}
