/* ===== LOGO HELPERS ===== */
function renderLogoHtml(logo) {
    if (!logo) return '';
    const s = logo.trim();
    if (s.startsWith('<svg')) return `<span class="m-logo">${s}</span>`;
    return `<span class="m-logo"><img src="${s}" alt="logo"></span>`;
}

async function compressImage(file, maxW = 120, maxH = 40, quality = 0.85) {
    return new Promise(resolve => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.naturalWidth * scale);
            canvas.height = Math.round(img.naturalHeight * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png', quality));
        };
        img.src = url;
    });
}

/* ===== WEB COMPONENTS ===== */
function defaultVisibility() {
    return { about: true, skills: true, timeline: true, education: true, teaching: true, languages: true, hobbies: true, missions: true };
}

class CvMission extends HTMLElement {
    render(m, idx) {
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

class CvPage2 extends HTMLElement {
    connectedCallback() {
        const d = CV_DATA;
        const vis = d.visibility || defaultVisibility();
        this.style.display = vis.missions ? '' : 'none';
        this.innerHTML = `
            <div class="logo-wrap logo-clone"></div>
            <div class="projects-hdr">PROJECTS REFERENCES</div>
            ${d.missions.map(() => '<cv-mission></cv-mission>').join('')}
        `;
        const nodes = this.querySelectorAll('cv-mission');
        d.missions.forEach((m, i) => nodes[i].render(m, i));
    }
}
customElements.define('cv-page2', CvPage2);

class CvPage1 extends HTMLElement {
    connectedCallback() {
        const d = CV_DATA;
        const vis = d.visibility || defaultVisibility();
        this.innerHTML = `
            <div class="col-left">
                <div class="profile-block">
                    <div class="cv-name" contenteditable="true" data-path="personal.name">${d.personal.name}</div>
                    <div class="cv-post" contenteditable="true" data-path="personal.role">${d.personal.role}</div>
                </div>

                <div id="cv-sect-education" class="cv-sect${vis.education ? '' : ' cv-sect-hidden'}">
                    <div class="cv-sect-hdr">
                        <div class="lb">EDUCATION</div>
                        <button class="sect-eye" onclick="toggleCvSection('education')">${vis.education ? '⊙' : '⊘'}</button>
                    </div>
                    <div class="cv-sect-body">
                        ${d.education.map((e, i) => `
                            <div class="entry">
                                <span class="yr" contenteditable="true" data-path="education.${i}.years">${e.years}</span>
                                <div class="deg" contenteditable="true" data-path="education.${i}.degree">${e.degree}</div>
                                <div class="org" contenteditable="true" data-path="education.${i}.org">${e.org}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div id="cv-sect-teaching" class="cv-sect${vis.teaching ? '' : ' cv-sect-hidden'}">
                    <div class="cv-sect-hdr">
                        <div class="lb">ENSEIGNEMENT</div>
                        <button class="sect-eye" onclick="toggleCvSection('teaching')">${vis.teaching ? '⊙' : '⊘'}</button>
                    </div>
                    <div class="cv-sect-body">
                        ${d.teaching.map((t, i) => `
                            <div class="entry">
                                <span class="yr" contenteditable="true" data-path="teaching.${i}.years">${t.years}</span>
                                <div class="deg" contenteditable="true" data-path="teaching.${i}.degree">${t.degree}</div>
                                <div class="org" contenteditable="true" data-path="teaching.${i}.org">${t.org}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div id="cv-sect-languages" class="cv-sect${vis.languages ? '' : ' cv-sect-hidden'}">
                    <div class="cv-sect-hdr">
                        <div class="lb">LANGUAGES</div>
                        <button class="sect-eye" onclick="toggleCvSection('languages')">${vis.languages ? '⊙' : '⊘'}</button>
                    </div>
                    <div class="cv-sect-body">
                        <ul class="ll">
                            ${d.languages.map((l, i) => `<li contenteditable="true" data-path="languages.${i}">${l}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div id="cv-sect-hobbies" class="cv-sect${vis.hobbies ? '' : ' cv-sect-hidden'}">
                    <div class="cv-sect-hdr">
                        <div class="lb">HOBBIES</div>
                        <button class="sect-eye" onclick="toggleCvSection('hobbies')">${vis.hobbies ? '⊙' : '⊘'}</button>
                    </div>
                    <div class="cv-sect-body">
                        <ul class="ll">
                            ${d.hobbies.map((h, i) => `<li contenteditable="true" data-path="hobbies.${i}">${h}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>

            <div class="col-right">
                <div class="proxym-logo"></div>

                <div id="cv-sect-about" class="cv-sect${vis.about ? '' : ' cv-sect-hidden'}">
                    <div class="cv-sect-hdr">
                        <div class="rb">ABOUT</div>
                        <button class="sect-eye" onclick="toggleCvSection('about')">${vis.about ? '⊙' : '⊘'}</button>
                    </div>
                    <div class="cv-sect-body">
                        <div class="about">
                            <p contenteditable="true" data-path="about.intro">${d.about.intro}</p>
                            <p>Expertise forte en
                                <ul style="padding-left: 40px;">
                                    ${d.about.expertise.map((e, i) => `<li contenteditable="true" data-path="about.expertise.${i}">${e}</li>`).join('')}
                                </ul>
                            </p>
                            <p contenteditable="true" data-path="about.conclusion">${d.about.conclusion}</p>
                        </div>
                    </div>
                </div>

                <div id="cv-sect-skills" class="cv-sect${vis.skills ? '' : ' cv-sect-hidden'}">
                    <div class="cv-sect-hdr">
                        <div class="rb">SKILLS</div>
                        <button class="sect-eye" onclick="toggleCvSection('skills')">${vis.skills ? '⊙' : '⊘'}</button>
                    </div>
                    <div class="cv-sect-body">
                        <ul class="skills-list">
                            ${d.skills.map((s, i) => `<li><strong contenteditable="true" data-path="skills.${i}.label">${s.label.replace(/\s*:\s*$/, '')} :</strong> <span contenteditable="true" data-path="skills.${i}.items">${s.items}</span></li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div id="cv-sect-timeline" class="cv-sect${vis.timeline ? '' : ' cv-sect-hidden'}">
                    <div class="cv-sect-hdr">
                        <div class="rb">TIMELINE</div>
                        <button class="sect-eye" onclick="toggleCvSection('timeline')">${vis.timeline ? '⊙' : '⊘'}</button>
                    </div>
                    <div class="cv-sect-body">
                        <div class="tl">
                            ${d.timeline.map((t, i) => `
                                <div class="tl-ev${t.alt ? ' alt' : ''}">
                                    <div class="tl-yr" contenteditable="true" data-path="timeline.${i}.year">${t.year}</div>
                                    <div class="tl-dot${t.current ? ' cur' : ''}"></div>
                                    <div class="tl-lbl" contenteditable="true" data-path="timeline.${i}.label">${t.label}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const tpl = document.getElementById('proxym-logo-tpl');
        if (tpl) {
            this.querySelector('.proxym-logo').appendChild(tpl.content.cloneNode(true));
        }
    }
}
customElements.define('cv-page1', CvPage1);

let CV_DATA = {
    "personal": { "name": "Samy Bacha", "role": "Technical Leader" },
    "about": {
        "intro": "Technical Leader avec plus de <strong>12 ans d'expérience</strong> en développement et en architecture logicielle.<br>J'ai évolué de développeur backend à Tech Lead puis architecte Technique, dans des contextes exigeants (banque, transport, industrie, secteur public international).",
        "expertise": [
            "Architecture distribuée &amp; microservices",
            "Domain Driven Design &amp; Software Craftsmanship",
            "Environnements Agile à l'échelle",
            "<strong>Transformation technologique et intégration de l'IA en entreprise</strong>"
        ],
        "conclusion": "Aujourd'hui, j'interviens à la croisée des enjeux techniques, business et humains, avec une forte orientation innovation et <b>intelligence artificielle.</b>"
    },
    "skills": [
        { "label": "IA &amp; NLP", "items": "Python, LangChain, Pydantic, Knowledge Graph, Agents &amp; MCP, RAG, Embeddings, N8N" },
        { "label": "Langages &amp; Frameworks", "items": "Java, Python, JavaScript/TypeScript, Spring, NodeJs, NestJs, NextJs, React, Angular" },
        { "label": "Architecture", "items": "Microservices, Hexagonale, DDD, TDD, BDD, SOLID, Design Patterns, Event-driven, Kafka" },
        { "label": "Cloud &amp; DevOps", "items": "GCP, AWS, Azure, Docker, Kubernetes, ArgoCD, Helm, Terraform, CloudFormation, GitLab CI, Jenkins" },
        { "label": "Databases", "items": "PostgreSQL, Oracle, SQL Server, MySQL, MongoDB, Neo4j, PGVector, Redis, ehCache" },
        { "label": "Outils", "items": "Git, Maven, Gradle, Sonar" }
    ],
    "timeline": [
        { "year": "2013", "label": "Master MIAGE", "alt": false, "current": false },
        { "year": "2013", "label": "Dev SNCF", "alt": true, "current": false },
        { "year": "2019", "label": "Lead Tech Transdev", "alt": false, "current": false },
        { "year": "2021", "label": "Lead Tech Bforbank", "alt": true, "current": false },
        { "year": "2025", "label": "Mission IA pour Dubaï Police", "alt": false, "current": false },
        { "year": "Auj.", "label": "Tech Leader Lab'IA Proxym", "alt": true, "current": true }
    ],
    "education": [
        { "years": "Sept 2010 – Sept 2013", "degree": "Master MIAGE", "org": "ESIAG, Paris 12 — Alternance L3, M1, M2" },
        { "years": "2005 – 2006", "degree": "Baccalauréat Scientifique", "org": "Lycée Gaston Bachelard, Chelles" }
    ],
    "teaching": [
        { "years": "Mai 2024 – Juin 2024", "degree": "Enseignant DevOps", "org": "ESGI — 2 classes Master Data Science, Paris" },
        { "years": "2023", "degree": "Formateur Java", "org": "Institution Saint-Aspais — Certification Oracle Java SE 8 (L3)" }
    ],
    "languages": ["Français : natif", "Anglais : courant"],
    "hobbies": ["Veille Technologique", "Dessin", "Ping-pong"],
    "missions": [
        {
            "dates": "Aujourd'hui", "client": "Proxym — Mission interne stratégique", "role": "Technical Leader — Lab IA",
            "summary": "Définir la stratégie technologique de Proxym.<br>Création et structuration du pôle IA : roadmap, POC métier, acculturation des équipes et accompagnement avant-vente.",
            "tasks": [
                { "label": "Définition de la roadmap IA &amp; veille technologique active (LLM, architectures agents)" },
                { "label": "POC – Spec Agent : agent IA d'analyse documentaire &amp; code", "desc": "But : Croiser differentes sources de vérités comme Jira, Confluence et/ou code source pour détecter des incohérences, extraire les règles métier et générer des tickets Jira estimés — via RAG, LLM orchestration et vector DB." },
                { "label": "POC – Payroll Agent : pilotage IA de la masse salariale", "desc": "Simule l'impact financier des recrutements/départs (effet Noria), génère des scénarios budgétaires (calcule de deviation) et assiste les équipes RH dans la prise de décision." },
                { "label": "Formation IA pour profils non-tech et développeurs (LLM, RAG, MCP, agents autonomes)" },
                { "label": "Accompagnement avant-vente sur sujets IA" }
            ], "stack": ""
        },
        {
            "dates": "Mars 2025 – Juin 2025", "client": "Dubaï Police — Benchmarking stratégique de mesures preventives", "role": "Task Force Member — Proxym, 4 personnes",
            "summary": "Conception d'une plateforme IA de benchmarking institutionnel permettant la comparaison de pratiques entre organismes et la génération de plans d'implémentation actionnables.",
            "tasks": [
                { "label": "Comparaison des pratiques internes avec celles d'autres institutions policières" },
                { "label": "Identification d'experts et extraction de bonnes pratiques" },
                { "label": "Génération de plans d'implémentation via agents IA" }
            ], "stack": "Python, Django REST Framework, LangChain, Neo4j, PGVector, PostgreSQL, Docker, GitLab CI"
        },
        {
            "dates": "Juin 2021 – Février 2025", "client": "Bforbank — Transformation néobanque", "role": "Lead Developer Backend — via Proxym, Squad 13 personnes",
            "summary": "Transformation de Bforbank en néobanque.<br>Squad Customer Acquisition : Onboarding, KYC, screening AML, signature électronique.<br>Environnement microservices hautement disponible.",
            "tasks": [
                { "label": "Conception et développement de microservices d'onboarding client" },
                { "label": "Intégration KYC &amp; screening AML" },
                { "label": "Architecture event-driven (Kafka) et infrastructure GCP" }
            ], "stack": "Java 17, Spring Boot 3, Kafka, GCP, Terraform, Kubernetes, BDD/TDD/DDD"
        },
        {
            "dates": "Mai 2019 – Mai 2021", "client": "Transdev — Refonte système de gestion RH", "role": "Lead Tech — Devoteam Creative Tech, Squad 10 personnes",
            "summary": "Refonte complète du système de gestion des employés pour Transdev.<br>Coordination inter-feature teams et promotion des bonnes pratiques DDD.",
            "tasks": [
                { "label": "Architecture orientée microservices" },
                { "label": "Coordination inter-feature teams" },
                { "label": "Promotion DDD &amp; bonnes pratiques engineering" }
            ], "stack": "Java 11, Spring, Angular, AWS"
        },
        {
            "dates": "Janvier 2013 – Décembre 2019", "client": "EGIS · Airbus · SNCF", "role": "Tech Lead — Sopra Steria puis Devoteam",
            "summary": "Interventions sur projets critiques dans les secteurs Énergie, Aéronautique et Transport ferroviaire, via ESN (Sopra Steria puis Devoteam).",
            "tasks": [
                { "label": "Clients notables : Airbus, SNCF" },
                { "label": "Secteurs : Énergie, Aéronautique, Transport ferroviaire" }
            ], "stack": ""
        }
    ],
    "visibility": { "about": true, "skills": true, "timeline": true, "education": true, "teaching": true, "languages": true, "hobbies": true, "missions": true }
};

/* ===== ÉDITEUR ===== */
let editData;
let currentMode = 'viewer';

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

function setPath(obj, path, value) {
    const keys = path.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = value;
}

function bindInputs(container) {
    const root = container || document;
    root.querySelectorAll('[data-path]').forEach(el => {
        const path = el.dataset.path;
        const val = getPath(editData, path);
        if (el.contentEditable === 'true') {
            el.innerHTML = val != null ? val : '';
            el.addEventListener('input', () => setPath(editData, path, el.innerHTML));
        } else if (el.type === 'checkbox') {
            el.checked = !!val;
            el.addEventListener('change', () => setPath(editData, path, el.checked));
        } else {
            el.value = val != null ? val : '';
            el.addEventListener('input', () => setPath(editData, path, el.value));
        }
    });
}

function mkWysiwyg(path, multiline = true, cls = '') {
    const contentCls = multiline ? '' : ' wysiwyg-inline';
    return `
        <div class="wysiwyg-wrap${cls ? ' ' + cls : ''}">
            <div class="wysiwyg-bar">
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();document.execCommand('bold')" title="Gras"><b>B</b></button>
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();document.execCommand('italic')" title="Italique"><i>I</i></button>
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();document.execCommand('underline')" title="Souligné"><u>U</u></button>
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();document.execCommand('strikeThrough')" title="Barré"><s>S</s></button>
                <div class="wysiwyg-sep"></div>
                <button class="wysiwyg-btn" onmousedown="event.preventDefault();document.execCommand('removeFormat')" title="Effacer le style">✕</button>
            </div>
            <div class="wysiwyg-content${contentCls}" contenteditable="true" data-path="${path}"></div>
        </div>
    `;
}

function bindViewerInputs() {
    const panel = document.getElementById('viewer-panel');
    if (!panel) return;
    panel.querySelectorAll('[data-path][contenteditable="true"]').forEach(el => {
        if (el._viewerBound) return;
        el._viewerBound = true;
        const path = el.dataset.path;
        el.addEventListener('input', () => {
            const v = el.innerHTML;
            setPath(CV_DATA, path, v);
            setPath(editData, path, v);
            // Mise à jour dynamique de m-stack-empty
            const stack = el.closest('.m-stack');
            if (stack) stack.classList.toggle('m-stack-empty', !el.textContent.trim());
        });
    });
}

function rebuildSection(id, bodyFn) {
    const body = document.querySelector('#' + id + ' .e-section-body');
    body.innerHTML = bodyFn();
    bindInputs(body);
}

function toggleSection(id) {
    document.getElementById(id).classList.toggle('collapsed');
}

function toggleMission(i) {
    const el = document.getElementById('e-mission-' + i);
    if (el) el.classList.toggle('collapsed');
}

function escHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function mkSection(id, icon, title, bodyHtml, visKey = null) {
    const vis = visKey ? ((editData.visibility || defaultVisibility())[visKey] !== false) : true;
    const visBtn = visKey ? `<button class="e-vis-btn${vis ? '' : ' e-vis-off'}" id="e-vis-${visKey}" onclick="event.stopPropagation();toggleCvSection('${visKey}')" title="${vis ? 'Masquer la section' : 'Afficher la section'}">${vis ? '⊙' : '⊘'}</button>` : '';
    return `
        <div class="e-section" id="${id}">
            <div class="e-section-header" onclick="toggleSection('${id}')">
                <span>${icon} ${title}</span>
                <div style="display:flex;align-items:center;gap:6px">
                    ${visBtn}
                    <span class="e-chevron">▾</span>
                </div>
            </div>
            <div class="e-section-body">${bodyHtml}</div>
        </div>
    `;
}

/* --- Section: Identité --- */
function renderPersonalBody() {
    return `
        <div class="e-field">
            <label class="e-label">Nom</label>
            ${mkWysiwyg('personal.name', false)}
        </div>
        <div class="e-field">
            <label class="e-label">Rôle</label>
            ${mkWysiwyg('personal.role', false)}
        </div>
    `;
}
function renderPersonal() {
    return mkSection('e-personal', '👤', 'Identité', renderPersonalBody());
}

/* --- Section: À propos --- */
function renderAboutBody() {
    return `
        <div class="e-field">
            <label class="e-label">Introduction</label>
            ${mkWysiwyg('about.intro')}
        </div>
        <div class="e-field">
            <label class="e-label">Expertise</label>
            ${editData.about.expertise.map((_, i) => `
                <div class="e-row">
                    ${mkWysiwyg(`about.expertise.${i}`, false, 'e-flex')}
                    <button class="btn-remove" onclick="removeExpertise(${i})">−</button>
                </div>
            `).join('')}
            <button class="btn-add" onclick="addExpertise()">+ Ajouter une ligne</button>
        </div>
        <div class="e-field">
            <label class="e-label">Conclusion</label>
            ${mkWysiwyg('about.conclusion')}
        </div>
    `;
}
function renderAbout() {
    return mkSection('e-about', '📝', 'À propos', renderAboutBody(), 'about');
}

/* --- Section: Compétences --- */
function renderSkillsBody() {
    return editData.skills.map((s, i) => `
        <div style="margin-bottom:10px">
            <div class="e-row" style="align-items:flex-start">
                <div class="e-flex">
                    <div class="e-field">
                        <label class="e-label">Catégorie</label>
                        ${mkWysiwyg(`skills.${i}.label`, false)}
                    </div>
                    <div class="e-field" style="margin-bottom:0">
                        <label class="e-label">Éléments</label>
                        ${mkWysiwyg(`skills.${i}.items`, false)}
                    </div>
                </div>
                <button class="btn-remove" style="margin-top:22px" onclick="removeSkill(${i})">−</button>
            </div>
        </div>
        ${i < editData.skills.length - 1 ? '<div class="e-sep"></div>' : ''}
    `).join('') + `<button class="btn-add" onclick="addSkill()">+ Ajouter une compétence</button>`;
}
function renderSkills() {
    return mkSection('e-skills', '🎯', 'Compétences', renderSkillsBody(), 'skills');
}

/* --- Section: Timeline --- */
function renderTimelineBody() {
    return editData.timeline.map((t, i) => `
        <div style="margin-bottom:10px">
            <div class="e-row" style="align-items:flex-end; flex-wrap:wrap; gap:8px">
                <div style="flex:1; min-width:80px">
                    <label class="e-label">Année</label>
                    ${mkWysiwyg(`timeline.${i}.year`, false)}
                </div>
                <div style="flex:2; min-width:140px">
                    <label class="e-label">Label</label>
                    ${mkWysiwyg(`timeline.${i}.label`, false)}
                </div>
                <div style="display:flex; gap:12px; padding-bottom:2px">
                    <label class="e-check-row">
                        <input type="checkbox" data-path="timeline.${i}.alt">
                        Alt
                    </label>
                    <label class="e-check-row">
                        <input type="checkbox" data-path="timeline.${i}.current">
                        Actuel
                    </label>
                </div>
                <button class="btn-remove" onclick="removeTimeline(${i})">−</button>
            </div>
        </div>
        ${i < editData.timeline.length - 1 ? '<div class="e-sep"></div>' : ''}
    `).join('') + `<button class="btn-add" onclick="addTimeline()">+ Ajouter une étape</button>`;
}
function renderTimeline() {
    return mkSection('e-timeline', '📅', 'Timeline', renderTimelineBody(), 'timeline');
}

/* --- Section: Formation --- */
function renderEducationBody() {
    return editData.education.map((e, i) => `
        <div style="margin-bottom:10px">
            <div class="e-grid-2">
                <div class="e-field">
                    <label class="e-label">Période</label>
                    ${mkWysiwyg(`education.${i}.years`, false)}
                </div>
                <div class="e-field">
                    <label class="e-label">Diplôme</label>
                    ${mkWysiwyg(`education.${i}.degree`, false)}
                </div>
            </div>
            <div class="e-row">
                <div class="e-field e-flex" style="margin-bottom:0">
                    <label class="e-label">Établissement</label>
                    ${mkWysiwyg(`education.${i}.org`, false, 'e-flex')}
                </div>
                <button class="btn-remove" style="margin-top:18px" onclick="removeEducation(${i})">−</button>
            </div>
        </div>
        ${i < editData.education.length - 1 ? '<div class="e-sep"></div>' : ''}
    `).join('') + `<button class="btn-add" onclick="addEducation()">+ Ajouter une formation</button>`;
}
function renderEducation() {
    return mkSection('e-education', '🎓', 'Formation', renderEducationBody(), 'education');
}

/* --- Section: Enseignement --- */
function renderTeachingBody() {
    return editData.teaching.map((t, i) => `
        <div style="margin-bottom:10px">
            <div class="e-grid-2">
                <div class="e-field">
                    <label class="e-label">Période</label>
                    ${mkWysiwyg(`teaching.${i}.years`, false)}
                </div>
                <div class="e-field">
                    <label class="e-label">Intitulé</label>
                    ${mkWysiwyg(`teaching.${i}.degree`, false)}
                </div>
            </div>
            <div class="e-row">
                <div class="e-field e-flex" style="margin-bottom:0">
                    <label class="e-label">Organisation</label>
                    ${mkWysiwyg(`teaching.${i}.org`, false, 'e-flex')}
                </div>
                <button class="btn-remove" style="margin-top:18px" onclick="removeTeaching(${i})">−</button>
            </div>
        </div>
        ${i < editData.teaching.length - 1 ? '<div class="e-sep"></div>' : ''}
    `).join('') + `<button class="btn-add" onclick="addTeaching()">+ Ajouter un enseignement</button>`;
}
function renderTeaching() {
    return mkSection('e-teaching', '📚', 'Enseignement', renderTeachingBody(), 'teaching');
}

/* --- Section: Langues --- */
function renderLanguagesBody() {
    return editData.languages.map((_, i) => `
        <div class="e-row">
            ${mkWysiwyg(`languages.${i}`, false, 'e-flex')}
            <button class="btn-remove" onclick="removeLanguage(${i})">−</button>
        </div>
    `).join('') + `<button class="btn-add" onclick="addLanguage()">+ Ajouter une langue</button>`;
}
function renderLanguages() {
    return mkSection('e-languages', '🌍', 'Langues', renderLanguagesBody(), 'languages');
}

/* --- Section: Hobbies --- */
function renderHobbiesBody() {
    return editData.hobbies.map((_, i) => `
        <div class="e-row">
            ${mkWysiwyg(`hobbies.${i}`, false, 'e-flex')}
            <button class="btn-remove" onclick="removeHobby(${i})">−</button>
        </div>
    `).join('') + `<button class="btn-add" onclick="addHobby()">+ Ajouter un hobby</button>`;
}
function renderHobbies() {
    return mkSection('e-hobbies', '🎮', 'Hobbies', renderHobbiesBody(), 'hobbies');
}

/* --- Section: Missions --- */
function renderMissionsBody() {
    return editData.missions.map((m, i) => `
        <div class="e-mission" id="e-mission-${i}">
            <div class="e-mission-header" onclick="toggleMission(${i})">
                <span><span class="e-chevron">▾</span> ${escHtml(m.client) || '<em>Nouvelle mission</em>'}</span>
                <button class="btn-remove" onclick="event.stopPropagation(); removeMission(${i})">🗑 Supprimer</button>
            </div>
            <div class="e-mission-body">
                <div class="e-grid-2">
                    <div class="e-field">
                        <label class="e-label">Période</label>
                        ${mkWysiwyg(`missions.${i}.dates`, false)}
                    </div>
                    <div class="e-field">
                        <label class="e-label">Client</label>
                        ${mkWysiwyg(`missions.${i}.client`, false)}
                    </div>
                </div>
                <div class="e-field">
                    <label class="e-label">Rôle</label>
                    ${mkWysiwyg(`missions.${i}.role`, false)}
                </div>
                <div class="e-field">
                    <label class="e-label">Résumé</label>
                    ${mkWysiwyg(`missions.${i}.summary`)}
                </div>
                <div class="e-field">
                    <label class="e-label">Tâches</label>
                    ${m.tasks.map((t, j) => `
                        <div class="e-row" style="margin-bottom:6px">
                            ${mkWysiwyg(`missions.${i}.tasks.${j}.label`, false, 'e-flex')}
                            ${mkWysiwyg(`missions.${i}.tasks.${j}.desc`, false, 'e-flex')}
                            <button class="btn-remove" onclick="removeTask(${i}, ${j})">−</button>
                        </div>
                    `).join('')}
                    <button class="btn-add" onclick="addTask(${i})">+ Ajouter une tâche</button>
                </div>
                <div class="e-field">
                    <label class="e-label">Logo client</label>
                    <div class="e-logo-ed">
                        <div class="e-logo-preview">${m.logo ? renderLogoHtml(m.logo) : '<span class="e-logo-empty">Aucun</span>'}</div>
                        <div class="e-logo-btns">
                            <button class="btn-sm" onclick="edLogoUpload(${i})">📁 Image</button>
                            <button class="btn-sm" onclick="edLogoSvg(${i})">✏ SVG</button>
                            ${m.logo ? `<button class="btn-sm btn-sm-del" onclick="edLogoRemove(${i})">✕</button>` : ''}
                        </div>
                    </div>
                    <div class="e-logo-svg-wrap" id="e-logo-svg-wrap-${i}" style="display:none">
                        <textarea class="e-logo-svg-area" id="e-logo-svg-area-${i}" placeholder="Coller le code SVG ici…"></textarea>
                        <button class="btn-add" onclick="edLogoApplySvg(${i})">Appliquer</button>
                    </div>
                </div>
                <div class="e-field" style="margin-bottom:0">
                    <label class="e-label">Stack</label>
                    ${mkWysiwyg(`missions.${i}.stack`, false)}
                </div>
            </div>
        </div>
    `).join('') + `<button class="btn-add" style="margin-top:4px" onclick="addMission()">+ Ajouter une mission</button>`;
}
function renderMissions() {
    return mkSection('e-missions', '💼', 'Missions', renderMissionsBody(), 'missions');
}

/* --- Build complet --- */
function buildEditor() {
    const content = document.getElementById('editor-content');
    content.innerHTML = [
        renderPersonal(),
        renderAbout(),
        renderSkills(),
        renderTimeline(),
        renderEducation(),
        renderTeaching(),
        renderLanguages(),
        renderHobbies(),
        renderMissions()
    ].join('');
    bindInputs(content);
}

/* ===== ADD / REMOVE ===== */
function addExpertise()      { editData.about.expertise.push(''); rebuildSection('e-about', renderAboutBody); }
function removeExpertise(i)  { editData.about.expertise.splice(i, 1); rebuildSection('e-about', renderAboutBody); }

function addSkill()          { editData.skills.push({ label: '', items: '' }); rebuildSection('e-skills', renderSkillsBody); }
function removeSkill(i)      { editData.skills.splice(i, 1); rebuildSection('e-skills', renderSkillsBody); }

function addTimeline()       { editData.timeline.push({ year: '', label: '', alt: false, current: false }); rebuildSection('e-timeline', renderTimelineBody); }
function removeTimeline(i)   { editData.timeline.splice(i, 1); rebuildSection('e-timeline', renderTimelineBody); }

function addEducation()      { editData.education.push({ years: '', degree: '', org: '' }); rebuildSection('e-education', renderEducationBody); }
function removeEducation(i)  { editData.education.splice(i, 1); rebuildSection('e-education', renderEducationBody); }

function addTeaching()       { editData.teaching.push({ years: '', degree: '', org: '' }); rebuildSection('e-teaching', renderTeachingBody); }
function removeTeaching(i)   { editData.teaching.splice(i, 1); rebuildSection('e-teaching', renderTeachingBody); }

function addLanguage()       { editData.languages.push(''); rebuildSection('e-languages', renderLanguagesBody); }
function removeLanguage(i)   { editData.languages.splice(i, 1); rebuildSection('e-languages', renderLanguagesBody); }

function addHobby()          { editData.hobbies.push(''); rebuildSection('e-hobbies', renderHobbiesBody); }
function removeHobby(i)      { editData.hobbies.splice(i, 1); rebuildSection('e-hobbies', renderHobbiesBody); }

function addMission()        { editData.missions.push({ dates: '', client: '', role: '', summary: '', tasks: [], stack: '' }); rebuildSection('e-missions', renderMissionsBody); }
function removeMission(i)    { editData.missions.splice(i, 1); rebuildSection('e-missions', renderMissionsBody); }

function addTask(mi)         { editData.missions[mi].tasks.push({ label: '' }); rebuildSection('e-missions', renderMissionsBody); }
function removeTask(mi, ti)  { editData.missions[mi].tasks.splice(ti, 1); rebuildSection('e-missions', renderMissionsBody); }

/* ===== MODE SWITCH ===== */
function cloneLogos() {
    const src = document.querySelector('#viewer-panel .proxym-logo svg');
    if (!src) return;
    document.querySelectorAll('.logo-clone').forEach((el, i) => {
        el.innerHTML = '';
        const clone = src.cloneNode(true);
        const suffix = '_vc' + i;
        clone.querySelectorAll('[id]').forEach(node => {
            const oldId = node.id;
            node.id = oldId + suffix;
            clone.querySelectorAll('[mask="url(#' + oldId + ')"]').forEach(ref => {
                ref.setAttribute('mask', 'url(#' + oldId + suffix + ')');
            });
        });
        el.appendChild(clone);
    });
}

function togglePanels(mode) {
    const editorPanel = document.getElementById('editor-panel');
    const viewerPanel = document.getElementById('viewer-panel');
    const btnEdit = document.getElementById('btn-edit');
    const btnView = document.getElementById('btn-view');
    if (mode === 'viewer') {
        editorPanel.style.display = 'none';
        viewerPanel.style.display = '';
        btnEdit.classList.remove('active');
        btnView.classList.add('active');
    } else {
        editorPanel.style.display = '';
        viewerPanel.style.display = 'none';
        btnEdit.classList.add('active');
        btnView.classList.remove('active');
    }
}

function switchToView() {
    if (currentMode === 'viewer') return;
    CV_DATA = deepCopy(editData);
    ['cv-page1', 'cv-page2'].forEach(tag => {
        const el = document.querySelector('#viewer-panel ' + tag);
        if (el) { el.innerHTML = ''; el.connectedCallback(); }
    });
    cloneLogos();
    bindViewerInputs();
    togglePanels('viewer');
    currentMode = 'viewer';
}

function switchToEdit() {
    if (currentMode === 'editor') return;
    editData = deepCopy(CV_DATA);
    buildEditor();
    togglePanels('editor');
    currentMode = 'editor';
}

const LS_KEY = 'proxym-cv-data';

function toggleCvSection(key) {
    if (!CV_DATA.visibility) CV_DATA.visibility = defaultVisibility();
    CV_DATA.visibility[key] = !CV_DATA.visibility[key];
    editData.visibility = { ...CV_DATA.visibility };
    const visible = CV_DATA.visibility[key];
    if (key === 'missions') {
        const el = document.querySelector('#viewer-panel cv-page2');
        if (el) el.style.display = visible ? '' : 'none';
    } else {
        const el = document.getElementById('cv-sect-' + key);
        if (el) {
            el.classList.toggle('cv-sect-hidden', !visible);
            const btn = el.querySelector('.sect-eye');
            if (btn) btn.textContent = visible ? '⊙' : '⊘';
        }
    }
    const cb = document.querySelector(`#sections-panel [data-key="${key}"]`);
    if (cb) cb.checked = visible;
    const edBtn = document.getElementById('e-vis-' + key);
    if (edBtn) {
        edBtn.textContent = visible ? '⊙' : '⊘';
        edBtn.classList.toggle('e-vis-off', !visible);
        edBtn.title = visible ? 'Masquer la section' : 'Afficher la section';
    }
}

function toggleSectionsPanel() {
    const panel = document.getElementById('sections-panel');
    const btn = document.getElementById('btn-sections');
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : '';
    btn.classList.toggle('active', !isOpen);
}

function initSectionsPanel() {
    const vis = CV_DATA.visibility || defaultVisibility();
    Object.keys(vis).forEach(key => {
        const cb = document.querySelector(`#sections-panel [data-key="${key}"]`);
        if (cb) cb.checked = vis[key];
    });
}

function exportJSON() {
    const blob = new Blob([JSON.stringify(editData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const parsed = JSON.parse(e.target.result);
                CV_DATA = parsed;
                editData = deepCopy(CV_DATA);
                if (currentMode === 'viewer') {
                    ['cv-page1', 'cv-page2'].forEach(tag => {
                        const el = document.querySelector('#viewer-panel ' + tag);
                        if (el) { el.innerHTML = ''; el.connectedCallback(); }
                    });
                    cloneLogos();
                    bindViewerInputs();
                } else {
                    buildEditor();
                }
            } catch {
                alert('Fichier JSON invalide.');
            }
        };
        reader.readAsText(file);
    });
    input.click();
}

function saveToLocalStorage() {
    localStorage.setItem(LS_KEY, JSON.stringify(editData));
    const btn = document.getElementById('btn-save');
    btn.textContent = '✓ Sauvegardé';
    setTimeout(() => { btn.textContent = '💾 Sauvegarder'; }, 1500);
}

/* ===== LOGO POPOVER (viewer) ===== */
let _lpMissionIdx = null;

function openLogoPopover(idx, anchor) {
    _lpMissionIdx = idx;
    const pop = document.getElementById('logo-popover');
    if (!pop) return;
    const logo = CV_DATA.missions[idx]?.logo || '';
    document.getElementById('lp-preview').innerHTML = logo ? renderLogoHtml(logo) : '<span class="lp-empty">Aucun logo</span>';
    document.getElementById('lp-del').style.display = logo ? '' : 'none';
    document.getElementById('lp-svg-area').style.display = 'none';
    document.getElementById('lp-svg-input').value = logo.trim().startsWith('<svg') ? logo : '';
    const rect = anchor.getBoundingClientRect();
    pop.style.left = Math.max(4, Math.min(rect.left, window.innerWidth - 290)) + 'px';
    pop.style.top = (rect.bottom + 6) + 'px';
    pop.classList.add('visible');
}

function lpToggleSvg() {
    const area = document.getElementById('lp-svg-area');
    area.style.display = area.style.display === 'none' ? '' : 'none';
}

function lpApplySvg() {
    const val = document.getElementById('lp-svg-input').value.trim();
    if (val.startsWith('<svg')) lpApplyLogo(val);
}

function lpApplyLogo(logo) {
    if (_lpMissionIdx === null) return;
    CV_DATA.missions[_lpMissionIdx].logo = logo;
    if (editData.missions[_lpMissionIdx]) editData.missions[_lpMissionIdx].logo = logo;
    const nodes = document.querySelectorAll('#viewer-panel cv-mission');
    if (nodes[_lpMissionIdx]) nodes[_lpMissionIdx].render(CV_DATA.missions[_lpMissionIdx], _lpMissionIdx);
    bindViewerInputs();
    document.getElementById('lp-preview').innerHTML = logo ? renderLogoHtml(logo) : '<span class="lp-empty">Aucun logo</span>';
    document.getElementById('lp-del').style.display = logo ? '' : 'none';
}

function lpRemove() { lpApplyLogo(''); }

/* ===== LOGO ÉDITEUR ===== */
let _edLogoIdx = null;

function edLogoUpload(i) {
    _edLogoIdx = i;
    document.getElementById('ed-logo-file-input').click();
}

function edLogoSvg(i) {
    const wrap = document.getElementById('e-logo-svg-wrap-' + i);
    if (wrap) wrap.style.display = wrap.style.display === 'none' ? '' : 'none';
}

function edLogoApplySvg(i) {
    const val = (document.getElementById('e-logo-svg-area-' + i)?.value || '').trim();
    if (!val.startsWith('<svg')) return;
    editData.missions[i].logo = val;
    rebuildSection('e-missions', renderMissionsBody);
}

function edLogoRemove(i) {
    editData.missions[i].logo = '';
    rebuildSection('e-missions', renderMissionsBody);
}

function initLogoHandlers() {
    // Input fichier partagé pour le viewer (popover)
    const lpFile = document.createElement('input');
    lpFile.type = 'file'; lpFile.accept = 'image/*'; lpFile.id = 'lp-file-input'; lpFile.style.display = 'none';

    // Input fichier partagé pour l'éditeur
    const edFile = document.createElement('input');
    edFile.type = 'file'; edFile.accept = 'image/*'; edFile.id = 'ed-logo-file-input'; edFile.style.display = 'none';

    document.body.append(lpFile, edFile);

    lpFile.addEventListener('change', async () => {
        if (!lpFile.files[0]) return;
        lpApplyLogo(await compressImage(lpFile.files[0]));
        lpFile.value = '';
    });

    edFile.addEventListener('change', async () => {
        if (!edFile.files[0] || _edLogoIdx === null) return;
        editData.missions[_edLogoIdx].logo = await compressImage(edFile.files[0]);
        rebuildSection('e-missions', renderMissionsBody);
        edFile.value = '';
    });

    // Popover viewer
    const pop = document.createElement('div');
    pop.id = 'logo-popover';
    pop.innerHTML = `
        <div class="lp-preview" id="lp-preview"></div>
        <div class="lp-actions">
            <button class="lp-btn" onclick="document.getElementById('lp-file-input').click()">📁 Image</button>
            <button class="lp-btn" onclick="lpToggleSvg()">✏ SVG</button>
            <button class="lp-btn lp-btn-del" id="lp-del" onclick="lpRemove()">✕</button>
        </div>
        <div id="lp-svg-area" style="display:none">
            <textarea id="lp-svg-input" placeholder="Coller le code SVG ici…" rows="4"></textarea>
            <button class="lp-btn" style="margin-top:4px" onclick="lpApplySvg()">Appliquer</button>
        </div>
    `;
    document.body.appendChild(pop);

    // Fermer sur clic extérieur
    document.addEventListener('mousedown', e => {
        if (!pop.contains(e.target) && !e.target.closest('.m-logo-area')) {
            pop.classList.remove('visible');
        }
    });
}

function initViewerToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'viewer-toolbar';
    toolbar.innerHTML = `
        <button onmousedown="event.preventDefault();document.execCommand('bold')" title="Gras"><b>B</b></button>
        <button onmousedown="event.preventDefault();document.execCommand('italic')" title="Italique"><i>I</i></button>
        <button onmousedown="event.preventDefault();document.execCommand('underline')" title="Souligné"><u>U</u></button>
        <button onmousedown="event.preventDefault();document.execCommand('strikeThrough')" title="Barré"><s>S</s></button>
        <span class="vt-sep"></span>
        <button onmousedown="event.preventDefault();document.execCommand('removeFormat')" title="Effacer le style">✕</button>
    `;
    document.body.appendChild(toolbar);

    const panel = document.getElementById('viewer-panel');
    if (!panel) return;

    panel.addEventListener('focusin', e => {
        const el = e.target;
        if (!el.isContentEditable) return;
        const rect = el.getBoundingClientRect();
        const tbH = 34;
        let top = rect.top - tbH - 6;
        if (top < 4) top = rect.bottom + 6;
        toolbar.style.left = Math.max(4, rect.left) + 'px';
        toolbar.style.top = top + 'px';
        toolbar.classList.add('visible');
    });

    panel.addEventListener('focusout', () => {
        setTimeout(() => {
            const active = document.activeElement;
            if (!active || !active.isContentEditable || !panel.contains(active)) {
                toolbar.classList.remove('visible');
            }
        }, 150);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
        try {
            CV_DATA = JSON.parse(stored);
            ['cv-page1', 'cv-page2'].forEach(tag => {
                const el = document.querySelector('#viewer-panel ' + tag);
                if (el) { el.innerHTML = ''; el.connectedCallback(); }
            });
        } catch { /* fallback sur données embarquées */ }
    }
    editData = deepCopy(CV_DATA);
    initSectionsPanel();
    cloneLogos();
    bindViewerInputs();
    initLogoHandlers();
    initViewerToolbar();
});
