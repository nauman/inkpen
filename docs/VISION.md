# Inkpen Vision

> A Rails-native TipTap editor that makes rich content editing feel native to your application.

---

## Philosophy

Inkpen follows three core principles:

1. **Rails-native**: Works with importmap-rails, Stimulus, and POROs. No npm/webpack required.
2. **Progressive enhancement**: Start simple, enable features as needed.
3. **Convention over configuration**: Sensible defaults, easy overrides.

---

## Architecture

### The Stack

```
┌─────────────────────────────────────────────────────────────┐
│  Your Rails Application                                      │
├─────────────────────────────────────────────────────────────┤
│  Inkpen Gem (Rails Engine)                                   │
│  ├── Ruby Layer (POROs)                                      │
│  │   ├── Editor         → Main configuration object          │
│  │   ├── Toolbar        → Bubble/fixed toolbar config        │
│  │   ├── StickyToolbar  → Bottom bar with block insertions   │
│  │   ├── Configuration  → Global defaults                    │
│  │   └── Extensions/*   → Ruby config for each extension     │
│  ├── Stimulus Controllers                                    │
│  │   ├── editor_controller.js      → TipTap lifecycle        │
│  │   ├── toolbar_controller.js     → Floating toolbar        │
│  │   └── sticky_toolbar_controller.js → Fixed bottom bar     │
│  └── TipTap Extensions (JavaScript)                          │
│      ├── Core (bold, italic, heading, lists, etc.)           │
│      ├── Blocks (section, callout, toggle, columns)          │
│      ├── Media (enhanced_image, file_attachment, embed)      │
│      ├── Data (database, table_of_contents, advanced_table)  │
│      └── Utilities (slash_commands, block_gutter, drag_handle)│
├─────────────────────────────────────────────────────────────┤
│  TipTap / ProseMirror                                        │
└─────────────────────────────────────────────────────────────┘
```

### Extension Philosophy

Each extension is:
- **Self-contained**: Own Ruby class, JS file, and CSS
- **Opt-in**: Enable via `extensions: [:name]` in configuration
- **Composable**: Extensions work together without tight coupling
- **Lazy-loadable**: Advanced extensions (like export) load on demand

---

## Understanding "Blocks" and "Sections"

Inkpen builds on TipTap/ProseMirror, which models documents as a tree of nodes. This influences how we think about blocks and sections:

### Blocks (What We Have)

In TipTap terms, a "block" is any block-level node:
- **Standard blocks**: paragraph, heading, blockquote, code_block
- **List blocks**: bullet_list, ordered_list, task_list
- **Custom blocks**: callout, toggle_block, columns, database

Each block can have:
- NodeView for custom rendering (drag handles, controls, etc.)
- Attributes for configuration
- Commands for manipulation

**Inkpen provides**: Slash commands, drag handles, block gutter UI, and block commands (duplicate, delete) for managing blocks.

### Sections: Two Approaches

There are two valid patterns for "sections" in TipTap:

#### 1. Layout Sections (Inkpen's Current Approach)

Our `Section` extension is a **layout wrapper** that controls visual presentation:

```html
<section data-width="wide" data-spacing="spacious">
  <p>Content inside gets this width and spacing</p>
</section>
```

Use cases:
- Page builder layouts (narrow reading width, full-width media)
- Vertical rhythm control (spacing between content areas)
- Visual theming per section

This is what we call **"page builder" sections**.

#### 2. Content Grouping Sections (Alternative Pattern)

A true "document outline" section is a **container node** with a title + content:

```html
<section>
  <h2>Section Title</h2>
  <p>Paragraph one...</p>
  <p>Paragraph two...</p>
</section>
```

In ProseMirror terms: `content: 'sectionTitle block*'`

Use cases:
- Collapsible document sections
- Outline navigation
- Notion-style pages with headers that group content
- Export to structured formats

This is what we call **"document" sections**.

### Which Do You Need?

| Use Case | Approach | Extension |
|----------|----------|-----------|
| Control content width | Layout Section | `section` |
| Add spacing between areas | Layout Section | `section` |
| Collapsible content | Toggle Block | `toggle_block` |
| Group blocks under a heading | Document Section | Future: `document_section` |
| Notion-style page outline | Document Section | Future: `document_section` |
| Drag multiple blocks together | Document Section | Future: `document_section` |

**Current status**: Inkpen has layout sections and toggle blocks. True document sections could be added as a separate extension.

---

## Extension Categories

### Core Extensions
Always available, provide basic rich text:
- bold, italic, strike, underline, link
- heading, bullet_list, ordered_list
- blockquote, code_block, horizontal_rule, hard_break

### Block Extensions
Custom block types with NodeView UIs:
- `section` - Layout width/spacing control
- `callout` - Highlighted info/warning/tip boxes
- `toggle_block` - Collapsible details/summary
- `columns` - Multi-column layouts
- `preformatted` - Plain text for ASCII art

### Media Extensions
Rich media handling:
- `enhanced_image` - Resizable, captioned, alignable images
- `file_attachment` - File uploads with type icons
- `embed` - Social/web embeds (YouTube, Twitter, etc.)

### Data Extensions
Structured data:
- `advanced_table` - Enhanced tables with styling
- `database` - Notion-style inline databases
- `table_of_contents` - Auto-generated navigation

### Utility Extensions
Editor enhancements:
- `slash_commands` - "/" command palette
- `block_gutter` - Left gutter with + and drag handle
- `drag_handle` - Block reordering
- `block_commands` - Selection, duplication, deletion
- `export_commands` - Keyboard shortcuts for export

### Export Extensions
Content portability:
- `export/markdown` - GFM Markdown export/import
- `export/html` - Clean HTML5 export
- `export/pdf` - PDF generation

---

## Design Decisions

### Why Ruby POROs?

Extensions have a Ruby layer because:
1. **Configuration**: Set defaults in initializers, per-editor overrides in views
2. **Type safety**: Ruby validation before JSON serialization
3. **Testability**: Unit test extension config without browser
4. **Consistency**: Same pattern as other Rails objects

### Why Lazy Loading?

Export modules use `import()` because:
1. **Optional**: Not every editor needs export
2. **Size**: Export code adds weight to main bundle
3. **Dependencies**: PDF export optionally loads html2pdf.js

### Why Stimulus?

Stimulus controllers because:
1. **Rails standard**: Works with Turbo, importmap
2. **Lifecycle**: Clean connect/disconnect hooks
3. **Values API**: Data attributes for configuration
4. **Events**: Controller communication via dispatch

---

## Roadmap Philosophy

### Current Focus (v0.7.x)
- Stability and polish
- MadeMySite integration
- Bug fixes and refinements

### Near Term (v0.8.x)
- Document sections (content grouping)
- Enhanced collaboration features
- Performance optimizations

### Future (v1.0+)
- Real-time collaboration
- Version history
- AI-assisted writing
- Plugin ecosystem

---

## Contributing

When adding features:

1. **Start with Ruby**: Create extension PORO in `lib/inkpen/extensions/`
2. **Add JavaScript**: Create TipTap extension in `app/assets/javascripts/inkpen/extensions/`
3. **Style it**: Add CSS in `app/assets/stylesheets/inkpen/`
4. **Register it**: Add to `ADVANCED_EXTENSIONS` in `configuration.rb`
5. **Test it**: Add tests in `test/`
6. **Document it**: Update CHANGELOG.md and ROADMAP.md

Follow the patterns in CLAUDE.md for code style.
