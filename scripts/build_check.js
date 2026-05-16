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

// 5. No duplicate prosemirror-state in node_modules.
//
// Lesson 10 (2026-05-16): when two different versions of
// prosemirror-state coexist in node_modules (top-level + nested under
// @tiptap/pm), esbuild bundles both, and TipTap's plugin registration
// fails with "Adding different instances of a keyed plugin (plugin$)"
// in production. PluginKey identity is class-based — two prosemirror-
// state classes = collision on every plugin. The editor silently
// refuses to initialize.
//
// This guard counts prosemirror-state copies in node_modules and fails
// the build if there's more than one.
const { execSync } = await import("node:child_process")
const nodeModules = resolve(root, "node_modules")
try {
  const out = execSync(
    `find "${nodeModules}" -path "*/prosemirror-state/package.json" -not -path "*/.*" 2>/dev/null`,
    { encoding: "utf8" }
  )
  const copies = out.trim().split("\n").filter(Boolean)
  if (copies.length > 1) {
    failures.push(
      `prosemirror-state has ${copies.length} copies in node_modules ` +
      `(must be 1; will cause "Adding different instances of a keyed plugin" ` +
      `runtime error). Run \`rm -rf node_modules package-lock.json && npm install\` ` +
      `to dedupe. Copies found:\n  ` + copies.join("\n  ")
    )
  } else {
    console.log(`dedup check: prosemirror-state has 1 copy (no duplication)`)
  }
} catch (e) {
  console.log(`dedup check: skipped (${e.message})`)
}

if (failures.length > 0) {
  console.error("\n✗ build:check failed")
  failures.forEach((f) => console.error(`  - ${f}`))
  process.exit(1)
}
console.log("\n✓ build:check passed")
