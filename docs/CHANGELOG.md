# Changelog

All notable changes to Inkpen will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

#### Slash Commands Extension (v0.3.0)
- Notion-style "/" command palette for rapid block insertion
- Type "/" to open menu, then type to filter commands
- Keyboard navigation: Arrow keys, Enter to select, Escape to close
- Grouped commands: Basic, Lists, Blocks, Media, Advanced
- Default commands include:
  - Basic: Text, Heading 1/2/3
  - Lists: Bullet, Numbered, Task
  - Blocks: Quote, Code Block, Plain Text, Divider
  - Media: Image, YouTube, Table
  - Advanced: Section
- Fuzzy search across title, keywords, and description
- Customizable command list via Ruby configuration
- Dark mode support
- Smooth animations

#### Preformatted Text Extension (v0.3.0)
- New `Preformatted` block type for ASCII art, tables, and diagrams
- Strict monospace font with whitespace preservation (`white-space: pre`)
- Keyboard shortcuts:
  - `Cmd+Shift+P` to toggle preformatted block
  - `Tab` inserts actual tab character (not focus change)
  - `Shift+Tab` removes leading tab
  - `Enter` creates newline (not new block)
  - `Backspace` on empty block exits to paragraph
- Paste handling preserves whitespace exactly
- "Plain Text" label badge in top-right corner
- No formatting marks allowed (bold, italic, etc. disabled)
- Toolbar button added to sticky toolbar
- Dark mode support
- Print and responsive styles

#### Section Extension (v0.2.2)
- New `Section` block type for page-builder style layouts
- Width presets: narrow (560px), default (680px), wide (900px), full (100%)
- Spacing presets: none, small, medium, large
- Interactive NodeView with hover controls
- Keyboard shortcut: `Cmd+Shift+S` to wrap selection in section
- Commands: `insertSection`, `setSectionWidth`, `setSectionSpacing`, `wrapInSection`
- Toolbar button added to sticky toolbar

### Changed
- Updated sticky toolbar with Section and Preformatted buttons
- Editor controller now configures Section and Preformatted extensions

---

## [0.2.1] - 2024-12-XX

### Added
- Context-aware toolbar (smart button visibility based on selection)
- Sticky toolbar controller with scroll behavior
- Enhanced editor styles with better typography
- Dark mode improvements

### Fixed
- Underline command execution
- Toolbar button states

---

## [0.2.0] - 2024-XX-XX

### Added
- Initial TipTap integration
- BubbleMenu (floating toolbar on text selection)
- Fixed toolbar option
- Extension system (mentions, tables, code blocks, task lists)
- Theme support (light/dark)

---

## File Reference

### Slash Commands Extension
- Ruby: `lib/inkpen/extensions/slash_commands.rb`
- JavaScript: `app/assets/javascripts/inkpen/extensions/slash_commands.js`
- CSS: `app/assets/stylesheets/inkpen/slash_menu.css`

### Section Extension
- Ruby: `lib/inkpen/extensions/section.rb`
- JavaScript: `app/assets/javascripts/inkpen/extensions/section.js`
- CSS: `app/assets/stylesheets/inkpen/section.css`

### Preformatted Extension
- Ruby: `lib/inkpen/extensions/preformatted.rb`
- JavaScript: `app/assets/javascripts/inkpen/extensions/preformatted.js`
- CSS: `app/assets/stylesheets/inkpen/preformatted.css`
