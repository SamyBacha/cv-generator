import { makeThumbHelpers } from "./_thumb.js";

export const mirror = {
  key: "mirror",
  name: "Miroir",
  desc: "Sidebar à droite, contenu principal à gauche",
  layout: "two-col-mirror",
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
    const { P, G, BG, L, bar, lineStack, heading, svg } =
      makeThumbHelpers(themeColors);
    return svg(`
      <rect x="57" y="0" width="33" height="128" fill="${BG}"/>
      ${bar(61, 8, 22, 3.5, P, 1)}
      ${bar(61, 14, 18, 1.6, G, 0.4)}
      ${heading(61, 26)}
      ${lineStack(61, 32, 26, 4)}
      ${heading(61, 50)}
      ${lineStack(61, 56, 26, 3)}
      ${heading(61, 72)}
      ${lineStack(61, 78, 26, 3)}
      ${heading(4, 10, 14)}
      ${lineStack(4, 16, 50, 6, 3, L)}
      ${heading(4, 40, 14)}
      ${lineStack(4, 46, 50, 5, 3, L)}
      ${heading(4, 68, 14)}
      ${lineStack(4, 74, 50, 6, 3, L)}
    `);
  },
};
