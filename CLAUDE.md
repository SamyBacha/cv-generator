# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A pure static HTML/CSS/JavaScript CV (resume) editor and viewer for Proxym France. No build tools, no package manager, no test framework. The entire application lives in a single HTML file.

## Files

- `public/index.html` — The deployed version, served by GitLab Pages
- `proxym_cv_editor.html` — Working/development copy (same content as `public/index.html`)
- `.gitlab-ci.yml` — Deploys the `public/` directory to GitLab Pages on push to `develop`

## Development

Open either HTML file directly in a browser — no server or build step required.

To deploy: push to the `develop` branch. GitLab CI automatically publishes `public/` as GitLab Pages.

## Architecture

The app is a **single self-contained HTML file** with three layers:

### 1. CV Data (JSON embedded in HTML)
CV content is stored in `<script type="application/json" id="cv-data">` inside the `<head>`. It contains a structured object with keys: `personal`, `about`, `skills`, `timeline`, `education`, `teaching`, `languages`, `hobbies`, `missions`.

At runtime: `CV_DATA` holds the live/displayed data; `editData` holds the in-progress editor state (a deep copy of `CV_DATA`).

### 2. Web Components (CV Renderer)
Three custom elements render the CV layout:
- `cv-page1` — Page 1: two-column layout (left: education/teaching/languages/hobbies; right: about/skills/timeline)
- `cv-page2` — Page 2: professional missions/references list
- `cv-mission` — Individual mission entry, rendered via a `render(m)` method called by `cv-page2`

The Proxym logo SVG is stored in a `<template id="proxym-logo-tpl">` and cloned into each page to avoid SVG mask ID collisions.

### 3. Editor Panel
A form-based editor with collapsible sections (`e-section`) for each data category. Key mechanisms:

- **Data binding**: Input elements use `data-path="some.nested.0.key"` attributes. `bindInputs()` reads initial values via `getPath(editData, path)` and writes back on `input`/`change` events via `setPath(editData, path, value)`.
- **Section rebuilding**: Add/remove operations call `rebuildSection(sectionId, bodyFn)` which re-renders the section's HTML and re-binds inputs.
- **Mode switching**: `switchToView()` copies `editData → CV_DATA` then calls `connectedCallback()` on the web components to re-render. `switchToEdit()` rebuilds the editor form from `CV_DATA`.

### Print/PDF
`@media print` CSS hides editor controls and formats the two `.page` divs for A4 paper. Users print via the browser's print dialog (must enable "Background graphics" for the yellow gradient highlights to appear).