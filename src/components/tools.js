const _loadedStyles = new Set();

export function applyStyles(element) {
    const name = element.tagName.toLowerCase();
    if (_loadedStyles.has(name)) return;
    _loadedStyles.add(name);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL(`./${name}.css`, import.meta.url);
    document.head.appendChild(link);
}

export function defaultVisibility() {
    return { about: true, skills: true, timeline: true, education: true, teaching: true, languages: true, hobbies: true, missions: true };
}

export function renderLogoHtml(logo) {
    if (!logo) return '';
    const s = logo.trim();
    if (s.startsWith('<svg')) return `<span class="m-logo">${s}</span>`;
    return `<span class="m-logo"><img src="${s}" alt="logo"></span>`;
}

export async function compressImage(file, maxW = 120, maxH = 40, quality = 0.85) {
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
