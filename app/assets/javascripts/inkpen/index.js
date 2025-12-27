// Inkpen - TipTap-based rich text editor for Rails
// Entry point for importmap

import { Application } from "@hotwired/stimulus"
import EditorController from "inkpen/controllers/editor_controller"
import ToolbarController from "inkpen/controllers/toolbar_controller"
import StickyToolbarController from "inkpen/controllers/sticky_toolbar_controller"

// Auto-register controllers if Stimulus application exists
const application = window.Stimulus || Application.start()

application.register("inkpen--editor", EditorController)
application.register("inkpen--toolbar", ToolbarController)
application.register("inkpen--sticky-toolbar", StickyToolbarController)

export { EditorController, ToolbarController, StickyToolbarController }
