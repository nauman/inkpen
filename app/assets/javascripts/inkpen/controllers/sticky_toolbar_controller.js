import { Controller } from "@hotwired/stimulus"

/**
 * Inkpen Sticky Toolbar Controller
 *
 * Fixed-position toolbar for block/media/widget insertion.
 * Supports horizontal (bottom) and vertical (left/right) layouts.
 *
 * Follows Fizzy patterns:
 * - Single responsibility (toolbar positioning + commands)
 * - Declarative data-* configuration
 * - Event-driven communication with editor
 *
 * Usage:
 * <div data-controller="inkpen--editor inkpen--sticky-toolbar"
 *      data-inkpen--sticky-toolbar-position-value="bottom"
 *      data-inkpen--sticky-toolbar-buttons-value='["table","code_block","image"]'>
 *   ...
 * </div>
 */
export default class extends Controller {
  static targets = ["button", "widgetModal", "widgetList"]

  static values = {
    position: { type: String, default: "bottom" },
    buttons: { type: Array, default: [] },
    widgetTypes: { type: Array, default: [] },
    vertical: { type: Boolean, default: false }
  }

  connect() {
    this.editorController = null
    this.findEditorController()

    // Prevent duplicate toolbars on reconnect
    if (!this.toolbarElement) {
      this.createToolbarElement()
      this.buildToolbar()
      this.applyLayout()
    }
  }

  disconnect() {
    this.closeWidgetModal()
    this.removeToolbarElement()
    this.removeModalElement()
  }

  // --- Toolbar Element Management ---

  createToolbarElement() {
    // Create the sticky toolbar container as a sibling to the editor
    this.toolbarElement = document.createElement("div")
    this.toolbarElement.className = "inkpen-sticky-toolbar"

    // Insert after the editor element
    this.element.parentNode.insertBefore(this.toolbarElement, this.element.nextSibling)
  }

  removeToolbarElement() {
    if (this.toolbarElement && this.toolbarElement.parentNode) {
      this.toolbarElement.parentNode.removeChild(this.toolbarElement)
    }
  }

  // Create modal element and append to body (avoids transform containing block issues)
  createModalElement() {
    // Prevent duplicate modals
    if (this.modalElement) return

    const wrapper = document.createElement("div")
    wrapper.innerHTML = this.renderWidgetModal()
    this.modalElement = wrapper.firstElementChild
    document.body.appendChild(this.modalElement)

    // Bind modal event handlers
    this.bindModalEvents()
  }

  removeModalElement() {
    if (this.modalElement && this.modalElement.parentNode) {
      this.modalElement.parentNode.removeChild(this.modalElement)
    }
  }

  bindModalEvents() {
    if (!this.modalElement) return

    const backdrop = this.modalElement.querySelector(".inkpen-widget-modal__backdrop")
    if (backdrop) {
      backdrop.addEventListener("click", () => this.closeWidgetModal())
    }

    const closeBtn = this.modalElement.querySelector(".inkpen-widget-modal__close")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeWidgetModal())
    }

    this.modalElement.querySelectorAll("[data-widget-type]").forEach(btn => {
      btn.addEventListener("click", (e) => this.insertWidget(e))
    })
  }

  // --- Layout Management ---

  applyLayout() {
    if (!this.toolbarElement) return

    this.toolbarElement.classList.toggle("inkpen-sticky-toolbar--vertical", this.verticalValue)
    this.toolbarElement.classList.toggle("inkpen-sticky-toolbar--horizontal", !this.verticalValue)
    this.toolbarElement.dataset.position = this.positionValue
  }

  positionValueChanged() {
    this.verticalValue = ["left", "right"].includes(this.positionValue)
    this.applyLayout()
  }

  // --- Toolbar Building ---

  buildToolbar() {
    if (!this.toolbarElement) return

    const buttons = this.buttonsValue.length > 0 ? this.buttonsValue : this.defaultButtons()

    // Build toolbar buttons only (modal is appended to body separately)
    this.toolbarElement.innerHTML = `
      <div class="inkpen-sticky-toolbar__buttons">
        ${buttons.map(btn => this.renderButton(btn)).join("")}
      </div>
    `

    // Bind toolbar button handlers
    this.bindToolbarEvents()

    // Create modal as child of body to avoid transform containing block issues
    this.createModalElement()
  }

  bindToolbarEvents() {
    if (!this.toolbarElement) return

    // Button click handlers with mousedown prevention to preserve editor selection
    this.toolbarElement.querySelectorAll("[data-command]").forEach(btn => {
      btn.addEventListener("mousedown", (e) => e.preventDefault())
      btn.addEventListener("click", (e) => this.executeCommand(e))
    })
  }

  defaultButtons() {
    return ["table", "code_block", "divider", "image", "youtube", "divider", "widget"]
  }

  renderButton(btn) {
    if (btn === "divider") {
      return '<span class="inkpen-sticky-toolbar__divider"></span>'
    }

    const config = this.buttonConfig(btn)
    return `
      <button type="button"
              class="inkpen-sticky-toolbar__btn"
              data-command="${btn}"
              title="${config.title}">
        ${config.icon}
      </button>
    `
  }

  buttonConfig(name) {
    const configs = {
      table: {
        title: "Insert Table",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>'
      },
      code_block: {
        title: "Code Block",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
      },
      blockquote: {
        title: "Quote Block",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>'
      },
      horizontal_rule: {
        title: "Divider Line",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>'
      },
      task_list: {
        title: "Task List",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3.5 8 2 2 3-3"/><line x1="13" y1="8" x2="21" y2="8"/><rect x="3" y="14" width="6" height="6" rx="1"/><line x1="13" y1="17" x2="21" y2="17"/></svg>'
      },
      image: {
        title: "Insert Image",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>'
      },
      youtube: {
        title: "YouTube Video",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>'
      },
      embed: {
        title: "Embed Content",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>'
      },
      widget: {
        title: "Insert Widget",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'
      },
      section: {
        title: "Insert Section",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>'
      },
      preformatted: {
        title: "Preformatted Text (ASCII)",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><text x="6" y="10" font-size="5" font-family="monospace" fill="currentColor">┌──┐</text><text x="6" y="15" font-size="5" font-family="monospace" fill="currentColor">│  │</text><text x="6" y="20" font-size="5" font-family="monospace" fill="currentColor">└──┘</text></svg>'
      }
    }

    return configs[name] || { title: name, icon: name }
  }

  // --- Widget Modal ---

  renderWidgetModal() {
    const widgets = this.widgetTypesValue.length > 0 ? this.widgetTypesValue : ["form", "gallery", "poll"]

    return `
      <div class="inkpen-widget-modal hidden" role="dialog" aria-modal="true">
        <div class="inkpen-widget-modal__backdrop"></div>
        <div class="inkpen-widget-modal__content">
          <div class="inkpen-widget-modal__header">
            <h3>Insert Widget</h3>
            <button type="button" class="inkpen-widget-modal__close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="inkpen-widget-modal__list">
            ${widgets.map(w => this.renderWidgetOption(w)).join("")}
          </div>
        </div>
      </div>
    `
  }

  renderWidgetOption(type) {
    const config = this.widgetConfig(type)
    return `
      <button type="button" class="inkpen-widget-modal__option" data-widget-type="${type}">
        <span class="inkpen-widget-modal__option-icon">${config.icon}</span>
        <div class="inkpen-widget-modal__option-text">
          <span class="inkpen-widget-modal__option-label">${config.label}</span>
          <span class="inkpen-widget-modal__option-desc">${config.description}</span>
        </div>
      </button>
    `
  }

  widgetConfig(type) {
    const configs = {
      form: {
        label: "Form",
        description: "Embed a contact or signup form",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="12" y2="16"/></svg>'
      },
      gallery: {
        label: "Gallery",
        description: "Display an image gallery",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>'
      },
      poll: {
        label: "Poll",
        description: "Create an interactive poll",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="8" width="10" height="2"/><rect x="7" y="14" width="6" height="2"/></svg>'
      }
    }

    return configs[type] || { label: type, description: "", icon: "" }
  }

  openWidgetModal() {
    if (this.modalElement) {
      this.modalElement.classList.remove("hidden")
      document.body.style.overflow = "hidden"
    }
  }

  closeWidgetModal() {
    if (this.modalElement) {
      this.modalElement.classList.add("hidden")
      document.body.style.overflow = ""
    }
  }

  insertWidget(event) {
    const type = event.currentTarget.dataset.widgetType
    this.closeWidgetModal()

    // Dispatch event for host app to handle widget insertion
    this.element.dispatchEvent(
      new CustomEvent("inkpen:insert-widget", {
        bubbles: true,
        detail: { type, controller: this }
      })
    )
  }

  // --- Command Execution ---

  findEditorController() {
    // The sticky toolbar controller is on the same element as the editor controller
    this.editorController = this.application.getControllerForElementAndIdentifier(
      this.element,
      "inkpen--editor"
    )
  }

  executeCommand(event) {
    const command = event.currentTarget.dataset.command
    if (!this.editorController) {
      this.findEditorController()
    }
    if (!this.editorController) return

    switch (command) {
      case "table":
        this.editorController.insertTable(3, 3, true)
        break
      case "code_block":
        this.editorController.toggleCodeBlock()
        break
      case "blockquote":
        this.editorController.toggleBlockquote()
        break
      case "horizontal_rule":
        this.editorController.insertHorizontalRule()
        break
      case "task_list":
        this.editorController.toggleTaskList()
        break
      case "image":
        this.promptForImage()
        break
      case "youtube":
        this.promptForYoutubeUrl()
        break
      case "embed":
        this.promptForEmbed()
        break
      case "widget":
        this.openWidgetModal()
        break
      case "section":
        this.editorController.insertSection()
        break
      case "preformatted":
        this.editorController.insertPreformatted()
        break
    }
  }

  promptForImage() {
    // Dispatch event for host app to handle image upload
    this.element.dispatchEvent(
      new CustomEvent("inkpen:request-image", {
        bubbles: true,
        detail: { controller: this }
      })
    )
  }

  promptForYoutubeUrl() {
    const url = prompt("Enter YouTube URL:", "https://www.youtube.com/watch?v=")
    if (url && url !== "https://www.youtube.com/watch?v=") {
      this.editorController.insertYoutubeVideo(url)
    }
  }

  promptForEmbed() {
    // Dispatch event for host app to handle embed
    this.element.dispatchEvent(
      new CustomEvent("inkpen:request-embed", {
        bubbles: true,
        detail: { controller: this }
      })
    )
  }

  // --- Public API ---

  /**
   * Insert an image at the current cursor position.
   * Call this from host app after uploading an image.
   * @param {string} src - The image URL
   * @param {string} alt - Alt text for the image
   */
  insertImage(src, alt = "") {
    if (this.editorController?.editor) {
      this.editorController.editor.chain().focus().setImage({ src, alt }).run()
    }
  }

  /**
   * Insert a widget placeholder at the current cursor position.
   * @param {string} type - Widget type (form, gallery, poll)
   * @param {object} data - Widget configuration data
   */
  insertWidgetBlock(type, data = {}) {
    // Dispatch event with widget data for host app to insert custom node
    this.element.dispatchEvent(
      new CustomEvent("inkpen:widget-inserted", {
        bubbles: true,
        detail: { type, data, controller: this }
      })
    )
  }
}
