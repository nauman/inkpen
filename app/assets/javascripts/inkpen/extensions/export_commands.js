import { Extension } from "@tiptap/core"
import {
  exportToMarkdown,
  downloadMarkdown,
  copyMarkdownToClipboard,
  exportToHTML,
  downloadHTML,
  copyHTMLToClipboard,
  exportToPDF
} from "inkpen/export"

/**
 * Export Commands Extension for TipTap
 *
 * Adds keyboard shortcuts and commands for exporting editor content
 * to Markdown, HTML, and PDF formats.
 *
 * Follows Fizzy patterns:
 * - Section comments for organization
 * - Clean command API
 * - Event-driven callbacks
 *
 * Keyboard Shortcuts:
 * - Cmd+Alt+M: Download as Markdown
 * - Cmd+Alt+H: Download as HTML
 * - Cmd+Alt+P: Download as PDF
 * - Cmd+Alt+C: Copy as Markdown
 * - Cmd+Alt+Shift+C: Copy as HTML
 *
 * @example
 * editor.commands.downloadMarkdown()
 * editor.commands.downloadHTML({ includeStyles: true })
 * editor.commands.downloadPDF({ pageSize: 'letter' })
 *
 * @since 0.7.0
 */
export const ExportCommands = Extension.create({
  name: "exportCommands",

  // Options

  addOptions() {
    return {
      /**
       * Default filename for Markdown export (without extension)
       */
      defaultFilename: "document",

      /**
       * Default options for Markdown export
       */
      markdownOptions: {},

      /**
       * Default options for HTML export
       */
      htmlOptions: {
        includeStyles: true,
        inlineStyles: true,
        includeWrapper: true
      },

      /**
       * Default options for PDF export
       */
      pdfOptions: {
        pageSize: "a4",
        orientation: "portrait",
        margins: { top: 20, right: 20, bottom: 20, left: 20 }
      },

      /**
       * Callback when export succeeds
       * @param {string} format - Export format (markdown, html, pdf)
       * @param {string} action - Action performed (download, copy)
       */
      onExportSuccess: null,

      /**
       * Callback when export fails
       * @param {string} format - Export format
       * @param {Error} error - Error that occurred
       */
      onExportError: null
    }
  },

  // Commands

  addCommands() {
    return {
      /**
       * Export and download as Markdown file
       * @param {Object} options - Export options
       * @param {string} options.filename - Filename for download
       * @param {boolean} options.includeFrontmatter - Include YAML frontmatter
       * @param {Object} options.frontmatter - Frontmatter data
       */
      downloadMarkdown: (options = {}) => ({ editor }) => {
        try {
          const filename = options.filename || `${this.options.defaultFilename}.md`
          const exportOptions = { ...this.options.markdownOptions, ...options }
          const markdown = exportToMarkdown(editor.getJSON(), exportOptions)
          downloadMarkdown(markdown, filename)
          this._notifySuccess("markdown", "download")
          return true
        } catch (error) {
          this._notifyError("markdown", error)
          return false
        }
      },

      /**
       * Copy editor content as Markdown to clipboard
       * @param {Object} options - Export options
       */
      copyMarkdown: (options = {}) => ({ editor }) => {
        try {
          const exportOptions = { ...this.options.markdownOptions, ...options }
          const markdown = exportToMarkdown(editor.getJSON(), exportOptions)
          copyMarkdownToClipboard(markdown).then(success => {
            if (success) {
              this._notifySuccess("markdown", "copy")
            }
          })
          return true
        } catch (error) {
          this._notifyError("markdown", error)
          return false
        }
      },

      /**
       * Export and download as HTML file
       * @param {Object} options - Export options
       * @param {string} options.filename - Filename for download
       * @param {boolean} options.includeStyles - Include CSS styles
       * @param {boolean} options.inlineStyles - Embed styles in document
       * @param {string} options.classPrefix - CSS class prefix
       * @param {string} options.theme - Theme (light, dark, auto)
       */
      downloadHTML: (options = {}) => ({ editor }) => {
        try {
          const filename = options.filename || `${this.options.defaultFilename}.html`
          const exportOptions = { ...this.options.htmlOptions, ...options }
          const html = exportToHTML(editor, exportOptions)
          downloadHTML(html, filename)
          this._notifySuccess("html", "download")
          return true
        } catch (error) {
          this._notifyError("html", error)
          return false
        }
      },

      /**
       * Copy editor content as HTML to clipboard
       * @param {Object} options - Export options
       */
      copyHTML: (options = {}) => ({ editor }) => {
        try {
          const exportOptions = {
            ...this.options.htmlOptions,
            ...options,
            includeWrapper: false,
            includeStyles: false
          }
          const html = exportToHTML(editor, exportOptions)
          copyHTMLToClipboard(html).then(success => {
            if (success) {
              this._notifySuccess("html", "copy")
            }
          })
          return true
        } catch (error) {
          this._notifyError("html", error)
          return false
        }
      },

      /**
       * Export and download as PDF file
       * @param {Object} options - Export options
       * @param {string} options.filename - Filename for download
       * @param {string} options.pageSize - Page size (a4, letter, legal)
       * @param {string} options.orientation - Orientation (portrait, landscape)
       * @param {Object} options.margins - Margins in mm
       */
      downloadPDF: (options = {}) => ({ editor }) => {
        try {
          const filename = options.filename || `${this.options.defaultFilename}.pdf`
          const exportOptions = { ...this.options.pdfOptions, ...options, filename }
          exportToPDF(editor, exportOptions).then(() => {
            this._notifySuccess("pdf", "download")
          }).catch(error => {
            this._notifyError("pdf", error)
          })
          return true
        } catch (error) {
          this._notifyError("pdf", error)
          return false
        }
      },

      /**
       * Get Markdown string without downloading
       * @param {Object} options - Export options
       * @returns {string} Markdown content
       */
      getMarkdown: (options = {}) => ({ editor }) => {
        const exportOptions = { ...this.options.markdownOptions, ...options }
        return exportToMarkdown(editor.getJSON(), exportOptions)
      },

      /**
       * Get HTML string without downloading
       * @param {Object} options - Export options
       * @returns {string} HTML content
       */
      getHTML: (options = {}) => ({ editor }) => {
        const exportOptions = { ...this.options.htmlOptions, ...options }
        return exportToHTML(editor, exportOptions)
      }
    }
  },

  // Keyboard Shortcuts

  addKeyboardShortcuts() {
    return {
      // Download shortcuts (Mod-Alt)
      "Mod-Alt-m": () => this.editor.commands.downloadMarkdown(),
      "Mod-Alt-h": () => this.editor.commands.downloadHTML(),
      "Mod-Alt-p": () => this.editor.commands.downloadPDF(),

      // Copy shortcuts (Mod-Alt-Shift)
      "Mod-Alt-Shift-m": () => this.editor.commands.copyMarkdown(),
      "Mod-Alt-Shift-h": () => this.editor.commands.copyHTML()
    }
  },

  // Helpers (underscore prefix for internal methods in TipTap extensions)

  _notifySuccess(format, action) {
    if (this.options.onExportSuccess) {
      this.options.onExportSuccess(format, action)
    }

    // Dispatch DOM event for external listeners
    const event = new CustomEvent("inkpen:export-success", {
      bubbles: true,
      detail: { format, action }
    })
    this.editor.view.dom.dispatchEvent(event)
  },

  _notifyError(format, error) {
    console.error(`Export to ${format} failed:`, error)

    if (this.options.onExportError) {
      this.options.onExportError(format, error)
    }

    // Dispatch DOM event for external listeners
    const event = new CustomEvent("inkpen:export-error", {
      bubbles: true,
      detail: { format, error }
    })
    this.editor.view.dom.dispatchEvent(event)
  }
})
