## Context

The CV editor uses `contenteditable` wysiwyg fields managed in `src/editor.js`. A global `paste` event listener intercepts paste events on these fields, calls `cleanPasteHtml` to sanitize clipboard HTML, then inserts the result via `document.execCommand("insertHTML")`.

`cleanPasteHtml` already creates new DOM elements (stripping attributes), but the current approach has gaps:
- Google Docs wraps content in `<b style="font-weight:normal">` with inner `<span style="font-family:...; font-size:12pt; font-weight:700">` — the span becomes a fragment, dropping the bold signal carried as a style
- Some sources use `<span style="font-weight:bold">` as their bold mechanism with no semantic `<b>` tag — currently stripped to unstyled text
- Browser-native paste via `execCommand` can re-introduce some browser-default styles in certain engines

The default CV editor font is `'Segoe UI', Arial, sans-serif` at `13px`, set via `.wysiwyg-content` in `style.css`. Pasted content should inherit this rather than override it.

## Goals / Non-Goals

**Goals:**
- Strip all font, color, size, and spacing inline styles from pasted content
- Preserve semantic structure: bold, italic, underline, bullet lists, numbered lists, line breaks
- Recover bold/italic intent expressed only via `style` attributes (e.g. `font-weight:bold`, `font-style:italic`) and convert to semantic tags
- Keep the fix contained to `cleanPasteHtml` and the paste handler in `src/editor.js`

**Non-Goals:**
- Changing how existing stored CV HTML is rendered
- Supporting tables, images, or other rich media from paste
- Handling paste in non-wysiwyg fields (plain `<input>`)

## Decisions

### 1. Style-to-semantic conversion before stripping

Before sanitizing tags, scan the parsed clipboard DOM and convert style-only formatting signals to semantic equivalents:
- `font-weight: bold` / `font-weight: 700..900` → wrap content in `<b>`
- `font-style: italic` → wrap content in `<i>`
- `text-decoration: underline` → wrap content in `<u>`

This runs as a pre-pass on the parsed document before `walk()` processes it. Alternative considered: inspect styles during `walk()` — rejected because it mixes concerns and makes the walk function harder to reason about.

### 2. Keep `PASTE_ALLOWED` set, drop all attributes

The existing allowed-tag allowlist (`B`, `STRONG`, `I`, `EM`, `U`, `UL`, `OL`, `LI`, `BR`, `P`) is correct. The `walk` function already creates new elements (no attribute copying), so inline styles on allowed tags are already dropped. No change needed here.

### 3. Unwrap font/span containers

`SPAN` and `FONT` elements are not in `PASTE_ALLOWED` or `PASTE_TO_P`, so they already become `DocumentFragment`. This correctly unwraps them, but their style information (bold signal) is lost. The pre-pass (Decision 1) recovers this before stripping.

### 4. No change to `execCommand`

`document.execCommand("insertHTML")` is deprecated but still universally supported and already in use. Replacing it (e.g. with `Selection.getRangeAt` + `insertNode`) is out of scope for this change.

## Risks / Trade-offs

- **Complex nested styles from Google Docs** → The pre-pass handles common cases; unusual nesting may lose bold/italic on first paste. Mitigation: user can apply bold/italic manually via toolbar.
- **`font-weight: 700` on a `<p>` making the whole paragraph bold** → The pre-pass wraps children in `<b>` rather than the `<p>` itself, preserving correct semantics. Edge case: empty paragraphs with bold style will not emit `<b>` tags.
- **execCommand deprecation** → Not a new risk; already present. Out of scope.

## Migration Plan

No migration needed — this is a progressive enhancement to the paste handler. Existing stored HTML in CV JSON files is unaffected. The change takes effect immediately on next paste.
