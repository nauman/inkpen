/**
 * InkpenTable Extension
 *
 * Unified enhanced table extension with Notion/Airtable-style features.
 * Replaces both basic table and advanced_table extensions.
 *
 * @since 0.8.0
 *
 * @example
 * import { InkpenTable, InkpenTableCell, InkpenTableHeader, InkpenTableRow } from "inkpen/extensions/inkpen_table"
 *
 * const editor = new Editor({
 *   extensions: [
 *     InkpenTable.configure({
 *       showHandles: true,
 *       showAddButtons: true,
 *       showCaption: true
 *     }),
 *     InkpenTableRow,
 *     InkpenTableCell,
 *     InkpenTableHeader
 *   ]
 * })
 */

export { InkpenTable, InkpenTableRow } from "./inkpen_table.js"
export { InkpenTableCell } from "./inkpen_table_cell.js"
export { InkpenTableHeader } from "./inkpen_table_header.js"
export { TableMenu } from "./table_menu.js"

// Re-export constants for customization
export {
  TEXT_COLORS,
  BACKGROUND_COLORS,
  TABLE_VARIANTS,
  ROW_MENU_ITEMS,
  COLUMN_MENU_ITEMS,
  ALIGNMENT_OPTIONS,
  DEFAULT_CONFIG,
  CSS_CLASSES
} from "./table_constants.js"

// Re-export helpers for advanced usage
export {
  createElement,
  nextFrame,
  waitFrames,
  positionBelow,
  positionRight,
  getTableDimensions,
  getRowIndex,
  getColumnIndex,
  findTableWrapper,
  findTableElement,
  stopEvent,
  onClickOutside,
  onEscapeKey
} from "./table_helpers.js"
