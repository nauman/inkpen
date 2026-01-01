/**
 * InkpenTableCell Extension
 *
 * Enhanced table cell with alignment, background color, and text color support.
 *
 * @since 0.8.0
 */

import TableCell from "@tiptap/extension-table-cell"

export const InkpenTableCell = TableCell.extend({
  name: "tableCell",

  addAttributes() {
    return {
      ...this.parent?.(),

      // Text alignment
      align: {
        default: null,
        parseHTML: element => {
          return element.getAttribute("data-align") ||
                 element.style.textAlign ||
                 null
        },
        renderHTML: attributes => {
          if (!attributes.align) return {}
          return {
            "data-align": attributes.align,
            style: `text-align: ${attributes.align}`
          }
        }
      },

      // Background color
      background: {
        default: null,
        parseHTML: element => element.getAttribute("data-background"),
        renderHTML: attributes => {
          if (!attributes.background) return {}
          return { "data-background": attributes.background }
        }
      },

      // Text color (NEW)
      textColor: {
        default: null,
        parseHTML: element => element.getAttribute("data-text-color"),
        renderHTML: attributes => {
          if (!attributes.textColor) return {}
          return { "data-text-color": attributes.textColor }
        }
      },

      // Colspan
      colspan: {
        default: 1,
        parseHTML: element => {
          const colspan = element.getAttribute("colspan")
          return colspan ? parseInt(colspan, 10) : 1
        },
        renderHTML: attributes => {
          if (attributes.colspan === 1) return {}
          return { colspan: attributes.colspan }
        }
      },

      // Rowspan
      rowspan: {
        default: 1,
        parseHTML: element => {
          const rowspan = element.getAttribute("rowspan")
          return rowspan ? parseInt(rowspan, 10) : 1
        },
        renderHTML: attributes => {
          if (attributes.rowspan === 1) return {}
          return { rowspan: attributes.rowspan }
        }
      },

      // Column width for resizing
      colwidth: {
        default: null,
        parseHTML: element => {
          const colwidth = element.getAttribute("colwidth")
          return colwidth ? colwidth.split(",").map(Number) : null
        },
        renderHTML: attributes => {
          if (!attributes.colwidth) return {}
          return {
            colwidth: attributes.colwidth.join(","),
            style: `width: ${attributes.colwidth[0]}px`
          }
        }
      }
    }
  }
})

export default InkpenTableCell
