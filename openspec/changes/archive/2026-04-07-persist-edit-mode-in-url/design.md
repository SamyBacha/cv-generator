## Context

The CV editor is a single-page app with two modes: viewer (default) and editor. Mode switching is handled entirely in JS (`switchToEdit` / `switchToView` in `editor.js`). Currently the URL never changes, so refreshing always resets to viewer mode and the browser back/forward buttons have no effect on mode.

The app already uses `URLSearchParams` in several places (e.g. `?name=` for loading a specific CV file), so extending URL state is a natural fit.

## Goals / Non-Goals

**Goals:**
- Sync the active mode to the URL as a `?mode=` query parameter
- Restore the correct mode on page load based on the URL
- Support browser back/forward navigation between modes

**Non-Goals:**
- Full client-side router (no hash routing, no path-based routing)
- Persisting scroll position or editor panel state across reloads
- Server-side rendering or SSR-aware routing

## Decisions

### 1. `history.pushState` over `location.search` assignment

Directly assigning `location.search` triggers a full page reload, which would re-fetch the CV data and reset all state. `history.pushState` updates the URL silently without reloading.

*Alternative considered*: Hash-based routing (`#edit`). Rejected because `hashchange` events are simpler but hashes are semantically for in-page anchors and feel inconsistent with the existing `?name=` param pattern.

### 2. Query param `?mode=edit` / default = view

Using a query parameter keeps it consistent with the existing `?name=` pattern. The viewer is the default — no `?mode=` param (or `?mode=view`) means viewer mode. Only `?mode=edit` activates the editor, keeping URLs clean for the common case (sharing a CV to view).

*Alternative considered*: `?mode=view` explicit. Rejected for cleaner shareable URLs.

### 3. Read mode in `initApp`, not in `main.js`

`initApp` already owns the mode state (`currentMode`). Centralizing the initial mode detection there avoids spreading URL logic across files. `main.js` stays focused on data loading.

### 4. `popstate` listener for back/forward

When the user navigates back/forward, the `popstate` event fires. We listen for it and call `switchToView()` or `switchToEdit()` accordingly, without pushing a new history entry (to avoid duplicating history).

## Risks / Trade-offs

- **Double history entry on load**: If `initApp` pushes a state on initial load, it could create an extra back-step. Mitigation: use `history.replaceState` for the initial sync (not `pushState`).
- **Mode/data mismatch on back navigation**: If the user loads a different CV via `?name=` then navigates back, the CV data won't revert (only mode changes). This is acceptable since data is separate state. Document as known limitation.
- **`popstate` not fired on `pushState`**: Browsers don't fire `popstate` when you call `pushState`. Our switch functions handle this directly, so no issue.
