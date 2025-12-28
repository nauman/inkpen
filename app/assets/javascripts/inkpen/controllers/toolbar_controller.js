import { Controller } from "@hotwired/stimulus"

/**
 * Inkpen Toolbar Controller
 *
 * Context-aware floating toolbar that adapts its buttons based on the current selection.
 * Shows different actions when selecting text vs. inside a table vs. on an image.
 *
 * Visibility and positioning are handled by TipTap's BubbleMenu extension.
 *
 * Important: BubbleMenu uses Tippy.js which moves the toolbar element to the
 * document body. This triggers Stimulus to disconnect and reconnect the
 * controller. We store the editor element ID on the DOM element itself
 * so we can find it after reconnection.
 *
 * Context Types:
 * - text: Regular text selection (formatting options)
 * - table: Inside a table cell (table operations)
 * - image: Image selected (alignment, delete)
 * - code: Inside code block (language selector)
 */
export default class extends Controller {
  static targets = ["button", "contextMenu"]

  static values = {
    buttons: { type: Array, default: [] },
    contextAware: { type: Boolean, default: true }
  }

  connect() {
    this.editorController = null
    this.currentContext = "text"

    // Store editor element ID on the DOM element before BubbleMenu moves us to body
    // Using a data attribute persists across Stimulus disconnect/reconnect cycles
    if (!this.element.dataset.inkpenEditorId) {
      const editorElement = this.element.closest("[data-controller*='inkpen--editor']")
      if (editorElement) {
        // Generate a unique ID if the editor doesn't have one
        if (!editorElement.id) {
          editorElement.id = `inkpen-editor-${Date.now()}`
        }
        this.element.dataset.inkpenEditorId = editorElement.id
      }
    }

    // Find parent editor controller (with retry for timing)
    this.findEditorController()
    if (!this.editorController) {
      this.retryFindEditor()
    }

    // Build initial toolbar buttons
    this.buildToolbar()

    // Listen for selection changes to update context
    if (this.contextAwareValue) {
      this.setupContextDetection()
    }
  }

  disconnect() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
    }
    if (this.selectionObserver) {
      this.selectionObserver = null
    }
  }

  // --- Context Detection ---

  setupContextDetection() {
    // Watch for editor selection events
    const editorElement = this.getEditorElement()
    if (editorElement) {
      editorElement.addEventListener("inkpen:selection-change", this.handleSelectionChange.bind(this))
    }
  }

  handleSelectionChange(event) {
    const newContext = this.detectContext()
    if (newContext !== this.currentContext) {
      this.currentContext = newContext
      this.buildToolbar()
    }
    this.updateActiveStates()
  }

  detectContext() {
    if (!this.editorController?.editor) return "text"

    const editor = this.editorController.editor
    const { selection } = editor.state
    const { $from } = selection

    // Check if inside a table cell
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth)
      if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
        return "table"
      }
      if (node.type.name === "codeBlock") {
        return "code"
      }
    }

    // Check if an image is selected
    if (selection.node?.type?.name === "image") {
      return "image"
    }

    return "text"
  }

  getEditorElement() {
    const editorId = this.element.dataset.inkpenEditorId
    if (editorId) {
      return document.getElementById(editorId)
    }
    return null
  }

  retryFindEditor() {
    let attempts = 0
    const maxAttempts = 10

    const tryFind = () => {
      attempts++
      this.findEditorController()

      if (!this.editorController && attempts < maxAttempts) {
        this.retryTimer = setTimeout(tryFind, 100)
      }
    }

    this.retryTimer = setTimeout(tryFind, 50)
  }

  findEditorController() {
    let editorElement = null

    // First, try using the stored editor ID (needed after BubbleMenu moves us to body)
    const editorId = this.element.dataset.inkpenEditorId
    if (editorId) {
      editorElement = document.getElementById(editorId)
    }

    // Fallback: try closest (works if we haven't been moved yet)
    if (!editorElement) {
      editorElement = this.element.closest("[data-controller*='inkpen--editor']")
      if (editorElement) {
        if (!editorElement.id) {
          editorElement.id = `inkpen-editor-${Date.now()}`
        }
        this.element.dataset.inkpenEditorId = editorElement.id
      }
    }

    if (editorElement) {
      this.editorController = this.application.getControllerForElementAndIdentifier(
        editorElement,
        "inkpen--editor"
      )
    }
  }

  buildToolbar() {
    const buttons = this.getButtonsForContext()

    this.element.innerHTML = buttons.map(btn => {
      if (btn === "divider") {
        return '<span class="inkpen-toolbar__divider"></span>'
      }

      const config = this.buttonConfig(btn)
      // Use mousedown to prevent focus loss + click to execute command
      return `
        <button type="button"
                class="inkpen-toolbar__button"
                data-action="mousedown->inkpen--toolbar#preventFocusLoss click->inkpen--toolbar#executeCommand"
                data-command="${btn}"
                title="${config.title}">
          ${config.icon}
        </button>
      `
    }).join("")

    // Update data attribute for CSS styling
    this.element.dataset.context = this.currentContext
  }

  /**
   * Get buttons based on current context
   */
  getButtonsForContext() {
    // If buttons are explicitly set, use those
    if (this.buttonsValue.length > 0) {
      return this.buttonsValue
    }

    // Otherwise, return context-appropriate buttons
    switch (this.currentContext) {
      case "table":
        return this.tableButtons()
      case "code":
        return this.codeButtons()
      case "image":
        return this.imageButtons()
      default:
        return this.defaultButtons()
    }
  }

  /**
   * Prevent focus from moving to the button when clicked.
   * This preserves the editor's text selection so formatting commands work correctly.
   */
  preventFocusLoss(event) {
    event.preventDefault()
  }

  // --- Button Sets by Context ---

  defaultButtons() {
    return ["bold", "italic", "underline", "strike", "divider", "code", "highlight", "link", "divider", "heading", "callout"]
  }

  tableButtons() {
    return [
      "bold", "italic", "divider",
      "addRowBefore", "addRowAfter", "deleteRow", "divider",
      "addColumnBefore", "addColumnAfter", "deleteColumn", "divider",
      "mergeCells", "splitCell", "deleteTable"
    ]
  }

  codeButtons() {
    return ["languageSelector"]
  }

  imageButtons() {
    return ["alignLeft", "alignCenter", "alignRight", "divider", "deleteImage"]
  }

  buttonConfig(name) {
    const configs = {
      bold: {
        title: "Bold (Cmd+B)",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>'
      },
      italic: {
        title: "Italic (Cmd+I)",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>'
      },
      underline: {
        title: "Underline (Cmd+U)",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v6a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg>'
      },
      strike: {
        title: "Strikethrough",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg>'
      },
      code: {
        title: "Inline Code",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>'
      },
      highlight: {
        title: "Highlight",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>'
      },
      link: {
        title: "Link (Cmd+K)",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
      },
      heading: {
        title: "Heading",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16"/><path d="M4 6v12"/><path d="M20 6v12"/></svg>'
      },
      bulletList: {
        title: "Bullet List",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>'
      },
      orderedList: {
        title: "Numbered List",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="4" y="7" font-size="6" fill="currentColor">1</text><text x="4" y="13" font-size="6" fill="currentColor">2</text><text x="4" y="19" font-size="6" fill="currentColor">3</text></svg>'
      },
      blockquote: {
        title: "Quote",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>'
      },
      codeBlock: {
        title: "Code Block",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
      },
      youtube: {
        title: "YouTube Video",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>'
      },

      // --- Table Operations ---
      addRowBefore: {
        title: "Add Row Above",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 2v4"/><path d="M9 4h6"/></svg>'
      },
      addRowAfter: {
        title: "Add Row Below",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M12 18v4"/><path d="M9 20h6"/></svg>'
      },
      deleteRow: {
        title: "Delete Row",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M9 12h6"/></svg>'
      },
      addColumnBefore: {
        title: "Add Column Left",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="3" width="13" height="18" rx="2"/><path d="M2 12h4"/><path d="M4 9v6"/></svg>'
      },
      addColumnAfter: {
        title: "Add Column Right",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="13" height="18" rx="2"/><path d="M18 12h4"/><path d="M20 9v6"/></svg>'
      },
      deleteColumn: {
        title: "Delete Column",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 12h6"/></svg>'
      },
      mergeCells: {
        title: "Merge Cells",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M9 12h6"/></svg>'
      },
      splitCell: {
        title: "Split Cell",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/><path d="M3 12h7"/><path d="M14 12h7"/></svg>'
      },
      deleteTable: {
        title: "Delete Table",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="4" y1="4" x2="20" y2="20" stroke-width="2.5"/></svg>'
      },

      // --- Advanced HTML Features ---
      callout: {
        title: "Callout Box",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="1" fill="currentColor"/><path d="M12 14v3"/></svg>'
      },
      htmlBlock: {
        title: "HTML Block",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 18 2-2v-3"/><path d="m8 18-2-2v-3"/><path d="M12 2v6"/><path d="m16 6-2-2v-3"/><path d="m8 6 2-2V2"/><rect x="4" y="10" width="16" height="10" rx="2"/></svg>'
      },

      // --- Image Operations ---
      alignLeft: {
        title: "Align Left",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
      },
      alignCenter: {
        title: "Align Center",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
      },
      alignRight: {
        title: "Align Right",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
      },
      deleteImage: {
        title: "Delete Image",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/><line x1="5" y1="5" x2="19" y2="19" stroke-width="2.5"/></svg>'
      },

      // --- Code Block ---
      languageSelector: {
        title: "Select Language",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><text x="9" y="17" font-size="8" fill="currentColor">JS</text></svg>'
      }
    }

    return configs[name] || { title: name, icon: name }
  }

  executeCommand(event) {
    const command = event.currentTarget.dataset.command
    if (!this.editorController) {
      this.findEditorController()
    }
    if (!this.editorController) return

    switch (command) {
      // --- Text Formatting ---
      case "bold":
        this.editorController.toggleBold()
        break
      case "italic":
        this.editorController.toggleItalic()
        break
      case "underline":
        this.editorController.toggleUnderline()
        break
      case "strike":
        this.editorController.toggleStrike()
        break
      case "highlight":
        this.editorController.toggleHighlight()
        break
      case "link":
        this.promptForLink()
        break
      case "heading":
        this.editorController.toggleHeading(2)
        break
      case "bulletList":
        this.editorController.toggleBulletList()
        break
      case "orderedList":
        this.editorController.toggleOrderedList()
        break
      case "blockquote":
        this.editorController.toggleBlockquote()
        break
      case "codeBlock":
        this.editorController.toggleCodeBlock()
        break
      case "code":
        this.editorController.toggleCode()
        break
      case "youtube":
        this.promptForYoutubeUrl()
        break

      // --- Table Operations ---
      case "addRowBefore":
        this.editorController.addTableRowBefore()
        break
      case "addRowAfter":
        this.editorController.addTableRowAfter()
        break
      case "deleteRow":
        this.editorController.deleteTableRow()
        break
      case "addColumnBefore":
        this.editorController.addTableColumnBefore()
        break
      case "addColumnAfter":
        this.editorController.addTableColumnAfter()
        break
      case "deleteColumn":
        this.editorController.deleteTableColumn()
        break
      case "mergeCells":
        this.editorController.mergeCells()
        break
      case "splitCell":
        this.editorController.splitCell()
        break
      case "deleteTable":
        if (confirm("Delete this table?")) {
          this.editorController.deleteTable()
        }
        break

      // --- Advanced HTML Features ---
      case "callout":
        this.insertCallout()
        break
      case "htmlBlock":
        this.insertHtmlBlock()
        break

      // --- Image Operations ---
      case "alignLeft":
        this.setImageAlignment("left")
        break
      case "alignCenter":
        this.setImageAlignment("center")
        break
      case "alignRight":
        this.setImageAlignment("right")
        break
      case "deleteImage":
        this.deleteSelectedNode()
        break

      // --- Code Block ---
      case "languageSelector":
        this.showLanguageSelector()
        break
    }

    this.updateActiveStates()
  }

  promptForYoutubeUrl() {
    const url = prompt("Enter YouTube URL:", "https://www.youtube.com/watch?v=")
    if (url && url !== "https://www.youtube.com/watch?v=") {
      this.editorController.insertYoutubeVideo(url)
    }
  }

  promptForLink() {
    const url = prompt("Enter URL:", "https://")
    if (url && url !== "https://") {
      this.editorController.setLink(url)
    }
  }

  updateActiveStates() {
    if (!this.editorController) return

    this.element.querySelectorAll(".inkpen-toolbar__button").forEach(btn => {
      const command = btn.dataset.command
      const isActive = this.editorController.isActive(this.commandToNodeName(command))
      btn.classList.toggle("is-active", isActive)
    })
  }

  commandToNodeName(command) {
    const mapping = {
      bold: "bold",
      italic: "italic",
      strike: "strike",
      underline: "underline",
      link: "link",
      heading: "heading",
      bulletList: "bulletList",
      orderedList: "orderedList",
      blockquote: "blockquote",
      codeBlock: "codeBlock",
      code: "code",
      highlight: "highlight"
    }
    return mapping[command] || command
  }

  // --- Advanced HTML Features ---

  /**
   * Insert a callout/alert box
   * Types: info, warning, tip, note
   */
  insertCallout() {
    const type = this.promptCalloutType()
    if (!type) return

    const calloutHtml = `
<div class="inkpen-callout inkpen-callout--${type}" data-callout-type="${type}">
  <div class="inkpen-callout__icon">${this.getCalloutIcon(type)}</div>
  <div class="inkpen-callout__content"><p>Type your ${type} message here...</p></div>
</div>
`
    this.editorController?.editor?.chain().focus().insertContent(calloutHtml).run()
  }

  promptCalloutType() {
    const type = prompt("Callout type (info, warning, tip, note):", "info")
    if (!type) return null

    const validTypes = ["info", "warning", "tip", "note"]
    const normalizedType = type.toLowerCase().trim()

    if (!validTypes.includes(normalizedType)) {
      alert("Invalid callout type. Please use: info, warning, tip, or note.")
      return null
    }

    return normalizedType
  }

  getCalloutIcon(type) {
    const icons = {
      info: "ℹ️",
      warning: "⚠️",
      tip: "💡",
      note: "📝"
    }
    return icons[type] || "ℹ️"
  }

  /**
   * Insert a raw HTML block
   */
  insertHtmlBlock() {
    const html = prompt("Enter HTML code:", "<div></div>")
    if (!html) return

    // Wrap in a container with editing disabled for the raw HTML
    const wrappedHtml = `<div class="inkpen-html-block" contenteditable="false">${html}</div>`
    this.editorController?.editor?.chain().focus().insertContent(wrappedHtml).run()
  }

  // --- Image Operations ---

  setImageAlignment(alignment) {
    const editor = this.editorController?.editor
    if (!editor) return

    // Get the selected image node
    const { selection } = editor.state
    if (selection.node?.type?.name !== "image") return

    // Update the image with alignment attribute
    editor.chain().focus().updateAttributes("image", {
      style: `display: block; margin: ${alignment === "center" ? "0 auto" : alignment === "right" ? "0 0 0 auto" : "0"};`
    }).run()
  }

  deleteSelectedNode() {
    this.editorController?.editor?.chain().focus().deleteSelection().run()
  }

  // --- Code Block Language ---

  showLanguageSelector() {
    const languages = [
      "javascript", "typescript", "python", "ruby", "go",
      "rust", "java", "c", "cpp", "csharp",
      "html", "css", "json", "yaml", "sql",
      "bash", "shell", "markdown", "plaintext"
    ]

    const current = this.getCurrentCodeLanguage() || "plaintext"
    const selected = prompt(
      `Select language (current: ${current}):\n\n${languages.join(", ")}`,
      current
    )

    if (selected && languages.includes(selected.toLowerCase())) {
      this.setCodeLanguage(selected.toLowerCase())
    }
  }

  getCurrentCodeLanguage() {
    const editor = this.editorController?.editor
    if (!editor) return null

    const { selection } = editor.state
    const { $from } = selection

    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth)
      if (node.type.name === "codeBlock") {
        return node.attrs.language || null
      }
    }

    return null
  }

  setCodeLanguage(language) {
    this.editorController?.editor?.chain().focus().updateAttributes("codeBlock", { language }).run()
  }
}
