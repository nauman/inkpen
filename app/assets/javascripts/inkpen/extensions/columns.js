import { Node, mergeAttributes } from "@tiptap/core"

/**
 * Columns Extension for TipTap
 *
 * Multi-column layout blocks for side-by-side content.
 * Supports 2-4 columns with various layout presets.
 *
 * Features:
 * - 2, 3, or 4 column layouts
 * - Layout presets (equal, 1:2, 2:1, 1:2:1, etc.)
 * - Add/remove columns via controls
 * - Responsive stacking on mobile
 * - Drag to reorder columns (future)
 *
 * @example
 * editor.commands.insertColumns({ count: 2 })
 * editor.commands.setColumnLayout('1:2')
 *
 * @since 0.3.3
 */

// Layout presets define column width ratios
const LAYOUT_PRESETS = {
  // 2 columns
  "equal-2": { columns: 2, widths: ["1fr", "1fr"], label: "Equal" },
  "1:2": { columns: 2, widths: ["1fr", "2fr"], label: "1:2" },
  "2:1": { columns: 2, widths: ["2fr", "1fr"], label: "2:1" },
  "1:3": { columns: 2, widths: ["1fr", "3fr"], label: "1:3" },
  "3:1": { columns: 2, widths: ["3fr", "1fr"], label: "3:1" },

  // 3 columns
  "equal-3": { columns: 3, widths: ["1fr", "1fr", "1fr"], label: "Equal" },
  "1:2:1": { columns: 3, widths: ["1fr", "2fr", "1fr"], label: "1:2:1" },
  "2:1:1": { columns: 3, widths: ["2fr", "1fr", "1fr"], label: "2:1:1" },
  "1:1:2": { columns: 3, widths: ["1fr", "1fr", "2fr"], label: "1:1:2" },

  // 4 columns
  "equal-4": { columns: 4, widths: ["1fr", "1fr", "1fr", "1fr"], label: "Equal" }
}

// Column node - individual column container
export const Column = Node.create({
  name: "column",

  content: "block+",
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: "div.inkpen-column" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: "inkpen-column" }),
      0
    ]
  }
})

// Columns node - container for multiple columns
export const Columns = Node.create({
  name: "columns",

  group: "block",
  content: "column{2,4}",
  defining: true,
  isolating: true,

  addOptions() {
    return {
      defaultCount: 2,
      defaultLayout: "equal-2",
      showControls: true,
      layouts: LAYOUT_PRESETS,
      HTMLAttributes: {
        class: "inkpen-columns"
      }
    }
  },

  addAttributes() {
    return {
      layout: {
        default: this.options.defaultLayout,
        parseHTML: element => element.getAttribute("data-layout") || this.options.defaultLayout,
        renderHTML: attributes => ({ "data-layout": attributes.layout })
      }
    }
  },

  parseHTML() {
    return [
      { tag: "div.inkpen-columns" },
      { tag: "div[data-type='columns']" }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const layout = this.options.layouts[HTMLAttributes["data-layout"]] || this.options.layouts["equal-2"]
    const gridTemplate = layout.widths.join(" ")

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "columns",
        style: `--inkpen-columns-template: ${gridTemplate}`
      }),
      0
    ]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div")
      dom.className = "inkpen-columns"
      dom.setAttribute("data-type", "columns")
      dom.setAttribute("data-layout", node.attrs.layout)

      // Set grid template from layout
      const layout = this.options.layouts[node.attrs.layout] || this.options.layouts["equal-2"]
      dom.style.setProperty("--inkpen-columns-template", layout.widths.join(" "))

      // Controls (only in edit mode)
      let controls = null
      if (this.options.showControls && editor.isEditable) {
        controls = this.createControls(node, getPos, editor)
        dom.appendChild(controls)
      }

      // Content container
      const content = document.createElement("div")
      content.className = "inkpen-columns__content"
      dom.appendChild(content)

      return {
        dom,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "columns") return false

          dom.setAttribute("data-layout", updatedNode.attrs.layout)

          const newLayout = this.options.layouts[updatedNode.attrs.layout] || this.options.layouts["equal-2"]
          dom.style.setProperty("--inkpen-columns-template", newLayout.widths.join(" "))

          // Update controls
          if (controls) {
            this.updateControls(controls, updatedNode, getPos, editor)
          }

          return true
        }
      }
    }
  },

  addCommands() {
    return {
      insertColumns: (attributes = {}) => ({ commands }) => {
        const count = attributes.count || this.options.defaultCount
        const layout = attributes.layout || `equal-${count}`

        const columns = Array.from({ length: count }, () => ({
          type: "column",
          content: [{ type: "paragraph" }]
        }))

        return commands.insertContent({
          type: this.name,
          attrs: { layout },
          content: columns
        })
      },

      setColumnLayout: (layout) => ({ commands }) => {
        return commands.updateAttributes(this.name, { layout })
      },

      addColumn: () => ({ state, dispatch, editor }) => {
        const { $from } = state.selection

        // Find the columns node
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === "columns") {
            const pos = $from.before(d)
            const columnsNode = state.doc.nodeAt(pos)

            if (!columnsNode || columnsNode.childCount >= 4) return false

            if (dispatch) {
              // Create new column
              const newColumn = state.schema.nodes.column.create(null, [
                state.schema.nodes.paragraph.create()
              ])

              // Insert at end of columns
              const insertPos = pos + columnsNode.nodeSize - 1
              const tr = state.tr.insert(insertPos, newColumn)

              // Update layout to match new count
              const newCount = columnsNode.childCount + 1
              const newLayout = `equal-${newCount}`
              tr.setNodeMarkup(pos, undefined, { ...columnsNode.attrs, layout: newLayout })

              dispatch(tr)
            }
            return true
          }
        }
        return false
      },

      removeColumn: () => ({ state, dispatch }) => {
        const { $from } = state.selection

        // Find the column we're in
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === "column") {
            const columnPos = $from.before(d)

            // Find parent columns
            const columnsDepth = d - 1
            const columnsNode = $from.node(columnsDepth)
            const columnsPos = $from.before(columnsDepth)

            if (columnsNode.type.name !== "columns") continue
            if (columnsNode.childCount <= 2) return false // Min 2 columns

            if (dispatch) {
              const columnNode = state.doc.nodeAt(columnPos)
              const tr = state.tr.delete(columnPos, columnPos + columnNode.nodeSize)

              // Update layout to match new count
              const newCount = columnsNode.childCount - 1
              const newLayout = `equal-${newCount}`

              // Adjust position after deletion
              const newColumnsPos = columnPos < columnsPos ? columnsPos - columnNode.nodeSize : columnsPos
              tr.setNodeMarkup(newColumnsPos, undefined, { ...columnsNode.attrs, layout: newLayout })

              dispatch(tr)
            }
            return true
          }
        }
        return false
      },

      deleteColumns: () => ({ state, dispatch }) => {
        const { $from } = state.selection

        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === "columns") {
            if (dispatch) {
              const pos = $from.before(d)
              const tr = state.tr.delete(pos, pos + node.nodeSize)
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
      "Mod-Shift-c": () => this.editor.commands.insertColumns({ count: 2 })
    }
  },

  // Private helpers

  createControls(node, getPos, editor) {
    const controls = document.createElement("div")
    controls.className = "inkpen-columns-controls"
    controls.contentEditable = "false"

    // Layout selector
    const layoutGroup = document.createElement("div")
    layoutGroup.className = "inkpen-columns-controls__group"

    const layoutLabel = document.createElement("span")
    layoutLabel.className = "inkpen-columns-controls__label"
    layoutLabel.textContent = "Layout"
    layoutGroup.appendChild(layoutLabel)

    // Get layouts for current column count
    const currentLayout = this.options.layouts[node.attrs.layout]
    const columnCount = currentLayout?.columns || 2

    Object.entries(this.options.layouts)
      .filter(([, preset]) => preset.columns === columnCount)
      .forEach(([key, preset]) => {
        const btn = document.createElement("button")
        btn.type = "button"
        btn.className = "inkpen-columns-controls__btn"
        btn.dataset.layout = key
        btn.textContent = preset.label
        btn.title = `Set layout to ${preset.label}`

        if (node.attrs.layout === key) {
          btn.classList.add("is-active")
        }

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
                  tr.setNodeMarkup(pos, undefined, { ...node.attrs, layout: key })
                  return true
                })
                .run()
            }
          }
        })

        layoutGroup.appendChild(btn)
      })

    controls.appendChild(layoutGroup)

    // Add/remove column buttons
    const columnGroup = document.createElement("div")
    columnGroup.className = "inkpen-columns-controls__group"

    const removeBtn = document.createElement("button")
    removeBtn.type = "button"
    removeBtn.className = "inkpen-columns-controls__btn inkpen-columns-controls__btn--icon"
    removeBtn.innerHTML = "−"
    removeBtn.title = "Remove column"
    removeBtn.disabled = columnCount <= 2
    removeBtn.addEventListener("mousedown", (e) => e.preventDefault())
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      editor.commands.removeColumn()
    })

    const countLabel = document.createElement("span")
    countLabel.className = "inkpen-columns-controls__count"
    countLabel.textContent = `${columnCount} cols`

    const addBtn = document.createElement("button")
    addBtn.type = "button"
    addBtn.className = "inkpen-columns-controls__btn inkpen-columns-controls__btn--icon"
    addBtn.innerHTML = "+"
    addBtn.title = "Add column"
    addBtn.disabled = columnCount >= 4
    addBtn.addEventListener("mousedown", (e) => e.preventDefault())
    addBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      editor.commands.addColumn()
    })

    columnGroup.appendChild(removeBtn)
    columnGroup.appendChild(countLabel)
    columnGroup.appendChild(addBtn)
    controls.appendChild(columnGroup)

    return controls
  },

  updateControls(controls, node, getPos, editor) {
    const currentLayout = this.options.layouts[node.attrs.layout]
    const columnCount = currentLayout?.columns || 2

    // Update layout buttons
    controls.querySelectorAll("[data-layout]").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.layout === node.attrs.layout)
    })

    // Update count label
    const countLabel = controls.querySelector(".inkpen-columns-controls__count")
    if (countLabel) {
      countLabel.textContent = `${columnCount} cols`
    }

    // Update add/remove button states
    const removeBtn = controls.querySelector(".inkpen-columns-controls__btn--icon:first-child")
    const addBtn = controls.querySelector(".inkpen-columns-controls__btn--icon:last-child")

    if (removeBtn) removeBtn.disabled = columnCount <= 2
    if (addBtn) addBtn.disabled = columnCount >= 4
  }
})

export default Columns
