import {
  compressImage,
  defaultVisibility,
  linkify,
  normalizeHref,
  renderLogoHtml,
} from "./components/tools.js";

/* ===== ÉTAT ===== */
let CV_DATA = null;
let editData = null;
let currentMode = "viewer";

export const LS_KEY = "proxym-cv-data";

export function getCvData() {
  return CV_DATA;
}
export function getEditData() {
  return editData;
}

/* ===== UTILITAIRES ===== */
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

function setPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null) {
      cur[keys[i]] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    }
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

/* ===== NETTOYAGE COLLAGE ===== */
const PASTE_ALLOWED = new Set([
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "UL",
  "OL",
  "LI",
  "BR",
  "P",
]);
const PASTE_TO_P = new Set([
  "DIV",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "PRE",
]);

function convertStylesToSemantic(node) {
  if (node.nodeType !== 1) {
    return;
  }
  for (const child of Array.from(node.childNodes)) {
    convertStylesToSemantic(child);
  }
  const tag = node.nodeName;
  if (tag !== "SPAN" && tag !== "FONT") {
    return;
  }
  const style = node.style;
  const wrappers = [];
  const fw = style.fontWeight;
  if (fw === "bold" || parseInt(fw) >= 700) {
    wrappers.push("b");
  }
  if (style.fontStyle === "italic") {
    wrappers.push("i");
  }
  if ((style.textDecoration || "").includes("underline")) {
    wrappers.push("u");
  }
  if (wrappers.length === 0) {
    return;
  }
  let inner = node.ownerDocument.createDocumentFragment();
  while (node.firstChild) {
    inner.appendChild(node.firstChild);
  }
  for (const tagName of wrappers) {
    const wrapper = node.ownerDocument.createElement(tagName);
    wrapper.appendChild(inner);
    inner = node.ownerDocument.createDocumentFragment();
    inner.appendChild(wrapper);
  }
  node.parentNode.replaceChild(inner, node);
}

function bindInputs(container) {
  const root = container || document;
  root.querySelectorAll("[data-path]").forEach((el) => {
    const path = el.dataset.path;
    const val = getPath(editData, path);
    if (el.contentEditable === "true") {
      el.innerHTML = linkify(val != null ? val : "");
      el.addEventListener("input", () => setPath(editData, path, el.innerHTML));
      el.addEventListener("blur", () => {
        const linkified = linkify(el.innerHTML);
        if (linkified !== el.innerHTML) {
          el.innerHTML = linkified;
          setPath(editData, path, linkified);
          const viewerEl = document.querySelector(
            `#viewer-panel [data-path="${path}"]`,
          );
          if (viewerEl) {
            viewerEl.innerHTML = linkified;
            setPath(CV_DATA, path, linkified);
          }
        }
      });
    } else if (el.type === "checkbox") {
      el.checked = !!val;
      el.addEventListener("change", () => setPath(editData, path, el.checked));
    } else {
      el.value = val != null ? val : "";
      el.addEventListener("input", () => setPath(editData, path, el.value));
    }
  });
}

function mkWysiwyg(path, multiline = true, cls = "") {
  const contentCls = multiline ? "" : " wysiwyg-inline";
  const listBtns = multiline
    ? `
                <div class="wysiwyg-sep"></div>
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();document.execCommand('insertUnorderedList')" title="Liste à puces">• ≡</button>
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();document.execCommand('insertOrderedList')" title="Liste numérotée">1. ≡</button>`
    : "";
  return `
        <div class="wysiwyg-wrap${cls ? " " + cls : ""}">
            <div class="wysiwyg-bar">
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();document.execCommand('bold')" title="Gras"><b>B</b></button>
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();document.execCommand('italic')" title="Italique"><i>I</i></button>
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();document.execCommand('underline')" title="Souligné"><u>U</u></button>
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();document.execCommand('strikeThrough')" title="Barré"><s>S</s></button>
                <div class="wysiwyg-sep"></div>
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();openLinkDialog()" title="Insérer / modifier un lien">🔗</button>
                ${listBtns}
                <div class="wysiwyg-sep"></div>
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();document.execCommand('removeFormat')" title="Effacer le style">✕</button>
            </div>
            <div class="wysiwyg-content${contentCls}" contenteditable="true" data-path="${path}"></div>
        </div>
    `;
}

function markViewerEmpty(el) {
  el.classList.toggle("cv-field-empty", !el.textContent.trim());
}

function initLinkClicks() {
  const panel = document.getElementById("viewer-panel");
  if (!panel || panel._linkClicksBound) {
    return;
  }
  panel._linkClicksBound = true;
  panel.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link || !panel.contains(link)) {
      return;
    }
    e.preventDefault();
    window.open(link.href, "_blank", "noopener,noreferrer");
  });
}

function initEditorLinkClicks() {
  const editorContent = document.getElementById("editor-content");
  if (!editorContent || editorContent._linkClicksBound) {
    return;
  }
  editorContent._linkClicksBound = true;
  editorContent.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    openLinkDialog(link);
  });
}

/* ===== LINK DIALOG ===== */
let linkDialogState = {
  targetEditor: null,
  existingAnchor: null,
  savedRange: null,
};

function ensureLinkDialog() {
  if (document.getElementById("link-dialog")) return;
  const dlg = document.createElement("div");
  dlg.id = "link-dialog";
  dlg.innerHTML = `
        <div class="link-dialog-backdrop"></div>
        <div class="link-dialog-panel" role="dialog" aria-modal="true">
            <div class="link-dialog-title" id="link-dialog-title">Insérer un lien</div>
            <label class="link-dialog-label" for="link-dialog-text">Texte à afficher</label>
            <input type="text" class="link-dialog-input" id="link-dialog-text" placeholder="Ex : Mon portfolio">
            <label class="link-dialog-label" for="link-dialog-url">URL</label>
            <input type="text" class="link-dialog-input" id="link-dialog-url" placeholder="https://exemple.com">
            <div class="link-dialog-actions">
                <button class="link-dialog-btn link-dialog-btn-remove" id="link-dialog-remove">Supprimer</button>
                <span class="link-dialog-spacer"></span>
                <button class="link-dialog-btn link-dialog-btn-cancel" id="link-dialog-cancel">Annuler</button>
                <button class="link-dialog-btn link-dialog-btn-ok" id="link-dialog-ok">Insérer</button>
            </div>
        </div>
    `;
  document.body.appendChild(dlg);
  dlg
    .querySelector(".link-dialog-backdrop")
    .addEventListener("click", closeLinkDialog);
  document
    .getElementById("link-dialog-cancel")
    .addEventListener("click", closeLinkDialog);
  document
    .getElementById("link-dialog-ok")
    .addEventListener("click", submitLinkDialog);
  document
    .getElementById("link-dialog-remove")
    .addEventListener("click", removeLinkAndClose);
  [
    document.getElementById("link-dialog-text"),
    document.getElementById("link-dialog-url"),
  ].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitLinkDialog();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeLinkDialog();
      }
    });
  });
}

window.openLinkDialog = function (existingAnchor) {
  ensureLinkDialog();
  const sel = window.getSelection();
  const range =
    sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;

  if (existingAnchor) {
    linkDialogState.targetEditor = existingAnchor.closest(
      '[contenteditable="true"]',
    );
    linkDialogState.existingAnchor = existingAnchor;
    linkDialogState.savedRange = null;
    document.getElementById("link-dialog-text").value =
      existingAnchor.textContent;
    document.getElementById("link-dialog-url").value =
      existingAnchor.getAttribute("href") || "";
    document.getElementById("link-dialog-title").textContent =
      "Modifier le lien";
    document.getElementById("link-dialog-ok").textContent = "Mettre à jour";
    document.getElementById("link-dialog-remove").style.display = "";
  } else {
    const focusEl = range
      ? (range.startContainer.nodeType === 1
          ? range.startContainer
          : range.startContainer.parentElement
        )?.closest('[contenteditable="true"]')
      : null;
    linkDialogState.targetEditor = focusEl;
    linkDialogState.existingAnchor = null;
    linkDialogState.savedRange = range;
    const selectedText = range && !range.collapsed ? range.toString() : "";
    document.getElementById("link-dialog-text").value = selectedText;
    document.getElementById("link-dialog-url").value = "";
    document.getElementById("link-dialog-title").textContent =
      "Insérer un lien";
    document.getElementById("link-dialog-ok").textContent = "Insérer";
    document.getElementById("link-dialog-remove").style.display = "none";
  }

  document.getElementById("link-dialog").classList.add("link-dialog-open");
  setTimeout(() => {
    const textInput = document.getElementById("link-dialog-text");
    const urlInput = document.getElementById("link-dialog-url");
    const target = textInput.value ? urlInput : textInput;
    target.focus();
    target.select();
  }, 0);
};

function closeLinkDialog() {
  const dlg = document.getElementById("link-dialog");
  if (dlg) dlg.classList.remove("link-dialog-open");
  linkDialogState = {
    targetEditor: null,
    existingAnchor: null,
    savedRange: null,
  };
}

function notifyEditorChanged(el) {
  if (!el) return;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function submitLinkDialog() {
  const text = document.getElementById("link-dialog-text").value.trim();
  const url = document.getElementById("link-dialog-url").value.trim();
  if (!url) {
    document.getElementById("link-dialog-url").focus();
    return;
  }
  const href = normalizeHref(url);
  const finalText = text || url;

  if (linkDialogState.existingAnchor) {
    const a = linkDialogState.existingAnchor;
    a.setAttribute("href", href);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
    a.textContent = finalText;
    notifyEditorChanged(linkDialogState.targetEditor);
  } else if (linkDialogState.targetEditor) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = finalText;
    if (linkDialogState.savedRange) {
      const range = linkDialogState.savedRange;
      range.deleteContents();
      range.insertNode(a);
      const after = document.createTextNode("​");
      a.parentNode.insertBefore(after, a.nextSibling);
    } else {
      linkDialogState.targetEditor.appendChild(a);
    }
    notifyEditorChanged(linkDialogState.targetEditor);
  }
  closeLinkDialog();
}

function removeLinkAndClose() {
  if (linkDialogState.existingAnchor) {
    const a = linkDialogState.existingAnchor;
    const text = document.createTextNode(a.textContent);
    a.parentNode.replaceChild(text, a);
    notifyEditorChanged(linkDialogState.targetEditor);
  }
  closeLinkDialog();
}

function bindViewerInputs() {
  const panel = document.getElementById("viewer-panel");
  if (!panel) {
    return;
  }
  panel
    .querySelectorAll('[data-path][contenteditable="true"]')
    .forEach((el) => {
      markViewerEmpty(el);
      if (el._viewerBound) {
        return;
      }
      el._viewerBound = true;
      const path = el.dataset.path;
      const usePlainText = el.dataset.plain != null;
      el.addEventListener("input", () => {
        const v = usePlainText ? el.textContent : el.innerHTML;
        setPath(CV_DATA, path, v);
        setPath(editData, path, v);
        const stack = el.closest(".m-stack");
        if (stack) {
          stack.classList.toggle("m-stack-empty", !el.textContent.trim());
        }
        const contact = el.closest(".cv-contact");
        if (contact) {
          contact.classList.toggle("cv-contact-empty", !el.textContent.trim());
        }
        markViewerEmpty(el);
      });
      el.addEventListener("blur", () => {
        markViewerEmpty(el);
        if (usePlainText) {
          return;
        }
        const linkified = linkify(el.innerHTML);
        if (linkified !== el.innerHTML) {
          el.innerHTML = linkified;
          setPath(CV_DATA, path, linkified);
          setPath(editData, path, linkified);
          const editorEl = document.querySelector(
            `#editor-content [data-path="${path}"]`,
          );
          if (editorEl && editorEl !== el) {
            editorEl.innerHTML = linkified;
          }
        }
      });
    });
}

/* ===== DRAG & DROP ===== */
const DRAG_CONFIGS = {
  skills: {
    arr: () => editData.skills,
    sectionId: "e-skills",
    bodyFn: () => renderSkillsBody(),
  },
  timeline: {
    arr: () => editData.timeline,
    sectionId: "e-timeline",
    bodyFn: () => renderTimelineBody(),
  },
  education: {
    arr: () => editData.education,
    sectionId: "e-education",
    bodyFn: () => renderEducationBody(),
  },
  teaching: {
    arr: () => editData.teaching,
    sectionId: "e-teaching",
    bodyFn: () => renderTeachingBody(),
  },
  languages: {
    arr: () => editData.languages,
    sectionId: "e-languages",
    bodyFn: () => renderLanguagesBody(),
  },
  hobbies: {
    arr: () => editData.hobbies,
    sectionId: "e-hobbies",
    bodyFn: () => renderHobbiesBody(),
  },
  missions: {
    arr: () => editData.missions,
    sectionId: "e-missions",
    bodyFn: () => renderMissionsBody(),
  },
  personal_projects: {
    arr: () => editData.personal_projects,
    sectionId: "e-personal-projects",
    bodyFn: () => renderPersonalProjectsBody(),
  },
  softSkills: {
    arr: () => editData.softSkills,
    sectionId: "e-softskills",
    bodyFn: () => renderSoftSkillsBody(),
  },
};

function resolveDragConfig(key) {
  if (key && key.startsWith("tasks-")) {
    const mi = parseInt(key.slice(6));
    return {
      arr: () => editData.missions[mi].tasks,
      sectionId: "e-missions",
      bodyFn: () => renderMissionsBody(),
    };
  }
  return DRAG_CONFIGS[key];
}

function initDraggable(body) {
  let srcIdx = null;
  let srcKey = null;

  body.querySelectorAll(".drag-handle").forEach((handle) => {
    handle.addEventListener("dragstart", (e) => {
      const item = handle.closest("[data-drag-index]");
      srcIdx = parseInt(item.dataset.dragIndex);
      srcKey = item.dataset.dragKey;
      e.dataTransfer.effectAllowed = "move";
      requestAnimationFrame(() => item.classList.add("dragging"));
    });
    handle.addEventListener("dragend", () => {
      body
        .querySelectorAll("[data-drag-index]")
        .forEach((el) => el.classList.remove("dragging", "drag-over"));
    });
  });

  body.querySelectorAll("[data-drag-index]").forEach((item) => {
    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      body
        .querySelectorAll("[data-drag-index]")
        .forEach((el) => el.classList.remove("drag-over"));
      if (item.dataset.dragKey === srcKey) {
        item.classList.add("drag-over");
      }
    });
    item.addEventListener("dragleave", (e) => {
      if (!item.contains(e.relatedTarget)) {
        item.classList.remove("drag-over");
      }
    });
    item.addEventListener("drop", (e) => {
      e.preventDefault();
      const toIdx = parseInt(item.dataset.dragIndex);
      if (!srcKey || srcKey !== item.dataset.dragKey || srcIdx === toIdx) {
        return;
      }
      const cfg = resolveDragConfig(srcKey);
      const arr = cfg.arr();
      const [moved] = arr.splice(srcIdx, 1);
      arr.splice(toIdx, 0, moved);
      srcIdx = null;
      rebuildSection(cfg.sectionId, cfg.bodyFn);
    });
  });
}

function rebuildSection(id, bodyFn) {
  const body = document.querySelector("#" + id + " .e-section-body");
  body.innerHTML = bodyFn();
  bindInputs(body);
  initDraggable(body);
}

function toggleSection(id) {
  document.getElementById(id).classList.toggle("collapsed");
}

function toggleMission(i) {
  const el = document.getElementById("e-mission-" + i);
  if (el) {
    el.classList.toggle("collapsed");
  }
}

function escHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mkSection(id, icon, title, bodyHtml, visKey = null) {
  const vis = visKey
    ? (editData.visibility || defaultVisibility())[visKey] !== false
    : true;
  const visBtn = visKey
    ? `<button class="e-vis-btn${vis ? "" : " e-vis-off"}" id="e-vis-${visKey}" onclick="event.stopPropagation();toggleCvSection('${visKey}')" title="${vis ? "Masquer la section" : "Afficher la section"}">${vis ? "⊙" : "⊘"}</button>`
    : "";
  return `
        <div class="e-section" id="${id}">
            <div class="e-section-header" onclick="toggleSection('${id}')">
                <span>${icon} ${title}</span>
                <div style="display:flex;align-items:center;gap:6px">
                    ${visBtn}
                    <span class="e-chevron">▾</span>
                </div>
            </div>
            <div class="e-section-body">${bodyHtml}</div>
        </div>
    `;
}

/* --- Section: Identité --- */
function renderPersonalBody() {
  const links = editData.personal.links || [];
  return `
        <div class="e-field">
            <label class="e-label">Nom</label>
            ${mkWysiwyg("personal.name", false)}
        </div>
        <div class="e-field">
            <label class="e-label">Rôle</label>
            ${mkWysiwyg("personal.role", false)}
        </div>
        <div class="e-grid-2">
            <div class="e-field">
                <label class="e-label">Email</label>
                <textarea class="e-input" rows="1" data-path="personal.contacts.email" placeholder="email@example.com"></textarea>
            </div>
            <div class="e-field">
                <label class="e-label">Téléphone</label>
                <textarea class="e-input" rows="1" data-path="personal.contacts.phone" placeholder="+33..."></textarea>
            </div>
        </div>
        <div class="e-field">
            <label class="e-label">Liens</label>
            ${links
              .map(
                (l, i) => `
                <div class="e-row" style="margin-bottom:6px">
                    ${mkWysiwyg(`personal.links.${i}.link`, false, "e-flex")}
                    <textarea class="e-input" rows="1" style="width:100px;flex-shrink:0" data-path="personal.links.${i}.ico" placeholder="emoji ou URL"></textarea>
                    <button class="btn-remove" onclick="removePersonalLink(${i})">−</button>
                </div>
            `,
              )
              .join("")}
            <button class="btn-add" onclick="addPersonalLink()">+ Ajouter un lien</button>
        </div>
    `;
}
function renderPersonal() {
  return mkSection("e-personal", "👤", "Identité", renderPersonalBody());
}

/* --- Section: Projets personnels --- */
function renderPersonalProjectsBody() {
  return (
    (editData.personal_projects || [])
      .map(
        (p, i) => `
        <div data-drag-index="${i}" data-drag-key="personal_projects">
            <div class="e-row">
                <span class="drag-handle" draggable="true" title="Réordonner">⠿</span>
                ${mkWysiwyg(`personal_projects.${i}`, false, "e-flex")}
                <button class="btn-remove" onclick="removePersonalProject(${i})">−</button>
            </div>
        </div>
    `,
      )
      .join("") +
    `<button class="btn-add" onclick="addPersonalProject()">+ Ajouter un projet</button>`
  );
}
function renderPersonalProjects() {
  return mkSection(
    "e-personal-projects",
    "🔧",
    "Projets personnels",
    renderPersonalProjectsBody(),
    "personal_projects",
  );
}

/* --- Section: À propos --- */
function renderAboutBody() {
  return `
        <div class="e-field">
            <label class="e-label">Introduction</label>
            ${mkWysiwyg("about.intro")}
        </div>
    `;
}
function renderAbout() {
  return mkSection("e-about", "📝", "À propos", renderAboutBody(), "about");
}

/* --- Section: Compétences --- */
function renderSkillsBody() {
  return (
    editData.skills
      .map(
        (s, i) => `
        <div data-drag-index="${i}" data-drag-key="skills" style="margin-bottom:10px">
            <div class="e-row" style="align-items:flex-start">
                <span class="drag-handle" draggable="true" title="Réordonner">⠿</span>
                <div class="e-flex">
                    <div class="e-field">
                        <label class="e-label">Catégorie</label>
                        ${mkWysiwyg(`skills.${i}.label`, false)}
                    </div>
                    <div class="e-field" style="margin-bottom:0">
                        <label class="e-label">Éléments</label>
                        ${mkWysiwyg(`skills.${i}.items`, false)}
                    </div>
                </div>
                <button class="btn-remove" style="margin-top:22px" onclick="removeSkill(${i})">−</button>
            </div>
        </div>
        ${i < editData.skills.length - 1 ? '<div class="e-sep"></div>' : ""}
    `,
      )
      .join("") +
    `<button class="btn-add" onclick="addSkill()">+ Ajouter une compétence</button>`
  );
}
function renderSkills() {
  return mkSection(
    "e-skills",
    "🎯",
    "Compétences",
    renderSkillsBody(),
    "skills",
  );
}

/* --- Section: Timeline --- */
function renderTimelineBody() {
  return (
    editData.timeline
      .map(
        (t, i) => `
        <div data-drag-index="${i}" data-drag-key="timeline" style="margin-bottom:10px">
            <div class="e-row" style="align-items:flex-end; flex-wrap:wrap; gap:8px">
                <span class="drag-handle" draggable="true" title="Réordonner" style="padding-bottom:2px">⠿</span>
                <div style="flex:1; min-width:80px">
                    <label class="e-label">Année</label>
                    ${mkWysiwyg(`timeline.${i}.year`, false)}
                </div>
                <div style="flex:2; min-width:140px">
                    <label class="e-label">Label</label>
                    ${mkWysiwyg(`timeline.${i}.label`, false)}
                </div>
                <div style="display:flex; gap:12px; padding-bottom:2px">
                    <label class="e-check-row">
                        <input type="checkbox" data-path="timeline.${i}.alt">
                        Alt
                    </label>
                    <label class="e-check-row">
                        <input type="checkbox" data-path="timeline.${i}.current">
                        Actuel
                    </label>
                </div>
                <button class="btn-remove" onclick="removeTimeline(${i})">−</button>
            </div>
        </div>
        ${i < editData.timeline.length - 1 ? '<div class="e-sep"></div>' : ""}
    `,
      )
      .join("") +
    `<button class="btn-add" onclick="addTimeline()">+ Ajouter une étape</button>`
  );
}
function renderTimeline() {
  return mkSection(
    "e-timeline",
    "📅",
    "Timeline",
    renderTimelineBody(),
    "timeline",
  );
}

/* --- Section: Formation --- */
function renderEducationBody() {
  return (
    editData.education
      .map(
        (e, i) => `
        <div data-drag-index="${i}" data-drag-key="education" style="margin-bottom:10px">
            <div class="e-row" style="align-items:flex-start; gap:4px">
                <span class="drag-handle" draggable="true" title="Réordonner" style="margin-top:24px">⠿</span>
                <div style="flex:1">
                    <div class="e-grid-2">
                        <div class="e-field">
                            <label class="e-label">Période</label>
                            ${mkWysiwyg(`education.${i}.years`, false)}
                        </div>
                        <div class="e-field">
                            <label class="e-label">Diplôme</label>
                            ${mkWysiwyg(`education.${i}.degree`, false)}
                        </div>
                    </div>
                    <div class="e-row">
                        <div class="e-field e-flex" style="margin-bottom:0">
                            <label class="e-label">Établissement</label>
                            ${mkWysiwyg(`education.${i}.org`, false, "e-flex")}
                        </div>
                        <button class="btn-remove" style="margin-top:18px" onclick="removeEducation(${i})">−</button>
                    </div>
                </div>
            </div>
        </div>
        ${i < editData.education.length - 1 ? '<div class="e-sep"></div>' : ""}
    `,
      )
      .join("") +
    `<button class="btn-add" onclick="addEducation()">+ Ajouter une formation</button>`
  );
}
function renderEducation() {
  return mkSection(
    "e-education",
    "🎓",
    "Formations",
    renderEducationBody(),
    "education",
  );
}

/* --- Section: Enseignement --- */
function renderTeachingBody() {
  return (
    editData.teaching
      .map(
        (t, i) => `
        <div data-drag-index="${i}" data-drag-key="teaching" style="margin-bottom:10px">
            <div class="e-row" style="align-items:flex-start; gap:4px">
                <span class="drag-handle" draggable="true" title="Réordonner" style="margin-top:24px">⠿</span>
                <div style="flex:1">
                    <div class="e-grid-2">
                        <div class="e-field">
                            <label class="e-label">Période</label>
                            ${mkWysiwyg(`teaching.${i}.years`, false)}
                        </div>
                        <div class="e-field">
                            <label class="e-label">Intitulé</label>
                            ${mkWysiwyg(`teaching.${i}.degree`, false)}
                        </div>
                    </div>
                    <div class="e-row">
                        <div class="e-field e-flex" style="margin-bottom:0">
                            <label class="e-label">Organisation</label>
                            ${mkWysiwyg(`teaching.${i}.org`, false, "e-flex")}
                        </div>
                        <button class="btn-remove" style="margin-top:18px" onclick="removeTeaching(${i})">−</button>
                    </div>
                </div>
            </div>
        </div>
        ${i < editData.teaching.length - 1 ? '<div class="e-sep"></div>' : ""}
    `,
      )
      .join("") +
    `<button class="btn-add" onclick="addTeaching()">+ Ajouter un enseignement</button>`
  );
}
function renderTeaching() {
  return mkSection(
    "e-teaching",
    "📚",
    "Enseignement",
    renderTeachingBody(),
    "teaching",
  );
}

/* --- Section: Langues --- */
function renderLanguagesBody() {
  return (
    editData.languages
      .map(
        (_, i) => `
        <div data-drag-index="${i}" data-drag-key="languages">
            <div class="e-row">
                <span class="drag-handle" draggable="true" title="Réordonner">⠿</span>
                ${mkWysiwyg(`languages.${i}`, false, "e-flex")}
                <button class="btn-remove" onclick="removeLanguage(${i})">−</button>
            </div>
        </div>
    `,
      )
      .join("") +
    `<button class="btn-add" onclick="addLanguage()">+ Ajouter une langue</button>`
  );
}
function renderLanguages() {
  return mkSection(
    "e-languages",
    "🌍",
    "Langues",
    renderLanguagesBody(),
    "languages",
  );
}

/* --- Section: Hobbies --- */
function renderHobbiesBody() {
  return (
    editData.hobbies
      .map(
        (_, i) => `
        <div data-drag-index="${i}" data-drag-key="hobbies">
            <div class="e-row">
                <span class="drag-handle" draggable="true" title="Réordonner">⠿</span>
                ${mkWysiwyg(`hobbies.${i}`, false, "e-flex")}
                <button class="btn-remove" onclick="removeHobby(${i})">−</button>
            </div>
        </div>
    `,
      )
      .join("") +
    `<button class="btn-add" onclick="addHobby()">+ Ajouter un hobby</button>`
  );
}

function renderSoftSkillsBody() {
  return (
    editData.softSkills
      .map(
        (_, i) => `
        <div data-drag-index="${i}" data-drag-key="softSkills">
            <div class="e-row">
                <span class="drag-handle" draggable="true" title="Réordonner">⠿</span>
                ${mkWysiwyg(`softSkills.${i}`, false, "e-flex")}
                <button class="btn-remove" onclick="removeSoftSkill(${i})">−</button>
            </div>
        </div>
    `,
      )
      .join("") +
    `<button class="btn-add" onclick="addSoftSkill()">+ Ajouter un soft skill</button>`
  );
}

function renderHobbies() {
  return mkSection(
    "e-hobbies",
    "🎮",
    "Hobbies",
    renderHobbiesBody(),
    "hobbies",
  );
}

function renderSoftSkills() {
  return mkSection(
    "e-softskills",
    "🎮",
    "Soft Skills",
    renderSoftSkillsBody(),
    "soft_skills",
  );
}

/* --- Section: Missions --- */
function renderMissionsBody() {
  return (
    editData.missions
      .map(
        (m, i) => `
        <div class="e-mission" id="e-mission-${i}" data-drag-index="${i}" data-drag-key="missions">
            <div class="e-mission-header" onclick="toggleMission(${i})">
                <span class="drag-handle" draggable="true" title="Réordonner" onclick="event.stopPropagation()">⠿</span>
                <span><span class="e-chevron">▾</span> ${escHtml(m.client) || "<em>Nouvelle mission</em>"}</span>
                <button class="btn-remove" onclick="event.stopPropagation(); removeMission(${i})">🗑 Supprimer</button>
            </div>
            <div class="e-mission-body">
                <div class="e-grid-2">
                    <div class="e-field">
                        <label class="e-label">Période</label>
                        ${mkWysiwyg(`missions.${i}.dates`, false)}
                    </div>
                    <div class="e-field">
                        <label class="e-label">Client</label>
                        ${mkWysiwyg(`missions.${i}.client`, false)}
                    </div>
                </div>
                <div class="e-field">
                    <label class="e-label">Rôle</label>
                    ${mkWysiwyg(`missions.${i}.role`, false)}
                </div>
                <div class="e-field">
                    <label class="e-label">Résumé</label>
                    ${mkWysiwyg(`missions.${i}.summary`)}
                </div>
                <div class="e-field">
                    <label class="e-label">Tâches</label>
                    ${m.tasks
                      .map(
                        (t, j) => `
                        <div class="e-row" style="margin-bottom:6px" data-drag-index="${j}" data-drag-key="tasks-${i}">
                            <span class="drag-handle" draggable="true" title="Réordonner">⠿</span>
                            ${mkWysiwyg(`missions.${i}.tasks.${j}.label`, false, "e-flex")}
                            ${mkWysiwyg(`missions.${i}.tasks.${j}.desc`, false, "e-flex")}
                            <button class="btn-remove" onclick="removeTask(${i}, ${j})">−</button>
                        </div>
                    `,
                      )
                      .join("")}
                    <button class="btn-add" onclick="addTask(${i})">+ Ajouter une tâche</button>
                </div>
                <div class="e-field">
                    <label class="e-label">Logo client</label>
                    <div class="e-logo-ed">
                        <div class="e-logo-preview">${m.logo ? renderLogoHtml(m.logo) : '<span class="e-logo-empty">Aucun</span>'}</div>
                        <div class="e-logo-btns">
                            <button class="btn-sm" onclick="edLogoUpload(${i})">📁 Image</button>
                            <button class="btn-sm" onclick="edLogoUrl(${i})">🔗 URL</button>
                            <button class="btn-sm" onclick="edLogoSvg(${i})">✏ SVG</button>
                            ${m.logo ? `<button class="btn-sm btn-sm-del" onclick="edLogoRemove(${i})">✕</button>` : ""}
                        </div>
                    </div>
                    <div class="e-logo-url-wrap" id="e-logo-url-wrap-${i}" style="display:none">
                        <input class="e-input" id="e-logo-url-input-${i}" placeholder="https://example.com/logo.png" style="margin-top:6px">
                        <button class="btn-add" onclick="edLogoApplyUrl(${i})">Appliquer</button>
                    </div>
                    <div class="e-logo-svg-wrap" id="e-logo-svg-wrap-${i}" style="display:none">
                        <textarea class="e-logo-svg-area" id="e-logo-svg-area-${i}" placeholder="Coller le code SVG ici…"></textarea>
                        <button class="btn-add" onclick="edLogoApplySvg(${i})">Appliquer</button>
                    </div>
                </div>
                <div class="e-field" style="margin-bottom:0">
                    <label class="e-label">Stack</label>
                    ${mkWysiwyg(`missions.${i}.stack`, false)}
                </div>
            </div>
        </div>
    `,
      )
      .join("") +
    `<button class="btn-add" style="margin-top:4px" onclick="addMission()">+ Ajouter une mission</button>`
  );
}
function renderMissions() {
  return mkSection(
    "e-missions",
    "💼",
    "Missions",
    renderMissionsBody(),
    "missions",
  );
}

/* --- Build complet --- */
function buildEditor() {
  const content = document.getElementById("editor-content");
  content.innerHTML = [
    renderPersonal(),
    renderAbout(),
    renderSkills(),
    renderTimeline(),
    renderEducation(),
    renderTeaching(),
    renderLanguages(),
    renderSoftSkills(),
    renderHobbies(),
    renderPersonalProjects(),
    renderMissions(),
  ].join("");
  bindInputs(content);
  content.querySelectorAll(".e-section-body").forEach(initDraggable);
}

/* ===== ADD / REMOVE ===== */
function addExpertise() {
  editData.about.expertise.push("");
  rebuildSection("e-about", renderAboutBody);
}
function removeExpertise(i) {
  editData.about.expertise.splice(i, 1);
  rebuildSection("e-about", renderAboutBody);
}

function addSkill() {
  editData.skills.push({ label: "", items: "" });
  rebuildSection("e-skills", renderSkillsBody);
}
function removeSkill(i) {
  editData.skills.splice(i, 1);
  rebuildSection("e-skills", renderSkillsBody);
}

function addTimeline() {
  editData.timeline.push({ year: "", label: "", alt: false, current: false });
  rebuildSection("e-timeline", renderTimelineBody);
}
function removeTimeline(i) {
  editData.timeline.splice(i, 1);
  rebuildSection("e-timeline", renderTimelineBody);
}

function addEducation() {
  editData.education.push({ years: "", degree: "", org: "" });
  rebuildSection("e-education", renderEducationBody);
}
function removeEducation(i) {
  editData.education.splice(i, 1);
  rebuildSection("e-education", renderEducationBody);
}

function addTeaching() {
  editData.teaching.push({ years: "", degree: "", org: "" });
  rebuildSection("e-teaching", renderTeachingBody);
}
function removeTeaching(i) {
  editData.teaching.splice(i, 1);
  rebuildSection("e-teaching", renderTeachingBody);
}

function addLanguage() {
  editData.languages.push("");
  rebuildSection("e-languages", renderLanguagesBody);
}
function removeLanguage(i) {
  editData.languages.splice(i, 1);
  rebuildSection("e-languages", renderLanguagesBody);
}

function addHobby() {
  editData.hobbies.push("");
  rebuildSection("e-hobbies", renderHobbiesBody);
}
function removeHobby(i) {
  editData.hobbies.splice(i, 1);
  rebuildSection("e-hobbies", renderHobbiesBody);
}

function addSoftSkill() {
  editData.softSkills.push("");
  rebuildSection("e-softskills", renderSoftSkillsBody);
}
function removeSoftSkill(i) {
  editData.softSkills.splice(i, 1);
  rebuildSection("e-softskills", renderSoftSkillsBody);
}

function addMission() {
  editData.missions.push({
    dates: "",
    client: "",
    role: "",
    summary: "",
    tasks: [],
    stack: "",
  });
  rebuildSection("e-missions", renderMissionsBody);
}
function removeMission(i) {
  editData.missions.splice(i, 1);
  rebuildSection("e-missions", renderMissionsBody);
}

function addTask(mi) {
  editData.missions[mi].tasks.push({ label: "" });
  rebuildSection("e-missions", renderMissionsBody);
}
function removeTask(mi, ti) {
  editData.missions[mi].tasks.splice(ti, 1);
  rebuildSection("e-missions", renderMissionsBody);
}

function addPersonalLink() {
  if (!editData.personal.links) {
    editData.personal.links = [];
  }
  editData.personal.links.push({ link: "", ico: "" });
  rebuildSection("e-personal", renderPersonalBody);
}
function removePersonalLink(i) {
  editData.personal.links.splice(i, 1);
  rebuildSection("e-personal", renderPersonalBody);
}

function addPersonalProject() {
  if (!editData.personal_projects) {
    editData.personal_projects = [];
  }
  editData.personal_projects.push("");
  rebuildSection("e-personal-projects", renderPersonalProjectsBody);
}
function removePersonalProject(i) {
  editData.personal_projects.splice(i, 1);
  rebuildSection("e-personal-projects", renderPersonalProjectsBody);
}

/* ===== URL ROUTING ===== */
function buildModeUrl(mode) {
  const params = new URLSearchParams(location.search);
  if (mode === "edit") {
    params.set("mode", "edit");
  } else {
    params.delete("mode");
  }
  const qs = params.toString();
  return location.pathname + (qs ? "?" + qs : "");
}

/* ===== MODE SWITCH ===== */
function cloneLogos() {
  const src = document.querySelector("#viewer-panel .proxym-logo svg");
  if (!src) {
    return;
  }
  document.querySelectorAll(".logo-clone").forEach((el, i) => {
    el.innerHTML = "";
    const clone = src.cloneNode(true);
    const suffix = "_vc" + i;
    clone.querySelectorAll("[id]").forEach((node) => {
      const oldId = node.id;
      node.id = oldId + suffix;
      clone.querySelectorAll('[mask="url(#' + oldId + ')"]').forEach((ref) => {
        ref.setAttribute("mask", "url(#" + oldId + suffix + ")");
      });
    });
    el.appendChild(clone);
  });
}

function togglePanels(mode) {
  const editorPanel = document.getElementById("editor-panel");
  const viewerPanel = document.getElementById("viewer-panel");
  const btnEdit = document.getElementById("btn-edit");
  const btnView = document.getElementById("btn-view");
  if (mode === "viewer") {
    editorPanel.style.display = "none";
    viewerPanel.style.display = "";
    btnEdit.classList.remove("active");
    btnView.classList.add("active");
  } else {
    editorPanel.style.display = "";
    viewerPanel.style.display = "none";
    btnEdit.classList.add("active");
    btnView.classList.remove("active");
  }
}

function switchToView(skipHistory = false) {
  if (currentMode === "viewer") {
    return;
  }
  CV_DATA = deepCopy(editData);
  ["cv-page1", "cv-page2"].forEach((tag) => {
    const el = document.querySelector("#viewer-panel " + tag);
    if (el) {
      el.data = CV_DATA;
    }
  });
  cloneLogos();
  bindViewerInputs();
  togglePanels("viewer");
  currentMode = "viewer";
  if (!skipHistory) {
    history.pushState({ mode: "view" }, "", buildModeUrl("view"));
  }
}

function switchToEdit(skipHistory = false) {
  if (currentMode === "editor") {
    return;
  }
  editData = deepCopy(CV_DATA);
  buildEditor();
  togglePanels("editor");
  currentMode = "editor";
  if (!skipHistory) {
    history.pushState({ mode: "edit" }, "", buildModeUrl("edit"));
  }
}

function toggleCvSection(key) {
  if (!CV_DATA.visibility) {
    CV_DATA.visibility = defaultVisibility();
  }
  CV_DATA.visibility[key] = !CV_DATA.visibility[key];
  editData.visibility = { ...CV_DATA.visibility };
  const visible = CV_DATA.visibility[key];
  if (key === "missions") {
    const el = document.querySelector("#viewer-panel cv-page2");
    if (el) {
      el.style.display = visible ? "" : "none";
    }
  } else {
    const el = document.getElementById("cv-sect-" + key);
    if (el) {
      el.classList.toggle("cv-sect-hidden", !visible);
      const btn = el.querySelector(".sect-eye");
      if (btn) {
        btn.textContent = visible ? "⊙" : "⊘";
      }
    }
  }
  const cb = document.querySelector(`#sections-panel [data-key="${key}"]`);
  if (cb) {
    cb.checked = visible;
  }
  const edBtn = document.getElementById("e-vis-" + key);
  if (edBtn) {
    edBtn.textContent = visible ? "⊙" : "⊘";
    edBtn.classList.toggle("e-vis-off", !visible);
    edBtn.title = visible ? "Masquer la section" : "Afficher la section";
  }
}

function toggleSectionsPanel() {
  const panel = document.getElementById("sections-panel");
  const btn = document.getElementById("btn-sections");
  const isOpen = panel.style.display !== "none";
  panel.style.display = isOpen ? "none" : "";
  btn.classList.toggle("active", !isOpen);
}

function initSectionsPanel() {
  const vis = CV_DATA.visibility || defaultVisibility();
  Object.keys(vis).forEach((key) => {
    const cb = document.querySelector(`#sections-panel [data-key="${key}"]`);
    if (cb) {
      cb.checked = vis[key];
    }
  });
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(editData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cv-data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importJSON() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        CV_DATA = parsed;
        editData = deepCopy(CV_DATA);
        if (currentMode === "viewer") {
          ["cv-page1", "cv-page2"].forEach((tag) => {
            const el = document.querySelector("#viewer-panel " + tag);
            if (el) {
              el.data = CV_DATA;
            }
          });
          cloneLogos();
          bindViewerInputs();
        } else {
          buildEditor();
        }
      } catch {
        alert("Fichier JSON invalide.");
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

async function loadBlank() {
  if (
    !confirm(
      "Charger un CV vierge ? Les données non sauvegardées seront perdues.",
    )
  ) {
    return;
  }
  const resp = await fetch(
    new URL("./resources/cv-blank.json", import.meta.url),
  );
  const blank = await resp.json();
  CV_DATA = blank;
  editData = deepCopy(CV_DATA);
  if (currentMode === "viewer") {
    ["cv-page1", "cv-page2"].forEach((tag) => {
      const el = document.querySelector("#viewer-panel " + tag);
      if (el) {
        el.data = CV_DATA;
      }
    });
    cloneLogos();
    bindViewerInputs();
  } else {
    buildEditor();
  }
}

async function toggleLang() {
  const newLang = (CV_DATA.lang || "fr") === "fr" ? "en" : "fr";
  const params = new URLSearchParams(location.search);
  const name = params.get("name");

  if (name) {
    if (newLang === "en") {
      const enName = name.replace(/\.json$/, "-en.json");
      let loaded = false;
      try {
        const resp = await fetch(
          new URL(`./resources/${enName}`, import.meta.url),
        );
        if (resp.ok) {
          const data = await resp.json();
          CV_DATA = data;
          editData = deepCopy(CV_DATA);
          loaded = true;
        }
      } catch (error) {
        console.log("A problem occured", error);
      }
      if (!loaded) {
        const proceed = confirm(
          `${enName} introuvable — voulez-vous charger le CV en anglais en gardant le contenu en français quand même ?`,
        );
        if (!proceed) {
          return;
        }
      }
    } else {
      const frName = name.replace(/-en\.json$/, ".json");
      try {
        const resp = await fetch(
          new URL(`./resources/${frName}`, import.meta.url),
        );
        if (resp.ok) {
          const data = await resp.json();
          CV_DATA = data;
          editData = deepCopy(CV_DATA);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  CV_DATA.lang = newLang;
  editData.lang = newLang;
  const btn = document.getElementById("btn-lang");
  if (btn) {
    btn.textContent = newLang === "fr" ? "🌐 FR" : "🌐 EN";
  }
  if (currentMode === "viewer") {
    ["cv-page1", "cv-page2"].forEach((tag) => {
      const el = document.querySelector("#viewer-panel " + tag);
      if (el) {
        el.data = CV_DATA;
      }
    });
    cloneLogos();
    bindViewerInputs();
  }
}

function saveToLocalStorage() {
  localStorage.setItem(LS_KEY, JSON.stringify(editData));
  const btn = document.getElementById("btn-save-group");
  btn.textContent = "✓ Sauvegardé";
  setTimeout(() => {
    btn.textContent = "💾 Sauvegarder ▾";
  }, 1500);
  document.getElementById("save-panel").style.display = "none";
  btn.classList.remove("active");
}

function clearLocalStorage() {
  if (
    !confirm(
      "Vider le cache supprimera les données sauvegardées dans ce navigateur. Le CV par défaut sera rechargé. Continuer ?",
    )
  ) {
    return;
  }
  localStorage.removeItem(LS_KEY);
  location.reload();
}

function toggleJsonPanel() {
  const panel = document.getElementById("json-panel");
  const btn = document.getElementById("btn-json");
  const isOpen = panel.style.display !== "none";
  panel.style.display = isOpen ? "none" : "";
  btn.classList.toggle("active", !isOpen);
}

function toggleSavePanel() {
  const panel = document.getElementById("save-panel");
  const btn = document.getElementById("btn-save-group");
  const isOpen = panel.style.display !== "none";
  panel.style.display = isOpen ? "none" : "";
  btn.classList.toggle("active", !isOpen);
}

/* ===== LOGO POPOVER (viewer) ===== */
let _lpMissionIdx = null;

function openLogoPopover(idx, anchor) {
  _lpMissionIdx = idx;
  const pop = document.getElementById("logo-popover");
  if (!pop) {
    return;
  }
  const logo = CV_DATA.missions[idx]?.logo || "";
  document.getElementById("lp-preview").innerHTML = logo
    ? renderLogoHtml(logo)
    : '<span class="lp-empty">Aucun logo</span>';
  document.getElementById("lp-del").style.display = logo ? "" : "none";
  document.getElementById("lp-svg-area").style.display = "none";
  document.getElementById("lp-svg-input").value = logo.trim().startsWith("<svg")
    ? logo
    : "";
  const rect = anchor.getBoundingClientRect();
  pop.style.left =
    Math.max(4, Math.min(rect.left, window.innerWidth - 290)) + "px";
  pop.style.top = rect.bottom + 6 + "px";
  pop.classList.add("visible");
}

function lpToggleUrl() {
  const area = document.getElementById("lp-url-area");
  area.style.display = area.style.display === "none" ? "flex" : "none";
}

function lpApplyUrl() {
  const val = document.getElementById("lp-url-input").value.trim();
  if (val) {
    lpApplyLogo(val);
  }
}

function lpToggleSvg() {
  const area = document.getElementById("lp-svg-area");
  area.style.display = area.style.display === "none" ? "" : "none";
}

function lpApplySvg() {
  const val = document.getElementById("lp-svg-input").value.trim();
  if (val.startsWith("<svg")) {
    lpApplyLogo(val);
  }
}

function lpApplyLogo(logo) {
  if (_lpMissionIdx === null) {
    return;
  }
  CV_DATA.missions[_lpMissionIdx].logo = logo;
  if (editData.missions[_lpMissionIdx]) {
    editData.missions[_lpMissionIdx].logo = logo;
  }
  const nodes = document.querySelectorAll("#viewer-panel cv-mission");
  if (nodes[_lpMissionIdx]) {
    nodes[_lpMissionIdx].render(CV_DATA.missions[_lpMissionIdx], _lpMissionIdx);
  }
  bindViewerInputs();
  document.getElementById("lp-preview").innerHTML = logo
    ? renderLogoHtml(logo)
    : '<span class="lp-empty">Aucun logo</span>';
  document.getElementById("lp-del").style.display = logo ? "" : "none";
}

function lpRemove() {
  lpApplyLogo("");
}

/* ===== LOGO ÉDITEUR ===== */
let _edLogoIdx = null;

function edLogoUpload(i) {
  _edLogoIdx = i;
  document.getElementById("ed-logo-file-input").click();
}

function edLogoUrl(i) {
  const wrap = document.getElementById("e-logo-url-wrap-" + i);
  if (wrap) {
    wrap.style.display = wrap.style.display === "none" ? "" : "none";
  }
}

function edLogoApplyUrl(i) {
  const val = (
    document.getElementById("e-logo-url-input-" + i)?.value || ""
  ).trim();
  if (!val) {
    return;
  }
  editData.missions[i].logo = val;
  rebuildSection("e-missions", renderMissionsBody);
}

function edLogoSvg(i) {
  const wrap = document.getElementById("e-logo-svg-wrap-" + i);
  if (wrap) {
    wrap.style.display = wrap.style.display === "none" ? "" : "none";
  }
}

function edLogoApplySvg(i) {
  const val = (
    document.getElementById("e-logo-svg-area-" + i)?.value || ""
  ).trim();
  if (!val.startsWith("<svg")) {
    return;
  }
  editData.missions[i].logo = val;
  rebuildSection("e-missions", renderMissionsBody);
}

function edLogoRemove(i) {
  editData.missions[i].logo = "";
  rebuildSection("e-missions", renderMissionsBody);
}

function initLogoHandlers() {
  const lpFile = document.createElement("input");
  lpFile.type = "file";
  lpFile.accept = "image/*";
  lpFile.id = "lp-file-input";
  lpFile.style.display = "none";

  const edFile = document.createElement("input");
  edFile.type = "file";
  edFile.accept = "image/*";
  edFile.id = "ed-logo-file-input";
  edFile.style.display = "none";

  document.body.append(lpFile, edFile);

  lpFile.addEventListener("change", async () => {
    if (!lpFile.files[0]) {
      return;
    }
    lpApplyLogo(await compressImage(lpFile.files[0]));
    lpFile.value = "";
  });

  edFile.addEventListener("change", async () => {
    if (!edFile.files[0] || _edLogoIdx === null) {
      return;
    }
    editData.missions[_edLogoIdx].logo = await compressImage(edFile.files[0]);
    rebuildSection("e-missions", renderMissionsBody);
    edFile.value = "";
  });

  const pop = document.createElement("div");
  pop.id = "logo-popover";
  pop.innerHTML = `
        <div class="lp-preview" id="lp-preview"></div>
        <div class="lp-actions">
            <button class="lp-btn" onclick="document.getElementById('lp-file-input').click()">📁 Image</button>
            <button class="lp-btn" onclick="lpToggleUrl()">🔗 URL</button>
            <button class="lp-btn" onclick="lpToggleSvg()">✏ SVG</button>
            <button class="lp-btn lp-btn-del" id="lp-del" onclick="lpRemove()">✕</button>
        </div>
        <div id="lp-url-area" style="display:none;flex-direction:column;gap:4px">
            <input id="lp-url-input" placeholder="https://example.com/logo.png" style="width:100%;padding:5px 8px;border:1px solid rgba(255,255,255,.1);border-radius:6px;background:rgba(255,255,255,.05);color:#ccc;font-size:11px;box-sizing:border-box">
            <button class="lp-btn" onclick="lpApplyUrl()">Appliquer</button>
        </div>
        <div id="lp-svg-area" style="display:none">
            <textarea id="lp-svg-input" placeholder="Coller le code SVG ici…" rows="4"></textarea>
            <button class="lp-btn" style="margin-top:4px" onclick="lpApplySvg()">Appliquer</button>
        </div>
    `;
  document.body.appendChild(pop);

  document.addEventListener("mousedown", (e) => {
    if (!pop.contains(e.target) && !e.target.closest(".m-logo-area")) {
      pop.classList.remove("visible");
    }
  });
}

function initViewerToolbar() {
  const toolbar = document.createElement("div");
  toolbar.id = "viewer-toolbar";
  toolbar.innerHTML = `
        <button onmousedown="event.preventDefault();document.execCommand('bold')" title="Gras"><b>B</b></button>
        <button onmousedown="event.preventDefault();document.execCommand('italic')" title="Italique"><i>I</i></button>
        <button onmousedown="event.preventDefault();document.execCommand('underline')" title="Souligné"><u>U</u></button>
        <button onmousedown="event.preventDefault();document.execCommand('strikeThrough')" title="Barré"><s>S</s></button>
        <span class="vt-sep"></span>
        <button onmousedown="event.preventDefault();document.execCommand('removeFormat')" title="Effacer le style">✕</button>
    `;
  document.body.appendChild(toolbar);

  const panel = document.getElementById("viewer-panel");
  if (!panel) {
    return;
  }

  panel.addEventListener("focusin", (e) => {
    const el = e.target;
    if (!el.isContentEditable) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const tbH = 34;
    let top = rect.top - tbH - 6;
    if (top < 4) {
      top = rect.bottom + 6;
    }
    toolbar.style.left = Math.max(4, rect.left) + "px";
    toolbar.style.top = top + "px";
    toolbar.classList.add("visible");
  });

  panel.addEventListener("focusout", () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (!active || !active.isContentEditable || !panel.contains(active)) {
        toolbar.classList.remove("visible");
      }
    }, 150);
  });
}

/* ===== INIT ===== */
export function initApp(data) {
  CV_DATA = data;
  if (!CV_DATA.personal.contacts) {
    CV_DATA.personal.contacts = {};
  }
  if (!CV_DATA.personal.links) {
    CV_DATA.personal.links = [];
  }
  if (!CV_DATA.personal_projects) {
    CV_DATA.personal_projects = [];
  }
  if (!CV_DATA.softSkills) {
    CV_DATA.softSkills = [];
  }
  if (!CV_DATA.lang) {
    CV_DATA.lang = "fr";
  }

  // Migration : fusionner expertise[] + conclusion dans about.intro
  if (CV_DATA.about.expertise?.length || CV_DATA.about.conclusion) {
    const parts = [];
    if (CV_DATA.about.intro) {
      parts.push(CV_DATA.about.intro);
    }
    if ((CV_DATA.about.expertise || []).length) {
      parts.push(
        "<ul>" +
          CV_DATA.about.expertise.map((e) => `<li>${e}</li>`).join("") +
          "</ul>",
      );
    }
    if (CV_DATA.about.conclusion) {
      parts.push(`<p>${CV_DATA.about.conclusion}</p>`);
    }
    CV_DATA.about.intro = parts.join("");
    delete CV_DATA.about.expertise;
    delete CV_DATA.about.conclusion;
  }
  editData = deepCopy(CV_DATA);

  ["cv-page1", "cv-page2"].forEach((tag) => {
    const el = document.querySelector("#viewer-panel " + tag);
    if (el) {
      el.data = CV_DATA;
    }
  });

  const btnLang = document.getElementById("btn-lang");
  if (btnLang) {
    btnLang.textContent = CV_DATA.lang === "en" ? "🌐 EN" : "🌐 FR";
  }

  document.addEventListener(
    "paste",
    (e) => {
      e.preventDefault(); // Stop the default paste behavior

      // Get the plain text from the clipboard
      const text = e.clipboardData.getData("text/plain");

      document.execCommand("insertText", false, text);
    },
    true,
  );

  initSectionsPanel();
  document.addEventListener("click", (e) => {
    [
      { panelId: "sections-panel", btnId: "btn-sections" },
      { panelId: "json-panel", btnId: "btn-json" },
      { panelId: "save-panel", btnId: "btn-save-group" },
      { panelId: "theme-panel", btnId: "btn-theme" },
    ].forEach(({ panelId, btnId }) => {
      const panel = document.getElementById(panelId);
      const btn = document.getElementById(btnId);
      if (
        panel &&
        panel.style.display !== "none" &&
        !btn.contains(e.target) &&
        !panel.contains(e.target)
      ) {
        panel.style.display = "none";
        btn.classList.remove("active");
      }
    });
  });
  cloneLogos();
  bindViewerInputs();
  initLinkClicks();
  initEditorLinkClicks();
  initLogoHandlers();
  initViewerToolbar();
  initTheme();
  initProxymLogoToggle();

  // Restore mode from URL and normalize history entry
  const initialMode = new URLSearchParams(location.search).get("mode");
  history.replaceState(
    { mode: initialMode === "edit" ? "edit" : "view" },
    "",
    buildModeUrl(initialMode === "edit" ? "edit" : "view"),
  );
  if (initialMode === "edit") {
    switchToEdit(true);
  }

  // Back/forward navigation
  window.addEventListener("popstate", (e) => {
    const mode =
      e.state?.mode ?? new URLSearchParams(location.search).get("mode");
    if (mode === "edit") {
      switchToEdit(true);
    } else {
      switchToView(true);
    }
  });
}

/* ===== THÈMES ===== */
const BUILTIN_THEMES = [
  {
    id: "default",
    name: "Violet",
    purple: "#3454e2",
    purpleLight: "#6c67a6",
    yellow: "#facc2a",
    dark: "#2c3e50",
    text: "#2d2d2d",
  },
  {
    id: "blue",
    name: "Bleu",
    purple: "#1976d2",
    purpleLight: "#5e92c7",
    yellow: "#42a5f5",
    dark: "#1a3a5c",
    text: "#263238",
  },
  {
    id: "green",
    name: "Vert",
    purple: "#2e7d32",
    purpleLight: "#66a96a",
    yellow: "#8bc34a",
    dark: "#2e4a3e",
    text: "#2d3b2d",
  },
  {
    id: "orange",
    name: "Orange",
    purple: "#e65100",
    purpleLight: "#c77a4a",
    yellow: "#ffb74d",
    dark: "#4a2c1a",
    text: "#3e2723",
  },
  {
    id: "dark",
    name: "Sombre",
    purple: "#4a4a6a",
    purpleLight: "#6c6c8a",
    yellow: "#9e9e9e",
    dark: "#1a1a2e",
    text: "#212121",
  },
];

let currentThemeId = "default";
let editingThemeId = null;

function getCustomThemes() {
  try {
    return JSON.parse(localStorage.getItem("proxym-cv-custom-themes") || "[]");
  } catch {
    return [];
  }
}

function saveCustomThemes(themes) {
  localStorage.setItem("proxym-cv-custom-themes", JSON.stringify(themes));
}

function getAllThemes() {
  return [...BUILTIN_THEMES, ...getCustomThemes()];
}

function applyThemeVars(theme) {
  const r = document.documentElement;
  if (theme.id === "default") {
    r.removeAttribute("data-theme");
  } else if (BUILTIN_THEMES.some((t) => t.id === theme.id)) {
    r.setAttribute("data-theme", theme.id);
    // builtin themes use CSS [data-theme] rules
  } else {
    // custom theme — set vars inline
    r.removeAttribute("data-theme");
    r.style.setProperty("--purple", theme.purple);
    r.style.setProperty("--purple-light", theme.purpleLight);
    r.style.setProperty("--yellow", theme.yellow);
    r.style.setProperty("--dark", theme.dark);
    r.style.setProperty("--text", theme.text);
  }
}

function clearInlineVars() {
  const r = document.documentElement;
  ["--purple", "--purple-light", "--yellow", "--dark", "--text"].forEach(
    (v) => {
      r.style.removeProperty(v);
    },
  );
}

function setTheme(id) {
  clearInlineVars();
  const theme = getAllThemes().find((t) => t.id === id) || BUILTIN_THEMES[0];
  currentThemeId = theme.id;
  applyThemeVars(theme);
  localStorage.setItem("proxym-cv-theme", theme.id);
  renderThemeList();
}

function renderThemeList() {
  const list = document.getElementById("theme-list");
  if (!list) {
    return;
  }
  list.innerHTML = getAllThemes()
    .map((t) => {
      const isCustom = !BUILTIN_THEMES.some((b) => b.id === t.id);
      const editBtn = isCustom
        ? `<span class="theme-item-edit" onclick="event.stopPropagation();editCustomTheme('${t.id}')">✎</span>`
        : "";
      return `<div class="theme-item${t.id === currentThemeId ? " active" : ""}" onclick="setTheme('${t.id}')">
        <span class="theme-dot" style="background:${t.purple}"></span>
        <span>${t.name}</span>${editBtn}
      </div>`;
    })
    .join("");
}

function toggleThemePanel() {
  const panel = document.getElementById("theme-panel");
  const btn = document.getElementById("btn-theme");
  const isOpen = panel.style.display !== "none";
  panel.style.display = isOpen ? "none" : "";
  btn.classList.toggle("active", !isOpen);
  if (!isOpen) {
    renderThemeList();
  }
}

function openCustomThemeEditor(theme) {
  editingThemeId = theme ? theme.id : null;
  document.getElementById("theme-editor-title").textContent = theme
    ? "Modifier le thème"
    : "Nouveau thème";
  document.getElementById("te-name").value = theme ? theme.name : "";
  document.getElementById("te-purple").value = theme ? theme.purple : "#3454e2";
  document.getElementById("te-purple-light").value = theme
    ? theme.purpleLight
    : "#6c67a6";
  document.getElementById("te-yellow").value = theme ? theme.yellow : "#facc2a";
  document.getElementById("te-dark").value = theme ? theme.dark : "#2c3e50";
  document.getElementById("te-text").value = theme ? theme.text : "#2d2d2d";
  document.getElementById("te-delete").style.display = theme ? "" : "none";
  document.getElementById("theme-editor-modal").style.display = "flex";
}

function editCustomTheme(id) {
  const theme = getCustomThemes().find((t) => t.id === id);
  if (theme) {
    openCustomThemeEditor(theme);
  }
}

function saveCustomTheme() {
  const name = document.getElementById("te-name").value.trim();
  if (!name) {
    return;
  }
  const theme = {
    id: editingThemeId || "custom-" + Date.now(),
    name,
    purple: document.getElementById("te-purple").value,
    purpleLight: document.getElementById("te-purple-light").value,
    yellow: document.getElementById("te-yellow").value,
    dark: document.getElementById("te-dark").value,
    text: document.getElementById("te-text").value,
  };
  const customs = getCustomThemes();
  const idx = customs.findIndex((t) => t.id === theme.id);
  if (idx >= 0) {
    customs[idx] = theme;
  } else {
    customs.push(theme);
  }
  saveCustomThemes(customs);
  document.getElementById("theme-editor-modal").style.display = "none";
  setTheme(theme.id);
}

function deleteCustomTheme() {
  if (!editingThemeId) {
    return;
  }
  const customs = getCustomThemes().filter((t) => t.id !== editingThemeId);
  saveCustomThemes(customs);
  document.getElementById("theme-editor-modal").style.display = "none";
  if (currentThemeId === editingThemeId) {
    setTheme("default");
  } else {
    renderThemeList();
  }
}

function initTheme() {
  const saved = localStorage.getItem("proxym-cv-theme") || "default";
  setTheme(saved);
}

/* ===== TOGGLE LOGO PROXYM ===== */
function toggleProxymLogo(forceVisible) {
  const isHidden =
    forceVisible !== undefined
      ? !forceVisible
      : !document.body.classList.contains("hide-proxym-logo");
  document.body.classList.toggle("hide-proxym-logo", isHidden);
  localStorage.setItem("proxym-cv-hide-logo", isHidden ? "1" : "");
  // sync eye button
  const eye = document.getElementById("logo-eye");
  if (eye) {
    eye.textContent = isHidden ? "⊘" : "⊙";
  }
  // sync wrap visual
  const wrap = document.querySelector(".proxym-logo-wrap");
  if (wrap) {
    wrap.classList.toggle("proxym-logo-hidden", isHidden);
  }
  // sync sections panel checkbox
  const cb = document.getElementById("cb-proxym-logo");
  if (cb) {
    cb.checked = !isHidden;
  }
}

function initProxymLogoToggle() {
  const hidden = localStorage.getItem("proxym-cv-hide-logo") === "1";
  if (hidden) {
    document.body.classList.add("hide-proxym-logo");
    const eye = document.getElementById("logo-eye");
    if (eye) {
      eye.textContent = "⊘";
    }
    const wrap = document.querySelector(".proxym-logo-wrap");
    if (wrap) {
      wrap.classList.add("proxym-logo-hidden");
    }
    const cb = document.getElementById("cb-proxym-logo");
    if (cb) {
      cb.checked = false;
    }
  }
}

/* ===== EXPOSITION GLOBALE (handlers inline HTML) ===== */
window.switchToEdit = switchToEdit;
window.switchToView = switchToView;
window.toggleCvSection = toggleCvSection;
window.toggleSectionsPanel = toggleSectionsPanel;
window.exportJSON = exportJSON;
window.importJSON = importJSON;
window.saveToLocalStorage = saveToLocalStorage;
window.clearLocalStorage = clearLocalStorage;
window.toggleJsonPanel = toggleJsonPanel;
window.toggleSavePanel = toggleSavePanel;
window.toggleSection = toggleSection;
window.toggleMission = toggleMission;
window.openLogoPopover = openLogoPopover;
window.lpToggleUrl = lpToggleUrl;
window.lpApplyUrl = lpApplyUrl;
window.lpToggleSvg = lpToggleSvg;
window.lpApplySvg = lpApplySvg;
window.lpRemove = lpRemove;
window.edLogoUpload = edLogoUpload;
window.edLogoUrl = edLogoUrl;
window.edLogoApplyUrl = edLogoApplyUrl;
window.edLogoSvg = edLogoSvg;
window.edLogoApplySvg = edLogoApplySvg;
window.edLogoRemove = edLogoRemove;
window.addExpertise = addExpertise;
window.removeExpertise = removeExpertise;
window.addSkill = addSkill;
window.removeSkill = removeSkill;
window.addTimeline = addTimeline;
window.removeTimeline = removeTimeline;
window.addEducation = addEducation;
window.removeEducation = removeEducation;
window.addTeaching = addTeaching;
window.removeTeaching = removeTeaching;
window.addLanguage = addLanguage;
window.removeLanguage = removeLanguage;
window.addHobby = addHobby;
window.removeHobby = removeHobby;
window.addMission = addMission;
window.removeMission = removeMission;
window.addTask = addTask;
window.removeTask = removeTask;
window.addPersonalLink = addPersonalLink;
window.removePersonalLink = removePersonalLink;
window.addPersonalProject = addPersonalProject;
window.removePersonalProject = removePersonalProject;
window.addSoftSkill = addSoftSkill;
window.removeSoftSkill = removeSoftSkill;
window.loadBlank = loadBlank;
window.toggleLang = toggleLang;
window.setTheme = setTheme;
window.toggleThemePanel = toggleThemePanel;
window.openCustomThemeEditor = openCustomThemeEditor;
window.editCustomTheme = editCustomTheme;
window.saveCustomTheme = saveCustomTheme;
window.deleteCustomTheme = deleteCustomTheme;
window.toggleProxymLogo = toggleProxymLogo;
