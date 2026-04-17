## ADDED Requirements

### Requirement: Paste strips all font and style overrides
When HTML is pasted into a wysiwyg field, the system SHALL strip all inline `style`, `class`, and font-related attributes from the pasted content so that the CV editor's default font family and size are applied via CSS inheritance.

#### Scenario: Pasting from Google Docs removes font overrides
- **WHEN** user pastes text copied from Google Docs with `font-family: Arial` and `font-size: 12pt` inline styles
- **THEN** the pasted text appears using the wysiwyg-content default font (`'Segoe UI', Arial, sans-serif`, 13px) with no inline style attributes

#### Scenario: Pasting from Word removes color and size
- **WHEN** user pastes text copied from Microsoft Word that carries `color: #000000`, `font-size: 11pt` inline styles
- **THEN** the pasted text contains no inline `style` attributes and inherits the CV editor font and color

#### Scenario: Plain text paste is unchanged
- **WHEN** user pastes plain text (no HTML in clipboard)
- **THEN** the text is inserted as-is with no style attributes added

### Requirement: Paste preserves semantic formatting
When HTML is pasted into a wysiwyg field, the system SHALL preserve bold, italic, underline, and list structure from the original source, including formatting expressed via inline styles when no semantic tag is present.

#### Scenario: Semantic bold tag is preserved
- **WHEN** user pastes HTML containing `<b>bold text</b>` or `<strong>bold text</strong>`
- **THEN** the pasted content includes a `<b>` or `<strong>` tag wrapping the bold text

#### Scenario: Style-only bold is converted to semantic tag
- **WHEN** user pastes a `<span style="font-weight: bold">text</span>` or `<span style="font-weight: 700">text</span>`
- **THEN** the pasted content wraps the text in `<b>` and the `<span>` is removed

#### Scenario: Style-only italic is converted to semantic tag
- **WHEN** user pastes a `<span style="font-style: italic">text</span>`
- **THEN** the pasted content wraps the text in `<i>` and the `<span>` is removed

#### Scenario: Style-only underline is converted to semantic tag
- **WHEN** user pastes a `<span style="text-decoration: underline">text</span>`
- **THEN** the pasted content wraps the text in `<u>` and the `<span>` is removed

#### Scenario: Unordered list is preserved
- **WHEN** user pastes HTML containing `<ul><li>item</li></ul>`
- **THEN** the pasted content contains a `<ul>` with `<li>` items intact

#### Scenario: Ordered list is preserved
- **WHEN** user pastes HTML containing `<ol><li>item</li></ol>`
- **THEN** the pasted content contains an `<ol>` with `<li>` items intact

#### Scenario: Heading tags are converted to paragraphs
- **WHEN** user pastes HTML containing `<h1>`, `<h2>`, or other heading tags
- **THEN** headings are converted to `<p>` tags (existing behavior preserved)
