import { Node, mergeAttributes } from "@tiptap/core"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"

/**
 * Advanced Table Extension for TipTap
 *
 * Extends TipTap's table with professional features:
 * - Column alignment (left, center, right)
 * - Table caption/title
 * - Striped rows option
 * - Border style variants (default, striped, borderless, minimal)
 * - Cell background colors
 * - Table toolbar on selection
 * - Sticky header option
 *
 * @example
 * editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
 * editor.commands.setTableVariant('striped')
 * editor.commands.setCellAlignment('center')
 *
 * @since 0.6.0
 */

// Cell background color options
const CELL_BACKGROUNDS = {
  gray: { label: "Gray", color: "var(--inkpen-table-bg-gray)" },
  red: { label: "Red", color: "var(--inkpen-table-bg-red)" },
  orange: { label: "Orange", color: "var(--inkpen-table-bg-orange)" },
  yellow: { label: "Yellow", color: "var(--inkpen-table-bg-yellow)" },
  green: { label: "Green", color: "var(--inkpen-table-bg-green)" },
  blue: { label: "Blue", color: "var(--inkpen-table-bg-blue)" },
  purple: { label: "Purple", color: "var(--inkpen-table-bg-purple)" }
}

// Table variant styles
const TABLE_VARIANTS = {
  default: { label: "Default", description: "Standard bordered table" },
  striped: { label: "Striped", description: "Alternating row colors" },
  borderless: { label: "Borderless", description: "No vertical borders" },
  minimal: { label: "Minimal", description: "Clean, no borders" }
}

// Alignment options
const ALIGNMENTS = {
  left: { label: "Left", icon: "⬅" },
  center: { label: "Center", icon: "⬌" },
  right: { label: "Right", icon: "➡" }
}

/**
 * Extended TableCell with alignment and background attributes
 */
export const AdvancedTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: element => element.getAttribute("data-align") || element.style.textAlign || null,
        renderHTML: attributes => {
          if (!attributes.align) return {}
          return {
            "data-align": attributes.align,
            style: `text-align: ${attributes.align}`
          }
        }
      },
      background: {
        default: null,
        parseHTML: element => element.getAttribute("data-background"),
        renderHTML: attributes => {
          if (!attributes.background) return {}
          return { "data-background": attributes.background }
        }
      }
    }
  }
})

/**
 * Extended TableHeader with alignment and background attributes
 */
export const AdvancedTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: element => element.getAttribute("data-align") || element.style.textAlign || null,
        renderHTML: attributes => {
          if (!attributes.align) return {}
          return {
            "data-align": attributes.align,
            style: `text-align: ${attributes.align}`
          }
        }
      },
      background: {
        default: null,
        parseHTML: element => element.getAttribute("data-background"),
        renderHTML: attributes => {
          if (!attributes.background) return {}
          return { "data-background": attributes.background }
        }
      }
    }
  }
})

/**
 * Extended TableRow (unchanged, included for completeness)
 */
export const AdvancedTableRow = TableRow.extend({
  // No changes needed, but exported for consistency
})

/**
 * Advanced Table Extension
 */
export const AdvancedTable = Table.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      resizable: true,
      showControls: true,
      defaultVariant: "default",
      variants: TABLE_VARIANTS,
      cellBackgrounds: CELL_BACKGROUNDS,
      alignments: ALIGNMENTS,
      HTMLAttributes: {
        class: "inkpen-table"
      }
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: element => {
          const caption = element.querySelector("caption")
          return caption ? caption.textContent : null
        },
        renderHTML: () => ({}) // Caption rendered separately in NodeView
      },
      variant: {
        default: "default",
        parseHTML: element => element.getAttribute("data-variant") || "default",
        renderHTML: attributes => ({ "data-variant": attributes.variant })
      },
      stickyHeader: {
        default: false,
        parseHTML: element => element.hasAttribute("data-sticky-header"),
        renderHTML: attributes => attributes.stickyHeader ? { "data-sticky-header": "" } : {}
      }
    }
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const { caption, variant, stickyHeader } = node.attrs

      // Wrapper container
      const wrapper = document.createElement("div")
      wrapper.className = "inkpen-table-wrapper"
      if (stickyHeader) wrapper.classList.add("inkpen-table-wrapper--sticky-header")

      // Caption (if present)
      let captionEl = null
      if (caption || editor.isEditable) {
        captionEl = document.createElement("div")
        captionEl.className = "inkpen-table__caption"
        captionEl.contentEditable = editor.isEditable ? "true" : "false"
        captionEl.textContent = caption || ""
        captionEl.setAttribute("placeholder", "Add table caption...")

        if (editor.isEditable) {
          captionEl.addEventListener("input", () => {
            if (typeof getPos === "function") {
              const pos = getPos()
              if (pos !== undefined) {
                editor.chain().command(({ tr }) => {
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    caption: captionEl.textContent || null
                  })
                  return true
                }).run()
              }
            }
          })

          captionEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              captionEl.blur()
            }
          })
        }

        wrapper.appendChild(captionEl)
      }

      // Table controls toolbar (shown on hover/focus)
      if (this.options.showControls && editor.isEditable) {
        const controls = this.createTableControls(node, editor, getPos)
        wrapper.appendChild(controls)
      }

      // Table container (contentDOM for ProseMirror)
      const tableContainer = document.createElement("div")
      tableContainer.className = `inkpen-table__container inkpen-table--${variant}`
      wrapper.appendChild(tableContainer)

      return {
        dom: wrapper,
        contentDOM: tableContainer,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "table") return false

          const newVariant = updatedNode.attrs.variant || "default"
          const newCaption = updatedNode.attrs.caption
          const newSticky = updatedNode.attrs.stickyHeader

          // Update variant class
          tableContainer.className = `inkpen-table__container inkpen-table--${newVariant}`

          // Update sticky class
          wrapper.classList.toggle("inkpen-table-wrapper--sticky-header", newSticky)

          // Update caption
          if (captionEl && captionEl.textContent !== newCaption) {
            captionEl.textContent = newCaption || ""
          }

          return true
        }
      }
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),

      setTableCaption: (caption) => ({ tr, state, dispatch }) => {
        const { selection } = state
        const tableNode = findParentTable(selection)

        if (!tableNode) return false

        if (dispatch) {
          tr.setNodeMarkup(tableNode.pos, undefined, {
            ...tableNode.node.attrs,
            caption
          })
        }

        return true
      },

      setTableVariant: (variant) => ({ tr, state, dispatch }) => {
        const { selection } = state
        const tableNode = findParentTable(selection)

        if (!tableNode) return false

        if (dispatch) {
          tr.setNodeMarkup(tableNode.pos, undefined, {
            ...tableNode.node.attrs,
            variant
          })
        }

        return true
      },

      toggleStickyHeader: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        const tableNode = findParentTable(selection)

        if (!tableNode) return false

        if (dispatch) {
          tr.setNodeMarkup(tableNode.pos, undefined, {
            ...tableNode.node.attrs,
            stickyHeader: !tableNode.node.attrs.stickyHeader
          })
        }

        return true
      },

      setCellAlignment: (align) => ({ tr, state, dispatch }) => {
        const { selection } = state
        const cellPositions = getSelectedCellPositions(state)

        if (cellPositions.length === 0) return false

        if (dispatch) {
          cellPositions.forEach(({ pos, node }) => {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              align
            })
          })
        }

        return true
      },

      setCellBackground: (background) => ({ tr, state, dispatch }) => {
        const { selection } = state
        const cellPositions = getSelectedCellPositions(state)

        if (cellPositions.length === 0) return false

        if (dispatch) {
          cellPositions.forEach(({ pos, node }) => {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              background
            })
          })
        }

        return true
      },

      clearCellBackground: () => ({ commands }) => {
        return commands.setCellBackground(null)
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      "Mod-Shift-l": () => this.editor.commands.setCellAlignment("left"),
      "Mod-Shift-e": () => this.editor.commands.setCellAlignment("center"),
      "Mod-Shift-r": () => this.editor.commands.setCellAlignment("right")
    }
  },

  // Private: Create table controls toolbar

  createTableControls(node, editor, getPos) {
    const controls = document.createElement("div")
    controls.className = "inkpen-table__controls"
    controls.contentEditable = "false"

    // Alignment buttons
    const alignGroup = document.createElement("div")
    alignGroup.className = "inkpen-table__control-group"

    Object.entries(ALIGNMENTS).forEach(([align, { label, icon }]) => {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "inkpen-table__control-btn"
      btn.title = `Align ${label}`
      btn.textContent = icon

      btn.addEventListener("mousedown", (e) => e.preventDefault())
      btn.addEventListener("click", () => {
        editor.chain().focus().setCellAlignment(align).run()
      })

      alignGroup.appendChild(btn)
    })

    controls.appendChild(alignGroup)

    // Divider
    const divider1 = document.createElement("span")
    divider1.className = "inkpen-table__control-divider"
    controls.appendChild(divider1)

    // Variant dropdown
    const variantBtn = document.createElement("button")
    variantBtn.type = "button"
    variantBtn.className = "inkpen-table__control-btn"
    variantBtn.title = "Table Style"
    variantBtn.textContent = "≡"

    variantBtn.addEventListener("mousedown", (e) => e.preventDefault())
    variantBtn.addEventListener("click", () => {
      this.showVariantDropdown(variantBtn, node, editor, getPos)
    })

    controls.appendChild(variantBtn)

    // Cell color button
    const colorBtn = document.createElement("button")
    colorBtn.type = "button"
    colorBtn.className = "inkpen-table__control-btn"
    colorBtn.title = "Cell Color"
    colorBtn.textContent = "🎨"

    colorBtn.addEventListener("mousedown", (e) => e.preventDefault())
    colorBtn.addEventListener("click", () => {
      this.showColorDropdown(colorBtn, editor)
    })

    controls.appendChild(colorBtn)

    // Divider
    const divider2 = document.createElement("span")
    divider2.className = "inkpen-table__control-divider"
    controls.appendChild(divider2)

    // Add row button
    const addRowBtn = document.createElement("button")
    addRowBtn.type = "button"
    addRowBtn.className = "inkpen-table__control-btn"
    addRowBtn.title = "Add Row Below"
    addRowBtn.textContent = "+↓"

    addRowBtn.addEventListener("mousedown", (e) => e.preventDefault())
    addRowBtn.addEventListener("click", () => {
      editor.chain().focus().addRowAfter().run()
    })

    controls.appendChild(addRowBtn)

    // Add column button
    const addColBtn = document.createElement("button")
    addColBtn.type = "button"
    addColBtn.className = "inkpen-table__control-btn"
    addColBtn.title = "Add Column Right"
    addColBtn.textContent = "+→"

    addColBtn.addEventListener("mousedown", (e) => e.preventDefault())
    addColBtn.addEventListener("click", () => {
      editor.chain().focus().addColumnAfter().run()
    })

    controls.appendChild(addColBtn)

    return controls
  },

  // Private: Show variant selection dropdown

  showVariantDropdown(anchor, node, editor, getPos) {
    removeExistingDropdown()

    const dropdown = document.createElement("div")
    dropdown.className = "inkpen-table__dropdown"

    Object.entries(TABLE_VARIANTS).forEach(([variant, { label, description }]) => {
      const item = document.createElement("button")
      item.type = "button"
      item.className = "inkpen-table__dropdown-item"
      if (node.attrs.variant === variant) {
        item.classList.add("is-active")
      }

      item.innerHTML = `
        <span class="inkpen-table__dropdown-label">${label}</span>
        <span class="inkpen-table__dropdown-desc">${description}</span>
      `

      item.addEventListener("mousedown", (e) => e.preventDefault())
      item.addEventListener("click", () => {
        editor.chain().focus().setTableVariant(variant).run()
        dropdown.remove()
      })

      dropdown.appendChild(item)
    })

    // Sticky header toggle
    const stickyItem = document.createElement("button")
    stickyItem.type = "button"
    stickyItem.className = "inkpen-table__dropdown-item"
    if (node.attrs.stickyHeader) {
      stickyItem.classList.add("is-active")
    }

    stickyItem.innerHTML = `
      <span class="inkpen-table__dropdown-label">Sticky Header</span>
      <span class="inkpen-table__dropdown-desc">Header stays visible on scroll</span>
    `

    stickyItem.addEventListener("mousedown", (e) => e.preventDefault())
    stickyItem.addEventListener("click", () => {
      editor.chain().focus().toggleStickyHeader().run()
      dropdown.remove()
    })

    dropdown.appendChild(stickyItem)

    positionDropdown(dropdown, anchor)
    setupDropdownClose(dropdown, anchor)
  },

  // Private: Show color selection dropdown

  showColorDropdown(anchor, editor) {
    removeExistingDropdown()

    const dropdown = document.createElement("div")
    dropdown.className = "inkpen-table__dropdown inkpen-table__dropdown--colors"

    // No color option
    const clearItem = document.createElement("button")
    clearItem.type = "button"
    clearItem.className = "inkpen-table__color-btn inkpen-table__color-btn--clear"
    clearItem.title = "No Color"
    clearItem.innerHTML = "∅"

    clearItem.addEventListener("mousedown", (e) => e.preventDefault())
    clearItem.addEventListener("click", () => {
      editor.chain().focus().clearCellBackground().run()
      dropdown.remove()
    })

    dropdown.appendChild(clearItem)

    // Color options
    Object.entries(CELL_BACKGROUNDS).forEach(([key, { label }]) => {
      const colorBtn = document.createElement("button")
      colorBtn.type = "button"
      colorBtn.className = `inkpen-table__color-btn inkpen-table__color-btn--${key}`
      colorBtn.title = label
      colorBtn.setAttribute("data-color", key)

      colorBtn.addEventListener("mousedown", (e) => e.preventDefault())
      colorBtn.addEventListener("click", () => {
        editor.chain().focus().setCellBackground(key).run()
        dropdown.remove()
      })

      dropdown.appendChild(colorBtn)
    })

    positionDropdown(dropdown, anchor)
    setupDropdownClose(dropdown, anchor)
  }
})

// Helper: Find parent table node

function findParentTable(selection) {
  const { $from } = selection
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d)
    if (node.type.name === "table") {
      return { node, pos: $from.before(d) }
    }
  }
  return null
}

// Helper: Get all selected cell positions

function getSelectedCellPositions(state) {
  const cells = []
  const { selection, doc } = state

  // Check for CellSelection (multiple cells selected)
  if (selection.$anchorCell && selection.$headCell) {
    const cellSelection = selection
    const table = cellSelection.$anchorCell.node(-1)
    const map = {}

    doc.nodesBetween(
      cellSelection.$anchorCell.start(-1),
      cellSelection.$headCell.start(-1) + cellSelection.$headCell.parent.nodeSize,
      (node, pos) => {
        if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
          if (!map[pos]) {
            map[pos] = true
            cells.push({ node, pos })
          }
        }
      }
    )
  } else {
    // Single cell - find the cell we're in
    const { $from } = selection
    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d)
      if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
        cells.push({ node, pos: $from.before(d) })
        break
      }
    }
  }

  return cells
}

// Helper: Remove existing dropdown

function removeExistingDropdown() {
  const existing = document.querySelector(".inkpen-table__dropdown")
  if (existing) existing.remove()
}

// Helper: Position dropdown below anchor

function positionDropdown(dropdown, anchor) {
  const rect = anchor.getBoundingClientRect()
  dropdown.style.position = "fixed"
  dropdown.style.left = `${rect.left}px`
  dropdown.style.top = `${rect.bottom + 4}px`
  dropdown.style.zIndex = "10000"
  document.body.appendChild(dropdown)
}

// Helper: Setup dropdown close handlers

function setupDropdownClose(dropdown, anchor) {
  const closeHandler = (e) => {
    if (!dropdown.contains(e.target) && !anchor.contains(e.target)) {
      dropdown.remove()
      document.removeEventListener("mousedown", closeHandler)
    }
  }

  setTimeout(() => {
    document.addEventListener("mousedown", closeHandler)
  }, 0)

  const escHandler = (e) => {
    if (e.key === "Escape") {
      dropdown.remove()
      document.removeEventListener("keydown", escHandler)
    }
  }
  document.addEventListener("keydown", escHandler)
}

export { CELL_BACKGROUNDS, TABLE_VARIANTS, ALIGNMENTS }
export default AdvancedTable
