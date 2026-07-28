import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const outputDir = new URL("../public/services/", import.meta.url);

const assets = [
  {
    file: "airport.png",
    title: "Airport",
    bg: ["#e0f7ff", "#fff7c2"],
    body: `<rect x="92" y="132" width="216" height="70" rx="8" fill="#f8fafc" stroke="#0f172a" stroke-width="4"/>
      <rect x="118" y="104" width="36" height="96" rx="7" fill="#0ea5e9"/>
      <path d="M42 234h316" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
      <path d="M78 230h244" stroke="#f97316" stroke-width="5" stroke-dasharray="20 16"/>
      <path d="M200 46l20 98h112l-96 28 18 72-54-44-54 44 18-72-96-28h112z" fill="#ffffff" stroke="#075985" stroke-width="5" stroke-linejoin="round"/>`,
  },
  {
    file: "city.png",
    title: "In-City",
    bg: ["#f0f9ff", "#e8f5e9"],
    body: `<rect x="54" y="112" width="58" height="142" rx="8" fill="#075985"/>
      <rect x="132" y="78" width="70" height="176" rx="8" fill="#0ea5e9"/>
      <rect x="222" y="126" width="82" height="128" rx="8" fill="#38bdf8"/>
      <path d="M40 256h320" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
      ${Array.from({ length: 12 }, (_, index) => {
        const x = 70 + (index % 4) * 20 + Math.floor(index / 4) * 78;
        const y = 104 + (index % 3) * 42;
        return `<rect x="${x}" y="${y}" width="10" height="18" rx="2" fill="#fff7c2"/>`;
      }).join("")}
      <path d="M74 274c28-28 58-28 86 0s58 28 86 0 58-28 86 0" fill="none" stroke="#f97316" stroke-width="7" stroke-linecap="round"/>`,
  },
  {
    file: "outstation.png",
    title: "Outstation",
    bg: ["#ecfeff", "#fff7ed"],
    body: `<path d="M45 244c46-74 84-110 120-110 28 0 42 36 72 36 34 0 46-78 86-106 18 58 30 118 38 180z" fill="#bae6fd" stroke="#075985" stroke-width="5"/>
      <path d="M42 268c54-28 106-42 156-42s94 34 158 28" fill="none" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
      <path d="M84 270c48-18 84-25 132-23" fill="none" stroke="#f97316" stroke-width="5" stroke-linecap="round"/>
      <circle cx="102" cy="94" r="28" fill="#fbbf24"/>
      <path d="M60 302h280" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>`,
  },
  {
    file: "corporate.png",
    title: "Corporate",
    bg: ["#eef2ff", "#e0f2fe"],
    body: `<rect x="76" y="82" width="248" height="178" rx="18" fill="#ffffff" stroke="#075985" stroke-width="5"/>
      <rect x="120" y="52" width="160" height="52" rx="16" fill="#0ea5e9" stroke="#075985" stroke-width="5"/>
      <path d="M156 52v-8c0-18 16-30 44-30s44 12 44 30v8" fill="none" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
      <path d="M76 142h248" stroke="#0f172a" stroke-width="5"/>
      <circle cx="200" cy="164" r="16" fill="#f97316"/>
      <path d="M132 220h136" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>`,
  },
  {
    file: "executive.png",
    title: "Executive",
    bg: ["#fff7ed", "#e0f2fe"],
    body: `<circle cx="200" cy="96" r="44" fill="#0ea5e9" stroke="#075985" stroke-width="5"/>
      <path d="M132 238c8-58 34-88 68-88s60 30 68 88z" fill="#ffffff" stroke="#075985" stroke-width="5"/>
      <path d="M164 158l36 48 36-48" fill="none" stroke="#f97316" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M96 270h208" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
      <path d="M128 286h144" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>`,
  },
  {
    file: "all-india.png",
    title: "All India",
    bg: ["#ecfccb", "#e0f2fe"],
    body: `<path d="M196 54c72 0 130 58 130 130s-58 130-130 130S66 256 66 184 124 54 196 54z" fill="#ffffff" stroke="#075985" stroke-width="5"/>
      <path d="M86 184h220M196 54c-36 36-54 78-54 130s18 94 54 130M196 54c36 36 54 78 54 130s-18 94-54 130" fill="none" stroke="#bae6fd" stroke-width="5"/>
      <path d="M150 206l50-100 50 100-50-24z" fill="#f97316" stroke="#0f172a" stroke-width="5" stroke-linejoin="round"/>
      <path d="M92 300h216" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>`,
  },
];

await mkdir(outputDir, { recursive: true });

for (const asset of assets) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="320" viewBox="0 0 400 320">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop stop-color="${asset.bg[0]}"/>
        <stop offset="1" stop-color="${asset.bg[1]}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="320" rx="32" fill="url(#bg)"/>
    <circle cx="346" cy="52" r="34" fill="#ffffff" opacity="0.58"/>
    <circle cx="62" cy="64" r="18" fill="#ffffff" opacity="0.52"/>
    ${asset.body}
    <text x="200" y="304" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#0f172a">${asset.title}</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(fileURLToPath(new URL(asset.file, outputDir)));
}
