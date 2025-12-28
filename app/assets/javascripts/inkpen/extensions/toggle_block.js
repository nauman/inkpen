import { Node, mergeAttributes } from "@tiptap/core"

/**
 * Toggle Block Extension for TipTap
 *
 * Collapsible/expandable block with a clickable header and nested content.
 * Uses native HTML5 <details> and <summary> elements.
 *
 * Features:
 * - Click arrow or summary to expand/collapse
 * - Editable summary text
 * - Nested block content
 * - Keyboard shortcuts for toggling
 * - Smooth animations
 *
 * @example
 * editor.commands.insertToggle()
 * editor.commands.toggleOpen()
 *
 * @since 0.3.3
 */

// Toggle Summary - the clickable header
export const ToggleSummary = Node.create({
  name: "toggleSummary",

  content: "inline*",
  defining: true,
  selectable: false,

  parseHTML() {
    return [{ tag: "summary" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "summary",
      mergeAttributes(HTMLAttributes, { class: "inkpen-toggle__summary" }),
      0
    ]
  },

  addKeyboardShortcuts() {
    return {
      // Enter in summary creates content below, not new summary
      Enter: ({ editor }) => {
        const { state } = editor
        const { $from } = state.selection

        // Check if we're in a toggle summary
        if ($from.parent.type.name === "toggleSummary") {
          // Find the toggle block
          const togglePos = $from.before($from.depth - 1)
          const toggleNode = state.doc.nodeAt(togglePos)

          if (toggleNode && toggleNode.type.name === "toggleBlock") {
            // Insert paragraph after summary, inside toggle content
            const summaryEnd = togglePos + 1 + $from.parent.nodeSize
            return editor.chain()
              .insertContentAt(summaryEnd, { type: "paragraph" })
              .focus(summaryEnd + 1)
              .run()
          }
        }
        return false
      },

      // Backspace at start of empty summary deletes the toggle
      Backspace: ({ editor }) => {
        const { state } = editor
        const { $from, empty } = state.selection

        if (!empty) return false

        // Check if at start of toggle summary
        if ($from.parent.type.name === "toggleSummary" && $from.parentOffset === 0) {
          // If summary is empty, delete the whole toggle block
          if ($from.parent.textContent === "") {
            const togglePos = $from.before($from.depth - 1)
            const toggleNode = state.doc.nodeAt(togglePos)

            if (toggleNode) {
              return editor.chain()
                .deleteRange({ from: togglePos, to: togglePos + toggleNode.nodeSize })
                .run()
            }
          }
        }
        return false
      }
    }
  }
})

// Toggle Block - the container with details/summary structure
export const ToggleBlock = Node.create({
  name: "toggleBlock",

  group: "block",
  content: "toggleSummary block*",
  defining: true,

  addOptions() {
    return {
      defaultOpen: true,
      HTMLAttributes: {
        class: "inkpen-toggle"
      }
    }
  },

  addAttributes() {
    return {
      open: {
        default: this.options.defaultOpen,
        parseHTML: element => element.hasAttribute("open"),
        renderHTML: attributes => (attributes.open ? { open: "open" } : {})
      }
    }
  },

  parseHTML() {
    return [
      { tag: "details.inkpen-toggle" },
      { tag: "details" }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "details",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0
    ]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      // Create details element
      const details = document.createElement("details")
      details.className = "inkpen-toggle"

      if (node.attrs.open) {
        details.setAttribute("open", "open")
      }

      // Toggle indicator (arrow)
      const indicator = document.createElement("span")
      indicator.className = "inkpen-toggle__indicator"
      indicator.setAttribute("contenteditable", "false")
      indicator.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`

      // Handle toggle via indicator click
      indicator.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (typeof getPos === "function") {
          const pos = getPos()
          if (pos !== undefined) {
            editor.chain()
              .focus()
              .command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  open: !details.hasAttribute("open")
                })
                return true
              })
              .run()
          }
        }
      })

      // Content wrapper
      const content = document.createElement("div")
      content.className = "inkpen-toggle__content"

      details.appendChild(indicator)
      details.appendChild(content)

      // Prevent native toggle behavior (we handle it ourselves)
      details.addEventListener("toggle", (e) => {
        // Sync the attribute with ProseMirror state
        if (typeof getPos === "function") {
          const pos = getPos()
          if (pos !== undefined) {
            const currentNode = editor.state.doc.nodeAt(pos)
            if (currentNode && currentNode.attrs.open !== details.open) {
              editor.chain()
                .command(({ tr }) => {
                  tr.setNodeMarkup(pos, undefined, {
                    ...currentNode.attrs,
                    open: details.open
                  })
                  return true
                })
                .run()
            }
          }
        }
      })

      return {
        dom: details,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "toggleBlock") return false

          if (updatedNode.attrs.open) {
            details.setAttribute("open", "open")
          } else {
            details.removeAttribute("open")
          }

          return true
        }
      }
    }
  },

  addCommands() {
    return {
      insertToggle: (attributes = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            open: attributes.open !== undefined ? attributes.open : this.options.defaultOpen
          },
          content: [
            {
              type: "toggleSummary",
              content: attributes.summary
                ? [{ type: "text", text: attributes.summary }]
                : []
            },
            { type: "paragraph" }
          ]
        })
      },

      setToggle: () => ({ commands, state }) => {
        const { $from } = state.selection
        const text = $from.parent.textContent

        return commands.insertContent({
          type: this.name,
          attrs: { open: true },
          content: [
            {
              type: "toggleSummary",
              content: text ? [{ type: "text", text }] : []
            },
            { type: "paragraph" }
          ]
        })
      },

      toggleOpen: () => ({ state, dispatch }) => {
        const { $from } = state.selection

        // Find the toggle block
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === "toggleBlock") {
            if (dispatch) {
              const pos = $from.before(d)
              const tr = state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                open: !node.attrs.open
              })
              dispatch(tr)
            }
            return true
          }
        }
        return false
      },

      expandToggle: () => ({ state, dispatch }) => {
        const { $from } = state.selection

        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === "toggleBlock" && !node.attrs.open) {
            if (dispatch) {
              const pos = $from.before(d)
              const tr = state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                open: true
              })
              dispatch(tr)
            }
            return true
          }
        }
        return false
      },

      collapseToggle: () => ({ state, dispatch }) => {
        const { $from } = state.selection

        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === "toggleBlock" && node.attrs.open) {
            if (dispatch) {
              const pos = $from.before(d)
              const tr = state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                open: false
              })
              dispatch(tr)
            }
            return true
          }
        }
        return false
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-t": () => this.editor.commands.insertToggle(),
      "Mod-Enter": () => this.editor.commands.toggleOpen()
    }
  }
})

export default ToggleBlock
