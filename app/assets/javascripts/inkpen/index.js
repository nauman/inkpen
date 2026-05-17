// Inkpen — TipTap-based rich text editor for Rails.
//
// This is the entry the host's importmap pins as `inkpen`. The host
// does `import "inkpen"` from its application.js; the side effect of
// that import is registering the three Stimulus controllers below.
// Everything else (TipTap core, every extension, ProseMirror, etc.)
// is loaded LAZILY by the EditorController via gated dynamic imports,
// not statically here.
//
// Spec 02 (2026-05-17, gem 0.9.0): the previous index.js statically
// imported 17 custom extensions and re-exported them as named exports.
// That made every consumer pay the full extension graph at module-eval
// time, even when their editor enabled only a subset. Those static
// imports are gone. Extension classes are now loaded on demand by
// editor_controller.js#loadEditorModules based on the editor instance's
// `extensions-value`. Hosts that previously did `import { Section }
// from "inkpen"` must now either:
//
//   a) Configure the editor's extensions-value to include "section"
//      (preferred — the controller manages the extension lifecycle)
//   b) Import the extension's path directly through a custom importmap
//      pin (advanced; only if you need direct programmatic access)
//
// InventList today only does `import "inkpen"` and configures
// extensions-value on the data-controller element — the supported and
// recommended pattern.

import { Application } from "@hotwired/stimulus"
import EditorController from "inkpen/controllers/editor_controller"
import ToolbarController from "inkpen/controllers/toolbar_controller"
import StickyToolbarController from "inkpen/controllers/sticky_toolbar_controller"

// Register controllers IMMEDIATELY at module-eval. Stimulus scans the
// DOM as soon as it boots; controllers not registered by then won't
// connect to their elements.
const application = window.Stimulus || Application.start()

application.register("inkpen--editor", EditorController)
application.register("inkpen--toolbar", ToolbarController)
application.register("inkpen--sticky-toolbar", StickyToolbarController)

// Re-export the controller classes for hosts that want to wire them
// to their own Stimulus application instance (rare; most consumers
// just use the side-effect registration above).
export { EditorController, ToolbarController, StickyToolbarController }

// Extension classes are no longer exported from this entry. Configure
// them via the `data-inkpen--editor-extensions-value` attribute on the
// editor element; editor_controller.js loads each one lazily. See the
// README "Stimulus Controller" + "Public events" sections.
