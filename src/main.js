import './components/cv-mission.js';
import './components/cv-page1.js';
import './components/cv-page2.js';
import { initApp, LS_KEY } from './editor.js';

async function loadData() {
    const params = new URLSearchParams(location.search);
    if (params.has('blank')) {
        const resp = await fetch(new URL('./resources/cv-blank.json', import.meta.url));
        return resp.json();
    }
    const name = params.get('name');
    if (name) {
        const resp = await fetch(new URL(`./resources/${name}`, import.meta.url));
        return resp.json();
    }
    const stored = localStorage.getItem(LS_KEY);
    if (stored) return JSON.parse(stored);
    const resp = await fetch(new URL('./resources/cv-blank.json', import.meta.url));
    return resp.json();
}

document.addEventListener('DOMContentLoaded', async () => {
    initApp(await loadData());
});
