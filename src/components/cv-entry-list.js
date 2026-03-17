import { applyStyles } from './tools.js';

export class CvEntryList extends HTMLElement {
    set data({ entries, pathPrefix }) {
        this._entries    = entries;
        this._pathPrefix = pathPrefix;
        this._render();
    }

    _render() {
        applyStyles(this);
        const p = this._pathPrefix;
        this.innerHTML = (this._entries || []).map((e, i) => `
            <div class="entry">
                <span class="yr" contenteditable="true" data-path="${p}.${i}.years">${e.years}</span>
                <div class="deg" contenteditable="true" data-path="${p}.${i}.degree">${e.degree}</div>
                <div class="org" contenteditable="true" data-path="${p}.${i}.org">${e.org}</div>
            </div>
        `).join('');
    }
}

customElements.define('cv-entry-list', CvEntryList);
