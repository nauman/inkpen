# Inkpen: Notion-like Block Editor Implementation Plan

> **Vision**: Transform Inkpen into a world-class Notion/Editor.js style block editor while maintaining Rails-native simplicity.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Completed Extensions](#completed-extensions)
3. [Phase 1: Drag & Drop](#phase-1-drag--drop-v032)
4. [Phase 2: Enhanced Blocks](#phase-2-enhanced-blocks-v033)
5. [Phase 3: BlockNote-Style Polish](#phase-3-blocknote-style-polish-v040)
6. [Technical References](#technical-references)

---

## Architecture Overview

### Current Stack
```
┌─────────────────────────────────────────────────────┐
│  Rails Application (mademysite.com)                 │
├─────────────────────────────────────────────────────┤
│  Inkpen Gem (Rails Engine)                          │
│  ├── Ruby POROs (Editor, Toolbar, Extensions)       │
│  ├── Stimulus Controllers (editor, toolbar, sticky) │
│  └── TipTap/ProseMirror Core                        │
└─────────────────────────────────────────────────────┘
```

### Target Architecture
```
┌─────────────────────────────────────────────────────┐
│  Rails Application                                   │
├─────────────────────────────────────────────────────┤
│  Inkpen Gem v0.4.0+                                 │
│  ├── Ruby POROs                                     │
│  ├── Stimulus Controllers                           │
│  │   ├── editor_controller.js                       │
│  │   ├── toolbar_controller.js                      │
│  │   ├── sticky_toolbar_controller.js               │
│  │   ├── slash_menu_controller.js      ← NEW        │
│  │   ├── block_gutter_controller.js    ← NEW        │
│  │   └── drag_handle_controller.js     ← NEW        │
│  ├── TipTap Extensions                              │
│  │   ├── SlashCommands                  ← ENHANCED  │
│  │   ├── BlockGutter                    ← NEW       │
│  │   ├── DragHandle                     ← NEW       │
│  │   └── UniqueID                       ← NEW       │
│  └── Helpers                                        │
│      ├── position_helpers.js            ← NEW       │
│      ├── block_helpers.js               ← NEW       │
│      └── drag_helpers.js                ← NEW       │
└─────────────────────────────────────────────────────┘
```

---

## Completed Extensions

### Section Extension (v0.2.2) ✅

Page-builder style layout blocks with configurable width and spacing.

**Features:**
- Width presets: narrow (560px), default (680px), wide (900px), full (100%)
- Spacing presets: none, small (1rem), medium (2rem), large (4rem)
- Interactive NodeView with hover controls
- Keyboard shortcut: `Cmd+Shift+S`

**Files:**
```
lib/inkpen/extensions/section.rb
app/assets/javascripts/inkpen/extensions/section.js
app/assets/stylesheets/inkpen/section.css
```

**Commands:**
- `insertSection()` - Insert new section block
- `setSectionWidth(width)` - Change width preset
- `setSectionSpacing(spacing)` - Change spacing preset
- `wrapInSection()` - Wrap selection in section

---

### Preformatted Text Extension (v0.3.0) ✅

Plain text block for ASCII art, tables, and diagrams with strict whitespace preservation.

**Features:**
- Strict monospace font (no ligatures)
- Whitespace preservation (`white-space: pre`)
- Tab key inserts actual tabs
- No formatting marks allowed (bold, italic disabled)
- "Plain Text" label badge
- Paste handling preserves whitespace

**Files:**
```
lib/inkpen/extensions/preformatted.rb
app/assets/javascripts/inkpen/extensions/preformatted.js
app/assets/stylesheets/inkpen/preformatted.css
```

**Commands:**
- `setPreformatted()` - Convert to preformatted
- `togglePreformatted()` - Toggle preformatted/paragraph
- `insertPreformatted(content)` - Insert with content

**Keyboard Shortcuts:**
| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+P` | Toggle preformatted |
| `Tab` | Insert tab character |
| `Shift+Tab` | Remove leading tab |
| `Enter` | Insert newline (not new block) |
| `Backspace` (empty) | Exit to paragraph |

---

### Slash Commands Extension (v0.3.0) ✅

Notion-style "/" command palette for rapid block insertion.

**Features:**
- Type "/" to open menu, then type to filter
- Keyboard navigation (arrows, Enter, Escape)
- Grouped commands: Basic, Lists, Blocks, Media, Advanced
- Fuzzy search across title, keywords, description
- Customizable command list

**Files:**
```
lib/inkpen/extensions/slash_commands.rb
app/assets/javascripts/inkpen/extensions/slash_commands.js
app/assets/stylesheets/inkpen/slash_menu.css
```

**Default Commands:**
- Basic: paragraph, heading1, heading2, heading3
- Lists: bulletList, orderedList, taskList
- Blocks: blockquote, codeBlock, preformatted, divider
- Media: image, youtube, table
- Advanced: section

---

### Block Gutter Extension (v0.3.1) ✅

Left-side gutter with drag handles and plus buttons for each block.

**Features:**
- Drag handle (⋮⋮) for block reordering
- Plus button (+) to insert new block below
- Integrates with slash commands
- Shows on hover, hides when not focused
- Skips blocks inside tables
- Mobile-optimized

**Files:**
```
app/assets/javascripts/inkpen/extensions/block_gutter.js
app/assets/stylesheets/inkpen/block_gutter.css
```

**Visual Design:**
```
     ┌────────────────────────────────────────┐
     │                                        │
⋮⋮ + │ Heading 1                              │
     │                                        │
     ├────────────────────────────────────────┤
     │                                        │
⋮⋮ + │ Paragraph text goes here...           │
     │                                        │
     ├────────────────────────────────────────┤
     │                                        │
⋮⋮ + │ • List item 1                         │
     │ • List item 2                         │
     │                                        │
     └────────────────────────────────────────┘

Legend:
⋮⋮ = Drag handle (appears on hover)
+  = Plus button (opens slash menu or quick insert)
```

---

## Phase 1: Drag & Drop (v0.3.2) ✅

### Goal
Enable visual block reordering via drag and drop.

**Status:** Complete

### Components

#### 3.1 TipTap Extension: DragHandle
```javascript
// app/assets/javascripts/inkpen/extensions/drag_handle.js

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const DragHandle = Extension.create({
  name: 'dragHandle',

  addOptions() {
    return {
      scrollThreshold: 100,
      scrollSpeed: 10
    }
  },

  addProseMirrorPlugins() {
    const extension = this
    let draggedPos = null
    let dropIndicator = null

    return [
      new Plugin({
        key: new PluginKey('dragHandle'),
        props: {
          handleDOMEvents: {
            dragstart(view, event) {
              const target = event.target.closest('.inkpen-block-gutter__drag')
              if (!target) return false

              const pos = parseInt(target.closest('.inkpen-block-gutter').dataset.pos)
              draggedPos = pos

              // Set drag data
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', pos.toString())

              // Add dragging class
              view.dom.classList.add('is-dragging')

              return true
            },

            dragover(view, event) {
              if (draggedPos === null) return false

              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'

              // Calculate drop position
              const coords = { left: event.clientX, top: event.clientY }
              const dropPos = view.posAtCoords(coords)

              if (dropPos) {
                extension.showDropIndicator(view, dropPos.pos)
              }

              return true
            },

            drop(view, event) {
              if (draggedPos === null) return false

              event.preventDefault()

              const coords = { left: event.clientX, top: event.clientY }
              const dropPos = view.posAtCoords(coords)

              if (dropPos) {
                extension.moveBlock(view, draggedPos, dropPos.pos)
              }

              extension.cleanup(view)
              return true
            },

            dragend(view) {
              extension.cleanup(view)
              return true
            }
          }
        }
      })
    ]
  },

  showDropIndicator(view, pos) {
    // Remove existing indicator
    this.hideDropIndicator()

    // Create new indicator
    const indicator = document.createElement('div')
    indicator.className = 'inkpen-drop-indicator'

    const coords = view.coordsAtPos(pos)
    indicator.style.top = `${coords.top}px`
    indicator.style.left = `${view.dom.getBoundingClientRect().left}px`
    indicator.style.width = `${view.dom.clientWidth}px`

    view.dom.parentNode.appendChild(indicator)
    this.dropIndicator = indicator
  },

  hideDropIndicator() {
    if (this.dropIndicator) {
      this.dropIndicator.remove()
      this.dropIndicator = null
    }
  },

  moveBlock(view, from, to) {
    const { state, dispatch } = view
    const node = state.doc.nodeAt(from)

    if (!node) return

    const tr = state.tr
    const nodeSize = node.nodeSize

    // Delete from original position
    tr.delete(from, from + nodeSize)

    // Adjust target position if needed
    const adjustedTo = to > from ? to - nodeSize : to

    // Insert at new position
    tr.insert(adjustedTo, node)

    dispatch(tr)
  },

  cleanup(view) {
    this.hideDropIndicator()
    view.dom.classList.remove('is-dragging')
    this.draggedPos = null
  }
})
```

#### 3.2 CSS for Drag & Drop
```css
/* app/assets/stylesheets/inkpen/drag_drop.css */

.inkpen-editor.is-dragging {
  cursor: grabbing;
}

.inkpen-editor.is-dragging .ProseMirror > * {
  transition: transform 150ms;
}

.inkpen-drop-indicator {
  position: absolute;
  height: 3px;
  background: var(--inkpen-color-primary);
  border-radius: 1.5px;
  pointer-events: none;
  z-index: 100;
}

.inkpen-drop-indicator::before,
.inkpen-drop-indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  background: var(--inkpen-color-primary);
  border-radius: 50%;
  transform: translateY(-50%);
}

.inkpen-drop-indicator::before {
  left: -4px;
}

.inkpen-drop-indicator::after {
  right: -4px;
}

/* Ghost element during drag */
.inkpen-drag-ghost {
  position: fixed;
  padding: 0.5rem 1rem;
  background: var(--inkpen-toolbar-bg);
  border: 1px solid var(--inkpen-color-border);
  border-radius: var(--inkpen-radius);
  box-shadow: var(--inkpen-shadow);
  opacity: 0.9;
  pointer-events: none;
  z-index: 9999;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### References
- [Plate DnD Examples](https://platejs.org/docs/examples/dnd)
- [React DnD](https://react-dnd.github.io/react-dnd/about)
- [Editor.js Drag Plugin](https://github.com/kommitters/editorjs-drag-drop)

---

## Phase 2: Enhanced Blocks (v0.3.3)

### Goal
Add Notion-style blocks: toggles, columns, callouts with variants.

### 4.1 Toggle/Collapsible Block ✅

**Status:** Complete

**Features:**
- Collapsible/expandable blocks with clickable header
- Native HTML5 `<details>` and `<summary>` elements
- Editable summary text
- Nested block content support
- Smooth expand/collapse animations
- Keyboard shortcuts: `Cmd+Shift+T`, `Cmd+Enter`
- Commands: `insertToggle`, `toggleOpen`, `expandToggle`, `collapseToggle`

**Files:**
```
app/assets/javascripts/inkpen/extensions/toggle_block.js
app/assets/stylesheets/inkpen/toggle.css
```

### 4.1 Toggle/Collapsible Block
```javascript
// app/assets/javascripts/inkpen/extensions/toggle_block.js

import { Node, mergeAttributes } from '@tiptap/core'

export const ToggleBlock = Node.create({
  name: 'toggleBlock',
  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      open: { default: true }
    }
  },

  parseHTML() {
    return [{ tag: 'details' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes, {
      class: 'inkpen-toggle',
      open: HTMLAttributes.open ? '' : null
    }), 0]
  },

  addCommands() {
    return {
      setToggleBlock: () => ({ commands }) => {
        return commands.wrapIn(this.name)
      },
      toggleOpen: () => ({ tr, state }) => {
        // Toggle open attribute
      }
    }
  }
})
```

### 4.2 Column Layout ✅

**Status:** Complete

**Features:**
- Multi-column layouts (2, 3, or 4 columns)
- Layout presets: equal, 1:2, 2:1, 1:3, 3:1, 1:2:1, etc.
- Interactive controls to change layout and add/remove columns
- Responsive stacking on mobile
- Keyboard shortcut: `Cmd+Shift+C`
- Commands: `insertColumns`, `setColumnLayout`, `addColumn`, `removeColumn`

**Files:**
```
app/assets/javascripts/inkpen/extensions/columns.js
app/assets/stylesheets/inkpen/columns.css
```

### 4.3 Callout ✅

**Status:** Complete

**Features:**
- Highlighted blocks for tips, warnings, notes, and other callouts
- Six types: info, warning, tip, note, success, error
- Default emoji icons per type (customizable)
- Click emoji to change callout type via dropdown
- Colored backgrounds and left borders per type
- Keyboard shortcut: `Cmd+Shift+O`
- Commands: `insertCallout`, `setCalloutType`, `setCalloutEmoji`, `toggleCallout`

**Files:**
```
app/assets/javascripts/inkpen/extensions/callout.js
app/assets/stylesheets/inkpen/callout.css
```

### CSS for Enhanced Blocks
```css
/* Toggle */
.inkpen-toggle {
  border: 1px solid var(--inkpen-color-border);
  border-radius: var(--inkpen-radius);
  margin: 1rem 0;
}

.inkpen-toggle > summary {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 500;
  list-style: none;
}

.inkpen-toggle > summary::before {
  content: '▶';
  display: inline-block;
  margin-right: 0.5rem;
  transition: transform 150ms;
}

.inkpen-toggle[open] > summary::before {
  transform: rotate(90deg);
}

.inkpen-toggle > *:not(summary) {
  padding: 0 1rem 1rem;
}

/* Columns */
.inkpen-columns {
  display: grid;
  grid-template-columns: repeat(var(--column-count, 2), 1fr);
  gap: 1.5rem;
  margin: 1rem 0;
}

.inkpen-column {
  min-width: 0;
}

/* Callout variants */
.inkpen-callout--success {
  background: rgba(16, 185, 129, 0.1);
  border-left-color: #10b981;
}

.inkpen-callout--error {
  background: rgba(239, 68, 68, 0.1);
  border-left-color: #ef4444;
}
```

---

## Phase 3: BlockNote-Style Polish (v0.4.0) ✅

### Goal
Add the finishing touches that make the editor feel polished and professional.

**Status:** Complete

### 5.1 Block Commands Extension ✅

**Features:**
- Block selection via gutter click
- Multi-block selection with Shift+Click
- Duplicate block (`Cmd+D`)
- Delete empty block (`Backspace`)
- Select all content in block (`Cmd+A` when block selected)
- Commands: `duplicateBlock`, `deleteBlock`, `selectBlock`, `selectBlockAt`

**Files:**
```
app/assets/javascripts/inkpen/extensions/block_commands.js
```

### 5.2 Smooth Animations ✅

**Features:**
- Block entry animations (fade + slide)
- Block focus ring
- Block selection highlighting
- Menu entrance animations (slash menu, bubble menu, dropdowns)
- Gutter fade in/out
- Toggle block expand/collapse
- Cursor and placeholder animations
- Table cell selection
- Image selection
- Scrollbar styling

**Files:**
```
app/assets/stylesheets/inkpen/animations.css
```

### 5.3 Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `/` | Open slash menu |
| `Cmd+Shift+↑` | Move block up |
| `Cmd+Shift+↓` | Move block down |
| `Cmd+D` | Duplicate block |
| `Backspace` (empty block) | Delete block |
| `Enter` (end of block) | Create new paragraph |
| `Tab` | Indent list item |
| `Shift+Tab` | Outdent list item |

### 5.4 Mobile Touch Optimizations ✅

**Features:**
- Larger touch targets (32px)
- Touch-friendly tap feedback
- Always-visible gutter on mobile
- Faster animations for snappy mobile feel
- Touch-friendly block selection with box-shadow
- Prevent text selection during drag
- Smooth scrolling (`-webkit-overflow-scrolling: touch`)
- Reduced motion support (`prefers-reduced-motion`)
- Print styles (animations disabled)

---

## Phase 4: Media & Embeds (v0.5.0)

### Goal
Transform Inkpen into a rich media editor with enhanced image handling, file attachments, and social embeds.

### 4.1 Enhanced Image Extension (v0.5.0-alpha)

**Features:**
- Resizable images with drag handles
- Alignment options: left, center, right, full-width
- Image captions (editable text below image)
- Lightbox preview on click
- Lazy loading with blur placeholder
- Alt text editing
- Link wrapping (make image clickable)

**Implementation:**
```javascript
// app/assets/javascripts/inkpen/extensions/enhanced_image.js

import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'

export const EnhancedImage = Node.create({
  name: 'enhancedImage',
  group: 'block',

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      alignment: { default: 'center' }, // left, center, right, full
      caption: { default: null },
      link: { default: null }
    }
  },

  addNodeView() {
    // Interactive NodeView with:
    // - Resize handles (corners)
    // - Alignment toolbar on selection
    // - Caption input below image
    // - Lightbox trigger
  },

  addCommands() {
    return {
      setImageAlignment: (alignment) => ({ commands }) => {...},
      setImageWidth: (width) => ({ commands }) => {...},
      setImageCaption: (caption) => ({ commands }) => {...},
      setImageLink: (url) => ({ commands }) => {...}
    }
  }
})
```

**CSS:**
```css
/* app/assets/stylesheets/inkpen/enhanced_image.css */

.inkpen-image {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.inkpen-image--left { margin-right: auto; }
.inkpen-image--center { margin: 0 auto; }
.inkpen-image--right { margin-left: auto; }
.inkpen-image--full { width: 100%; }

.inkpen-image__resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--inkpen-color-primary);
  border: 2px solid white;
  border-radius: 50%;
  cursor: nwse-resize;
}

.inkpen-image__caption {
  text-align: center;
  font-size: 0.875rem;
  color: var(--inkpen-color-text-muted);
  margin-top: 0.5rem;
}
```

**Keyboard Shortcuts:**
| Shortcut | Action |
|----------|--------|
| `Enter` on image | Edit caption |
| `Delete` on image | Remove image |
| `Cmd+Shift+L` | Align left |
| `Cmd+Shift+E` | Align center |
| `Cmd+Shift+R` | Align right |

---

### 4.2 File Attachment Extension (v0.5.0-beta)

**Features:**
- Upload any file type via drag & drop or button
- File type icons (PDF, Word, Excel, ZIP, etc.)
- File size display
- Download button
- Inline PDF preview (optional)
- Progress indicator during upload
- Configurable upload endpoint

**Implementation:**
```javascript
// app/assets/javascripts/inkpen/extensions/file_attachment.js

export const FileAttachment = Node.create({
  name: 'fileAttachment',
  group: 'block',

  addAttributes() {
    return {
      url: { default: null },
      filename: { default: null },
      filesize: { default: null },
      filetype: { default: null },
      uploadProgress: { default: null }
    }
  },

  addOptions() {
    return {
      uploadUrl: '/uploads',
      allowedTypes: '*',
      maxSize: 10 * 1024 * 1024, // 10MB
      onUpload: null, // Custom upload handler
      onError: null
    }
  },

  addNodeView() {
    // File card with:
    // - Icon based on file type
    // - Filename + size
    // - Download button
    // - Upload progress bar
  },

  addCommands() {
    return {
      insertFile: (file) => ({ commands }) => {...},
      uploadFile: (file) => ({ commands }) => {...}
    }
  },

  addProseMirrorPlugins() {
    return [
      // Drop handler for file uploads
      new Plugin({
        props: {
          handleDrop(view, event) {
            const files = event.dataTransfer?.files
            if (files?.length) {
              // Handle file upload
            }
          }
        }
      })
    ]
  }
})
```

**File Type Icons:**
```
📄 PDF, DOC, DOCX, TXT
📊 XLS, XLSX, CSV
📁 ZIP, RAR, 7Z
🎵 MP3, WAV, OGG
🎬 MP4, MOV, AVI
🖼️ Image files (fallback)
📎 Other files
```

**CSS:**
```css
.inkpen-file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--inkpen-color-border);
  border-radius: var(--inkpen-radius);
  margin: 1rem 0;
}

.inkpen-file__icon {
  font-size: 1.5rem;
}

.inkpen-file__info {
  flex: 1;
}

.inkpen-file__name {
  font-weight: 500;
}

.inkpen-file__size {
  font-size: 0.75rem;
  color: var(--inkpen-color-text-muted);
}

.inkpen-file__download {
  padding: 0.5rem;
  border-radius: var(--inkpen-radius);
  background: var(--inkpen-color-primary);
  color: white;
}

.inkpen-file__progress {
  height: 4px;
  background: var(--inkpen-color-border);
  border-radius: 2px;
  overflow: hidden;
}

.inkpen-file__progress-bar {
  height: 100%;
  background: var(--inkpen-color-primary);
  transition: width 150ms;
}
```

---

### 4.3 Social Embeds Extension (v0.5.0-rc)

**Features:**
- Paste URL to auto-embed
- Supported platforms:
  - Twitter/X posts
  - Instagram posts
  - TikTok videos
  - Figma designs
  - Loom videos
  - CodePen pens
  - GitHub Gists
  - Spotify tracks/playlists
- Responsive embeds
- Fallback link card for unsupported URLs
- Privacy-aware (no tracking until clicked)

**Implementation:**
```javascript
// app/assets/javascripts/inkpen/extensions/embed.js

const EMBED_PROVIDERS = {
  twitter: {
    regex: /https?:\/\/(twitter|x)\.com\/\w+\/status\/(\d+)/,
    template: (id) => `<blockquote class="twitter-tweet" data-id="${id}"></blockquote>`,
    script: 'https://platform.twitter.com/widgets.js'
  },
  instagram: {
    regex: /https?:\/\/www\.instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/,
    template: (id) => `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/${id}/"></blockquote>`,
    script: 'https://www.instagram.com/embed.js'
  },
  figma: {
    regex: /https?:\/\/www\.figma\.com\/(file|proto)\/([A-Za-z0-9]+)/,
    template: (url) => `<iframe src="https://www.figma.com/embed?embed_host=inkpen&url=${encodeURIComponent(url)}"></iframe>`
  },
  loom: {
    regex: /https?:\/\/www\.loom\.com\/share\/([a-zA-Z0-9]+)/,
    template: (id) => `<iframe src="https://www.loom.com/embed/${id}"></iframe>`
  },
  codepen: {
    regex: /https?:\/\/codepen\.io\/([^\/]+)\/pen\/([A-Za-z0-9]+)/,
    template: (user, id) => `<iframe src="https://codepen.io/${user}/embed/${id}?default-tab=result"></iframe>`
  },
  gist: {
    regex: /https?:\/\/gist\.github\.com\/([^\/]+)\/([a-f0-9]+)/,
    template: (user, id) => `<script src="https://gist.github.com/${user}/${id}.js"></script>`
  },
  spotify: {
    regex: /https?:\/\/open\.spotify\.com\/(track|album|playlist)\/([A-Za-z0-9]+)/,
    template: (type, id) => `<iframe src="https://open.spotify.com/embed/${type}/${id}"></iframe>`
  }
}

export const Embed = Node.create({
  name: 'embed',
  group: 'block',

  addAttributes() {
    return {
      url: { default: null },
      provider: { default: null },
      embedId: { default: null },
      loaded: { default: false }
    }
  },

  addOptions() {
    return {
      providers: EMBED_PROVIDERS,
      allowedProviders: null, // null = all, or ['twitter', 'youtube']
      privacyMode: true // Show placeholder until clicked
    }
  },

  addNodeView() {
    // Privacy-first embed:
    // 1. Show preview card with provider logo
    // 2. "Click to load" button
    // 3. Load actual embed on click
  },

  addPasteRules() {
    // Auto-detect and embed URLs on paste
  },

  addCommands() {
    return {
      insertEmbed: (url) => ({ commands }) => {...},
      loadEmbed: () => ({ commands }) => {...}
    }
  }
})
```

**Link Card Fallback:**
```css
.inkpen-link-card {
  display: flex;
  border: 1px solid var(--inkpen-color-border);
  border-radius: var(--inkpen-radius);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
}

.inkpen-link-card__image {
  width: 120px;
  height: 80px;
  object-fit: cover;
  flex-shrink: 0;
}

.inkpen-link-card__content {
  padding: 0.75rem;
  flex: 1;
}

.inkpen-link-card__title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.inkpen-link-card__description {
  font-size: 0.875rem;
  color: var(--inkpen-color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.inkpen-link-card__domain {
  font-size: 0.75rem;
  color: var(--inkpen-color-text-muted);
  margin-top: 0.5rem;
}
```

---

### 4.4 Slash Commands Updates

Add new commands to slash menu:
- `/image` - Insert image (upload or URL)
- `/file` - Upload file attachment
- `/embed` - Paste URL to embed
- `/twitter` - Embed tweet
- `/figma` - Embed Figma design
- `/loom` - Embed Loom video
- `/codepen` - Embed CodePen

---

### Implementation Priority

| Feature | Priority | Complexity | Files |
|---------|----------|------------|-------|
| Enhanced Image | High | Medium | enhanced_image.js, enhanced_image.css |
| File Attachment | High | High | file_attachment.js, file_attachment.css |
| Social Embeds | Medium | Medium | embed.js, embed.css |
| Link Cards | Medium | Low | link_card.js, link_card.css |
| Slash Menu Updates | Low | Low | slash_commands.js |

---

### Files to Create (v0.5.0)

```
app/assets/javascripts/inkpen/extensions/
├── enhanced_image.js        ← v0.5.0-alpha
├── file_attachment.js       ← v0.5.0-beta
├── embed.js                 ← v0.5.0-rc
└── link_card.js             ← v0.5.0-rc

app/assets/stylesheets/inkpen/
├── enhanced_image.css       ← v0.5.0-alpha
├── file_attachment.css      ← v0.5.0-beta
├── embed.css                ← v0.5.0-rc
└── link_card.css            ← v0.5.0-rc

lib/inkpen/extensions/
├── enhanced_image.rb        ← v0.5.0-alpha
├── file_attachment.rb       ← v0.5.0-beta
└── embed.rb                 ← v0.5.0-rc
```

---

## Technical References

### TipTap/ProseMirror
- [TipTap Documentation](https://tiptap.dev/docs)
- [TipTap Notion Template](https://tiptap.dev/docs/ui-components/templates/notion-like-editor)
- [TipTap Suggestion Plugin](https://tiptap.dev/docs/editor/api/utilities/suggestion)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [ProseMirror Decorations](https://prosemirror.net/docs/ref/#view.Decorations)

### Block Editors
- [Plate Editor](https://platejs.org/) - React block editor on ProseMirror
- [BlockNote](https://www.blocknotejs.org/) - Notion-style TipTap wrapper
- [Editor.js](https://editorjs.io/) - Block editor with JSON output
- [Notitap](https://github.com/sereneinserenade/notitap) - Notion clone on TipTap

### Drag & Drop
- [Plate DnD](https://platejs.org/docs/dnd)
- [dnd-kit](https://dndkit.com/) - Modern React DnD
- [Editor.js Drag Plugin](https://github.com/kommitters/editorjs-drag-drop)

### Design Patterns
- [Notion Block Model](https://www.notion.so/help/what-is-a-block)
- [Craft.do Editor](https://www.craft.do/)
- [Coda Editor](https://coda.io/)

---

## Implementation Priority

| Phase | Feature | Priority | Complexity | Impact |
|-------|---------|----------|------------|--------|
| 1 | Slash Commands | High | Medium | High |
| 2 | Block Gutter | High | Medium | High |
| 3 | Drag & Drop | Medium | High | Medium |
| 4.1 | Toggle Blocks | Medium | Low | Medium |
| 4.2 | Columns | Low | Medium | Low |
| 4.3 | Enhanced Callouts | Medium | Low | Medium |
| 5 | Polish & Animations | Low | Medium | High |

---

## File Structure After Implementation

```
app/assets/javascripts/inkpen/
├── controllers/
│   ├── editor_controller.js
│   ├── toolbar_controller.js
│   ├── sticky_toolbar_controller.js
│   └── block_menu_controller.js       ← v0.3.1
├── extensions/
│   ├── section.js                     ✅ DONE
│   ├── preformatted.js                ✅ DONE
│   ├── slash_commands.js              ✅ DONE
│   ├── block_gutter.js                ✅ DONE
│   ├── drag_handle.js                 ✅ DONE
│   ├── toggle_block.js                ✅ DONE
│   ├── columns.js                     ✅ DONE
│   ├── callout.js                     ✅ DONE
│   └── block_commands.js              ✅ DONE
├── helpers/
│   └── block_helpers.js               ← future
└── index.js

app/assets/stylesheets/inkpen/
├── editor.css
├── toolbar.css
├── sticky_toolbar.css
├── section.css                        ✅ DONE
├── preformatted.css                   ✅ DONE
├── slash_menu.css                     ✅ DONE
├── block_gutter.css                   ✅ DONE
├── drag_drop.css                      ✅ DONE
├── toggle.css                         ✅ DONE
├── columns.css                        ✅ DONE
├── callout.css                        ✅ DONE
└── animations.css                     ✅ DONE

lib/inkpen/extensions/
├── base.rb
├── section.rb                         ✅ DONE
├── preformatted.rb                    ✅ DONE
├── slash_commands.rb                  ✅ DONE
├── mention.rb
├── table.rb
├── task_list.rb
├── code_block_syntax.rb
└── forced_document.rb
```
