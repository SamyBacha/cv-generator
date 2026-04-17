## ADDED Requirements

### Requirement: Save CV data on successful JSON upload
After a user uploads a valid JSON file and the data is successfully loaded into the editor, the system SHALL serialize `CV_DATA` to JSON and write it to `localStorage` under the key `proxym_cv_data`.

#### Scenario: Valid JSON file uploaded
- **WHEN** the user uploads a JSON file that parses successfully into CV data
- **THEN** the system stores the serialized CV data in `localStorage["proxym_cv_data"]`

#### Scenario: localStorage write fails due to quota
- **WHEN** the system attempts to write to `localStorage` and a `QuotaExceededError` is thrown
- **THEN** the system catches the error, logs a warning to the console, and continues normally without crashing

### Requirement: Save CV data when applying changes
When the user applies editor changes (switches from edit mode to view mode), the system SHALL serialize and persist the updated `CV_DATA` to `localStorage` under the key `proxym_cv_data`.

#### Scenario: User applies edits and switches to view mode
- **WHEN** the user confirms edits and the view is updated with the new `CV_DATA`
- **THEN** the system stores the updated serialized CV data in `localStorage["proxym_cv_data"]`

### Requirement: Restore CV data on page load
On page initialisation, the system SHALL check `localStorage` for a previously saved CV data entry and, if valid, use it as the initial `CV_DATA` so the page renders the restored data on first paint without user interaction.

#### Scenario: Valid saved data found in localStorage
- **WHEN** the page initialises and `localStorage["proxym_cv_data"]` contains a valid JSON string
- **THEN** the system parses it into `CV_DATA` and renders the CV with the restored data before the first paint

#### Scenario: No saved data in localStorage
- **WHEN** the page initialises and `localStorage["proxym_cv_data"]` is absent or null
- **THEN** the system uses the default embedded `CV_DATA` without any error

#### Scenario: Corrupt or unparseable data in localStorage
- **WHEN** the page initialises and `localStorage["proxym_cv_data"]` contains a string that is not valid JSON
- **THEN** the system catches the parse error, ignores the saved entry, and falls back to the default embedded `CV_DATA`

### Requirement: Default CV data uses generic placeholders
The default CV data embedded in the HTML file SHALL contain no real personal information. All personal fields (name, email, phone, address, photo, etc.) SHALL be replaced with clearly identifiable placeholder values.

#### Scenario: Page loads with no saved data
- **WHEN** the page loads for the first time with no localStorage data
- **THEN** the CV displays placeholder values (e.g. "Prénom Nom", "email@example.com") instead of any real person's information
