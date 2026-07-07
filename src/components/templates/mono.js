import { makeThumbHelpers } from "./_thumb.js";

export const mono = {
  key: "mono",
  name: "Monoline",
  desc: "Une seule colonne, tout empilé verticalement",
  layout: "mono",
  columns: [
    {
      class: "col-mono",
      side: "left",
      sections: [
        "profile",
        "about",
        "skills",
        "timeline",
        "education",
        "teaching",
        "languages",
        "hobbies",
        "soft_skills",
        "personal_projects",
      ],
    },
  ],
  thumbnail(themeColors) {
    const { P, G, L, bar, lineStack, heading, svg } =
      makeThumbHelpers(themeColors);
    return svg(`
      ${bar(10, 8, 40, 4, P, 1)}
      ${bar(10, 15, 30, 2, G, 0.4)}
      ${heading(10, 25, 14)}
      ${lineStack(10, 31, 70, 4, 3, L)}
      ${heading(10, 48, 14)}
      ${lineStack(10, 54, 70, 5, 3, L)}
      ${heading(10, 74, 14)}
      ${lineStack(10, 80, 70, 4, 3, L)}
      ${heading(10, 97, 14)}
      ${lineStack(10, 103, 70, 4, 3, L)}
    `);
  },
};
