# Changelog

All notable changes to Inkpen will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.7.0] - 2024-12-29

### Added

#### Export/Import Module (v0.7.0)
- Complete export system for Markdown, HTML, and PDF formats
- Export utility functions accessible via editor controller

#### Markdown Export/Import
- Export to GitHub-Flavored Markdown (GFM)
- Import from Markdown files with HTML conversion
- Frontmatter support (YAML metadata parsing and serialization)
- Table conversion to GFM table syntax
- Code block language preservation
- Task list serialization with checkbox syntax
- Callout to GFM alert syntax mapping (`> [!NOTE]`)
- Toggle block to HTML `<details>` conversion
- Image captions and alt text preservation
- Commands: `exportMarkdown`, `importMarkdown`, `downloadAsMarkdown`, `copyAsMarkdown`
- Utility functions: `exportToMarkdown`, `importFromMarkdown`, `downloadMarkdown`, `copyMarkdownToClipboard`

#### HTML Export
- Clean semantic HTML5 output
- Full document wrapper with `<!DOCTYPE html>` and proper structure
- Optional inline CSS styling (all styles embedded in `<style>` tag)
- Configurable class prefixes for custom styling
- Theme support (light/dark/auto)
- Print-optimized styles with proper page breaks
- Dark mode CSS with `@media (prefers-color-scheme: dark)`
- Styles for all Inkpen block types (callouts, tables, TOC, etc.)
- Commands: `exportHTML`, `downloadAsHTML`, `copyAsHTML`
- Utility functions: `exportToHTML`, `downloadHTML`, `copyHTMLToClipboard`, `getExportStylesheet`

#### PDF Export
- Client-side PDF generation using html2pdf.js (optional dependency)
- Automatic fallback to print dialog when library not available
- Page size options: A4, Letter, Legal, A3, A5
- Portrait and landscape orientation
- Configurable margins (top, right, bottom, left in mm)
- Footer with page numbers
- PDF metadata support (title, author, subject)
- Quality settings for image rendering
- Dynamic library loading: `loadHtml2Pdf()` function
- Commands: `exportPDF`, `downloadAsPDF`, `loadPDFLibrary`, `isPDFExportAvailable`
- Utility functions: `exportToPDF`, `loadHtml2Pdf`, `isPDFExportAvailable`, `getPageSizes`, `getDefaultPDFOptions`

#### Export UI Components
- Export menu dropdown styles
- Export dialog/modal styles
- PDF options form with page size, orientation, margins
- Progress indicator with spinner animation
- Success and error message styles
- CSS: `app/assets/stylesheets/inkpen/export.css`

#### Sticky Toolbar Export Integration
- Optional export dropdown button in sticky toolbar
- Configure via `data-inkpen--sticky-toolbar-show-export-value="true"`
- Customizable export formats via `data-inkpen--sticky-toolbar-export-formats-value='["markdown","html","pdf"]'`
- Download options: Markdown, HTML, PDF
- Copy options: Copy as Markdown, Copy as HTML
- Events: `inkpen:export-success`, `inkpen:export-error`

#### Export Commands Extension
- TipTap extension for export keyboard shortcuts
- Keyboard shortcuts:
  - `Cmd+Alt+M`: Download as Markdown
  - `Cmd+Alt+H`: Download as HTML
  - `Cmd+Alt+P`: Download as PDF
  - `Cmd+Alt+Shift+M`: Copy as Markdown
  - `Cmd+Alt+Shift+H`: Copy as HTML
- Commands: `downloadMarkdown`, `downloadHTML`, `downloadPDF`, `copyMarkdown`, `copyHTML`, `getMarkdown`, `getHTML`
- Configurable default filename and export options
- Callback hooks: `onExportSuccess`, `onExportError`
- JavaScript: `app/assets/javascripts/inkpen/extensions/export_commands.js`

---

## [0.6.0] - 2024-12-XX

### Added

#### Advanced Tables Extension (v0.6.0)
- Extended TipTap Table with professional features
- Column alignment (left, center, right) via toolbar or keyboard shortcuts
- Table caption/title (editable)
- Striped rows option
- Border style variants (default, striped, borderless, minimal)
- Table toolbar on cell selection
- Cell background colors (7 color options)
- Sticky header behavior
- Keyboard shortcuts: `Cmd+Shift+L/E/R` for alignment
- Commands: `setTableCaption`, `setTableVariant`, `setCellAlignment`, `setCellBackground`, `toggleStickyHeader`
- Dark mode support
- Mobile-optimized

#### Database Block Extension (v0.6.0)
- Notion-style inline databases
- Property types: Text, Number, Select, Date, Checkbox, URL
- Views: Table, List, Gallery, Board (Kanban)
- Add/edit/delete rows inline
- Add new properties with type selection
- Select properties with color-coded tags
- Editable database title
- View switching via tab buttons
- Commands: `insertDatabase`, `setDatabaseTitle`, `setDatabaseView`, `addDatabaseRow`, `updateDatabaseRow`, `deleteDatabaseRow`, `addDatabaseProperty`
- Slash commands: `/database`, `/kanban`, `/gallery`
- Dark mode support
- Mobile-optimized

#### Table of Contents Extension (v0.6.0)
- Auto-detect headings (H1-H6)
- Clickable links with smooth scroll
- Configurable max depth (H1-H6)
- Numbered, bulleted, or plain style
- Collapsible sections
- Sticky positioning option
- Real-time updates as document changes
- Settings dropdown for customization
- Keyboard shortcut: `Cmd+Shift+T`
- Commands: `insertTableOfContents`, `setTocMaxDepth`, `setTocStyle`, `setTocTitle`
- Slash command: `/toc`
- Dark mode support
- Mobile-optimized

---

#### Social Embed Extension (v0.5.0)
- Paste URL to auto-embed from supported platforms
- Supported providers:
  - YouTube videos
  - Twitter/X posts
  - Instagram posts
  - TikTok videos
  - Figma designs
  - Loom videos
  - CodePen pens
  - GitHub Gists
  - Spotify tracks/playlists
  - Vimeo videos
- Privacy mode: placeholder until user clicks to load
- Link card fallback for unsupported URLs
- Provider-specific aspect ratios and styling
- Dark mode support
- Mobile-optimized
- Commands: `insertEmbed`, `loadEmbed`, `setEmbedError`
- Slash commands: `/embed`, `/twitter`, `/instagram`, `/figma`, `/loom`, `/codepen`, `/spotify`

#### File Attachment Extension (v0.5.0)
- Drag & drop file upload
- Paste file from clipboard
- File type icons for 30+ formats (PDF, Word, Excel, ZIP, audio, video, code)
- File size display with human-readable formatting
- Download button with hover animation
- Upload progress indicator with animated progress bar
- Configurable upload endpoint or base64 fallback
- File type and size validation
- Error state with retry/remove options
- Mobile-optimized touch targets
- Dark mode support
- Commands: `insertFileAttachment`, `uploadFile`
- Slash command: `/file`

#### Enhanced Image Extension (v0.5.0)
- Resizable images with corner drag handles
- Alignment options: left, center, right, full-width
- Image captions (editable text below image)
- Lightbox preview on double-click
- Alt text editing via toolbar
- Link wrapping (make image clickable)
- Drag & drop image upload (base64)
- Paste image from clipboard
- Aspect ratio lock during resize
- Mobile-optimized touch targets
- Dark mode support
- Commands: `setEnhancedImage`, `setImageAlignment`, `setImageWidth`, `setImageCaption`, `setImageLink`, `setImageAlt`
- Keyboard: Backspace/Delete removes selected image

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

### Social Embed Extension
- JavaScript: `app/assets/javascripts/inkpen/extensions/embed.js`
- CSS: `app/assets/stylesheets/inkpen/embed.css`

### File Attachment Extension
- JavaScript: `app/assets/javascripts/inkpen/extensions/file_attachment.js`
- CSS: `app/assets/stylesheets/inkpen/file_attachment.css`

### Enhanced Image Extension
- JavaScript: `app/assets/javascripts/inkpen/extensions/enhanced_image.js`
- CSS: `app/assets/stylesheets/inkpen/enhanced_image.css`

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

### Export Module
- JavaScript: `app/assets/javascripts/inkpen/export/index.js`
- Markdown: `app/assets/javascripts/inkpen/export/markdown.js`
- HTML: `app/assets/javascripts/inkpen/export/html.js`
- PDF: `app/assets/javascripts/inkpen/export/pdf.js`
- CSS: `app/assets/stylesheets/inkpen/export.css`
