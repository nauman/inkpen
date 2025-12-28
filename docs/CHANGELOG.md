# Changelog

All notable changes to Inkpen will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

#### Block Commands Extension (v0.4.0)
- Block selection via gutter click (drag handle)
- Multi-block selection with Shift+Click
- Duplicate block command: `Cmd+D`
- Delete empty block on Backspace
- Select entire block with `selectBlock` command
- ProseMirror plugin for selection state management
- Decorations for selected block highlighting

#### Animations & Polish (v0.4.0)
- Block entry animations (fade + slide up)
- Block focus ring animation
- Selected block highlighting (`.is-selected`)
- Menu entrance animations (slash menu, bubble menu, dropdowns)
- Gutter fade in/out transitions
- Toggle block expand/collapse animations
- Cursor and placeholder fade animations
- Table cell selection animation
- Image load and selection animations
- Horizontal rule entrance animation
- Custom scrollbar styling
- Mobile touch optimizations:
  - Larger touch targets (32px)
  - Tap feedback instead of hover effects
  - Always-visible gutter on mobile
  - Faster animations for snappy feel
  - Touch-friendly block selection
  - Smooth scrolling
- Reduced motion support (`prefers-reduced-motion`)
- Print styles (animations disabled)

#### Callout Extension (v0.3.3)
- Highlighted blocks for tips, warnings, notes, and other callouts
- Six types: info, warning, tip, note, success, error
- Default emoji icons per type (customizable)
- Click emoji to change callout type via dropdown
- Colored backgrounds and left borders per type
- Keyboard shortcut: `Cmd+Shift+O` to insert info callout
- Commands: `insertCallout`, `setCalloutType`, `setCalloutEmoji`, `toggleCallout`
- Added to slash commands menu (Info, Warning, Tip)
- Dark mode support
- Print styles

#### Columns Extension (v0.3.3)
- Multi-column layouts (2, 3, or 4 columns)
- Layout presets: equal, 1:2, 2:1, 1:3, 3:1, 1:2:1, etc.
- Interactive controls to change layout and add/remove columns
- Responsive stacking on mobile
- Keyboard shortcut: `Cmd+Shift+C` to insert 2 columns
- Commands: `insertColumns`, `setColumnLayout`, `addColumn`, `removeColumn`
- Added to slash commands menu (2 Columns, 3 Columns)
- Dark mode support
- Print styles

#### Toggle Block Extension (v0.3.3)
- Collapsible/expandable blocks with clickable header
- Native HTML5 `<details>` and `<summary>` elements
- Editable summary text
- Nested block content support
- Smooth expand/collapse animations
- Keyboard shortcuts:
  - `Cmd+Shift+T` to insert toggle
  - `Cmd+Enter` to toggle open/close
  - `Enter` in summary creates content below
  - `Backspace` on empty summary deletes toggle
- Commands: `insertToggle`, `toggleOpen`, `expandToggle`, `collapseToggle`
- Added to slash commands menu
- Dark mode support
- Mobile and reduced motion support
- Print styles (always expanded)

#### Drag & Drop Extension (v0.3.2)
- Block reordering via drag and drop from gutter handles
- Visual drop indicator showing insertion point
- Keyboard shortcuts: `Cmd+Shift+Arrow` to move blocks up/down
- Edge scrolling when dragging near viewport edges
- Custom drag ghost showing block preview
- Commands: `moveBlockUp`, `moveBlockDown`, `moveBlockToPosition`
- Works with Block Gutter extension
- Dark mode support
- Mobile and reduced motion support

#### Block Gutter Extension (v0.3.1)
- Left-side gutter with drag handles and plus buttons for each block
- Drag handle (⋮⋮) for block reordering (prepares for drag & drop)
- Plus button (+) to insert new block below
- Opens slash commands menu when inserting new block
- Shows on hover, auto-hides when not focused
- Skips blocks inside tables and list items
- Mobile-optimized (always visible, larger touch targets)
- Dark mode support
- Reduced motion support
- Print-safe (hidden)

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
- Editor controller now configures Section, Preformatted, Block Gutter, and Drag Handle extensions
- Added `section`, `preformatted`, `block_gutter`, and `drag_handle` to ADVANCED_EXTENSIONS in configuration.rb
- Block Gutter now creates custom drag ghost on drag start

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

### Block Commands Extension
- JavaScript: `app/assets/javascripts/inkpen/extensions/block_commands.js`

### Animations & Polish
- CSS: `app/assets/stylesheets/inkpen/animations.css`

### Callout Extension
- JavaScript: `app/assets/javascripts/inkpen/extensions/callout.js`
- CSS: `app/assets/stylesheets/inkpen/callout.css`

### Columns Extension
- JavaScript: `app/assets/javascripts/inkpen/extensions/columns.js`
- CSS: `app/assets/stylesheets/inkpen/columns.css`

### Toggle Block Extension
- JavaScript: `app/assets/javascripts/inkpen/extensions/toggle_block.js`
- CSS: `app/assets/stylesheets/inkpen/toggle.css`

### Drag & Drop Extension
- JavaScript: `app/assets/javascripts/inkpen/extensions/drag_handle.js`
- CSS: `app/assets/stylesheets/inkpen/drag_drop.css`

### Block Gutter Extension
- JavaScript: `app/assets/javascripts/inkpen/extensions/block_gutter.js`
- CSS: `app/assets/stylesheets/inkpen/block_gutter.css`

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
