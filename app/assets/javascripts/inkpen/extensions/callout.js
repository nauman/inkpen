import { Node, mergeAttributes } from "@tiptap/core"

/**
 * Callout Extension for TipTap
 *
 * Highlighted blocks for tips, warnings, notes, and other callouts.
 * Similar to Notion callouts or GitHub admonitions.
 *
 * Features:
 * - Multiple types: info, warning, tip, note, success, error
 * - Default emojis per type (customizable)
 * - Interactive type selector
 * - Custom emoji support
 * - Colored backgrounds and borders
 *
 * @example
 * editor.commands.insertCallout({ type: 'warning' })
 * editor.commands.setCalloutType('success')
 *
 * @since 0.3.3
 */

// Default emoji icons for each callout type
const DEFAULT_EMOJIS = {
  info: "ℹ️",
  warning: "⚠️",
  tip: "💡",
  note: "📝",
  success: "✅",
  error: "❌"
}

// Callout type labels
const TYPE_LABELS = {
  info: "Info",
  warning: "Warning",
  tip: "Tip",
  note: "Note",
  success: "Success",
  error: "Error"
}

export const Callout = Node.create({
  name: "callout",

  group: "block",
  content: "block+",
  defining: true,

  addOptions() {
    return {
      defaultType: "info",
      types: ["info", "warning", "tip", "note", "success", "error"],
      emojis: DEFAULT_EMOJIS,
      labels: TYPE_LABELS,
      showControls: true,
      HTMLAttributes: {
        class: "inkpen-callout"
      }
    }
  },

  addAttributes() {
    return {
      type: {
        default: this.options.defaultType,
        parseHTML: element => element.getAttribute("data-type") || this.options.defaultType,
        renderHTML: attributes => ({ "data-type": attributes.type })
      },
      emoji: {
        default: null,
        parseHTML: element => element.getAttribute("data-emoji"),
        renderHTML: attributes => attributes.emoji ? { "data-emoji": attributes.emoji } : {}
      }
    }
  },

  parseHTML() {
    return [
      { tag: "div.inkpen-callout" },
      { tag: "div[data-callout]" },
      { tag: "aside.inkpen-callout" }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes["data-type"] || this.options.defaultType

    return [
      "aside",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-callout": type,
        class: `inkpen-callout inkpen-callout--${type}`
      }),
      0
    ]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const type = node.attrs.type || this.options.defaultType
      const emoji = node.attrs.emoji || this.options.emojis[type] || DEFAULT_EMOJIS.info

      // Main container
      const dom = document.createElement("aside")
      dom.className = `inkpen-callout inkpen-callout--${type}`
      dom.setAttribute("data-callout", type)
      dom.setAttribute("data-type", type)

      // Icon container
      const iconWrapper = document.createElement("div")
      iconWrapper.className = "inkpen-callout__icon"
      iconWrapper.contentEditable = "false"

      const iconSpan = document.createElement("span")
      iconSpan.className = "inkpen-callout__emoji"
      iconSpan.textContent = emoji
      iconWrapper.appendChild(iconSpan)

      // Type selector (shows on icon click)
      if (this.options.showControls && editor.isEditable) {
        iconWrapper.style.cursor = "pointer"
        iconWrapper.title = "Click to change callout type"

        iconWrapper.addEventListener("click", (e) => {
          e.preventDefault()
          e.stopPropagation()
          this.showTypeSelector(iconWrapper, node, getPos, editor)
        })
      }

      dom.appendChild(iconWrapper)

      // Content container
      const content = document.createElement("div")
      content.className = "inkpen-callout__content"
      dom.appendChild(content)

      return {
        dom,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "callout") return false

          const newType = updatedNode.attrs.type || this.options.defaultType
          const newEmoji = updatedNode.attrs.emoji || this.options.emojis[newType] || DEFAULT_EMOJIS.info

          // Update classes
          dom.className = `inkpen-callout inkpen-callout--${newType}`
          dom.setAttribute("data-callout", newType)
          dom.setAttribute("data-type", newType)

          // Update emoji
          iconSpan.textContent = newEmoji

          return true
        }
      }
    }
  },

  addCommands() {
    return {
      insertCallout: (attributes = {}) => ({ commands }) => {
        const type = attributes.type || this.options.defaultType

        return commands.insertContent({
          type: this.name,
          attrs: {
            type,
            emoji: attributes.emoji || null
          },
          content: [{ type: "paragraph" }]
        })
      },

      setCallout: (attributes = {}) => ({ commands }) => {
        return commands.wrapIn(this.name, attributes)
      },

      setCalloutType: (type) => ({ commands }) => {
        return commands.updateAttributes(this.name, { type, emoji: null })
      },

      setCalloutEmoji: (emoji) => ({ commands }) => {
        return commands.updateAttributes(this.name, { emoji })
      },

      toggleCallout: (type = "info") => ({ commands, state }) => {
        const { $from } = state.selection

        // Check if already in a callout
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === "callout") {
            return commands.lift(this.name)
          }
        }

        return commands.wrapIn(this.name, { type })
      },

      removeCallout: () => ({ commands }) => {
        return commands.lift(this.name)
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-o": () => this.editor.commands.insertCallout({ type: "info" })
    }
  },

  // Private helpers

  showTypeSelector(iconWrapper, node, getPos, editor) {
    // Remove any existing selector
    const existing = document.querySelector(".inkpen-callout-selector")
    if (existing) {
      existing.remove()
      return
    }

    // Create selector dropdown
    const selector = document.createElement("div")
    selector.className = "inkpen-callout-selector"

    this.options.types.forEach(type => {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "inkpen-callout-selector__item"
      if (node.attrs.type === type) {
        btn.classList.add("is-active")
      }

      const emoji = document.createElement("span")
      emoji.className = "inkpen-callout-selector__emoji"
      emoji.textContent = this.options.emojis[type] || DEFAULT_EMOJIS[type]

      const label = document.createElement("span")
      label.className = "inkpen-callout-selector__label"
      label.textContent = this.options.labels[type] || type

      btn.appendChild(emoji)
      btn.appendChild(label)

      btn.addEventListener("mousedown", (e) => e.preventDefault())
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (typeof getPos === "function") {
          const pos = getPos()
          if (pos !== undefined) {
            editor.chain()
              .focus()
              .command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, type, emoji: null })
                return true
              })
              .run()
          }
        }

        selector.remove()
      })

      selector.appendChild(btn)
    })

    // Position the selector
    const rect = iconWrapper.getBoundingClientRect()
    selector.style.position = "fixed"
    selector.style.left = `${rect.left}px`
    selector.style.top = `${rect.bottom + 4}px`
    selector.style.zIndex = "10000"

    document.body.appendChild(selector)

    // Close on outside click
    const closeHandler = (e) => {
      if (!selector.contains(e.target) && !iconWrapper.contains(e.target)) {
        selector.remove()
        document.removeEventListener("mousedown", closeHandler)
      }
    }

    setTimeout(() => {
      document.addEventListener("mousedown", closeHandler)
    }, 0)

    // Close on escape
    const escHandler = (e) => {
      if (e.key === "Escape") {
        selector.remove()
        document.removeEventListener("keydown", escHandler)
      }
    }
    document.addEventListener("keydown", escHandler)
  }
})

export default Callout
