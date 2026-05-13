// Round-trip fidelity tests for the markdown importer/exporter.
//
// Contract under test (spec 01, plans/01-markdown-roundtrip-fidelity.md):
//   md === exportToMarkdown( htmlToDoc( importFromMarkdown(md).html ), opts )
//
// The html→doc step lives in the test helper (jsdom + PM DOMParser), not
// inside the gem. In production the editor's setContent() does the
// equivalent step against the live schema.
//
// Until step 6 of spec 01 flips the default, we explicitly opt into the
// real parser via `parser: "real"`. With the legacy regex parser these
// tests would all fail the same way they did before.

import { describe, it, expect } from "vitest"
import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

import { exportToMarkdown, importFromMarkdown } from "inkpen/export/markdown"
import { buildTestSchema, htmlToDoc } from "./schema_helper.js"

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "markdown")

const fixtureNames = readdirSync(FIXTURE_DIR)
  .filter((name) => name.endsWith(".md"))
  .sort()

const schema = buildTestSchema()

describe("markdown round-trip fidelity", () => {
  for (const name of fixtureNames) {
    it(name, () => {
      const md = readFileSync(join(FIXTURE_DIR, name), "utf8")

      const { html } = importFromMarkdown(md, schema, { parser: "real" })
      const doc = htmlToDoc(html, schema)
      const out = exportToMarkdown(doc, {})

      expect(out).toBe(md)
    })
  }
})
