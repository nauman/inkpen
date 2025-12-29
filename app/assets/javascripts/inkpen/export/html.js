/**
 * HTML Export
 *
 * Generates clean, semantic HTML from TipTap editor content.
 * Supports optional styling, class prefixes, and full document wrapping.
 */

/**
 * Export editor document to HTML
 *
 * @param {Editor} editor - TipTap editor instance
 * @param {Object} options - Export options
 * @returns {string} HTML content
 */
export function exportToHTML(editor, options = {}) {
  const {
    includeStyles = true,
    inlineStyles = false,
    classPrefix = "inkpen-",
    embedImages = false,
    includeWrapper = true,
    title = "Document",
    theme = "light"
  } = options

  // Get raw HTML from editor
  let content = editor.getHTML()

  // Add class prefixes if specified
  if (classPrefix && classPrefix !== "inkpen-") {
    content = addClassPrefix(content, classPrefix)
  }

  // Embed images as base64 if requested
  if (embedImages) {
    content = embedImagesAsBase64(content)
  }

  // Wrap in full HTML document
  if (includeWrapper) {
    return wrapInDocument(content, {
      title,
      includeStyles,
      inlineStyles,
      classPrefix,
      theme
    })
  }

  // Return content with optional style tag
  if (includeStyles && inlineStyles) {
    return `<style>${getExportStyles(classPrefix)}</style>\n${content}`
  }

  return content
}

/**
 * Wrap content in a full HTML document
 */
function wrapInDocument(content, options) {
  const { title, includeStyles, inlineStyles, classPrefix, theme } = options

  let styleBlock = ""
  if (includeStyles) {
    if (inlineStyles) {
      styleBlock = `  <style>\n${getExportStyles(classPrefix, 4)}\n  </style>`
    } else {
      styleBlock = `  <link rel="stylesheet" href="inkpen-export.css">`
    }
  }

  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
${styleBlock}
</head>
<body>
  <article class="${classPrefix}document">
${indentContent(content, 4)}
  </article>
</body>
</html>`
}

/**
 * Get export styles
 */
function getExportStyles(prefix = "inkpen-", indent = 0) {
  const pad = " ".repeat(indent)

  const styles = `
/* Base document styles */
.${prefix}document {
  max-width: 680px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #1a1a1a;
  background: #ffffff;
}

/* Typography */
.${prefix}document h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 2rem 0 1rem;
  line-height: 1.2;
}

.${prefix}document h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.75rem 0 0.75rem;
  line-height: 1.3;
}

.${prefix}document h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.5rem 0 0.5rem;
  line-height: 1.4;
}

.${prefix}document h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 1.25rem 0 0.5rem;
}

.${prefix}document p {
  margin: 0 0 1rem;
}

.${prefix}document a {
  color: #2563eb;
  text-decoration: underline;
}

.${prefix}document a:hover {
  color: #1d4ed8;
}

/* Lists */
.${prefix}document ul,
.${prefix}document ol {
  margin: 0 0 1rem;
  padding-left: 1.5rem;
}

.${prefix}document li {
  margin: 0.25rem 0;
}

.${prefix}document li > ul,
.${prefix}document li > ol {
  margin: 0.25rem 0;
}

/* Task list */
.${prefix}document ul[data-type="taskList"] {
  list-style: none;
  padding-left: 0;
}

.${prefix}document ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.${prefix}document ul[data-type="taskList"] input[type="checkbox"] {
  margin-top: 0.25rem;
}

/* Blockquote */
.${prefix}document blockquote {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  border-left: 3px solid #e5e7eb;
  color: #4b5563;
  background: #f9fafb;
}

.${prefix}document blockquote p:last-child {
  margin-bottom: 0;
}

/* Code */
.${prefix}document code {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
}

.${prefix}document pre {
  background: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.${prefix}document pre code {
  background: transparent;
  padding: 0;
  font-size: 0.875rem;
  color: inherit;
}

/* Horizontal rule */
.${prefix}document hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2rem 0;
}

/* Images */
.${prefix}document img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

.${prefix}document figure {
  margin: 1.5rem 0;
  text-align: center;
}

.${prefix}document figcaption {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

/* Tables */
.${prefix}document table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.${prefix}document th,
.${prefix}document td {
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.${prefix}document th {
  background: #f9fafb;
  font-weight: 600;
}

.${prefix}document tr:nth-child(even) td {
  background: #fafafa;
}

/* Callouts */
.${prefix}callout {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 0.5rem;
  border-left: 4px solid;
}

.${prefix}callout--info {
  background: #eff6ff;
  border-color: #3b82f6;
}

.${prefix}callout--warning {
  background: #fffbeb;
  border-color: #f59e0b;
}

.${prefix}callout--tip {
  background: #f0fdf4;
  border-color: #22c55e;
}

.${prefix}callout--note {
  background: #f5f5f5;
  border-color: #737373;
}

.${prefix}callout--success {
  background: #f0fdf4;
  border-color: #22c55e;
}

.${prefix}callout--error {
  background: #fef2f2;
  border-color: #ef4444;
}

/* Toggle/Details */
.${prefix}document details {
  margin: 1rem 0;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.${prefix}document summary {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 500;
  background: #f9fafb;
  border-radius: 0.5rem 0.5rem 0 0;
}

.${prefix}document details[open] summary {
  border-bottom: 1px solid #e5e7eb;
}

.${prefix}document details > *:not(summary) {
  padding: 1rem;
}

/* Columns */
.${prefix}columns {
  display: grid;
  gap: 1.5rem;
  margin: 1rem 0;
}

.${prefix}columns--2 { grid-template-columns: repeat(2, 1fr); }
.${prefix}columns--3 { grid-template-columns: repeat(3, 1fr); }
.${prefix}columns--4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 640px) {
  .${prefix}columns {
    grid-template-columns: 1fr !important;
  }
}

/* File attachment */
.${prefix}file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin: 1rem 0;
  text-decoration: none;
  color: inherit;
}

.${prefix}file:hover {
  background: #f3f4f6;
}

.${prefix}file__icon {
  font-size: 1.5rem;
}

.${prefix}file__info {
  flex: 1;
}

.${prefix}file__name {
  font-weight: 500;
}

.${prefix}file__size {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Embed */
.${prefix}embed {
  margin: 1.5rem 0;
}

.${prefix}embed iframe {
  width: 100%;
  border: none;
  border-radius: 0.5rem;
}

/* Table of Contents */
.${prefix}toc {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}

.${prefix}toc__title {
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.${prefix}toc__list {
  margin: 0;
  padding-left: 1.25rem;
}

.${prefix}toc__item {
  padding: 0.25rem 0;
}

.${prefix}toc__item a {
  color: inherit;
  text-decoration: none;
}

.${prefix}toc__item a:hover {
  color: #2563eb;
}

/* Database */
.${prefix}database {
  margin: 1.5rem 0;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.${prefix}database__header {
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.${prefix}database__title {
  font-weight: 600;
}

/* Marks */
.${prefix}document mark,
.${prefix}highlight {
  background: #fef08a;
  padding: 0.125rem 0;
}

.${prefix}document u {
  text-decoration: underline;
}

.${prefix}document s {
  text-decoration: line-through;
}

.${prefix}document sub {
  font-size: 0.75em;
  vertical-align: sub;
}

.${prefix}document sup {
  font-size: 0.75em;
  vertical-align: super;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  [data-theme="auto"] .${prefix}document {
    background: #111827;
    color: #f9fafb;
  }

  [data-theme="auto"] .${prefix}document a {
    color: #60a5fa;
  }

  [data-theme="auto"] .${prefix}document blockquote {
    background: #1f2937;
    border-color: #374151;
    color: #9ca3af;
  }

  [data-theme="auto"] .${prefix}document code {
    background: #374151;
  }

  [data-theme="auto"] .${prefix}document th,
  [data-theme="auto"] .${prefix}document summary {
    background: #1f2937;
  }

  [data-theme="auto"] .${prefix}document th,
  [data-theme="auto"] .${prefix}document td {
    border-color: #374151;
  }
}

[data-theme="dark"] .${prefix}document {
  background: #111827;
  color: #f9fafb;
}

[data-theme="dark"] .${prefix}document a {
  color: #60a5fa;
}

[data-theme="dark"] .${prefix}document blockquote {
  background: #1f2937;
  border-color: #374151;
  color: #9ca3af;
}

[data-theme="dark"] .${prefix}document code {
  background: #374151;
}

/* Print styles */
@media print {
  .${prefix}document {
    max-width: none;
    padding: 0;
    font-size: 12pt;
  }

  .${prefix}document a {
    color: inherit;
    text-decoration: underline;
  }

  .${prefix}document pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .${prefix}document img {
    max-width: 100%;
    page-break-inside: avoid;
  }

  .${prefix}document table {
    page-break-inside: avoid;
  }

  .${prefix}document h1, .${prefix}document h2, .${prefix}document h3 {
    page-break-after: avoid;
  }
}
`

  // Add indent to each line
  return styles
    .split("\n")
    .map(line => pad + line)
    .join("\n")
    .trim()
}

/**
 * Add class prefix to HTML content
 */
function addClassPrefix(html, prefix) {
  // Replace inkpen- with custom prefix
  return html.replace(/inkpen-/g, prefix)
}

/**
 * Embed images as base64
 */
function embedImagesAsBase64(html) {
  // This would require async image loading in practice
  // For now, return unchanged (implement with canvas if needed)
  return html
}

/**
 * Indent content for prettier output
 */
function indentContent(content, spaces) {
  const pad = " ".repeat(spaces)
  return content
    .split("\n")
    .map(line => line.trim() ? pad + line : "")
    .join("\n")
}

/**
 * Escape HTML entities
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }
  return text.replace(/[&<>"']/g, char => map[char])
}

/**
 * Download HTML as file
 */
export function downloadHTML(content, filename = "document.html") {
  const blob = new Blob([content], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Copy HTML to clipboard
 */
export async function copyHTMLToClipboard(content) {
  try {
    await navigator.clipboard.writeText(content)
    return true
  } catch (err) {
    console.error("Failed to copy HTML:", err)
    return false
  }
}

/**
 * Get standalone stylesheet content
 */
export function getExportStylesheet(prefix = "inkpen-") {
  return getExportStyles(prefix, 0)
}
