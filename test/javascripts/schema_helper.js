// Test-only TipTap schema + html→doc bridge for round-trip tests.
//
// The production editor builds its schema dynamically in
// editor_controller.js#loadEditorModules. We don't reuse that here because
// (a) it depends on importmap paths only available in the Rails asset
// pipeline, and (b) we want the test schema to be deterministic and
// minimal — just enough to cover the fixtures in fixtures/markdown/.
//
// If a future fixture needs a custom Inkpen extension (callout, toggle,
// columns, etc.), add it to the extensions list here.

import { getSchema } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Link from "@tiptap/extension-link"

import { DOMParser as PMDOMParser } from "@tiptap/pm/model"
import { JSDOM } from "jsdom"

const jsdom = new JSDOM("")

export function buildTestSchema() {
  return getSchema([
    StarterKit,
    Link,
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: false }),
    TableRow,
    TableCell,
    TableHeader
  ])
}

export function htmlToDoc(html, schema) {
  const el = jsdom.window.document.createElement("div")
  el.innerHTML = html
  return PMDOMParser.fromSchema(schema).parse(el)
}
