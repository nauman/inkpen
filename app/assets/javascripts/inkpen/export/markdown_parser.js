// Real markdown parser, GFM-flavored. Backed by `marked`.
//
// Wired into importFromMarkdown when caller passes `options.parser: "real"`.
// Default remains the legacy regex parser (parseMarkdownToHTML in markdown.js)
// until spec 01 step 6 flips it.
//
// Plan: 107-inkpen-docs/plans/01-markdown-roundtrip-fidelity.md

import { Marked } from "marked"

const real = new Marked({
  gfm: true,
  breaks: true,
  pedantic: false
})

export function parseMarkdownToHTMLReal(markdown) {
  return adaptMarkedHtml(real.parse(markdown, { async: false }))
}

function adaptMarkedHtml(html) {
  return html.replace(/<ul>\n?([\s\S]*?)<\/ul>/g, (match, items) => {
    if (!items.includes('type="checkbox"')) return match

    const taskItems = items.replace(
      /<li><input([^>]*)>\s*([\s\S]*?)<\/li>/g,
      (_item, inputAttrs, body) => {
        const checked = /\bchecked(?:=""|="checked")?/.test(inputAttrs)

        return `<li data-type="taskItem" data-checked="${checked}">${body.trim()}</li>`
      }
    )

    return `<ul data-type="taskList">\n${taskItems}\n</ul>`
  })
}
