## 1. Style-to-semantic pre-pass

- [x] 1.1 Add a `convertStylesToSemantic(node)` helper in `src/editor.js` that recursively walks a parsed DOM and replaces `<span>`/`<font>` elements carrying `font-weight: bold/700+`, `font-style: italic`, or `text-decoration: underline` styles with the corresponding `<b>`, `<i>`, `<u>` wrapper elements
- [x] 1.2 Call `convertStylesToSemantic` on `doc.body` inside `cleanPasteHtml`, before the existing `walk()` call

## 2. Attribute stripping validation

- [x] 2.1 Verify (by inspection or manual test) that the existing `walk()` function already drops all attributes from reconstructed allowed tags — if any path copies attributes, fix it
- [x] 2.2 Confirm `SPAN` and `FONT` tags become `DocumentFragment` (unwrapped), not `<p>` — adjust `PASTE_TO_P` if needed to exclude them

## 3. Manual testing

- [x] 3.1 Paste from Google Docs: verify text uses CV default font/size, bold and italic are preserved as `<b>`/`<i>` tags
- [x] 3.2 Paste from Microsoft Word: verify no inline `style` attributes survive, bullet lists render correctly
- [x] 3.3 Paste plain text: verify line breaks convert to `<br>` and no styling is added
- [x] 3.4 Paste a heading (`<h1>`, `<h2>`): verify it converts to `<p>` without font overrides
