## Why

When users paste text from external sources (Word, Google Docs, web pages), the pasted content can carry inline styles (`font-family`, `font-size`, `color`, etc.) that clash with the CV's design. The result is mixed fonts and sizes inside the editor, breaking visual consistency. The fix is needed because the current `cleanPasteHtml` function strips tag-level styles but browser paste behavior and edge cases (e.g. Google Docs wrapping spans) can still introduce foreign styling.

## What Changes

- Enhance `cleanPasteHtml` in `src/editor.js` to explicitly strip all `style`, `class`, `color`, and `font`-related attributes from pasted elements
- Ensure inline spans with only style attributes are unwrapped to plain text (or their semantic equivalent)
- Preserve structural/semantic formatting: `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<ul>`, `<ol>`, `<li>`, `<br>`, `<p>`
- The wysiwyg content area already defines the correct default font (`'Segoe UI', Arial, sans-serif`, 13px) via CSS — pasted content will inherit it once inline overrides are stripped

## Capabilities

### New Capabilities

- `paste-normalization`: Intercept paste events in contenteditable wysiwyg fields and normalize pasted HTML to strip all font/color/size overrides while preserving bold, italic, underline, and list structure

### Modified Capabilities

- `cv-data-persistence`: No requirement changes — this is editor-only behavior, stored HTML values will be cleaner going forward

## Impact

- `src/editor.js`: Modify `cleanPasteHtml` and the paste event handler
- No changes to CV data schema, JSON format, or rendering components
- No new dependencies
