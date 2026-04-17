## Why

When a user is working in edit mode and refreshes the page (or shares the URL), the app always resets to viewer mode, losing their context. Persisting the active mode in the URL makes the experience more predictable and allows bookmarking or reloading without losing the current view state.

## What Changes

- The browser URL will reflect the current mode: `?mode=edit` or `?mode=view` (default)
- Switching between edit and viewer modes pushes a new history entry (`history.pushState`) instead of a full page reload
- On initial load (and on `popstate` events), the app reads the `mode` query parameter and activates the correct panel
- The existing `switchToEdit()` and `switchToView()` functions are extended to update the URL

## Capabilities

### New Capabilities
- `mode-url-routing`: URL-based routing for editor/viewer mode — syncing `?mode=` query param with the active panel on load, mode switch, and browser back/forward navigation

### Modified Capabilities
<!-- No existing spec-level behavior changes -->

## Impact

- `src/editor.js`: `switchToEdit`, `switchToView`, and `initApp` are modified
- `src/main.js`: initial load logic reads the URL param before calling `initApp`
- No new dependencies required (uses native `history.pushState` and `URLSearchParams`)
