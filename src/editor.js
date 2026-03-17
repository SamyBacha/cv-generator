import { renderLogoHtml, compressImage, defaultVisibility } from './components/tools.js';

/* ===== ÉTAT ===== */
let CV_DATA = null;
let editData = null;
let currentMode = 'viewer';

export const LS_KEY = 'proxym-cv-data';

export function getCvData() { return CV_DATA; }
export function getEditData() { return editData; }

/* ===== UTILITAIRES ===== */
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
        if (el) el.data = CV_DATA;
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
                        if (el) el.data = CV_DATA;
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

async function loadBlank() {
    if (!confirm('Charger un CV vierge ? Les données non sauvegardées seront perdues.')) return;
    const resp = await fetch(new URL('./cv-blank.json', import.meta.url));
    const blank = await resp.json();
    CV_DATA = blank;
    editData = deepCopy(CV_DATA);
    if (currentMode === 'viewer') {
        ['cv-page1', 'cv-page2'].forEach(tag => {
            const el = document.querySelector('#viewer-panel ' + tag);
            if (el) el.data = CV_DATA;
        });
        cloneLogos();
        bindViewerInputs();
    } else {
        buildEditor();
    }
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
    const lpFile = document.createElement('input');
    lpFile.type = 'file'; lpFile.accept = 'image/*'; lpFile.id = 'lp-file-input'; lpFile.style.display = 'none';

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

/* ===== INIT ===== */
export function initApp(data) {
    CV_DATA = data;
    editData = deepCopy(CV_DATA);

    ['cv-page1', 'cv-page2'].forEach(tag => {
        const el = document.querySelector('#viewer-panel ' + tag);
        if (el) el.data = CV_DATA;
    });

    initSectionsPanel();
    cloneLogos();
    bindViewerInputs();
    initLogoHandlers();
    initViewerToolbar();
}

/* ===== EXPOSITION GLOBALE (handlers inline HTML) ===== */
window.switchToEdit         = switchToEdit;
window.switchToView         = switchToView;
window.toggleCvSection      = toggleCvSection;
window.toggleSectionsPanel  = toggleSectionsPanel;
window.exportJSON           = exportJSON;
window.importJSON           = importJSON;
window.saveToLocalStorage   = saveToLocalStorage;
window.toggleSection        = toggleSection;
window.toggleMission        = toggleMission;
window.openLogoPopover      = openLogoPopover;
window.lpToggleSvg          = lpToggleSvg;
window.lpApplySvg           = lpApplySvg;
window.lpRemove             = lpRemove;
window.edLogoUpload         = edLogoUpload;
window.edLogoSvg            = edLogoSvg;
window.edLogoApplySvg       = edLogoApplySvg;
window.edLogoRemove         = edLogoRemove;
window.addExpertise         = addExpertise;
window.removeExpertise      = removeExpertise;
window.addSkill             = addSkill;
window.removeSkill          = removeSkill;
window.addTimeline          = addTimeline;
window.removeTimeline       = removeTimeline;
window.addEducation         = addEducation;
window.removeEducation      = removeEducation;
window.addTeaching          = addTeaching;
window.removeTeaching       = removeTeaching;
window.addLanguage          = addLanguage;
window.removeLanguage       = removeLanguage;
window.addHobby             = addHobby;
window.removeHobby          = removeHobby;
window.addMission           = addMission;
window.removeMission        = removeMission;
window.addTask              = addTask;
window.removeTask           = removeTask;
window.loadBlank            = loadBlank;
