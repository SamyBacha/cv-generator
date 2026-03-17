import { applyStyles } from './tools.js';

export class CvSimpleList extends HTMLElement {
    set data({ items, pathPrefix }) {
        this._items      = items;
        this._pathPrefix = pathPrefix;
        this._render();
    }

    _render() {
        applyStyles(this);
        const p = this._pathPrefix;
        this.innerHTML = `
            <ul class="ll">
                ${(this._items || []).map((item, i) => `
                    <li contenteditable="true" data-path="${p}.${i}">${item}</li>
                `).join('')}
            </ul>
        `;
    }
}

customElements.define('cv-simple-list', CvSimpleList);
