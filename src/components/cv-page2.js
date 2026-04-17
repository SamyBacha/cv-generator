import { applyStyles, defaultVisibility, t } from "./tools.js";

export class CvPage2 extends HTMLElement {
  set data(d) {
    this._data = d;
    this._render();
  }

  _render() {
    const d = this._data;
    if (!d) {
      return;
    }
    applyStyles(this);
    const vis = d.visibility || defaultVisibility();
    this.style.display = vis.missions ? "" : "none";
    const lang = d.lang || "fr";
    this.innerHTML = `
            <div class="logo-wrap logo-clone"></div>
            <div class="projects-hdr">${t("projects_header", lang)}</div>
            ${d.missions.map(() => "<cv-mission></cv-mission>").join("")}
        `;
    const nodes = this.querySelectorAll("cv-mission");
    d.missions.forEach((m, i) => nodes[i].render(m, i));
    requestAnimationFrame(() => this._addPageBreakMarkers());
  }

  _addPageBreakMarkers() {
    const PAGE_H_PX = 297 * 3.7795275591; // 297mm at 96 dpi
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

customElements.define("cv-page2", CvPage2);
