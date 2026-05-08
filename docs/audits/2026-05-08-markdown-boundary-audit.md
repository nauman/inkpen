# Inkpen Markdown Boundary Audit

Date: 2026-05-08

Scope: Audit of the claim that Inkpen needed a separate boundary for markdown support, with emphasis on load, stability, and maintenance cost. No code changes.

## Bottom Line

The markdown blocker is real, but the claimed boundary is only partly justified.

Inkpen already has an editor lifecycle boundary through `Inkpen::Editor`, the Stimulus controller, and markdown mode data attributes. What is not justified is the idea that the current markdown implementation is already isolated, lightweight, or safe enough to treat as a clean boundary for Nodepad. The actual weak points are the markdown import/export path and the fact that the JS entrypoint still eagerly pulls a very wide module graph.

## Findings

### 1. Markdown import/export is the real risk, not the existence of a boundary

`app/assets/javascripts/inkpen/export/markdown.js` still uses a simple regex-based parser. It explicitly says it is a basic implementation and recommends a real parser for production.

Evidence:
- `importFromMarkdown()` converts markdown to HTML through `parseMarkdownToHTML()` rather than a schema-aware parser.
- `parseMarkdownToHTML()` handles headings, emphasis, links, images, lists, task items, and tables only in a shallow way.
- `taskList` serialization exists, but the import side does not have a real markdown parser for round-tripping complex content.

Impact:
- Notes with tables, task lists, callouts, custom nodes, or mixed HTML can mutate on import/export.
- A markdown-first host cannot treat this as a stable round-trip boundary yet.

Source refs:
- `app/assets/javascripts/inkpen/export/markdown.js:42-85`
- `app/assets/javascripts/inkpen/export/markdown.js:442-482`
- `app/assets/javascripts/inkpen/export/markdown.js:591-655`

### 2. The load-cost claim is overstated

The current JS boundary is not small. `app/javascript/application.js` imports `inkpen` on every page that loads the application bundle, and `app/assets/javascripts/inkpen/index.js` statically imports a large set of custom extensions plus a top-level lazy import for `inkpen_table`.

`editor_controller.js` then lazy-loads the editor modules, but the loader still imports the full TipTap and custom extension set in one shot before checking which extensions are enabled. That means extension toggles do not materially reduce first-editor download cost.

Impact:
- The claim that the modal only pays a small, isolated markdown/editor boundary cost is not accurate.
- The claim that this is already a tight load boundary is not accurate either.

Source refs:
- `app/javascript/application.js:3-6`
- `app/assets/javascripts/inkpen/index.js:19-47`
- `app/assets/javascripts/inkpen/controllers/editor_controller.js:12-102`

### 3. The editor controller is too broad to be a stable markdown boundary

`app/assets/javascripts/inkpen/controllers/editor_controller.js` is 2,050 lines. It owns module loading, editor bootstrap, autosave, selection events, export/import, markdown mode, split sync, toolbar interaction, and fallback behavior.

That is not a clean boundary. It is a coordination hub with too many responsibilities for a feature that is supposed to be stable and fast.

Impact:
- Hard to reason about markdown-only behavior without reading the entire controller.
- Hard to keep the markdown path isolated from unrelated editor concerns.
- Hard to optimize load or round-trip behavior because the code is centralized but not separated by concern.

Source refs:
- `app/assets/javascripts/inkpen/controllers/editor_controller.js:12-102`
- `app/assets/javascripts/inkpen/controllers/editor_controller.js:333-372`
- `app/assets/javascripts/inkpen/controllers/editor_controller.js:1432-1480`
- `app/assets/javascripts/inkpen/controllers/editor_controller.js:1816-2049`

### 4. The event contract is a real API boundary, but it must be used exactly

Inkpen dispatches events as `inkpen:${name}`. That is the actual contract exposed by the controller.

Impact:
- Any wrapper expecting a different event name is not using the real boundary.
- The markdown integration should key off `inkpen:ready`, `inkpen:change`, and `inkpen:mode-change`, not a guessed alias.

Source refs:
- `app/assets/javascripts/inkpen/controllers/editor_controller.js:1694-1709`
- `app/views/inkpen/_editor.html.erb:17-38`

### 5. The current configuration objects are clean, but they do not solve the markdown problem

`Inkpen::Editor`, `Inkpen::MarkdownMode`, and `Inkpen::Configuration` are reasonably shaped POROs. They give you a real Ruby-side boundary for editor configuration. That part is fine.

But these classes only describe configuration. They do not guarantee markdown correctness, browser load weight, or runtime isolation.

Source refs:
- `lib/inkpen/editor.rb:38-203`
- `lib/inkpen/markdown_mode.rb:32-212`
- `lib/inkpen/configuration.rb:27-175`

## What The Boundary Should Actually Be

If the goal is stable markdown editing, the useful boundary is not "Claude boundary" as a wrapper idea. It is:

1. A smaller JS entrypoint for markdown-related capabilities.
2. A schema-aware markdown import/export path.
3. A controller split so markdown mode is not buried inside the full editor lifecycle.
4. A strict event contract between host and editor.

That gives you a real separation of concerns. It also makes performance measurable, because you can track the bytes and runtime cost of the markdown surface separately from the rest of Inkpen.

## Recommendation

Treat the current markdown mode as partially implemented, not boundary-complete.

Short version:
- The boundary exists at the config and event level.
- The boundary does not exist at the bundle-size level.
- The boundary does not exist at the markdown fidelity level.
- The boundary does not exist at the controller-ownership level.

## Acceptance Criteria For A Real Markdown Boundary

1. Markdown import/export round-trips representative notes without silent mutation.
2. The editor can load markdown features without pulling the full editor graph.
3. `inkpen:ready` is the documented and tested readiness event.
4. Markdown mode has its own focused tests, not just broad editor coverage.
5. The controller stops being the place where every editor concern meets.

## Notes

- I did not run a browser performance trace in this audit.
- I did not change source files.
- Existing dirty files in the Inkpen repo were left untouched.
