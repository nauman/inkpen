// Inkpen - TipTap-based rich text editor for Rails
// Entry point for importmap - DEBUG MODE

console.log("[Inkpen] Starting imports...")

let Application, EditorController, ToolbarController, StickyToolbarController
let Section, Preformatted, SlashCommands, BlockGutter, DragHandle
let ToggleBlock, ToggleSummary, Columns, Column, Callout, BlockCommands
let EnhancedImage, FileAttachment, Embed
let AdvancedTable, AdvancedTableRow, AdvancedTableCell, AdvancedTableHeader
let TableOfContents, Database, DocumentSection, SectionTitle

try {
  const mod = await import("@hotwired/stimulus")
  Application = mod.Application
  console.log("[Inkpen] ✓ @hotwired/stimulus")
} catch (e) { console.error("[Inkpen] ✗ @hotwired/stimulus:", e) }

try {
  const mod = await import("inkpen/controllers/editor_controller")
  EditorController = mod.default
  console.log("[Inkpen] ✓ editor_controller")
} catch (e) { console.error("[Inkpen] ✗ editor_controller:", e) }

try {
  const mod = await import("inkpen/controllers/toolbar_controller")
  ToolbarController = mod.default
  console.log("[Inkpen] ✓ toolbar_controller")
} catch (e) { console.error("[Inkpen] ✗ toolbar_controller:", e) }

try {
  const mod = await import("inkpen/controllers/sticky_toolbar_controller")
  StickyToolbarController = mod.default
  console.log("[Inkpen] ✓ sticky_toolbar_controller")
} catch (e) { console.error("[Inkpen] ✗ sticky_toolbar_controller:", e) }

// Extensions
try {
  const mod = await import("inkpen/extensions/section")
  Section = mod.Section
  console.log("[Inkpen] ✓ section")
} catch (e) { console.error("[Inkpen] ✗ section:", e) }

try {
  const mod = await import("inkpen/extensions/preformatted")
  Preformatted = mod.Preformatted
  console.log("[Inkpen] ✓ preformatted")
} catch (e) { console.error("[Inkpen] ✗ preformatted:", e) }

try {
  const mod = await import("inkpen/extensions/slash_commands")
  SlashCommands = mod.SlashCommands
  console.log("[Inkpen] ✓ slash_commands")
} catch (e) { console.error("[Inkpen] ✗ slash_commands:", e) }

try {
  const mod = await import("inkpen/extensions/block_gutter")
  BlockGutter = mod.BlockGutter
  console.log("[Inkpen] ✓ block_gutter")
} catch (e) { console.error("[Inkpen] ✗ block_gutter:", e) }

try {
  const mod = await import("inkpen/extensions/drag_handle")
  DragHandle = mod.DragHandle
  console.log("[Inkpen] ✓ drag_handle")
} catch (e) { console.error("[Inkpen] ✗ drag_handle:", e) }

try {
  const mod = await import("inkpen/extensions/toggle_block")
  ToggleBlock = mod.ToggleBlock
  ToggleSummary = mod.ToggleSummary
  console.log("[Inkpen] ✓ toggle_block")
} catch (e) { console.error("[Inkpen] ✗ toggle_block:", e) }

try {
  const mod = await import("inkpen/extensions/columns")
  Columns = mod.Columns
  Column = mod.Column
  console.log("[Inkpen] ✓ columns")
} catch (e) { console.error("[Inkpen] ✗ columns:", e) }

try {
  const mod = await import("inkpen/extensions/callout")
  Callout = mod.Callout
  console.log("[Inkpen] ✓ callout")
} catch (e) { console.error("[Inkpen] ✗ callout:", e) }

try {
  const mod = await import("inkpen/extensions/block_commands")
  BlockCommands = mod.BlockCommands
  console.log("[Inkpen] ✓ block_commands")
} catch (e) { console.error("[Inkpen] ✗ block_commands:", e) }

try {
  const mod = await import("inkpen/extensions/enhanced_image")
  EnhancedImage = mod.EnhancedImage
  console.log("[Inkpen] ✓ enhanced_image")
} catch (e) { console.error("[Inkpen] ✗ enhanced_image:", e) }

try {
  const mod = await import("inkpen/extensions/file_attachment")
  FileAttachment = mod.FileAttachment
  console.log("[Inkpen] ✓ file_attachment")
} catch (e) { console.error("[Inkpen] ✗ file_attachment:", e) }

try {
  const mod = await import("inkpen/extensions/embed")
  Embed = mod.Embed
  console.log("[Inkpen] ✓ embed")
} catch (e) { console.error("[Inkpen] ✗ embed:", e) }

try {
  const mod = await import("inkpen/extensions/advanced_table")
  AdvancedTable = mod.AdvancedTable
  AdvancedTableRow = mod.AdvancedTableRow
  AdvancedTableCell = mod.AdvancedTableCell
  AdvancedTableHeader = mod.AdvancedTableHeader
  console.log("[Inkpen] ✓ advanced_table")
} catch (e) { console.error("[Inkpen] ✗ advanced_table:", e) }

try {
  const mod = await import("inkpen/extensions/table_of_contents")
  TableOfContents = mod.TableOfContents
  console.log("[Inkpen] ✓ table_of_contents")
} catch (e) { console.error("[Inkpen] ✗ table_of_contents:", e) }

try {
  const mod = await import("inkpen/extensions/database")
  Database = mod.Database
  console.log("[Inkpen] ✓ database")
} catch (e) { console.error("[Inkpen] ✗ database:", e) }

try {
  const mod = await import("inkpen/extensions/document_section")
  DocumentSection = mod.DocumentSection
  console.log("[Inkpen] ✓ document_section")
} catch (e) { console.error("[Inkpen] ✗ document_section:", e) }

try {
  const mod = await import("inkpen/extensions/section_title")
  SectionTitle = mod.SectionTitle
  console.log("[Inkpen] ✓ section_title")
} catch (e) { console.error("[Inkpen] ✗ section_title:", e) }

console.log("[Inkpen] All imports attempted, registering controllers...")

// Auto-register controllers if Stimulus application exists
const application = window.Stimulus || Application.start()

if (EditorController) application.register("inkpen--editor", EditorController)
if (ToolbarController) application.register("inkpen--toolbar", ToolbarController)
if (StickyToolbarController) application.register("inkpen--sticky-toolbar", StickyToolbarController)

console.log("[Inkpen] Controllers registered")

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
