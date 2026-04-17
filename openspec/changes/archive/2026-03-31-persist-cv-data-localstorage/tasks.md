## 1. Repository Module

- [x] 1.1 Create `repository.js` with a `saveCV(data)` function that serializes the object to JSON and writes it to `localStorage["proxym_cv_data"]`. If the upload fails a clear error should be shown to the user so that they know that their data is not persisted

- [x] 1.2 Add a `loadCV()` function to `repository.js` that reads `localStorage["proxym_cv_data"]`, parses it, and returns the object — returning `null` on missing key. If a local storage read error occurs a clear error should be shown to the user informing them the data is corrupted.
 
- [x] 1.3 Wire `repository.js` into the HTML file via a `<script type="module">` tag (or inline the module if a separate file is not viable for the static setup)

## 2. Save on Upload

- [x] 2.1 In the JSON upload success handler (where `CV_DATA` is populated), call `saveCV(CV_DATA)` immediately after the data is loaded and the view is updated

## 3. Save on Apply

- [x] 3.1 In the `switchToView()` function (where `editData` is copied into `CV_DATA`), call `saveCV(CV_DATA)` after the copy and before or after the web components re-render

## 4. Restore on Page Load

- [x] 4.1 At script initialisation (after helpers and components are defined, before first render), call `loadCV()` and if a non-null result is returned, assign it to `CV_DATA`

## 5. Default Data Cleanup

- [x] 5.1 In the embedded `cv-data` JSON in `index.html`, replace all personal fields (name, email, phone, address, photo URL, etc.) with clearly identifiable placeholder values (e.g. `"Prénom Nom"`, `"email@example.com"`, `"+33 6 00 00 00 00"`)
