import { applyStyles, defaultVisibility, t } from './tools.js';

export class CvPage2 extends HTMLElement {
    set data(d) {
        this._data = d;
        this._render();
    }

    _render() {
        const d = this._data;
        if (!d) return;
        applyStyles(this);
        const vis = d.visibility || defaultVisibility();
        this.style.display = vis.missions ? '' : 'none';
        const lang = d.lang || 'fr';
        this.innerHTML = `
            <div class="logo-wrap logo-clone"></div>
            <div class="projects-hdr">${t('projects_header', lang)}</div>
            ${d.missions.map(() => '<cv-mission></cv-mission>').join('')}
        `;
        const nodes = this.querySelectorAll('cv-mission');
        d.missions.forEach((m, i) => nodes[i].render(m, i));
    }
}

customElements.define('cv-page2', CvPage2);
