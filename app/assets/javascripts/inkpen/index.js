// Inkpen - TipTap-based rich text editor for Rails
// Entry point for importmap

import { Application } from "@hotwired/stimulus"
import EditorController from "inkpen/controllers/editor_controller"
import ToolbarController from "inkpen/controllers/toolbar_controller"
import StickyToolbarController from "inkpen/controllers/sticky_toolbar_controller"

// TipTap extensions
import { Section } from "inkpen/extensions/section"
import { Preformatted } from "inkpen/extensions/preformatted"
import { SlashCommands } from "inkpen/extensions/slash_commands"
import { BlockGutter } from "inkpen/extensions/block_gutter"
import { DragHandle } from "inkpen/extensions/drag_handle"
import { ToggleBlock, ToggleSummary } from "inkpen/extensions/toggle_block"
import { Columns, Column } from "inkpen/extensions/columns"

// Auto-register controllers if Stimulus application exists
const application = window.Stimulus || Application.start()

application.register("inkpen--editor", EditorController)
application.register("inkpen--toolbar", ToolbarController)
application.register("inkpen--sticky-toolbar", StickyToolbarController)

// Export controllers
export { EditorController, ToolbarController, StickyToolbarController }

// Export extensions for custom use
export { Section, Preformatted, SlashCommands, BlockGutter, DragHandle, ToggleBlock, ToggleSummary, Columns, Column }
