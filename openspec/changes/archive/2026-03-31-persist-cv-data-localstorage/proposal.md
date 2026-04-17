## Why

When a user uploads a JSON file to populate their CV, the data is lost on page refresh, forcing them to re-upload every time. Persisting the data to localStorage eliminates this friction and makes the editor feel like a proper tool rather than a one-shot workflow.

## What Changes

- On JSON upload, save the parsed CV data to `localStorage` after it is successfully loaded into the editor.
- On page load, check `localStorage` for saved CV data and restore it automatically if present, skipping the need to re-upload.
- When the user applies their changes or switches from edit to view mode the data is also persisted in the `localStorage`. It becomes a repository for persistance.
- The default CV_DATA is changed and all personal information is removed from it and replaced with generic placeholders

## Capabilities

### New Capabilities
- `cv-data-persistence`: Automatically saves and restores CV data using the browser's localStorage so data survives page refreshes.

### Modified Capabilities

## Impact

- Create a new Javascript file `repository.js` that is then imported using ES6 imports in `index.js`. The repository should feel like a DDD repo. It should read and persist the JSON to localStorage
- No external dependencies added.
- No breaking changes.
