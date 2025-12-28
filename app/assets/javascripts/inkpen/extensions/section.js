import { Node, mergeAttributes } from "@tiptap/core"

/**
 * Section Extension for TipTap
 *
 * Block-level container that controls content width and spacing.
 * Renders with an interactive NodeView for editing controls.
 *
 * Follows Fizzy patterns:
 * - Section comments for organization
 * - Clean command API
 * - Event-driven updates
 *
 * @example
 * editor.commands.insertSection({ width: 'wide', spacing: 'spacious' })
 * editor.commands.setSectionWidth('narrow')
 *
 * @since 0.3.0
 */
export const Section = Node.create({
  name: "section",

  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  // Options

  addOptions() {
    return {
      defaultWidth: "default",
      defaultSpacing: "normal",
      showControls: true,
      widthPresets: {
        narrow: { maxWidth: "560px", label: "Narrow" },
        default: { maxWidth: "680px", label: "Default" },
        wide: { maxWidth: "900px", label: "Wide" },
        full: { maxWidth: "100%", label: "Full" }
      },
      spacingPresets: {
        compact: { padding: "1rem 0", label: "Compact" },
        normal: { padding: "2rem 0", label: "Normal" },
        spacious: { padding: "4rem 0", label: "Spacious" }
      },
      HTMLAttributes: {
        class: "inkpen-section"
      }
    }
  },

  // Attributes

  addAttributes() {
    return {
      width: {
        default: this.options.defaultWidth,
        parseHTML: element => element.getAttribute("data-width") || this.options.defaultWidth,
        renderHTML: attributes => ({ "data-width": attributes.width })
      },
      spacing: {
        default: this.options.defaultSpacing,
        parseHTML: element => element.getAttribute("data-spacing") || this.options.defaultSpacing,
        renderHTML: attributes => ({ "data-spacing": attributes.spacing })
      }
    }
  },

  // Parse & Render

  parseHTML() {
    return [
      { tag: "section[data-type='section']" },
      { tag: "div.inkpen-section" }
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "section",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "section"
      }),
      0  // Content placeholder
    ]
  },

  // NodeView (interactive controls)

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("section")
      dom.className = "inkpen-section"
      dom.setAttribute("data-type", "section")
      dom.setAttribute("data-width", node.attrs.width)
      dom.setAttribute("data-spacing", node.attrs.spacing)

      // Controls container (only in edit mode)
      let controls = null
      if (this.options.showControls && editor.isEditable) {
        controls = this.createControls(node.attrs, (attr, value) => {
          if (typeof getPos === "function") {
            editor.chain()
              .focus()
              .command(({ tr }) => {
                const pos = getPos()
                if (pos !== undefined) {
                  tr.setNodeMarkup(pos, undefined, { ...node.attrs, [attr]: value })
                }
                return true
              })
              .run()
          }
        })
        dom.appendChild(controls)
      }

      // Content container
      const content = document.createElement("div")
      content.className = "inkpen-section__content"
      dom.appendChild(content)

      return {
        dom,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) return false

          dom.setAttribute("data-width", updatedNode.attrs.width)
          dom.setAttribute("data-spacing", updatedNode.attrs.spacing)

          // Update control button states
          if (controls) {
            this.updateControlStates(controls, updatedNode.attrs)
          }

          return true
        },
        destroy: () => {
          // Cleanup if needed
        }
      }
    }
  },

  // Commands

  addCommands() {
    return {
      insertSection: (attributes = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            width: attributes.width || this.options.defaultWidth,
            spacing: attributes.spacing || this.options.defaultSpacing
          },
          content: [{ type: "paragraph" }]
        })
      },

      setSectionWidth: (width) => ({ commands }) => {
        return commands.updateAttributes(this.name, { width })
      },

      setSectionSpacing: (spacing) => ({ commands }) => {
        return commands.updateAttributes(this.name, { spacing })
      },

      wrapInSection: (attributes = {}) => ({ commands }) => {
        return commands.wrapIn(this.name, attributes)
      },

      unwrapSection: () => ({ commands }) => {
        return commands.lift(this.name)
      }
    }
  },

  // Keyboard Shortcuts

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-s": () => this.editor.commands.insertSection()
    }
  },

  // Private Helpers

  createControls(attrs, onChange) {
    const controls = document.createElement("div")
    controls.className = "inkpen-section-controls"
    controls.contentEditable = "false"

    // Width buttons
    const widthGroup = document.createElement("div")
    widthGroup.className = "inkpen-section-controls__group"

    const widthLabel = document.createElement("span")
    widthLabel.className = "inkpen-section-controls__label"
    widthLabel.textContent = "Width"
    widthGroup.appendChild(widthLabel)

    Object.entries(this.options.widthPresets).forEach(([key, preset]) => {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "inkpen-section-controls__btn"
      btn.dataset.width = key
      btn.textContent = preset.label
      btn.title = `Set width to ${preset.label}`

      if (attrs.width === key) {
        btn.classList.add("is-active")
      }

      btn.addEventListener("mousedown", (e) => e.preventDefault())
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        onChange("width", key)
      })

      widthGroup.appendChild(btn)
    })

    controls.appendChild(widthGroup)

    // Divider
    const divider = document.createElement("span")
    divider.className = "inkpen-section-controls__divider"
    controls.appendChild(divider)

    // Spacing buttons
    const spacingGroup = document.createElement("div")
    spacingGroup.className = "inkpen-section-controls__group"

    const spacingLabel = document.createElement("span")
    spacingLabel.className = "inkpen-section-controls__label"
    spacingLabel.textContent = "Spacing"
    spacingGroup.appendChild(spacingLabel)

    Object.entries(this.options.spacingPresets).forEach(([key, preset]) => {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "inkpen-section-controls__btn"
      btn.dataset.spacing = key
      btn.textContent = preset.label
      btn.title = `Set spacing to ${preset.label}`

      if (attrs.spacing === key) {
        btn.classList.add("is-active")
      }

      btn.addEventListener("mousedown", (e) => e.preventDefault())
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        onChange("spacing", key)
      })

      spacingGroup.appendChild(btn)
    })

    controls.appendChild(spacingGroup)

    return controls
  },

  updateControlStates(controls, attrs) {
    // Update width buttons
    controls.querySelectorAll("[data-width]").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.width === attrs.width)
    })

    // Update spacing buttons
    controls.querySelectorAll("[data-spacing]").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.spacing === attrs.spacing)
    })
  }
})

export default Section
