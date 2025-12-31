import { Node, mergeAttributes } from "@tiptap/core"
import { SectionTitle } from "inkpen/extensions/section_title"

/**
 * Document Section Extension for TipTap
 *
 * True content-grouping container with semantic H2 title and collapsible
 * content. Unlike the layout Section extension (width/spacing), DocumentSection
 * groups related blocks under a heading for document structure.
 *
 * Features:
 * - Semantic H2 title (integrates with Table of Contents)
 * - Collapsible content with left-gutter toggle
 * - Nesting support (sections within sections, up to 3 levels)
 * - Draggable as a group
 * - Auto-generated IDs for deep linking
 *
 * @example
 * editor.commands.insertDocumentSection()
 * editor.commands.insertDocumentSection({ title: "My Section" })
 * editor.commands.toggleSectionCollapsed()
 *
 * @since 0.8.0
 */

// SVG icons for collapse toggle
const ICON_EXPANDED = `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
  <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const ICON_COLLAPSED = `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

export const DocumentSection = Node.create({
  name: "documentSection",

  group: "block",
  content: "sectionTitle block*",
  defining: true,
  isolating: true,
  draggable: true,

  // Options

  addOptions() {
    return {
      maxDepth: 3,
      showControls: true,
      defaultCollapsed: false,
      allowNesting: true,
      HTMLAttributes: {
        class: "inkpen-doc-section"
      }
    }
  },

  // Attributes

  addAttributes() {
    return {
      collapsed: {
        default: this.options.defaultCollapsed,
        parseHTML: element => element.getAttribute("data-collapsed") === "true",
        renderHTML: attributes => ({
          "data-collapsed": attributes.collapsed ? "true" : "false"
        })
      },
      id: {
        default: null,
        parseHTML: element => element.getAttribute("id"),
        renderHTML: attributes => {
          if (!attributes.id) return {}
          return { id: attributes.id }
        }
      },
      depth: {
        default: 1,
        parseHTML: element => parseInt(element.getAttribute("data-depth") || "1", 10),
        renderHTML: attributes => ({ "data-depth": attributes.depth })
      }
    }
  },

  // Parse & Render

  parseHTML() {
    return [
      { tag: 'div[data-type="document-section"]' },
      { tag: "div.inkpen-doc-section" }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "document-section"
      }),
      0
    ]
  },

  // NodeView (interactive controls)

  addNodeView() {
    return ({ node, getPos, editor }) => {
      // Create container
      const dom = document.createElement("div")
      dom.className = "inkpen-doc-section"
      dom.setAttribute("data-type", "document-section")
      dom.setAttribute("data-collapsed", node.attrs.collapsed ? "true" : "false")
      dom.setAttribute("data-depth", node.attrs.depth)

      if (node.attrs.id) {
        dom.setAttribute("id", node.attrs.id)
      }

      // Left gutter with collapse toggle (only in edit mode with controls)
      let gutter = null
      if (this.options.showControls && editor.isEditable) {
        gutter = document.createElement("div")
        gutter.className = "inkpen-doc-section__gutter"
        gutter.contentEditable = "false"

        const toggle = document.createElement("button")
        toggle.type = "button"
        toggle.className = "inkpen-doc-section__toggle"
        toggle.title = node.attrs.collapsed ? "Expand section" : "Collapse section"
        toggle.innerHTML = node.attrs.collapsed ? ICON_COLLAPSED : ICON_EXPANDED

        toggle.addEventListener("click", (e) => {
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
                    collapsed: !node.attrs.collapsed
                  })
                  return true
                })
                .run()
            }
          }
        })

        gutter.appendChild(toggle)
        dom.appendChild(gutter)
      }

      // Content container
      const content = document.createElement("div")
      content.className = "inkpen-doc-section__content"
      dom.appendChild(content)

      return {
        dom,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "documentSection") return false

          // Update collapsed state
          dom.setAttribute("data-collapsed", updatedNode.attrs.collapsed ? "true" : "false")
          dom.setAttribute("data-depth", updatedNode.attrs.depth)

          if (updatedNode.attrs.id) {
            dom.setAttribute("id", updatedNode.attrs.id)
          } else {
            dom.removeAttribute("id")
          }

          // Update toggle button
          if (gutter) {
            const toggle = gutter.querySelector(".inkpen-doc-section__toggle")
            if (toggle) {
              toggle.innerHTML = updatedNode.attrs.collapsed ? ICON_COLLAPSED : ICON_EXPANDED
              toggle.title = updatedNode.attrs.collapsed ? "Expand section" : "Collapse section"
            }
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
      insertDocumentSection: (attributes = {}) => ({ commands, state }) => {
        // Generate unique ID for deep linking
        const id = attributes.id || `section-${Date.now()}`

        // Calculate depth based on cursor position
        let depth = 1
        if (this.options.allowNesting) {
          const { $from } = state.selection
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === "documentSection") {
              const parentDepth = $from.node(d).attrs.depth || 1
              depth = Math.min(parentDepth + 1, this.options.maxDepth)
              break
            }
          }
        }

        return commands.insertContent({
          type: this.name,
          attrs: {
            collapsed: attributes.collapsed ?? this.options.defaultCollapsed,
            id,
            depth
          },
          content: [
            {
              type: "sectionTitle",
              attrs: { id: `${id}-title` },
              content: attributes.title
                ? [{ type: "text", text: attributes.title }]
                : []
            },
            { type: "paragraph" }
          ]
        })
      },

      setDocumentSection: () => ({ commands, state }) => {
        const { $from } = state.selection
        const text = $from.parent.textContent
        const id = `section-${Date.now()}`

        return commands.insertContent({
          type: this.name,
          attrs: {
            collapsed: false,
            id,
            depth: 1
          },
          content: [
            {
              type: "sectionTitle",
              attrs: { id: `${id}-title` },
              content: text ? [{ type: "text", text }] : []
            },
            { type: "paragraph" }
          ]
        })
      },

      toggleSectionCollapsed: () => ({ state, dispatch }) => {
        const { $from } = state.selection

        // Find the document section
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === "documentSection") {
            if (dispatch) {
              const pos = $from.before(d)
              const tr = state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                collapsed: !node.attrs.collapsed
              })
              dispatch(tr)
            }
            return true
          }
        }
        return false
      },

      expandSection: () => ({ state, dispatch }) => {
        const { $from } = state.selection

        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === "documentSection" && node.attrs.collapsed) {
            if (dispatch) {
              const pos = $from.before(d)
              const tr = state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                collapsed: false
              })
              dispatch(tr)
            }
            return true
          }
        }
        return false
      },

      collapseSection: () => ({ state, dispatch }) => {
        const { $from } = state.selection

        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === "documentSection" && !node.attrs.collapsed) {
            if (dispatch) {
              const pos = $from.before(d)
              const tr = state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                collapsed: true
              })
              dispatch(tr)
            }
            return true
          }
        }
        return false
      },

      wrapInDocumentSection: (attributes = {}) => ({ commands }) => {
        const id = attributes.id || `section-${Date.now()}`
        return commands.wrapIn(this.name, {
          ...attributes,
          id,
          depth: 1
        })
      },

      unwrapDocumentSection: () => ({ commands }) => {
        return commands.lift(this.name)
      }
    }
  },

  // Keyboard Shortcuts

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-Enter": () => this.editor.commands.insertDocumentSection(),
      "Mod-.": () => this.editor.commands.toggleSectionCollapsed()
    }
  },

  // Extensions to include

  addExtensions() {
    return [SectionTitle]
  }
})

export default DocumentSection
