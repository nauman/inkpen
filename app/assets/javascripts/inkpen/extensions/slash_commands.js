import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import Suggestion from "@tiptap/suggestion"

/**
 * Slash Commands Extension for TipTap
 *
 * Notion-style "/" command palette for rapid block insertion.
 * Type "/" to open the command menu, then type to filter.
 *
 * Features:
 * - Fuzzy search/filter as you type
 * - Keyboard navigation (arrows, enter, escape)
 * - Grouped commands (Basic, Lists, Blocks, Media, Advanced)
 * - Customizable command list
 * - Icons and descriptions
 *
 * @example
 * editor.commands.insertContent("/")  // Opens menu
 *
 * @since 0.3.0
 */

// Default command definitions with icons and metadata
const DEFAULT_COMMANDS = [
  // Basic
  { id: "paragraph", title: "Text", description: "Plain text block", icon: "¶", keywords: ["text", "p"], group: "Basic" },
  { id: "heading1", title: "Heading 1", description: "Large heading", icon: "H1", keywords: ["h1", "title", "large"], group: "Basic" },
  { id: "heading2", title: "Heading 2", description: "Medium heading", icon: "H2", keywords: ["h2", "subtitle"], group: "Basic" },
  { id: "heading3", title: "Heading 3", description: "Small heading", icon: "H3", keywords: ["h3"], group: "Basic" },

  // Lists
  { id: "bulletList", title: "Bullet List", description: "Unordered list", icon: "•", keywords: ["ul", "unordered", "bullets"], group: "Lists" },
  { id: "orderedList", title: "Numbered List", description: "Ordered list", icon: "1.", keywords: ["ol", "numbered", "numbers"], group: "Lists" },
  { id: "taskList", title: "Task List", description: "Checklist with checkboxes", icon: "☐", keywords: ["todo", "checkbox", "checklist"], group: "Lists" },

  // Blocks
  { id: "blockquote", title: "Quote", description: "Quote block", icon: "❝", keywords: ["quote", "citation", "pullquote"], group: "Blocks" },
  { id: "codeBlock", title: "Code Block", description: "Code with syntax highlighting", icon: "</>", keywords: ["code", "pre", "syntax"], group: "Blocks" },
  { id: "preformatted", title: "Plain Text", description: "Preformatted text for ASCII art", icon: "⎔", keywords: ["ascii", "pre", "monospace", "plain"], group: "Blocks" },
  { id: "divider", title: "Divider", description: "Horizontal line", icon: "—", keywords: ["hr", "line", "separator"], group: "Blocks" },

  // Media
  { id: "image", title: "Image", description: "Upload or embed an image", icon: "🖼", keywords: ["img", "picture", "photo"], group: "Media" },
  { id: "youtube", title: "YouTube", description: "Embed a YouTube video", icon: "▶", keywords: ["video", "embed", "youtube"], group: "Media" },
  { id: "table", title: "Table", description: "Insert a table", icon: "⊞", keywords: ["grid", "data", "rows", "columns"], group: "Media" },

  // Advanced
  { id: "section", title: "Section", description: "Page section with width control", icon: "▢", keywords: ["layout", "container", "wrapper"], group: "Advanced" },
  { id: "toggle", title: "Toggle", description: "Collapsible content block", icon: "▸", keywords: ["collapse", "expand", "accordion", "details"], group: "Advanced" }
]

export const SlashCommands = Extension.create({
  name: "slashCommands",

  addOptions() {
    return {
      commands: DEFAULT_COMMANDS,
      groups: ["Basic", "Lists", "Blocks", "Media", "Advanced"],
      maxSuggestions: 10,
      char: "/",
      startOfLine: false,
      allowSpaces: false,
      decorationTag: "span",
      decorationClass: "inkpen-slash-decoration",
      suggestionClass: "inkpen-slash-menu",
      itemClass: "inkpen-slash-menu__item",
      activeClass: "is-selected",
      groupClass: "inkpen-slash-menu__group",
      // Callbacks
      onOpen: null,
      onClose: null,
      onSelect: null
    }
  },

  addProseMirrorPlugins() {
    const extension = this

    return [
      Suggestion({
        editor: this.editor,
        char: this.options.char,
        startOfLine: this.options.startOfLine,
        allowSpaces: this.options.allowSpaces,
        decorationTag: this.options.decorationTag,
        decorationClass: this.options.decorationClass,

        command: ({ editor, range, props }) => {
          // Delete the "/" and query text
          editor.chain().focus().deleteRange(range).run()

          // Execute the command
          extension.executeCommand(editor, props.id)

          // Callback
          extension.options.onSelect?.(props)
        },

        items: ({ query }) => {
          return extension.filterCommands(query)
        },

        render: () => {
          let popup = null
          let selectedIndex = 0
          let items = []

          const createPopup = () => {
            const el = document.createElement("div")
            el.className = extension.options.suggestionClass
            el.setAttribute("role", "listbox")
            el.setAttribute("aria-label", "Slash commands")
            document.body.appendChild(el)
            return el
          }

          const updatePopup = (filteredItems, command) => {
            items = filteredItems
            selectedIndex = 0

            if (!popup) return
            if (items.length === 0) {
              popup.innerHTML = `<div class="${extension.options.suggestionClass}__empty">No results</div>`
              return
            }

            // Group items
            const grouped = extension.groupItems(items)

            popup.innerHTML = Object.entries(grouped).map(([group, groupItems]) => `
              <div class="${extension.options.groupClass}">
                <div class="${extension.options.groupClass}-title">${group}</div>
                ${groupItems.map((item, i) => {
                  const globalIndex = items.indexOf(item)
                  return `
                    <button type="button"
                            class="${extension.options.itemClass} ${globalIndex === selectedIndex ? extension.options.activeClass : ""}"
                            role="option"
                            aria-selected="${globalIndex === selectedIndex}"
                            data-index="${globalIndex}">
                      <span class="${extension.options.itemClass}-icon">${item.icon}</span>
                      <span class="${extension.options.itemClass}-content">
                        <span class="${extension.options.itemClass}-title">${item.title}</span>
                        <span class="${extension.options.itemClass}-description">${item.description || ""}</span>
                      </span>
                    </button>
                  `
                }).join("")}
              </div>
            `).join("")

            // Add click handlers
            popup.querySelectorAll(`.${extension.options.itemClass}`).forEach(button => {
              button.addEventListener("click", () => {
                const index = parseInt(button.dataset.index)
                command(items[index])
              })
            })
          }

          const positionPopup = (clientRect) => {
            if (!popup || !clientRect) return

            const rect = clientRect()
            if (!rect) return

            // Position below the cursor
            popup.style.position = "fixed"
            popup.style.left = `${rect.left}px`
            popup.style.top = `${rect.bottom + 8}px`
            popup.style.zIndex = "10000"

            // Ensure popup stays within viewport
            const popupRect = popup.getBoundingClientRect()
            const viewportHeight = window.innerHeight
            const viewportWidth = window.innerWidth

            // Flip to top if not enough space below
            if (popupRect.bottom > viewportHeight) {
              popup.style.top = `${rect.top - popupRect.height - 8}px`
            }

            // Keep within right edge
            if (popupRect.right > viewportWidth) {
              popup.style.left = `${viewportWidth - popupRect.width - 16}px`
            }
          }

          const updateSelection = (newIndex) => {
            selectedIndex = newIndex

            popup?.querySelectorAll(`.${extension.options.itemClass}`).forEach((button, i) => {
              const isSelected = i === selectedIndex
              button.classList.toggle(extension.options.activeClass, isSelected)
              button.setAttribute("aria-selected", isSelected.toString())
            })
          }

          return {
            onStart: (props) => {
              popup = createPopup()
              updatePopup(props.items, props.command)
              positionPopup(props.clientRect)
              extension.options.onOpen?.()
            },

            onUpdate: (props) => {
              updatePopup(props.items, props.command)
              positionPopup(props.clientRect)
            },

            onKeyDown: (props) => {
              const { event } = props

              if (event.key === "ArrowDown") {
                event.preventDefault()
                updateSelection((selectedIndex + 1) % items.length)
                return true
              }

              if (event.key === "ArrowUp") {
                event.preventDefault()
                updateSelection((selectedIndex - 1 + items.length) % items.length)
                return true
              }

              if (event.key === "Enter") {
                event.preventDefault()
                if (items[selectedIndex]) {
                  props.command(items[selectedIndex])
                }
                return true
              }

              if (event.key === "Escape") {
                event.preventDefault()
                return true
              }

              return false
            },

            onExit: () => {
              popup?.remove()
              popup = null
              extension.options.onClose?.()
            }
          }
        }
      })
    ]
  },

  // Filter commands based on query
  filterCommands(query) {
    const commands = this.options.commands
    const maxSuggestions = this.options.maxSuggestions

    if (!query) {
      return commands.slice(0, maxSuggestions)
    }

    const q = query.toLowerCase()

    return commands
      .filter(cmd => {
        const titleMatch = cmd.title.toLowerCase().includes(q)
        const keywordMatch = cmd.keywords?.some(k => k.toLowerCase().includes(q))
        const descMatch = cmd.description?.toLowerCase().includes(q)
        return titleMatch || keywordMatch || descMatch
      })
      .slice(0, maxSuggestions)
  },

  // Group items by their group property
  groupItems(items) {
    const groups = this.options.groups
    const grouped = {}

    // Initialize groups in order
    groups.forEach(group => {
      grouped[group] = []
    })

    // Add items to their groups
    items.forEach(item => {
      const group = item.group || "Other"
      if (!grouped[group]) {
        grouped[group] = []
      }
      grouped[group].push(item)
    })

    // Remove empty groups
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key]
      }
    })

    return grouped
  },

  // Execute a command by ID
  executeCommand(editor, commandId) {
    const chain = editor.chain().focus()

    switch (commandId) {
      // Basic
      case "paragraph":
        chain.setParagraph().run()
        break
      case "heading1":
        chain.toggleHeading({ level: 1 }).run()
        break
      case "heading2":
        chain.toggleHeading({ level: 2 }).run()
        break
      case "heading3":
        chain.toggleHeading({ level: 3 }).run()
        break

      // Lists
      case "bulletList":
        chain.toggleBulletList().run()
        break
      case "orderedList":
        chain.toggleOrderedList().run()
        break
      case "taskList":
        chain.toggleTaskList().run()
        break

      // Blocks
      case "blockquote":
        chain.toggleBlockquote().run()
        break
      case "codeBlock":
        chain.toggleCodeBlock().run()
        break
      case "preformatted":
        if (editor.commands.togglePreformatted) {
          chain.togglePreformatted().run()
        }
        break
      case "divider":
        chain.setHorizontalRule().run()
        break

      // Media
      case "image":
        // Prompt for URL
        const imageUrl = prompt("Enter image URL:")
        if (imageUrl) {
          chain.setImage({ src: imageUrl }).run()
        }
        break
      case "youtube":
        // Prompt for URL
        const videoUrl = prompt("Enter YouTube URL:")
        if (videoUrl) {
          chain.setYoutubeVideo({ src: videoUrl }).run()
        }
        break
      case "table":
        chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        break

      // Advanced
      case "section":
        if (editor.commands.insertSection) {
          chain.insertSection().run()
        }
        break
      case "toggle":
        if (editor.commands.insertToggle) {
          chain.insertToggle().run()
        }
        break

      default:
        console.warn(`Unknown slash command: ${commandId}`)
    }
  }
})

export default SlashCommands
