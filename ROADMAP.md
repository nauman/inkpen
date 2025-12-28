# Inkpen Roadmap

**Vision:** A Rails-native Notion-style block editor that rivals Dropbox Paper, Notion, and Editor.js - with zero JavaScript build complexity.

---

## Current Status: v0.2.1 (Beta)

### Completed Features

#### Core Editor
- [x] TipTap/ProseMirror foundation
- [x] Rails integration (forms, Turbo, Stimulus)
- [x] PORO-based architecture
- [x] Importmap compatible (no Node.js build)
- [x] Simple markdown mode (no forced document structure)
- [x] Forced document mode (title + optional subtitle + body)

#### Text Formatting
- [x] Bold, Italic, Strike, Underline
- [x] Headings (H1-H4)
- [x] Bullet and Ordered Lists
- [x] Blockquotes
- [x] Inline Code
- [x] Links with preview

#### Advanced Blocks
- [x] Code Blocks with Syntax Highlighting (20+ languages)
- [x] Tables with resizing
- [x] Task Lists (interactive checkboxes)
- [x] Horizontal Rules
- [x] Images

#### Typography & Formatting
- [x] Typography extension (smart quotes, markdown shortcuts)
- [x] Text Highlighting (multicolor)
- [x] Subscript/Superscript
- [x] YouTube video embeds
- [x] Character/Word count

#### Social Features
- [x] @Mentions with search API
- [x] Floating selection toolbar (BubbleMenu)

#### Sticky Toolbar
- [x] Fixed-position toolbar for block/media/widget insertion
- [x] Positions: bottom (horizontal), left/right (vertical)
- [x] Block buttons: Table, Code Block, Blockquote, Task List, Divider
- [x] Media buttons: Image, YouTube, Embed
- [x] Widget picker modal with event-driven integration
- [x] Widget modal appended to body (avoids CSS transform issues)
- [x] Per-instance configuration via Ruby PORO
- [x] Dark mode support
- [x] Responsive (mobile adapts to bottom position)

#### Toolbar Resilience
- [x] BubbleMenu/Tippy.js integration (handles DOM moves)
- [x] Editor reference persistence across reconnections
- [x] Mouse event handling to preserve text selection

#### Context-Aware Toolbar
- [x] Automatic context detection (text, table, code, image)
- [x] Table operations: add/delete rows & columns, merge/split cells
- [x] Code block language selector
- [x] Image alignment controls

#### Advanced HTML Features
- [x] Callout boxes (info, warning, tip, note styles)
- [x] HTML block insertion
- [x] Custom CSS classes support

---

## v0.3.0: Notion-Style Block Editing

**Goal:** Transform Inkpen into a true block editor with slash commands and visual block manipulation.

### Slash Commands (v0.3.0)
*Notion's killer feature - rapid block insertion via keyboard*

- [ ] `/` command palette trigger
- [ ] Command groups: Basic, Lists, Blocks, Media, Advanced
- [ ] Keyboard navigation (↑↓ Enter Escape)
- [ ] Fuzzy search/filter (type `/h1` → "Heading 1")
- [ ] Icons and descriptions for each command
- [ ] Custom command registration API
- [ ] Ruby configuration: `SlashCommands.new(commands: [...], groups: [...])`

**Reference:** [TipTap Suggestion](https://tiptap.dev/docs/editor/api/utilities/suggestion), [Plate Slash Commands](https://platejs.org/docs/slash-command)

### Block Gutter System (v0.3.1)
*Visual block handles like Notion/Editor.js*

```
     ┌────────────────────────────────┐
⋮⋮ + │ Heading text                   │
     ├────────────────────────────────┤
⋮⋮ + │ Paragraph content...           │
     └────────────────────────────────┘
```

- [ ] Left-side gutter appearing on hover
- [ ] Drag handle (`⋮⋮`) for reordering blocks
- [ ] Plus button (`+`) to insert new block below
- [ ] Plus button opens slash menu at cursor position
- [ ] Gutter hidden inside tables (avoid clutter)
- [ ] ProseMirror decorations for gutter widgets

**Reference:** [Plate DnD](https://platejs.org/docs/dnd), [Editor.js](https://editorjs.io/)

### Drag & Drop Blocks (v0.3.2)
*Visual block reordering*

- [ ] Drag blocks via handle to reorder
- [ ] Drop indicator (blue line with dots)
- [ ] Smooth animations during drag
- [ ] Auto-scroll when dragging near edges
- [ ] Ghost preview of dragged block
- [ ] Touch support for mobile

**Reference:** [Plate DnD Examples](https://platejs.org/docs/examples/dnd)

### Enhanced Block Types (v0.3.3)

- [ ] Toggle/Collapsible blocks (like Notion)
- [ ] Column layouts (2-4 columns)
- [ ] Enhanced callouts with emoji picker
- [ ] Divider styles (line, dots, gradient)

---

## v0.4.0: Polish & Delight

**Goal:** Professional-grade UX matching BlockNote quality.

### Block Selection
- [ ] Click gutter to select entire block
- [ ] Shift+Click for multi-block selection
- [ ] Blue selection highlight
- [ ] Cmd+A selects all blocks
- [ ] Block-level copy/paste

### Animations & Transitions
- [ ] Smooth block insertion animation
- [ ] Block deletion fade-out
- [ ] Drag reorder animations
- [ ] Menu open/close transitions
- [ ] Focus ring animations

### Keyboard Power-User Features
- [ ] `Cmd+Shift+↑/↓` to move block up/down
- [ ] `Cmd+D` to duplicate block
- [ ] `Backspace` on empty block deletes it
- [ ] `Tab` / `Shift+Tab` for list indentation
- [ ] `Cmd+/` to toggle slash menu

### Mobile Optimization
- [ ] Touch-friendly gutter buttons
- [ ] Bottom sheet slash menu
- [ ] Swipe gestures for block actions
- [ ] Responsive toolbar layouts

**Reference:** [BlockNote](https://www.blocknotejs.org/)

---

## v0.5.0: Media & Embeds

**Goal:** Rich media handling like Notion.

### File Handling
- [ ] Drag & drop file upload
- [ ] Image paste from clipboard
- [ ] File attachment blocks
- [ ] Image gallery block
- [ ] PDF preview embed

### URL Embeds
- [ ] URL unfurling (paste URL → preview card)
- [ ] YouTube/Vimeo embeds
- [ ] Twitter/X embeds
- [ ] Figma embeds
- [ ] Miro/Excalidraw embeds
- [ ] CodePen/CodeSandbox embeds
- [ ] Loom video embeds

### Export & Import
- [ ] Export to Markdown
- [ ] Export to clean HTML
- [ ] Export to PDF
- [ ] Import from Markdown
- [ ] Copy as Markdown/HTML

---

## v0.6.0: Team Collaboration

**Goal:** Match Confluence collaboration features.

### Comments & Annotations
- [ ] Inline comments on text selection
- [ ] Comment threads with replies
- [ ] Resolve/reopen comments
- [ ] @mentions in comments
- [ ] Comment notifications

### Real-Time Collaboration
- [ ] Yjs integration for CRDT
- [ ] Live cursor positions
- [ ] User presence indicators
- [ ] Awareness (who's viewing)
- [ ] Conflict resolution

### Version Control
- [ ] Auto-save with versioning
- [ ] Version history browser
- [ ] Visual diff between versions
- [ ] Restore previous versions
- [ ] Named checkpoints

---

## v1.0.0: Knowledge Base

**Goal:** Production-ready, enterprise-grade editor.

### Document Structure
- [ ] Auto-generated Table of Contents
- [ ] Document outline sidebar
- [ ] Wiki-style internal links `[[Page Name]]`
- [ ] Backlinks (who links here)
- [ ] Tags and metadata

### Templates
- [ ] Document templates library
- [ ] Variable placeholders `{{variable}}`
- [ ] Create template from document
- [ ] Template categories

### Search & Discovery
- [ ] Full-text search
- [ ] Search within document
- [ ] Find & Replace (regex support)
- [ ] Filter by tags/metadata

### Enterprise Features
- [ ] Read/Write/Admin roles
- [ ] Section-level permissions
- [ ] Audit logging
- [ ] SSO integration hooks
- [ ] Custom CSS themes
- [ ] Plugin architecture
- [ ] Webhook events

---

## Comparison with Alternatives

| Feature | Inkpen v0.2 | Inkpen v0.4 | Notion | Editor.js | BlockNote |
|---------|-------------|-------------|--------|-----------|-----------|
| Rails Native | ✅ | ✅ | ❌ | ❌ | ❌ |
| No Build Step | ✅ | ✅ | N/A | ❌ | ❌ |
| Slash Commands | ❌ | ✅ | ✅ | ❌ | ✅ |
| Block Gutter | ❌ | ✅ | ✅ | ✅ | ✅ |
| Drag & Drop | ❌ | ✅ | ✅ | ✅ | ✅ |
| Tables | ✅ | ✅ | ✅ | ✅ | ✅ |
| Code Blocks | ✅ | ✅ | ✅ | ✅ | ✅ |
| @Mentions | ✅ | ✅ | ✅ | ❌ | ❌ |
| Real-Time Collab | ❌ | 🔄 | ✅ | ❌ | ✅ |
| JSON Output | ✅ | ✅ | ✅ | ✅ | ✅ |

Legend: ✅ Done | 🔄 Planned | ❌ Not Available

---

## Technical Architecture

### Current Stack
```
Rails App → Inkpen Gem → Stimulus Controllers → TipTap → ProseMirror
```

### v0.4.0 Stack
```
Rails App
    ↓
Inkpen Gem (Rails Engine)
    ├── Ruby POROs (Editor, Toolbar, Extensions)
    ├── Stimulus Controllers
    │   ├── editor_controller.js
    │   ├── toolbar_controller.js
    │   ├── sticky_toolbar_controller.js
    │   ├── slash_menu_controller.js      ← NEW
    │   └── block_gutter_controller.js    ← NEW
    ├── TipTap Extensions
    │   ├── SlashCommands                  ← NEW
    │   ├── BlockGutter                    ← NEW
    │   ├── DragHandle                     ← NEW
    │   └── UniqueID                       ← NEW
    └── Helpers (Fizzy-style)
        ├── position_helpers.js
        ├── block_helpers.js
        └── drag_helpers.js
```

### Design Principles

1. **Rails-First**: Native integration with Rails conventions
2. **Fizzy-Style JS**: Follow Basecamp/37signals Stimulus patterns
3. **No Build Step**: Works with importmaps, no Node.js required
4. **PORO Excellence**: Configuration via plain Ruby objects
5. **Extensible**: Modular extension system
6. **Production-Ready**: Stable core before adding features

---

## Implementation Details

See [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for detailed technical specifications including:
- Code samples for each extension
- CSS specifications
- Controller implementations
- Ruby configuration classes

---

## Target Users

### Primary: Ruby on Rails Applications

1. **mademysite.com** - Blogging platform with rich post editor
2. **kuickr.co** - Knowledge management and document sharing

### Secondary: Any Web Application

- SaaS products needing document editing
- Internal tools and knowledge bases
- CMS and content platforms

---

## References

### Block Editors
- [TipTap](https://tiptap.dev) - Core editor framework
- [TipTap Notion Template](https://tiptap.dev/docs/ui-components/templates/notion-like-editor)
- [Plate](https://platejs.org) - React block editor
- [BlockNote](https://www.blocknotejs.org) - Notion-style TipTap wrapper
- [Editor.js](https://editorjs.io) - Block editor with JSON output
- [Notitap](https://github.com/sereneinserenade/notitap) - Notion clone on TipTap

### Technical
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [Stimulus Handbook](https://stimulus.hotwired.dev/handbook/introduction)
- [37signals Coding Style](https://github.com/marckohlbrugge/unofficial-37signals-coding-style-guide)

---

## Contributing

We welcome contributions! Priority areas:

1. **Slash Commands** - Most requested feature
2. **Block Gutter** - Visual block editing
3. **Bug fixes** - Stability is paramount
4. **Documentation** - Examples and guides
5. **Tests** - Increase coverage

See CONTRIBUTING.md for guidelines.
