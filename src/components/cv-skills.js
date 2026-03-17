import { applyStyles } from './tools.js';

export class CvSkills extends HTMLElement {
    set data(skills) {
        this._skills = skills;
        this._render();
    }

    _render() {
        applyStyles(this);
        this.innerHTML = `
            <ul class="skills-list">
                ${(this._skills || []).map((s, i) => `
                    <li>
                        <strong contenteditable="true" data-path="skills.${i}.label">${s.label.replace(/\s*:\s*$/, '')} :</strong>
                        <span contenteditable="true" data-path="skills.${i}.items">${s.items}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }
}

customElements.define('cv-skills', CvSkills);
