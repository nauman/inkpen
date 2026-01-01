# InkpenTable Extension

> **Version:** 0.8.0
> **Notion/Airtable-style enhanced tables**

A unified table extension that provides Notion-like row/column handles with context menus, text colors, background colors, and professional table features.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Configuration](#configuration)
- [Commands](#commands)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [CSS Custom Properties](#css-custom-properties)
- [Migration Guide](#migration-guide)

---

## Overview

InkpenTable replaces both the basic `table` and `advanced_table` extensions with a unified, feature-rich implementation. It combines professional table features with Notion-style UX patterns.

```
┌─────────────────────────────────────────────────────────────────┐
│  InkpenTable = AdvancedTable + Notion-style Handles + Menus     │
└─────────────────────────────────────────────────────────────────┘
```

### Key Differentiators

| Feature | table | advanced_table | inkpen_table |
|---------|-------|----------------|--------------|
| Row/Col handles | ❌ | ❌ | ✅ |
| Context menus | ❌ | ❌ | ✅ |
| Text colors | ❌ | ❌ | ✅ |
| Background colors | ❌ | ✅ | ✅ |
| Alignment | ❌ | ✅ | ✅ |
| Caption | ❌ | ✅ | ✅ |
| Variants | ❌ | ✅ | ✅ |
| Sticky header | ❌ | ✅ | ✅ |
| Quick add buttons | ❌ | ❌ | ✅ |

---

## Architecture

### File Structure

```
app/assets/javascripts/inkpen/extensions/inkpen_table/
│
├── index.js                 # Main exports
│   └── exports: InkpenTable, InkpenTableRow, InkpenTableCell,
│                InkpenTableHeader, TableMenu, constants, helpers
│
├── inkpen_table.js          # Main Table extension
│   ├── InkpenTableRow       # Extended TableRow
│   └── InkpenTable          # Extended Table with NodeView
│       ├── addOptions()     # Configuration
│       ├── addAttributes()  # caption, variant, stickyHeader
│       ├── addNodeView()    # DOM with handles
│       ├── addCommands()    # Table + cell commands
│       └── addKeyboardShortcuts()
│
├── inkpen_table_cell.js     # Extended TableCell
│   └── Attributes: align, background, textColor, colspan, rowspan, colwidth
│
├── inkpen_table_header.js   # Extended TableHeader
│   └── Same attributes as cell
│
├── table_menu.js            # Context menu class
│   └── TableMenu
│       ├── showRowMenu()
│       ├── showColumnMenu()
│       └── #createMenuItem(), #showSubmenu()
│
├── table_helpers.js         # Utility functions
│   ├── createElement()      # DOM creation
│   ├── nextFrame()          # RAF promise
│   ├── positionBelow()      # Menu positioning
│   ├── positionRight()      # Submenu positioning
│   ├── getTableDimensions() # Row/col count
│   ├── onClickOutside()     # Event handler
│   └── onEscapeKey()        # Event handler
│
└── table_constants.js       # Configuration constants
    ├── TEXT_COLORS          # 9 text color options
    ├── BACKGROUND_COLORS    # 9 background options
    ├── TABLE_VARIANTS       # 4 style variants
    ├── ROW_MENU_ITEMS       # Row context menu
    ├── COLUMN_MENU_ITEMS    # Column context menu
    ├── ALIGNMENT_OPTIONS    # Left/center/right
    ├── DEFAULT_CONFIG       # Default options
    └── CSS_CLASSES          # Class name constants
```

### DOM Structure (NodeView)

```
┌─ .inkpen-table-wrapper ─────────────────────────────────────────┐
│                                                                  │
│  ┌─ .inkpen-table__caption ────────────────────────────────┐    │
│  │  "Table Title" (contentEditable)                         │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ .inkpen-table__col-handles ────────────────────────────┐    │
│  │  [⋮⋮] [⋮⋮] [⋮⋮] [⋮⋮] [+]                                │    │
│  │   ↓    ↓    ↓    ↓   add                                │    │
│  │  col  col  col  col  col                                │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ .inkpen-table__body ───────────────────────────────────┐    │
│  │                                                          │    │
│  │  ┌─ .inkpen-table__row-handles ─┐  ┌─ .inkpen-table__content ─┐
│  │  │  [⋮⋮] ← row 0                │  │  ┌───┬───┬───┬───┐       │
│  │  │  [⋮⋮] ← row 1                │  │  │ H │ H │ H │ H │       │
│  │  │  [⋮⋮] ← row 2                │  │  ├───┼───┼───┼───┤       │
│  │  │                              │  │  │   │   │   │   │       │
│  │  └──────────────────────────────┘  │  ├───┼───┼───┼───┤       │
│  │                                    │  │   │   │   │   │       │
│  │                                    │  └───┴───┴───┴───┘       │
│  │                                    └──────────────────────────┘
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ .inkpen-table__add-row ────────────────────────────────┐    │
│  │  [+ New row]                                              │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Context Menu Structure

```
┌─ Row Menu ──────────────────┐     ┌─ Column Menu ───────────────┐
│ ↑  Add row above            │     │ ←  Add column left          │
│ ↓  Add row below            │     │ →  Add column right         │
│ ─────────────────────────── │     │ ─────────────────────────── │
│ ⧉  Duplicate row            │     │ ⧉  Duplicate column         │
│ ✕  Delete row          🔴   │     │ ✕  Delete column       🔴   │
│ ─────────────────────────── │     │ ─────────────────────────── │
│ ↑  Move up                  │     │ ←  Move left                │
│ ↓  Move down                │     │ →  Move right               │
│ ─────────────────────────── │     │ ─────────────────────────── │
│ H  Toggle header            │     │ ≡  Alignment            ▸   │
│ ─────────────────────────── │     │ ─────────────────────────── │
│ A  Text color           ▸   │     │ A  Text color           ▸   │
│ ◼  Background           ▸   │     │ ◼  Background           ▸   │
└─────────────────────────────┘     └─────────────────────────────┘

┌─ Color Submenu (Grid) ──────┐     ┌─ Alignment Submenu ─────────┐
│ [∅][G][R][O][Y]             │     │ ←  Left                     │
│ [G][B][P][P][ ]             │     │ ↔  Center                   │
│                             │     │ →  Right                    │
└─────────────────────────────┘     └─────────────────────────────┘
```

### Data Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                        User Interaction                             │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Handle Click                                                        │
│  ┌─────────────────┐                                                │
│  │ Row Handle [⋮⋮] │ ───▶ TableMenu.showRowMenu(handle)            │
│  │ Col Handle [⋮⋮] │ ───▶ TableMenu.showColumnMenu(handle)         │
│  └─────────────────┘                                                │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Menu Action                                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ handleMenuAction({ action, menuType, color, value })         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Actions:                                                            │
│  ├── addRowAbove/Below ───▶ editor.commands.addRowBefore/After()   │
│  ├── deleteRow/Column ────▶ editor.commands.deleteRow/Column()     │
│  ├── textColor ───────────▶ editor.commands.setCellTextColor()     │
│  ├── backgroundColor ─────▶ editor.commands.setCellBackground()    │
│  └── alignment ───────────▶ editor.commands.setCellAlignment()     │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ProseMirror Transaction                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ tr.setNodeMarkup(pos, undefined, { ...attrs, textColor })    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  NodeView.update() ───▶ updateHandles() ───▶ Re-render handles     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Features

### Row/Column Handles

Grip icons (⋮⋮) appear on hover at the left of each row and top of each column. Click to open context menus.

```
      [⋮⋮] [⋮⋮] [⋮⋮]    ← Column handles (top)
       │    │    │
[⋮⋮] ─┼────┼────┼────   ← Row handle (left)
       │    │    │
[⋮⋮] ─┼────┼────┼────
       │    │    │
```

### Quick Add Buttons

- **"+ New row"** button at table bottom
- **"+"** button at right of column handles

### Text Colors

9 color options for cell text:

| Color | Value | CSS Variable |
|-------|-------|--------------|
| Default | null | inherit |
| Gray | #787774 | --inkpen-table-text-gray |
| Red | #d44c47 | --inkpen-table-text-red |
| Orange | #d9730d | --inkpen-table-text-orange |
| Yellow | #cb912f | --inkpen-table-text-yellow |
| Green | #448361 | --inkpen-table-text-green |
| Blue | #337ea9 | --inkpen-table-text-blue |
| Purple | #9065b0 | --inkpen-table-text-purple |
| Pink | #c14c8a | --inkpen-table-text-pink |

### Background Colors

9 color options for cell backgrounds (same palette, lower opacity).

### Table Variants

| Variant | Description |
|---------|-------------|
| default | Standard bordered table |
| striped | Alternating row colors |
| borderless | No vertical borders |
| minimal | Clean, minimal borders |

---

## Configuration

### Basic Usage

```ruby
# config/initializers/inkpen.rb
Inkpen.configure do |config|
  config.extensions = [:inkpen_table, ...]
end
```

### Full Options

```ruby
config.extension_config = {
  inkpen_table: {
    resizable: true,          # Column resize on drag
    showHandles: true,        # Row/column handle buttons
    showAddButtons: true,     # "+ New row" / "+" buttons
    showCaption: true,        # Editable table title
    stickyHeader: false,      # Fixed header on scroll
    defaultVariant: "default" # default/striped/borderless/minimal
  }
}
```

### Disable Advanced Features

For a simpler table without handles:

```ruby
config.extension_config = {
  inkpen_table: {
    showHandles: false,
    showAddButtons: false,
    showCaption: false
  }
}
```

---

## Commands

### Table Commands (inherited)

| Command | Description |
|---------|-------------|
| `insertTable({ rows, cols, withHeaderRow })` | Insert new table |
| `addRowBefore()` | Add row above current |
| `addRowAfter()` | Add row below current |
| `deleteRow()` | Delete current row |
| `addColumnBefore()` | Add column to left |
| `addColumnAfter()` | Add column to right |
| `deleteColumn()` | Delete current column |
| `deleteTable()` | Remove entire table |
| `toggleHeaderRow()` | Toggle header row |
| `mergeCells()` | Merge selected cells |
| `splitCell()` | Split merged cell |

### InkpenTable Commands (new)

| Command | Description |
|---------|-------------|
| `setTableCaption(text)` | Set table title |
| `setTableVariant(variant)` | Set style variant |
| `toggleStickyHeader()` | Toggle sticky header |
| `setCellAlignment(align)` | Set cell text alignment |
| `setCellBackground(color)` | Set cell background color |
| `clearCellBackground()` | Remove background color |
| `setCellTextColor(color)` | Set cell text color |
| `clearCellTextColor()` | Remove text color |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+L` | Align cell left |
| `Cmd+Shift+E` | Align cell center |
| `Cmd+Shift+R` | Align cell right |
| `Tab` | Move to next cell |
| `Shift+Tab` | Move to previous cell |

---

## CSS Custom Properties

### Theme Variables

```css
:root {
  /* Selection (Notion-style blue) */
  --inkpen-table-selection: rgba(35, 131, 226, 0.14);
  --inkpen-table-selection-border: rgba(35, 131, 226, 0.5);

  /* Text colors */
  --inkpen-table-text-gray: #787774;
  --inkpen-table-text-red: #d44c47;
  --inkpen-table-text-orange: #d9730d;
  --inkpen-table-text-yellow: #cb912f;
  --inkpen-table-text-green: #448361;
  --inkpen-table-text-blue: #337ea9;
  --inkpen-table-text-purple: #9065b0;
  --inkpen-table-text-pink: #c14c8a;

  /* Background colors */
  --inkpen-table-bg-gray: rgba(120, 120, 120, 0.12);
  --inkpen-table-bg-red: rgba(239, 68, 68, 0.15);
  /* ... etc */

  /* Handle styling */
  --inkpen-table-handle-size: 24px;
  --inkpen-table-handle-color: #9ca3af;
  --inkpen-table-handle-hover: #374151;
  --inkpen-table-handle-active: #3b82f6;

  /* Menu styling */
  --inkpen-table-menu-bg: #ffffff;
  --inkpen-table-menu-border: #e5e7eb;
  --inkpen-table-menu-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  --inkpen-table-menu-hover: #f3f4f6;
}
```

### Dark Mode

All variables have dark mode variants automatically applied via `[data-theme="dark"]` or `.dark` class.

---

## Migration Guide

### From `advanced_table`

Replace in your configuration:

```ruby
# Before
config.extensions = [:advanced_table, ...]

# After
config.extensions = [:inkpen_table, ...]
```

Configuration options are compatible:

```ruby
# Before
config.extension_config = {
  advanced_table: {
    resizable: true,
    showControls: true,
    defaultVariant: "default"
  }
}

# After
config.extension_config = {
  inkpen_table: {
    resizable: true,
    showHandles: true,    # replaces showControls
    defaultVariant: "default"
  }
}
```

### From `table`

```ruby
# Before
config.extensions = [:table, ...]

# After
config.extensions = [:inkpen_table, ...]
config.extension_config = {
  inkpen_table: {
    showHandles: false,     # for basic table behavior
    showAddButtons: false,
    showCaption: false
  }
}
```

---

## Code Patterns

### Fizzy Patterns Used

```javascript
// Private fields with #
#element = null
#menu = null

// Section comments
// Lifecycle
connect() { }
disconnect() { this.#cleanup() }

// Actions
show() { }

// Private
#createMenu() { }
#cleanup() { }

// Helper exports (named functions, NOT objects)
export function nextFrame() { }
export function positionBelow() { }
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.8.0 | 2025-01 | Initial release - unified InkpenTable |

---

## License

MIT License - See LICENSE file for details.
