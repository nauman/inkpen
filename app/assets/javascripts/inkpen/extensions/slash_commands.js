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

  // Filter commands based on query and availability
  filterCommands(query) {
    const commands = this.options.commands
    const maxSuggestions = this.options.maxSuggestions
    const editor = this.editor

    // Filter out commands that require unavailable editor commands
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
          // Use enhanced image if available, otherwise fallback to basic
          if (editor.commands.setEnhancedImage) {
            chain.setEnhancedImage({ src: imageUrl }).run()
          } else {
            chain.setImage({ src: imageUrl }).run()
          }
        }
        break
      case "file":
        // Create file input and trigger click
        if (editor.commands.uploadFile) {
          const fileInput = document.createElement("input")
          fileInput.type = "file"
          fileInput.accept = "*/*"
          fileInput.onchange = (e) => {
            const file = e.target.files?.[0]
            if (file) {
              editor.commands.uploadFile(file)
            }
          }
          fileInput.click()
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
      case "documentSection":
        if (editor.commands.insertDocumentSection) {
          chain.insertDocumentSection().run()
        }
        break
      case "toggle":
        if (editor.commands.insertToggle) {
          chain.insertToggle().run()
        }
        break
      case "columns2":
        if (editor.commands.insertColumns) {
          chain.insertColumns({ count: 2 }).run()
        }
        break
      case "columns3":
        if (editor.commands.insertColumns) {
          chain.insertColumns({ count: 3 }).run()
        }
        break
      case "calloutInfo":
        if (editor.commands.insertCallout) {
          chain.insertCallout({ type: "info" }).run()
        }
        break
      case "calloutWarning":
        if (editor.commands.insertCallout) {
          chain.insertCallout({ type: "warning" }).run()
        }
        break
      case "calloutTip":
        if (editor.commands.insertCallout) {
          chain.insertCallout({ type: "tip" }).run()
        }
        break

      // Embeds
      case "embed":
        if (editor.commands.insertEmbed) {
          const embedUrl = prompt("Enter URL to embed:")
          if (embedUrl) {
            editor.commands.insertEmbed(embedUrl)
          }
        }
        break
      case "embedTwitter":
        if (editor.commands.insertEmbed) {
          const twitterUrl = prompt("Enter Twitter/X URL:")
          if (twitterUrl) {
            editor.commands.insertEmbed(twitterUrl)
          }
        }
        break
      case "embedInstagram":
        if (editor.commands.insertEmbed) {
          const igUrl = prompt("Enter Instagram URL:")
          if (igUrl) {
            editor.commands.insertEmbed(igUrl)
          }
        }
        break
      case "embedFigma":
        if (editor.commands.insertEmbed) {
          const figmaUrl = prompt("Enter Figma URL:")
          if (figmaUrl) {
            editor.commands.insertEmbed(figmaUrl)
          }
        }
        break
      case "embedLoom":
        if (editor.commands.insertEmbed) {
          const loomUrl = prompt("Enter Loom URL:")
          if (loomUrl) {
            editor.commands.insertEmbed(loomUrl)
          }
        }
        break
      case "embedCodePen":
        if (editor.commands.insertEmbed) {
          const codepenUrl = prompt("Enter CodePen URL:")
          if (codepenUrl) {
            editor.commands.insertEmbed(codepenUrl)
          }
        }
        break
      case "embedSpotify":
        if (editor.commands.insertEmbed) {
          const spotifyUrl = prompt("Enter Spotify URL:")
          if (spotifyUrl) {
            editor.commands.insertEmbed(spotifyUrl)
          }
        }
        break

      // Data (v0.6.0)
      case "footnote":
        if (editor.commands.insertFootnoteReference) {
          chain.insertFootnoteReference().run()
        }
        break
      case "toc":
        if (editor.commands.insertTableOfContents) {
          chain.insertTableOfContents().run()
        }
        break
      case "database":
        if (editor.commands.insertDatabase) {
          chain.insertDatabase({ view: "table" }).run()
        }
        break
      case "databaseBoard":
        if (editor.commands.insertDatabase) {
          chain.insertDatabase({ view: "board" }).run()
        }
        break
      case "databaseGallery":
        if (editor.commands.insertDatabase) {
          chain.insertDatabase({ view: "gallery" }).run()
        }
        break

      // Export (v0.7.0)
      case "exportMarkdown":
        if (editor.commands.downloadMarkdown) {
          editor.commands.downloadMarkdown()
        }
        break
      case "exportHTML":
        if (editor.commands.downloadHTML) {
          editor.commands.downloadHTML()
        }
        break
      case "exportPDF":
        if (editor.commands.downloadPDF) {
          editor.commands.downloadPDF()
        }
        break
      case "copyMarkdown":
        if (editor.commands.copyMarkdown) {
          editor.commands.copyMarkdown()
        }
        break
      case "copyHTML":
        if (editor.commands.copyHTML) {
          editor.commands.copyHTML()
        }
        break

      default:
        console.warn(`Unknown slash command: ${commandId}`)
    }
  }
})

export default SlashCommands
