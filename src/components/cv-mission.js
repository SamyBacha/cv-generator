import { applyStyles, renderLogoHtml } from './tools.js';

export class CvMission extends HTMLElement {
    set data({ mission, idx }) {
        this.render(mission, idx);
    }

    render(m, idx) {
        applyStyles(this);
        const p = idx !== undefined ? `missions.${idx}` : null;
        const ce = (path) => p ? `contenteditable="true" data-path="${p}.${path}"` : '';
        this.innerHTML = `
            <div class="mission">
                <div class="m-dates" ${ce('dates')}>${m.dates}</div>
                <div class="m-client">
                    <span class="m-logo-area${m.logo ? ' has-logo' : ''}" ${p !== null ? `onclick="openLogoPopover(${idx}, this)"` : ''}>${renderLogoHtml(m.logo)}</span>
                    <span ${ce('client')}>${m.client}</span>
                </div>
                <div class="m-role" ${ce('role')}>${m.role}</div>
                <p class="m-summary" ${ce('summary')}>${m.summary}</p>
                <ul class="m-tasks">
                    ${m.tasks.map((t, j) => `
                        <li><span ${p ? `contenteditable="true" data-path="${p}.tasks.${j}.label"` : ''}>${t.label}</span>${t.desc ? `<span class="poc-desc" ${p ? `contenteditable="true" data-path="${p}.tasks.${j}.desc"` : ''}>${t.desc}</span>` : ''}</li>
                    `).join('')}
                </ul>
                <div class="m-stack${m.stack ? '' : ' m-stack-empty'}"><b>Stack :</b> <span ${ce('stack')}>${m.stack || ''}</span></div>
            </div>
        `;
    }
}

customElements.define('cv-mission', CvMission);
