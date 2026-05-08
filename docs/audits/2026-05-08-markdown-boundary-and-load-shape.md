---
title: Inkpen audit — markdown boundary and load shape
date: 2026-05-08
author: Staff engineer review (read-only)
status: findings only, no code changes
scope: claims made by a downstream consumer (Nodepad / NP-322 Slice 2) that Inkpen is ready
       to replace a CodeMirror 6 markdown host inside a modal note editor
related: ../../ROADMAP.md, ../../MARKDOWN_MODE.md
---

# Audit — Inkpen markdown boundary and load shape

## Why this audit exists

A downstream Nodepad handoff proposed wiring Inkpen into a per-note modal as a drop-in
replacement for a CodeMirror 6 markdown host. Two claims gated that decision:

1. **"The load is already paid"** — because the host app's `application.js` already
   imports Inkpen, the modal pays no extra download cost.
2. **"Inkpen round-trips markdown"** — wiring is `markdown → importMarkdown() →
   exportMarkdown() → markdown` with WYSIWYG editing in between.

Both claims are **partially true and partially wrong** against today's source. This
document grounds each claim in current Inkpen code so the gem-side fixes can be planned
deliberately, instead of being implicit dependencies of someone else's slice.

The lens is the staff-engineer rubric in the host app's `docs/agents/staff_engineer.md`:
make claims measurable, prefer reversible slices, separate "ship now" from "needs gem
work first."

---

## TL;DR

Inkpen is **not yet** the right markdown editor for a notes modal that persists raw
markdown. It can become the right editor with three bounded changes inside the gem.

| Claim                                       | Verdict                | Evidence                                  |
| ------------------------------------------- | ---------------------- | ----------------------------------------- |
| Load is already paid                        | True for download…     | `application.js` imports `"inkpen"`       |
| …no runtime cost on first editor mount      | **False**              | `loadEditorModules` Promise.all of ~40    |
| Markdown export is production-grade         | True for emitted MD    | `export/markdown.js` serializers          |
| Markdown **import** is production-grade     | **False — regex toy**  | `parseMarkdownToHTML` lines 591–668       |
| Round-trip is lossless for tables/tasks     | **False**              | No table parsing; tasks become raw HTML   |
| Public ready event is `inkpen--editor:ready`| **False**              | Dispatched as `inkpen:ready`              |
| Disabling extensions reduces first download | **False**              | All extensions loaded before gating       |

The fastest safe slice is **gem-side hardening first**, then host-app wiring. The
inverse order (wire first, harden later) silently mutates user notes the moment a note
with a table or a task list is opened and closed.

---

## Findings

### 1. Markdown import is a regex pass with a self-described "basic" disclaimer

`app/assets/javascripts/inkpen/export/markdown.js:591-594`:

```js
/**
 * Simple markdown to HTML parser (basic implementation)
 * For production, consider using a proper markdown parser like marked or remark
 */
function parseMarkdownToHTML(markdown) {
```

What it handles: ATX headings, bold/italic/strike, inline code, links, images, fenced
code blocks, blockquotes (single-line only), unordered/ordered lists (flat only),
horizontal rules, paragraphs.

What it does **not** handle:

- **GFM tables** — there is no pipe-table branch at all. Yet `serializeTable`
  (`markdown.js:444`) emits GFM tables. So `import → export` of any table is **lossy by
  construction**: the table arrives as plain text, gets paragraph-wrapped, and on export
  is re-emitted as text. The original table is gone.
- **Task lists in TipTap form** — `parseMarkdownToHTML:642` rewrites `- [x] foo` to
  `<li><input type="checkbox" checked disabled> foo</li>`. TipTap's `taskList`/`taskItem`
  schema expects a `<ul data-type="taskList">` with `<li data-type="taskItem"
  data-checked="true">`. The regex output does not match this shape. The exporter
  (`markdown.js:386`, `serializeTaskList`) only emits `- [x]` syntax when the *node* is a
  `taskList`. So `- [x]` round-trips as `- [x]` only if the user re-checks the box inside
  TipTap; if they don't touch it, it can degrade to a plain bullet.
- **Nested lists**, **multi-line blockquotes**, **reference-style links**, **footnotes**,
  **HTML embedded in markdown**, **frontmatter inside content** (frontmatter is stripped
  at the top by `parseFrontmatter` at line 114, which is fine — but only at the top).
- **Setext headings** (`===` / `---` underlines).
- **Indented code blocks** (4-space).

This asymmetry — rich exporter, regex importer — is the single most consequential
finding. Any consumer that stores raw markdown and trusts Inkpen as a round-trip will
**silently mutate documents** the first time a non-trivial note is opened and closed.

**Risk class:** data-loss-on-read. The damage happens before the user types.

**What "fixed" looks like:** swap `parseMarkdownToHTML` for `marked` or `remark` (already
called out in the disclaimer comment), with a thin adapter that emits HTML matching
TipTap's expected schema for tables and task lists. Accompanied by a Vitest fixture
suite that asserts `md → import → export === md` for representative documents.

---

### 2. The hidden input holds HTML, not markdown — by design today

`app/assets/javascripts/inkpen/controllers/editor_controller.js:1179-1191`:

```js
syncContent(editor) {
  …
  const html = editor.getHTML()
  this.inputTarget.value = html
}
```

This is correct for Inkpen's primary use case (Rails forms posting HTML for ActionText-
adjacent storage). It is **wrong by default** for a consumer that persists raw markdown
and expects the hidden input to mirror what their server stores.

`getMarkdown()` exists (line 2033) and `MarkdownMode` (`lib/inkpen/markdown_mode.rb`) is
real. But:

- `getMarkdown()` is `async` because it lazy-loads `loadExportModules()` on every call.
- There is no built-in option to make `syncContent` write **markdown** to the hidden
  input. A consumer wiring autosave on `inkpen:change` must wait for the change event
  *and then* `await controller.getMarkdown()` and write that themselves. That is a small
  but real rough edge — and async-vs-sync autosave is exactly the second risk the
  downstream handoff flagged.

**Not a bug. A missing affordance.** A `data-inkpen-editor-sync-format-value="markdown"`
option that switches `syncContent` to call `getMarkdown()` would let consumers opt in
without bespoke glue.

---

### 3. Disabling extensions does not reduce first-mount download

`editor_controller.js:12-101`:

```js
async function loadEditorModules() {
  if (cachedModules) return cachedModules
  const [ … ~40 modules … ] = await Promise.all([
    import("@tiptap/core"),
    import("@tiptap/pm/model"),
    …
    import("inkpen/extensions/database"),
    import("inkpen/extensions/document_section"),
    import("inkpen/extensions/content_embed")
  ])
```

The gating on `enabledExtensions` (line 392) happens *after* the `Promise.all` resolves.
That means a consumer that explicitly disables `:database`, `:embed`, `:enhanced_image`,
`:advanced_table`, `:file_attachment`, `:drag_handle`, `:columns`,
`:table_of_contents`, `:document_section`, `:content_embed` still pays the full
download.

Combined with `index.js` (lines 19–36) which **statically** imports every custom
extension at module-eval time, the cost shows up the moment Inkpen is imported anywhere
in the host bundle, not lazily on first editor mount.

**Measurement:** total Inkpen JS surface is ~393 KB on disk before TipTap (per `wc -c`
across `app/assets/javascripts/inkpen/**/*.js`). `editor_controller.js` alone is
2,050 lines / ~62 KB. TipTap + ProseMirror + lowlight add the bulk of the rest at
runtime through the dynamic imports.

**What "fixed" looks like:** a core/lite split. Two real moves:

1. Stop static-importing custom extensions in `index.js`. Re-export them only from
   `inkpen/extensions/*` paths so consumers and `loadEditorModules` import them on
   demand.
2. In `loadEditorModules`, gate each `import()` on `this.extensionsValue.includes(name)`
   so the `Promise.all` only contains what is actually needed. Keep core
   (`@tiptap/core`, `pm/model`, `starter-kit`, `placeholder`, `link`,
   `character-count`, `bubble-menu`) unconditional.

This is the single change that makes the "load is already paid" claim honest. Today,
Inkpen is paid even when the consumer asked for a small subset.

---

### 4. The public "ready" event is `inkpen:ready`, not `inkpen--editor:ready`

`editor_controller.js:1695-1702`:

```js
dispatchEvent(name, detail = {}) {
  this.element.dispatchEvent(
    new CustomEvent(`inkpen:${name}`, {
      bubbles: true,
      detail: { ...detail, controller: this }
    })
  )
}
```

The downstream handoff documented `inkpen--editor:ready` (the Stimulus
`controller--event` form). Inkpen ships the shorter `inkpen:` namespace. Both happen to
bubble, so the wrong listener simply never fires — silently. This is a documentation
problem more than a code problem.

**What "fixed" looks like:** call out the canonical event names in
`README.md`/`MARKDOWN_MODE.md`: `inkpen:ready`, `inkpen:change`, `inkpen:focus`,
`inkpen:blur`, `inkpen:selection-change`, `inkpen:autosave`, `inkpen:mode-change`,
`inkpen:error`. One short table, near the top.

---

### 5. There are zero round-trip tests

`test/test_markdown_mode.rb` covers configuration only — `enabled?`, `default_mode`,
`toggle_placement`, etc. Nothing exercises the JS importer/exporter pair. There is no
Vitest/JSDOM harness in the gem, so the markdown boundary is currently **unverified
end-to-end**.

Given finding #1, this is the highest-leverage gap. A 30-line fixture harness
(`md → importFromMarkdown → exportToMarkdown → md`) over a folder of representative
markdown documents would have caught the table problem on day one. It also gives the
gem a regression net for the eventual `marked`/`remark` swap.

---

### 6. Nodepad fullscreen layout doesn't load Inkpen CSS

This is host-app context but it affects any consumer claiming "Inkpen is already
loaded." The host's `application.html.erb` includes Inkpen styles; its
`tools_fullscreen.html.erb` does not. So a slice that mounts an Inkpen editor inside the
fullscreen layout will get an unstyled or partially-styled editor. Not a gem bug; a
deployment-time gotcha worth documenting in the README's "Installation" section as a
single-paragraph caveat.

---

## What this means for the consumer's decision

The downstream proposal's "ship Inkpen as Slice 2 because the load is already paid" is
correct about download cost on the second-and-later page (Inkpen JS is cached) and
**wrong** about:

- runtime instantiation cost on first editor mount (still ~40 dynamic imports,
  network-bound on first hit per session if the bundle isn't fully primed),
- markdown round-trip safety (regex importer, no table support),
- API documentation accuracy (event name).

Reversing the order is cheap and safe: do gem work first, ship to the consumer second.

---

## Recommended gem-side work, in order

Each item is a self-contained, reversible slice. None require breaking changes.

### Slice A — Round-trip test harness (highest priority)

- Add Vitest to the gem's dev dependencies.
- Add `test/javascripts/markdown_round_trip.test.js` with fixtures under
  `test/javascripts/fixtures/markdown/*.md`: simple paragraph, headings, ordered list,
  unordered list, **task list**, **GFM table**, blockquote, fenced code, link, image,
  mixed document.
- Assert `md === exportToMarkdown(importFromMarkdown(md, schema), opts)` for each.
- Expected outcome: failing tests for tables and task lists. **Land them as pending /
  `.todo`** so the regressions are visible without blocking releases.

This slice is pure documentation-via-tests. It changes no production code.

### Slice B — Replace `parseMarkdownToHTML` with a real parser

- Add `marked` or `remark` (`marked` is smaller and synchronous; `remark` is more
  correct).
- Write an HTML adapter that produces the shape TipTap expects for `taskList` /
  `taskItem` and for `table` / `tableRow` / `tableCell` / `tableHeader`.
- Flip the Vitest fixtures from pending to active.
- Bonus: emit a structured warning (via `inkpen:error` with a `kind: "markdown-import"`
  detail) when a fragment can't be represented in the active extension set, so
  consumers can decide whether to reject, fall back, or accept.

### Slice C — Optional `sync-format` value on the editor controller

- Add `sync: { type: String, default: "html" }` (values: `"html"`, `"markdown"`).
- In `syncContent`, branch on `this.syncValue`. For `markdown`, fire-and-forget an
  `await this.getMarkdown()` and write its result.
- Document on `MARKDOWN_MODE.md`.

This unlocks markdown-native consumers without forcing them to write the glue and
makes the autosave-vs-async risk a gem-level concern (debounced inside the controller)
rather than every consumer's problem.

### Slice D — True extension gating in `loadEditorModules`

- Move every custom-extension `import()` into a conditional based on
  `this.extensionsValue`.
- Stop static-importing custom extensions from `index.js`; re-export them only from
  their own paths.
- Add a `test/javascripts/extension_gating.test.js` that mounts an editor with
  `extensions: [:link]` and asserts `database`, `embed`, `enhanced_image`,
  `advanced_table`, `database`, `content_embed` modules were never loaded (mock
  `import` and assert).

This is the slice that makes the "load is already paid" claim honest in a meaningful
way: a consumer asking for a lite editor gets a lite download.

### Slice E — Documentation pass

- Event-name table near the top of `README.md`.
- Round-trip caveats and current limitations in `MARKDOWN_MODE.md` (until Slice B
  lands).
- Note about CSS being separate from JS in `README.md`'s Installation section.

---

## What this audit deliberately does NOT do

- Recommend Inkpen for or against the Nodepad slice. That is the host app's call once
  the gem-side gaps above are visible.
- Touch any code in the gem. Single-character edits open scope; the work above
  deserves dedicated, testable PRs.
- Assess the Ruby side beyond `markdown_mode.rb` and `editor.rb`, both of which read as
  small, well-shaped POROs and are not the bottleneck.

---

## Verification artifacts

Lines and files referenced in this audit, all on `main` of `02-addons/inkpen` as of
2026-05-08:

- `app/assets/javascripts/inkpen/controllers/editor_controller.js`
  - `loadEditorModules` — lines 12–101 (no extension gating)
  - `syncContent` — lines 1179–1191 (HTML, not markdown)
  - `dispatchEvent` — lines 1695–1702 (`inkpen:` namespace)
  - `getMarkdown` — line 2033 (async, lazy-loads exporter)
- `app/assets/javascripts/inkpen/export/markdown.js`
  - `parseMarkdownToHTML` — lines 591–668 (regex importer with disclaimer)
  - `serializeTable` — line 444 (GFM table emitter, not matched by importer)
  - `serializeTaskList` — line 386 (task-list emitter)
- `app/assets/javascripts/inkpen/index.js` — lines 4–36 (static imports of all custom
  extensions)
- `test/test_markdown_mode.rb` — config-only coverage; no JS round-trip tests in gem
