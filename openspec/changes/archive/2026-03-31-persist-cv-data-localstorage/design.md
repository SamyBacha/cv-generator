## Context

The CV editor is a single self-contained HTML file with no build tooling. CV data flows as follows: a JSON file is uploaded by the user → parsed into `CV_DATA` → deep-copied into `editData` → rendered by web components. On page refresh all of this is lost. The browser's `localStorage` API is the natural fit for persistence in a purely static, server-less app.

## Goals / Non-Goals

**Goals:**
- Persist the last successfully loaded CV JSON data across page refreshes using `localStorage`.
- Restore saved data transparently on page load without user interaction.
- Allow the user to start fresh by uploading a new JSON file (which replaces the stored data).

**Non-Goals:**
- Syncing data across devices or browsers.
- Versioning or history of CV snapshots.
- Persisting in-progress editor edits that have not been applied (only committed/uploaded data is saved).
- Any server-side storage.

## Decisions

### Decision 1: Store the raw parsed JSON object, not the HTML
**Chosen**: Serialize `CV_DATA` (the canonical data object) to JSON and store it under a single `localStorage` key (e.g. `proxym_cv_data`).

**Alternatives considered**:
- Store the raw file text: rejected — the upload handler already parses JSON; re-parsing on restore is identical cost, and storing the object is simpler.
- Store `editData`: rejected — `editData` is an ephemeral working copy; `CV_DATA` is the source of truth that the web components render from.

### Decision 2: Save point — after successful upload only
**Chosen**: Write to `localStorage` inside the existing JSON upload success handler, immediately after `CV_DATA` is populated and the view is updated.

Also save when the user clicks "Apply" / switches to view mode

**Alternatives considered**:
- Save on every editor change: rejected — in-progress edits are not yet "accepted" by the user; this would persist potentially inconsistent state.

### Decision 3: Restore point — synchronously at script initialisation
**Chosen**: At the bottom of the `<script>` block (after all helpers and components are defined but before the page first renders), check `localStorage` and if data is present, set `CV_DATA` and trigger a render. This way the page renders the restored data on the first paint with no visible flicker.

**Alternatives considered**:
- Restore on `DOMContentLoaded`: works, but identical to the current script execution order since the script is already deferred to end of `<body>`.

## Risks / Trade-offs

- **localStorage quota exceeded** → Mitigation: CV JSON payloads are small (typically < 50 KB); quota limit is 5 MB. Wrap the `setItem` call in a try/catch and log a warning if it fails, so the app continues to function.
- **Corrupt/stale data in localStorage** → Mitigation: wrap the `getItem` + `JSON.parse` call in a try/catch; silently ignore and fall back to the default embedded data if parsing fails.
- **User cannot easily clear saved data** → Acceptable for now; uploading a new file overwrites it. A "reset" button is a separate future concern.
