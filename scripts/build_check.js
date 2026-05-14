// Static smoke test for the vendored bundle.
//
// Why static: the bundle expects a browser environment (window,
// document, real Stimulus) and trying to execute it under Node always
// fails on the first browser API the bundle touches. That's not a real
// failure — the bundle is for the browser. So we verify:
//
//   1. File exists and is non-empty.
//   2. Node's syntax checker accepts it (no parse errors).
//   3. It exports the public symbols the host imports (EditorController,
//      ToolbarController, StickyToolbarController, all extensions).
//   4. It does NOT reach across the network at boot (no esm.sh / jspm
//      / unpkg / cdn.skypack references).

import { readFileSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import { spawnSync } from "node:child_process"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const bundle = resolve(root, "app/assets/javascripts/inkpen.bundle.js")

const failures = []

// 1. File exists, non-empty.
const stat = statSync(bundle)
console.log(`bundle size: ${stat.size.toLocaleString()} bytes`)
if (stat.size < 100_000) failures.push(`bundle is suspiciously small (${stat.size} bytes)`)

// 2. Syntax check via node --check.
const parse = spawnSync("node", ["--check", bundle], { encoding: "utf8" })
if (parse.status !== 0) {
  failures.push(`node --check failed:\n${parse.stderr}`)
} else {
  console.log("syntax check: ok")
}

// 3. Required exports.
const src = readFileSync(bundle, "utf8")
const exportBlockMatch = src.match(/export\{[^}]+\}\s*;?\s*$/m)
if (!exportBlockMatch) {
  failures.push("no export {...} block found at end of bundle")
} else {
  const symbols = exportBlockMatch[0]
    .replace(/^export\{|\}\s*;?\s*$/g, "")
    .split(",")
    .map((s) => s.trim().split(/\s+as\s+/)[1] || s.trim())
  const required = [
    "EditorController",
    "ToolbarController",
    "StickyToolbarController",
    "AdvancedTable",
    "Callout",
    "Columns",
    "Database",
    "DocumentSection",
    "DragHandle",
    "Embed",
    "EnhancedImage",
    "FileAttachment",
    "InkpenTable",
    "Section",
    "SlashCommands",
    "TableOfContents",
    "ToggleBlock"
  ]
  const missing = required.filter((r) => !symbols.includes(r))
  if (missing.length > 0) {
    failures.push(`missing required exports: ${missing.join(", ")}`)
  } else {
    console.log(`exports: ${symbols.length} symbols (all required present)`)
  }
}

// 4. No CDN references.
const cdnPatterns = [/esm\.sh/, /jspm\.io/, /cdn\.skypack/, /unpkg\.com/]
const found = cdnPatterns.filter((p) => p.test(src))
if (found.length > 0) {
  failures.push(`bundle contains CDN references: ${found.map((p) => p.source).join(", ")}`)
} else {
  console.log("cdn check: no third-party CDN references")
}

if (failures.length > 0) {
  console.error("\n✗ build:check failed")
  failures.forEach((f) => console.error(`  - ${f}`))
  process.exit(1)
}
console.log("\n✓ build:check passed")
