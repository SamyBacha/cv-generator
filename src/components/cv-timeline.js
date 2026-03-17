import { applyStyles } from './tools.js';

export class CvTimeline extends HTMLElement {
    set data(timeline) {
        this._timeline = timeline;
        this._render();
    }

    _render() {
        applyStyles(this);
        this.innerHTML = `
            <div class="tl">
                ${(this._timeline || []).map((t, i) => `
                    <div class="tl-ev${t.alt ? ' alt' : ''}">
                        <div class="tl-yr" contenteditable="true" data-path="timeline.${i}.year">${t.year}</div>
                        <div class="tl-dot${t.current ? ' cur' : ''}"></div>
                        <div class="tl-lbl" contenteditable="true" data-path="timeline.${i}.label">${t.label}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

customElements.define('cv-timeline', CvTimeline);
