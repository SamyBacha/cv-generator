import { applyStyles } from './tools.js';

export class CvAbout extends HTMLElement {
    set data({ intro, expertise, conclusion }) {
        this._data = { intro, expertise, conclusion };
        this._render();
    }

    _render() {
        applyStyles(this);
        const { intro = '', expertise = [], conclusion = '' } = this._data || {};
        this.innerHTML = `
            <div class="about">
                <p contenteditable="true" data-path="about.intro">${intro}</p>
                <p>Expertise forte en
                    <ul style="padding-left: 40px;">
                        ${expertise.map((e, i) => `
                            <li contenteditable="true" data-path="about.expertise.${i}">${e}</li>
                        `).join('')}
                    </ul>
                </p>
                <p contenteditable="true" data-path="about.conclusion">${conclusion}</p>
            </div>
        `;
    }
}

customElements.define('cv-about', CvAbout);
