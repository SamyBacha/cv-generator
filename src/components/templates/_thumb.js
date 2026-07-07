/**
 * Helpers SVG partagés par les miniatures des templates.
 *
 * `makeThumbHelpers(themeColors)` retourne un ensemble de primitives
 * (rectangles, empilements de lignes, encadrement…) prêtes à composer,
 * teintées par les couleurs `--purple` / `--yellow` du thème actif.
 */
export function makeThumbHelpers(themeColors = {}) {
  const P = themeColors.purple || "#3454e2";
  const Y = themeColors.yellow || "#facc2a";
  const G = "#c8c8d0";
  const L = "#eceef2";
  const BG = "#f7f7fa";
  const white = "#ffffff";

  const bar = (x, y, w, h, fill, rx = 0.6) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}"/>`;

  const lineStack = (x, yStart, w, count, gap = 3, color = L) => {
    let out = "";
    for (let i = 0; i < count; i++) {
      out += bar(x, yStart + i * gap, w - (i % 2 ? 4 : 0), 1, color, 0.3);
    }
    return out;
  };

  const heading = (x, y, w = 10, fill = Y) => bar(x, y, w, 2.2, fill, 0.4);

  const frame = `<rect x="0" y="0" width="90" height="128" fill="${white}" rx="3"/>`;

  const svg = (body) =>
    `<svg viewBox="0 0 90 128" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${frame}${body}</svg>`;

  return { P, Y, G, L, BG, white, bar, lineStack, heading, frame, svg };
}
