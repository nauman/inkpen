// Round-trip fidelity tests for the markdown importer/exporter.
//
// Contract under test (spec 01, plans/01-markdown-roundtrip-fidelity.md):
//   md === exportToMarkdown(importFromMarkdown(md, schema).doc, opts)
//
// Today's importer (markdown.js:73) ignores the `schema` parameter and
// returns `{ html, frontmatter }` — there is no `.doc`. Every fixture is
// therefore expected to fail until spec 01 lands the real parser + adapter
// (steps 4–6 of the plan). The failures here are not bugs to fix in this
// commit; they are the gap, made visible.

import { describe, it, expect } from "vitest"
import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

import { exportToMarkdown, importFromMarkdown } from "inkpen/export/markdown"

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "markdown")

const fixtureNames = readdirSync(FIXTURE_DIR)
  .filter((name) => name.endsWith(".md"))
  .sort()

// No real schema today: importFromMarkdown ignores the argument. Once the
// real parser lands, this will become a TipTap schema built from the gem's
// production extension set in a shared helper.
const SCHEMA = null

describe("markdown round-trip fidelity", () => {
  for (const name of fixtureNames) {
    it(name, () => {
      const md = readFileSync(join(FIXTURE_DIR, name), "utf8")

      const result = importFromMarkdown(md, SCHEMA)

      // First gap: the importer must return a ProseMirror doc, not raw HTML.
      // Today this assertion fails for every fixture.
      expect(result).toHaveProperty("doc")

      const out = exportToMarkdown(result.doc, {})

      // Second gap: the round-trip must be byte-identical for the formats
      // listed in spec 01 S3. Until the parser is real, this can't pass.
      expect(out).toBe(md)
    })
  }
})
