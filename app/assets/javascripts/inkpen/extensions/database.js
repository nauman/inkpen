import { Node } from "@tiptap/core"

/**
 * Database Block Extension for TipTap
 *
 * Notion-style inline databases with multiple views.
 *
 * Features:
 * - Property types: Text, Number, Select, Multi-select, Date, Checkbox, URL
 * - Views: Table, List, Gallery, Board (Kanban)
 * - Filters with AND/OR logic
 * - Sorting (single and multi-column)
 * - Inline database (embedded in document)
 * - Real-time updates
 *
 * @example
 * editor.commands.insertDatabase()
 * editor.commands.insertDatabase({ title: 'Tasks', view: 'board' })
 *
 * @since 0.6.0
 */

// Property type definitions
const PROPERTY_TYPES = {
  text: { icon: "Aa", label: "Text", default: "" },
  number: { icon: "#", label: "Number", default: 0 },
  select: { icon: "▼", label: "Select", default: null },
  multiSelect: { icon: "☰", label: "Multi-select", default: [] },
  date: { icon: "📅", label: "Date", default: null },
  checkbox: { icon: "☑", label: "Checkbox", default: false },
  url: { icon: "🔗", label: "URL", default: "" }
}

// View type definitions
const VIEW_TYPES = {
  table: { icon: "⊞", label: "Table" },
  list: { icon: "☰", label: "List" },
  gallery: { icon: "⊟", label: "Gallery" },
  board: { icon: "▣", label: "Board" }
}

// Default select options colors
const SELECT_COLORS = ["gray", "red", "orange", "yellow", "green", "blue", "purple", "pink"]

// Generate unique ID
function generateId() {
  return `db-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`
}

export const Database = Node.create({
  name: "database",

  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      defaultTitle: "Untitled Database",
      defaultView: "table",
      propertyTypes: PROPERTY_TYPES,
      viewTypes: VIEW_TYPES,
      selectColors: SELECT_COLORS,
      HTMLAttributes: {
        class: "inkpen-database"
      }
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute("data-id") || generateId(),
        renderHTML: attributes => ({ "data-id": attributes.id || generateId() })
      },
      title: {
        default: this.options.defaultTitle,
        parseHTML: element => element.getAttribute("data-title") || this.options.defaultTitle,
        renderHTML: attributes => ({ "data-title": attributes.title })
      },
      properties: {
        default: [
          { id: "name", name: "Name", type: "text", width: 200 },
          { id: "status", name: "Status", type: "select", options: [
            { id: "todo", label: "To Do", color: "gray" },
            { id: "progress", label: "In Progress", color: "blue" },
            { id: "done", label: "Done", color: "green" }
          ]}
        ],
        parseHTML: element => {
          try {
            return JSON.parse(element.getAttribute("data-properties") || "[]")
          } catch {
            return []
          }
        },
        renderHTML: attributes => ({ "data-properties": JSON.stringify(attributes.properties) })
      },
      rows: {
        default: [],
        parseHTML: element => {
          try {
            return JSON.parse(element.getAttribute("data-rows") || "[]")
          } catch {
            return []
          }
        },
        renderHTML: attributes => ({ "data-rows": JSON.stringify(attributes.rows) })
      },
      activeView: {
        default: "table",
        parseHTML: element => element.getAttribute("data-view") || "table",
        renderHTML: attributes => ({ "data-view": attributes.activeView })
      },
      filters: {
        default: [],
        parseHTML: element => {
          try {
            return JSON.parse(element.getAttribute("data-filters") || "[]")
          } catch {
            return []
          }
        },
        renderHTML: attributes => ({ "data-filters": JSON.stringify(attributes.filters) })
      },
      sorts: {
        default: [],
        parseHTML: element => {
          try {
            return JSON.parse(element.getAttribute("data-sorts") || "[]")
          } catch {
            return []
          }
        },
        renderHTML: attributes => ({ "data-sorts": JSON.stringify(attributes.sorts) })
      },
      groupBy: {
        default: null,
        parseHTML: element => element.getAttribute("data-group-by"),
        renderHTML: attributes => attributes.groupBy ? { "data-group-by": attributes.groupBy } : {}
      }
    }
  },

  parseHTML() {
    return [
      { tag: "div.inkpen-database" },
      { tag: "[data-database]" }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...this.options.HTMLAttributes, ...HTMLAttributes, "data-database": "" }, 0]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const extension = this
      let currentNode = node

      // Main container
      const dom = document.createElement("div")
      dom.className = `inkpen-database inkpen-database--${node.attrs.activeView}`

      // Render function
      const render = () => {
        dom.innerHTML = ""
        dom.className = `inkpen-database inkpen-database--${currentNode.attrs.activeView}`

        // Header
        const header = extension.renderHeader(currentNode, editor, getPos)
        dom.appendChild(header)

        // Content based on view type
        const content = document.createElement("div")
        content.className = "inkpen-database__content"

        switch (currentNode.attrs.activeView) {
          case "table":
            content.appendChild(extension.renderTableView(currentNode, editor, getPos))
            break
          case "board":
            content.appendChild(extension.renderBoardView(currentNode, editor, getPos))
            break
          case "list":
            content.appendChild(extension.renderListView(currentNode, editor, getPos))
            break
          case "gallery":
            content.appendChild(extension.renderGalleryView(currentNode, editor, getPos))
            break
        }

        dom.appendChild(content)
      }

      render()

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "database") return false
          currentNode = updatedNode
          render()
          return true
        }
      }
    }
  },

  addCommands() {
    return {
      insertDatabase: (options = {}) => ({ commands }) => {
        const id = generateId()
        return commands.insertContent({
          type: this.name,
          attrs: {
            id,
            title: options.title || this.options.defaultTitle,
            activeView: options.view || this.options.defaultView,
            properties: options.properties || [
              { id: "name", name: "Name", type: "text", width: 200 },
              { id: "status", name: "Status", type: "select", options: [
                { id: "todo", label: "To Do", color: "gray" },
                { id: "progress", label: "In Progress", color: "blue" },
                { id: "done", label: "Done", color: "green" }
              ]}
            ],
            rows: options.rows || [],
            groupBy: options.groupBy || "status"
          }
        })
      },

      setDatabaseTitle: (title) => ({ tr, state, dispatch }) => {
        const node = findDatabaseNode(state.selection)
        if (!node) return false
        if (dispatch) {
          tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, title })
        }
        return true
      },

      setDatabaseView: (view) => ({ tr, state, dispatch }) => {
        const node = findDatabaseNode(state.selection)
        if (!node) return false
        if (dispatch) {
          tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, activeView: view })
        }
        return true
      },

      addDatabaseRow: (rowData = {}) => ({ tr, state, dispatch }) => {
        const node = findDatabaseNode(state.selection)
        if (!node) return false

        const newRow = {
          id: generateId(),
          ...rowData
        }

        // Set defaults for each property
        node.node.attrs.properties.forEach(prop => {
          if (newRow[prop.id] === undefined) {
            newRow[prop.id] = PROPERTY_TYPES[prop.type]?.default ?? ""
          }
        })

        if (dispatch) {
          tr.setNodeMarkup(node.pos, undefined, {
            ...node.node.attrs,
            rows: [...node.node.attrs.rows, newRow]
          })
        }
        return true
      },

      updateDatabaseRow: (rowId, updates) => ({ tr, state, dispatch }) => {
        const node = findDatabaseNode(state.selection)
        if (!node) return false

        const rows = node.node.attrs.rows.map(row =>
          row.id === rowId ? { ...row, ...updates } : row
        )

        if (dispatch) {
          tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, rows })
        }
        return true
      },

      deleteDatabaseRow: (rowId) => ({ tr, state, dispatch }) => {
        const node = findDatabaseNode(state.selection)
        if (!node) return false

        const rows = node.node.attrs.rows.filter(row => row.id !== rowId)

        if (dispatch) {
          tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, rows })
        }
        return true
      },

      addDatabaseProperty: (propertyDef) => ({ tr, state, dispatch }) => {
        const node = findDatabaseNode(state.selection)
        if (!node) return false

        const newProp = {
          id: generateId(),
          name: propertyDef.name || "New Property",
          type: propertyDef.type || "text",
          ...propertyDef
        }

        if (dispatch) {
          tr.setNodeMarkup(node.pos, undefined, {
            ...node.node.attrs,
            properties: [...node.node.attrs.properties, newProp]
          })
        }
        return true
      }
    }
  },

  // Private: Render header

  renderHeader(node, editor, getPos) {
    const header = document.createElement("div")
    header.className = "inkpen-database__header"

    // Title input
    const titleInput = document.createElement("input")
    titleInput.type = "text"
    titleInput.className = "inkpen-database__title"
    titleInput.value = node.attrs.title
    titleInput.placeholder = "Untitled"

    if (editor.isEditable) {
      titleInput.addEventListener("input", () => {
        this.updateNodeAttrs(getPos, node, { title: titleInput.value }, editor)
      })
    } else {
      titleInput.readOnly = true
    }

    header.appendChild(titleInput)

    // View tabs
    const viewTabs = document.createElement("div")
    viewTabs.className = "inkpen-database__views"

    Object.entries(VIEW_TYPES).forEach(([viewType, { icon, label }]) => {
      const tab = document.createElement("button")
      tab.type = "button"
      tab.className = "inkpen-database__view-tab"
      if (node.attrs.activeView === viewType) tab.classList.add("is-active")
      tab.innerHTML = `<span class="inkpen-database__view-icon">${icon}</span>`
      tab.title = label

      tab.addEventListener("mousedown", (e) => e.preventDefault())
      tab.addEventListener("click", () => {
        this.updateNodeAttrs(getPos, node, { activeView: viewType }, editor)
      })

      viewTabs.appendChild(tab)
    })

    header.appendChild(viewTabs)

    // Actions
    if (editor.isEditable) {
      const actions = document.createElement("div")
      actions.className = "inkpen-database__actions"

      const newRowBtn = document.createElement("button")
      newRowBtn.type = "button"
      newRowBtn.className = "inkpen-database__action-btn"
      newRowBtn.textContent = "+ New"
      newRowBtn.title = "Add new row"

      newRowBtn.addEventListener("mousedown", (e) => e.preventDefault())
      newRowBtn.addEventListener("click", () => {
        const newRow = { id: generateId() }
        node.attrs.properties.forEach(prop => {
          newRow[prop.id] = PROPERTY_TYPES[prop.type]?.default ?? ""
        })
        this.updateNodeAttrs(getPos, node, {
          rows: [...node.attrs.rows, newRow]
        }, editor)
      })

      actions.appendChild(newRowBtn)
      header.appendChild(actions)
    }

    return header
  },

  // Private: Render table view

  renderTableView(node, editor, getPos) {
    const { properties, rows } = node.attrs
    const container = document.createElement("div")
    container.className = "inkpen-database__table-wrapper"

    const table = document.createElement("table")
    table.className = "inkpen-database__table"

    // Header row
    const thead = document.createElement("thead")
    const headerRow = document.createElement("tr")

    properties.forEach(prop => {
      const th = document.createElement("th")
      th.innerHTML = `
        <span class="inkpen-database__prop-icon">${PROPERTY_TYPES[prop.type]?.icon || ""}</span>
        <span class="inkpen-database__prop-name">${escapeHtml(prop.name)}</span>
      `
      th.style.width = prop.width ? `${prop.width}px` : "auto"
      headerRow.appendChild(th)
    })

    // Add property column
    if (editor.isEditable) {
      const addTh = document.createElement("th")
      addTh.className = "inkpen-database__add-prop"
      addTh.innerHTML = "+"
      addTh.title = "Add property"

      addTh.addEventListener("click", () => {
        this.showAddPropertyMenu(addTh, node, editor, getPos)
      })

      headerRow.appendChild(addTh)
    }

    thead.appendChild(headerRow)
    table.appendChild(thead)

    // Body rows
    const tbody = document.createElement("tbody")

    rows.forEach(row => {
      const tr = document.createElement("tr")
      tr.dataset.rowId = row.id

      properties.forEach(prop => {
        const td = document.createElement("td")
        td.dataset.propId = prop.id
        td.dataset.type = prop.type

        const cellContent = this.renderCell(prop, row[prop.id], row, node, editor, getPos)
        td.appendChild(cellContent)
        tr.appendChild(td)
      })

      // Row actions
      if (editor.isEditable) {
        const actionsTd = document.createElement("td")
        actionsTd.className = "inkpen-database__row-actions"

        const deleteBtn = document.createElement("button")
        deleteBtn.type = "button"
        deleteBtn.className = "inkpen-database__row-delete"
        deleteBtn.innerHTML = "×"
        deleteBtn.title = "Delete row"

        deleteBtn.addEventListener("mousedown", (e) => e.preventDefault())
        deleteBtn.addEventListener("click", () => {
          this.updateNodeAttrs(getPos, node, {
            rows: node.attrs.rows.filter(r => r.id !== row.id)
          }, editor)
        })

        actionsTd.appendChild(deleteBtn)
        tr.appendChild(actionsTd)
      }

      tbody.appendChild(tr)
    })

    // New row placeholder
    if (editor.isEditable) {
      const placeholderRow = document.createElement("tr")
      placeholderRow.className = "inkpen-database__new-row"

      const placeholderTd = document.createElement("td")
      placeholderTd.colSpan = properties.length + 1
      placeholderTd.innerHTML = "+ New row"

      placeholderTd.addEventListener("click", () => {
        const newRow = { id: generateId() }
        properties.forEach(prop => {
          newRow[prop.id] = PROPERTY_TYPES[prop.type]?.default ?? ""
        })
        this.updateNodeAttrs(getPos, node, {
          rows: [...rows, newRow]
        }, editor)
      })

      placeholderRow.appendChild(placeholderTd)
      tbody.appendChild(placeholderRow)
    }

    table.appendChild(tbody)
    container.appendChild(table)

    return container
  },

  // Private: Render board view (Kanban)

  renderBoardView(node, editor, getPos) {
    const { properties, rows, groupBy } = node.attrs
    const container = document.createElement("div")
    container.className = "inkpen-database__board"

    // Find the select property to group by
    const groupProp = properties.find(p => p.id === groupBy && p.type === "select")
    if (!groupProp) {
      container.innerHTML = '<div class="inkpen-database__empty">Select a property to group by</div>'
      return container
    }

    const groups = groupProp.options || []

    groups.forEach(group => {
      const column = document.createElement("div")
      column.className = "inkpen-database__column"
      column.dataset.group = group.id

      // Column header
      const columnHeader = document.createElement("div")
      columnHeader.className = "inkpen-database__column-header"
      columnHeader.innerHTML = `
        <span class="inkpen-database__column-label" style="--select-color: var(--inkpen-select-${group.color})">
          ${escapeHtml(group.label)}
        </span>
        <span class="inkpen-database__column-count">
          ${rows.filter(r => r[groupBy] === group.id).length}
        </span>
      `
      column.appendChild(columnHeader)

      // Column items
      const columnItems = document.createElement("div")
      columnItems.className = "inkpen-database__column-items"

      const groupRows = rows.filter(r => r[groupBy] === group.id)
      groupRows.forEach(row => {
        const card = this.renderCard(row, properties, node, editor, getPos)
        columnItems.appendChild(card)
      })

      // Add card button
      if (editor.isEditable) {
        const addCard = document.createElement("button")
        addCard.type = "button"
        addCard.className = "inkpen-database__add-card"
        addCard.innerHTML = "+ Add"

        addCard.addEventListener("mousedown", (e) => e.preventDefault())
        addCard.addEventListener("click", () => {
          const newRow = { id: generateId(), [groupBy]: group.id }
          properties.forEach(prop => {
            if (newRow[prop.id] === undefined) {
              newRow[prop.id] = PROPERTY_TYPES[prop.type]?.default ?? ""
            }
          })
          this.updateNodeAttrs(getPos, node, {
            rows: [...rows, newRow]
          }, editor)
        })

        columnItems.appendChild(addCard)
      }

      column.appendChild(columnItems)
      container.appendChild(column)
    })

    return container
  },

  // Private: Render list view

  renderListView(node, editor, getPos) {
    const { properties, rows } = node.attrs
    const container = document.createElement("div")
    container.className = "inkpen-database__list"

    const nameProperty = properties.find(p => p.type === "text") || properties[0]

    rows.forEach(row => {
      const item = document.createElement("div")
      item.className = "inkpen-database__list-item"
      item.dataset.rowId = row.id

      const name = document.createElement("div")
      name.className = "inkpen-database__list-name"
      name.textContent = row[nameProperty?.id] || "Untitled"
      item.appendChild(name)

      const props = document.createElement("div")
      props.className = "inkpen-database__list-props"

      properties.slice(1).forEach(prop => {
        const propEl = document.createElement("span")
        propEl.className = `inkpen-database__list-prop inkpen-database__list-prop--${prop.type}`
        propEl.textContent = this.formatValue(prop, row[prop.id])
        props.appendChild(propEl)
      })

      item.appendChild(props)

      if (editor.isEditable) {
        item.style.cursor = "pointer"
        item.addEventListener("click", () => {
          // Could open edit modal here
        })
      }

      container.appendChild(item)
    })

    return container
  },

  // Private: Render gallery view

  renderGalleryView(node, editor, getPos) {
    const { properties, rows } = node.attrs
    const container = document.createElement("div")
    container.className = "inkpen-database__gallery"

    const nameProperty = properties.find(p => p.type === "text") || properties[0]

    rows.forEach(row => {
      const card = document.createElement("div")
      card.className = "inkpen-database__gallery-card"
      card.dataset.rowId = row.id

      const name = document.createElement("div")
      name.className = "inkpen-database__gallery-name"
      name.textContent = row[nameProperty?.id] || "Untitled"
      card.appendChild(name)

      const props = document.createElement("div")
      props.className = "inkpen-database__gallery-props"

      properties.slice(1, 4).forEach(prop => {
        const propEl = document.createElement("div")
        propEl.className = "inkpen-database__gallery-prop"
        propEl.innerHTML = `
          <span class="inkpen-database__gallery-prop-label">${escapeHtml(prop.name)}</span>
          <span class="inkpen-database__gallery-prop-value">${this.formatValue(prop, row[prop.id])}</span>
        `
        props.appendChild(propEl)
      })

      card.appendChild(props)
      container.appendChild(card)
    })

    return container
  },

  // Private: Render a single cell

  renderCell(prop, value, row, node, editor, getPos) {
    const cell = document.createElement("div")
    cell.className = `inkpen-database__cell inkpen-database__cell--${prop.type}`

    switch (prop.type) {
      case "text":
      case "url":
        if (editor.isEditable) {
          const input = document.createElement("input")
          input.type = prop.type === "url" ? "url" : "text"
          input.className = "inkpen-database__cell-input"
          input.value = value || ""
          input.placeholder = prop.type === "url" ? "https://..." : ""

          input.addEventListener("change", () => {
            this.updateRow(getPos, node, row.id, { [prop.id]: input.value }, editor)
          })

          cell.appendChild(input)
        } else {
          if (prop.type === "url" && value) {
            const link = document.createElement("a")
            link.href = value
            link.textContent = value
            link.target = "_blank"
            link.rel = "noopener noreferrer"
            cell.appendChild(link)
          } else {
            cell.textContent = value || ""
          }
        }
        break

      case "number":
        if (editor.isEditable) {
          const input = document.createElement("input")
          input.type = "number"
          input.className = "inkpen-database__cell-input"
          input.value = value ?? ""

          input.addEventListener("change", () => {
            this.updateRow(getPos, node, row.id, { [prop.id]: parseFloat(input.value) || 0 }, editor)
          })

          cell.appendChild(input)
        } else {
          cell.textContent = value ?? ""
        }
        break

      case "checkbox":
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.className = "inkpen-database__cell-checkbox"
        checkbox.checked = !!value
        checkbox.disabled = !editor.isEditable

        if (editor.isEditable) {
          checkbox.addEventListener("change", () => {
            this.updateRow(getPos, node, row.id, { [prop.id]: checkbox.checked }, editor)
          })
        }

        cell.appendChild(checkbox)
        break

      case "select":
        const selectedOption = prop.options?.find(o => o.id === value)
        if (selectedOption) {
          const tag = document.createElement("span")
          tag.className = `inkpen-database__tag inkpen-database__tag--${selectedOption.color}`
          tag.textContent = selectedOption.label
          cell.appendChild(tag)
        }

        if (editor.isEditable) {
          cell.style.cursor = "pointer"
          cell.addEventListener("click", (e) => {
            e.stopPropagation()
            this.showSelectMenu(cell, prop, row, node, editor, getPos)
          })
        }
        break

      case "date":
        if (editor.isEditable) {
          const input = document.createElement("input")
          input.type = "date"
          input.className = "inkpen-database__cell-input"
          input.value = value || ""

          input.addEventListener("change", () => {
            this.updateRow(getPos, node, row.id, { [prop.id]: input.value }, editor)
          })

          cell.appendChild(input)
        } else {
          cell.textContent = value ? new Date(value).toLocaleDateString() : ""
        }
        break

      default:
        cell.textContent = value || ""
    }

    return cell
  },

  // Private: Render a board card

  renderCard(row, properties, node, editor, getPos) {
    const card = document.createElement("div")
    card.className = "inkpen-database__card"
    card.dataset.rowId = row.id

    const nameProperty = properties.find(p => p.type === "text") || properties[0]

    const title = document.createElement("div")
    title.className = "inkpen-database__card-title"
    title.textContent = row[nameProperty?.id] || "Untitled"
    card.appendChild(title)

    // Show a few properties
    const propsContainer = document.createElement("div")
    propsContainer.className = "inkpen-database__card-props"

    properties.slice(0, 3).filter(p => p.type !== "text").forEach(prop => {
      if (row[prop.id]) {
        const propEl = document.createElement("span")
        propEl.className = "inkpen-database__card-prop"
        propEl.textContent = this.formatValue(prop, row[prop.id])
        propsContainer.appendChild(propEl)
      }
    })

    card.appendChild(propsContainer)

    return card
  },

  // Private: Format value for display

  formatValue(prop, value) {
    if (value === null || value === undefined) return ""

    switch (prop.type) {
      case "checkbox":
        return value ? "✓" : ""
      case "select":
        const option = prop.options?.find(o => o.id === value)
        return option?.label || ""
      case "date":
        return value ? new Date(value).toLocaleDateString() : ""
      case "number":
        return value.toString()
      default:
        return String(value)
    }
  },

  // Private: Show select menu

  showSelectMenu(anchor, prop, row, node, editor, getPos) {
    removeExistingDropdown()

    const menu = document.createElement("div")
    menu.className = "inkpen-database__select-menu"

    prop.options?.forEach(option => {
      const item = document.createElement("button")
      item.type = "button"
      item.className = "inkpen-database__select-item"
      if (row[prop.id] === option.id) item.classList.add("is-active")

      const tag = document.createElement("span")
      tag.className = `inkpen-database__tag inkpen-database__tag--${option.color}`
      tag.textContent = option.label
      item.appendChild(tag)

      item.addEventListener("mousedown", (e) => e.preventDefault())
      item.addEventListener("click", () => {
        this.updateRow(getPos, node, row.id, { [prop.id]: option.id }, editor)
        menu.remove()
      })

      menu.appendChild(item)
    })

    positionDropdown(menu, anchor)
    setupDropdownClose(menu, anchor)
  },

  // Private: Show add property menu

  showAddPropertyMenu(anchor, node, editor, getPos) {
    removeExistingDropdown()

    const menu = document.createElement("div")
    menu.className = "inkpen-database__prop-menu"

    Object.entries(PROPERTY_TYPES).forEach(([type, { icon, label }]) => {
      const item = document.createElement("button")
      item.type = "button"
      item.className = "inkpen-database__prop-menu-item"
      item.innerHTML = `<span>${icon}</span> ${label}`

      item.addEventListener("mousedown", (e) => e.preventDefault())
      item.addEventListener("click", () => {
        const newProp = {
          id: generateId(),
          name: label,
          type
        }

        if (type === "select") {
          newProp.options = [
            { id: "option1", label: "Option 1", color: "gray" }
          ]
        }

        this.updateNodeAttrs(getPos, node, {
          properties: [...node.attrs.properties, newProp]
        }, editor)

        menu.remove()
      })

      menu.appendChild(item)
    })

    positionDropdown(menu, anchor)
    setupDropdownClose(menu, anchor)
  },

  // Private: Update node attributes

  updateNodeAttrs(getPos, node, updates, editor) {
    if (typeof getPos !== "function") return

    const pos = getPos()
    if (pos === undefined) return

    editor.chain().command(({ tr }) => {
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...updates })
      return true
    }).run()
  },

  // Private: Update a single row

  updateRow(getPos, node, rowId, updates, editor) {
    const rows = node.attrs.rows.map(row =>
      row.id === rowId ? { ...row, ...updates } : row
    )
    this.updateNodeAttrs(getPos, node, { rows }, editor)
  }
})

// Helper: Find database node in selection

function findDatabaseNode(selection) {
  const { $from } = selection
  for (let d = $from.depth; d >= 0; d--) {
    const node = $from.node(d)
    if (node.type.name === "database") {
      return { node, pos: $from.before(d) }
    }
  }
  return null
}

// Helper: Escape HTML

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Helper: Remove existing dropdown

function removeExistingDropdown() {
  document.querySelectorAll(".inkpen-database__select-menu, .inkpen-database__prop-menu").forEach(el => el.remove())
}

// Helper: Position dropdown

function positionDropdown(dropdown, anchor) {
  const rect = anchor.getBoundingClientRect()
  dropdown.style.position = "fixed"
  dropdown.style.left = `${rect.left}px`
  dropdown.style.top = `${rect.bottom + 4}px`
  dropdown.style.zIndex = "10000"
  document.body.appendChild(dropdown)
}

// Helper: Setup dropdown close

function setupDropdownClose(dropdown, anchor) {
  const closeHandler = (e) => {
    if (!dropdown.contains(e.target) && !anchor.contains(e.target)) {
      dropdown.remove()
      document.removeEventListener("mousedown", closeHandler)
    }
  }

  setTimeout(() => document.addEventListener("mousedown", closeHandler), 0)

  const escHandler = (e) => {
    if (e.key === "Escape") {
      dropdown.remove()
      document.removeEventListener("keydown", escHandler)
    }
  }
  document.addEventListener("keydown", escHandler)
}

export { PROPERTY_TYPES, VIEW_TYPES, SELECT_COLORS }
export default Database
