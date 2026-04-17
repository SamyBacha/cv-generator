## ADDED Requirements

### Requirement: URL reflects active mode
The system SHALL keep the browser URL in sync with the active mode by updating the `?mode=` query parameter whenever the mode changes.

#### Scenario: Switching to edit mode updates URL
- **WHEN** the user clicks the "Édition" button
- **THEN** the URL SHALL be updated to include `?mode=edit` without triggering a page reload

#### Scenario: Switching to viewer mode updates URL
- **WHEN** the user clicks the "Visualisation" button
- **THEN** the `mode` query parameter SHALL be removed from the URL (or set to `view`) without triggering a page reload

#### Scenario: Other query parameters are preserved
- **WHEN** the mode changes while a `?name=` (or other) parameter is present
- **THEN** the URL update SHALL preserve all existing query parameters and only modify `?mode=`

### Requirement: Mode is restored on page load
The system SHALL read the `?mode=` query parameter on initial load and activate the corresponding mode before rendering.

#### Scenario: Loading with `?mode=edit`
- **WHEN** the page is loaded with `?mode=edit` in the URL
- **THEN** the editor panel SHALL be shown instead of the viewer panel

#### Scenario: Loading with no mode param or `?mode=view`
- **WHEN** the page is loaded without a `?mode=` parameter, or with `?mode=view`
- **THEN** the viewer panel SHALL be shown (default behavior, unchanged)

### Requirement: Browser back/forward navigation restores mode
The system SHALL listen for browser history navigation events and switch to the mode recorded in the URL state.

#### Scenario: Navigating back to viewer after editing
- **WHEN** the user has switched to edit mode and then presses the browser back button
- **THEN** the viewer panel SHALL be restored without a page reload

#### Scenario: Navigating forward to edit mode
- **WHEN** the user has navigated back to viewer mode and then presses the browser forward button
- **THEN** the editor panel SHALL be restored without a page reload

#### Scenario: Initial URL is replaced, not pushed
- **WHEN** the page first loads with a `?mode=edit` URL
- **THEN** the initial history entry SHALL be replaced (not duplicated) so that the back button exits the app rather than looping
