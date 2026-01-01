# Inkpen Features

> **Version:** 0.8.0
> **A Notion-style block editor for Rails**

Inkpen is a TipTap-based rich text editor gem that provides Notion-like editing capabilities for Rails applications.

---

## Table of Contents

- [Core Features](#core-features)
- [Block Types](#block-types)
- [Extensions](#extensions)
- [Export/Import](#exportimport)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Configuration](#configuration)

---

## Core Features

### Block-Based Editing
- Notion-style block architecture
- Each paragraph, heading, list, etc. is a draggable block
- Block selection and multi-block operations
- Duplicate blocks with `Cmd+D`

### Slash Commands
- Type `/` to open command palette
- Filter commands by typing
- Keyboard navigation (arrows, Enter, Escape)
- 7 command groups: Basic, Lists, Blocks, Media, Data, Advanced, Export

### Drag & Drop
- Reorder blocks by dragging from gutter handle
- Visual drop indicator
- Keyboard shortcuts: `Cmd+Shift+Arrow` to move blocks
- Edge scrolling near viewport edges

### Block Gutter
- Left-side controls for each block
- Drag handle (⋮⋮) for reordering
- Plus button (+) to insert new blocks
- Shows on hover, always visible on mobile

---

## Block Types

### Basic Blocks
| Block | Slash Command | Keyboard Shortcut |
|-------|---------------|-------------------|
| Paragraph | `/text` | - |
| Heading 1 | `/heading1`, `/h1` | - |
| Heading 2 | `/heading2`, `/h2` | - |
| Heading 3 | `/heading3`, `/h3` | - |

### Lists
| Block | Slash Command | Description |
|-------|---------------|-------------|
| Bullet List | `/bullet` | Unordered list |
| Numbered List | `/numbered` | Ordered list |
| Task List | `/task`, `/todo` | Checklist with checkboxes |

### Content Blocks
| Block | Slash Command | Keyboard Shortcut |
|-------|---------------|-------------------|
| Blockquote | `/quote` | - |
| Code Block | `/code` | - |
| Preformatted | `/plain` | `Cmd+Shift+P` |
| Divider | `/divider`, `/hr` | - |
| Callout (Info) | `/info` | `Cmd+Shift+O` |
| Callout (Warning) | `/warning` | - |
| Callout (Tip) | `/tip` | - |

### Layout Blocks
| Block | Slash Command | Keyboard Shortcut |
|-------|---------------|-------------------|
| Section | `/section` | `Cmd+Shift+S` |
| 2 Columns | `/columns2` | `Cmd+Shift+C` |
| 3 Columns | `/columns3` | - |
| Toggle | `/toggle` | `Cmd+Shift+T` |

### Media Blocks
| Block | Slash Command | Description |
|-------|---------------|-------------|
| Image | `/image` | Resizable with captions |
| File | `/file` | File attachment with icons |
| YouTube | `/youtube` | Embedded video |
| Embed | `/embed` | Social media embeds |
| Twitter/X | `/twitter` | Tweet embed |
| Instagram | `/instagram` | Post embed |
| Figma | `/figma` | Design embed |
| Loom | `/loom` | Video embed |
| CodePen | `/codepen` | Code demo embed |
| Spotify | `/spotify` | Music embed |

### Data Blocks
| Block | Slash Command | Description |
|-------|---------------|-------------|
| Table | `/table` | Basic table |
| InkpenTable | `/table` | Notion-style tables with handles, menus, colors |
| Database | `/database` | Notion-style inline database |
| Kanban Board | `/kanban` | Database with board view |
| Gallery | `/gallery` | Database with gallery view |
| Table of Contents | `/toc` | Auto-generated navigation |

---

## Extensions

### 17 Custom Extensions

| Extension | Version | Description |
|-----------|---------|-------------|
| Section | v0.2.2 | Page-builder style width/spacing controls |
| Preformatted | v0.3.0 | ASCII art and whitespace preservation |
| Slash Commands | v0.3.0 | Notion-style command palette |
| Block Gutter | v0.3.1 | Drag handles and plus buttons |
| Drag Handle | v0.3.2 | Block reordering via drag & drop |
| Toggle Block | v0.3.3 | Collapsible content blocks |
| Columns | v0.3.3 | Multi-column layouts |
| Callout | v0.3.3 | Highlighted tip/warning/info blocks |
| Block Commands | v0.4.0 | Block selection and duplication |
| Enhanced Image | v0.5.0 | Resizable images with captions |
| File Attachment | v0.5.0 | File uploads with type icons |
| Embed | v0.5.0 | Social media embeds |
| Advanced Table | v0.6.0 | Professional table features (deprecated) |
| Table of Contents | v0.6.0 | Auto-generated heading navigation |
| Database | v0.6.0 | Notion-style inline databases |
| Export Commands | v0.7.0 | Export keyboard shortcuts |
| **InkpenTable** | v0.8.0 | Notion-style tables with handles & menus |

### Database Features
- **Property Types:** Text, Number, Select, Date, Checkbox, URL
- **Views:** Table, List, Gallery, Board (Kanban)
- **Operations:** Add/edit/delete rows, add properties
- **Styling:** Color-coded select tags

### InkpenTable Features (v0.8.0+)
- **Row/Column handles** with context menus
- **Quick add buttons** ("+ New row", "+")
- **Text colors** (9 options: gray, red, orange, yellow, green, blue, purple, pink)
- **Background colors** (9 matching options)
- Column alignment (left, center, right)
- Table caption/title
- Border style variants (default, striped, borderless, minimal)
- Sticky header behavior
- Dark mode support

> **Note:** InkpenTable replaces both `table` and `advanced_table` extensions.
> See [InkpenTable Documentation](extensions/INKPEN_TABLE.md) for details.

---

## Export/Import

### Supported Formats

| Format | Export | Import | Copy |
|--------|--------|--------|------|
| Markdown | ✅ | ✅ | ✅ |
| HTML | ✅ | - | ✅ |
| PDF | ✅ | - | - |

### Markdown Export
- GitHub-Flavored Markdown (GFM)
- Frontmatter support (YAML metadata)
- Table conversion to GFM syntax
- Task list checkbox syntax
- Callout to GFM alert syntax (`> [!NOTE]`)
- Toggle block to `<details>` HTML

### HTML Export
- Clean semantic HTML5
- Optional inline CSS styling
- Configurable class prefixes
- Theme support (light/dark/auto)
- Print-optimized styles

### PDF Export
- Client-side generation (html2pdf.js)
- Fallback to print dialog
- Page sizes: A4, Letter, Legal, A3, A5
- Portrait/landscape orientation
- Configurable margins
- Footer with page numbers

### Export Methods

```javascript
// Via editor controller
editor.exportMarkdown()
editor.downloadAsMarkdown('document.md')
editor.copyAsMarkdown()
editor.importMarkdown(markdownString)

editor.exportHTML()
editor.downloadAsHTML('document.html')
editor.copyAsHTML()

editor.exportPDF()
editor.downloadAsPDF('document.pdf')
```

### Export Slash Commands
When `export_commands` extension is enabled:
- `/export markdown` - Download as .md
- `/export html` - Download as .html
- `/export pdf` - Download as .pdf
- `/copy markdown` - Copy to clipboard
- `/copy html` - Copy to clipboard

---

## Keyboard Shortcuts

### Text Formatting
| Shortcut | Action |
|----------|--------|
| `Cmd+B` | Bold |
| `Cmd+I` | Italic |
| `Cmd+U` | Underline |
| `Cmd+Shift+S` | Strikethrough |
| `Cmd+E` | Inline code |
| `Cmd+K` | Insert link |

### Block Operations
| Shortcut | Action |
|----------|--------|
| `/` | Open slash menu |
| `Cmd+D` | Duplicate block |
| `Cmd+Shift+ArrowUp` | Move block up |
| `Cmd+Shift+ArrowDown` | Move block down |
| `Backspace` (empty) | Delete block |

### Block Insertion
| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+S` | Insert section |
| `Cmd+Shift+P` | Toggle preformatted |
| `Cmd+Shift+T` | Insert toggle / TOC |
| `Cmd+Shift+C` | Insert 2 columns |
| `Cmd+Shift+O` | Insert info callout |

### Table Shortcuts
| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+L` | Align cell left |
| `Cmd+Shift+E` | Align cell center |
| `Cmd+Shift+R` | Align cell right |
| `Tab` | Next cell |
| `Shift+Tab` | Previous cell |

### Export Shortcuts
| Shortcut | Action |
|----------|--------|
| `Cmd+Alt+M` | Download Markdown |
| `Cmd+Alt+H` | Download HTML |
| `Cmd+Alt+P` | Download PDF |
| `Cmd+Alt+Shift+M` | Copy Markdown |
| `Cmd+Alt+Shift+H` | Copy HTML |

---

## Configuration

### Basic Setup

```erb
<%= inkpen_editor form, :content,
  toolbar: :sticky,
  extensions: [:slash_commands, :block_gutter, :drag_handle] %>
```

### Enable All Features

```ruby
# config/initializers/inkpen.rb
Inkpen.configure do |config|
  config.extensions = [
    # Core
    :bold, :italic, :strike, :underline, :link,
    :heading, :bullet_list, :ordered_list, :blockquote,
    :code_block, :horizontal_rule, :hard_break,

    # Lists
    :task_list,

    # Blocks
    :section, :preformatted, :toggle_block, :columns, :callout,

    # Media
    :enhanced_image, :file_attachment, :embed, :youtube,

    # Data
    :table, :advanced_table, :database, :table_of_contents,

    # UI
    :slash_commands, :block_gutter, :drag_handle, :block_commands,

    # Export
    :export_commands
  ]
end
```

### Sticky Toolbar with Export

```erb
<div data-controller="inkpen--editor inkpen--sticky-toolbar"
     data-inkpen--sticky-toolbar-show-export-value="true"
     data-inkpen--sticky-toolbar-export-formats-value='["markdown","html","pdf"]'>
</div>
```

---

## File Structure

```
app/assets/javascripts/inkpen/
├── controllers/
│   ├── editor_controller.js
│   ├── toolbar_controller.js
│   └── sticky_toolbar_controller.js
├── extensions/
│   ├── section.js
│   ├── preformatted.js
│   ├── slash_commands.js
│   ├── block_gutter.js
│   ├── drag_handle.js
│   ├── toggle_block.js
│   ├── columns.js
│   ├── callout.js
│   ├── block_commands.js
│   ├── enhanced_image.js
│   ├── file_attachment.js
│   ├── embed.js
│   ├── advanced_table.js          # deprecated
│   ├── table_of_contents.js
│   ├── database.js
│   ├── document_section.js
│   ├── export_commands.js
│   └── inkpen_table/              # v0.8.0 - Notion-style tables
│       ├── index.js
│       ├── inkpen_table.js
│       ├── inkpen_table_cell.js
│       ├── inkpen_table_header.js
│       ├── table_menu.js
│       ├── table_helpers.js
│       └── table_constants.js
├── export/
│   ├── index.js
│   ├── markdown.js
│   ├── html.js
│   └── pdf.js
└── index.js

app/assets/stylesheets/inkpen/
├── editor.css
├── sticky_toolbar.css
├── section.css
├── preformatted.css
├── slash_menu.css
├── block_gutter.css
├── drag_drop.css
├── toggle.css
├── columns.css
├── callout.css
├── animations.css
├── enhanced_image.css
├── file_attachment.css
├── embed.css
├── advanced_table.css             # deprecated
├── inkpen_table.css               # v0.8.0
├── toc.css
├── database.css
├── document_section.css
└── export.css
```

---

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Accessibility

- Keyboard navigation for all menus
- ARIA attributes for screen readers
- Reduced motion support (`prefers-reduced-motion`)
- Focus indicators

## Mobile Support

- Touch-friendly targets (32px minimum)
- Always-visible gutter on mobile
- Responsive column stacking
- Optimized animations

---

## Comparison with Notion

| Feature | Notion | Inkpen |
|---------|--------|--------|
| Block-based editing | ✅ | ✅ |
| Slash commands | ✅ | ✅ |
| Drag & drop blocks | ✅ | ✅ |
| Toggle blocks | ✅ | ✅ |
| Callouts | ✅ | ✅ |
| Columns | ✅ | ✅ |
| Tables | ✅ | ✅ |
| Database blocks | ✅ | ✅ |
| Kanban boards | ✅ | ✅ |
| Table of contents | ✅ | ✅ |
| Social embeds | ✅ | ✅ |
| File attachments | ✅ | ✅ |
| Markdown export | ✅ | ✅ |
| PDF export | ✅ | ✅ |
| Comments | ✅ | ❌ |
| Real-time collaboration | ✅ | ❌ |
| Version history | ✅ | ❌ |
| AI features | ✅ | ❌ |

---

## License

MIT License - See LICENSE file for details.
