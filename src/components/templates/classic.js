import { makeThumbHelpers } from "./_thumb.js";

export const classic = {
  key: "classic",
  name: "Classique",
  desc: "Sidebar à gauche (35%), contenu à droite (65%)",
  layout: "two-col",
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
      <rect x="0" y="0" width="33" height="128" fill="${BG}"/>
      ${bar(4, 8, 22, 3.5, P, 1)}
      ${bar(4, 14, 18, 1.6, G, 0.4)}
      ${bar(4, 20, 20, 1, L, 0.3)}
      ${bar(4, 23, 22, 1, L, 0.3)}
      ${heading(4, 32)}
      ${lineStack(4, 38, 26, 4)}
      ${heading(4, 55)}
      ${lineStack(4, 61, 26, 3)}
      ${heading(4, 76)}
      ${lineStack(4, 82, 26, 3)}
      ${heading(37, 10, 14)}
      ${lineStack(37, 16, 50, 6, 3, L)}
      ${heading(37, 40, 14)}
      ${lineStack(37, 46, 50, 5, 3, L)}
      ${heading(37, 68, 14)}
      ${lineStack(37, 74, 50, 6, 3, L)}
    `);
  },
};
