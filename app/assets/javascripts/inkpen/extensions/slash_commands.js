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
  { id: "file", title: "File", description: "Upload a file attachment", icon: "📎", keywords: ["upload", "attachment", "document", "pdf"], group: "Media" },
  { id: "youtube", title: "YouTube", description: "Embed a YouTube video", icon: "▶", keywords: ["video", "embed", "youtube"], group: "Media" },
  { id: "table", title: "Table", description: "Insert a table", icon: "⊞", keywords: ["grid", "data", "rows", "columns"], group: "Media" },

  // Advanced
  { id: "section", title: "Section", description: "Page section with width control", icon: "▢", keywords: ["layout", "container", "wrapper"], group: "Advanced" },
  { id: "documentSection", title: "Document Section", description: "Collapsible section with title", icon: "📑", keywords: ["section", "group", "collapse", "outline", "heading"], group: "Advanced" },
  { id: "toggle", title: "Toggle", description: "Collapsible content block", icon: "▸", keywords: ["collapse", "expand", "accordion", "details"], group: "Advanced" },
  { id: "columns2", title: "2 Columns", description: "Side-by-side columns", icon: "▥", keywords: ["layout", "grid", "split", "two"], group: "Advanced" },
  { id: "columns3", title: "3 Columns", description: "Three column layout", icon: "▦", keywords: ["layout", "grid", "three"], group: "Advanced" },
  { id: "calloutInfo", title: "Info Callout", description: "Informational note", icon: "ℹ️", keywords: ["callout", "note", "info", "alert"], group: "Advanced" },
  { id: "calloutWarning", title: "Warning Callout", description: "Warning or caution", icon: "⚠️", keywords: ["callout", "warning", "caution", "alert"], group: "Advanced" },
  { id: "calloutTip", title: "Tip Callout", description: "Helpful tip", icon: "💡", keywords: ["callout", "tip", "hint", "idea"], group: "Advanced" },

  // Data (v0.6.0)
  { id: "footnote", title: "Footnote", description: "Add a footnote reference", icon: "¹", keywords: ["footnote", "reference", "citation", "note", "academic"], group: "Data" },
  { id: "toc", title: "Table of Contents", description: "Auto-generated navigation", icon: "📑", keywords: ["toc", "contents", "navigation", "index", "outline"], group: "Data" },
  { id: "database", title: "Database", description: "Inline database with views", icon: "🗃️", keywords: ["database", "notion", "table", "kanban", "board"], group: "Data" },
  { id: "databaseBoard", title: "Kanban Board", description: "Database with board view", icon: "▣", keywords: ["kanban", "board", "trello", "tasks"], group: "Data" },
  { id: "databaseGallery", title: "Gallery", description: "Database with gallery view", icon: "⊟", keywords: ["gallery", "cards", "grid"], group: "Data" },

  // Embeds
  { id: "embed", title: "Embed", description: "Embed from URL", icon: "🔗", keywords: ["embed", "url", "link", "website"], group: "Media" },
  { id: "embedTwitter", title: "Twitter/X", description: "Embed a tweet", icon: "𝕏", keywords: ["twitter", "x", "tweet", "social"], group: "Media" },
  { id: "embedInstagram", title: "Instagram", description: "Embed Instagram post", icon: "📷", keywords: ["instagram", "ig", "social", "photo"], group: "Media" },
  { id: "embedFigma", title: "Figma", description: "Embed Figma design", icon: "◈", keywords: ["figma", "design", "prototype"], group: "Media" },
  { id: "embedLoom", title: "Loom", description: "Embed Loom video", icon: "🎥", keywords: ["loom", "video", "recording"], group: "Media" },
  { id: "embedCodePen", title: "CodePen", description: "Embed CodePen", icon: "⌨", keywords: ["codepen", "code", "demo"], group: "Media" },
  { id: "embedSpotify", title: "Spotify", description: "Embed Spotify track", icon: "🎵", keywords: ["spotify", "music", "audio"], group: "Media" },

  // Export (v0.7.0) - requires export_commands extension
  { id: "exportMarkdown", title: "Export Markdown", description: "Download as .md file", icon: "↓", keywords: ["export", "download", "markdown", "md"], group: "Export", requiresCommand: "downloadMarkdown" },
  { id: "exportHTML", title: "Export HTML", description: "Download as .html file", icon: "↓", keywords: ["export", "download", "html"], group: "Export", requiresCommand: "downloadHTML" },
  { id: "exportPDF", title: "Export PDF", description: "Download as .pdf file", icon: "↓", keywords: ["export", "download", "pdf", "print"], group: "Export", requiresCommand: "downloadPDF" },
  { id: "copyMarkdown", title: "Copy as Markdown", description: "Copy content to clipboard", icon: "📋", keywords: ["copy", "clipboard", "markdown"], group: "Export", requiresCommand: "copyMarkdown" },
  { id: "copyHTML", title: "Copy as HTML", description: "Copy HTML to clipboard", icon: "📋", keywords: ["copy", "clipboard", "html"], group: "Export", requiresCommand: "copyHTML" }
]

export const SlashCommands = Extension.create({
  name: "slashCommands",

  addOptions() {
    return {
      commands: DEFAULT_COMMANDS,
      groups: ["Basic", "Lists", "Blocks", "Media", "Data", "Advanced", "Export"],
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
    const options = this.options
    const editor = this.editor

    // Normalize commands: support both {id, title} and {name, label} formats
    const normalizeCommand = (cmd) => ({
      ...cmd,
      id: cmd.id || cmd.name,
      title: cmd.title || cmd.label
    })

    // Filter commands based on query and availability
    const filterCommands = (query) => {
      const commands = options.commands.map(normalizeCommand)
      const maxSuggestions = options.maxSuggestions

      const availableCommands = commands.filter(cmd => {
        if (cmd.requiresCommand) {
          return editor.commands[cmd.requiresCommand] !== undefined
        }
        return true
      })

      if (!query) {
        return availableCommands.slice(0, maxSuggestions)
      }

      const q = query.toLowerCase()

      return availableCommands
        .filter(cmd => {
          const titleMatch = cmd.title?.toLowerCase().includes(q)
          const keywordMatch = cmd.keywords?.some(k => k.toLowerCase().includes(q))
          const descMatch = cmd.description?.toLowerCase().includes(q)
          return titleMatch || keywordMatch || descMatch
        })
        .slice(0, maxSuggestions)
    }

    // Group items by their group property
    const groupItems = (items) => {
      const groups = options.groups
      const grouped = {}

      groups.forEach(group => { grouped[group] = [] })

      items.forEach(item => {
        const group = item.group || "Other"
        if (!grouped[group]) grouped[group] = []
        grouped[group].push(item)
      })

      Object.keys(grouped).forEach(key => {
        if (grouped[key].length === 0) delete grouped[key]
      })

      return grouped
    }

    // Execute a command by ID
    const executeCommand = (commandId) => {
      const chain = editor.chain().focus()

      switch (commandId) {
        case "paragraph": chain.setParagraph().run(); break
        case "heading1": chain.toggleHeading({ level: 1 }).run(); break
        case "heading2": chain.toggleHeading({ level: 2 }).run(); break
        case "heading3": chain.toggleHeading({ level: 3 }).run(); break
        case "bulletList": chain.toggleBulletList().run(); break
        case "orderedList": chain.toggleOrderedList().run(); break
        case "taskList": chain.toggleTaskList().run(); break
        case "blockquote": chain.toggleBlockquote().run(); break
        case "codeBlock": chain.toggleCodeBlock().run(); break
        case "preformatted":
          if (editor.commands.togglePreformatted) chain.togglePreformatted().run()
          break
        case "divider": case "horizontalRule":
          chain.setHorizontalRule().run(); break
        case "image": {
          const url = prompt("Enter image URL:")
          if (url) {
            if (editor.commands.setEnhancedImage) chain.setEnhancedImage({ src: url }).run()
            else chain.setImage({ src: url }).run()
          }
          break
        }
        case "file":
          if (editor.commands.uploadFile) {
            const input = document.createElement("input")
            input.type = "file"; input.accept = "*/*"
            input.onchange = (e) => { if (e.target.files?.[0]) editor.commands.uploadFile(e.target.files[0]) }
            input.click()
          }
          break
        case "youtube": {
          const url = prompt("Enter YouTube URL:")
          if (url) chain.setYoutubeVideo({ src: url }).run()
          break
        }
        case "table": chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); break
        case "section":
          if (editor.commands.insertSection) chain.insertSection().run()
          break
        case "documentSection":
          if (editor.commands.insertDocumentSection) chain.insertDocumentSection().run()
          break
        case "toggle":
          if (editor.commands.insertToggle) chain.insertToggle().run()
          break
        case "columns2":
          if (editor.commands.insertColumns) chain.insertColumns({ count: 2 }).run()
          break
        case "columns3":
          if (editor.commands.insertColumns) chain.insertColumns({ count: 3 }).run()
          break
        case "calloutInfo":
          if (editor.commands.insertCallout) chain.insertCallout({ type: "info" }).run()
          break
        case "calloutWarning":
          if (editor.commands.insertCallout) chain.insertCallout({ type: "warning" }).run()
          break
        case "calloutTip":
          if (editor.commands.insertCallout) chain.insertCallout({ type: "tip" }).run()
          break
        case "embed": case "embedTwitter": case "embedInstagram":
        case "embedFigma": case "embedLoom": case "embedCodePen": case "embedSpotify": {
          if (editor.commands.insertEmbed) {
            const url = prompt("Enter URL to embed:")
            if (url) editor.commands.insertEmbed(url)
          }
          break
        }
        case "footnote":
          if (editor.commands.insertFootnoteReference) chain.insertFootnoteReference().run()
          break
        case "toc":
          if (editor.commands.insertTableOfContents) chain.insertTableOfContents().run()
          break
        case "database":
          if (editor.commands.insertDatabase) chain.insertDatabase({ view: "table" }).run()
          break
        case "databaseBoard":
          if (editor.commands.insertDatabase) chain.insertDatabase({ view: "board" }).run()
          break
        case "databaseGallery":
          if (editor.commands.insertDatabase) chain.insertDatabase({ view: "gallery" }).run()
          break
        case "exportMarkdown": editor.commands.downloadMarkdown?.(); break
        case "exportHTML": editor.commands.downloadHTML?.(); break
        case "exportPDF": editor.commands.downloadPDF?.(); break
        case "copyMarkdown": editor.commands.copyMarkdown?.(); break
        case "copyHTML": editor.commands.copyHTML?.(); break
        default: {
          // Dispatch custom event for app-level handling (e.g., embed commands)
          const event = new CustomEvent("inkpen:slash-command", {
            detail: { commandId },
            bubbles: true,
            cancelable: true
          })
          editor.view.dom.dispatchEvent(event)
          break
        }
      }
    }

    return [
      Suggestion({
        editor: this.editor,
        char: options.char,
        startOfLine: options.startOfLine,
        allowSpaces: options.allowSpaces,
        decorationTag: options.decorationTag,
        decorationClass: options.decorationClass,

        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).run()
          executeCommand(props.id)
          options.onSelect?.(props)
        },

        items: ({ query }) => {
          return filterCommands(query)
        },

        render: () => {
          let popup = null
          let selectedIndex = 0
          let items = []

          const createPopup = () => {
            const el = document.createElement("div")
            el.className = options.suggestionClass
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
              popup.innerHTML = `<div class="${options.suggestionClass}__empty">No results</div>`
              return
            }

            const grouped = groupItems(items)

            popup.innerHTML = Object.entries(grouped).map(([group, groupItems]) => `
              <div class="${options.groupClass}">
                <div class="${options.groupClass}-title">${group}</div>
                ${groupItems.map((item, i) => {
                  const globalIndex = items.indexOf(item)
                  return `
                    <button type="button"
                            class="${options.itemClass} ${globalIndex === selectedIndex ? options.activeClass : ""}"
                            role="option"
                            aria-selected="${globalIndex === selectedIndex}"
                            data-index="${globalIndex}">
                      <span class="${options.itemClass}-icon">${item.icon || ""}</span>
                      <span class="${options.itemClass}-content">
                        <span class="${options.itemClass}-title">${item.title || ""}</span>
                        <span class="${options.itemClass}-description">${item.description || ""}</span>
                      </span>
                    </button>
                  `
                }).join("")}
              </div>
            `).join("")

            popup.querySelectorAll(`.${options.itemClass}`).forEach(button => {
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

            popup.style.position = "fixed"
            popup.style.left = `${rect.left}px`
            popup.style.top = `${rect.bottom + 8}px`
            popup.style.zIndex = "10000"

            const popupRect = popup.getBoundingClientRect()
            const viewportHeight = window.innerHeight
            const viewportWidth = window.innerWidth

            if (popupRect.bottom > viewportHeight) {
              popup.style.top = `${rect.top - popupRect.height - 8}px`
            }

            if (popupRect.right > viewportWidth) {
              popup.style.left = `${viewportWidth - popupRect.width - 16}px`
            }
          }

          const updateSelection = (newIndex) => {
            selectedIndex = newIndex

            popup?.querySelectorAll(`.${options.itemClass}`).forEach((button, i) => {
              const isSelected = i === selectedIndex
              button.classList.toggle(options.activeClass, isSelected)
              button.setAttribute("aria-selected", isSelected.toString())
            })
          }

          return {
            onStart: (props) => {
              popup = createPopup()
              updatePopup(props.items, props.command)
              positionPopup(props.clientRect)
              options.onOpen?.()
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
              options.onClose?.()
            }
          }
        }
      })
    ]
  }
})

export default SlashCommands
