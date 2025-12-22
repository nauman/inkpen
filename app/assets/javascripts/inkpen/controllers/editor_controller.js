import { Controller } from "@hotwired/stimulus"
import { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"

/**
 * Inkpen Editor Controller
 *
 * Main Stimulus controller for the TipTap editor.
 * Handles initialization, content sync, and editor lifecycle.
 */
export default class extends Controller {
  static targets = ["input", "content", "toolbar"]

  static values = {
    extensions: { type: Array, default: [] },
    toolbar: { type: String, default: "floating" },
    placeholder: { type: String, default: "Start writing..." },
    autosave: { type: Boolean, default: false },
    autosaveInterval: { type: Number, default: 5000 }
  }

  connect() {
    this.initializeEditor()
  }

  disconnect() {
    this.destroyEditor()
  }

  initializeEditor() {
    const extensions = this.buildExtensions()

    this.editor = new Editor({
      element: this.contentTarget,
      extensions,
      content: this.inputTarget.value || "",
      editorProps: {
        attributes: {
          class: "inkpen-editor__content"
        }
      },
      onUpdate: ({ editor }) => {
        this.syncContent(editor)
        this.dispatchChangeEvent()
      },
      onSelectionUpdate: ({ editor }) => {
        this.handleSelectionChange(editor)
      },
      onFocus: () => {
        this.element.classList.add("is-focused")
        this.dispatchEvent("focus")
      },
      onBlur: () => {
        this.element.classList.remove("is-focused")
        this.dispatchEvent("blur")
      }
    })

    // Set up autosave if enabled
    if (this.autosaveValue) {
      this.setupAutosave()
    }

    // Dispatch ready event
    this.dispatchEvent("ready", { editor: this.editor })
  }

  destroyEditor() {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer)
    }

    if (this.editor) {
      this.editor.destroy()
      this.editor = null
    }
  }

  buildExtensions() {
    const extensions = [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4]
        }
      }),
      Placeholder.configure({
        placeholder: this.placeholderValue
      })
    ]

    // Add link extension if enabled
    if (this.extensionsValue.includes("link")) {
      extensions.push(
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank"
          }
        })
      )
    }

    return extensions
  }

  syncContent(editor) {
    const html = editor.getHTML()
    this.inputTarget.value = html
  }

  handleSelectionChange(editor) {
    // Dispatch event for toolbar to handle
    this.dispatchEvent("selection-change", {
      editor,
      isEmpty: editor.state.selection.empty,
      from: editor.state.selection.from,
      to: editor.state.selection.to
    })
  }

  setupAutosave() {
    this.autosaveTimer = setInterval(() => {
      this.dispatchEvent("autosave", {
        content: this.inputTarget.value
      })
    }, this.autosaveIntervalValue)
  }

  // Public API methods
  getContent() {
    return this.editor?.getHTML() || ""
  }

  getJSON() {
    return this.editor?.getJSON() || null
  }

  setContent(content) {
    this.editor?.commands.setContent(content)
  }

  focus() {
    this.editor?.commands.focus()
  }

  blur() {
    this.editor?.commands.blur()
  }

  // Formatting commands
  toggleBold() {
    this.editor?.chain().focus().toggleBold().run()
  }

  toggleItalic() {
    this.editor?.chain().focus().toggleItalic().run()
  }

  toggleStrike() {
    this.editor?.chain().focus().toggleStrike().run()
  }

  toggleHeading(level) {
    this.editor?.chain().focus().toggleHeading({ level }).run()
  }

  toggleBulletList() {
    this.editor?.chain().focus().toggleBulletList().run()
  }

  toggleOrderedList() {
    this.editor?.chain().focus().toggleOrderedList().run()
  }

  toggleBlockquote() {
    this.editor?.chain().focus().toggleBlockquote().run()
  }

  toggleCodeBlock() {
    this.editor?.chain().focus().toggleCodeBlock().run()
  }

  setLink(url) {
    if (url) {
      this.editor?.chain().focus().setLink({ href: url }).run()
    } else {
      this.editor?.chain().focus().unsetLink().run()
    }
  }

  insertHorizontalRule() {
    this.editor?.chain().focus().setHorizontalRule().run()
  }

  // Check if format is active
  isActive(name, attributes = {}) {
    return this.editor?.isActive(name, attributes) || false
  }

  // Helper to dispatch custom events
  dispatchEvent(name, detail = {}) {
    this.element.dispatchEvent(
      new CustomEvent(`inkpen:${name}`, {
        bubbles: true,
        detail: { ...detail, controller: this }
      })
    )
  }

  dispatchChangeEvent() {
    this.dispatchEvent("change", {
      content: this.inputTarget.value
    })
  }
}
