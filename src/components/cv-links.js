import { applyStyles } from './tools.js';

export class CvLinks extends HTMLElement {
    set data(links) {
        this._links = links;
        this._render();
    }

    _render() {
        applyStyles(this);
        this.innerHTML = `
            <ul class="links-list">
                ${(this._links || []).map(l => {
                    const ico = l.ico
                        ? (l.ico.startsWith('http') || l.ico.startsWith('data:')
                            ? `<img src="${l.ico}" alt="" class="link-ico-img">`
                            : `<span class="link-ico">${l.ico}</span>`)
                        : '';
                    return `<li><a href="${l.link}" target="_blank" class="cv-link">${ico}<span>${l.link.replace(/^https?:\/\//, '')}</span></a></li>`;
                }).join('')}
            </ul>
        `;
    }
}

customElements.define('cv-links', CvLinks);
