import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

/**
 * Drag Handle Extension for TipTap
 *
 * Enables drag and drop reordering of blocks. Works in conjunction with
 * the BlockGutter extension which provides the visual drag handles.
 *
 * Features:
 * - Visual drop indicator showing insertion point
 * - Smooth block movement with ProseMirror transactions
 * - Edge scrolling when dragging near viewport edges
 * - Keyboard shortcut for moving blocks (Cmd+Shift+Arrow)
 *
 * @since 0.3.2
 */

const DRAG_HANDLE_KEY = new PluginKey("dragHandle")

export const DragHandle = Extension.create({
  name: "dragHandle",

  addOptions() {
    return {
      // Scroll speed when dragging near edges
      scrollSpeed: 10,
      // Distance from edge to trigger scrolling
      scrollThreshold: 80,
      // Class for drop indicator
      dropIndicatorClass: "inkpen-drop-indicator",
      // Callback when block is moved
      onBlockMoved: null
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-ArrowUp": () => this.editor.commands.moveBlockUp(),
      "Mod-Shift-ArrowDown": () => this.editor.commands.moveBlockDown()
    }
  },

  addCommands() {
    return {
      moveBlockUp: () => ({ state, dispatch }) => {
        return this.moveBlock(state, dispatch, -1)
      },

      moveBlockDown: () => ({ state, dispatch }) => {
        return this.moveBlock(state, dispatch, 1)
      },

      moveBlockToPosition: (fromPos, toPos) => ({ state, dispatch }) => {
        return this.moveBlockTo(state, dispatch, fromPos, toPos)
      }
    }
  },

  moveBlock(state, dispatch, direction) {
    const { selection, doc } = state
    const $from = selection.$from

    // Find the current block
    const depth = $from.depth
    if (depth === 0) return false

    const blockStart = $from.before(depth)
    const blockEnd = $from.after(depth)
    const node = doc.nodeAt(blockStart)

    if (!node) return false

    // Find sibling block
    let targetPos
    if (direction < 0) {
      // Moving up - find previous sibling
      const $blockStart = doc.resolve(blockStart)
      if ($blockStart.nodeBefore) {
        targetPos = blockStart - $blockStart.nodeBefore.nodeSize
      } else {
        return false // Already at top
      }
    } else {
      // Moving down - find next sibling
      const $blockEnd = doc.resolve(blockEnd)
      if ($blockEnd.nodeAfter) {
        targetPos = blockEnd + $blockEnd.nodeAfter.nodeSize
      } else {
        return false // Already at bottom
      }
    }

    if (dispatch) {
      const tr = state.tr

      // Delete from original position
      tr.delete(blockStart, blockEnd)

      // Adjust target position after deletion
      const adjustedPos = targetPos > blockStart ? targetPos - node.nodeSize : targetPos

      // Insert at new position
      tr.insert(adjustedPos, node)

      // Set selection to moved block
      const newPos = adjustedPos + 1
      tr.setSelection(state.selection.constructor.near(tr.doc.resolve(newPos)))

      dispatch(tr.scrollIntoView())
    }

    return true
  },

  moveBlockTo(state, dispatch, fromPos, toPos) {
    const { doc } = state
    const node = doc.nodeAt(fromPos)

    if (!node) return false

    // Don't move if positions are the same
    if (fromPos === toPos) return false

    const nodeSize = node.nodeSize

    if (dispatch) {
      const tr = state.tr

      // Delete from original position
      tr.delete(fromPos, fromPos + nodeSize)

      // Adjust target position after deletion
      const adjustedPos = toPos > fromPos ? toPos - nodeSize : toPos

      // Insert at new position
      tr.insert(adjustedPos, node)

      dispatch(tr.scrollIntoView())
    }

    return true
  },

  addProseMirrorPlugins() {
    const extension = this
    const options = this.options

    return [
      new Plugin({
        key: DRAG_HANDLE_KEY,

        state: {
          init() {
            return {
              isDragging: false,
              draggedPos: null,
              dropPos: null
            }
          },
          apply(tr, value) {
            const meta = tr.getMeta(DRAG_HANDLE_KEY)
            if (meta) {
              return { ...value, ...meta }
            }
            return value
          }
        },

        props: {
          handleDOMEvents: {
            dragover(view, event) {
              // Check if this is a block drag (from our gutter)
              const blockData = event.dataTransfer.types.includes("application/inkpen-block")
              if (!blockData) return false

              event.preventDefault()
              event.dataTransfer.dropEffect = "move"

              // Find drop position
              const coords = { left: event.clientX, top: event.clientY }
              const dropInfo = extension.findDropPosition(view, coords)

              if (dropInfo) {
                extension.showDropIndicator(view, dropInfo)

                // Edge scrolling
                extension.handleEdgeScroll(view, event.clientY)
              }

              return true
            },

            dragleave(view, event) {
              // Only hide if leaving the editor entirely
              const relatedTarget = event.relatedTarget
              if (!view.dom.contains(relatedTarget)) {
                extension.hideDropIndicator(view)
              }
              return false
            },

            drop(view, event) {
              const blockDataStr = event.dataTransfer.getData("application/inkpen-block")
              if (!blockDataStr) return false

              event.preventDefault()

              try {
                const blockData = JSON.parse(blockDataStr)
                const fromPos = blockData.pos

                // Find drop position
                const coords = { left: event.clientX, top: event.clientY }
                const dropInfo = extension.findDropPosition(view, coords)

                if (dropInfo && dropInfo.pos !== fromPos) {
                  // Execute the move
                  const node = view.state.doc.nodeAt(fromPos)
                  if (node) {
                    extension.moveBlockTo(
                      view.state,
                      view.dispatch.bind(view),
                      fromPos,
                      dropInfo.insertPos
                    )

                    // Callback
                    options.onBlockMoved?.(fromPos, dropInfo.insertPos, node)
                  }
                }
              } catch (e) {
                console.error("Drop failed:", e)
              }

              extension.cleanup(view)
              return true
            },

            dragend(view) {
              extension.cleanup(view)
              return false
            }
          }
        },

        view() {
          return {
            destroy() {
              // Clean up any lingering indicators
              document.querySelectorAll(`.${options.dropIndicatorClass}`).forEach(el => el.remove())
            }
          }
        }
      })
    ]
  },

  findDropPosition(view, coords) {
    const { state } = view
    const { doc } = state

    // Get position from coordinates
    const posInfo = view.posAtCoords(coords)
    if (!posInfo) return null

    // Resolve to find the block boundary
    const $pos = doc.resolve(posInfo.pos)

    // Find the top-level block
    let blockPos = null
    let insertBefore = true

    // Walk up to find the top-level block
    for (let d = $pos.depth; d > 0; d--) {
      const node = $pos.node(d)
      const parent = $pos.node(d - 1)

      // Check if this is a direct child of the document
      if (parent.type.name === "doc") {
        blockPos = $pos.before(d)
        break
      }
    }

    // If no block found, use document structure
    if (blockPos === null) {
      // Find the nearest block by iterating through document
      let closestPos = 0
      let closestDistance = Infinity

      doc.forEach((node, pos) => {
        const nodeCoords = view.coordsAtPos(pos)
        const distance = Math.abs(nodeCoords.top - coords.top)

        if (distance < closestDistance) {
          closestDistance = distance
          closestPos = pos
        }
      })

      blockPos = closestPos
    }

    // Determine if we should insert before or after this block
    const blockCoords = view.coordsAtPos(blockPos)
    const node = doc.nodeAt(blockPos)
    const nodeHeight = node ? view.coordsAtPos(blockPos + node.nodeSize).top - blockCoords.top : 20
    const midpoint = blockCoords.top + nodeHeight / 2

    insertBefore = coords.top < midpoint

    // Calculate the actual insertion position
    let insertPos
    if (insertBefore) {
      insertPos = blockPos
    } else {
      insertPos = blockPos + (node?.nodeSize || 0)
    }

    return {
      pos: blockPos,
      insertPos,
      insertBefore,
      coords: insertBefore ? blockCoords : { ...blockCoords, top: blockCoords.top + nodeHeight }
    }
  },

  showDropIndicator(view, dropInfo) {
    const { dropIndicatorClass } = this.options

    // Remove existing indicator
    this.hideDropIndicator(view)

    // Create indicator element
    const indicator = document.createElement("div")
    indicator.className = dropIndicatorClass

    // Position the indicator
    const editorRect = view.dom.getBoundingClientRect()
    const wrapperRect = view.dom.parentElement?.getBoundingClientRect() || editorRect

    indicator.style.position = "absolute"
    indicator.style.left = "0"
    indicator.style.right = "0"
    indicator.style.top = `${dropInfo.coords.top - wrapperRect.top}px`

    // Append to editor wrapper
    const wrapper = view.dom.parentElement
    if (wrapper) {
      wrapper.appendChild(indicator)
    }

    // Store reference for cleanup
    this.dropIndicator = indicator
  },

  hideDropIndicator() {
    if (this.dropIndicator) {
      this.dropIndicator.remove()
      this.dropIndicator = null
    }
  },

  handleEdgeScroll(view, clientY) {
    const { scrollThreshold, scrollSpeed } = this.options
    const viewportHeight = window.innerHeight

    // Cancel any existing scroll animation
    if (this.scrollAnimationId) {
      cancelAnimationFrame(this.scrollAnimationId)
    }

    // Check if near top or bottom edge
    if (clientY < scrollThreshold) {
      // Scroll up
      const intensity = 1 - clientY / scrollThreshold
      this.animateScroll(-scrollSpeed * intensity)
    } else if (clientY > viewportHeight - scrollThreshold) {
      // Scroll down
      const intensity = 1 - (viewportHeight - clientY) / scrollThreshold
      this.animateScroll(scrollSpeed * intensity)
    }
  },

  animateScroll(delta) {
    window.scrollBy(0, delta)

    // Continue scrolling while dragging
    this.scrollAnimationId = requestAnimationFrame(() => {
      // This will be cancelled when drag ends or mouse moves away from edge
    })
  },

  cleanup(view) {
    this.hideDropIndicator(view)

    if (this.scrollAnimationId) {
      cancelAnimationFrame(this.scrollAnimationId)
      this.scrollAnimationId = null
    }

    view.dom.classList.remove("is-block-dragging")
  }
})

export default DragHandle
