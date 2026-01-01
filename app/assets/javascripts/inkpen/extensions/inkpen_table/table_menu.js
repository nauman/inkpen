/**
 * InkpenTable Menu
 *
 * Context menu component for row/column operations.
 * Follows Fizzy patterns: private fields with #, section comments.
 *
 * @since 0.8.0
 */

import {
  createElement,
  positionBelow,
  positionRight,
  onClickOutside,
  onEscapeKey,
  stopEvent
} from "./table_helpers.js"

import {
  CSS_CLASSES,
  ROW_MENU_ITEMS,
  COLUMN_MENU_ITEMS,
  TEXT_COLORS,
  BACKGROUND_COLORS,
  ALIGNMENT_OPTIONS
} from "./table_constants.js"

// =============================================================================
// TableMenu Class
// =============================================================================

export class TableMenu {
  #element = null
  #submenu = null
  #reference = null
  #onAction = null
  #cleanupClickOutside = null
  #cleanupEscapeKey = null
  #menuType = null

  // Lifecycle

  constructor(options = {}) {
    this.#onAction = options.onAction || (() => {})
  }

  destroy() {
    this.hide()
  }

  // Public Methods

  showRowMenu(reference, options = {}) {
    this.#menuType = "row"
    this.#show(reference, ROW_MENU_ITEMS, options)
  }

  showColumnMenu(reference, options = {}) {
    this.#menuType = "column"
    this.#show(reference, COLUMN_MENU_ITEMS, options)
  }

  hide() {
    this.#hideSubmenu()
    this.#cleanup()
  }

  isVisible() {
    return this.#element !== null
  }

  // Private

  #show(reference, items, options = {}) {
    this.hide()

    this.#reference = reference
    this.#element = this.#createMenu(items, options)

    document.body.appendChild(this.#element)
    positionBelow(this.#element, reference)

    this.#setupEventHandlers()
  }

  #createMenu(items, options = {}) {
    const menu = createElement("div", {
      className: CSS_CLASSES.menu,
      role: "menu"
    })

    for (const item of items) {
      const element = this.#createMenuItem(item, options)
      if (element) {
        menu.appendChild(element)
      }
    }

    return menu
  }

  #createMenuItem(item, options = {}) {
    if (item.type === "separator") {
      return createElement("div", {
        className: CSS_CLASSES.menuSeparator,
        role: "separator"
      })
    }

    if (item.type === "submenu") {
      return this.#createSubmenuTrigger(item, options)
    }

    const button = createElement("button", {
      className: `${CSS_CLASSES.menuItem}${item.danger ? " " + CSS_CLASSES.menuItem + "--danger" : ""}`,
      role: "menuitem",
      dataset: { action: item.id }
    }, [
      createElement("span", { className: `${CSS_CLASSES.menuItem}__icon` }, [item.icon]),
      createElement("span", { className: `${CSS_CLASSES.menuItem}__label` }, [item.label])
    ])

    button.addEventListener("click", (e) => {
      stopEvent(e)
      this.#handleAction(item.id)
    })

    return button
  }

  #createSubmenuTrigger(item, options = {}) {
    const trigger = createElement("button", {
      className: `${CSS_CLASSES.menuItem} ${CSS_CLASSES.menuItem}--has-submenu`,
      role: "menuitem",
      "aria-haspopup": "true",
      dataset: { submenu: item.id }
    }, [
      createElement("span", { className: `${CSS_CLASSES.menuItem}__icon` }, [item.icon]),
      createElement("span", { className: `${CSS_CLASSES.menuItem}__label` }, [item.label]),
      createElement("span", { className: `${CSS_CLASSES.menuItem}__arrow` }, ["›"])
    ])

    trigger.addEventListener("mouseenter", () => {
      this.#showSubmenu(item.id, trigger, options)
    })

    trigger.addEventListener("click", (e) => {
      stopEvent(e)
      this.#showSubmenu(item.id, trigger, options)
    })

    return trigger
  }

  #showSubmenu(submenuId, trigger, options = {}) {
    this.#hideSubmenu()

    let items = []
    let isColorPicker = false

    switch (submenuId) {
      case "textColor":
        items = TEXT_COLORS
        isColorPicker = true
        break
      case "backgroundColor":
        items = BACKGROUND_COLORS
        isColorPicker = true
        break
      case "alignment":
        items = ALIGNMENT_OPTIONS
        break
      default:
        return
    }

    this.#submenu = createElement("div", {
      className: `${CSS_CLASSES.menu} ${CSS_CLASSES.menuSubmenu}`,
      role: "menu"
    })

    if (isColorPicker) {
      this.#submenu.classList.add(`${CSS_CLASSES.menu}--colors`)
      const grid = createElement("div", { className: `${CSS_CLASSES.menu}__color-grid` })

      for (const color of items) {
        const swatch = createElement("button", {
          className: CSS_CLASSES.colorSwatch,
          role: "menuitem",
          title: color.label,
          dataset: { color: color.name }
        })

        if (color.value) {
          swatch.style.backgroundColor = color.value
        } else {
          swatch.classList.add(`${CSS_CLASSES.colorSwatch}--none`)
          swatch.textContent = "∅"
        }

        swatch.addEventListener("click", (e) => {
          stopEvent(e)
          this.#handleAction(submenuId, { color: color.name, value: color.value })
        })

        grid.appendChild(swatch)
      }

      this.#submenu.appendChild(grid)
    } else {
      for (const item of items) {
        const button = createElement("button", {
          className: CSS_CLASSES.menuItem,
          role: "menuitem",
          dataset: { value: item.name }
        }, [
          createElement("span", { className: `${CSS_CLASSES.menuItem}__icon` }, [item.icon]),
          createElement("span", { className: `${CSS_CLASSES.menuItem}__label` }, [item.label])
        ])

        button.addEventListener("click", (e) => {
          stopEvent(e)
          this.#handleAction(submenuId, { value: item.name })
        })

        this.#submenu.appendChild(button)
      }
    }

    document.body.appendChild(this.#submenu)
    positionRight(this.#submenu, trigger)
  }

  #hideSubmenu() {
    if (this.#submenu) {
      this.#submenu.remove()
      this.#submenu = null
    }
  }

  #handleAction(actionId, data = {}) {
    this.#onAction({
      action: actionId,
      menuType: this.#menuType,
      ...data
    })
    this.hide()
  }

  #setupEventHandlers() {
    this.#cleanupClickOutside = onClickOutside(this.#element, (e) => {
      if (this.#submenu && this.#submenu.contains(e.target)) {
        return
      }
      this.hide()
    })

    this.#cleanupEscapeKey = onEscapeKey(() => {
      this.hide()
    })
  }

  #cleanup() {
    if (this.#cleanupClickOutside) {
      this.#cleanupClickOutside()
      this.#cleanupClickOutside = null
    }

    if (this.#cleanupEscapeKey) {
      this.#cleanupEscapeKey()
      this.#cleanupEscapeKey = null
    }

    if (this.#element) {
      this.#element.remove()
      this.#element = null
    }

    this.#reference = null
    this.#menuType = null
  }
}
