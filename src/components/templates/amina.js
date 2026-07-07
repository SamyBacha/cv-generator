import { makeThumbHelpers } from "./_thumb.js";

export const amina = {
  key: "amina",
  name: "Amina",
  desc: "Bandeau coloré à gauche, sections en pilules foncées, chevrons ▸▸▸ à droite",
  layout: "amina",
  columns: [
    {
      class: "col-left",
      side: "left",
      sections: [
        "profile",
        "education",
        "teaching",
        "languages",
        "hobbies",
        "soft_skills",
        "personal_projects",
      ],
    },
    {
      class: "col-right",
      side: "right",
      sections: ["about", "skills", "timeline"],
    },
  ],
  thumbnail(themeColors) {
    const { P, G, L, bar, lineStack, svg } = makeThumbHelpers(themeColors);
    const cream = "#fff2e2";
    const dark = "#20263a";
    const pill = (x, y, w, label) =>
      `<rect x="${x}" y="${y}" width="${w}" height="3.6" rx="1.8" fill="${dark}"/>` +
      `<rect x="${x + 2}" y="${y + 1.3}" width="${w - 4}" height="1" fill="${cream}" rx="0.3"/>` +
      (label
        ? `<text x="${x + w / 2}" y="${y + 2.4}" fill="${cream}" font-family="Arial" font-size="1.6" text-anchor="middle" font-weight="700">${label}</text>`
        : "");
    // Bandeau + pilules côté gauche, chevrons + lignes côté droit
    return svg(`
      <rect x="0" y="0" width="90" height="128" fill="${cream}"/>
      <path d="M 0 0 L 36 0 L 36 42 Q 36 46 32 46 L 4 46 Q 0 46 0 42 Z" fill="${P}"/>
      ${bar(4, 8, 24, 3, "#fff", 0.6)}
      ${bar(4, 14, 20, 2, "#fff", 0.4)}
      ${bar(4, 20, 26, 1.2, "rgba(255,255,255,0.75)", 0.3)}
      ${pill(4, 52, 28)}
      ${bar(6, 60, 1, 1, dark, 0.5)}
      ${lineStack(9, 59, 22, 2, 3, G)}
      ${bar(6, 68, 1, 1, dark, 0.5)}
      ${lineStack(9, 67, 22, 2, 3, G)}
      ${pill(4, 78, 28)}
      ${bar(6, 86, 1, 1, dark, 0.5)}
      ${lineStack(9, 85, 22, 2, 3, G)}
      ${pill(4, 100, 28)}
      <circle cx="10" cy="112" r="3.4" fill="none" stroke="${P}" stroke-width="0.6"/>
      <circle cx="18" cy="112" r="3.4" fill="none" stroke="${P}" stroke-width="0.6"/>
      <circle cx="26" cy="112" r="3.4" fill="none" stroke="${P}" stroke-width="0.6"/>
      ${bar(42, 12, 40, 5, dark, 0.5)}
      ${bar(42, 20, 30, 2, G, 0.4)}
      ${bar(42, 26, 44, 1, L, 0.3)}
      ${bar(42, 29, 42, 1, L, 0.3)}
      ${bar(42, 32, 40, 1, L, 0.3)}
      <text x="42" y="44" fill="${P}" font-family="Arial" font-weight="900" font-size="3" letter-spacing="-0.3">▸▸▸</text>
      ${bar(52, 41.5, 14, 2, dark, 0.4)}
      ${bar(42, 48, 24, 1.2, G, 0.3)}
      ${bar(42, 52, 44, 1.8, dark, 0.4)}
      ${bar(42, 58, 24, 1.2, G, 0.3)}
      ${bar(42, 62, 44, 1.8, dark, 0.4)}
      ${bar(42, 68, 24, 1.2, G, 0.3)}
      ${bar(42, 72, 44, 1.8, dark, 0.4)}
      <text x="42" y="90" fill="${P}" font-family="Arial" font-weight="900" font-size="3" letter-spacing="-0.3">▸▸▸</text>
      ${bar(52, 87.5, 18, 2, dark, 0.4)}
      ${bar(42, 96, 40, 1.2, G, 0.3)}
      ${bar(42, 100, 36, 1.2, G, 0.3)}
      ${bar(42, 104, 34, 1.2, G, 0.3)}
    `);
  },
};
