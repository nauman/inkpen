import { Controller } from "@hotwired/stimulus"
import { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Mention from "@tiptap/extension-mention"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"

/**
 * Inkpen Editor Controller
 *
 * Main Stimulus controller for the TipTap editor.
 * Handles initialization, content sync, and editor lifecycle.
 *
 * Supports extensions:
 * - StarterKit (bold, italic, strike, heading, lists, blockquote, code, etc.)
 * - Link
 * - Image
 * - Table (with rows, cells, headers)
 * - TaskList (checkboxes)
 * - Mention (@mentions)
 * - CodeBlockLowlight (syntax highlighting)
 */
export default class extends Controller {
  static targets = ["input", "content", "toolbar"]

  static values = {
    extensions: { type: Array, default: [] },
    extensionConfig: { type: Object, default: {} },
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
    const config = this.extensionConfigValue
    const enabledExtensions = this.extensionsValue

    // Base StarterKit - disable codeBlock if we're using CodeBlockLowlight
    const starterKitConfig = {
      heading: { levels: [1, 2, 3, 4] }
    }

    if (enabledExtensions.includes("code_block_syntax")) {
      starterKitConfig.codeBlock = false
    }

    const extensions = [
      StarterKit.configure(starterKitConfig),
      Placeholder.configure({
        placeholder: this.placeholderValue
      })
    ]

    // Link extension
    if (enabledExtensions.includes("link")) {
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

    // Image extension
    if (enabledExtensions.includes("image")) {
      extensions.push(
        Image.configure({
          inline: false,
          allowBase64: true
        })
      )
    }

    // Table extension
    if (enabledExtensions.includes("table")) {
      const tableConfig = config.table || {}
      extensions.push(
        Table.configure({
          resizable: tableConfig.resizable !== false,
          HTMLAttributes: {
            class: "inkpen-table"
          }
        }),
        TableRow,
        TableHeader,
        TableCell
      )
    }

    // TaskList extension (checkboxes)
    if (enabledExtensions.includes("task_list")) {
      const taskConfig = config.task_list || {}
      extensions.push(
        TaskList.configure({
          HTMLAttributes: {
            class: taskConfig.listClass || "inkpen-task-list"
          }
        }),
        TaskItem.configure({
          nested: taskConfig.nested !== false,
          HTMLAttributes: {
            class: taskConfig.itemClass || "inkpen-task-item"
          }
        })
      )
    }

    // Mention extension
    if (enabledExtensions.includes("mention")) {
      const mentionConfig = config.mention || {}
      extensions.push(
        Mention.configure({
          HTMLAttributes: {
            class: mentionConfig.HTMLAttributes?.class || "inkpen-mention"
          },
          suggestion: this.buildMentionSuggestion(mentionConfig)
        })
      )
    }

    // CodeBlockLowlight (syntax highlighting)
    if (enabledExtensions.includes("code_block_syntax")) {
      const codeConfig = config.code_block_syntax || {}
      const lowlight = createLowlight(common)

      extensions.push(
        CodeBlockLowlight.configure({
          lowlight,
          defaultLanguage: codeConfig.defaultLanguage || null,
          HTMLAttributes: {
            class: "inkpen-code-block"
          }
        })
      )
    }

    return extensions
  }

  /**
   * Build mention suggestion configuration
   * Handles both static items and async search
   */
  buildMentionSuggestion(config) {
    const items = config.items || []
    const searchUrl = config.searchUrl

    return {
      char: config.trigger || "@",
      items: async ({ query }) => {
        // If search URL provided, fetch from server
        if (searchUrl) {
          try {
            const response = await fetch(`${searchUrl}?query=${encodeURIComponent(query)}`)
            if (response.ok) {
              return await response.json()
            }
          } catch (error) {
            console.error("Mention search failed:", error)
          }
          return []
        }

        // Otherwise filter static items
        return items
          .filter(item =>
            item.label.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
      },
      render: () => {
        let component
        let popup

        return {
          onStart: props => {
            component = this.createMentionPopup(props, config)
            popup = component.element
            document.body.appendChild(popup)
            this.updateMentionPopupPosition(popup, props.clientRect)
          },
          onUpdate: props => {
            this.updateMentionItems(component, props.items, props.command)
            this.updateMentionPopupPosition(popup, props.clientRect)
          },
          onKeyDown: props => {
            if (props.event.key === "Escape") {
              popup?.remove()
              return true
            }
            return component?.onKeyDown?.(props.event) || false
          },
          onExit: () => {
            popup?.remove()
          }
        }
      }
    }
  }

  createMentionPopup(props, config) {
    const popup = document.createElement("div")
    popup.className = config.suggestionClass || "inkpen-mention-suggestions"
    popup.setAttribute("role", "listbox")

    const component = {
      element: popup,
      selectedIndex: 0,
      items: props.items,
      command: props.command,
      onKeyDown: (event) => {
        if (event.key === "ArrowUp") {
          component.selectedIndex = Math.max(0, component.selectedIndex - 1)
          this.updateMentionSelection(popup, component.selectedIndex)
          return true
        }
        if (event.key === "ArrowDown") {
          component.selectedIndex = Math.min(component.items.length - 1, component.selectedIndex + 1)
          this.updateMentionSelection(popup, component.selectedIndex)
          return true
        }
        if (event.key === "Enter") {
          const item = component.items[component.selectedIndex]
          if (item) {
            component.command(item)
          }
          return true
        }
        return false
      }
    }

    this.updateMentionItems(component, props.items, props.command)
    return component
  }

  updateMentionItems(component, items, command) {
    component.items = items
    component.command = command
    component.selectedIndex = 0

    const popup = component.element
    popup.innerHTML = ""

    if (items.length === 0) {
      popup.innerHTML = '<div class="inkpen-mention-empty">No results</div>'
      return
    }

    items.forEach((item, index) => {
      const button = document.createElement("button")
      button.className = `inkpen-mention-item ${index === 0 ? "is-selected" : ""}`
      button.setAttribute("role", "option")
      button.textContent = item.label
      button.addEventListener("click", () => command(item))
      popup.appendChild(button)
    })
  }

  updateMentionSelection(popup, selectedIndex) {
    const items = popup.querySelectorAll(".inkpen-mention-item")
    items.forEach((item, index) => {
      item.classList.toggle("is-selected", index === selectedIndex)
    })
  }

  updateMentionPopupPosition(popup, clientRect) {
    if (!clientRect) return

    const rect = clientRect()
    if (!rect) return

    popup.style.position = "fixed"
    popup.style.left = `${rect.left}px`
    popup.style.top = `${rect.bottom + 8}px`
    popup.style.zIndex = "9999"
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

  // Table commands
  insertTable(rows = 3, cols = 3, withHeaderRow = true) {
    this.editor?.chain().focus().insertTable({ rows, cols, withHeaderRow }).run()
  }

  addTableRowBefore() {
    this.editor?.chain().focus().addRowBefore().run()
  }

  addTableRowAfter() {
    this.editor?.chain().focus().addRowAfter().run()
  }

  deleteTableRow() {
    this.editor?.chain().focus().deleteRow().run()
  }

  addTableColumnBefore() {
    this.editor?.chain().focus().addColumnBefore().run()
  }

  addTableColumnAfter() {
    this.editor?.chain().focus().addColumnAfter().run()
  }

  deleteTableColumn() {
    this.editor?.chain().focus().deleteColumn().run()
  }

  deleteTable() {
    this.editor?.chain().focus().deleteTable().run()
  }

  mergeCells() {
    this.editor?.chain().focus().mergeCells().run()
  }

  splitCell() {
    this.editor?.chain().focus().splitCell().run()
  }

  // TaskList commands
  toggleTaskList() {
    this.editor?.chain().focus().toggleTaskList().run()
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
