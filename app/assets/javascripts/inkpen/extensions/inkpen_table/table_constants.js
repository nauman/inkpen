/**
 * InkpenTable Constants
 *
 * Colors, menu items, and configuration for the enhanced table extension.
 *
 * @since 0.8.0
 */

// =============================================================================
// Text Colors
// =============================================================================

export const TEXT_COLORS = [
  { name: "default", label: "Default", value: null },
  { name: "gray", label: "Gray", value: "#787774" },
  { name: "red", label: "Red", value: "#d44c47" },
  { name: "orange", label: "Orange", value: "#d9730d" },
  { name: "yellow", label: "Yellow", value: "#cb912f" },
  { name: "green", label: "Green", value: "#448361" },
  { name: "blue", label: "Blue", value: "#337ea9" },
  { name: "purple", label: "Purple", value: "#9065b0" },
  { name: "pink", label: "Pink", value: "#c14c8a" }
]

// =============================================================================
// Background Colors
// =============================================================================

export const BACKGROUND_COLORS = [
  { name: "default", label: "Default", value: null },
  { name: "gray", label: "Gray", value: "rgba(120, 120, 120, 0.12)" },
  { name: "red", label: "Red", value: "rgba(239, 68, 68, 0.15)" },
  { name: "orange", label: "Orange", value: "rgba(249, 115, 22, 0.15)" },
  { name: "yellow", label: "Yellow", value: "rgba(234, 179, 8, 0.15)" },
  { name: "green", label: "Green", value: "rgba(34, 197, 94, 0.15)" },
  { name: "blue", label: "Blue", value: "rgba(59, 130, 246, 0.15)" },
  { name: "purple", label: "Purple", value: "rgba(168, 85, 247, 0.15)" },
  { name: "pink", label: "Pink", value: "rgba(236, 72, 153, 0.15)" }
]

// =============================================================================
// Table Variants
// =============================================================================

export const TABLE_VARIANTS = [
  { name: "default", label: "Default" },
  { name: "striped", label: "Striped" },
  { name: "borderless", label: "Borderless" },
  { name: "minimal", label: "Minimal" }
]

// =============================================================================
// Row Menu Items
// =============================================================================

export const ROW_MENU_ITEMS = [
  { type: "action", id: "addRowAbove", label: "Add row above", icon: "↑" },
  { type: "action", id: "addRowBelow", label: "Add row below", icon: "↓" },
  { type: "separator" },
  { type: "action", id: "duplicateRow", label: "Duplicate row", icon: "⧉" },
  { type: "action", id: "deleteRow", label: "Delete row", icon: "✕", danger: true },
  { type: "separator" },
  { type: "action", id: "moveRowUp", label: "Move up", icon: "↑" },
  { type: "action", id: "moveRowDown", label: "Move down", icon: "↓" },
  { type: "separator" },
  { type: "action", id: "toggleHeaderRow", label: "Toggle header", icon: "H" },
  { type: "separator" },
  { type: "submenu", id: "textColor", label: "Text color", icon: "A" },
  { type: "submenu", id: "backgroundColor", label: "Background", icon: "◼" }
]

// =============================================================================
// Column Menu Items
// =============================================================================

export const COLUMN_MENU_ITEMS = [
  { type: "action", id: "addColumnLeft", label: "Add column left", icon: "←" },
  { type: "action", id: "addColumnRight", label: "Add column right", icon: "→" },
  { type: "separator" },
  { type: "action", id: "duplicateColumn", label: "Duplicate column", icon: "⧉" },
  { type: "action", id: "deleteColumn", label: "Delete column", icon: "✕", danger: true },
  { type: "separator" },
  { type: "action", id: "moveColumnLeft", label: "Move left", icon: "←" },
  { type: "action", id: "moveColumnRight", label: "Move right", icon: "→" },
  { type: "separator" },
  { type: "submenu", id: "alignment", label: "Alignment", icon: "≡" },
  { type: "separator" },
  { type: "submenu", id: "textColor", label: "Text color", icon: "A" },
  { type: "submenu", id: "backgroundColor", label: "Background", icon: "◼" }
]

// =============================================================================
// Alignment Options
// =============================================================================

export const ALIGNMENT_OPTIONS = [
  { name: "left", label: "Left", icon: "←" },
  { name: "center", label: "Center", icon: "↔" },
  { name: "right", label: "Right", icon: "→" }
]

// =============================================================================
// Default Configuration
// =============================================================================

export const DEFAULT_CONFIG = {
  resizable: true,
  defaultVariant: "default",
  showHandles: true,
  showAddButtons: true,
  showCaption: true,
  stickyHeader: false,
  cellBackgrounds: BACKGROUND_COLORS,
  textColors: TEXT_COLORS
}

// =============================================================================
// CSS Classes
// =============================================================================

export const CSS_CLASSES = {
  wrapper: "inkpen-table-wrapper",
  table: "inkpen-table",
  colHandles: "inkpen-table__col-handles",
  rowHandles: "inkpen-table__row-handles",
  handle: "inkpen-table__handle",
  handleActive: "inkpen-table__handle--active",
  addRow: "inkpen-table__add-row",
  addCol: "inkpen-table__add-col",
  body: "inkpen-table__body",
  content: "inkpen-table__content",
  caption: "inkpen-table__caption",
  menu: "inkpen-table-menu",
  menuItem: "inkpen-table-menu__item",
  menuSeparator: "inkpen-table-menu__separator",
  menuSubmenu: "inkpen-table-menu__submenu",
  colorSwatch: "inkpen-table-menu__color-swatch",
  selected: "inkpen-table--selected",
  rowSelected: "inkpen-table__row--selected",
  colSelected: "inkpen-table__col--selected"
}

// =============================================================================
// Keyboard Shortcuts
// =============================================================================

export const KEYBOARD_SHORTCUTS = {
  moveRowUp: { key: "ArrowUp", modifiers: ["Mod", "Shift"] },
  moveRowDown: { key: "ArrowDown", modifiers: ["Mod", "Shift"] },
  moveColumnLeft: { key: "ArrowLeft", modifiers: ["Mod", "Shift"] },
  moveColumnRight: { key: "ArrowRight", modifiers: ["Mod", "Shift"] }
}
