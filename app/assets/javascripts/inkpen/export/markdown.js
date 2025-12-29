/**
 * Markdown Export/Import
 *
 * Converts TipTap/ProseMirror document to/from GitHub-Flavored Markdown (GFM).
 * Supports frontmatter, tables, task lists, callouts, and custom blocks.
 */

// Mark serializers for inline formatting
const MARK_SERIALIZERS = {
  bold: (text) => `**${text}**`,
  strong: (text) => `**${text}**`,
  italic: (text) => `_${text}_`,
  em: (text) => `_${text}_`,
  strike: (text) => `~~${text}~~`,
  code: (text) => `\`${text}\``,
  link: (text, mark) => `[${text}](${mark.attrs.href}${mark.attrs.title ? ` "${mark.attrs.title}"` : ""})`,
  underline: (text) => `<u>${text}</u>`,
  highlight: (text, mark) => mark.attrs.color
    ? `<mark style="background:${mark.attrs.color}">${text}</mark>`
    : `==${text}==`,
  subscript: (text) => `<sub>${text}</sub>`,
  superscript: (text) => `<sup>${text}</sup>`
}

// Callout type mappings for GFM-style alerts
const CALLOUT_MAP = {
  info: "NOTE",
  note: "NOTE",
  tip: "TIP",
  warning: "WARNING",
  success: "TIP",
  error: "CAUTION"
}

/**
 * Export editor document to Markdown
 *
 * @param {Object} doc - ProseMirror document
 * @param {Object} options - Export options
 * @returns {string} Markdown content
 */
export function exportToMarkdown(doc, options = {}) {
  const {
    includeFrontmatter = false,
    frontmatter = {},
    imageStyle = "inline",
    linkStyle = "inline"
  } = options

  let markdown = ""

  // Add frontmatter if provided
  if (includeFrontmatter && Object.keys(frontmatter).length > 0) {
    markdown += "---\n"
    markdown += serializeFrontmatter(frontmatter)
    markdown += "---\n\n"
  }

  // Serialize document content
  markdown += serializeNode(doc, { imageStyle, linkStyle })

  return markdown.trim() + "\n"
}

/**
 * Import Markdown content to ProseMirror document
 *
 * @param {string} markdown - Markdown content
 * @param {Object} schema - ProseMirror schema
 * @param {Object} options - Import options
 * @returns {Object} { doc, frontmatter }
 */
export function importFromMarkdown(markdown, schema, options = {}) {
  // Parse frontmatter if present
  const { content, frontmatter } = parseFrontmatter(markdown)

  // Parse markdown to HTML first (using browser or a simple parser)
  const html = parseMarkdownToHTML(content)

  // Return structured result
  return {
    html,
    frontmatter
  }
}

/**
 * Serialize frontmatter object to YAML
 */
function serializeFrontmatter(data) {
  return Object.entries(data)
    .map(([key, value]) => {
      if (typeof value === "string") {
        // Quote strings with special characters
        if (value.includes(":") || value.includes("#") || value.includes("\n")) {
          return `${key}: "${value.replace(/"/g, '\\"')}"`
        }
        return `${key}: ${value}`
      }
      if (Array.isArray(value)) {
        return `${key}:\n${value.map(v => `  - ${v}`).join("\n")}`
      }
      if (typeof value === "object" && value !== null) {
        return `${key}: ${JSON.stringify(value)}`
      }
      return `${key}: ${value}`
    })
    .join("\n") + "\n"
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(markdown) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/
  const match = markdown.match(frontmatterRegex)

  if (!match) {
    return { content: markdown, frontmatter: {} }
  }

  const frontmatterStr = match[1]
  const content = markdown.slice(match[0].length)

  // Simple YAML parser (handles basic key: value pairs)
  const frontmatter = {}
  const lines = frontmatterStr.split("\n")

  for (const line of lines) {
    const colonIndex = line.indexOf(":")
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      let value = line.slice(colonIndex + 1).trim()

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }

      frontmatter[key] = value
    }
  }

  return { content, frontmatter }
}

/**
 * Serialize a ProseMirror node to Markdown
 */
function serializeNode(node, options = {}, depth = 0) {
  if (!node) return ""

  const type = node.type?.name || node.type

  switch (type) {
    case "doc":
      return serializeChildren(node, options)

    case "paragraph":
      return serializeParagraph(node, options) + "\n\n"

    case "heading":
      return "#".repeat(node.attrs.level) + " " + serializeInlineContent(node) + "\n\n"

    case "bulletList":
      return serializeList(node, options, "-") + "\n"

    case "orderedList":
      return serializeOrderedList(node, options) + "\n"

    case "taskList":
      return serializeTaskList(node, options) + "\n"

    case "listItem":
      return serializeChildren(node, options)

    case "taskItem":
      const checked = node.attrs.checked ? "x" : " "
      return `[${checked}] ` + serializeChildren(node, options).trim()

    case "blockquote":
      return serializeBlockquote(node, options) + "\n"

    case "codeBlock":
      return serializeCodeBlock(node) + "\n\n"

    case "preformatted":
      return "```\n" + node.textContent + "\n```\n\n"

    case "horizontalRule":
      return "---\n\n"

    case "hardBreak":
      return "  \n"

    case "image":
    case "enhancedImage":
      return serializeImage(node, options) + "\n\n"

    case "table":
    case "advancedTable":
      return serializeTable(node, options) + "\n"

    case "callout":
      return serializeCallout(node, options) + "\n"

    case "toggleBlock":
      return serializeToggle(node, options) + "\n"

    case "columns":
      return serializeColumns(node, options) + "\n"

    case "section":
      return serializeChildren(node, options)

    case "youtube":
      return `[![YouTube](https://img.youtube.com/vi/${extractYoutubeId(node.attrs.src)}/0.jpg)](${node.attrs.src})\n\n`

    case "embed":
      return `[${node.attrs.provider || "Embed"}](${node.attrs.url})\n\n`

    case "fileAttachment":
      return `[📎 ${node.attrs.filename}](${node.attrs.url})\n\n`

    case "tableOfContents":
      return "<!-- Table of Contents -->\n\n"

    case "database":
      return serializeDatabase(node, options) + "\n"

    case "text":
      return serializeTextWithMarks(node)

    default:
      // Fallback: try to serialize children or text content
      if (node.content) {
        return serializeChildren(node, options)
      }
      return node.textContent || ""
  }
}

/**
 * Serialize children nodes
 */
function serializeChildren(node, options) {
  if (!node.content) return ""

  let result = ""
  const children = node.content.content || node.content

  if (Array.isArray(children)) {
    for (const child of children) {
      result += serializeNode(child, options)
    }
  } else if (typeof children.forEach === "function") {
    children.forEach(child => {
      result += serializeNode(child, options)
    })
  }

  return result
}

/**
 * Serialize paragraph node
 */
function serializeParagraph(node, options) {
  return serializeInlineContent(node)
}

/**
 * Serialize inline content (text with marks)
 */
function serializeInlineContent(node) {
  if (!node.content) return ""

  let result = ""
  const children = node.content.content || node.content

  const iterate = (items) => {
    if (Array.isArray(items)) {
      for (const item of items) {
        result += serializeTextWithMarks(item)
      }
    } else if (typeof items.forEach === "function") {
      items.forEach(item => {
        result += serializeTextWithMarks(item)
      })
    }
  }

  iterate(children)
  return result
}

/**
 * Serialize text node with marks
 */
function serializeTextWithMarks(node) {
  if (!node) return ""

  let text = node.text || ""

  if (!node.marks || node.marks.length === 0) {
    return text
  }

  // Apply marks in order (innermost first)
  for (const mark of node.marks) {
    const serializer = MARK_SERIALIZERS[mark.type?.name || mark.type]
    if (serializer) {
      text = serializer(text, mark)
    }
  }

  return text
}

/**
 * Serialize bullet/unordered list
 */
function serializeList(node, options, marker) {
  let result = ""
  const children = node.content?.content || node.content || []

  const iterate = (items, callback) => {
    if (Array.isArray(items)) {
      items.forEach(callback)
    } else if (typeof items.forEach === "function") {
      items.forEach(callback)
    }
  }

  iterate(children, (item) => {
    const content = serializeNode(item, options).trim()
    const lines = content.split("\n")
    result += `${marker} ${lines[0]}\n`
    // Indent continuation lines
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        result += `  ${lines[i]}\n`
      }
    }
  })

  return result
}

/**
 * Serialize ordered list
 */
function serializeOrderedList(node, options) {
  let result = ""
  let index = node.attrs?.start || 1
  const children = node.content?.content || node.content || []

  const iterate = (items, callback) => {
    if (Array.isArray(items)) {
      items.forEach(callback)
    } else if (typeof items.forEach === "function") {
      items.forEach(callback)
    }
  }

  iterate(children, (item) => {
    const content = serializeNode(item, options).trim()
    const lines = content.split("\n")
    result += `${index}. ${lines[0]}\n`
    // Indent continuation lines
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        result += `   ${lines[i]}\n`
      }
    }
    index++
  })

  return result
}

/**
 * Serialize task list
 */
function serializeTaskList(node, options) {
  let result = ""
  const children = node.content?.content || node.content || []

  const iterate = (items, callback) => {
    if (Array.isArray(items)) {
      items.forEach(callback)
    } else if (typeof items.forEach === "function") {
      items.forEach(callback)
    }
  }

  iterate(children, (item) => {
    const content = serializeNode(item, options).trim()
    result += `- ${content}\n`
  })

  return result
}

/**
 * Serialize blockquote
 */
function serializeBlockquote(node, options) {
  const content = serializeChildren(node, options).trim()
  return content.split("\n").map(line => `> ${line}`).join("\n") + "\n"
}

/**
 * Serialize code block
 */
function serializeCodeBlock(node) {
  const language = node.attrs?.language || ""
  return "```" + language + "\n" + node.textContent + "\n```"
}

/**
 * Serialize image
 */
function serializeImage(node, options) {
  const alt = node.attrs?.alt || ""
  const src = node.attrs?.src || ""
  const title = node.attrs?.title || ""
  const caption = node.attrs?.caption || ""

  let md = `![${alt}](${src}${title ? ` "${title}"` : ""})`

  // Add caption as italic text below
  if (caption) {
    md += `\n*${caption}*`
  }

  return md
}

/**
 * Serialize table to GFM format
 */
function serializeTable(node, options) {
  const rows = []
  let headerRow = null
  let columnAligns = []

  const children = node.content?.content || node.content || []

  const iterate = (items, callback) => {
    if (Array.isArray(items)) {
      items.forEach(callback)
    } else if (typeof items.forEach === "function") {
      items.forEach(callback)
    }
  }

  iterate(children, (row, rowIndex) => {
    const cells = []
    const rowChildren = row.content?.content || row.content || []

    iterate(rowChildren, (cell, cellIndex) => {
      const content = serializeInlineContent(cell).trim() || " "
      cells.push(content)

      // Track alignment from first row cells
      if (rowIndex === 0) {
        const align = cell.attrs?.align || "left"
        columnAligns.push(align)
      }
    })

    if (rowIndex === 0) {
      // Header row
      headerRow = "| " + cells.join(" | ") + " |"
      rows.push(headerRow)

      // Separator row with alignment
      const separators = columnAligns.map(align => {
        if (align === "center") return ":---:"
        if (align === "right") return "---:"
        return "---"
      })
      rows.push("| " + separators.join(" | ") + " |")
    } else {
      rows.push("| " + cells.join(" | ") + " |")
    }
  })

  return rows.join("\n") + "\n"
}

/**
 * Serialize callout to GFM-style alert
 */
function serializeCallout(node, options) {
  const type = CALLOUT_MAP[node.attrs?.type] || "NOTE"
  const emoji = node.attrs?.emoji || ""
  const content = serializeChildren(node, options).trim()

  // GFM alert syntax
  let result = `> [!${type}]`
  if (emoji) {
    result += ` ${emoji}`
  }
  result += "\n"
  result += content.split("\n").map(line => `> ${line}`).join("\n")
  result += "\n"

  return result
}

/**
 * Serialize toggle/details block
 */
function serializeToggle(node, options) {
  const summary = node.attrs?.summary || "Details"
  const content = serializeChildren(node, options).trim()

  return `<details>\n<summary>${summary}</summary>\n\n${content}\n\n</details>\n`
}

/**
 * Serialize columns layout
 */
function serializeColumns(node, options) {
  let result = ""
  const children = node.content?.content || node.content || []

  const iterate = (items, callback) => {
    if (Array.isArray(items)) {
      items.forEach(callback)
    } else if (typeof items.forEach === "function") {
      items.forEach(callback)
    }
  }

  iterate(children, (column, index) => {
    if (index > 0) {
      result += "\n---\n\n"
    }
    result += serializeChildren(column, options)
  })

  return result
}

/**
 * Serialize database to table format
 */
function serializeDatabase(node, options) {
  const title = node.attrs?.title || "Database"
  const properties = node.attrs?.properties || []
  const rows = node.attrs?.rows || []

  let result = `**${title}**\n\n`

  if (properties.length === 0 || rows.length === 0) {
    return result + "*Empty database*\n"
  }

  // Header row
  result += "| " + properties.map(p => p.name).join(" | ") + " |\n"
  result += "| " + properties.map(() => "---").join(" | ") + " |\n"

  // Data rows
  for (const row of rows) {
    const cells = properties.map(prop => {
      const value = row[prop.id]
      if (value === null || value === undefined) return ""
      if (typeof value === "boolean") return value ? "✓" : ""
      if (Array.isArray(value)) return value.join(", ")
      return String(value)
    })
    result += "| " + cells.join(" | ") + " |\n"
  }

  return result
}

/**
 * Extract YouTube video ID from URL
 */
function extractYoutubeId(url) {
  if (!url) return ""
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
  return match ? match[1] : ""
}

/**
 * Simple markdown to HTML parser (basic implementation)
 * For production, consider using a proper markdown parser like marked or remark
 */
function parseMarkdownToHTML(markdown) {
  let html = markdown

  // Escape HTML
  html = html.replace(/&/g, "&amp;")
  html = html.replace(/</g, "&lt;")
  html = html.replace(/>/g, "&gt;")

  // Headings
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>")
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>")
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>")
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")
  html = html.replace(/_(.+?)_/g, "<em>$1</em>")

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<s>$1</s>")

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr>")
  html = html.replace(/^\*\*\*$/gm, "<hr>")

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code${lang ? ` class="language-${lang}"` : ""}>${code.trim()}</code></pre>`
  })

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>")

  // Task lists
  html = html.replace(/^-\s+\[x\]\s+(.+)$/gm, '<li><input type="checkbox" checked disabled> $1</li>')
  html = html.replace(/^-\s+\[\s\]\s+(.+)$/gm, '<li><input type="checkbox" disabled> $1</li>')

  // Unordered lists
  html = html.replace(/^-\s+(.+)$/gm, "<li>$1</li>")
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")

  // Paragraphs
  html = html.replace(/\n\n+/g, "</p><p>")
  html = "<p>" + html + "</p>"

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "")
  html = html.replace(/<p>(<h[1-6]>)/g, "$1")
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, "$1")
  html = html.replace(/<p>(<ul>)/g, "$1")
  html = html.replace(/(<\/ul>)<\/p>/g, "$1")
  html = html.replace(/<p>(<blockquote>)/g, "$1")
  html = html.replace(/(<\/blockquote>)<\/p>/g, "$1")
  html = html.replace(/<p>(<pre>)/g, "$1")
  html = html.replace(/(<\/pre>)<\/p>/g, "$1")
  html = html.replace(/<p>(<hr>)<\/p>/g, "$1")

  return html
}

/**
 * Download markdown as file
 */
export function downloadMarkdown(content, filename = "document.md") {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
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
 * Copy markdown to clipboard
 */
export async function copyMarkdownToClipboard(content) {
  try {
    await navigator.clipboard.writeText(content)
    return true
  } catch (err) {
    console.error("Failed to copy markdown:", err)
    return false
  }
}
