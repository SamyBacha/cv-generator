import { applyStyles, defaultVisibility, linkify, t } from "./tools.js";
import { getTemplate, DEFAULT_TEMPLATE } from "./templates/index.js";
import "./cv-section.js";
import "./cv-entry-list.js";
import "./cv-simple-list.js";
import "./cv-about.js";
import "./cv-skills.js";
import "./cv-timeline.js";
import "./cv-links.js";

export class CvPage1 extends HTMLElement {
  set data(d) {
    this._data = d;
    this._render();
  }

  _render() {
    applyStyles(this);
    const d = this._data;
    if (!d) {
      return;
    }
    const vis = d.visibility || defaultVisibility();
    const lang = d.lang || "fr";
    const template = getTemplate(d.template || DEFAULT_TEMPLATE);
    this.dataset.layout = template.layout;

    const columnsHtml = template.columns
      .map((col) => {
        const sectionsHtml = col.sections
          .map((key) => renderSection(key, d, vis, lang, col.side))
          .filter(Boolean)
          .join("");
        return `<div class="${col.class}">${sectionsHtml}</div>`;
      })
      .join("");

    this.innerHTML = `
      ${columnsHtml}
      <div class="proxym-logo-wrap">
        <div class="proxym-logo"></div>
        <button class="sect-eye" id="logo-eye" onclick="toggleProxymLogo()" title="Masquer/afficher le logo Proxym">⊙</button>
      </div>
    `;

    bindSectionData(this, d);

    const tpl = document.getElementById("proxym-logo-tpl");
    if (tpl) {
      this.querySelector(".proxym-logo").appendChild(
        tpl.content.cloneNode(true),
      );
    }

    requestAnimationFrame(() => this._addPageBreakMarkers());
  }

  _addPageBreakMarkers() {
    this.querySelectorAll(".page-break-marker").forEach((m) => m.remove());
    const PAGE_H_PX = 297 * 3.7795275591;
    const totalH = this.scrollHeight;
    for (let y = PAGE_H_PX; y < totalH; y += PAGE_H_PX) {
      const marker = document.createElement("div");
      marker.className = "page-break-marker";
      marker.style.cssText = `position:absolute;left:0;right:0;top:${Math.round(y)}px;pointer-events:none;z-index:50;border-top:2px dashed rgba(220,50,50,0.55);`;
      const label = document.createElement("span");
      label.textContent = "— coupure de page —";
      label.style.cssText =
        "position:absolute;left:50%;transform:translateX(-50%);top:-9px;font-size:10px;color:rgba(220,50,50,0.7);background:white;padding:0 6px;font-family:monospace;white-space:nowrap;";
      marker.appendChild(label);
      this.appendChild(marker);
    }
  }
}

function renderSection(key, d, vis, lang, side) {
  const sideAttr = side && side !== "left" ? ` side="${side}"` : "";
  const label = t(key, lang);
  switch (key) {
    case "profile":
      return renderProfileBlock(d);
    case "about":
      return `<cv-section label="${label}" vis-key="about" visible="${vis.about}"${sideAttr}><cv-about></cv-about></cv-section>`;
    case "skills":
      return `<cv-section label="${label}" vis-key="skills" visible="${vis.skills}"${sideAttr}><cv-skills></cv-skills></cv-section>`;
    case "timeline":
      return `<cv-section label="${label}" vis-key="timeline" visible="${vis.timeline}"${sideAttr}><cv-timeline></cv-timeline></cv-section>`;
    case "education":
      return `<cv-section label="${label}" vis-key="education" visible="${vis.education}"${sideAttr}><cv-entry-list data-for="education"></cv-entry-list></cv-section>`;
    case "teaching":
      return `<cv-section label="${label}" vis-key="teaching" visible="${vis.teaching}"${sideAttr}><cv-entry-list data-for="teaching"></cv-entry-list></cv-section>`;
    case "languages":
      return `<cv-section label="${label}" vis-key="languages" visible="${vis.languages}"${sideAttr}><cv-simple-list data-for="languages"></cv-simple-list></cv-section>`;
    case "hobbies":
      return `<cv-section label="${label}" vis-key="hobbies" visible="${vis.hobbies}"${sideAttr}><cv-simple-list data-for="hobbies"></cv-simple-list></cv-section>`;
    case "soft_skills":
      if (!d.softSkills?.length) {
        return "";
      }
      return `<cv-section label="${label}" vis-key="soft_skills" visible="${vis.soft_skills !== false}"${sideAttr}><cv-simple-list data-for="soft_skills"></cv-simple-list></cv-section>`;
    case "personal_projects":
      if (!d.personal_projects?.length) {
        return "";
      }
      return `<cv-section label="${label}" vis-key="personal_projects" visible="${vis.personal_projects !== false}"${sideAttr}><cv-simple-list data-for="personal_projects"></cv-simple-list></cv-section>`;
    default:
      return "";
  }
}

function renderProfileBlock(d) {
  const hasLinks = d.personal.links?.length;
  return `
    <div class="profile-block">
      <div class="cv-name" contenteditable="true" data-path="personal.name">${d.personal.name}</div>
      <div class="cv-post" contenteditable="true" data-path="personal.role">${d.personal.role}</div>
      <div class="cv-contacts">
        <div class="cv-contact${d.personal.contacts?.email ? "" : " cv-contact-empty"}"><span class="cv-contact-ico">✉</span><span contenteditable="true" data-path="personal.contacts.email" data-plain>${linkify(d.personal.contacts?.email || "")}</span></div>
        <div class="cv-contact${d.personal.contacts?.phone ? "" : " cv-contact-empty"}"><span class="cv-contact-ico">☎</span><span contenteditable="true" data-path="personal.contacts.phone" data-plain>${d.personal.contacts?.phone || ""}</span></div>
      </div>
      ${hasLinks ? `<cv-links data-for="links"></cv-links>` : ""}
    </div>
  `;
}

function bindSectionData(root, d) {
  const setData = (selector, data) => {
    const el = root.querySelector(selector);
    if (el) {
      el.data = data;
    }
  };
  setData('cv-entry-list[data-for="education"]', {
    entries: d.education,
    pathPrefix: "education",
  });
  setData('cv-entry-list[data-for="teaching"]', {
    entries: d.teaching,
    pathPrefix: "teaching",
  });
  setData('cv-simple-list[data-for="languages"]', {
    items: d.languages,
    pathPrefix: "languages",
  });
  setData('cv-simple-list[data-for="hobbies"]', {
    items: d.hobbies,
    pathPrefix: "hobbies",
  });
  setData("cv-about", d.about);
  setData("cv-skills", d.skills);
  setData("cv-timeline", d.timeline);
  if (d.personal.links?.length) {
    setData('cv-links[data-for="links"]', d.personal.links);
  }
  if (d.softSkills?.length) {
    setData('cv-simple-list[data-for="soft_skills"]', {
      items: d.softSkills,
      pathPrefix: "softSkills",
    });
  }
  if (d.personal_projects?.length) {
    setData('cv-simple-list[data-for="personal_projects"]', {
      items: d.personal_projects,
      pathPrefix: "personal_projects",
    });
  }
}

customElements.define("cv-page1", CvPage1);
