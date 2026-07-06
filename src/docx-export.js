import {
  AlignmentType,
  BorderStyle,
  convertMillimetersToTwip,
  Document,
  ExternalHyperlink,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { defaultVisibility, t } from "./components/tools.js";

// ---------- Public API ----------

export async function exportDocx(data) {
  const doc = buildDocument(data);
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${fileBaseName(data)}.docx`);
}

// ---------- Constants ----------

const FONT = "Segoe UI";
const PAGE_W_MM = 210;
const PAGE_H_MM = 297;
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
  insideHorizontal: NO_BORDER,
  insideVertical: NO_BORDER,
};

// ---------- Colors ----------

function readThemeColors() {
  const style = getComputedStyle(document.documentElement);
  const read = (name, fallback) =>
    normalizeHex(style.getPropertyValue(name)) || fallback;
  return {
    purple: read("--purple", "3454E2"),
    purpleLight: read("--purple-light", "6C67A6"),
    yellow: read("--yellow", "FACC2A"),
    dark: read("--dark", "2C3E50"),
    text: read("--text", "2D2D2D"),
    grey: "6A6A6A",
    lightGrey: "999999",
    hairline: "DDDDDD",
    hairlineSoft: "ECECEC",
  };
}

function normalizeHex(color) {
  if (!color) {
    return null;
  }
  const c = color.replace("#", "").trim();
  if (/^[0-9a-f]{6}$/i.test(c)) {
    return c.toUpperCase();
  }
  if (/^[0-9a-f]{3}$/i.test(c)) {
    return c
      .split("")
      .map((x) => x + x)
      .join("")
      .toUpperCase();
  }
  const m = c.match(/^rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/i);
  if (m) {
    return [m[1], m[2], m[3]]
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }
  return null;
}

// ---------- Document ----------

function buildDocument(data) {
  const colors = readThemeColors();
  const vis = data.visibility || defaultVisibility();
  const lang = data.lang || "fr";

  const sections = [];

  sections.push({
    properties: {
      page: {
        size: {
          width: convertMillimetersToTwip(PAGE_W_MM),
          height: convertMillimetersToTwip(PAGE_H_MM),
        },
        margin: {
          top: convertMillimetersToTwip(12),
          right: convertMillimetersToTwip(0),
          bottom: convertMillimetersToTwip(12),
          left: convertMillimetersToTwip(0),
        },
      },
    },
    children: [buildPage1Table(data, colors, vis, lang)],
  });

  if (
    vis.missions !== false &&
    Array.isArray(data.missions) &&
    data.missions.length
  ) {
    sections.push({
      properties: {
        page: {
          size: {
            width: convertMillimetersToTwip(PAGE_W_MM),
            height: convertMillimetersToTwip(PAGE_H_MM),
          },
          margin: {
            top: convertMillimetersToTwip(14),
            right: convertMillimetersToTwip(16),
            bottom: convertMillimetersToTwip(14),
            left: convertMillimetersToTwip(16),
          },
        },
      },
      children: buildMissionsChildren(data, colors, lang),
    });
  }

  return new Document({
    creator: "Proxym CV Editor",
    title: `CV — ${plainText(data?.personal?.name) || ""}`,
    styles: buildStyles(colors),
    numbering: buildNumbering(colors),
    sections,
  });
}

function buildStyles(colors) {
  return {
    default: {
      document: {
        run: { font: FONT, size: 20, color: colors.text },
        paragraph: { spacing: { line: 280 } },
      },
    },
  };
}

function buildNumbering(colors) {
  return {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              run: { color: colors.purple, font: FONT },
              paragraph: {
                indent: { left: 260, hanging: 200 },
                spacing: { before: 0, after: 30 },
              },
            },
          },
        ],
      },
      {
        reference: "tasks",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "+",
            alignment: AlignmentType.LEFT,
            style: {
              run: { color: colors.purple, font: FONT, bold: true },
              paragraph: {
                indent: { left: 300, hanging: 220 },
                spacing: { before: 40, after: 40 },
              },
            },
          },
        ],
      },
    ],
  };
}

// ---------- Page 1 : layout 2 colonnes ----------

function buildPage1Table(data, colors, vis, lang) {
  const leftWidth = 3200;
  const rightWidth = 5800;
  return new Table({
    width: { size: leftWidth + rightWidth, type: WidthType.DXA },
    borders: NO_BORDERS,
    columnWidths: [leftWidth, rightWidth],
    rows: [
      new TableRow({
        cantSplit: false,
        children: [
          new TableCell({
            width: { size: leftWidth, type: WidthType.DXA },
            borders: NO_BORDERS,
            margins: { top: 200, bottom: 200, left: 360, right: 260 },
            verticalAlign: VerticalAlign.TOP,
            children: buildLeftColumnChildren(data, colors, vis, lang),
          }),
          new TableCell({
            width: { size: rightWidth, type: WidthType.DXA },
            borders: NO_BORDERS,
            margins: { top: 480, bottom: 200, left: 260, right: 360 },
            verticalAlign: VerticalAlign.TOP,
            children: buildRightColumnChildren(data, colors, vis, lang),
          }),
        ],
      }),
    ],
  });
}

function buildLeftColumnChildren(data, colors, vis, lang) {
  const out = [];

  // Bloc profil : nom, poste, contacts, liens
  const personal = data.personal || {};
  out.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: plainText(personal.name) || "",
          bold: true,
          size: 40,
          color: colors.purple,
          font: FONT,
        }),
      ],
    }),
  );
  if (plainText(personal.role)) {
    out.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: (plainText(personal.role) || "").toUpperCase(),
            bold: true,
            size: 20,
            color: colors.dark,
            characterSpacing: 12,
            font: FONT,
          }),
        ],
      }),
    );
  }
  const contacts = personal.contacts || {};
  if (plainText(contacts.email)) {
    out.push(contactLine("✉", contacts.email, colors));
  }
  if (plainText(contacts.phone)) {
    out.push(contactLine("☎", contacts.phone, colors));
  }
  if (Array.isArray(personal.links) && personal.links.length) {
    personal.links.forEach((link) => {
      const url = plainText(link?.link || link);
      if (url) {
        out.push(contactLine(link?.ico || "→", url, colors, true));
      }
    });
  }

  out.push(hairlineParagraph(colors));

  const push = (key, label, builder) => {
    if (vis[key] === false) {
      return;
    }
    const paragraphs = builder();
    if (!paragraphs?.length) {
      return;
    }
    out.push(sectionHeader(label, colors, "left"));
    out.push(...paragraphs);
  };

  push("education", t("education", lang), () =>
    buildEntryListParagraphs(data.education, colors),
  );
  push("teaching", t("teaching", lang), () =>
    buildEntryListParagraphs(data.teaching, colors),
  );
  push("languages", t("languages", lang), () =>
    buildSimpleListParagraphs(data.languages, colors),
  );
  push("hobbies", t("hobbies", lang), () =>
    buildSimpleListParagraphs(data.hobbies, colors),
  );
  if (Array.isArray(data.softSkills) && data.softSkills.length) {
    push("soft_skills", t("soft_skills", lang), () =>
      buildSimpleListParagraphs(data.softSkills, colors),
    );
  }
  if (Array.isArray(data.personal_projects) && data.personal_projects.length) {
    push("personal_projects", t("personal_projects", lang), () =>
      buildSimpleListParagraphs(data.personal_projects, colors),
    );
  }

  return out;
}

function buildRightColumnChildren(data, colors, vis, lang) {
  const out = [];

  const push = (key, label, builder) => {
    if (vis[key] === false) {
      return;
    }
    const paragraphs = builder();
    if (!paragraphs?.length) {
      return;
    }
    out.push(sectionHeader(label, colors, "right"));
    out.push(...paragraphs);
  };

  push("about", t("about", lang), () =>
    htmlToParagraphs(data?.about?.intro, {
      size: 22,
      color: colors.text,
    }),
  );
  push("skills", t("skills", lang), () =>
    buildSkillsParagraphs(data.skills, colors),
  );
  push("timeline", t("timeline", lang), () =>
    buildTimelineParagraphs(data.timeline, colors),
  );

  if (!out.length) {
    out.push(new Paragraph({ children: [new TextRun("")] }));
  }
  return out;
}

// ---------- Missions ----------

function buildMissionsChildren(data, colors, lang) {
  const children = [];
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: t("projects_header", lang),
          bold: true,
          size: 28,
          color: colors.purple,
          font: FONT,
          characterSpacing: 14,
        }),
      ],
    }),
  );
  data.missions.forEach((mission, idx) => {
    children.push(...buildMissionParagraphs(mission, colors, idx));
    if (idx < data.missions.length - 1) {
      children.push(missionSeparator(colors));
    }
  });
  return children;
}

function buildMissionParagraphs(m, colors, idx) {
  const out = [];

  if (plainText(m.dates)) {
    out.push(
      new Paragraph({
        spacing: { before: idx === 0 ? 0 : 240, after: 40 },
        children: [
          new TextRun({
            text: (plainText(m.dates) || "").toUpperCase(),
            size: 18,
            color: colors.grey,
            characterSpacing: 6,
            font: FONT,
          }),
        ],
      }),
    );
  }

  const clientRuns = [];
  const logoRun = imageRunFromLogo(m.logo);
  if (logoRun) {
    clientRuns.push(logoRun);
    clientRuns.push(new TextRun({ text: "  ", font: FONT }));
  }
  clientRuns.push(
    ...htmlToRuns(m.client, {
      size: 26,
      color: colors.text,
      bold: true,
      font: FONT,
    }),
  );
  out.push(
    new Paragraph({
      spacing: { after: 60 },
      border: {
        bottom: {
          color: colors.hairline,
          space: 2,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: clientRuns,
    }),
  );

  if (plainText(m.role)) {
    out.push(
      new Paragraph({
        spacing: { after: 120 },
        children: htmlToRuns(m.role, {
          size: 22,
          color: colors.purple,
          font: FONT,
        }),
      }),
    );
  }

  if (plainText(m.summary)) {
    const summaryParagraphs = htmlToParagraphs(m.summary, {
      size: 22,
      color: colors.purple,
      font: FONT,
      indent: { left: 280 },
      spacingAfter: 60,
    });
    out.push(...summaryParagraphs);
  }

  if (Array.isArray(m.tasks)) {
    m.tasks.forEach((task) => {
      out.push(
        new Paragraph({
          numbering: { reference: "tasks", level: 0 },
          spacing: { before: 40, after: 20 },
          children: htmlToRuns(task.label, {
            size: 22,
            color: "333333",
            font: FONT,
          }),
        }),
      );
      if (plainText(task.desc)) {
        const descParagraphs = htmlToParagraphs(task.desc, {
          size: 19,
          color: "666666",
          italic: true,
          font: FONT,
          indent: { left: 700 },
          spacingAfter: 20,
        });
        out.push(...descParagraphs);
      }
      if (plainText(task.stack)) {
        out.push(
          new Paragraph({
            spacing: { after: 30 },
            indent: { left: 700 },
            children: [
              new TextRun({
                text: "Stack : ",
                bold: true,
                size: 19,
                color: colors.dark,
                font: FONT,
              }),
              ...htmlToRuns(task.stack, {
                size: 19,
                color: "666666",
                font: FONT,
              }),
            ],
          }),
        );
      }
    });
  }

  if (plainText(m.stack)) {
    out.push(
      new Paragraph({
        spacing: { before: 120, after: 60 },
        indent: { left: 280 },
        children: [
          new TextRun({
            text: "Stack : ",
            bold: true,
            size: 20,
            color: colors.dark,
            font: FONT,
          }),
          ...htmlToRuns(m.stack, {
            size: 20,
            color: "666666",
            font: FONT,
          }),
        ],
      }),
    );
  }

  return out;
}

function missionSeparator(colors) {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: {
      bottom: {
        color: colors.hairlineSoft,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 4,
      },
    },
    children: [new TextRun("")],
  });
}

// ---------- Content builders ----------

function sectionHeader(label, colors, side) {
  const size = side === "right" ? 25 : 23;
  return new Paragraph({
    spacing: { before: 320, after: 160 },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: colors.yellow },
    children: [
      new TextRun({
        text: `  ${(label || "").toUpperCase()}  `,
        bold: true,
        size,
        color: colors.purple,
        characterSpacing: 14,
        font: FONT,
      }),
    ],
  });
}

function hairlineParagraph(colors) {
  return new Paragraph({
    spacing: { before: 120, after: 60 },
    border: {
      bottom: {
        color: colors.hairlineSoft,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 4,
      },
    },
    children: [new TextRun("")],
  });
}

function contactLine(icon, value, colors, isLink = false) {
  const text = plainText(value) || "";
  const runs = [
    new TextRun({
      text: `${icon}  `,
      color: colors.purple,
      size: 18,
      font: FONT,
    }),
  ];
  if (isLink) {
    runs.push(hyperlinkRun(text, text, colors, 18));
  } else {
    runs.push(
      new TextRun({
        text,
        size: 18,
        color: "555555",
        font: FONT,
      }),
    );
  }
  return new Paragraph({
    spacing: { before: 20, after: 20 },
    children: runs,
  });
}

function buildEntryListParagraphs(entries, colors) {
  if (!Array.isArray(entries) || !entries.length) {
    return [];
  }
  const out = [];
  entries.forEach((e) => {
    if (plainText(e.years)) {
      out.push(
        new Paragraph({
          spacing: { before: 100, after: 20 },
          children: [
            new TextRun({
              text: plainText(e.years),
              size: 17,
              color: colors.purpleLight,
              bold: true,
              font: FONT,
            }),
          ],
        }),
      );
    }
    if (plainText(e.degree)) {
      out.push(
        new Paragraph({
          spacing: { after: 20 },
          children: htmlToRuns(e.degree, {
            size: 20,
            color: colors.dark,
            bold: true,
            font: FONT,
          }),
        }),
      );
    }
    if (plainText(e.org)) {
      out.push(
        new Paragraph({
          spacing: { after: 40 },
          children: htmlToRuns(e.org, {
            size: 18,
            color: colors.text,
            italic: true,
            font: FONT,
          }),
        }),
      );
    }
  });
  return out;
}

function buildSimpleListParagraphs(items, colors) {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }
  return items
    .filter((item) => plainText(item))
    .map(
      (item) =>
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { before: 20, after: 20 },
          children: htmlToRuns(item, {
            size: 20,
            color: colors.text,
            font: FONT,
          }),
        }),
    );
}

function buildSkillsParagraphs(skills, colors) {
  if (!Array.isArray(skills) || !skills.length) {
    return [];
  }
  return skills.map((skill) => {
    const label = plainText(skill.label || "").replace(/\s*:\s*$/, "");
    return new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [
        new TextRun({
          text: `${label} : `,
          bold: true,
          size: 20,
          color: colors.dark,
          font: FONT,
        }),
        ...htmlToRuns(skill.items, {
          size: 20,
          color: colors.text,
          font: FONT,
        }),
      ],
    });
  });
}

function buildTimelineParagraphs(timeline, colors) {
  if (!Array.isArray(timeline) || !timeline.length) {
    return [];
  }
  return timeline.map((ev) => {
    const yr = plainText(ev.year) || "";
    const runs = [
      new TextRun({
        text: yr.padEnd(6, " "),
        bold: true,
        size: 19,
        color: ev.current ? colors.purple : colors.purpleLight,
        font: FONT,
      }),
      new TextRun({
        text: "  •  ",
        color: ev.current ? colors.purple : colors.purpleLight,
        size: 19,
        font: FONT,
      }),
      ...htmlToRuns(ev.label, {
        size: 20,
        color: colors.text,
        bold: !!ev.current,
        font: FONT,
      }),
    ];
    return new Paragraph({
      spacing: { before: 60, after: 60 },
      children: runs,
    });
  });
}

// ---------- HTML -> docx ----------

const BLOCK_TAGS = new Set([
  "p",
  "div",
  "br",
  "li",
  "ul",
  "ol",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
]);

function htmlToParagraphs(html, opts = {}) {
  const text = String(html || "").trim();
  if (!text) {
    return [];
  }
  const doc = new DOMParser().parseFromString(
    `<div>${text}</div>`,
    "text/html",
  );
  const root = doc.body.firstChild;
  const paragraphs = [];
  const state = { current: [] };

  const flush = (extra = {}) => {
    if (!state.current.length) {
      return;
    }
    paragraphs.push(
      new Paragraph({
        spacing: {
          before: extra.spacingBefore ?? opts.spacingBefore ?? 20,
          after: extra.spacingAfter ?? opts.spacingAfter ?? 60,
        },
        indent: opts.indent,
        alignment: opts.alignment,
        children: state.current,
      }),
    );
    state.current = [];
  };

  const emitList = (node) => {
    Array.from(node.children).forEach((li) => {
      if (li.tagName.toLowerCase() !== "li") {
        return;
      }
      const runs = htmlToRuns(li.innerHTML, opts);
      if (runs.length) {
        paragraphs.push(
          new Paragraph({
            numbering: { reference: "bullets", level: 0 },
            spacing: { before: 20, after: 20 },
            children: runs,
          }),
        );
      }
    });
  };

  const walk = (node, style) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.textContent;
      if (!value) {
        return;
      }
      state.current.push(runFromStyle(value, style));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    const tag = node.tagName.toLowerCase();
    const childStyle = mergeStyle(style, tag, node);

    if (tag === "br") {
      state.current.push(new TextRun({ break: 1 }));
      return;
    }
    if (tag === "ul" || tag === "ol") {
      flush();
      emitList(node);
      return;
    }
    if (tag === "p" || tag === "div") {
      flush();
      Array.from(node.childNodes).forEach((c) => walk(c, childStyle));
      flush();
      return;
    }
    if (tag === "a") {
      const href = node.getAttribute("href") || "";
      const label = node.textContent || href;
      state.current.push(hyperlinkRun(label, href, style, opts.size || 20));
      return;
    }
    Array.from(node.childNodes).forEach((c) => walk(c, childStyle));
  };

  Array.from(root.childNodes).forEach((c) => walk(c, opts));
  flush();
  return paragraphs;
}

function htmlToRuns(html, style = {}) {
  const text = String(html || "");
  if (!text.trim() && !text.length) {
    return [];
  }
  const doc = new DOMParser().parseFromString(
    `<div>${text}</div>`,
    "text/html",
  );
  const root = doc.body.firstChild;
  const runs = [];

  const walk = (node, currentStyle) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.textContent;
      if (value === "") {
        return;
      }
      runs.push(runFromStyle(value, currentStyle));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    const tag = node.tagName.toLowerCase();
    if (tag === "br") {
      runs.push(new TextRun({ break: 1 }));
      return;
    }
    if (tag === "a") {
      const href = node.getAttribute("href") || "";
      const label = node.textContent || href;
      runs.push(
        hyperlinkRun(label, href, currentStyle, currentStyle.size || 20),
      );
      return;
    }
    const childStyle = mergeStyle(currentStyle, tag, node);
    if (BLOCK_TAGS.has(tag) && runs.length) {
      runs.push(new TextRun({ break: 1 }));
    }
    Array.from(node.childNodes).forEach((c) => walk(c, childStyle));
  };

  Array.from(root.childNodes).forEach((c) => walk(c, style));
  return runs;
}

function mergeStyle(current, tag, node) {
  const next = { ...current };
  if (tag === "b" || tag === "strong") {
    next.bold = true;
  }
  if (tag === "i" || tag === "em") {
    next.italic = true;
  }
  if (tag === "u") {
    next.underline = true;
  }
  if (tag === "s" || tag === "strike" || tag === "del") {
    next.strike = true;
  }
  const styleAttr = node?.getAttribute?.("style") || "";
  const colorMatch = styleAttr.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
  if (colorMatch) {
    const c = normalizeHex(colorMatch[1]);
    if (c) {
      next.color = c;
    }
  }
  const weightMatch = styleAttr.match(/font-weight\s*:\s*(\d+|bold|normal)/i);
  if (weightMatch) {
    const w = weightMatch[1].toLowerCase();
    if (w === "normal" || (Number(w) && Number(w) < 600)) {
      next.bold = false;
    } else if (w === "bold" || Number(w) >= 600) {
      next.bold = true;
    }
  }
  return next;
}

function runFromStyle(text, style) {
  return new TextRun({
    text: decodeEntities(text),
    bold: !!style.bold,
    italics: !!style.italic,
    underline: style.underline ? {} : undefined,
    strike: !!style.strike,
    color: style.color || undefined,
    size: style.size || 20,
    font: style.font || FONT,
  });
}

function hyperlinkRun(label, href, style, size) {
  const url = normalizeUrl(href);
  return new ExternalHyperlink({
    link: url,
    children: [
      new TextRun({
        text: decodeEntities(label),
        color: style.color || "1155CC",
        underline: { type: "single" },
        size: size || style.size || 20,
        font: FONT,
      }),
    ],
  });
}

function normalizeUrl(href) {
  const raw = String(href || "").trim();
  if (!raw) {
    return "";
  }
  if (/^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/.test(raw)) {
    return `mailto:${raw}`;
  }
  if (/^www\./i.test(raw)) {
    return `https://${raw}`;
  }
  if (
    !/^[a-z][\w+.-]*:/i.test(raw) &&
    !raw.startsWith("/") &&
    !raw.startsWith("#")
  ) {
    return `https://${raw}`;
  }
  return raw;
}

// ---------- Images ----------

function imageRunFromLogo(logo) {
  if (!logo || typeof logo !== "string") {
    return null;
  }
  const value = logo.trim();
  if (!value.startsWith("data:image/")) {
    return null;
  }
  const match = value.match(/^data:image\/([a-z+]+);base64,(.+)$/i);
  if (!match) {
    return null;
  }
  const type = match[1].toLowerCase();
  if (type === "svg" || type === "svg+xml") {
    return null;
  }
  try {
    const bin = atob(match[2]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return new ImageRun({
      data: bytes,
      transformation: { width: 22, height: 22 },
      type: type === "jpg" ? "jpeg" : type,
    });
  } catch {
    return null;
  }
}

// ---------- Helpers ----------

function plainText(html) {
  if (html == null) {
    return "";
  }
  return decodeEntities(
    String(html)
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function decodeEntities(str) {
  if (!/&/.test(str)) {
    return str;
  }
  const ta = document.createElement("textarea");
  ta.innerHTML = str;
  return ta.value;
}

function fileBaseName(data) {
  const name = plainText(data?.personal?.name) || "CV";
  return `CV - ${name}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
