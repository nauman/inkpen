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
  breaks: false,
  pedantic: false
})

export function parseMarkdownToHTMLReal(markdown) {
  return real.parse(markdown, { async: false })
}
