import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

/**
 * Block Commands Extension for TipTap
 *
 * Adds block-level operations like selection, duplication, and deletion.
 * Part of Phase 3 polish for BlockNote-style editing experience.
 *
 * Features:
 * - Block selection via gutter click
 * - Multi-block selection with Shift+Click
 * - Duplicate block (Cmd+D)
 * - Delete empty block (Backspace)
 * - Select all content in block (Cmd+A when block selected)
 *
 * @since 0.4.0
 */

const BLOCK_COMMANDS_KEY = new PluginKey("blockCommands")

export const BlockCommands = Extension.create({
  name: "blockCommands",

  addOptions() {
    return {
      // Class for selected blocks
      selectedClass: "is-selected",
      // Enable block selection via gutter
      enableGutterSelection: true
    }
  },

  addCommands() {
    return {
      // Duplicate the current block
      duplicateBlock: () => ({ state, dispatch }) => {
        const { selection, doc } = state
        const { $from } = selection

        // Find the current block
        let blockPos = null
        let blockNode = null

        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          const parent = $from.node(d - 1)

          if (parent.type.name === "doc") {
            blockPos = $from.before(d)
            blockNode = node
            break
          }
        }

        if (blockPos === null || !blockNode) return false

        if (dispatch) {
          const insertPos = blockPos + blockNode.nodeSize
          const tr = state.tr.insert(insertPos, blockNode.copy(blockNode.content))

          // Move cursor to the duplicated block
          const newBlockStart = insertPos + 1
          tr.setSelection(state.selection.constructor.near(tr.doc.resolve(newBlockStart)))

          dispatch(tr.scrollIntoView())
        }

        return true
      },

      // Delete the current block
      deleteBlock: () => ({ state, dispatch }) => {
        const { selection, doc } = state
        const { $from } = selection

        // Find the current block
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          const parent = $from.node(d - 1)

          if (parent.type.name === "doc") {
            const pos = $from.before(d)

            // Don't delete if it's the only block
            if (doc.childCount <= 1) return false

            if (dispatch) {
              const tr = state.tr.delete(pos, pos + node.nodeSize)
              dispatch(tr.scrollIntoView())
            }

            return true
          }
        }

        return false
      },

      // Select the entire current block
      selectBlock: () => ({ state, dispatch, editor }) => {
        const { selection, doc } = state
        const { $from } = selection

        // Find the current block
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          const parent = $from.node(d - 1)

          if (parent.type.name === "doc") {
            const pos = $from.before(d)

            if (dispatch) {
              // Use NodeSelection to select the whole block
              const NodeSelection = state.selection.constructor.name === "NodeSelection"
                ? state.selection.constructor
                : require("@tiptap/pm/state").NodeSelection

              const tr = state.tr.setSelection(
                NodeSelection.create(doc, pos)
              )
              dispatch(tr)
            }

            return true
          }
        }

        return false
      },

      // Select block at a specific position
      selectBlockAt: (pos) => ({ state, dispatch }) => {
        const { doc } = state
        const node = doc.nodeAt(pos)

        if (!node) return false

        if (dispatch) {
          const { NodeSelection } = require("@tiptap/pm/state")
          const tr = state.tr.setSelection(NodeSelection.create(doc, pos))
          dispatch(tr)
        }

        return true
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      // Duplicate block
      "Mod-d": () => {
        // Prevent default browser bookmark action
        return this.editor.commands.duplicateBlock()
      },

      // Delete block when empty
      Backspace: ({ editor }) => {
        const { state } = editor
        const { selection, doc } = state
        const { $from, empty } = selection

        // Only handle if selection is empty (just cursor)
        if (!empty) return false

        // Check if we're at the start of an empty block
        const parentOffset = $from.parentOffset

        if (parentOffset !== 0) return false

        // Check if the parent is empty
        const parent = $from.parent
        if (parent.textContent !== "") return false

        // Check if we're in a top-level block
        const grandParent = $from.node($from.depth - 1)
        if (grandParent && grandParent.type.name !== "doc") return false

        // Don't delete the last remaining block
        if (doc.childCount <= 1) return false

        return editor.commands.deleteBlock()
      }
    }
  },

  addProseMirrorPlugins() {
    const extension = this

    return [
      new Plugin({
        key: BLOCK_COMMANDS_KEY,

        state: {
          init() {
            return {
              selectedBlocks: new Set()
            }
          },
          apply(tr, value, oldState, newState) {
            const meta = tr.getMeta(BLOCK_COMMANDS_KEY)
            if (meta) {
              return { ...value, ...meta }
            }
            // Clear selection on document change
            if (tr.docChanged) {
              return { selectedBlocks: new Set() }
            }
            return value
          }
        },

        props: {
          decorations(state) {
            const pluginState = BLOCK_COMMANDS_KEY.getState(state)
            if (!pluginState || pluginState.selectedBlocks.size === 0) {
              return DecorationSet.empty
            }

            const decorations = []

            pluginState.selectedBlocks.forEach(pos => {
              const node = state.doc.nodeAt(pos)
              if (node) {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: extension.options.selectedClass
                  })
                )
              }
            })

            return DecorationSet.create(state.doc, decorations)
          },

          handleClick(view, pos, event) {
            // Handle gutter clicks for block selection
            const target = event.target

            if (!target.closest(".inkpen-block-gutter__drag")) {
              return false
            }

            const gutter = target.closest(".inkpen-block-gutter")
            if (!gutter) return false

            const blockPos = parseInt(gutter.dataset.pos)
            if (isNaN(blockPos)) return false

            const { state } = view
            const pluginState = BLOCK_COMMANDS_KEY.getState(state)
            const currentSelected = new Set(pluginState.selectedBlocks)

            if (event.shiftKey) {
              // Toggle selection for multi-select
              if (currentSelected.has(blockPos)) {
                currentSelected.delete(blockPos)
              } else {
                currentSelected.add(blockPos)
              }
            } else {
              // Single select
              currentSelected.clear()
              currentSelected.add(blockPos)
            }

            view.dispatch(
              state.tr.setMeta(BLOCK_COMMANDS_KEY, {
                selectedBlocks: currentSelected
              })
            )

            return true
          },

          handleKeyDown(view, event) {
            const { state } = view
            const pluginState = BLOCK_COMMANDS_KEY.getState(state)

            // Clear selection on Escape
            if (event.key === "Escape" && pluginState.selectedBlocks.size > 0) {
              view.dispatch(
                state.tr.setMeta(BLOCK_COMMANDS_KEY, {
                  selectedBlocks: new Set()
                })
              )
              return true
            }

            return false
          }
        }
      })
    ]
  }
})

export default BlockCommands
