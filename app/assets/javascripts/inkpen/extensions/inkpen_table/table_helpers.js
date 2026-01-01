/**
 * InkpenTable Helpers
 *
 * DOM utilities and positioning functions for the enhanced table extension.
 * Follows Fizzy patterns: named function exports, no object exports.
 *
 * @since 0.8.0
 */

// =============================================================================
// DOM Utilities
// =============================================================================

/**
 * Create an element with optional attributes and children
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag)

  for (const [key, value] of Object.entries(attrs)) {
    if (key === "className") {
      el.className = value
    } else if (key === "dataset") {
      Object.assign(el.dataset, value)
    } else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value)
    } else {
      el.setAttribute(key, value)
    }
  }

  for (const child of children) {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child))
    } else if (child) {
      el.appendChild(child)
    }
  }

  return el
}

/**
 * Wait for next animation frame
 */
export function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve))
}

/**
 * Wait for multiple animation frames
 */
export function waitFrames(count = 2) {
  return new Promise(resolve => {
    let remaining = count
    const tick = () => {
      remaining--
      if (remaining <= 0) {
        resolve()
      } else {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)
  })
}

// =============================================================================
// Positioning
// =============================================================================

/**
 * Position an element below a reference element
 */
export function positionBelow(element, reference, options = {}) {
  const { offsetX = 0, offsetY = 4 } = options
  const refRect = reference.getBoundingClientRect()
  const elRect = element.getBoundingClientRect()

  let left = refRect.left + offsetX
  let top = refRect.bottom + offsetY

  // Keep within viewport horizontally
  const viewportWidth = window.innerWidth
  if (left + elRect.width > viewportWidth - 8) {
    left = viewportWidth - elRect.width - 8
  }
  if (left < 8) {
    left = 8
  }

  // Flip above if not enough space below
  const viewportHeight = window.innerHeight
  if (top + elRect.height > viewportHeight - 8) {
    top = refRect.top - elRect.height - offsetY
  }

  element.style.position = "fixed"
  element.style.left = `${left}px`
  element.style.top = `${top}px`
}

/**
 * Position an element to the right of a reference element (for submenus)
 */
export function positionRight(element, reference, options = {}) {
  const { offsetX = 0, offsetY = 0 } = options
  const refRect = reference.getBoundingClientRect()
  const elRect = element.getBoundingClientRect()

  let left = refRect.right + offsetX
  let top = refRect.top + offsetY

  // Flip to left if not enough space on right
  const viewportWidth = window.innerWidth
  if (left + elRect.width > viewportWidth - 8) {
    left = refRect.left - elRect.width - offsetX
  }

  // Keep within viewport vertically
  const viewportHeight = window.innerHeight
  if (top + elRect.height > viewportHeight - 8) {
    top = viewportHeight - elRect.height - 8
  }
  if (top < 8) {
    top = 8
  }

  element.style.position = "fixed"
  element.style.left = `${left}px`
  element.style.top = `${top}px`
}

// =============================================================================
// Table Utilities
// =============================================================================

/**
 * Get table dimensions from a table element
 */
export function getTableDimensions(tableElement) {
  const rows = tableElement.querySelectorAll("tr")
  const rowCount = rows.length
  const colCount = rows[0]?.querySelectorAll("td, th").length || 0

  return { rowCount, colCount }
}

/**
 * Get row index from a cell element
 */
export function getRowIndex(cellElement) {
  const row = cellElement.closest("tr")
  if (!row) return -1

  const tbody = row.parentElement
  return Array.from(tbody.children).indexOf(row)
}

/**
 * Get column index from a cell element
 */
export function getColumnIndex(cellElement) {
  const row = cellElement.closest("tr")
  if (!row) return -1

  return Array.from(row.children).indexOf(cellElement)
}

/**
 * Find the table wrapper from any child element
 */
export function findTableWrapper(element) {
  return element.closest(".inkpen-table-wrapper")
}

/**
 * Find the actual table element from a wrapper
 */
export function findTableElement(wrapper) {
  return wrapper?.querySelector("table")
}

// =============================================================================
// Selection Utilities
// =============================================================================

/**
 * Check if a ProseMirror selection is a cell selection
 */
export function isCellSelection(selection) {
  return selection && selection.$anchorCell !== undefined
}

/**
 * Get selected cell positions from a CellSelection
 */
export function getSelectedCells(selection) {
  if (!isCellSelection(selection)) return []

  const cells = []
  selection.forEachCell((node, pos) => {
    cells.push({ node, pos })
  })
  return cells
}

// =============================================================================
// Event Utilities
// =============================================================================

/**
 * Stop event propagation and prevent default
 */
export function stopEvent(event) {
  event.preventDefault()
  event.stopPropagation()
}

/**
 * Create a click-outside handler
 */
export function onClickOutside(element, callback) {
  const handler = (event) => {
    if (!element.contains(event.target)) {
      callback(event)
    }
  }

  document.addEventListener("mousedown", handler)
  document.addEventListener("touchstart", handler)

  return () => {
    document.removeEventListener("mousedown", handler)
    document.removeEventListener("touchstart", handler)
  }
}

/**
 * Create an escape key handler
 */
export function onEscapeKey(callback) {
  const handler = (event) => {
    if (event.key === "Escape") {
      callback(event)
    }
  }

  document.addEventListener("keydown", handler)

  return () => {
    document.removeEventListener("keydown", handler)
  }
}
