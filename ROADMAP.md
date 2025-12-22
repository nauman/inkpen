# Inkpen Roadmap

**Vision:** A Rails-native rich text editor that can replace Dropbox Paper, Notion, and Atlassian Confluence for document editing and collaboration.

## Current Status: v0.2.0 (Beta)

### Completed Features

#### Core Editor
- [x] TipTap/ProseMirror foundation
- [x] Rails integration (forms, Turbo, Stimulus)
- [x] PORO-based architecture
- [x] Importmap compatible (no Node.js build)

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
- [x] Floating selection toolbar

---

## Phase 1: Document Excellence (v0.3.0)

**Goal:** Match Dropbox Paper's core editing experience.

### Slash Commands
- [ ] "/" command palette
- [ ] Command groups (Basic, Lists, Blocks, Media, Advanced)
- [ ] Keyboard navigation in palette
- [ ] Search/filter commands
- [ ] Custom command registration

### Enhanced Blocks
- [ ] Callout boxes (info, warning, tip, note)
- [ ] Toggle/Collapsible sections
- [ ] Dividers with styles
- [ ] Emoji picker via ":"
- [ ] Date picker via "@date"

### Media & Embeds
- [ ] File attachments (drag & drop)
- [ ] Image resizing and alignment
- [ ] Embed cards (URL unfurling)
- [ ] Figma/Miro/Loom embeds
- [ ] PDF viewer embed

### Export & Import
- [ ] Export to Markdown
- [ ] Export to HTML (clean)
- [ ] Import from Markdown
- [ ] Copy as Markdown/HTML

---

## Phase 2: Team Collaboration (v0.4.0)

**Goal:** Match Confluence's collaboration features.

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

## Phase 3: Knowledge Base (v0.5.0)

**Goal:** Compete with Notion for knowledge management.

### Document Structure
- [ ] Table of Contents generation
- [ ] Document outline sidebar
- [ ] Internal document links (wiki-style)
- [ ] Backlinks (who links here)
- [ ] Tags and metadata

### Templates
- [ ] Document templates
- [ ] Template library
- [ ] Variable placeholders
- [ ] Template from existing doc

### Search & Discovery
- [ ] Full-text search
- [ ] Search within document
- [ ] Find & Replace (regex)
- [ ] Filter by tags/metadata

---

## Phase 4: Enterprise Features (v1.0.0)

**Goal:** Production-ready for enterprise use.

### Security & Permissions
- [ ] Read/Write/Admin roles
- [ ] Section-level permissions
- [ ] Audit logging
- [ ] SSO integration hooks

### Performance
- [ ] Lazy loading for large docs
- [ ] Image optimization
- [ ] Offline support (Service Worker)
- [ ] Mobile optimization

### Customization
- [ ] Custom CSS themes
- [ ] Plugin architecture
- [ ] Custom block types
- [ ] Webhook events

---

## Comparison with Alternatives

| Feature | Inkpen | Dropbox Paper | Notion | Confluence |
|---------|--------|---------------|--------|------------|
| Rails Native | ✅ | ❌ | ❌ | ❌ |
| PORO Architecture | ✅ | N/A | N/A | N/A |
| No Build Step | ✅ | N/A | N/A | N/A |
| Self-Hosted | ✅ | ❌ | ❌ | ✅ |
| Real-Time Collab | 🔄 | ✅ | ✅ | ✅ |
| Comments | 🔄 | ✅ | ✅ | ✅ |
| Version History | 🔄 | ✅ | ✅ | ✅ |
| Templates | 🔄 | ✅ | ✅ | ✅ |
| @Mentions | ✅ | ✅ | ✅ | ✅ |
| Slash Commands | 🔄 | ✅ | ✅ | ❌ |
| Tables | ✅ | ✅ | ✅ | ✅ |
| Code Blocks | ✅ | ✅ | ✅ | ✅ |
| Embeds | ✅ | ✅ | ✅ | ✅ |

Legend: ✅ Implemented | 🔄 In Progress | ❌ Not Available

---

## Target Users

### Primary: Ruby on Rails Applications

1. **mademysite** - Blogging platform with rich post editor
2. **kuickr** - Knowledge management and document sharing

### Secondary: Any Web Application

- SaaS products needing document editing
- Internal tools and knowledge bases
- CMS and content platforms

---

## Technical Principles

1. **Rails-First**: Native integration with Rails conventions
2. **PORO Excellence**: Configuration via plain Ruby objects
3. **No Build Step**: Works with importmaps, no Node.js required
4. **Extensible**: Modular extension system
5. **Stable**: Production-ready core before adding features
6. **Documented**: RDoc for all public APIs

---

## Contributing

We welcome contributions! Priority areas:

1. **Bug fixes** - Stability is paramount
2. **Documentation** - Examples and guides
3. **Extensions** - New block types and features
4. **Tests** - Increase coverage
5. **Performance** - Optimization

See CONTRIBUTING.md for guidelines.
