// Inkpen - TipTap-based rich text editor for Rails
// Entry point for importmap

import { Application } from "@hotwired/stimulus"
import EditorController from "inkpen/controllers/editor_controller"
import ToolbarController from "inkpen/controllers/toolbar_controller"
import StickyToolbarController from "inkpen/controllers/sticky_toolbar_controller"

// ============================================
// IMPORTANT: Register controllers IMMEDIATELY before any async code
// This ensures controllers are available when Stimulus scans the DOM
// ============================================
const application = window.Stimulus || Application.start()

application.register("inkpen--editor", EditorController)
application.register("inkpen--toolbar", ToolbarController)
application.register("inkpen--sticky-toolbar", StickyToolbarController)

// TipTap extensions (static imports)
import { Section } from "inkpen/extensions/section"
import { Preformatted } from "inkpen/extensions/preformatted"
import { SlashCommands } from "inkpen/extensions/slash_commands"
import { BlockGutter } from "inkpen/extensions/block_gutter"
import { DragHandle } from "inkpen/extensions/drag_handle"
import { ToggleBlock, ToggleSummary } from "inkpen/extensions/toggle_block"
import { Columns, Column } from "inkpen/extensions/columns"
import { Callout } from "inkpen/extensions/callout"
import { BlockCommands } from "inkpen/extensions/block_commands"
import { EnhancedImage } from "inkpen/extensions/enhanced_image"
import { FileAttachment } from "inkpen/extensions/file_attachment"
import { Embed } from "inkpen/extensions/embed"
import { AdvancedTable, AdvancedTableRow, AdvancedTableCell, AdvancedTableHeader } from "inkpen/extensions/advanced_table"
import { TableOfContents } from "inkpen/extensions/table_of_contents"
import { Database } from "inkpen/extensions/database"
import { DocumentSection } from "inkpen/extensions/document_section"
import { SectionTitle } from "inkpen/extensions/section_title"

// InkpenTable is loaded lazily to prevent import failures from breaking the library
let InkpenTable, InkpenTableRow, InkpenTableCell, InkpenTableHeader
try {
  const mod = await import("inkpen/extensions/inkpen_table")
  InkpenTable = mod.InkpenTable
  InkpenTableRow = mod.InkpenTableRow
  InkpenTableCell = mod.InkpenTableCell
  InkpenTableHeader = mod.InkpenTableHeader
} catch (e) {
  console.warn("Inkpen: InkpenTable extension not available:", e.message)
}

// Export controllers
export { EditorController, ToolbarController, StickyToolbarController }

// Export extensions for custom use
export {
  Section,
  DocumentSection,
  SectionTitle,
  Preformatted,
  SlashCommands,
  BlockGutter,
  DragHandle,
  ToggleBlock,
  ToggleSummary,
  Columns,
  Column,
  Callout,
  BlockCommands,
  EnhancedImage,
  FileAttachment,
  Embed,
  // InkpenTable - Notion-style enhanced tables (recommended)
  InkpenTable,
  InkpenTableRow,
  InkpenTableCell,
  InkpenTableHeader,
  // AdvancedTable - Legacy (use InkpenTable instead)
  AdvancedTable,
  AdvancedTableRow,
  AdvancedTableCell,
  AdvancedTableHeader,
  TableOfContents,
  Database
}

// Export functionality is available separately:
// import { ExportCommands } from "inkpen/extensions/export_commands"
// import { exportToMarkdown, ... } from "inkpen/export"
