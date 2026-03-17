# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

A pure static HTML/CSS/JavaScript CV editor and viewer for Proxym France. No build tools, no package manager, no test framework. Served as-is by a browser or GitLab Pages.

## File Structure

```
index.html              — Entry point HTML (template SVG, toolbar, viewer panels)
style.css               — Global styles only: reset, .page, editor panel, toolbar, print base rules
src/
  main.js               — Entry point ES module: loads data (localStorage / cv-data.json / ?blank), calls initApp()
  editor.js             — All editor logic: CV_DATA/editData state, switchToView/Edit, form builder, save/export/import/loadBlank
  cv-data.json          — Default CV data (source of truth for new sessions)
  cv-blank.json         — Lorem ipsum blank template, loaded via ?blank URL param or "Nouveau CV vierge" button
  cv-data.schema.json   — JSON Schema Draft 2020-12 describing the full data structure
  components/
    tools.js            — Shared utilities: applyStyles(), defaultVisibility(), renderLogoHtml(), compressImage()
    cv-section.js/.css  — Generic section wrapper (label badge + visibility toggle + slot-like children)
    cv-entry-list.js/.css  — Reusable entry list (education / teaching)
    cv-simple-list.js/.css — Reusable bullet list (languages / hobbies)
    cv-about.js/.css    — About block (intro + expertise list + conclusion)
    cv-skills.js/.css   — Skills list
    cv-timeline.js/.css — Horizontal timeline
    cv-mission.js/.css  — Single mission card (dates, client, role, tasks, stack, logo)
    cv-page1.js/.css    — Page 1 layout (two-column grid: left / right)
    cv-page2.js/.css    — Page 2 layout (missions list + projects header)
```

## Architecture

### ES Modules

The app uses native ES modules (`type="module"`). No bundler. `import.meta.url` is used in `tools.js` to resolve per-component CSS paths.

### Data flow

- `CV_DATA` — live displayed state
- `editData` — deep copy used by the editor form (not committed until `switchToView()`)
- `switchToView()` — copies `editData → CV_DATA`, calls `el.data = CV_DATA` on `cv-page1` and `cv-page2`
- `switchToEdit()` — copies `CV_DATA → editData`, rebuilds the editor form via `buildEditor()`

Data loading priority in `main.js`:
1. `?blank` in URL → `cv-blank.json`
2. `localStorage` key `proxym-cv-data` → stored JSON
3. Default → `cv-data.json`

### Web Components

All components use `set data()` → `_render()` pattern. No Shadow DOM (intentional: `contenteditable` + `data-path` queries must reach elements from outside).

**`cv-section`** is the only component using `connectedCallback` — it captures child nodes before overwriting innerHTML, then re-appends them into `.cv-sect-body`. This enables slot-like composition without Shadow DOM.

Each component calls `applyStyles(this)` from `tools.js` on first render, which injects a `<link>` tag pointing to the co-located `.css` file (once per tag name, guarded by a `Set`).

### Data binding (editor form)

Input elements carry `data-path="some.nested.0.key"`. `bindInputs()` reads via `getPath(editData, path)` and writes back via `setPath(editData, path, value)` on `input`/`change` events.

Add/remove operations call `rebuildSection(sectionId, bodyFn)` which re-renders and re-binds a section body.

### Inline editing (viewer)

All rendered text nodes have `contenteditable="true"` and `data-path`. Changes update both `CV_DATA` and `editData` immediately via `bindViewerInputs()`.

### Global function exposure

All `onclick="..."` inline handlers call global functions. These are explicitly assigned via `window.fnName = fnName` at the bottom of `editor.js` (ES module scope is not global).

### JSON Schema

`cv-data.schema.json` uses Draft 2020-12 with `additionalProperties: false` throughout and `$defs` for `timelineEntry`, `educationEntry`, `task`, `mission`. The optional `visibility` key is not required in the JSON file.

### CSS architecture

- `style.css` — global reset, `.page`, editor chrome (toolbar, panels, wysiwyg, print-btn), base print rules
- `src/components/*.css` — per-component styles, loaded lazily via `applyStyles()` using `import.meta.url`

### Print / PDF

`@media print` rules are split: base rules in `style.css`, component-specific rules in each component's `.css`. The `.logo-fixed` div uses `position: fixed` to repeat the Proxym logo on every printed page.

## Development

Open `index.html` directly in a browser — no server or build step required for local use.

For accurate `import.meta.url` resolution (CSS loading), serve via a local HTTP server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deployment

Push to `develop` — GitLab CI publishes `public/` as GitLab Pages. The `index.html` at the root is the deployed file (copy it to `public/index.html` before pushing if not already in sync).
