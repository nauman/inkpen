// Minimal @hotwired/stimulus stub for vitest. The production bundle
// keeps Stimulus external (host-provided); the test path needs just
// enough surface to let editor_controller.js import without erroring.

export class Application {
  static start() {
    return new Application()
  }
  register() {}
}

export class Controller {
  static targets = []
  static values = {}
  static classes = []
  connect() {}
  disconnect() {}
}
