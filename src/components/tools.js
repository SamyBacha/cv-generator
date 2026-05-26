const _loadedStyles = new Set();

export const I18N = {
  fr: {
    about: "À PROPOS",
    skills: "COMPÉTENCES",
    timeline: "TIMELINE",
    education: "FORMATION",
    teaching: "ENSEIGNEMENT",
    languages: "LANGUES",
    hobbies: "HOBBIES",
    soft_skills: "SOFT SKILLS",
    personal_projects: "PROJETS PERSO",
    projects_header: "RÉFÉRENCES PROJETS",
  },
  en: {
    about: "ABOUT",
    skills: "SKILLS",
    timeline: "TIMELINE",
    education: "EDUCATION",
    teaching: "TEACHING",
    languages: "LANGUAGES",
    hobbies: "HOBBIES",
    soft_skills: "SOFT SKILLS",
    personal_projects: "PERSONAL PROJECTS",
    projects_header: "PROJECT REFERENCES",
  },
};

export function t(key, lang) {
  return (I18N[lang] || I18N.fr)[key] || key;
}

export function applyStyles(element) {
  const name = element.tagName.toLowerCase();
  if (_loadedStyles.has(name)) return;
  _loadedStyles.add(name);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(`./${name}.css`, import.meta.url);
  document.head.appendChild(link);
}

export function defaultVisibility() {
  return {
    about: true,
    skills: true,
    timeline: true,
    education: true,
    teaching: true,
    languages: true,
    hobbies: true,
    soft_skills: true,
    missions: true,
    personal_projects: true,
  };
}

const URL_RE =
  /(?<![\w@])(https?:\/\/[^\s<>"'`]+|www\.[\w-]+(?:\.[\w-]+)+[^\s<>"'`]*|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/gi;
const MD_LINK_RE = /\[([^\]\n]+)\]\(([^\s)]+)\)/g;
const ANCHOR_SPLIT_RE = /(<a\b[^>]*>[\s\S]*?<\/a>)/gi;

export function normalizeHref(url) {
  const v = String(url || "").trim();
  if (!v) return v;
  if (/^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/.test(v)) return `mailto:${v}`;
  if (/^www\./i.test(v)) return `https://${v}`;
  if (!/^[a-z][\w+.-]*:/i.test(v) && !v.startsWith("/") && !v.startsWith("#")) {
    return `https://${v}`;
  }
  return v;
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}

export function linkify(html) {
  if (!html) return html;
  const parts = String(html).split(ANCHOR_SPLIT_RE);
  return parts
    .map((part) => {
      if (/^<a\b/i.test(part)) return part;
      const withMd = part.replace(MD_LINK_RE, (_m, text, url) => {
        const href = normalizeHref(url);
        return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener">${text}</a>`;
      });
      return withMd
        .split(ANCHOR_SPLIT_RE)
        .map((sub) => {
          if (/^<a\b/i.test(sub)) return sub;
          return sub.replace(URL_RE, (m) => {
            const trail = m.match(/[.,;:!?)\]"'>]+$/);
            const trailing = trail ? trail[0] : "";
            const url = trailing ? m.slice(0, -trailing.length) : m;
            const href = normalizeHref(url);
            return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener">${url}</a>${trailing}`;
          });
        })
        .join("");
    })
    .join("");
}

export function renderLogoHtml(logo) {
  if (!logo) return "";
  const s = logo.trim();
  if (s.startsWith("<svg")) return `<span class="m-logo">${s}</span>`;
  return `<span class="m-logo"><img src="${s}" alt="logo"></span>`;
}

export async function compressImage(
  file,
  maxW = 120,
  maxH = 40,
  quality = 0.85,
) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(
        maxW / img.naturalWidth,
        maxH / img.naturalHeight,
        1,
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png", quality));
    };
    img.src = url;
  });
}
