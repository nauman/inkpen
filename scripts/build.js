// Bundle Inkpen into a single network-free ESM file for the host's importmap.
//
// Outputs:
//   app/assets/javascripts/inkpen.bundle.js
//   app/assets/javascripts/inkpen.bundle.js.map (source map)
//
// Spec 05: 107-inkpen-docs/plans/05-vendor-bundle-cdn-decoupling.md

import { build } from "esbuild"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const entry = resolve(root, "app/assets/javascripts/inkpen/index.js")
const outfile = resolve(root, "app/assets/javascripts/inkpen.bundle.js")

// The gem's source uses asset-pipeline import paths like
//   import { Section } from "inkpen/extensions/section"
// These resolve to app/assets/javascripts/inkpen/... in the Rails asset
// pipeline. esbuild needs an alias to find them on disk.
const inkpenSrc = resolve(root, "app/assets/javascripts/inkpen")

await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  // es2022 supports top-level await, which inkpen/index.js uses in the
  // inkpen_table try-block at line 41. All modern browsers (Chrome 89+,
  // Firefox 89+, Safari 15+) support es2022.
  target: "es2022",
  outfile,
  // Host provides these. Keeping them external avoids double-instantiating
  // Stimulus and matches what the importmap will keep pinned upstream.
  external: ["@hotwired/stimulus", "@hotwired/turbo-rails"],
  alias: {
    "inkpen": inkpenSrc
  },
  // Treat .js as JS (esbuild default; explicit for clarity).
  loader: { ".js": "js" },
  // Resolve directories with no extension to <dir>/index.js (matches the
  // Rails importmap behavior for inkpen/extensions/inkpen_table etc.).
  resolveExtensions: [".js", ".mjs"],
  conditions: ["import", "module", "browser", "default"],
  minify: true,
  sourcemap: true,
  legalComments: "linked",
  logLevel: "info"
})

console.log(`✓ Built ${outfile.replace(root + "/", "")}`)
