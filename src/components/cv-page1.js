import { applyStyles, defaultVisibility, linkify, t } from "./tools.js";
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

    const hasLinks = d.personal.links?.length;
    const hasProjects = d.personal_projects?.length;
    const lang = d.lang || "fr";

    this.innerHTML = `
            <div class="col-left">
                <div class="profile-block">
                    <div class="cv-name" contenteditable="true" data-path="personal.name">${d.personal.name}</div>
                    <div class="cv-post" contenteditable="true" data-path="personal.role">${d.personal.role}</div>
                    <div class="cv-contacts">
                        <div class="cv-contact${d.personal.contacts?.email ? "" : " cv-contact-empty"}"><span class="cv-contact-ico">✉</span><span contenteditable="true" data-path="personal.contacts.email" data-plain>${linkify(d.personal.contacts?.email || "")}</span></div>
                        <div class="cv-contact${d.personal.contacts?.phone ? "" : " cv-contact-empty"}"><span class="cv-contact-ico">☎</span><span contenteditable="true" data-path="personal.contacts.phone" data-plain>${d.personal.contacts?.phone || ""}</span></div>
                    </div>
                    ${hasLinks ? `<cv-links data-for="links"></cv-links>` : ""}
                </div>
                <cv-section label="${t("education", lang)}"         vis-key="education"         visible="${vis.education}"><cv-entry-list  data-for="education"></cv-entry-list></cv-section>
                <cv-section label="${t("teaching", lang)}"          vis-key="teaching"           visible="${vis.teaching}"> <cv-entry-list  data-for="teaching"></cv-entry-list></cv-section>
                <cv-section label="${t("languages", lang)}"         vis-key="languages"          visible="${vis.languages}"><cv-simple-list data-for="languages"></cv-simple-list></cv-section>
                <cv-section label="${t("hobbies", lang)}"           vis-key="hobbies"            visible="${vis.hobbies}">  <cv-simple-list data-for="hobbies"></cv-simple-list></cv-section>
                ${
                  d.softSkills?.length
                    ? `
                    <cv-section label="${t("soft_skills", lang)}" vis-key="soft_skills" visible="${vis.soft_skills !== false}"><cv-simple-list data-for="soft_skills"></cv-simple-list></cv-section>
                `
                    : ""
                }
                ${
                  hasProjects
                    ? `
                    <cv-section label="${t("personal_projects", lang)}" vis-key="personal_projects" visible="${vis.personal_projects !== false}"><cv-simple-list data-for="personal_projects"></cv-simple-list></cv-section>
                `
                    : ""
                }
            </div>
            <div class="proxym-logo-wrap">
                <div class="proxym-logo"></div>
                <button class="sect-eye" id="logo-eye" onclick="toggleProxymLogo()" title="Masquer/afficher le logo Proxym">⊙</button>
            </div>

            <div class="col-right">
                <cv-section label="${t("about", lang)}"    vis-key="about"    visible="${vis.about}"    side="right"><cv-about></cv-about></cv-section>
                <cv-section label="${t("skills", lang)}"   vis-key="skills"   visible="${vis.skills}"   side="right"><cv-skills></cv-skills></cv-section>
                <cv-section label="${t("timeline", lang)}" vis-key="timeline" visible="${vis.timeline}" side="right"><cv-timeline></cv-timeline></cv-section>
            </div>
        `;

    this.querySelector('cv-entry-list[data-for="education"]').data = {
      entries: d.education,
      pathPrefix: "education",
    };
    this.querySelector('cv-entry-list[data-for="teaching"]').data = {
      entries: d.teaching,
      pathPrefix: "teaching",
    };
    this.querySelector('cv-simple-list[data-for="languages"]').data = {
      items: d.languages,
      pathPrefix: "languages",
    };
    this.querySelector('cv-simple-list[data-for="hobbies"]').data = {
      items: d.hobbies,
      pathPrefix: "hobbies",
    };
    this.querySelector("cv-about").data = d.about;
    this.querySelector("cv-skills").data = d.skills;
    this.querySelector("cv-timeline").data = d.timeline;

    if (hasLinks) {
      this.querySelector('cv-links[data-for="links"]').data = d.personal.links;
    }
    if (d.softSkills?.length) {
      this.querySelector('cv-simple-list[data-for="soft_skills"]').data = {
        items: d.softSkills,
        pathPrefix: "softSkills",
      };
    }
    if (hasProjects) {
      this.querySelector('cv-simple-list[data-for="personal_projects"]').data =
        { items: d.personal_projects, pathPrefix: "personal_projects" };
    }

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

customElements.define("cv-page1", CvPage1);
