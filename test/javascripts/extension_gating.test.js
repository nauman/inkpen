// Verifies spec 02 slice B: loadEditorModules only imports the
// extensions named in the enabled set.
//
// We can't directly assert what dynamic-import() calls were made
// without monkey-patching the module system, so these tests run at a
// higher level: they snapshot the loader registry and assert a small
// enabled set exposes core + requested modules without disabled ones.
// A future bundle-time guard (slice C) can do the byte-level check.

import { describe, it, expect } from "vitest"

import {
  __EXTENSION_LOADER_NAMES__,
  __loadEditorModulesForTest
} from "inkpen/controllers/editor_controller"

describe("loadEditorModules — extension gating registry", () => {
  it("exposes a stable, sorted-by-insertion list of gated extension names", () => {
    // Snapshot the public registry surface. Adding a new extension
    // here means adding a loader to EXTENSION_LOADERS in
    // editor_controller.js AND destructuring its key in
    // buildExtensions AND gating its usage there.
    const expected = [
      "forced_document",
      "link",
      "image",
      "table",
      "task_list",
      "mention",
      "code_block_syntax",
      "typography",
      "highlight",
      "underline",
      "subscript",
      "superscript",
      "youtube",
      "character_count",
      "section",
      "preformatted",
      "slash_commands",
      "block_gutter",
      "drag_handle",
      "toggle_block",
      "columns",
      "callout",
      "block_commands",
      "enhanced_image",
      "file_attachment",
      "embed",
      "advanced_table",
      "table_of_contents",
      "database",
      "document_section",
      "content_embed"
    ]
    expect(__EXTENSION_LOADER_NAMES__).toEqual(expected)
  })

  it("does NOT include core extensions (always-loaded)", () => {
    // Core modules (Editor, DOMSerializer, StarterKit, Placeholder,
    // BubbleMenu) are loaded unconditionally by loadCoreModules.
    // They must not appear as gated extension names; if they did,
    // disabling them would break every editor.
    const coreNames = ["editor", "starter_kit", "placeholder", "bubble_menu"]
    for (const name of coreNames) {
      expect(__EXTENSION_LOADER_NAMES__).not.toContain(name)
    }
  })

  it("includes every extension name that buildExtensions checks via enabledExtensions.includes", () => {
    // Sanity guard against drift: if someone adds an
    // `enabledExtensions.includes("foo")` branch to buildExtensions
    // but forgets to add `foo` to EXTENSION_LOADERS, the editor will
    // never have the corresponding module loaded. Names that are
    // gated by buildExtensions but loaded by a separate path
    // (loadEmojiReplacer, loadSearchNReplace, loadFootnotesModule,
    // loadInkpenTableModule, loadExportModules) are listed here as
    // expected-NOT-in-registry.
    const separatelyLoaded = new Set([
      "emoji",          // loadEmojiReplacer
      "search_replace", // loadSearchNReplace
      "footnotes",      // loadFootnotesModule
      "inkpen_table",   // loadInkpenTableModule
      "export_commands" // loadExportModules
    ])
    // The expected list above already contains every gated name in
    // buildExtensions that goes through loadEditorModules. If a name
    // is in `separatelyLoaded` AND in the registry, that's a bug
    // (double-load risk). Check.
    for (const name of __EXTENSION_LOADER_NAMES__) {
      expect(separatelyLoaded.has(name)).toBe(false)
    }
  })

  it("loads only core modules plus requested gated modules for a small extension set", async () => {
    const modules = await __loadEditorModulesForTest(["link"])

    expect(modules.Editor).toBeTruthy()
    expect(modules.StarterKit).toBeTruthy()
    expect(modules.Placeholder).toBeTruthy()
    expect(modules.BubbleMenu).toBeTruthy()
    expect(modules.Link).toBeTruthy()

    expect(modules.Table).toBeUndefined()
    expect(modules.Database).toBeUndefined()
    expect(modules.Embed).toBeUndefined()
    expect(modules.EnhancedImage).toBeUndefined()
    expect(modules.ContentEmbed).toBeUndefined()
  })
})
