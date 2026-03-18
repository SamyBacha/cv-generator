import { applyStyles } from './tools.js';

export class CvAbout extends HTMLElement {
    set data(about) {
        this._data = about;
        this._render();
    }

    _render() {
        applyStyles(this);
        const intro = this._data?.intro || '';
        this.innerHTML = `
            <div class="about" contenteditable="true" data-path="about.intro">${intro}</div>
        `;
    }
}

customElements.define('cv-about', CvAbout);
