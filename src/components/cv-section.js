import { applyStyles } from './tools.js';

export class CvSection extends HTMLElement {
    connectedCallback() {
        applyStyles(this);
        const visKey = this.getAttribute('vis-key');
        const label  = this.getAttribute('label') || '';
        const side   = this.getAttribute('side') || 'left';
        const visible = this.getAttribute('visible') !== 'false';

        this.id        = visKey ? `cv-sect-${visKey}` : '';
        this.className = `cv-sect${visible ? '' : ' cv-sect-hidden'}`;

        const children = [...this.childNodes];
        this.innerHTML = `
            <div class="cv-sect-hdr">
                <div class="${side === 'right' ? 'rb' : 'lb'}">${label}</div>
                ${visKey ? `<button class="sect-eye" onclick="toggleCvSection('${visKey}')">${visible ? '⊙' : '⊘'}</button>` : ''}
            </div>
            <div class="cv-sect-body"></div>
        `;
        this.querySelector('.cv-sect-body').append(...children);
    }
}

customElements.define('cv-section', CvSection);
