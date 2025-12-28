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

### 4.2 Column Layout
```javascript
// app/assets/javascripts/inkpen/extensions/columns.js

import { Node } from '@tiptap/core'

export const Columns = Node.create({
  name: 'columns',
  group: 'block',
  content: 'column+',

  addAttributes() {
    return {
      count: { default: 2 }
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', {
      class: 'inkpen-columns',
      style: `--column-count: ${HTMLAttributes.count}`
    }, 0]
  }
})

export const Column = Node.create({
  name: 'column',
  group: 'block',
  content: 'block+',

  renderHTML() {
    return ['div', { class: 'inkpen-column' }, 0]
  }
})
```

### 4.3 Enhanced Callout
```javascript
// app/assets/javascripts/inkpen/extensions/callout.js

import { Node, mergeAttributes } from '@tiptap/core'

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      type: { default: 'info' },  // info, warning, tip, note, success, error
      emoji: { default: null },
      collapsible: { default: false },
      collapsed: { default: false }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const emoji = HTMLAttributes.emoji || this.getDefaultEmoji(HTMLAttributes.type)

    return ['div', mergeAttributes(HTMLAttributes, {
      class: `inkpen-callout inkpen-callout--${HTMLAttributes.type}`,
      'data-callout': HTMLAttributes.type
    }), [
      ['div', { class: 'inkpen-callout__icon' }, emoji],
      ['div', { class: 'inkpen-callout__content' }, 0]
    ]]
  },

  getDefaultEmoji(type) {
    const emojis = {
      info: 'ℹ️',
      warning: '⚠️',
      tip: '💡',
      note: '📝',
      success: '✅',
      error: '❌'
    }
    return emojis[type] || 'ℹ️'
  },

  addCommands() {
    return {
      setCallout: (type = 'info') => ({ commands }) => {
        return commands.wrapIn(this.name, { type })
      },
      toggleCalloutType: (type) => ({ tr, state }) => {
        // Change callout type
      }
    }
  }
})
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

## Phase 3: BlockNote-Style Polish (v0.4.0)

### Goal
Add the finishing touches that make the editor feel polished and professional.

### 5.1 Block Selection
```javascript
// Select entire block by clicking gutter
// Multi-select with Shift+Click
// Blue selection highlight
```

### 5.2 Smooth Animations
```css
/* Block insertion animation */
@keyframes inkpen-block-enter {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ProseMirror > * {
  animation: inkpen-block-enter 150ms ease-out;
}

/* Block deletion animation */
@keyframes inkpen-block-exit {
  to {
    opacity: 0;
    transform: translateX(-16px);
  }
}
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

### 5.4 Mobile Optimizations
```css
@media (max-width: 768px) {
  .inkpen-block-gutter {
    /* Always visible on mobile */
    opacity: 1;
  }

  .inkpen-slash-menu {
    /* Full width on mobile */
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 50vh;
    border-radius: var(--inkpen-radius) var(--inkpen-radius) 0 0;
  }
}
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
│   ├── toggle_block.js                ← v0.3.3
│   ├── columns.js                     ← v0.3.3
│   └── callout.js                     ← v0.3.3
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
├── toggle.css                         ← v0.3.3
├── columns.css                        ← v0.3.3
└── animations.css                     ← v0.4.0

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
