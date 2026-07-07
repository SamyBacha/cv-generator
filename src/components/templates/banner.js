import { makeThumbHelpers } from "./_thumb.js";

export const banner = {
  key: "banner",
  name: "Bandeau",
  desc: "En-tête pleine largeur puis deux colonnes équilibrées",
  layout: "banner",
  columns: [
    { class: "col-banner", side: "banner", sections: ["profile"] },
    {
      class: "col-left",
      side: "left",
      sections: ["about", "skills", "education", "hobbies"],
    },
    {
      class: "col-right",
      side: "right",
      sections: [
        "timeline",
        "teaching",
        "languages",
        "soft_skills",
        "personal_projects",
      ],
    },
  ],
  thumbnail(themeColors) {
    const { P, Y, G, BG, L, bar, lineStack, heading, svg } =
      makeThumbHelpers(themeColors);
    return svg(`
      <rect x="0" y="0" width="90" height="28" fill="${BG}"/>
      <rect x="0" y="26" width="90" height="1.5" fill="${Y}"/>
      ${bar(6, 8, 34, 4, P, 1)}
      ${bar(6, 15, 26, 2, G, 0.4)}
      ${bar(52, 10, 32, 1.2, L, 0.3)}
      ${bar(52, 14, 30, 1.2, L, 0.3)}
      ${bar(52, 18, 26, 1.2, L, 0.3)}
      ${heading(6, 34, 12)}
      ${lineStack(6, 40, 38, 5, 3, L)}
      ${heading(6, 60, 12)}
      ${lineStack(6, 66, 38, 4, 3, L)}
      ${heading(6, 82, 12)}
      ${lineStack(6, 88, 38, 4, 3, L)}
      ${heading(50, 34, 12)}
      ${lineStack(50, 40, 34, 6, 3, L)}
      ${heading(50, 66, 12)}
      ${lineStack(50, 72, 34, 5, 3, L)}
      <line x1="47" y1="32" x2="47" y2="122" stroke="#e5e5e8" stroke-width="0.3"/>
    `);
  },
};
