import { Node, mergeAttributes } from "@tiptap/core"

/**
 * Section Title Extension for TipTap
 *
 * Semantic H2 heading for document sections. Integrates with Table of Contents
 * and provides the title/header for DocumentSection nodes.
 *
 * Features:
 * - Renders as semantic H2 element
 * - Auto-generates ID for deep linking
 * - Integrates with TOC extension
 * - Enter key creates paragraph below (not new title)
 * - Backspace at start of empty title deletes parent section
 *
 * @example
 * // Used within DocumentSection, not standalone
 * { type: "documentSection", content: [{ type: "sectionTitle" }, ...blocks] }
 *
 * @since 0.8.0
 */
export const SectionTitle = Node.create({
  name: "sectionTitle",

  content: "inline*",
  defining: true,
  selectable: false,

  // Options

  addOptions() {
    return {
      HTMLAttributes: {
        class: "inkpen-doc-section__title"
      }
    }
  },

  // Attributes

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute("id"),
        renderHTML: attributes => (attributes.id ? { id: attributes.id } : {})
      }
    }
  },

  // Parse & Render

  parseHTML() {
    return [
      { tag: 'h2[data-type="section-title"]' },
      { tag: "h2.inkpen-doc-section__title" }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "h2",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "section-title"
      }),
      0
    ]
  },

  // Keyboard Shortcuts

  addKeyboardShortcuts() {
    return {
      // Enter in title creates content below, not new title
      Enter: ({ editor }) => {
        const { state } = editor
        const { $from } = state.selection

        if ($from.parent.type.name !== "sectionTitle") {
          return false
        }

        // Find the documentSection parent
        const sectionPos = $from.before($from.depth - 1)
        const sectionNode = state.doc.nodeAt(sectionPos)

        if (sectionNode && sectionNode.type.name === "documentSection") {
          // Insert paragraph after title, inside section content
          const titleEnd = sectionPos + 1 + $from.parent.nodeSize
          return editor.chain()
            .insertContentAt(titleEnd, { type: "paragraph" })
            .focus(titleEnd + 1)
            .run()
        }

        return false
      },

      // Backspace at start of empty title deletes parent section
      Backspace: ({ editor }) => {
        const { state } = editor
        const { $from, empty } = state.selection

        if (!empty) return false

        if ($from.parent.type.name === "sectionTitle" && $from.parentOffset === 0) {
          // If title is empty, delete the whole document section
          if ($from.parent.textContent === "") {
            const sectionPos = $from.before($from.depth - 1)
            const sectionNode = state.doc.nodeAt(sectionPos)

            if (sectionNode && sectionNode.type.name === "documentSection") {
              return editor.chain()
                .deleteRange({ from: sectionPos, to: sectionPos + sectionNode.nodeSize })
                .run()
            }
          }
        }

        return false
      }
    }
  }
})

export default SectionTitle
