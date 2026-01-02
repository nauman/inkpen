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

export { InkpenTable, InkpenTableRow } from "inkpen/extensions/inkpen_table/inkpen_table"
export { InkpenTableCell } from "inkpen/extensions/inkpen_table/inkpen_table_cell"
export { InkpenTableHeader } from "inkpen/extensions/inkpen_table/inkpen_table_header"
export { TableMenu } from "inkpen/extensions/inkpen_table/table_menu"

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
} from "inkpen/extensions/inkpen_table/table_constants"

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
} from "inkpen/extensions/inkpen_table/table_helpers"
