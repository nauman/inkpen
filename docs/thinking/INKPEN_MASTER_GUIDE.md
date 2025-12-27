# Inkpen: Complete RichText Editor Gem for Rails
## Comprehensive Architecture, Strategy & Implementation Guide

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Gem Structure & Setup](#gem-structure--setup)
4. [Extension System](#extension-system)
5. [Feature Sets](#feature-sets)
6. [Integration Pattern](#integration-pattern)
7. [Custom Blocks](#custom-blocks)
8. [Implementation Steps](#implementation-steps)
9. [Code Samples](#code-samples)
10. [Testing Strategy](#testing-strategy)
11. [Deployment & Versioning](#deployment--versioning)

---

## Executive Summary

**Inkpen** is a professional-grade **Rails gem** that wraps **TipTap** (modern rich-text editor) and provides a reusable solution for both **mademysite.com** (page builder) and **kuickr.co** (document collaboration).

### What You Get

- **One gem, two products** - DRY editor implementation shared across apps
- **Feature sets** - Different editor configurations (page_builder, document, standard)
- **6 core extensions** - ForcedDocument, CodeBlockSyntax, TaskList, Table, Mention, SlashCommands
- **Custom blocks** - Hero sections, columns, CTAs for mademysite; Collaboration features for kuickr
- **Professional styling** - CSS framework with dark mode, responsive design, customizable tokens
- **Autosave & collaboration** - Built-in support for auto-save and real-time collaboration

### Key Statistics

| Metric | Value |
|--------|-------|
| **Lines of Ruby** | ~2,600 (extension classes + helpers) |
| **Lines of JavaScript** | ~23,000 (editor + controllers + utilities) |
| **Lines of CSS** | ~12,000 (editor + toolbar + theme system) |
| **Extension Types** | 6 core + custom blocks |
| **Supported Languages** | 30+ (Ruby, Python, JS, SQL, Go, Rust, etc.) |
| **Feature Sets** | 3 (page_builder, document, standard) |
| **Customization Points** | 50+ CSS variables, 100+ config options |

---

## Architecture Overview

### System Layers

```
┌─────────────────────────────────────────┐
│   Rails Application Layer               │
│  (mademysite.com, kuickr.co)           │
└────────┬────────────────────────────────┘
         │
┌────────┴──────────────────────────────────┐
│   Inkpen Gem Engine (Rails::Engine)       │
│  - Helpers, Controllers, Assets            │
│  - Feature Sets Configuration              │
│  - Extension Loader                        │
└────────┬──────────────────────────────────┘
         │
┌────────┴──────────────────────────────────┐
│   Extension Configuration System (Ruby)    │
│  - Base class                              │
│  - 6 Core Extensions                       │
│  - JSON Serialization (to_config)          │
│  - Custom Block Registration               │
└────────┬──────────────────────────────────┘
         │
┌────────┴──────────────────────────────────┐
│   JavaScript/TipTap Layer                 │
│  - Stimulus Controllers                    │
│  - TipTap Extensions                       │
│  - UI Components (toolbars, menus)         │
│  - Real-time Collaboration                 │
└─────────────────────────────────────────┘
```

### Data Flow

```
User opens editor in app
         ↓
View helper: <%= tiptap_editor(@model, :field, features: :page_builder) %>
         ↓
Rails renders partial with Stimulus controller
         ↓
Stimulus controller calls /inkpen/extensions/page_builder.json
         ↓
Rails controller builds extension config using Ruby classes
         ↓
Extensions call .to_config() → converts to JSON-safe Hash
         ↓
JSON sent to JavaScript
         ↓
JavaScript ExtensionsLoader maps config to TipTap
         ↓
TipTap editor initialized with all configured extensions
         ↓
User can now create/edit content with all features
```

---

## Gem Structure & Setup

### Directory Layout

```
inkpen-gem/
├── lib/
│   ├── inkpen.rb                           # Main gem file
│   ├── inkpen/
│   │   ├── version.rb                      # Version constant
│   │   ├── engine.rb                       # Rails::Engine setup
│   │   ├── configuration.rb                # Gem configuration
│   │   ├── editor.rb                       # TiptapEditor class
│   │   ├── toolbar.rb                      # Toolbar config
│   │   └── extensions/
│   │       ├── base.rb                     # Base extension class
│   │       ├── forced_document.rb          # Document structure
│   │       ├── code_block_syntax.rb        # Syntax highlighting
│   │       ├── task_list.rb                # Checklists
│   │       ├── table.rb                    # Data tables
│   │       ├── mention.rb                  # @mentions
│   │       └── slash_commands.rb           # Command palette
│   │
│   └── generators/
│       └── install_generator.rb            # rails generate inkpen:install
│
├── app/
│   ├── controllers/
│   │   └── inkpen/
│   │       ├── extensions_controller.rb    # Serves extension configs
│   │       └── base_controller.rb
│   │
│   ├── helpers/
│   │   └── inkpen/
│   │       └── editor_helper.rb            # tiptap_editor helper
│   │
│   ├── views/
│   │   └── inkpen/
│   │       ├── _editor.html.erb            # Main editor partial
│   │       └── _floating_menu.html.erb
│   │
│   ├── javascript/
│   │   ├── controllers/
│   │   │   ├── inkpen/
│   │   │   │   ├── editor_controller.js    # Main Stimulus controller
│   │   │   │   ├── toolbar_controller.js   # Toolbar Stimulus
│   │   │   │   └── sticky_toolbar_controller.js
│   │   │   │
│   │   ├── utils/
│   │   │   ├── extensions_loader.js        # Extension loader
│   │   │   ├── syntax_highlighter.js
│   │   │   └── collaboration.js
│   │   │
│   │   ├── components/
│   │   │   ├── mention_list.js
│   │   │   ├── command_palette.js
│   │   │   ├── floating_toolbar.js
│   │   │   └── widget_modal.js
│   │   │
│   │   └── entrypoints/
│   │       └── inkpen.js                   # Main entrypoint
│   │
│   └── assets/
│       └── stylesheets/
│           ├── inkpen/
│           │   ├── editor.css              # Core editor styles
│           │   ├── sticky_toolbar.css      # Toolbar styles
│           │   ├── dark_mode.css
│           │   └── responsive.css
│           │
│           └── themes/
│               ├── github.css              # Code highlight theme
│               ├── monokai.css
│               └── dracula.css
│
├── spec/
│   ├── lib/
│   │   └── inkpen/
│   │       └── extensions/
│   │           ├── base_spec.rb
│   │           ├── code_block_syntax_spec.rb
│   │           └── slash_commands_spec.rb
│   │
│   └── dummy/                              # Dummy Rails app for testing
│       ├── app/
│       ├── config/
│       └── db/
│
├── inkpen.gemspec                          # Gem specification
├── Rakefile
└── README.md
```

### Gem Dependencies

Reference: See `inkpen.gemspec` and `Gemfile`

Key dependencies:
- Rails >= 7.0
- JavaScript bundler (Importmap/Webpack/Esbuild)
- TipTap core packages
- Stimulus Rails
- Highlight.js (syntax highlighting)

---

## Extension System

### Core Concept

**Extensions** are Ruby configuration classes that describe how to enhance the TipTap editor. Each extension:
1. Inherits from `Base`
2. Implements `name` and `to_config` methods
3. Provides sensible defaults
4. Serializes to JSON for JavaScript consumption

### The 6 Core Extensions

#### 1. ForcedDocument
**Purpose**: Enforce a specific document structure (title + optional subtitle)
**Use Case**: Blog posts, articles, Medium-style documents
**Key Features**: Title protection, subtitle toggle, custom placeholders

Reference: See [Code Sample A1](#a1-forceddocument)

#### 2. CodeBlockSyntax
**Purpose**: Syntax highlighting with 30+ languages
**Use Case**: Developer tutorials, documentation, code snippets
**Key Features**: Language selector, copy button, line numbers, themes

Reference: See [Code Sample A2](#a2-codeblacksyntax)

#### 3. TaskList
**Purpose**: Interactive checkbox lists
**Use Case**: Todo posts, planning documents, checklists
**Key Features**: Nesting support, keyboard shortcuts, state persistence

Reference: See [Code Sample A3](#a3-tasklist)

#### 4. Table
**Purpose**: Full-featured data tables with ProseMirror
**Use Case**: Data comparison, pricing tables, specifications
**Key Features**: Resizable columns, cell merge, headers, backgrounds

Reference: See [Code Sample A4](#a4-table)

#### 5. Mention
**Purpose**: @mention users or entities
**Use Case**: Collaboration, notifications, tagging
**Key Features**: Dynamic search, static items option, custom trigger

Reference: See [Code Sample A5](#a5-mention)

#### 6. SlashCommands
**Purpose**: Notion-style command palette for rapid block insertion
**Use Case**: Power users, content creators, documentation
**Key Features**: 13 built-in commands, grouping, filtering, icons

Reference: See [Code Sample A6](#a6-slashcommands)

### Extension Configuration Hierarchy

```
Base
├── Attributes
│   ├── name (Symbol)
│   ├── enabled (Boolean)
│   └── options (Hash)
│
├── Methods
│   ├── initialize(**options)
│   ├── name
│   ├── enabled?
│   ├── to_config
│   ├── to_h
│   └── to_json
│
└── Subclasses
    ├── ForcedDocument
    ├── CodeBlockSyntax
    ├── TaskList
    ├── Table
    ├── Mention
    └── SlashCommands
```

---

## Feature Sets

### Concept

**Feature Sets** are predefined configurations that determine which editor features are available in different contexts.

### Three Predefined Sets

#### 1. Page Builder (mademysite.com)
**Target**: Landing pages, custom site builder
**Blocks Available**: 
- Text formatting (bold, italic, underline)
- Headings (1-6)
- Lists (bullet, ordered, task)
- Media (image, video, embed)
- Layout (columns, hero, testimonials)
- Advanced (table, code block, blockquote)
**Extensions**: ForcedDocument, CodeBlockSyntax, TaskList, Table, SlashCommands, Custom layout blocks

Reference: See [Code Sample B1](#b1-page-builder-feature-set)

#### 2. Document (kuickr.co)
**Target**: Collaboration documents, internal wikis
**Blocks Available**:
- Text (bold, italic, code)
- Headings (1-3, minimal)
- Lists (bullet, ordered)
- Code (syntax highlighting)
- Collaboration (comments, suggestions)
- Advanced (table, TOC)
**Extensions**: CodeBlockSyntax, Mention, TaskList, Table, SlashCommands

Reference: See [Code Sample B2](#b2-document-feature-set)

#### 3. Standard
**Target**: Blog posts, articles, general content
**Blocks Available**:
- Text (bold, italic, underline)
- Headings (1-3)
- Lists (bullet, ordered)
- Media (image, link)
- Advanced (blockquote, code block)
**Extensions**: ForcedDocument, CodeBlockSyntax, TaskList, SlashCommands

Reference: See [Code Sample B3](#b3-standard-feature-set)

### Feature Set Architecture

```
TiptapEditor.extensions_for(:page_builder)
  ↓
Looks up FEATURE_SETS[:page_builder]
  ↓
Maps to: { text: [...], headings: [...], layout: [...] }
  ↓
build_extensions(features)
  ↓
Instantiates extension classes with feature-specific config
  ↓
Returns: [ForcedDocument, CodeBlockSyntax, Table, SlashCommands, ...]
```

---

## Integration Pattern

### Step 1: Rails Backend

The Rails application serves extension configurations as JSON.

**Responsibilities**:
- Determine which feature set to load
- Instantiate extension classes
- Serialize to JSON
- Return to JavaScript

Reference: See [Code Sample C1](#c1-rails-controller)

### Step 2: View Helper

The view helper provides a clean API for developers.

**Usage**: 
```
<%= tiptap_editor(@model, :field, features: :page_builder) %>
```

**Responsibilities**:
- Render editor partial
- Pass configuration to Stimulus
- Handle form integration

Reference: See [Code Sample C2](#c2-view-helper)

### Step 3: Stimulus Controller

The Stimulus controller bridges Rails and JavaScript.

**Responsibilities**:
- Load extension config from server
- Initialize TipTap editor
- Handle autosave
- Manage editor lifecycle

Reference: See [Code Sample C3](#c3-stimulus-controller)

### Step 4: JavaScript Extension Loader

The ExtensionsLoader maps Ruby configs to TipTap extensions.

**Responsibilities**:
- Parse JSON config
- Load appropriate TipTap packages
- Configure each extension
- Return ready-to-use extensions array

Reference: See [Code Sample C4](#c4-extensions-loader)

### Step 5: TipTap Initialization

TipTap editor is finally initialized with all extensions.

**Responsibilities**:
- Create editor instance
- Attach to DOM element
- Wire up event handlers
- Enable collaboration features

Reference: See [Code Sample C5](#c5-tiptap-initialization)

---

## Custom Blocks

### Concept

Custom blocks are domain-specific components beyond standard TipTap extensions.

### mademysite.com Custom Blocks

#### Hero Section
**Purpose**: Eye-catching homepage header
**Properties**: Background image, headline, subtitle, CTA button
**Editor UI**: Modal for uploading image, setting text

#### Columns Layout
**Purpose**: Multi-column content organization
**Properties**: Number of columns (2-4), column widths, gaps
**Editor UI**: Drag-to-resize column borders

#### Callout/Alert
**Purpose**: Highlighted information boxes
**Properties**: Type (info, warning, success, error), text content
**Editor UI**: Type selector dropdown

#### Testimonial
**Purpose**: Customer quotes with attribution
**Properties**: Quote text, author name, author image, company
**Editor UI**: Form fields for each property

### kuickr.co Custom Blocks

#### Comment Thread
**Purpose**: Inline comments and discussions
**Properties**: User, timestamp, text, replies
**Editor UI**: Comment composer, reply thread

#### Suggestion/Tracked Changes
**Purpose**: Edit suggestions for collaboration
**Properties**: Original text, suggested text, author, status
**Editor UI**: Accept/reject buttons

#### Document Outline/TOC
**Purpose**: Auto-generated table of contents
**Properties**: Auto-populated from headings
**Editor UI**: Read-only, clickable navigation

### Custom Block Pattern

Each custom block implements:
1. **Server-side (Ruby)** - Configuration class inheriting from `Inkpen::Extensions::Base`
2. **JavaScript** - TipTap extension with editor plugin
3. **UI Component** - Editor toolbar or modal for configuration
4. **Styling** - CSS for rendering in editor and content

Reference: See [Code Sample D1](#d1-custom-block-hero)

---

## Implementation Steps

### Phase 1: Gem Foundation
1. Create gem structure with `bundle gem inkpen`
2. Setup Rails::Engine
3. Create configuration class
4. Setup generators

Reference: See [Code Sample E1](#e1-gem-setup)

### Phase 2: Extension Classes
1. Implement Base class
2. Create 6 core extension classes
3. Add validation and defaults
4. Write unit tests

Reference: See [Code Samples A1-A6](#code-samples)

### Phase 3: Backend Integration
1. Create ExtensionsController
2. Implement EditorHelper
3. Create TiptapEditor class with feature sets
4. Setup routes

Reference: See [Code Sample E2](#e2-backend-setup)

### Phase 4: Frontend Integration
1. Create Stimulus controller
2. Implement ExtensionsLoader
3. Setup TipTap initialization
4. Wire event handlers

Reference: See [Code Sample E3](#e3-frontend-setup)

### Phase 5: Styling
1. Setup CSS variables
2. Create editor.css
3. Create sticky_toolbar.css
4. Add dark mode support

Reference: See [Code Sample E4](#e4-styling-setup)

### Phase 6: Testing
1. Write unit tests for extensions
2. Write integration tests
3. Test in both apps
4. Test custom blocks

Reference: See [Code Sample E5](#e5-testing-setup)

### Phase 7: Deployment
1. Publish gem to internal server or GitHub
2. Add as dependency in both apps
3. Generate initial setup
4. Test end-to-end

Reference: See [Code Sample E6](#e6-deployment)

---

## Testing Strategy

### Unit Tests

Test extension classes in isolation.

**Targets**:
- Configuration merging
- Default options
- JSON serialization
- Validation

Reference: See [Code Sample F1](#f1-unit-tests)

### Integration Tests

Test extension loading and initialization.

**Targets**:
- Feature set loading
- Extension controller response
- Stimulus controller initialization
- TipTap editor creation

Reference: See [Code Sample F2](#f2-integration-tests)

### Browser Tests

Test editor functionality in real browser.

**Targets**:
- Typing and formatting
- Toolbar interaction
- Floating menu
- Slash commands
- Autosave

Reference: See [Code Sample F3](#f3-browser-tests)

---

## Deployment & Versioning

### Version Strategy

```
MAJOR.MINOR.PATCH

MAJOR - Breaking changes (extension API change)
MINOR - New features (new extension, new blocks)
PATCH - Bug fixes
```

### Publishing to Internal Server

Option 1: Private gem server (Gemfury, Artifactory)
Option 2: GitHub Private Repository
Option 3: Internal git repository with SSH key

### Version Pinning in Applications

```ruby
# Gemfile (mademysite.com)
gem 'inkpen', '~> 1.2.0'  # Allow patch updates, pin minor

# Gemfile (kuickr.co)
gem 'inkpen', '~> 1.1.0'  # Different version if different features
```

### Changelog Maintenance

Reference: See [Code Sample G1](#g1-changelog)

---

## Code Samples

### A1: ForcedDocument
Reference: `lib/inkpen/extensions/forced_document.rb`

Implements document structure enforcement - title is required, subtitle is optional.

### A2: CodeBlockSyntax
Reference: `lib/inkpen/extensions/code_block_syntax.rb`

Implements syntax highlighting with 30+ languages and customizable themes.

### A3: TaskList
Reference: `lib/inkpen/extensions/task_list.rb`

Implements interactive checkboxes with nesting and keyboard shortcuts.

### A4: Table
Reference: `lib/inkpen/extensions/table.rb`

Implements ProseMirror tables with resizing, merging, and styling.

### A5: Mention
Reference: `lib/inkpen/extensions/mention.rb`

Implements @mentions with optional search API integration.

### A6: SlashCommands
Reference: `lib/inkpen/extensions/slash_commands.rb`

Implements Notion-style command palette with 13 built-in commands.

---

### B1: Page Builder Feature Set

```ruby
# Reference: lib/inkpen/editor.rb - FEATURE_SETS[:page_builder]
```

Defines all blocks and extensions available for page builder (mademysite.com).

### B2: Document Feature Set

```ruby
# Reference: lib/inkpen/editor.rb - FEATURE_SETS[:document]
```

Defines all blocks and extensions available for documents (kuickr.co).

### B3: Standard Feature Set

```ruby
# Reference: lib/inkpen/editor.rb - FEATURE_SETS[:standard]
```

Defines all blocks and extensions for standard blog posts.

---

### C1: Rails Controller

```ruby
# Reference: app/controllers/inkpen/extensions_controller.rb
```

Serves extension JSON config based on feature set parameter.

### C2: View Helper

```ruby
# Reference: app/helpers/inkpen/editor_helper.rb
```

Provides clean API for rendering editor in views.

### C3: Stimulus Controller

```ruby
# Reference: app/javascript/controllers/inkpen/editor_controller.js
```

Main Stimulus controller managing editor lifecycle.

### C4: Extensions Loader

```javascript
// Reference: app/javascript/utils/extensions_loader.js
```

Loads and configures all TipTap extensions based on JSON config.

### C5: TipTap Initialization

```javascript
// Reference: app/javascript/utils/tiptap_init.js
```

Creates TipTap editor instance with extensions.

---

### D1: Custom Block - Hero

```ruby
# Reference: Custom block implementation pattern
```

Example of how to create a custom Hero block for page builder.

---

### E1: Gem Setup

```ruby
# Reference: lib/inkpen/engine.rb, lib/inkpen.rb, inkpen.gemspec
```

Rails::Engine setup, module structure, and gem configuration.

### E2: Backend Setup

```ruby
# Reference: app/controllers/inkpen/extensions_controller.rb, lib/inkpen/editor.rb, lib/inkpen/tiptap_editor.rb
```

Controller, helper, and feature set configuration.

### E3: Frontend Setup

```javascript
// Reference: app/javascript/controllers/inkpen/editor_controller.js, app/javascript/utils/extensions_loader.js
```

Stimulus controller and JavaScript extension loader setup.

### E4: Styling Setup

```css
# Reference: app/assets/stylesheets/inkpen/editor.css, sticky_toolbar.css
```

CSS framework with variables, dark mode, and responsive design.

### E5: Testing Setup

```ruby
# Reference: spec/lib/inkpen/extensions/*_spec.rb
```

RSpec tests for extensions and integration.

### E6: Deployment

```
# Reference: Gem publishing process and version management
```

How to publish gem and integrate into applications.

---

### F1: Unit Tests

```ruby
# Example test structure
RSpec.describe Inkpen::Extensions::CodeBlockSyntax do
  describe "#to_config" do
    it "converts options to JSON-safe hash"
    it "includes all language options"
    it "respects default language setting"
  end
end
```

### F2: Integration Tests

```ruby
# Example test structure
RSpec.describe "Editor Extension Loading" do
  it "loads page_builder feature set"
  it "includes all expected extensions"
  it "serializes to valid JSON"
end
```

### F3: Browser Tests

```javascript
// Example test structure using Cypress/Playwright
describe("Editor Functionality", () => {
  it("allows typing in editor")
  it("shows floating menu on text selection")
  it("executes slash commands")
  it("autosaves content")
})
```

---

### G1: Changelog

```markdown
# CHANGELOG.md format

## [1.2.0] - 2024-01-15
### Added
- ForcedDocument extension
- CodeBlockSyntax with 30+ languages
- Support for custom blocks

### Changed
- Refactored extension loading system

### Fixed
- Fixed dark mode CSS variable scoping
```

---

## Summary: What You Now Have

| Component | Status | Files |
|-----------|--------|-------|
| **Gem Foundation** | Complete | engine.rb, version.rb, gemspec |
| **Extension Classes** | Complete | 6 extension classes + base |
| **Feature Sets** | Complete | Defined in editor.rb |
| **Backend Integration** | Defined | Controller, Helper, TiptapEditor |
| **Frontend Integration** | Defined | Stimulus, ExtensionsLoader |
| **Styling System** | Complete | editor.css, sticky_toolbar.css |
| **Testing Strategy** | Defined | RSpec + Playwright patterns |
| **Documentation** | Complete | This document |

---

## Next Actions

1. **Review this document** - Understand the full architecture
2. **Examine your files** - See what's already implemented
3. **Follow implementation steps** - Phase 1 through Phase 7
4. **Write tests** - As you implement each phase
5. **Test in both apps** - mademysite.com and kuickr.co
6. **Iterate on UX** - Based on real usage

---

## Key Files Reference Map

| Purpose | File | Type |
|---------|------|------|
| Gem entry point | lib/inkpen.rb | Ruby |
| Engine setup | lib/inkpen/engine.rb | Ruby |
| Configuration | lib/inkpen/configuration.rb | Ruby |
| Base extension | lib/inkpen/extensions/base.rb | Ruby |
| ForcedDocument | lib/inkpen/extensions/forced_document.rb | Ruby |
| CodeBlockSyntax | lib/inkpen/extensions/code_block_syntax.rb | Ruby |
| TaskList | lib/inkpen/extensions/task_list.rb | Ruby |
| Table | lib/inkpen/extensions/table.rb | Ruby |
| Mention | lib/inkpen/extensions/mention.rb | Ruby |
| SlashCommands | lib/inkpen/extensions/slash_commands.rb | Ruby |
| TiptapEditor | lib/inkpen/editor.rb | Ruby |
| Controller | app/controllers/inkpen/extensions_controller.rb | Ruby |
| Helper | app/helpers/inkpen/editor_helper.rb | Ruby |
| Stimulus Controller | app/javascript/controllers/inkpen/editor_controller.js | JavaScript |
| ExtensionsLoader | app/javascript/utils/extensions_loader.js | JavaScript |
| Editor CSS | app/assets/stylesheets/inkpen/editor.css | CSS |
| Toolbar CSS | app/assets/stylesheets/inkpen/sticky_toolbar.css | CSS |

---

**This document is your complete reference for Inkpen gem architecture, implementation, and deployment.**
