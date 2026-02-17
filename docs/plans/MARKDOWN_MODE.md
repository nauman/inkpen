# Markdown Mode: Edit & Preview Toggle

> **Goal**: Add a markdown edit mode with live preview, allowing users to toggle between WYSIWYG and raw markdown editing.

**Status:** 🚧 Partially implemented, needs redesign

---

## Current Issues (v0.5.0-alpha)

1. **Separate mode toggle bar** - Should be integrated into existing toolbar
2. **Mode switching not working** - JS initialization timing issue
3. **Source map 404s** - CDN doesn't provide source maps (cosmetic)

---

## Better Approach: Toolbar Integration

Instead of a separate mode toggle bar, integrate into existing toolbar as a **dropdown** or **icon group**.

### Composable Toolbar Configuration

```ruby
# Array of arrays = grouped buttons with dropdown
toolbar_buttons: [
  [:bold, :italic, :underline],           # Text formatting group
  [:heading, :quote, :code],              # Block formatting group
  [:link, :image],                        # Insert group
  [:view_mode]                            # View mode dropdown: Visual | Markdown | Split
]
```

### View Mode as Toolbar Dropdown

```
┌──────────────────────────────────────────────────────────────┐
│ B I U │ H1 " </> │ 🔗 🖼️ │ [Visual ▾]                        │
├──────────────────────────────────────────────────────────────┤
│                      ┌─────────────┐                         │
│                      │ ✓ Visual    │                         │
│                      │   Markdown  │                         │
│                      │   Split     │                         │
│                      └─────────────┘                         │
│                                                              │
│  Editor content...                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Overview

Currently Inkpen supports:
- ✅ Markdown **export** (`exportMarkdown()`)
- ✅ Markdown **import** (`importMarkdown()`)
- ✅ Markdown **shortcuts** (Typography extension)

Partially implemented:
- 🚧 Raw markdown edit mode (textarea exists, mode switching broken)
- 🚧 Split view (layout exists, sync broken)
- 🚧 Toggle between modes (separate bar, should be toolbar dropdown)

---

## Implementation Plan

### Phase 1: Core Mode Switching

**Files to create/modify:**
```
lib/inkpen/markdown_mode.rb              # Ruby PORO config
app/assets/javascripts/inkpen/
├── controllers/
│   └── editor_controller.js             # Add mode switching
├── components/
│   ├── mode_toggle.js                   # Toggle button component
│   └── markdown_editor.js               # Textarea wrapper
```

**Editor Controller Changes:**

```javascript
// New static values
static values = {
  // ... existing values
  mode: { type: String, default: "wysiwyg" },  // "wysiwyg" | "markdown" | "split"
  markdownEnabled: { type: Boolean, default: false }
}

// New targets
static targets = ["input", "content", "toolbar", "markdownEditor", "modeToggle"]
```

**Mode switching logic:**

```javascript
// Switch to markdown mode
switchToMarkdown() {
  const markdown = this.exportMarkdown()
  this.markdownEditorTarget.value = markdown
  this.contentTarget.classList.add("hidden")
  this.markdownEditorTarget.classList.remove("hidden")
  this.modeValue = "markdown"
}

// Switch to WYSIWYG mode
switchToWysiwyg() {
  const markdown = this.markdownEditorTarget.value
  this.importMarkdown(markdown)
  this.markdownEditorTarget.classList.add("hidden")
  this.contentTarget.classList.remove("hidden")
  this.modeValue = "wysiwyg"
}

// Split mode: both visible, synced
switchToSplit() {
  this.contentTarget.classList.remove("hidden")
  this.markdownEditorTarget.classList.remove("hidden")
  this.modeValue = "split"
  this.setupSplitSync()
}
```

---

### Phase 2: Split View with Live Sync

**Sync Strategy:**
- Debounced sync (300ms) from markdown → WYSIWYG on keyup
- Immediate sync from WYSIWYG → markdown on blur/change
- Conflict resolution: last-write-wins with visual indicator

```javascript
setupSplitSync() {
  // Markdown → WYSIWYG (debounced)
  this.markdownEditorTarget.addEventListener("input",
    debounce(() => {
      this.importMarkdown(this.markdownEditorTarget.value, { silent: true })
    }, 300)
  )

  // WYSIWYG → Markdown (on change)
  this.editor.on("update", () => {
    if (this.modeValue === "split") {
      this.markdownEditorTarget.value = this.exportMarkdown()
    }
  })
}
```

---

### Phase 3: Ruby PORO Configuration

**lib/inkpen/markdown_mode.rb:**

```ruby
module Inkpen
  class MarkdownMode
    MODES = [:wysiwyg, :markdown, :split].freeze

    attr_reader :enabled, :default_mode, :show_toggle, :sync_delay

    def initialize(options = {})
      @enabled = options.fetch(:enabled, false)
      @default_mode = options.fetch(:default_mode, :wysiwyg)
      @show_toggle = options.fetch(:show_toggle, true)
      @sync_delay = options.fetch(:sync_delay, 300)
    end

    def to_config
      {
        markdownEnabled: enabled,
        defaultMode: default_mode.to_s,
        showModeToggle: show_toggle,
        syncDelay: sync_delay
      }
    end
  end
end
```

**Usage in Editor:**

```ruby
editor = Inkpen::Editor.new(
  name: "post[body]",
  value: @post.body,
  markdown_mode: Inkpen::MarkdownMode.new(
    enabled: true,
    default_mode: :wysiwyg,
    show_toggle: true
  )
)
```

---

### Phase 4: UI Components

**Mode Toggle Button:**

```html
<div data-inkpen--editor-target="modeToggle" class="inkpen-mode-toggle">
  <button data-action="click->inkpen--editor#switchToWysiwyg"
          data-mode="wysiwyg" class="active">
    Visual
  </button>
  <button data-action="click->inkpen--editor#switchToMarkdown"
          data-mode="markdown">
    Markdown
  </button>
  <button data-action="click->inkpen--editor#switchToSplit"
          data-mode="split">
    Split
  </button>
</div>
```

**Markdown Editor Textarea:**

```html
<textarea data-inkpen--editor-target="markdownEditor"
          class="inkpen-markdown-editor hidden"
          placeholder="Write markdown here..."></textarea>
```

**CSS (app/assets/stylesheets/inkpen/markdown_mode.css):**

```css
.inkpen-mode-toggle {
  display: flex;
  gap: 2px;
  padding: 4px;
  background: var(--inkpen-toolbar-bg, #f5f5f5);
  border-radius: 6px;
}

.inkpen-mode-toggle button {
  padding: 6px 12px;
  border: none;
  background: transparent;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
}

.inkpen-mode-toggle button.active {
  background: white;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.inkpen-markdown-editor {
  width: 100%;
  min-height: 300px;
  padding: 16px;
  font-family: ui-monospace, monospace;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid var(--inkpen-border, #e0e0e0);
  border-radius: 8px;
  resize: vertical;
}

/* Split mode */
.inkpen-editor--split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.inkpen-editor--split .inkpen-markdown-editor,
.inkpen-editor--split .inkpen-editor__content {
  height: 400px;
  overflow-y: auto;
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+M` | Toggle markdown mode |
| `Cmd+Shift+V` | Toggle split view |
| `Escape` (in markdown) | Return to WYSIWYG |

---

## API Methods

```javascript
// Check current mode
editor.getMode()  // "wysiwyg" | "markdown" | "split"

// Switch modes programmatically
editor.setMode("markdown")
editor.setMode("wysiwyg")
editor.setMode("split")

// Get markdown content (always available)
editor.getMarkdown()

// Set content from markdown
editor.setMarkdown(md)
```

---

## Edge Cases

1. **Unsupported blocks in markdown**
   - Tables, callouts, toggles serialize to HTML fallback
   - Re-importing preserves as HTML blocks
   - Show warning badge for lossy round-trip

2. **Cursor position sync**
   - In split mode, attempt to sync cursor position
   - Use line number mapping where possible
   - Fallback: scroll to approximate position

3. **Large documents**
   - Debounce aggressively (500ms+)
   - Option to disable live sync, use manual refresh
   - Virtual scrolling for very long markdown

---

## Testing Checklist

- [ ] Mode toggle switches correctly
- [ ] Content syncs from WYSIWYG → Markdown
- [ ] Content syncs from Markdown → WYSIWYG
- [ ] Split mode keeps both in sync
- [ ] Keyboard shortcuts work
- [ ] Form submission uses correct content
- [ ] Undo/redo works in both modes
- [ ] Tables render correctly in both directions
- [ ] Code blocks preserve language
- [ ] Images/embeds handled gracefully

---

## Rollout

1. **v0.5.0-beta**: Markdown mode behind config flag
2. **v0.5.0**: Stable release with full documentation
3. **v0.5.1**: Split view enhancements based on feedback

---

## References

- [TipTap Markdown Extension](https://tiptap.dev/docs/editor/extensions/functionality/markdown)
- [StackEdit Split Editor](https://stackedit.io/)
- [Typora-style seamless editing](https://typora.io/)
- Current export: `inkpen/export/markdown.js`
