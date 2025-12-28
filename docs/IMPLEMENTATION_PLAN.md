# Inkpen: Notion-like Block Editor Implementation Plan

> **Vision**: Transform Inkpen into a world-class Notion/Editor.js style block editor while maintaining Rails-native simplicity.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Phase 1: Slash Commands](#phase-1-slash-commands-v030)
3. [Phase 2: Block Gutter System](#phase-2-block-gutter-system-v031)
4. [Phase 3: Drag & Drop](#phase-3-drag--drop-v032)
5. [Phase 4: Enhanced Blocks](#phase-4-enhanced-blocks-v033)
6. [Phase 5: BlockNote-Style Polish](#phase-5-blocknote-style-polish-v040)
7. [Technical References](#technical-references)

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

## Phase 1: Slash Commands (v0.3.0)

### Goal
Implement Notion-style `/` command palette for rapid block insertion.

### User Experience
```
User types "/" → Menu appears → User types "h1" → Filters to "Heading 1" → Enter inserts
```

### Components

#### 1.1 TipTap Extension: SlashCommands
```javascript
// app/assets/javascripts/inkpen/extensions/slash_commands.js

import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowSpaces: false,
        startOfLine: true,
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        }
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion
      })
    ]
  }
})
```

#### 1.2 Stimulus Controller: SlashMenuController
```javascript
// app/assets/javascripts/inkpen/controllers/slash_menu_controller.js

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["menu", "item"]
  static values = {
    commands: { type: Array, default: [] }
  }

  #selectedIndex = 0
  #items = []
  #range = null

  // Lifecycle

  connect() {
    this.#buildDefaultCommands()
  }

  disconnect() {
    this.#hide()
  }

  // Actions

  show({ detail: { range, query, clientRect } }) {
    this.#range = range
    this.#items = this.#filterCommands(query)
    this.#selectedIndex = 0
    this.#render()
    this.#position(clientRect)
    this.element.classList.remove("hidden")
  }

  hide() {
    this.#hide()
  }

  navigate(event) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        this.#selectedIndex = (this.#selectedIndex + 1) % this.#items.length
        this.#updateSelection()
        break
      case "ArrowUp":
        event.preventDefault()
        this.#selectedIndex = (this.#selectedIndex - 1 + this.#items.length) % this.#items.length
        this.#updateSelection()
        break
      case "Enter":
        event.preventDefault()
        this.#executeSelected()
        break
      case "Escape":
        event.preventDefault()
        this.#hide()
        break
    }
  }

  select(event) {
    const index = parseInt(event.currentTarget.dataset.index)
    this.#selectedIndex = index
    this.#executeSelected()
  }

  // Private

  #buildDefaultCommands() {
    this.#items = [
      // Text
      { id: "paragraph", title: "Paragraph", icon: "¶", keywords: ["text", "p"], group: "Basic" },
      { id: "heading1", title: "Heading 1", icon: "H1", keywords: ["h1", "title"], group: "Basic" },
      { id: "heading2", title: "Heading 2", icon: "H2", keywords: ["h2", "subtitle"], group: "Basic" },
      { id: "heading3", title: "Heading 3", icon: "H3", keywords: ["h3"], group: "Basic" },

      // Lists
      { id: "bulletList", title: "Bullet List", icon: "•", keywords: ["ul", "unordered"], group: "Lists" },
      { id: "orderedList", title: "Numbered List", icon: "1.", keywords: ["ol", "numbered"], group: "Lists" },
      { id: "taskList", title: "Task List", icon: "☐", keywords: ["todo", "checkbox"], group: "Lists" },

      // Blocks
      { id: "blockquote", title: "Quote", icon: "❝", keywords: ["quote", "citation"], group: "Blocks" },
      { id: "codeBlock", title: "Code Block", icon: "</>", keywords: ["code", "pre"], group: "Blocks" },
      { id: "callout", title: "Callout", icon: "💡", keywords: ["alert", "note", "info"], group: "Blocks" },
      { id: "divider", title: "Divider", icon: "—", keywords: ["hr", "line"], group: "Blocks" },

      // Media
      { id: "image", title: "Image", icon: "🖼", keywords: ["img", "picture"], group: "Media" },
      { id: "youtube", title: "YouTube", icon: "▶", keywords: ["video", "embed"], group: "Media" },
      { id: "table", title: "Table", icon: "⊞", keywords: ["grid", "data"], group: "Media" }
    ]
  }

  #filterCommands(query) {
    if (!query) return this.#items
    const q = query.toLowerCase()
    return this.#items.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q))
    )
  }

  #render() {
    const grouped = this.#groupByCategory(this.#items)
    this.menuTarget.innerHTML = Object.entries(grouped).map(([group, items]) => `
      <div class="inkpen-slash-menu__group">
        <div class="inkpen-slash-menu__group-title">${group}</div>
        ${items.map((item, i) => `
          <button type="button"
                  class="inkpen-slash-menu__item ${i === this.#selectedIndex ? 'is-selected' : ''}"
                  data-action="click->inkpen--slash-menu#select"
                  data-index="${this.#items.indexOf(item)}">
            <span class="inkpen-slash-menu__icon">${item.icon}</span>
            <span class="inkpen-slash-menu__title">${item.title}</span>
          </button>
        `).join('')}
      </div>
    `).join('')
  }

  #groupByCategory(items) {
    return items.reduce((groups, item) => {
      const group = item.group || "Other"
      if (!groups[group]) groups[group] = []
      groups[group].push(item)
      return groups
    }, {})
  }

  #position(clientRect) {
    if (!clientRect) return
    const rect = clientRect()
    this.menuTarget.style.left = `${rect.left}px`
    this.menuTarget.style.top = `${rect.bottom + 8}px`
  }

  #updateSelection() {
    this.itemTargets.forEach((item, i) => {
      item.classList.toggle("is-selected", i === this.#selectedIndex)
    })
  }

  #executeSelected() {
    const command = this.#items[this.#selectedIndex]
    if (command) {
      this.dispatch("execute", { detail: { command, range: this.#range } })
    }
    this.#hide()
  }

  #hide() {
    this.element.classList.add("hidden")
    this.#range = null
  }
}
```

#### 1.3 Ruby Extension Config
```ruby
# lib/inkpen/extensions/slash_commands.rb

module Inkpen
  module Extensions
    class SlashCommands < Base
      DEFAULT_COMMANDS = %w[
        paragraph heading1 heading2 heading3
        bulletList orderedList taskList
        blockquote codeBlock callout divider
        image youtube table
      ].freeze

      def initialize(commands: DEFAULT_COMMANDS, groups: nil, custom_commands: [])
        @commands = commands
        @groups = groups
        @custom_commands = custom_commands
      end

      def name
        :slash_commands
      end

      def to_config
        {
          name: name,
          enabled: enabled?,
          options: {
            commands: @commands,
            groups: @groups,
            custom_commands: @custom_commands.map(&:to_h)
          }
        }
      end
    end
  end
end
```

#### 1.4 CSS Styles
```css
/* app/assets/stylesheets/inkpen/slash_menu.css */

.inkpen-slash-menu {
  position: fixed;
  z-index: 9999;
  min-width: 280px;
  max-width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background: var(--inkpen-toolbar-bg);
  border: 1px solid var(--inkpen-color-border);
  border-radius: var(--inkpen-radius);
  box-shadow: var(--inkpen-shadow);
  padding: 0.5rem 0;
}

.inkpen-slash-menu.hidden {
  display: none;
}

.inkpen-slash-menu__group {
  padding: 0.25rem 0;
}

.inkpen-slash-menu__group-title {
  padding: 0.375rem 0.75rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--inkpen-color-text-muted);
}

.inkpen-slash-menu__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: var(--inkpen-color-text);
  transition: background-color 100ms;
}

.inkpen-slash-menu__item:hover,
.inkpen-slash-menu__item.is-selected {
  background: var(--inkpen-color-selection);
}

.inkpen-slash-menu__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: var(--inkpen-color-border);
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.inkpen-slash-menu__title {
  font-size: 0.875rem;
}
```

### References
- [TipTap Suggestion Plugin](https://tiptap.dev/docs/editor/api/utilities/suggestion)
- [Plate Slash Commands](https://platejs.org/docs/slash-command)
- [BlockNote Slash Menu](https://www.blocknotejs.org/docs/editor-basics/document-structure#slash-menu)

---

## Phase 2: Block Gutter System (v0.3.1)

### Goal
Add a left-side gutter with drag handles and plus buttons for each block.

### Visual Design
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

### Components

#### 2.1 TipTap Extension: BlockGutter
```javascript
// app/assets/javascripts/inkpen/extensions/block_gutter.js

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const BlockGutter = Extension.create({
  name: 'blockGutter',

  addOptions() {
    return {
      onPlusClick: null,
      onDragStart: null
    }
  },

  addProseMirrorPlugins() {
    const extension = this

    return [
      new Plugin({
        key: new PluginKey('blockGutter'),
        props: {
          decorations(state) {
            const { doc } = state
            const decorations = []

            doc.descendants((node, pos) => {
              if (node.isBlock && !node.isTextblock) return

              // Skip nodes inside tables
              const $pos = state.doc.resolve(pos)
              for (let d = $pos.depth; d > 0; d--) {
                if ($pos.node(d).type.name === 'table') return
              }

              const gutter = document.createElement('div')
              gutter.className = 'inkpen-block-gutter'
              gutter.dataset.pos = pos

              // Drag handle
              const dragHandle = document.createElement('button')
              dragHandle.className = 'inkpen-block-gutter__drag'
              dragHandle.innerHTML = '⋮⋮'
              dragHandle.draggable = true
              dragHandle.addEventListener('dragstart', (e) => {
                extension.options.onDragStart?.(pos, node, e)
              })

              // Plus button
              const plusBtn = document.createElement('button')
              plusBtn.className = 'inkpen-block-gutter__plus'
              plusBtn.innerHTML = '+'
              plusBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                extension.options.onPlusClick?.(pos + node.nodeSize, e)
              })

              gutter.appendChild(dragHandle)
              gutter.appendChild(plusBtn)

              decorations.push(
                Decoration.widget(pos, gutter, {
                  side: -1,
                  key: `gutter-${pos}`
                })
              )
            })

            return DecorationSet.create(doc, decorations)
          }
        }
      })
    ]
  }
})
```

#### 2.2 CSS Styles
```css
/* app/assets/stylesheets/inkpen/block_gutter.css */

.inkpen-editor {
  position: relative;
  padding-left: 3rem; /* Space for gutter */
}

.inkpen-block-gutter {
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  gap: 0.125rem;
  opacity: 0;
  transition: opacity 150ms;
  transform: translateX(-100%);
  padding-right: 0.5rem;
}

/* Show on block hover */
.ProseMirror > *:hover > .inkpen-block-gutter,
.ProseMirror > .inkpen-block-gutter:hover {
  opacity: 1;
}

.inkpen-block-gutter__drag,
.inkpen-block-gutter__plus {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  background: none;
  border: none;
  border-radius: 0.25rem;
  color: var(--inkpen-color-text-muted);
  cursor: pointer;
  font-size: 0.75rem;
  transition: background-color 100ms, color 100ms;
}

.inkpen-block-gutter__drag:hover {
  background: var(--inkpen-color-selection);
  color: var(--inkpen-color-text);
  cursor: grab;
}

.inkpen-block-gutter__drag:active {
  cursor: grabbing;
}

.inkpen-block-gutter__plus:hover {
  background: var(--inkpen-color-primary);
  color: white;
}
```

### References
- [Plate DnD Extension](https://platejs.org/docs/dnd)
- [Editor.js Block Tune](https://editorjs.io/block-tunes/)
- [ProseMirror Decorations](https://prosemirror.net/docs/ref/#view.Decorations)

---

## Phase 3: Drag & Drop (v0.3.2)

### Goal
Enable visual block reordering via drag and drop.

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

## Phase 4: Enhanced Blocks (v0.3.3)

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

## Phase 5: BlockNote-Style Polish (v0.4.0)

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
│   ├── slash_menu_controller.js       ← v0.3.0
│   └── block_menu_controller.js       ← v0.3.1
├── extensions/
│   ├── slash_commands.js              ← v0.3.0
│   ├── block_gutter.js                ← v0.3.1
│   ├── drag_handle.js                 ← v0.3.2
│   ├── toggle_block.js                ← v0.3.3
│   ├── columns.js                     ← v0.3.3
│   └── callout.js                     ← v0.3.3
├── helpers/
│   ├── position_helpers.js            ← v0.3.0
│   ├── block_helpers.js               ← v0.3.1
│   └── drag_helpers.js                ← v0.3.2
└── index.js

app/assets/stylesheets/inkpen/
├── editor.css
├── toolbar.css
├── sticky_toolbar.css
├── slash_menu.css                     ← v0.3.0
├── block_gutter.css                   ← v0.3.1
├── drag_drop.css                      ← v0.3.2
├── toggle.css                         ← v0.3.3
├── columns.css                        ← v0.3.3
└── animations.css                     ← v0.4.0
```
