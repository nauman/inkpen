import { Controller } from "@hotwired/stimulus"

/**
 * Inkpen Toolbar Controller
 *
 * Handles the floating selection toolbar.
 * Shows/hides based on text selection and provides formatting buttons.
 */
export default class extends Controller {
  static targets = ["button"]

  static values = {
    style: { type: String, default: "floating" },
    buttons: { type: Array, default: [] },
    position: { type: String, default: "top" }
  }

  connect() {
    this.editorController = null
    this.isVisible = false

    // Find parent editor controller
    this.findEditorController()

    // Listen for selection changes
    document.addEventListener("selectionchange", this.handleSelectionChange.bind(this))

    // Build toolbar buttons
    this.buildToolbar()
  }

  disconnect() {
    document.removeEventListener("selectionchange", this.handleSelectionChange.bind(this))
  }

  findEditorController() {
    // Find the inkpen--editor controller in parent
    const editorElement = this.element.closest("[data-controller*='inkpen--editor']")
    if (editorElement) {
      this.editorController = this.application.getControllerForElementAndIdentifier(
        editorElement,
        "inkpen--editor"
      )
    }
  }

  buildToolbar() {
    const buttons = this.buttonsValue.length > 0 ? this.buttonsValue : this.defaultButtons()

    this.element.innerHTML = buttons.map(btn => {
      if (btn === "divider") {
        return '<span class="inkpen-toolbar__divider"></span>'
      }

      const config = this.buttonConfig(btn)
      return `
        <button type="button"
                class="inkpen-toolbar__button"
                data-action="click->inkpen--toolbar#executeCommand"
                data-command="${btn}"
                title="${config.title}">
          ${config.icon}
        </button>
      `
    }).join("")
  }

  defaultButtons() {
    return ["bold", "italic", "underline", "strike", "divider", "highlight", "link", "divider", "heading"]
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
      }
    }

    return configs[name] || { title: name, icon: name }
  }

  executeCommand(event) {
    const command = event.currentTarget.dataset.command
    if (!this.editorController) return

    switch (command) {
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
      case "youtube":
        this.promptForYoutubeUrl()
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

  handleSelectionChange() {
    // Debounce selection handling
    clearTimeout(this.selectionTimeout)
    this.selectionTimeout = setTimeout(() => {
      this.updateVisibility()
      this.updateActiveStates()
    }, 100)
  }

  updateVisibility() {
    if (this.styleValue !== "floating") return

    const selection = window.getSelection()
    const hasSelection = selection && !selection.isCollapsed && selection.toString().trim()

    if (hasSelection && this.isSelectionInEditor(selection)) {
      this.show()
      this.positionToolbar(selection)
    } else {
      this.hide()
    }
  }

  isSelectionInEditor(selection) {
    const editorElement = this.element.closest("[data-controller*='inkpen--editor']")
    if (!editorElement) return false

    const contentElement = editorElement.querySelector("[data-inkpen--editor-target='content']")
    if (!contentElement) return false

    const range = selection.getRangeAt(0)
    return contentElement.contains(range.commonAncestorContainer)
  }

  positionToolbar(selection) {
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const toolbarRect = this.element.getBoundingClientRect()

    let top = rect.top + window.scrollY - toolbarRect.height - 10
    let left = rect.left + window.scrollX + (rect.width / 2) - (toolbarRect.width / 2)

    // Keep within viewport
    const padding = 10
    if (left < padding) left = padding
    if (left + toolbarRect.width > window.innerWidth - padding) {
      left = window.innerWidth - toolbarRect.width - padding
    }
    if (top < padding) {
      top = rect.bottom + window.scrollY + 10
    }

    this.element.style.top = `${top}px`
    this.element.style.left = `${left}px`
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
      link: "link",
      heading: "heading",
      bulletList: "bulletList",
      orderedList: "orderedList",
      blockquote: "blockquote",
      codeBlock: "codeBlock"
    }
    return mapping[command] || command
  }

  show() {
    this.element.classList.add("is-visible")
    this.isVisible = true
  }

  hide() {
    this.element.classList.remove("is-visible")
    this.isVisible = false
  }
}
