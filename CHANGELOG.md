# Changelog

## [v1.1.0] - 2026-02-27

### New Features
- **Flexible UI Layout**: The application has been reorganized into separate `index.html`, `style.css`, and `script.js` files for better maintainability.
- **Advanced Table Options**: Added support for:
  - Custom Title and Footer text.
  - Optional "Week Starting" or "Week #" indicators.
  - Customizable "Week starts on" day (Sunday/Monday etc.).
  - "Pad weeks" option to show leading/trailing empty cells in the calendar grid.
- **Improved Date Handling**: Support for multiple date locales (`en-GB` and `en-US`).
- **Placeholder UI**: Added elements for future multi-medication support and dosing flexibility.

### Improvements
- **UI/UX Updates**: New dashed boxes in the settings panel to indicate non-printable areas.
- **Responsive Styling**: Improved CSS for table layouts and printing.
- **Documentation**: Updated `README.md` with overview, to-do list, and usage notes.

### Technical/Infrastructure
- **Build System**: Introduced a PowerShell-based build script (`.dev/build.ps1`) for inlining assets.
- **Project Structure**: Added `package.json` for project metadata and `LICENSE` file.
- **Git Integration**: Added `.gitignore` and `.dev/` directory for development artifacts and to-do lists.

---
*Note: This changelog summarizes the differences between the `stable` (initial) release and `v1.1.0`.*
