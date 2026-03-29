function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function trimText(value, limit) {
  return value.length > limit ? `${value.slice(0, limit - 1)}.` : value;
}

function toDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function createInternetImage({ width = 1280, height = 860, keywords, lock }) {
  const keywordList = Array.isArray(keywords) ? keywords : [keywords];
  const normalizedKeywords = keywordList
    .filter(Boolean)
    .map((keyword) => String(keyword).trim().replace(/\s+/g, " "))
    .join(" ");
  const query = normalizedKeywords ? `&q=${encodeURIComponent(normalizedKeywords)}` : "";
  const version = typeof lock === "number" ? `&v=${lock}` : "";

  return `https://www.sourcesplash.com/i/random?w=${width}&h=${height}${query}${version}`;
}

export function createTopicImage({ title, subtitle, palette, glyph }) {
  const safeTitle = escapeXml(trimText(title, 20));
  const safeSubtitle = escapeXml(trimText(subtitle, 34));

  return toDataUri(`
    <svg width="640" height="420" viewBox="0 0 640 420" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="30" y1="20" x2="610" y2="390" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.from}" />
          <stop offset="1" stop-color="${palette.to}" />
        </linearGradient>
      </defs>
      <rect width="640" height="420" rx="36" fill="url(#bg)" />
      <circle cx="512" cy="108" r="88" fill="${palette.highlight}" fill-opacity="0.75" />
      <circle cx="124" cy="328" r="110" fill="white" fill-opacity="0.28" />
      <rect x="58" y="58" width="196" height="196" rx="42" fill="white" fill-opacity="0.84" />
      <text x="156" y="176" text-anchor="middle" font-family="Aptos, Segoe UI, sans-serif" font-size="72" font-weight="700" fill="${palette.ink}">${escapeXml(glyph)}</text>
      <text x="58" y="314" font-family="Georgia, serif" font-size="48" font-weight="700" fill="${palette.ink}">${safeTitle}</text>
      <text x="58" y="350" font-family="Aptos, Segoe UI, sans-serif" font-size="22" fill="${palette.ink}" fill-opacity="0.78">${safeSubtitle}</text>
      <rect x="420" y="264" width="150" height="72" rx="24" fill="white" fill-opacity="0.74" />
      <text x="495" y="309" text-anchor="middle" font-family="Aptos, Segoe UI, sans-serif" font-size="20" font-weight="700" fill="${palette.ink}">10 karta</text>
    </svg>
  `);
}

export function createItemImage({ title, subtitle, palette, glyph }) {
  const safeTitle = escapeXml(trimText(title, 18));
  const safeSubtitle = escapeXml(trimText(subtitle, 24));

  return toDataUri(`
    <svg width="460" height="320" viewBox="0 0 460 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="item" x1="24" y1="24" x2="436" y2="296" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.from}" />
          <stop offset="1" stop-color="${palette.to}" />
        </linearGradient>
      </defs>
      <rect width="460" height="320" rx="32" fill="url(#item)" />
      <circle cx="374" cy="78" r="58" fill="white" fill-opacity="0.24" />
      <rect x="42" y="40" width="120" height="120" rx="30" fill="white" fill-opacity="0.8" />
      <text x="102" y="116" text-anchor="middle" font-family="Aptos, Segoe UI, sans-serif" font-size="40" font-weight="700" fill="${palette.ink}">${escapeXml(glyph)}</text>
      <text x="42" y="214" font-family="Georgia, serif" font-size="34" font-weight="700" fill="${palette.ink}">${safeTitle}</text>
      <text x="42" y="248" font-family="Aptos, Segoe UI, sans-serif" font-size="18" fill="${palette.ink}" fill-opacity="0.78">${safeSubtitle}</text>
      <path d="M42 274H242" stroke="${palette.ink}" stroke-opacity="0.18" stroke-width="6" stroke-linecap="round" />
    </svg>
  `);
}
