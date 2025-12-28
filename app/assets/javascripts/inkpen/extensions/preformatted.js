import { Node, mergeAttributes } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

/**
 * Preformatted Text Extension for TipTap
 *
 * Plain text block that preserves whitespace exactly as typed.
 * No syntax highlighting - perfect for ASCII art, tables, and diagrams.
 *
 * Features:
 * - Strict monospace font
 * - Preserves all whitespace (spaces, tabs, newlines)
 * - No text wrapping by default
 * - Optional line numbers
 * - Tab key inserts actual tab character
 *
 * @example
 * editor.commands.insertPreformatted()
 * editor.commands.togglePreformatted()
 *
 * @since 0.3.0
 */
export const Preformatted = Node.create({
  name: "preformatted",

  group: "block",
  content: "text*",
  marks: "",  // No marks allowed (bold, italic, etc.)
  code: true, // Tells ProseMirror to preserve whitespace
  defining: true,

  // Options

  addOptions() {
    return {
      showLineNumbers: false,
      wrapLines: false,
      tabSize: 4,
      showLabel: true,
      labelText: "Plain Text",
      HTMLAttributes: {
        class: "inkpen-preformatted"
      }
    }
  },

  // Attributes

  addAttributes() {
    return {
      label: {
        default: this.options.labelText,
        parseHTML: element => element.getAttribute("data-label") || this.options.labelText,
        renderHTML: attributes => ({ "data-label": attributes.label })
      }
    }
  },

  // Parse & Render

  parseHTML() {
    return [
      { tag: "pre[data-type='preformatted']" },
      { tag: "pre.inkpen-preformatted" },
      // Also capture plain <pre> without code highlighting
      {
        tag: "pre",
        priority: 40, // Lower priority than CodeBlock
        getAttrs: node => {
          // Only match if it doesn't have a language class (not a code block)
          const hasLanguage = node.querySelector("code[class*='language-']") ||
                              node.classList.contains("hljs") ||
                              node.hasAttribute("data-language")
          return hasLanguage ? false : null
        }
      }
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      "data-type": "preformatted",
      "data-wrap": this.options.wrapLines ? "true" : "false",
      style: `tab-size: ${this.options.tabSize}; -moz-tab-size: ${this.options.tabSize};`
    })

    return ["pre", attrs, 0]
  },

  // NodeView for label display

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement("div")
      dom.className = "inkpen-preformatted-wrapper"

      // Label badge
      if (this.options.showLabel) {
        const label = document.createElement("span")
        label.className = "inkpen-preformatted__label"
        label.textContent = node.attrs.label || this.options.labelText
        label.contentEditable = "false"
        dom.appendChild(label)
      }

      // The actual pre element
      const pre = document.createElement("pre")
      pre.className = "inkpen-preformatted"
      pre.setAttribute("data-type", "preformatted")
      pre.setAttribute("data-wrap", this.options.wrapLines ? "true" : "false")
      pre.style.tabSize = this.options.tabSize
      pre.style.MozTabSize = this.options.tabSize
      dom.appendChild(pre)

      return {
        dom,
        contentDOM: pre,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) return false
          return true
        }
      }
    }
  },

  // Commands

  addCommands() {
    return {
      setPreformatted: (attributes = {}) => ({ commands }) => {
        return commands.setNode(this.name, attributes)
      },

      togglePreformatted: (attributes = {}) => ({ commands }) => {
        return commands.toggleNode(this.name, "paragraph", attributes)
      },

      insertPreformatted: (content = "") => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          content: content ? [{ type: "text", text: content }] : []
        })
      }
    }
  },

  // Keyboard Shortcuts

  addKeyboardShortcuts() {
    return {
      // Cmd+Shift+P to toggle preformatted
      "Mod-Shift-p": () => this.editor.commands.togglePreformatted(),

      // Tab inserts a real tab character (not focus change)
      Tab: ({ editor }) => {
        if (!editor.isActive(this.name)) return false

        return editor.commands.insertContent("\t")
      },

      // Shift+Tab removes a tab if at start of line
      "Shift-Tab": ({ editor }) => {
        if (!editor.isActive(this.name)) return false

        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // Get text before cursor on current line
        const lineStart = $from.start()
        const textBefore = state.doc.textBetween(lineStart, $from.pos)

        // If line starts with tab, remove it
        if (textBefore.startsWith("\t")) {
          return editor.commands.command(({ tr }) => {
            tr.delete(lineStart, lineStart + 1)
            return true
          })
        }

        return false
      },

      // Enter creates a new line (not a new block)
      Enter: ({ editor }) => {
        if (!editor.isActive(this.name)) return false

        return editor.commands.insertContent("\n")
      },

      // Backspace at start exits the block
      Backspace: ({ editor }) => {
        if (!editor.isActive(this.name)) return false

        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // If at the very start of the preformatted block and it's empty
        if ($from.parentOffset === 0 && $from.parent.textContent === "") {
          return editor.commands.togglePreformatted()
        }

        return false
      }
    }
  },

  // Input Rules (convert ``` to preformatted if no language specified)

  addInputRules() {
    return []  // Let CodeBlock handle ``` - we use Cmd+Shift+P
  },

  // Plugins

  addProseMirrorPlugins() {
    return [
      // Plugin to handle paste - preserve whitespace
      new Plugin({
        key: new PluginKey("preformattedPaste"),
        props: {
          handlePaste: (view, event) => {
            if (!this.editor.isActive(this.name)) return false

            const text = event.clipboardData?.getData("text/plain")
            if (!text) return false

            // Insert plain text, preserving whitespace
            this.editor.commands.insertContent(text)
            return true
          }
        }
      })
    ]
  }
})

export default Preformatted
