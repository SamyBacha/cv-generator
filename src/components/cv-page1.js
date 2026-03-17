import { applyStyles, defaultVisibility } from './tools.js';
import './cv-section.js';
import './cv-entry-list.js';
import './cv-simple-list.js';
import './cv-about.js';
import './cv-skills.js';
import './cv-timeline.js';

export class CvPage1 extends HTMLElement {
    set data(d) {
        this._data = d;
        this._render();
    }

    _render() {
        applyStyles(this);
        const d = this._data;
        if (!d) return;
        const vis = d.visibility || defaultVisibility();

        this.innerHTML = `
            <div class="col-left">
                <div class="profile-block">
                    <div class="cv-name" contenteditable="true" data-path="personal.name">${d.personal.name}</div>
                    <div class="cv-post" contenteditable="true" data-path="personal.role">${d.personal.role}</div>
                </div>
                <cv-section label="EDUCATION"    vis-key="education" visible="${vis.education}"><cv-entry-list  data-for="education"></cv-entry-list></cv-section>
                <cv-section label="ENSEIGNEMENT" vis-key="teaching"   visible="${vis.teaching}"> <cv-entry-list  data-for="teaching"></cv-entry-list></cv-section>
                <cv-section label="LANGUAGES"    vis-key="languages"  visible="${vis.languages}"><cv-simple-list data-for="languages"></cv-simple-list></cv-section>
                <cv-section label="HOBBIES"      vis-key="hobbies"    visible="${vis.hobbies}">  <cv-simple-list data-for="hobbies"></cv-simple-list></cv-section>
            </div>

            <div class="col-right">
                <div class="proxym-logo"></div>
                <cv-section label="ABOUT"    vis-key="about"    visible="${vis.about}"    side="right"><cv-about></cv-about></cv-section>
                <cv-section label="SKILLS"   vis-key="skills"   visible="${vis.skills}"   side="right"><cv-skills></cv-skills></cv-section>
                <cv-section label="TIMELINE" vis-key="timeline" visible="${vis.timeline}" side="right"><cv-timeline></cv-timeline></cv-section>
            </div>
        `;

        this.querySelector('cv-entry-list[data-for="education"]').data  = { entries: d.education, pathPrefix: 'education' };
        this.querySelector('cv-entry-list[data-for="teaching"]').data   = { entries: d.teaching,  pathPrefix: 'teaching'  };
        this.querySelector('cv-simple-list[data-for="languages"]').data = { items: d.languages,   pathPrefix: 'languages' };
        this.querySelector('cv-simple-list[data-for="hobbies"]').data   = { items: d.hobbies,     pathPrefix: 'hobbies'   };
        this.querySelector('cv-about').data    = d.about;
        this.querySelector('cv-skills').data   = d.skills;
        this.querySelector('cv-timeline').data = d.timeline;

        const tpl = document.getElementById('proxym-logo-tpl');
        if (tpl) this.querySelector('.proxym-logo').appendChild(tpl.content.cloneNode(true));
    }
}

customElements.define('cv-page1', CvPage1);
