## 1. URL sync on mode switch

- [x] 1.1 In `switchToEdit()`, call `history.pushState({ mode: 'edit' }, '', ...)` updating `?mode=edit` while preserving other query params
- [x] 1.2 In `switchToView()`, call `history.pushState({ mode: 'view' }, '', ...)` removing the `mode` param while preserving other query params
- [x] 1.3 Extract a helper `buildModeUrl(mode)` that returns the updated URL string to keep the logic DRY

## 2. Restore mode on initial load

- [x] 2.1 In `initApp()`, read `?mode=` from `location.search` after data is loaded
- [x] 2.2 If `mode === 'edit'`, call `switchToEdit()` (skip the guard that checks `currentMode`) to activate the editor
- [x] 2.3 Call `history.replaceState` on initial load to normalize the URL (e.g. remove unknown mode values) without adding a history entry

## 3. Back/forward navigation support

- [x] 3.1 Add a `popstate` event listener in `initApp()` that reads `event.state.mode` (or falls back to reading `location.search`)
- [x] 3.2 On `popstate`, call `switchToView()` or `switchToEdit()` based on the restored mode, without pushing a new history entry (add a flag or separate internal functions)
