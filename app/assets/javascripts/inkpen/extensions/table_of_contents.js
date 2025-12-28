import { Node } from "@tiptap/core"

/**
 * Table of Contents Extension for TipTap
 *
 * Auto-generated navigation from document headings.
 *
 * Features:
 * - Auto-detect headings (H1-H6)
 * - Clickable links with smooth scroll
 * - Configurable max depth
 * - Numbered, bulleted, or plain style
 * - Collapsible sections
 * - Sticky positioning option
 * - Real-time updates as document changes
 *
 * @example
 * editor.commands.insertTableOfContents()
 * editor.commands.setTocMaxDepth(3)
 * editor.commands.setTocStyle('numbered')
 *
 * @since 0.6.0
 */

// TOC style options
const TOC_STYLES = {
  numbered: { label: "Numbered", description: "1. 2. 3." },
  bulleted: { label: "Bulleted", description: "• • •" },
  plain: { label: "Plain", description: "No markers" }
}

export const TableOfContents = Node.create({
  name: "tableOfContents",

  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      defaultMaxDepth: 3,
      defaultStyle: "numbered",
      defaultTitle: "Table of Contents",
      scrollOffset: 100,
      HTMLAttributes: {
        class: "inkpen-toc"
      }
    }
  },

  addAttributes() {
    return {
      maxDepth: {
        default: this.options.defaultMaxDepth,
        parseHTML: element => parseInt(element.getAttribute("data-max-depth")) || this.options.defaultMaxDepth,
        renderHTML: attributes => ({ "data-max-depth": attributes.maxDepth })
      },
      style: {
        default: this.options.defaultStyle,
        parseHTML: element => element.getAttribute("data-style") || this.options.defaultStyle,
        renderHTML: attributes => ({ "data-style": attributes.style })
      },
      title: {
        default: this.options.defaultTitle,
        parseHTML: element => element.getAttribute("data-title") || this.options.defaultTitle,
        renderHTML: attributes => ({ "data-title": attributes.title })
      },
      collapsible: {
        default: false,
        parseHTML: element => element.hasAttribute("data-collapsible"),
        renderHTML: attributes => attributes.collapsible ? { "data-collapsible": "" } : {}
      },
      sticky: {
        default: false,
        parseHTML: element => element.hasAttribute("data-sticky"),
        renderHTML: attributes => attributes.sticky ? { "data-sticky": "" } : {}
      }
    }
  },

  parseHTML() {
    return [
      { tag: "nav.inkpen-toc" },
      { tag: "div.inkpen-toc" },
      { tag: "[data-toc]" }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["nav", { ...this.options.HTMLAttributes, ...HTMLAttributes, "data-toc": "" }, 0]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const extension = this

      // Main container
      const dom = document.createElement("nav")
      dom.className = "inkpen-toc"
      if (node.attrs.sticky) dom.classList.add("inkpen-toc--sticky")
      if (node.attrs.collapsible) dom.classList.add("inkpen-toc--collapsible")

      // State
      let isCollapsed = false

      // Render function
      const render = () => {
        const headings = extension.getHeadings(editor, node.attrs.maxDepth)
        dom.innerHTML = extension.renderTOC(headings, node.attrs, editor.isEditable)
        extension.attachEventHandlers(dom, editor, getPos, node, () => isCollapsed, (val) => { isCollapsed = val })
      }

      // Initial render
      render()

      // Update on document changes
      const updateHandler = () => render()
      editor.on("update", updateHandler)

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "tableOfContents") return false

          // Update classes
          dom.classList.toggle("inkpen-toc--sticky", updatedNode.attrs.sticky)
          dom.classList.toggle("inkpen-toc--collapsible", updatedNode.attrs.collapsible)

          // Re-render with new attributes
          const headings = extension.getHeadings(editor, updatedNode.attrs.maxDepth)
          dom.innerHTML = extension.renderTOC(headings, updatedNode.attrs, editor.isEditable)
          extension.attachEventHandlers(dom, editor, getPos, updatedNode, () => isCollapsed, (val) => { isCollapsed = val })

          return true
        },
        destroy: () => {
          editor.off("update", updateHandler)
        }
      }
    }
  },

  addCommands() {
    return {
      insertTableOfContents: (options = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            maxDepth: options.maxDepth || this.options.defaultMaxDepth,
            style: options.style || this.options.defaultStyle,
            title: options.title || this.options.defaultTitle,
            collapsible: options.collapsible || false,
            sticky: options.sticky || false
          }
        })
      },

      setTocMaxDepth: (maxDepth) => ({ commands }) => {
        return commands.updateAttributes(this.name, { maxDepth })
      },

      setTocStyle: (style) => ({ commands }) => {
        return commands.updateAttributes(this.name, { style })
      },

      setTocTitle: (title) => ({ commands }) => {
        return commands.updateAttributes(this.name, { title })
      },

      toggleTocCollapsible: () => ({ commands, state }) => {
        const { selection } = state
        const node = findTocNode(selection)
        if (!node) return false
        return commands.updateAttributes(this.name, { collapsible: !node.attrs.collapsible })
      },

      toggleTocSticky: () => ({ commands, state }) => {
        const { selection } = state
        const node = findTocNode(selection)
        if (!node) return false
        return commands.updateAttributes(this.name, { sticky: !node.attrs.sticky })
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-t": () => this.editor.commands.insertTableOfContents()
    }
  },

  // Private: Get headings from document

  getHeadings(editor, maxDepth) {
    const headings = []
    let index = 0

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "heading" && node.attrs.level <= maxDepth) {
        const text = node.textContent.trim()
        if (text) {
          headings.push({
            id: `toc-heading-${index++}`,
            level: node.attrs.level,
            text,
            pos
          })
        }
      }
    })

    return headings
  },

  // Private: Render TOC HTML

  renderTOC(headings, attrs, isEditable) {
    const { title, style, collapsible } = attrs

    // Header
    let html = `
      <div class="inkpen-toc__header">
        <span class="inkpen-toc__title">${escapeHtml(title)}</span>
        ${collapsible ? '<button type="button" class="inkpen-toc__toggle" aria-label="Toggle">▼</button>' : ''}
        ${isEditable ? '<button type="button" class="inkpen-toc__settings" aria-label="Settings">⚙</button>' : ''}
      </div>
    `

    // Empty state
    if (headings.length === 0) {
      html += `
        <div class="inkpen-toc__empty">
          No headings found. Add headings to generate a table of contents.
        </div>
      `
      return html
    }

    // Navigation list
    const listTag = style === "numbered" ? "ol" : "ul"

    html += `
      <nav class="inkpen-toc__nav">
        <${listTag} class="inkpen-toc__list inkpen-toc__list--${style}">
          ${headings.map(h => `
            <li class="inkpen-toc__item inkpen-toc__item--level-${h.level}" style="--toc-indent: ${(h.level - 1) * 1}rem">
              <a href="#${h.id}" class="inkpen-toc__link" data-pos="${h.pos}">
                ${escapeHtml(h.text)}
              </a>
            </li>
          `).join("")}
        </${listTag}>
      </nav>
    `

    return html
  },

  // Private: Attach event handlers

  attachEventHandlers(dom, editor, getPos, node, getCollapsed, setCollapsed) {
    const extension = this

    // Toggle collapse
    const toggleBtn = dom.querySelector(".inkpen-toc__toggle")
    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault()
        const newCollapsed = !getCollapsed()
        setCollapsed(newCollapsed)
        dom.classList.toggle("is-collapsed", newCollapsed)
        toggleBtn.textContent = newCollapsed ? "▶" : "▼"
      })
    }

    // Settings button
    const settingsBtn = dom.querySelector(".inkpen-toc__settings")
    if (settingsBtn) {
      settingsBtn.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        extension.showSettingsDropdown(settingsBtn, node, editor, getPos)
      })
    }

    // Heading links
    dom.querySelectorAll(".inkpen-toc__link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const pos = parseInt(link.dataset.pos)

        // Scroll to heading
        const coords = editor.view.coordsAtPos(pos)
        const scrollTop = window.pageYOffset + coords.top - extension.options.scrollOffset

        window.scrollTo({
          top: scrollTop,
          behavior: "smooth"
        })

        // Focus editor at heading position
        editor.chain().focus().setTextSelection(pos + 1).run()
      })
    })
  },

  // Private: Show settings dropdown

  showSettingsDropdown(anchor, node, editor, getPos) {
    removeExistingDropdown()

    const dropdown = document.createElement("div")
    dropdown.className = "inkpen-toc__dropdown"

    // Max depth options
    const depthSection = document.createElement("div")
    depthSection.className = "inkpen-toc__dropdown-section"
    depthSection.innerHTML = `<div class="inkpen-toc__dropdown-label">Max Depth</div>`

    const depthGroup = document.createElement("div")
    depthGroup.className = "inkpen-toc__dropdown-row"

    for (let d = 1; d <= 6; d++) {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "inkpen-toc__dropdown-btn"
      if (node.attrs.maxDepth === d) btn.classList.add("is-active")
      btn.textContent = `H${d}`

      btn.addEventListener("mousedown", (e) => e.preventDefault())
      btn.addEventListener("click", () => {
        editor.chain().focus().setTocMaxDepth(d).run()
        dropdown.remove()
      })

      depthGroup.appendChild(btn)
    }

    depthSection.appendChild(depthGroup)
    dropdown.appendChild(depthSection)

    // Style options
    const styleSection = document.createElement("div")
    styleSection.className = "inkpen-toc__dropdown-section"
    styleSection.innerHTML = `<div class="inkpen-toc__dropdown-label">Style</div>`

    Object.entries(TOC_STYLES).forEach(([key, { label }]) => {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "inkpen-toc__dropdown-item"
      if (node.attrs.style === key) btn.classList.add("is-active")
      btn.textContent = label

      btn.addEventListener("mousedown", (e) => e.preventDefault())
      btn.addEventListener("click", () => {
        editor.chain().focus().setTocStyle(key).run()
        dropdown.remove()
      })

      styleSection.appendChild(btn)
    })

    dropdown.appendChild(styleSection)

    // Toggle options
    const toggleSection = document.createElement("div")
    toggleSection.className = "inkpen-toc__dropdown-section"

    const stickyBtn = document.createElement("button")
    stickyBtn.type = "button"
    stickyBtn.className = "inkpen-toc__dropdown-item"
    if (node.attrs.sticky) stickyBtn.classList.add("is-active")
    stickyBtn.textContent = "Sticky"

    stickyBtn.addEventListener("mousedown", (e) => e.preventDefault())
    stickyBtn.addEventListener("click", () => {
      if (typeof getPos === "function") {
        const pos = getPos()
        if (pos !== undefined) {
          editor.chain().command(({ tr }) => {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, sticky: !node.attrs.sticky })
            return true
          }).run()
        }
      }
      dropdown.remove()
    })

    toggleSection.appendChild(stickyBtn)

    const collapsibleBtn = document.createElement("button")
    collapsibleBtn.type = "button"
    collapsibleBtn.className = "inkpen-toc__dropdown-item"
    if (node.attrs.collapsible) collapsibleBtn.classList.add("is-active")
    collapsibleBtn.textContent = "Collapsible"

    collapsibleBtn.addEventListener("mousedown", (e) => e.preventDefault())
    collapsibleBtn.addEventListener("click", () => {
      if (typeof getPos === "function") {
        const pos = getPos()
        if (pos !== undefined) {
          editor.chain().command(({ tr }) => {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, collapsible: !node.attrs.collapsible })
            return true
          }).run()
        }
      }
      dropdown.remove()
    })

    toggleSection.appendChild(collapsibleBtn)
    dropdown.appendChild(toggleSection)

    // Position dropdown
    const rect = anchor.getBoundingClientRect()
    dropdown.style.position = "fixed"
    dropdown.style.left = `${rect.right - 160}px`
    dropdown.style.top = `${rect.bottom + 4}px`
    dropdown.style.zIndex = "10000"
    document.body.appendChild(dropdown)

    // Close handlers
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
})

// Helper: Find TOC node in selection

function findTocNode(selection) {
  const { $from } = selection
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d)
    if (node.type.name === "tableOfContents") {
      return node
    }
  }
  return null
}

// Helper: Remove existing dropdown

function removeExistingDropdown() {
  const existing = document.querySelector(".inkpen-toc__dropdown")
  if (existing) existing.remove()
}

// Helper: Escape HTML

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

export { TOC_STYLES }
export default TableOfContents
