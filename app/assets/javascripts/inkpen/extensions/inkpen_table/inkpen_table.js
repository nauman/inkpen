/**
 * InkpenTable Extension
 *
 * Notion/Airtable-style enhanced table with:
 * - Row/column handles with context menus
 * - Quick add buttons
 * - Text color and background color
 * - Alignment controls
 * - Caption and variants
 * - Sticky header option
 *
 * @since 0.8.0
 */

import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import {
  createElement,
  getTableDimensions,
  nextFrame
} from "./table_helpers.js"
import { TableMenu } from "./table_menu.js"
import { CSS_CLASSES, DEFAULT_CONFIG, TABLE_VARIANTS } from "./table_constants.js"

// =============================================================================
// InkpenTableRow Extension
// =============================================================================

export const InkpenTableRow = TableRow.extend({
  name: "tableRow"
})

// =============================================================================
// InkpenTable Extension
// =============================================================================

export const InkpenTable = Table.extend({
  name: "table",

  addOptions() {
    return {
      ...this.parent?.(),
      ...DEFAULT_CONFIG,
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
        renderHTML: () => ({})
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
      const options = this.options
      const { caption, variant, stickyHeader } = node.attrs

      // State
      let menu = null
      let currentRowIndex = -1
      let currentColIndex = -1

      // Main wrapper
      const wrapper = createElement("div", {
        className: `${CSS_CLASSES.wrapper}${stickyHeader ? " " + CSS_CLASSES.wrapper + "--sticky-header" : ""}`
      })

      // Caption (if enabled)
      let captionEl = null
      if (options.showCaption) {
        captionEl = createElement("div", {
          className: CSS_CLASSES.caption,
          contentEditable: editor.isEditable ? "true" : "false",
          placeholder: "Add table caption..."
        }, [caption || ""])

        if (editor.isEditable) {
          captionEl.addEventListener("input", () => {
            updateCaption(captionEl.textContent || null)
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

      // Column handles container
      let colHandlesEl = null
      if (options.showHandles && editor.isEditable) {
        colHandlesEl = createElement("div", { className: CSS_CLASSES.colHandles })
        wrapper.appendChild(colHandlesEl)
      }

      // Body container (row handles + table)
      const bodyEl = createElement("div", { className: CSS_CLASSES.body })

      // Row handles container
      let rowHandlesEl = null
      if (options.showHandles && editor.isEditable) {
        rowHandlesEl = createElement("div", { className: CSS_CLASSES.rowHandles })
        bodyEl.appendChild(rowHandlesEl)
      }

      // Table content (contentDOM)
      const contentEl = createElement("div", {
        className: `${CSS_CLASSES.content} inkpen-table--${variant}`
      })
      bodyEl.appendChild(contentEl)
      wrapper.appendChild(bodyEl)

      // Add row button
      let addRowBtn = null
      if (options.showAddButtons && editor.isEditable) {
        addRowBtn = createElement("button", {
          className: CSS_CLASSES.addRow,
          type: "button"
        }, ["+ New row"])

        addRowBtn.addEventListener("click", (e) => {
          e.preventDefault()
          editor.chain().focus().addRowAfter().run()
        })

        wrapper.appendChild(addRowBtn)
      }

      // Initialize menu
      if (options.showHandles && editor.isEditable) {
        menu = new TableMenu({
          onAction: handleMenuAction
        })
      }

      // Update handles when table structure changes
      function updateHandles() {
        if (!options.showHandles || !editor.isEditable) return

        const tableEl = contentEl.querySelector("table")
        if (!tableEl) return

        const { rowCount, colCount } = getTableDimensions(tableEl)

        // Update column handles
        colHandlesEl.innerHTML = ""
        for (let i = 0; i < colCount; i++) {
          const handle = createElement("button", {
            className: CSS_CLASSES.handle,
            type: "button",
            dataset: { col: String(i) },
            title: "Column options"
          }, ["\u22EE\u22EE"])

          handle.addEventListener("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            currentColIndex = i
            currentRowIndex = -1
            menu.showColumnMenu(handle, { colIndex: i })
          })

          colHandlesEl.appendChild(handle)
        }

        // Add column button
        if (options.showAddButtons) {
          const addColBtn = createElement("button", {
            className: CSS_CLASSES.addCol,
            type: "button",
            title: "Add column"
          }, ["+"])

          addColBtn.addEventListener("click", (e) => {
            e.preventDefault()
            editor.chain().focus().addColumnAfter().run()
          })

          colHandlesEl.appendChild(addColBtn)
        }

        // Update row handles
        rowHandlesEl.innerHTML = ""
        for (let i = 0; i < rowCount; i++) {
          const handle = createElement("button", {
            className: CSS_CLASSES.handle,
            type: "button",
            dataset: { row: String(i) },
            title: "Row options"
          }, ["\u22EE\u22EE"])

          handle.addEventListener("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            currentRowIndex = i
            currentColIndex = -1
            menu.showRowMenu(handle, { rowIndex: i })
          })

          rowHandlesEl.appendChild(handle)
        }
      }

      // Handle menu actions
      function handleMenuAction({ action, menuType, color, value }) {
        const chain = editor.chain().focus()

        switch (action) {
          // Row actions
          case "addRowAbove":
            selectRowByIndex(currentRowIndex)
            chain.addRowBefore().run()
            break

          case "addRowBelow":
            selectRowByIndex(currentRowIndex)
            chain.addRowAfter().run()
            break

          case "duplicateRow":
            duplicateRow(currentRowIndex)
            break

          case "deleteRow":
            selectRowByIndex(currentRowIndex)
            chain.deleteRow().run()
            break

          case "moveRowUp":
            moveRow(currentRowIndex, -1)
            break

          case "moveRowDown":
            moveRow(currentRowIndex, 1)
            break

          case "toggleHeaderRow":
            selectRowByIndex(currentRowIndex)
            chain.toggleHeaderRow().run()
            break

          // Column actions
          case "addColumnLeft":
            selectColumnByIndex(currentColIndex)
            chain.addColumnBefore().run()
            break

          case "addColumnRight":
            selectColumnByIndex(currentColIndex)
            chain.addColumnAfter().run()
            break

          case "duplicateColumn":
            duplicateColumn(currentColIndex)
            break

          case "deleteColumn":
            selectColumnByIndex(currentColIndex)
            chain.deleteColumn().run()
            break

          case "moveColumnLeft":
            moveColumn(currentColIndex, -1)
            break

          case "moveColumnRight":
            moveColumn(currentColIndex, 1)
            break

          // Styling
          case "alignment":
            if (menuType === "column") {
              selectColumnByIndex(currentColIndex)
            } else {
              selectRowByIndex(currentRowIndex)
            }
            chain.setCellAlignment(value).run()
            break

          case "textColor":
            if (menuType === "column") {
              selectColumnByIndex(currentColIndex)
            } else {
              selectRowByIndex(currentRowIndex)
            }
            chain.setCellTextColor(color).run()
            break

          case "backgroundColor":
            if (menuType === "column") {
              selectColumnByIndex(currentColIndex)
            } else {
              selectRowByIndex(currentRowIndex)
            }
            chain.setCellBackground(color).run()
            break
        }

        // Update handles after any structural change
        nextFrame().then(updateHandles)
      }

      // Select a row by index (set cursor in first cell of that row)
      function selectRowByIndex(rowIndex) {
        if (typeof getPos !== "function") return

        const pos = getPos()
        if (pos === undefined) return

        const tableNode = editor.state.doc.nodeAt(pos)
        if (!tableNode) return

        let cellPos = pos + 1 // Start after table open tag
        let currentRow = 0

        tableNode.forEach((rowNode, rowOffset) => {
          if (currentRow === rowIndex) {
            // Found our row, set selection to first cell
            const firstCellPos = pos + 1 + rowOffset + 1 // table + row + first cell
            editor.commands.setTextSelection(firstCellPos + 1)
            return false
          }
          currentRow++
        })
      }

      // Select a column by index
      function selectColumnByIndex(colIndex) {
        if (typeof getPos !== "function") return

        const pos = getPos()
        if (pos === undefined) return

        const tableNode = editor.state.doc.nodeAt(pos)
        if (!tableNode || tableNode.childCount === 0) return

        // Get the first row
        const firstRow = tableNode.firstChild
        if (!firstRow || colIndex >= firstRow.childCount) return

        // Navigate to the cell at colIndex in the first row
        let cellPos = pos + 2 // table open + row open
        for (let i = 0; i < colIndex; i++) {
          cellPos += firstRow.child(i).nodeSize
        }

        editor.commands.setTextSelection(cellPos + 1)
      }

      // Duplicate a row
      function duplicateRow(rowIndex) {
        // For now, add row below (full duplication requires transaction manipulation)
        selectRowByIndex(rowIndex)
        editor.chain().focus().addRowAfter().run()
      }

      // Duplicate a column
      function duplicateColumn(colIndex) {
        // For now, add column after (full duplication requires transaction manipulation)
        selectColumnByIndex(colIndex)
        editor.chain().focus().addColumnAfter().run()
      }

      // Move a row up or down
      function moveRow(rowIndex, direction) {
        // Row movement requires complex transaction - defer to future version
        // For now, just focus the row
        selectRowByIndex(rowIndex)
      }

      // Move a column left or right
      function moveColumn(colIndex, direction) {
        // Column movement requires complex transaction - defer to future version
        // For now, just focus the column
        selectColumnByIndex(colIndex)
      }

      // Update caption
      function updateCaption(newCaption) {
        if (typeof getPos !== "function") return

        const pos = getPos()
        if (pos === undefined) return

        editor.chain().command(({ tr }) => {
          const tableNode = tr.doc.nodeAt(pos)
          if (tableNode) {
            tr.setNodeMarkup(pos, undefined, {
              ...tableNode.attrs,
              caption: newCaption
            })
          }
          return true
        }).run()
      }

      // Cleanup
      function destroy() {
        if (menu) {
          menu.destroy()
          menu = null
        }
      }

      // Initial handle setup
      if (options.showHandles && editor.isEditable) {
        nextFrame().then(updateHandles)
      }

      return {
        dom: wrapper,
        contentDOM: contentEl,

        update: (updatedNode) => {
          if (updatedNode.type.name !== "table") return false

          const newVariant = updatedNode.attrs.variant || "default"
          const newCaption = updatedNode.attrs.caption
          const newSticky = updatedNode.attrs.stickyHeader

          // Update variant class
          contentEl.className = `${CSS_CLASSES.content} inkpen-table--${newVariant}`

          // Update sticky class
          wrapper.classList.toggle(`${CSS_CLASSES.wrapper}--sticky-header`, newSticky)

          // Update caption
          if (captionEl && captionEl.textContent !== newCaption) {
            captionEl.textContent = newCaption || ""
          }

          // Update handles
          if (options.showHandles && editor.isEditable) {
            nextFrame().then(updateHandles)
          }

          return true
        },

        destroy
      }
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),

      setTableCaption: (caption) => ({ tr, state, dispatch }) => {
        const tableNode = findParentTable(state.selection)
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
        const tableNode = findParentTable(state.selection)
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
        const tableNode = findParentTable(state.selection)
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
        const cells = getSelectedCellPositions(state)
        if (cells.length === 0) return false

        if (dispatch) {
          cells.forEach(({ pos, node }) => {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              align
            })
          })
        }

        return true
      },

      setCellBackground: (background) => ({ tr, state, dispatch }) => {
        const cells = getSelectedCellPositions(state)
        if (cells.length === 0) return false

        if (dispatch) {
          cells.forEach(({ pos, node }) => {
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
      },

      setCellTextColor: (textColor) => ({ tr, state, dispatch }) => {
        const cells = getSelectedCellPositions(state)
        if (cells.length === 0) return false

        if (dispatch) {
          cells.forEach(({ pos, node }) => {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              textColor
            })
          })
        }

        return true
      },

      clearCellTextColor: () => ({ commands }) => {
        return commands.setCellTextColor(null)
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
  }
})

// =============================================================================
// Helper Functions
// =============================================================================

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

function getSelectedCellPositions(state) {
  const cells = []
  const { selection, doc } = state

  // Check for CellSelection (multiple cells selected)
  if (selection.$anchorCell && selection.$headCell) {
    const cellSelection = selection
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

export default InkpenTable
