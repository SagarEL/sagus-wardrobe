/**
 * Generates a rich, multi-layered studio product illustration SVG DataURL
 * with 3D lighting gradients, realistic garment construction details, and a studio pedestal shadow.
 * Used when the user clicks "Generate Studio Silhouette" while adding their own clothing item.
 */
export function generateGarmentStudioDataUrl(
  category: string,
  mainHex: string,
  secondaryHex?: string,
  label?: string
): string {
  const cat = category.toLowerCase();
  const accent = secondaryHex || mainHex;
  const upperHex = mainHex.toUpperCase();
  const isLight =
    upperHex === "#F9F8F6" ||
    upperHex === "#EFECE6" ||
    upperHex === "#F3EBD8" ||
    upperHex === "#FFFFFF";

  const outlineColor = isLight ? "#CBD5E1" : "rgba(0,0,0,0.32)";
  const seamColor = isLight ? "#94A3B8" : "rgba(255,255,255,0.22)";
  const buttonColor = isLight ? "#64748B" : "#F8FAFC";

  let shapeSvg = "";

  if (
    cat.includes("shirt") &&
    !cat.includes("t-shirt") &&
    !cat.includes("sweat")
  ) {
    shapeSvg = `
      <path d="M185 130 L95 235 L140 280 L205 205 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M415 130 L505 235 L460 280 L395 205 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M95 235 L112 215 L156 260 L140 280 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2"/>
      <path d="M505 235 L488 215 L444 260 L460 280 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2"/>
      <path d="M185 130 L245 105 L355 105 L415 130 L405 475 C340 488 260 488 195 475 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M185 130 L415 130 L405 475 C340 488 260 488 195 475 Z" fill="url(#sideShade)" />
      <path d="M245 105 Q300 128 355 105 Q300 88 245 105 Z" fill="rgba(0,0,0,0.22)" stroke="${outlineColor}" stroke-width="2"/>
      <rect x="291" y="135" width="18" height="346" fill="url(#garmentGrad)" stroke="${seamColor}" stroke-width="1.5"/>
      <path d="M245 105 L268 172 L300 136 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M355 105 L332 172 L300 136 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M332 215 L376 215 L376 262 L354 274 L332 262 Z" fill="url(#garmentGrad)" stroke="${seamColor}" stroke-width="1.8"/>
      <circle cx="300" cy="175" r="3.5" fill="${buttonColor}" />
      <circle cx="300" cy="225" r="3.5" fill="${buttonColor}" />
      <circle cx="300" cy="275" r="3.5" fill="${buttonColor}" />
      <circle cx="300" cy="325" r="3.5" fill="${buttonColor}" />
      <circle cx="300" cy="375" r="3.5" fill="${buttonColor}" />
      <circle cx="300" cy="425" r="3.5" fill="${buttonColor}" />
    `;
  } else if (cat.includes("t-shirt") || cat.includes("polo")) {
    const isPolo = cat.includes("polo");
    shapeSvg = `
      <path d="M188 132 L105 205 L145 255 L202 205 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M412 132 L495 205 L455 255 L398 205 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M188 132 L246 110 C275 132 325 132 354 110 L412 132 L404 470 L196 470 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M188 132 L412 132 L404 470 L196 470 Z" fill="url(#sideShade)" />
      ${
        isPolo
          ? `
        <rect x="292" y="136" width="16" height="92" rx="3" fill="url(#garmentGrad)" stroke="${seamColor}" stroke-width="1.8"/>
        <circle cx="300" cy="162" r="3" fill="${buttonColor}"/>
        <circle cx="300" cy="192" r="3" fill="${buttonColor}"/>
        <path d="M246 110 L272 164 L300 136 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5"/>
        <path d="M354 110 L328 164 L300 136 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5"/>
      `
          : `
        <path d="M242 112 C275 144 325 144 358 112" fill="none" stroke="${seamColor}" stroke-width="6" stroke-linecap="round"/>
      `
      }
    `;
  } else if (
    cat.includes("jacket") ||
    cat.includes("blazer") ||
    cat.includes("hoodie") ||
    cat.includes("sweater") ||
    cat.includes("sweatshirt")
  ) {
    const isBlazer = cat.includes("blazer") || cat.includes("jacket");
    shapeSvg = isBlazer
      ? `
      <path d="M180 125 L110 355 L162 370 L205 215 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5"/>
      <path d="M420 125 L490 355 L438 370 L395 215 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5"/>
      <path d="M180 125 L252 98 L348 98 L420 125 L408 480 L304 480 L300 325 L296 480 L192 480 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M252 98 L300 285 L348 98 Z" fill="#F8FAFC" stroke="${outlineColor}" stroke-width="1.5"/>
      <path d="M252 98 L226 175 L244 185 L234 202 L300 288 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M348 98 L374 175 L356 185 L366 202 L300 288 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="330" y="218" width="44" height="10" rx="2" fill="url(#garmentGrad)" stroke="${seamColor}" stroke-width="1.5"/>
      <rect x="210" y="365" width="62" height="68" rx="8" fill="url(#garmentGrad)" stroke="${seamColor}" stroke-width="1.8"/>
      <rect x="328" y="365" width="62" height="68" rx="8" fill="url(#garmentGrad)" stroke="${seamColor}" stroke-width="1.8"/>
      <circle cx="300" cy="305" r="5" fill="#1E293B" stroke="${seamColor}" stroke-width="1.5"/>
      <circle cx="300" cy="355" r="5" fill="#1E293B" stroke="${seamColor}" stroke-width="1.5"/>
    `
      : `
      <path d="M185 132 L105 335 L155 352 L205 210 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5"/>
      <path d="M415 132 L495 335 L445 352 L395 210 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5"/>
      <path d="M185 132 L248 108 C278 134 322 134 352 108 L415 132 L402 465 L198 465 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5"/>
      <rect x="198" y="440" width="204" height="26" rx="4" fill="url(#garmentGrad)" stroke="${seamColor}" stroke-width="1.8"/>
      <path d="M245 110 C278 140 322 140 355 110" fill="none" stroke="${seamColor}" stroke-width="8" stroke-linecap="round"/>
    `;
  } else if (
    cat.includes("kurta") ||
    cat.includes("ethnic") ||
    cat.includes("traditional")
  ) {
    shapeSvg = `
      <path d="M188 122 L108 310 L155 330 L205 198 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5"/>
      <path d="M412 122 L492 310 L445 330 L395 198 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5"/>
      <path d="M188 122 L254 100 L346 100 L412 122 L408 500 L192 500 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5"/>
      <path d="M254 96 C278 112 322 112 346 96 L346 116 C322 130 278 130 254 116 Z" fill="url(#garmentGrad)" stroke="#D4AF37" stroke-width="2.5"/>
      <rect x="291" y="122" width="18" height="145" rx="4" fill="url(#garmentGrad)" stroke="#D4AF37" stroke-width="2"/>
      <circle cx="300" cy="148" r="3.5" fill="#D4AF37"/>
      <circle cx="300" cy="182" r="3.5" fill="#D4AF37"/>
      <circle cx="300" cy="216" r="3.5" fill="#D4AF37"/>
    `;
  } else if (
    cat.includes("trouser") ||
    cat.includes("jean") ||
    cat.includes("chino") ||
    cat.includes("cargo") ||
    cat.includes("jogger") ||
    cat.includes("short")
  ) {
    const isShort = cat.includes("short");
    const legBottom = isShort ? 345 : 495;
    shapeSvg = `
      <path d="M202 95 L398 95 L416 ${legBottom} L324 ${legBottom} L300 232 L276 ${legBottom} L184 ${legBottom} Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M202 95 L398 95 L416 ${legBottom} L324 ${legBottom} L300 232 L276 ${legBottom} L184 ${legBottom} Z" fill="url(#sideShade)"/>
      <rect x="202" y="95" width="196" height="32" rx="3" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.2"/>
      <rect x="228" y="93" width="8" height="36" rx="2" fill="url(#garmentGrad)" stroke="${seamColor}" stroke-width="1.5"/>
      <rect x="275" y="93" width="8" height="36" rx="2" fill="url(#garmentGrad)" stroke="${seamColor}" stroke-width="1.5"/>
      <rect x="317" y="93" width="8" height="36" rx="2" fill="url(#garmentGrad)" stroke="${seamColor}" stroke-width="1.5"/>
      <rect x="364" y="93" width="8" height="36" rx="2" fill="url(#garmentGrad)" stroke="${seamColor}" stroke-width="1.5"/>
      <circle cx="300" cy="111" r="4.5" fill="${buttonColor}"/>
      <path d="M300 127 L300 205 Q314 205 316 190 L316 127" fill="none" stroke="${seamColor}" stroke-width="2"/>
      <path d="M205 138 Q236 178 252 128" fill="none" stroke="${seamColor}" stroke-width="2.2"/>
      <path d="M395 138 Q364 178 348 128" fill="none" stroke="${seamColor}" stroke-width="2.2"/>
      <line x1="246" y1="155" x2="232" y2="${legBottom - 12}" stroke="${seamColor}" stroke-width="1.5"/>
      <line x1="354" y1="155" x2="368" y2="${legBottom - 12}" stroke="${seamColor}" stroke-width="1.5"/>
    `;
  } else if (
    cat.includes("shoe") ||
    cat.includes("sneaker") ||
    cat.includes("loafer") ||
    cat.includes("boot") ||
    cat.includes("sandal") ||
    cat.includes("slipper")
  ) {
    const isSneaker = cat.includes("sneaker");
    const isBoot = cat.includes("boot");
    const soleColor = isSneaker ? "#F8FAFC" : "#1E1915";
    const weltColor = isSneaker ? "#E2E8F0" : "#78350F";
    shapeSvg = isBoot
      ? `
      <path d="M165 165 L285 165 L302 275 C365 295 445 305 478 348 C486 360 485 382 475 388 L140 388 C132 350 155 245 165 165 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M198 168 L254 168 L254 275 C235 288 210 288 198 275 Z" fill="#1E293B" opacity="0.75"/>
      <rect x="132" y="384" width="352" height="18" rx="6" fill="${weltColor}"/>
      <path d="M132 398 L225 398 L225 416 L132 416 Z" fill="${soleColor}"/>
    `
      : `
      <path d="M128 355 C124 285 165 245 215 242 C240 272 275 274 295 248 L365 288 C418 296 468 312 482 348 C488 362 486 378 478 384 L128 384 Z" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M275 262 L352 298" stroke="${seamColor}" stroke-width="5" stroke-linecap="round"/>
      <rect x="120" y="378" width="368" height="24" rx="10" fill="${soleColor}" stroke="${weltColor}" stroke-width="2.5"/>
      <line x1="130" y1="390" x2="478" y2="390" stroke="${weltColor}" stroke-width="1.5"/>
    `;
  } else if (cat.includes("watch")) {
    shapeSvg = `
      <rect x="260" y="88" width="80" height="424" rx="16" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="2.5"/>
      <line x1="270" y1="105" x2="270" y2="495" stroke="${seamColor}" stroke-width="1.5" stroke-dasharray="5,5"/>
      <line x1="330" y1="105" x2="330" y2="495" stroke="${seamColor}" stroke-width="1.5" stroke-dasharray="5,5"/>
      <rect x="386" y="286" width="14" height="28" rx="3" fill="#D4AF37"/>
      <circle cx="300" cy="300" r="92" fill="#D4AF37" stroke="#B45309" stroke-width="3"/>
      <circle cx="300" cy="300" r="78" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
      <line x1="300" y1="230" x2="300" y2="242" stroke="#D4AF37" stroke-width="3"/>
      <line x1="300" y1="358" x2="300" y2="370" stroke="#D4AF37" stroke-width="3"/>
      <line x1="230" y1="300" x2="242" y2="300" stroke="#D4AF37" stroke-width="3"/>
      <line x1="358" y1="300" x2="370" y2="300" stroke="#D4AF37" stroke-width="3"/>
      <line x1="300" y1="300" x2="272" y2="262" stroke="#F8FAFC" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="300" y1="300" x2="346" y2="282" stroke="#F8FAFC" stroke-width="3" stroke-linecap="round"/>
      <circle cx="300" cy="300" r="5" fill="#D4AF37"/>
    `;
  } else if (cat.includes("belt")) {
    shapeSvg = `
      <ellipse cx="300" cy="320" rx="145" ry="105" fill="none" stroke="url(#garmentGrad)" stroke-width="44" />
      <ellipse cx="300" cy="320" rx="145" ry="105" fill="none" stroke="${outlineColor}" stroke-width="2" />
      <rect x="248" y="186" width="104" height="62" rx="12" fill="none" stroke="#D4AF37" stroke-width="11" />
      <line x1="300" y1="186" x2="300" y2="222" stroke="#D4AF37" stroke-width="7" stroke-linecap="round" />
    `;
  } else if (cat.includes("perfume")) {
    shapeSvg = `
      <rect x="266" y="102" width="68" height="52" rx="8" fill="#D4AF37" stroke="#92400E" stroke-width="2" />
      <rect x="280" y="154" width="40" height="24" fill="#CBD5E1" />
      <rect x="188" y="178" width="224" height="304" rx="30" fill="url(#garmentGrad)" stroke="rgba(255,255,255,0.55)" stroke-width="4" />
      <rect x="204" y="198" width="20" height="262" rx="10" fill="rgba(255,255,255,0.22)" />
      <rect x="224" y="258" width="152" height="122" rx="10" fill="#F8FAFC" stroke="#D4AF37" stroke-width="3" />
      <rect x="232" y="266" width="136" height="106" rx="6" fill="none" stroke="#CBD5E1" stroke-width="1" />
      <text x="300" y="308" text-anchor="middle" font-family="Georgia, serif" font-size="15" font-weight="700" fill="#0F172A" letter-spacing="3">SAGU'S</text>
      <text x="300" y="334" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#64748B" letter-spacing="3.5">EAU DE PARFUM</text>
      <line x1="256" y1="352" x2="344" y2="352" stroke="#D4AF37" stroke-width="2" />
    `;
  } else if (cat.includes("sunglass")) {
    shapeSvg = `
      <path d="M110 262 L490 262" stroke="#D4AF37" stroke-width="6" stroke-linecap="round" />
      <rect x="128" y="246" width="148" height="108" rx="30" fill="url(#garmentGrad)" stroke="#D4AF37" stroke-width="6" />
      <rect x="324" y="246" width="148" height="108" rx="30" fill="url(#garmentGrad)" stroke="#D4AF37" stroke-width="6" />
      <path d="M150 265 L195 335" stroke="rgba(255,255,255,0.28)" stroke-width="10" stroke-linecap="round"/>
      <path d="M346 265 L391 335" stroke="rgba(255,255,255,0.28)" stroke-width="10" stroke-linecap="round"/>
      <path d="M276 280 Q300 260 324 280" fill="none" stroke="#D4AF37" stroke-width="6" />
    `;
  } else {
    shapeSvg = `
      <rect x="175" y="175" width="250" height="250" rx="36" fill="url(#garmentGrad)" stroke="${outlineColor}" stroke-width="3" />
      <circle cx="300" cy="300" r="68" fill="${accent}" opacity="0.35" />
    `;
  }

  const safeLabel = (label || category)
    .toUpperCase()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <defs>
      <radialGradient id="studioBg" cx="50%" cy="42%" r="68%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="65%" stop-color="#F1F5F9" />
        <stop offset="100%" stop-color="#E2E8F0" />
      </radialGradient>
      <linearGradient id="garmentGrad" x1="15%" y1="10%" x2="85%" y2="90%">
        <stop offset="0%" stop-color="${mainHex}" />
        <stop offset="100%" stop-color="${mainHex}" />
      </linearGradient>
      <linearGradient id="sideShade" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(0,0,0,0.12)" />
        <stop offset="25%" stop-color="rgba(255,255,255,0.08)" />
        <stop offset="75%" stop-color="rgba(0,0,0,0)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.16)" />
      </linearGradient>
      <filter id="dropShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#0F172A" flood-opacity="0.16" />
      </filter>
    </defs>
    <rect width="600" height="600" fill="url(#studioBg)" />
    <ellipse cx="300" cy="512" rx="145" ry="14" fill="#0F172A" opacity="0.07" />
    <g filter="url(#dropShadow)">
      ${shapeSvg}
    </g>
    <text x="300" y="564" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#64748B" letter-spacing="2">${safeLabel}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
