/**
 * Registre des templates de mise en page pour la page 1 du CV.
 *
 * Chaque template exporte un objet uniforme :
 *  - `key`       : identifiant utilisé côté CV_DATA.template
 *  - `name`      : libellé affiché dans le picker
 *  - `desc`      : phrase courte pour le tooltip
 *  - `layout`    : identifiant appliqué en `data-layout` sur `.page1`
 *                  (le CSS cv-page1.css sélectionne dessus)
 *  - `columns`   : liste ordonnée de colonnes ; chaque colonne a une
 *                  classe CSS, un side ("left"/"right"/"banner") et la
 *                  liste des sections qu'elle contient
 *  - `thumbnail` : fonction (themeColors) → chaîne SVG de la miniature
 *
 * Les clés de section reconnues sont : "profile", "about", "skills",
 * "timeline", "education", "teaching", "languages", "hobbies",
 * "soft_skills", "personal_projects".
 *
 * Pour ajouter un nouveau template : créer `./mon-template.js` sur le
 * même modèle, puis l'ajouter à `ALL_TEMPLATES` ci-dessous.
 */

import { amina } from "./amina.js";
import { banner } from "./banner.js";
import { classic } from "./classic.js";
import { mirror } from "./mirror.js";
import { mono } from "./mono.js";

const ALL_TEMPLATES = [classic, mirror, banner, mono, amina];

export const TEMPLATES = Object.fromEntries(
  ALL_TEMPLATES.map((tpl) => [tpl.key, tpl]),
);

export const DEFAULT_TEMPLATE = "classic";

export function getTemplate(key) {
  return TEMPLATES[key] || TEMPLATES[DEFAULT_TEMPLATE];
}

export function templateKeys() {
  return ALL_TEMPLATES.map((tpl) => tpl.key);
}

export function templateThumbnailSvg(key, themeColors) {
  const tpl = TEMPLATES[key];
  if (tpl && typeof tpl.thumbnail === "function") {
    return tpl.thumbnail(themeColors);
  }
  return `<svg viewBox="0 0 90 128" xmlns="http://www.w3.org/2000/svg"><rect width="90" height="128" fill="white"/></svg>`;
}
