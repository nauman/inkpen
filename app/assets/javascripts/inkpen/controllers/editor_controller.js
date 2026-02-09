import { Controller } from "@hotwired/stimulus"

// ============================================
// LAZY LOADING
// ============================================
// All TipTap/ProseMirror modules are lazy-loaded when the editor connects.
// This prevents 50+ CDN requests on pages that don't use the editor.
// The modules are cached after first load for subsequent editor instances.

let cachedModules = null

async function loadEditorModules() {
  if (cachedModules) return cachedModules

  // Load all core modules in parallel
  const [
    tiptapCore,
    tiptapPmModel,
    documentExt,
    starterKit,
    linkExt,
    placeholderExt,
    imageExt,
    tableExt,
    tableRowExt,
    tableCellExt,
    tableHeaderExt,
    taskListExt,
    taskItemExt,
    mentionExt,
    codeBlockLowlightExt,
    lowlightMod,
    typographyExt,
    highlightExt,
    underlineExt,
    subscriptExt,
    superscriptExt,
    youtubeExt,
    characterCountExt,
    bubbleMenuExt,
    // Inkpen custom extensions
    sectionMod,
    preformattedMod,
    slashCommandsMod,
    blockGutterMod,
    dragHandleMod,
    toggleBlockMod,
    columnsMod,
    calloutMod,
    blockCommandsMod,
    enhancedImageMod,
    fileAttachmentMod,
    embedMod,
    advancedTableMod,
    tableOfContentsMod,
    databaseMod,
    documentSectionMod
  ] = await Promise.all([
    import("@tiptap/core"),
    import("@tiptap/pm/model"),
    import("@tiptap/extension-document"),
    import("@tiptap/starter-kit"),
    import("@tiptap/extension-link"),
    import("@tiptap/extension-placeholder"),
    import("@tiptap/extension-image"),
    import("@tiptap/extension-table"),
    import("@tiptap/extension-table-row"),
    import("@tiptap/extension-table-cell"),
    import("@tiptap/extension-table-header"),
    import("@tiptap/extension-task-list"),
    import("@tiptap/extension-task-item"),
    import("@tiptap/extension-mention"),
    import("@tiptap/extension-code-block-lowlight"),
    import("lowlight"),
    import("@tiptap/extension-typography"),
    import("@tiptap/extension-highlight"),
    import("@tiptap/extension-underline"),
    import("@tiptap/extension-subscript"),
    import("@tiptap/extension-superscript"),
    import("@tiptap/extension-youtube"),
    import("@tiptap/extension-character-count"),
    import("@tiptap/extension-bubble-menu"),
    // Inkpen custom extensions
    import("inkpen/extensions/section"),
    import("inkpen/extensions/preformatted"),
    import("inkpen/extensions/slash_commands"),
    import("inkpen/extensions/block_gutter"),
    import("inkpen/extensions/drag_handle"),
    import("inkpen/extensions/toggle_block"),
    import("inkpen/extensions/columns"),
    import("inkpen/extensions/callout"),
    import("inkpen/extensions/block_commands"),
    import("inkpen/extensions/enhanced_image"),
    import("inkpen/extensions/file_attachment"),
    import("inkpen/extensions/embed"),
    import("inkpen/extensions/advanced_table"),
    import("inkpen/extensions/table_of_contents"),
    import("inkpen/extensions/database"),
    import("inkpen/extensions/document_section")
  ])

  cachedModules = {
    Editor: tiptapCore.Editor,
    DOMSerializer: tiptapPmModel.DOMSerializer,
    Document: documentExt.default,
    StarterKit: starterKit.default,
    Link: linkExt.default,
    Placeholder: placeholderExt.default,
    Image: imageExt.default,
    Table: tableExt.default,
    TableRow: tableRowExt.default,
    TableCell: tableCellExt.default,
    TableHeader: tableHeaderExt.default,
    TaskList: taskListExt.default,
    TaskItem: taskItemExt.default,
    Mention: mentionExt.default,
    CodeBlockLowlight: codeBlockLowlightExt.default,
    common: lowlightMod.common,
    createLowlight: lowlightMod.createLowlight,
    Typography: typographyExt.default,
    Highlight: highlightExt.default,
    Underline: underlineExt.default,
    Subscript: subscriptExt.default,
    Superscript: superscriptExt.default,
    Youtube: youtubeExt.default,
    CharacterCount: characterCountExt.default,
    BubbleMenu: bubbleMenuExt.default,
    // Inkpen custom extensions
    Section: sectionMod.Section,
    Preformatted: preformattedMod.Preformatted,
    SlashCommands: slashCommandsMod.SlashCommands,
    BlockGutter: blockGutterMod.BlockGutter,
    DragHandle: dragHandleMod.DragHandle,
    ToggleBlock: toggleBlockMod.ToggleBlock,
    ToggleSummary: toggleBlockMod.ToggleSummary,
    Columns: columnsMod.Columns,
    Column: columnsMod.Column,
    Callout: calloutMod.Callout,
    BlockCommands: blockCommandsMod.BlockCommands,
    EnhancedImage: enhancedImageMod.EnhancedImage,
    FileAttachment: fileAttachmentMod.FileAttachment,
    Embed: embedMod.Embed,
    AdvancedTable: advancedTableMod.AdvancedTable,
    AdvancedTableRow: advancedTableMod.AdvancedTableRow,
    AdvancedTableCell: advancedTableMod.AdvancedTableCell,
    AdvancedTableHeader: advancedTableMod.AdvancedTableHeader,
    TableOfContents: tableOfContentsMod.TableOfContents,
    Database: databaseMod.Database,
    DocumentSection: documentSectionMod.DocumentSection
  }

  return cachedModules
}

// Extensions loaded lazily to prevent import failures from breaking the editor
let EmojiReplacer = null
let SearchNReplace = null
let FootnotesModule = null
let InkpenTableModule = null

async function loadEmojiReplacer() {
  if (EmojiReplacer) return EmojiReplacer
  try {
    const module = await import("@tiptap-extend/emoji-replacer")
    EmojiReplacer = module.EmojiReplacer
    return EmojiReplacer
  } catch (e) {
    console.warn("Inkpen: EmojiReplacer extension not available:", e.message)
    return null
  }
}

async function loadSearchNReplace() {
  if (SearchNReplace) return SearchNReplace
  try {
    const module = await import("@sereneinserenade/tiptap-search-and-replace")
    SearchNReplace = module.default
    return SearchNReplace
  } catch (e) {
    console.warn("Inkpen: SearchNReplace extension not available:", e.message)
    return null
  }
}

async function loadFootnotes() {
  if (FootnotesModule) return FootnotesModule
  try {
    FootnotesModule = await import("tiptap-footnotes")
    return FootnotesModule
  } catch (e) {
    console.warn("Inkpen: Footnotes extension not available:", e.message)
    return null
  }
}

async function loadInkpenTable() {
  if (InkpenTableModule) return InkpenTableModule
  try {
    InkpenTableModule = await import("inkpen/extensions/inkpen_table")
    return InkpenTableModule
  } catch (e) {
    console.warn("Inkpen: InkpenTable extension not available:", e.message)
    return null
  }
}

// Export modules are loaded lazily when export_commands extension is enabled
// This prevents 404 errors for apps that don't use export functionality
let ExportCommands = null
let exportModules = null

async function loadExportModules() {
  if (exportModules) return exportModules
  try {
    exportModules = await import("inkpen/export")
    return exportModules
  } catch (e) {
    console.warn("Inkpen export modules not available:", e.message)
    return null
  }
}

async function loadExportCommands() {
  if (ExportCommands) return ExportCommands
  try {
    const module = await import("inkpen/extensions/export_commands")
    ExportCommands = module.ExportCommands
    return ExportCommands
  } catch (e) {
    console.warn("Inkpen ExportCommands extension not available:", e.message)
    return null
  }
}

/**
 * Inkpen Editor Controller
 *
 * Main Stimulus controller for the TipTap editor.
 * Handles initialization, content sync, and editor lifecycle.
 *
 * Supports extensions:
 * - StarterKit (bold, italic, strike, heading, lists, blockquote, code, etc.)
 * - Link, Image
 * - Table (with rows, cells, headers)
 * - TaskList (checkboxes)
 * - Mention (@mentions)
 * - CodeBlockLowlight (syntax highlighting)
 * - Typography (smart quotes, markdown shortcuts)
 * - Highlight, Underline, Subscript, Superscript
 * - YouTube (video embeds)
 * - CharacterCount
 */
export default class extends Controller {
  static targets = ["input", "content", "toolbar"]

  static values = {
    extensions: { type: Array, default: [] },
    extensionConfig: { type: Object, default: {} },
    toolbar: { type: String, default: "floating" },
    placeholder: { type: String, default: "Start writing..." },
    autosave: { type: Boolean, default: false },
    autosaveInterval: { type: Number, default: 5000 }
  }

  connect() {
    this.initializeEditor()
  }

  disconnect() {
    this.destroyEditor()
  }

  async initializeEditor() {
    // Lazy-load all TipTap modules
    this.modules = await loadEditorModules()
    const { Editor } = this.modules

    const extensions = await this.buildExtensions()

    this.editor = new Editor({
      element: this.contentTarget,
      extensions,
      content: this.inputTarget.value || "",
      editorProps: {
        attributes: {
          class: "inkpen-editor__content"
        }
      },
      onUpdate: ({ editor }) => {
        this.syncContent(editor)
        this.dispatchChangeEvent()
      },
      onSelectionUpdate: ({ editor }) => {
        this.handleSelectionChange(editor)
      },
      onFocus: () => {
        this.element.classList.add("is-focused")
        this.dispatchEvent("focus")
      },
      onBlur: () => {
        this.element.classList.remove("is-focused")
        this.dispatchEvent("blur")
      }
    })

    // Set up autosave if enabled
    if (this.autosaveValue) {
      this.setupAutosave()
    }

    // Dispatch ready event
    this.dispatchEvent("ready", { editor: this.editor })
  }

  destroyEditor() {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer)
    }

    if (this.editor) {
      this.editor.destroy()
      this.editor = null
    }
  }

  async buildExtensions() {
    const config = this.extensionConfigValue
    const enabledExtensions = this.extensionsValue

    // Destructure all modules from lazy-loaded cache
    const {
      StarterKit, Document, Placeholder, BubbleMenu, Link, Image,
      Table, TableRow, TableCell, TableHeader,
      TaskList, TaskItem, Mention,
      CodeBlockLowlight, common, createLowlight,
      Typography, Highlight, Underline, Subscript, Superscript,
      Youtube, CharacterCount,
      Section, Preformatted, SlashCommands, BlockGutter, DragHandle,
      ToggleBlock, ToggleSummary, Columns, Column, Callout, BlockCommands,
      EnhancedImage, FileAttachment, Embed,
      AdvancedTable, AdvancedTableRow, AdvancedTableCell, AdvancedTableHeader,
      TableOfContents, Database, DocumentSection
    } = this.modules

    // Base StarterKit - disable codeBlock if we're using CodeBlockLowlight
    const starterKitConfig = {
      heading: { levels: [1, 2, 3, 4] }
    }

    if (enabledExtensions.includes("code_block_syntax")) {
      starterKitConfig.codeBlock = false
    }

    // If forced_document is enabled, we need to use a custom Document
    // and disable the default document in StarterKit
    if (enabledExtensions.includes("forced_document")) {
      starterKitConfig.document = false
    }

    const extensions = [
      StarterKit.configure(starterKitConfig)
    ]

    // BubbleMenu (floating toolbar on text selection) - TipTap's native extension
    if (this.hasToolbarTarget && this.toolbarValue === "floating") {
      const toolbarEl = this.toolbarTarget
      extensions.push(
        BubbleMenu.configure({
          element: toolbarEl,
          tippyOptions: {
            duration: 100,
            placement: "top",
            zIndex: 9999,
          },
          shouldShow: ({ editor, state }) => {
            // Only show when there's a text selection (not just cursor)
            return !state.selection.empty && editor.isEditable
          }
        })
      )
    }

    // Forced Document Structure (title + optional subtitle)
    if (enabledExtensions.includes("forced_document")) {
      const docConfig = config.forced_document || {}
      const contentExpression = docConfig.contentExpression || "heading block*"

      // Create custom Document with forced structure
      const CustomDocument = Document.extend({
        content: contentExpression
      })

      extensions.unshift(CustomDocument)

      // Store config for placeholder use
      this.forcedDocConfig = docConfig
    }

    // Placeholder extension with support for forced document structure
    extensions.push(
      Placeholder.configure({
        includeChildren: true,
        placeholder: ({ node, pos, editor }) => {
          // If forced_document is enabled, show specific placeholders
          if (this.forcedDocConfig && node.type.name === "heading") {
            const docConfig = this.forcedDocConfig
            const titleLevel = docConfig.titleLevel || 1
            const subtitleLevel = docConfig.subtitleLevel || 2

            // First heading (title) - position 0 and matching title level
            if (pos === 0 && node.attrs.level === titleLevel) {
              return docConfig.titlePlaceholder || "Untitled"
            }

            // Second heading (subtitle) - after title, matching subtitle level
            if (docConfig.subtitle && node.attrs.level === subtitleLevel) {
              // Check if this is the second node in the document
              const doc = editor.state.doc
              let isSecondHeading = false
              let nodeIndex = 0
              doc.forEach((n, offset) => {
                if (offset === pos) {
                  isSecondHeading = nodeIndex === 1
                }
                nodeIndex++
              })
              if (isSecondHeading) {
                return docConfig.subtitlePlaceholder || "Add a subtitle..."
              }
            }
          }

          // Default placeholder for paragraphs
          if (node.type.name === "paragraph") {
            return this.placeholderValue || "Start writing..."
          }

          return ""
        }
      })
    )

    // Link extension
    if (enabledExtensions.includes("link")) {
      extensions.push(
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank"
          }
        })
      )
    }

    // Image extension
    if (enabledExtensions.includes("image")) {
      extensions.push(
        Image.configure({
          inline: false,
          allowBase64: true
        })
      )
    }

    // Table extension (use InkpenTable for enhanced Notion-style tables)
    // Loaded lazily to prevent import failures from breaking the editor
    if (enabledExtensions.includes("inkpen_table")) {
      const inkpenTableMod = await loadInkpenTable()
      if (inkpenTableMod) {
        const { InkpenTable, InkpenTableRow, InkpenTableCell, InkpenTableHeader } = inkpenTableMod
        const tableConfig = config.inkpen_table || config.table || {}
        extensions.push(
          InkpenTable.configure({
            resizable: tableConfig.resizable !== false,
            showHandles: tableConfig.showHandles !== false,
            showAddButtons: tableConfig.showAddButtons !== false,
            showCaption: tableConfig.showCaption !== false,
            stickyHeader: tableConfig.stickyHeader || false,
            defaultVariant: tableConfig.defaultVariant || "default",
            HTMLAttributes: {
              class: "inkpen-table"
            }
          }),
          InkpenTableRow,
          InkpenTableHeader,
          InkpenTableCell
        )
      }
    } else if (enabledExtensions.includes("advanced_table")) {
      // Legacy: Use AdvancedTable (deprecated, use inkpen_table instead)
      const tableConfig = config.advanced_table || config.table || {}
      extensions.push(
        AdvancedTable.configure({
          resizable: tableConfig.resizable !== false,
          showControls: tableConfig.showControls !== false,
          defaultVariant: tableConfig.defaultVariant || "default",
          HTMLAttributes: {
            class: "inkpen-table"
          }
        }),
        AdvancedTableRow,
        AdvancedTableHeader,
        AdvancedTableCell
      )
    } else if (enabledExtensions.includes("table")) {
      const tableConfig = config.table || {}
      extensions.push(
        Table.configure({
          resizable: tableConfig.resizable !== false,
          HTMLAttributes: {
            class: "inkpen-table"
          }
        }),
        TableRow,
        TableHeader,
        TableCell
      )
    }

    // TaskList extension (checkboxes)
    if (enabledExtensions.includes("task_list")) {
      const taskConfig = config.task_list || {}
      extensions.push(
        TaskList.configure({
          HTMLAttributes: {
            class: taskConfig.listClass || "inkpen-task-list"
          }
        }),
        TaskItem.configure({
          nested: taskConfig.nested !== false,
          HTMLAttributes: {
            class: taskConfig.itemClass || "inkpen-task-item"
          }
        })
      )
    }

    // Mention extension
    if (enabledExtensions.includes("mention")) {
      const mentionConfig = config.mention || {}
      extensions.push(
        Mention.configure({
          HTMLAttributes: {
            class: mentionConfig.HTMLAttributes?.class || "inkpen-mention"
          },
          suggestion: this.buildMentionSuggestion(mentionConfig)
        })
      )
    }

    // CodeBlockLowlight (syntax highlighting)
    if (enabledExtensions.includes("code_block_syntax")) {
      const codeConfig = config.code_block_syntax || {}
      const lowlight = createLowlight(common)

      extensions.push(
        CodeBlockLowlight.configure({
          lowlight,
          defaultLanguage: codeConfig.defaultLanguage || null,
          HTMLAttributes: {
            class: "inkpen-code-block"
          }
        })
      )
    }

    // Typography (smart quotes, markdown shortcuts like ## for headings)
    if (enabledExtensions.includes("typography")) {
      extensions.push(Typography)
    }

    // Highlight mark (text highlighting)
    if (enabledExtensions.includes("highlight")) {
      extensions.push(
        Highlight.configure({
          multicolor: true,
          HTMLAttributes: {
            class: "inkpen-highlight"
          }
        })
      )
    }

    // Underline mark
    if (enabledExtensions.includes("underline")) {
      extensions.push(Underline)
    }

    // Subscript/Superscript marks
    if (enabledExtensions.includes("subscript")) {
      extensions.push(Subscript)
    }
    if (enabledExtensions.includes("superscript")) {
      extensions.push(Superscript)
    }

    // YouTube video embeds
    if (enabledExtensions.includes("youtube")) {
      const youtubeConfig = config.youtube || {}
      extensions.push(
        Youtube.configure({
          inline: false,
          width: youtubeConfig.width || 640,
          height: youtubeConfig.height || 360,
          HTMLAttributes: {
            class: "inkpen-youtube"
          }
        })
      )
    }

    // Character count
    if (enabledExtensions.includes("character_count")) {
      const charConfig = config.character_count || {}
      extensions.push(
        CharacterCount.configure({
          limit: charConfig.limit || null
        })
      )
    }

    // Emoji replacer (auto-converts :emoji: shortcodes to emojis)
    // Loaded lazily to prevent CDN failures from breaking editor
    if (enabledExtensions.includes("emoji")) {
      const EmojiExt = await loadEmojiReplacer()
      if (EmojiExt) {
        const emojiConfig = config.emoji || {}
        extensions.push(
          EmojiExt.configure({
            ruleConfigs: emojiConfig.customEmojis || [],
            shouldUseExtraLookupSpace: emojiConfig.requireSpace !== false,
            shouldUseExtraReplacementSpace: emojiConfig.addSpaceAfter !== false
          })
        )
      }
    }

    // Search and Replace extension (find & replace text)
    // Loaded lazily to prevent CDN failures from breaking editor
    if (enabledExtensions.includes("search_replace")) {
      const SearchExt = await loadSearchNReplace()
      if (SearchExt) {
        const searchConfig = config.search_replace || {}
        extensions.push(
          SearchExt.configure({
            searchResultClass: searchConfig.resultClass || "inkpen-search-result",
            caseSensitive: searchConfig.caseSensitive || false,
            disableRegex: searchConfig.disableRegex || false
          })
        )
      }
    }

    // Footnotes extension (academic footnotes)
    // Loaded lazily to prevent CDN failures from breaking editor
    if (enabledExtensions.includes("footnotes")) {
      const FootnotesExt = await loadFootnotes()
      if (FootnotesExt) {
        extensions.push(FootnotesExt.Footnotes, FootnotesExt.Footnote, FootnotesExt.FootnoteReference)
      }
    }

    // Section extension (page-builder style width/spacing control)
    if (enabledExtensions.includes("section")) {
      const sectionConfig = config.section || {}
      extensions.push(
        Section.configure({
          defaultWidth: sectionConfig.defaultWidth || "default",
          defaultSpacing: sectionConfig.defaultSpacing || "normal",
          showControls: sectionConfig.showControls !== false,
          widthPresets: sectionConfig.widthPresets || undefined,
          spacingPresets: sectionConfig.spacingPresets || undefined
        })
      )
    }

    // Document Section extension (collapsible content-grouping with semantic title)
    if (enabledExtensions.includes("document_section")) {
      const docSectionConfig = config.document_section || {}
      extensions.push(
        DocumentSection.configure({
          maxDepth: docSectionConfig.maxDepth || 3,
          showControls: docSectionConfig.showControls !== false,
          defaultCollapsed: docSectionConfig.defaultCollapsed || false,
          allowNesting: docSectionConfig.allowNesting !== false
        })
      )
    }

    // Preformatted extension (ASCII art, tables, diagrams)
    if (enabledExtensions.includes("preformatted")) {
      const preConfig = config.preformatted || {}
      extensions.push(
        Preformatted.configure({
          showLineNumbers: preConfig.showLineNumbers || false,
          wrapLines: preConfig.wrapLines || false,
          tabSize: preConfig.tabSize || 4,
          showLabel: preConfig.showLabel !== false,
          labelText: preConfig.labelText || "Plain Text"
        })
      )
    }

    // Slash Commands extension (Notion-style "/" menu)
    if (enabledExtensions.includes("slash_commands")) {
      const slashConfig = config.slash_commands || {}
      extensions.push(
        SlashCommands.configure({
          commands: slashConfig.commands || undefined,
          groups: slashConfig.groups || undefined,
          maxSuggestions: slashConfig.maxSuggestions || 10,
          char: slashConfig.trigger || "/",
          startOfLine: slashConfig.startOfLine !== undefined ? slashConfig.startOfLine : false,
          allowSpaces: slashConfig.allowSpaces || false,
          suggestionClass: slashConfig.suggestionClass || "inkpen-slash-menu"
        })
      )
    }

    // Block Gutter extension (drag handles and plus buttons)
    if (enabledExtensions.includes("block_gutter")) {
      const gutterConfig = config.block_gutter || {}
      extensions.push(
        BlockGutter.configure({
          showDragHandle: gutterConfig.showDragHandle !== false,
          showPlusButton: gutterConfig.showPlusButton !== false,
          skipTypes: gutterConfig.skipTypes || undefined,
          skipParentTypes: gutterConfig.skipParentTypes || undefined
        })
      )
    }

    // Drag Handle extension (block reordering via drag & drop)
    if (enabledExtensions.includes("drag_handle")) {
      const dragConfig = config.drag_handle || {}
      extensions.push(
        DragHandle.configure({
          scrollSpeed: dragConfig.scrollSpeed || 10,
          scrollThreshold: dragConfig.scrollThreshold || 80
        })
      )
    }

    // Toggle Block extension (collapsible content)
    if (enabledExtensions.includes("toggle_block")) {
      const toggleConfig = config.toggle_block || {}
      extensions.push(
        ToggleSummary,
        ToggleBlock.configure({
          defaultOpen: toggleConfig.defaultOpen !== false
        })
      )
    }

    // Columns extension (multi-column layouts)
    if (enabledExtensions.includes("columns")) {
      const columnsConfig = config.columns || {}
      extensions.push(
        Column,
        Columns.configure({
          defaultCount: columnsConfig.defaultCount || 2,
          defaultLayout: columnsConfig.defaultLayout || "equal-2",
          showControls: columnsConfig.showControls !== false
        })
      )
    }

    // Callout extension (highlighted blocks)
    if (enabledExtensions.includes("callout")) {
      const calloutConfig = config.callout || {}
      extensions.push(
        Callout.configure({
          defaultType: calloutConfig.defaultType || "info",
          showControls: calloutConfig.showControls !== false
        })
      )
    }

    // Block Commands extension (duplicate, delete, select blocks)
    if (enabledExtensions.includes("block_commands")) {
      const blockConfig = config.block_commands || {}
      extensions.push(
        BlockCommands.configure({
          selectedClass: blockConfig.selectedClass || "is-selected",
          enableGutterSelection: blockConfig.enableGutterSelection !== false
        })
      )
    }

    // Enhanced Image extension (resizable, alignable images with captions)
    if (enabledExtensions.includes("enhanced_image")) {
      const imageConfig = config.enhanced_image || {}
      extensions.push(
        EnhancedImage.configure({
          resizable: imageConfig.resizable !== false,
          lightbox: imageConfig.lightbox !== false,
          defaultAlignment: imageConfig.defaultAlignment || "center",
          minWidth: imageConfig.minWidth || 100,
          maxWidth: imageConfig.maxWidth || null,
          lockAspectRatio: imageConfig.lockAspectRatio !== false,
          showAlignmentControls: imageConfig.showAlignmentControls !== false,
          allowCaption: imageConfig.allowCaption !== false
        })
      )
    }

    // File Attachment extension (file uploads with icons and download)
    if (enabledExtensions.includes("file_attachment")) {
      const fileConfig = config.file_attachment || {}
      extensions.push(
        FileAttachment.configure({
          uploadUrl: fileConfig.uploadUrl || null,
          uploadHeaders: fileConfig.uploadHeaders || {},
          uploadFieldName: fileConfig.uploadFieldName || "file",
          allowedTypes: fileConfig.allowedTypes || null,
          maxSize: fileConfig.maxSize || 10 * 1024 * 1024,
          uploadHandler: fileConfig.uploadHandler || null
        })
      )
    }

    // Embed extension (social media and website embeds)
    if (enabledExtensions.includes("embed")) {
      const embedConfig = config.embed || {}
      extensions.push(
        Embed.configure({
          allowedProviders: embedConfig.allowedProviders || null,
          privacyMode: embedConfig.privacyMode !== false,
          enableLinkCards: embedConfig.enableLinkCards !== false,
          linkCardFetcher: embedConfig.linkCardFetcher || null
        })
      )
    }

    // Table of Contents extension (auto-generated navigation)
    if (enabledExtensions.includes("table_of_contents")) {
      const tocConfig = config.table_of_contents || {}
      extensions.push(
        TableOfContents.configure({
          defaultMaxDepth: tocConfig.maxDepth || 3,
          defaultStyle: tocConfig.style || "numbered",
          defaultTitle: tocConfig.title || "Table of Contents",
          scrollOffset: tocConfig.scrollOffset || 100
        })
      )
    }

    // Database extension (Notion-style inline databases)
    if (enabledExtensions.includes("database")) {
      const dbConfig = config.database || {}
      extensions.push(
        Database.configure({
          defaultTitle: dbConfig.title || "Untitled Database",
          defaultView: dbConfig.view || "table"
        })
      )
    }

    // Export Commands extension (keyboard shortcuts for export)
    // Loaded lazily to avoid 404s for apps that don't use export
    if (enabledExtensions.includes("export_commands")) {
      const ExportCommandsExt = await loadExportCommands()
      if (ExportCommandsExt) {
        const exportConfig = config.export_commands || {}
        extensions.push(
          ExportCommandsExt.configure({
            defaultFilename: exportConfig.defaultFilename || "document",
            markdownOptions: exportConfig.markdownOptions || {},
            htmlOptions: exportConfig.htmlOptions || {},
            pdfOptions: exportConfig.pdfOptions || {},
            onExportSuccess: exportConfig.onExportSuccess || null,
            onExportError: exportConfig.onExportError || null
          })
        )
        // Pre-load export modules for methods
        await loadExportModules()
      }
    }

    return extensions
  }

  /**
   * Build mention suggestion configuration
   * Handles both static items and async search
   */
  buildMentionSuggestion(config) {
    const items = config.items || []
    const searchUrl = config.searchUrl

    return {
      char: config.trigger || "@",
      items: async ({ query }) => {
        // If search URL provided, fetch from server
        if (searchUrl) {
          try {
            const response = await fetch(`${searchUrl}?query=${encodeURIComponent(query)}`)
            if (response.ok) {
              return await response.json()
            }
          } catch (error) {
            console.error("Mention search failed:", error)
          }
          return []
        }

        // Otherwise filter static items
        return items
          .filter(item =>
            item.label.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
      },
      render: () => {
        let component
        let popup

        return {
          onStart: props => {
            component = this.createMentionPopup(props, config)
            popup = component.element
            document.body.appendChild(popup)
            this.updateMentionPopupPosition(popup, props.clientRect)
          },
          onUpdate: props => {
            this.updateMentionItems(component, props.items, props.command)
            this.updateMentionPopupPosition(popup, props.clientRect)
          },
          onKeyDown: props => {
            if (props.event.key === "Escape") {
              popup?.remove()
              return true
            }
            return component?.onKeyDown?.(props.event) || false
          },
          onExit: () => {
            popup?.remove()
          }
        }
      }
    }
  }

  createMentionPopup(props, config) {
    const popup = document.createElement("div")
    popup.className = config.suggestionClass || "inkpen-mention-suggestions"
    popup.setAttribute("role", "listbox")

    const component = {
      element: popup,
      selectedIndex: 0,
      items: props.items,
      command: props.command,
      onKeyDown: (event) => {
        if (event.key === "ArrowUp") {
          component.selectedIndex = Math.max(0, component.selectedIndex - 1)
          this.updateMentionSelection(popup, component.selectedIndex)
          return true
        }
        if (event.key === "ArrowDown") {
          component.selectedIndex = Math.min(component.items.length - 1, component.selectedIndex + 1)
          this.updateMentionSelection(popup, component.selectedIndex)
          return true
        }
        if (event.key === "Enter") {
          const item = component.items[component.selectedIndex]
          if (item) {
            component.command(item)
          }
          return true
        }
        return false
      }
    }

    this.updateMentionItems(component, props.items, props.command)
    return component
  }

  updateMentionItems(component, items, command) {
    component.items = items
    component.command = command
    component.selectedIndex = 0

    const popup = component.element
    popup.innerHTML = ""

    if (items.length === 0) {
      popup.innerHTML = '<div class="inkpen-mention-empty">No results</div>'
      return
    }

    items.forEach((item, index) => {
      const button = document.createElement("button")
      button.className = `inkpen-mention-item ${index === 0 ? "is-selected" : ""}`
      button.setAttribute("role", "option")
      button.textContent = item.label
      button.addEventListener("click", () => command(item))
      popup.appendChild(button)
    })
  }

  updateMentionSelection(popup, selectedIndex) {
    const items = popup.querySelectorAll(".inkpen-mention-item")
    items.forEach((item, index) => {
      item.classList.toggle("is-selected", index === selectedIndex)
    })
  }

  updateMentionPopupPosition(popup, clientRect) {
    if (!clientRect) return

    const rect = clientRect()
    if (!rect) return

    popup.style.position = "fixed"
    popup.style.left = `${rect.left}px`
    popup.style.top = `${rect.bottom + 8}px`
    popup.style.zIndex = "9999"
  }

  syncContent(editor) {
    // If forced_document is enabled, only store body content (not title/subtitle)
    // Title and subtitle are stored in separate hidden fields
    if (this.forcedDocConfig) {
      const body = this.getBody()
      this.inputTarget.value = body
    } else {
      const html = editor.getHTML()
      this.inputTarget.value = html
    }
  }

  handleSelectionChange(editor) {
    // Dispatch event for toolbar to handle
    this.dispatchEvent("selection-change", {
      editor,
      isEmpty: editor.state.selection.empty,
      from: editor.state.selection.from,
      to: editor.state.selection.to
    })
  }

  setupAutosave() {
    this.autosaveTimer = setInterval(() => {
      this.dispatchEvent("autosave", {
        content: this.inputTarget.value
      })
    }, this.autosaveIntervalValue)
  }

  // Public API methods
  getContent() {
    return this.editor?.getHTML() || ""
  }

  getJSON() {
    return this.editor?.getJSON() || null
  }

  setContent(content) {
    this.editor?.commands.setContent(content)
  }

  focus() {
    this.editor?.commands.focus()
  }

  blur() {
    this.editor?.commands.blur()
  }

  // Formatting commands
  toggleBold() {
    this.editor?.chain().focus().toggleBold().run()
  }

  toggleItalic() {
    this.editor?.chain().focus().toggleItalic().run()
  }

  toggleStrike() {
    this.editor?.chain().focus().toggleStrike().run()
  }

  toggleHeading(level) {
    this.editor?.chain().focus().toggleHeading({ level }).run()
  }

  toggleBulletList() {
    this.editor?.chain().focus().toggleBulletList().run()
  }

  toggleOrderedList() {
    this.editor?.chain().focus().toggleOrderedList().run()
  }

  toggleBlockquote() {
    this.editor?.chain().focus().toggleBlockquote().run()
  }

  toggleCodeBlock() {
    this.editor?.chain().focus().toggleCodeBlock().run()
  }

  toggleCode() {
    this.editor?.chain().focus().toggleCode().run()
  }

  setLink(url) {
    if (url) {
      this.editor?.chain().focus().setLink({ href: url }).run()
    } else {
      this.editor?.chain().focus().unsetLink().run()
    }
  }

  insertHorizontalRule() {
    this.editor?.chain().focus().setHorizontalRule().run()
  }

  // Table commands
  insertTable(rows = 3, cols = 3, withHeaderRow = true) {
    this.editor?.chain().focus().insertTable({ rows, cols, withHeaderRow }).run()
  }

  addTableRowBefore() {
    this.editor?.chain().focus().addRowBefore().run()
  }

  addTableRowAfter() {
    this.editor?.chain().focus().addRowAfter().run()
  }

  deleteTableRow() {
    this.editor?.chain().focus().deleteRow().run()
  }

  addTableColumnBefore() {
    this.editor?.chain().focus().addColumnBefore().run()
  }

  addTableColumnAfter() {
    this.editor?.chain().focus().addColumnAfter().run()
  }

  deleteTableColumn() {
    this.editor?.chain().focus().deleteColumn().run()
  }

  deleteTable() {
    this.editor?.chain().focus().deleteTable().run()
  }

  mergeCells() {
    this.editor?.chain().focus().mergeCells().run()
  }

  splitCell() {
    this.editor?.chain().focus().splitCell().run()
  }

  // TaskList commands
  toggleTaskList() {
    this.editor?.chain().focus().toggleTaskList().run()
  }

  // Highlight commands
  toggleHighlight(color = null) {
    if (color) {
      this.editor?.chain().focus().toggleHighlight({ color }).run()
    } else {
      this.editor?.chain().focus().toggleHighlight().run()
    }
  }

  // Underline command
  toggleUnderline() {
    this.editor?.chain().focus().toggleUnderline().run()
  }

  // Subscript/Superscript commands
  toggleSubscript() {
    this.editor?.chain().focus().toggleSubscript().run()
  }

  toggleSuperscript() {
    this.editor?.chain().focus().toggleSuperscript().run()
  }

  // YouTube embed command
  insertYoutubeVideo(url) {
    if (url) {
      this.editor?.chain().focus().setYoutubeVideo({ src: url }).run()
    }
  }

  // Section commands
  insertSection(width = "default", spacing = "normal") {
    this.editor?.chain().focus().insertSection({ width, spacing }).run()
  }

  setSectionWidth(width) {
    this.editor?.chain().focus().setSectionWidth(width).run()
  }

  setSectionSpacing(spacing) {
    this.editor?.chain().focus().setSectionSpacing(spacing).run()
  }

  wrapInSection(width = "default", spacing = "normal") {
    this.editor?.chain().focus().wrapInSection({ width, spacing }).run()
  }

  // Preformatted commands
  insertPreformatted(content = "") {
    this.editor?.chain().focus().insertPreformatted(content).run()
  }

  togglePreformatted() {
    this.editor?.chain().focus().togglePreformatted().run()
  }

  // Callout commands
  insertCallout(type = "info") {
    this.editor?.chain().focus().insertCallout({ type }).run()
  }

  setCalloutType(type) {
    this.editor?.chain().focus().setCalloutType(type).run()
  }

  // Toggle block commands
  insertToggle() {
    this.editor?.chain().focus().insertToggle().run()
  }

  // Columns commands
  insertColumns(count = 2) {
    this.editor?.chain().focus().setColumns(count).run()
  }

  // Table of Contents commands
  insertTableOfContents() {
    this.editor?.chain().focus().insertTableOfContents().run()
  }

  // Character count methods
  getCharacterCount() {
    return this.editor?.storage.characterCount?.characters() || 0
  }

  getWordCount() {
    return this.editor?.storage.characterCount?.words() || 0
  }

  // Check if format is active
  isActive(name, attributes = {}) {
    return this.editor?.isActive(name, attributes) || false
  }

  // Export Methods (require export_commands extension to be enabled)

  /**
   * Export document to Markdown
   * @param {Object} options - Export options
   * @returns {Promise<string>} Markdown content
   */
  async exportMarkdown(options = {}) {
    if (!this.editor) return ""
    const modules = await loadExportModules()
    if (!modules) {
      console.warn("Export modules not available. Enable export_commands extension.")
      return ""
    }
    return modules.exportToMarkdown(this.editor.getJSON(), options)
  }

  /**
   * Download document as Markdown file
   * @param {string} filename - Filename for download
   * @param {Object} options - Export options
   */
  async downloadAsMarkdown(filename = "document.md", options = {}) {
    const modules = await loadExportModules()
    if (!modules) return
    const markdown = await this.exportMarkdown(options)
    modules.downloadMarkdown(markdown, filename)
  }

  /**
   * Copy document as Markdown to clipboard
   * @param {Object} options - Export options
   * @returns {Promise<boolean>} Success status
   */
  async copyAsMarkdown(options = {}) {
    const modules = await loadExportModules()
    if (!modules) return false
    const markdown = await this.exportMarkdown(options)
    return modules.copyMarkdownToClipboard(markdown)
  }

  /**
   * Import Markdown content into editor
   * @param {string} markdown - Markdown content
   * @param {Object} options - Import options
   * @returns {Promise<Object>} { frontmatter } - Parsed frontmatter if present
   */
  async importMarkdown(markdown, options = {}) {
    if (!this.editor) return {}
    const modules = await loadExportModules()
    if (!modules) return {}
    const result = modules.importFromMarkdown(markdown, this.editor.schema, options)
    if (result.html) {
      this.editor.commands.setContent(result.html)
    }
    return { frontmatter: result.frontmatter }
  }

  /**
   * Export document to HTML
   * @param {Object} options - Export options
   * @returns {Promise<string>} HTML content
   */
  async exportHTML(options = {}) {
    if (!this.editor) return ""
    const modules = await loadExportModules()
    if (!modules) {
      console.warn("Export modules not available. Enable export_commands extension.")
      return ""
    }
    return modules.exportToHTML(this.editor, options)
  }

  /**
   * Download document as HTML file
   * @param {string} filename - Filename for download
   * @param {Object} options - Export options
   */
  async downloadAsHTML(filename = "document.html", options = {}) {
    const modules = await loadExportModules()
    if (!modules) return
    const html = await this.exportHTML(options)
    modules.downloadHTML(html, filename)
  }

  /**
   * Copy document as HTML to clipboard
   * @param {Object} options - Export options
   * @returns {Promise<boolean>} Success status
   */
  async copyAsHTML(options = {}) {
    const modules = await loadExportModules()
    if (!modules) return false
    const html = await this.exportHTML({ ...options, includeWrapper: false, includeStyles: false })
    return modules.copyHTMLToClipboard(html)
  }

  /**
   * Export document to PDF
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  async exportPDF(options = {}) {
    if (!this.editor) return
    const modules = await loadExportModules()
    if (!modules) return
    await modules.exportToPDF(this.editor, options)
  }

  /**
   * Download document as PDF file
   * @param {string} filename - Filename for download
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  async downloadAsPDF(filename = "document.pdf", options = {}) {
    await this.exportPDF({ ...options, filename })
  }

  /**
   * Load html2pdf.js library for better PDF support
   * @returns {Promise<boolean>} Whether library was loaded
   */
  async loadPDFLibrary() {
    const modules = await loadExportModules()
    if (!modules) return false
    return modules.loadHtml2Pdf()
  }

  /**
   * Check if PDF export with full features is available
   * @returns {Promise<boolean>}
   */
  async isPDFExportAvailable() {
    const modules = await loadExportModules()
    if (!modules) return false
    return modules.isPDFExportAvailable()
  }

  // Forced Document helpers

  /**
   * Get the title text from the first heading.
   * Only works when forced_document extension is enabled.
   * @returns {string} The title text
   */
  getTitle() {
    if (!this.editor || !this.forcedDocConfig) return ""

    const doc = this.editor.state.doc
    const firstChild = doc.firstChild

    if (firstChild && firstChild.type.name === "heading") {
      return firstChild.textContent || ""
    }
    return ""
  }

  /**
   * Get the subtitle text from the second heading.
   * Only works when forced_document with subtitle is enabled.
   * @returns {string} The subtitle text
   */
  getSubtitle() {
    if (!this.editor || !this.forcedDocConfig || !this.forcedDocConfig.subtitle) return ""

    const doc = this.editor.state.doc
    const subtitleLevel = this.forcedDocConfig.subtitleLevel || 2

    // Look for second heading with matching level
    let found = false
    let subtitle = ""

    doc.forEach((node, offset, index) => {
      if (found) return
      if (index === 1 && node.type.name === "heading" && node.attrs.level === subtitleLevel) {
        subtitle = node.textContent || ""
        found = true
      }
    })

    return subtitle
  }

  /**
   * Set the title text in the first heading.
   * @param {string} title The title text to set
   */
  setTitle(title) {
    if (!this.editor) return

    const { state, view } = this.editor
    const firstChild = state.doc.firstChild

    if (firstChild && firstChild.type.name === "heading") {
      const tr = state.tr.replaceWith(
        1, // Start of first heading content
        1 + firstChild.content.size, // End of first heading content
        state.schema.text(title)
      )
      view.dispatch(tr)
    }
  }

  /**
   * Set the subtitle text in the second heading.
   * @param {string} subtitle The subtitle text to set
   */
  setSubtitle(subtitle) {
    if (!this.editor || !this.forcedDocConfig || !this.forcedDocConfig.subtitle) return

    const { state, view } = this.editor
    const doc = state.doc
    const subtitleLevel = this.forcedDocConfig.subtitleLevel || 2

    // Find the second heading position
    let subtitlePos = null
    let subtitleNode = null

    doc.forEach((node, pos, index) => {
      if (subtitlePos !== null) return
      if (index === 1 && node.type.name === "heading" && node.attrs.level === subtitleLevel) {
        subtitlePos = pos
        subtitleNode = node
      }
    })

    if (subtitlePos !== null && subtitleNode) {
      const tr = state.tr.replaceWith(
        subtitlePos + 1, // Start of subtitle content
        subtitlePos + 1 + subtitleNode.content.size, // End of subtitle content
        state.schema.text(subtitle)
      )
      view.dispatch(tr)
    }
  }

  /**
   * Get body content (everything after title/subtitle).
   * @returns {string} HTML content of the body
   */
  getBody() {
    if (!this.editor) return ""

    const doc = this.editor.state.doc
    const hasSubtitle = this.forcedDocConfig?.subtitle

    // Skip first node (title) and optionally second (subtitle)
    const startIndex = hasSubtitle ? 2 : 1
    const bodyNodes = []

    doc.forEach((node, offset, index) => {
      if (index >= startIndex) {
        bodyNodes.push(node)
      }
    })

    if (bodyNodes.length === 0) return ""

    // Create a temporary document fragment and serialize
    const fragment = this.editor.state.schema.nodes.doc.create(null, bodyNodes)
    const serializer = this.modules.DOMSerializer.fromSchema(this.editor.state.schema)
    const dom = serializer.serializeFragment(fragment.content)
    const div = document.createElement("div")
    div.appendChild(dom)

    return div.innerHTML
  }

  // Helper to dispatch custom events
  dispatchEvent(name, detail = {}) {
    this.element.dispatchEvent(
      new CustomEvent(`inkpen:${name}`, {
        bubbles: true,
        detail: { ...detail, controller: this }
      })
    )
  }

  dispatchChangeEvent() {
    this.dispatchEvent("change", {
      content: this.inputTarget.value,
      title: this.getTitle(),
      subtitle: this.getSubtitle(),
      body: this.getBody(),
      wordCount: this.getWordCount(),
      characterCount: this.getCharacterCount()
    })
  }
}
