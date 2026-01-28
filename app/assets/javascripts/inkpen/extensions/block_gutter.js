import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

/**
 * Block Gutter Extension for TipTap
 *
 * Adds a left-side gutter with drag handles and plus buttons for each block.
 * Similar to Notion/Editor.js block handles.
 *
 * Features:
 * - Drag handle (⋮⋮) for block reordering
 * - Plus button (+) to insert new block below
 * - Shows on hover, hides when not focused
 * - Skips blocks inside tables
 * - Integrates with slash commands
 *
 * @example
 * // The gutter appears on block hover:
 * //   ⋮⋮ + │ Heading text
 * //   ⋮⋮ + │ Paragraph content...
 *
 * @since 0.3.1
 */

const BLOCK_GUTTER_KEY = new PluginKey("blockGutter")

export const BlockGutter = Extension.create({
  name: "blockGutter",

  addOptions() {
    return {
      // Show drag handle
      showDragHandle: true,
      // Show plus button
      showPlusButton: true,
      // Class for the gutter container
      gutterClass: "inkpen-block-gutter",
      // Class for the drag handle
      dragClass: "inkpen-block-gutter__drag",
      // Class for the plus button
      plusClass: "inkpen-block-gutter__plus",
      // Block types to skip (don't show gutter)
      skipTypes: ["tableRow", "tableCell", "tableHeader", "listItem", "taskItem"],
      // Parent types to skip (don't show gutter for children)
      skipParentTypes: ["table", "tableRow"],
      // Callback when plus button is clicked
      onPlusClick: null,
      // Callback when drag starts
      onDragStart: null,
      // Callback when drag ends
      onDragEnd: null
    }
  },

  addProseMirrorPlugins() {
    const extension = this
    const editor = this.editor

    return [
      new Plugin({
        key: BLOCK_GUTTER_KEY,

        view(editorView) {
          // Container for all gutters
          const container = document.createElement("div")
          container.className = "inkpen-block-gutter-container"
          container.setAttribute("aria-hidden", "true")

          // Track current gutters
          let gutters = new Map()
          let hoveredPos = null
          let isDragging = false

          // Create gutter element for a block
          const createGutter = (pos, node) => {
            const gutter = document.createElement("div")
            gutter.className = extension.options.gutterClass
            gutter.dataset.pos = pos.toString()
            gutter.dataset.nodeType = node.type.name

            // Drag handle
            if (extension.options.showDragHandle) {
              const dragHandle = document.createElement("button")
              dragHandle.type = "button"
              dragHandle.className = extension.options.dragClass
              dragHandle.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <circle cx="4" cy="3" r="1.5"/>
                <circle cx="10" cy="3" r="1.5"/>
                <circle cx="4" cy="7" r="1.5"/>
                <circle cx="10" cy="7" r="1.5"/>
                <circle cx="4" cy="11" r="1.5"/>
                <circle cx="10" cy="11" r="1.5"/>
              </svg>`
              dragHandle.setAttribute("aria-label", "Drag to reorder")
              dragHandle.setAttribute("draggable", "true")

              dragHandle.addEventListener("mousedown", (e) => {
                e.preventDefault()
                // Select the block when clicking drag handle
                const blockPos = parseInt(gutter.dataset.pos)
                const $pos = editorView.state.doc.resolve(blockPos)
                const nodeAtPos = editorView.state.doc.nodeAt(blockPos)
                if (nodeAtPos) {
                  const selection = editor.state.selection.constructor.near($pos)
                  editor.view.dispatch(editor.state.tr.setSelection(selection))
                }
              })

              dragHandle.addEventListener("dragstart", (e) => {
                isDragging = true
                const blockPos = parseInt(gutter.dataset.pos)
                const nodeAtPos = editorView.state.doc.nodeAt(blockPos)

                // Set drag data
                e.dataTransfer.effectAllowed = "move"
                e.dataTransfer.setData("text/plain", blockPos.toString())
                e.dataTransfer.setData("application/inkpen-block", JSON.stringify({
                  pos: blockPos,
                  type: nodeAtPos?.type.name
                }))

                // Create custom drag image (ghost)
                const ghost = document.createElement("div")
                ghost.className = "inkpen-drag-ghost"
                ghost.textContent = nodeAtPos?.textContent?.slice(0, 50) || nodeAtPos?.type.name || "Block"
                document.body.appendChild(ghost)
                e.dataTransfer.setDragImage(ghost, 0, 0)

                // Remove ghost after drag starts
                requestAnimationFrame(() => {
                  ghost.remove()
                })

                // Add dragging class
                gutter.classList.add("is-dragging")
                editorView.dom.classList.add("is-block-dragging")

                // Callback
                extension.options.onDragStart?.(blockPos, nodeAtPos, e)
              })

              dragHandle.addEventListener("dragend", (e) => {
                isDragging = false
                gutter.classList.remove("is-dragging")
                editorView.dom.classList.remove("is-block-dragging")
                extension.options.onDragEnd?.(e)
              })

              gutter.appendChild(dragHandle)
            }

            // Plus button
            if (extension.options.showPlusButton) {
              const plusBtn = document.createElement("button")
              plusBtn.type = "button"
              plusBtn.className = extension.options.plusClass
              plusBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>`
              plusBtn.setAttribute("aria-label", "Add block below")

              plusBtn.addEventListener("click", (e) => {
                e.preventDefault()
                e.stopPropagation()

                const blockPos = parseInt(gutter.dataset.pos)
                const nodeAtPos = editorView.state.doc.nodeAt(blockPos)
                const insertPos = blockPos + (nodeAtPos?.nodeSize || 1)

                // Insert a new paragraph and focus it
                editor.chain()
                  .focus()
                  .insertContentAt(insertPos, { type: "paragraph" })
                  .setTextSelection(insertPos + 1)
                  .run()

                // If slash commands extension is active, trigger it
                // by inserting "/" character
                setTimeout(() => {
                  if (editor.extensionManager.extensions.find(ext => ext.name === "slashCommands")) {
                    editor.commands.insertContent("/")
                  }
                }, 10)

                // Callback
                extension.options.onPlusClick?.(insertPos, e)
              })

              gutter.appendChild(plusBtn)
            }

            return gutter
          }

          // Position a gutter element
          const positionGutter = (gutter, pos) => {
            try {
              const coords = editorView.coordsAtPos(pos)
              const editorRect = editorView.dom.getBoundingClientRect()

              // Position relative to editor
              gutter.style.top = `${coords.top - editorRect.top}px`
            } catch (e) {
              // Position might be invalid
            }
          }

          // Update all gutters
          const updateGutters = () => {
            const { doc } = editorView.state
            const newGutters = new Map()
            const skipTypes = extension.options.skipTypes || []
            const skipParentTypes = extension.options.skipParentTypes || []

            // Find all top-level blocks
            doc.forEach((node, pos) => {
              // Skip certain node types
              if (skipTypes.includes(node.type.name)) return

              // Check if inside a skipped parent
              const $pos = doc.resolve(pos)
              for (let d = $pos.depth; d > 0; d--) {
                if (skipParentTypes.includes($pos.node(d).type.name)) return
              }

              // Reuse existing gutter or create new one
              let gutter = gutters.get(pos)
              if (!gutter) {
                gutter = createGutter(pos, node)
                container.appendChild(gutter)
              } else {
                // Update data attributes
                gutter.dataset.pos = pos.toString()
                gutter.dataset.nodeType = node.type.name
              }

              positionGutter(gutter, pos)
              newGutters.set(pos, gutter)
            })

            // Remove old gutters
            for (const [pos, gutter] of gutters) {
              if (!newGutters.has(pos)) {
                gutter.remove()
              }
            }

            gutters = newGutters
          }

          // Handle mouse movement to show/hide gutters
          const handleMouseMove = (e) => {
            if (isDragging) return

            const target = e.target
            const editorRect = editorView.dom.getBoundingClientRect()

            // Check if mouse is in gutter area (left side of editor)
            const isInGutterArea = e.clientX < editorRect.left + 60

            if (!isInGutterArea && !target.closest(".inkpen-block-gutter")) {
              // Find which block we're hovering
              const pos = editorView.posAtCoords({ left: editorRect.left + 10, top: e.clientY })
              if (pos) {
                try {
                  const $pos = editorView.state.doc.resolve(pos.pos)
                  // Get the top-level block position (guard against depth 0)
                  const blockPos = $pos.depth > 0 ? $pos.before($pos.depth) : 0

                  if (blockPos !== hoveredPos) {
                    hoveredPos = blockPos
                    // Show only the hovered gutter
                    for (const [gpos, gutter] of gutters) {
                      gutter.classList.toggle("is-visible", gpos === blockPos)
                    }
                  }
                } catch (e) {
                  // Invalid position, ignore
                }
              }
            }
          }

          // Handle mouse enter on gutter area
          const handleGutterEnter = () => {
            // Show all gutters when in gutter area
            for (const gutter of gutters.values()) {
              gutter.classList.add("is-visible")
            }
          }

          // Handle mouse leave from gutter area
          const handleGutterLeave = () => {
            if (isDragging) return
            // Hide all gutters
            for (const gutter of gutters.values()) {
              gutter.classList.remove("is-visible")
            }
            hoveredPos = null
          }

          // Append container to editor wrapper
          const editorWrapper = editorView.dom.parentElement
          if (editorWrapper) {
            editorWrapper.style.position = "relative"
            editorWrapper.appendChild(container)
          }

          // Set up event listeners
          editorView.dom.addEventListener("mousemove", handleMouseMove)
          container.addEventListener("mouseenter", handleGutterEnter)
          container.addEventListener("mouseleave", handleGutterLeave)

          // Initial render
          updateGutters()

          return {
            update(view, prevState) {
              // Only update if document changed
              if (!prevState.doc.eq(view.state.doc)) {
                updateGutters()
              }
            },

            destroy() {
              editorView.dom.removeEventListener("mousemove", handleMouseMove)
              container.removeEventListener("mouseenter", handleGutterEnter)
              container.removeEventListener("mouseleave", handleGutterLeave)
              container.remove()
            }
          }
        }
      })
    ]
  }
})

export default BlockGutter
