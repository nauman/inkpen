/**
 * PDF Export
 *
 * Generates PDF documents from TipTap editor content.
 * Uses html2pdf.js if available, otherwise falls back to print dialog.
 */

import { exportToHTML, getExportStylesheet } from "./html"

/**
 * Check if html2pdf.js is available
 */
function hasHtml2Pdf() {
  return typeof window !== "undefined" && typeof window.html2pdf !== "undefined"
}

/**
 * Export editor content to PDF
 *
 * @param {Editor} editor - TipTap editor instance
 * @param {Object} options - Export options
 * @returns {Promise<void>}
 */
export async function exportToPDF(editor, options = {}) {
  const {
    filename = "document.pdf",
    pageSize = "a4",
    orientation = "portrait",
    margins = { top: 20, right: 20, bottom: 20, left: 20 },
    includeHeader = false,
    includeFooter = true,
    footerTemplate = null,
    title = "Document",
    author = null,
    subject = null,
    quality = 2
  } = options

  // Generate styled HTML content
  const html = exportToHTML(editor, {
    includeStyles: true,
    inlineStyles: true,
    includeWrapper: false,
    title
  })

  // Try html2pdf.js first
  if (hasHtml2Pdf()) {
    await generateWithHtml2Pdf(html, {
      filename,
      pageSize,
      orientation,
      margins,
      includeFooter,
      footerTemplate,
      title,
      author,
      subject,
      quality
    })
    return
  }

  // Fallback to print dialog
  printToPDF(html, {
    filename,
    pageSize,
    orientation,
    margins,
    includeFooter,
    footerTemplate,
    title
  })
}

/**
 * Generate PDF using html2pdf.js library
 */
async function generateWithHtml2Pdf(html, options) {
  const {
    filename,
    pageSize,
    orientation,
    margins,
    includeFooter,
    footerTemplate,
    title,
    author,
    subject,
    quality
  } = options

  // Create temporary container
  const container = document.createElement("div")
  container.innerHTML = `
    <div class="inkpen-pdf-content">
      ${html}
    </div>
  `
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    width: ${pageSize === "letter" ? "8.5in" : "210mm"};
    padding: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #000;
    background: #fff;
  `

  // Add styles
  const styleEl = document.createElement("style")
  styleEl.textContent = getExportStylesheet("inkpen-")
  container.prepend(styleEl)

  document.body.appendChild(container)

  try {
    const opt = {
      margin: [margins.top, margins.right, margins.bottom, margins.left],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: quality,
        useCORS: true,
        logging: false
      },
      jsPDF: {
        unit: "mm",
        format: pageSize,
        orientation,
        compress: true
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    }

    // Add metadata
    if (title || author || subject) {
      opt.jsPDF.properties = {}
      if (title) opt.jsPDF.properties.title = title
      if (author) opt.jsPDF.properties.author = author
      if (subject) opt.jsPDF.properties.subject = subject
    }

    await window.html2pdf().set(opt).from(container).save()
  } finally {
    document.body.removeChild(container)
  }
}

/**
 * Fallback: Open print dialog for PDF generation
 */
function printToPDF(html, options) {
  const {
    filename,
    pageSize,
    orientation,
    margins,
    includeFooter,
    title
  } = options

  const printWindow = window.open("", "_blank", "width=800,height=600")

  if (!printWindow) {
    console.error("Failed to open print window. Please allow popups.")
    return
  }

  const styles = getExportStylesheet("inkpen-")

  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title || filename)}</title>
  <style>
    @page {
      size: ${pageSize} ${orientation};
      margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      background: #fff;
    }

    .inkpen-document {
      max-width: none;
      padding: 0;
    }

    ${styles}

    /* Print-specific overrides */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .inkpen-callout,
      .inkpen-toc,
      .inkpen-database,
      blockquote {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      pre {
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow: visible;
      }

      a {
        text-decoration: none;
        color: inherit;
      }

      a[href^="http"]::after {
        content: " (" attr(href) ")";
        font-size: 0.8em;
        color: #666;
      }

      img {
        max-width: 100%;
        page-break-inside: avoid;
      }

      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }

      table, figure, pre {
        page-break-inside: avoid;
      }

      .no-print {
        display: none !important;
      }
    }

    /* Footer with page numbers */
    ${includeFooter ? `
    @page {
      @bottom-center {
        content: counter(page) " of " counter(pages);
        font-size: 10pt;
        color: #666;
      }
    }
    ` : ""}
  </style>
</head>
<body>
  <article class="inkpen-document">
    ${html}
  </article>
  <script>
    window.onload = function() {
      // Short delay to ensure styles are applied
      setTimeout(function() {
        window.print();
        // Close after print dialog closes
        window.onafterprint = function() {
          window.close();
        };
        // Fallback close after timeout
        setTimeout(function() {
          if (!window.closed) {
            window.close();
          }
        }, 1000);
      }, 250);
    };
  </script>
</body>
</html>`)

  printWindow.document.close()
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
  return String(text).replace(/[&<>"']/g, char => map[char])
}

/**
 * Load html2pdf.js dynamically if needed
 *
 * @returns {Promise<boolean>} Whether the library was loaded successfully
 */
export async function loadHtml2Pdf() {
  if (hasHtml2Pdf()) {
    return true
  }

  try {
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
    script.integrity = "sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg=="
    script.crossOrigin = "anonymous"
    script.referrerPolicy = "no-referrer"

    await new Promise((resolve, reject) => {
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })

    return true
  } catch (err) {
    console.warn("Failed to load html2pdf.js, will use print fallback:", err)
    return false
  }
}

/**
 * Check if PDF export is available (with library support)
 */
export function isPDFExportAvailable() {
  return hasHtml2Pdf()
}

/**
 * Get available page sizes
 */
export function getPageSizes() {
  return [
    { id: "a4", name: "A4", width: "210mm", height: "297mm" },
    { id: "letter", name: "Letter", width: "8.5in", height: "11in" },
    { id: "legal", name: "Legal", width: "8.5in", height: "14in" },
    { id: "a3", name: "A3", width: "297mm", height: "420mm" },
    { id: "a5", name: "A5", width: "148mm", height: "210mm" }
  ]
}

/**
 * Get default PDF options
 */
export function getDefaultPDFOptions() {
  return {
    pageSize: "a4",
    orientation: "portrait",
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    includeFooter: true,
    quality: 2
  }
}
