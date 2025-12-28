import { Node, mergeAttributes } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

/**
 * Enhanced Image Extension for TipTap
 *
 * Extends the basic image with:
 * - Resizable images with drag handles
 * - Alignment options: left, center, right, full-width
 * - Image captions (editable text below)
 * - Lightbox preview on double-click
 * - Alt text editing
 * - Link wrapping (make image clickable)
 *
 * @since 0.5.0
 */

const ENHANCED_IMAGE_KEY = new PluginKey("enhancedImage")

export const EnhancedImage = Node.create({
  name: "enhancedImage",

  group: "block",

  atom: true,

  draggable: true,

  addOptions() {
    return {
      // Enable resize handles
      resizable: true,
      // Enable lightbox on double-click
      lightbox: true,
      // Default alignment
      defaultAlignment: "center",
      // Min/max width constraints
      minWidth: 100,
      maxWidth: null, // null = 100% of container
      // Aspect ratio lock during resize
      lockAspectRatio: true,
      // Show alignment controls on selection
      showAlignmentControls: true,
      // Allow captions
      allowCaption: true
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.querySelector("img")?.getAttribute("src"),
        renderHTML: attributes => ({})
      },
      alt: {
        default: null,
        parseHTML: element => element.querySelector("img")?.getAttribute("alt"),
        renderHTML: attributes => ({})
      },
      title: {
        default: null,
        parseHTML: element => element.querySelector("img")?.getAttribute("title"),
        renderHTML: attributes => ({})
      },
      width: {
        default: null,
        parseHTML: element => {
          const img = element.querySelector("img")
          const width = img?.getAttribute("width") || img?.style.width
          return width ? parseInt(width) : null
        },
        renderHTML: attributes => ({})
      },
      alignment: {
        default: "center",
        parseHTML: element => {
          if (element.classList.contains("inkpen-image--left")) return "left"
          if (element.classList.contains("inkpen-image--right")) return "right"
          if (element.classList.contains("inkpen-image--full")) return "full"
          return "center"
        },
        renderHTML: attributes => ({})
      },
      caption: {
        default: null,
        parseHTML: element => element.querySelector(".inkpen-image__caption")?.textContent,
        renderHTML: attributes => ({})
      },
      link: {
        default: null,
        parseHTML: element => element.querySelector("a")?.getAttribute("href"),
        renderHTML: attributes => ({})
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: "figure.inkpen-image"
      },
      {
        tag: "img[src]",
        getAttrs: node => ({
          src: node.getAttribute("src"),
          alt: node.getAttribute("alt"),
          title: node.getAttribute("title"),
          width: node.getAttribute("width")
        })
      }
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const alignment = node.attrs.alignment || "center"
    const classes = ["inkpen-image", `inkpen-image--${alignment}`]

    const figureAttrs = mergeAttributes(HTMLAttributes, {
      class: classes.join(" ")
    })

    const imgAttrs = {
      src: node.attrs.src,
      alt: node.attrs.alt || "",
      title: node.attrs.title
    }

    if (node.attrs.width) {
      imgAttrs.style = `width: ${node.attrs.width}px`
    }

    const children = []

    // Wrap in link if present
    if (node.attrs.link) {
      children.push([
        "a",
        { href: node.attrs.link, target: "_blank", rel: "noopener noreferrer" },
        ["img", imgAttrs]
      ])
    } else {
      children.push(["img", imgAttrs])
    }

    // Add caption if present
    if (node.attrs.caption) {
      children.push(["figcaption", { class: "inkpen-image__caption" }, node.attrs.caption])
    }

    return ["figure", figureAttrs, ...children]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const extension = this

      // Create container
      const container = document.createElement("figure")
      container.className = `inkpen-image inkpen-image--${node.attrs.alignment || "center"}`
      container.setAttribute("data-alignment", node.attrs.alignment || "center")

      // Create image wrapper (for resize handles)
      const imageWrapper = document.createElement("div")
      imageWrapper.className = "inkpen-image__wrapper"

      // Create image element
      const img = document.createElement("img")
      img.src = node.attrs.src
      img.alt = node.attrs.alt || ""
      if (node.attrs.title) img.title = node.attrs.title
      if (node.attrs.width) img.style.width = `${node.attrs.width}px`

      // Wrap in link if present
      if (node.attrs.link) {
        const link = document.createElement("a")
        link.href = node.attrs.link
        link.target = "_blank"
        link.rel = "noopener noreferrer"
        link.appendChild(img)
        imageWrapper.appendChild(link)
      } else {
        imageWrapper.appendChild(img)
      }

      container.appendChild(imageWrapper)

      // Create caption element
      const caption = document.createElement("figcaption")
      caption.className = "inkpen-image__caption"
      caption.contentEditable = "true"
      caption.textContent = node.attrs.caption || ""
      caption.setAttribute("placeholder", "Add a caption...")
      caption.addEventListener("blur", () => {
        if (typeof getPos === "function") {
          const pos = getPos()
          if (pos !== undefined) {
            editor.chain().focus().updateAttributes("enhancedImage", {
              caption: caption.textContent || null
            }).run()
          }
        }
      })
      caption.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          caption.blur()
        }
      })
      container.appendChild(caption)

      // Create alignment controls
      const controls = document.createElement("div")
      controls.className = "inkpen-image__controls"
      controls.innerHTML = `
        <button type="button" class="inkpen-image__control" data-alignment="left" title="Align left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="15" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <button type="button" class="inkpen-image__control" data-alignment="center" title="Align center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="6" y1="12" x2="18" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <button type="button" class="inkpen-image__control" data-alignment="right" title="Align right">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="9" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <button type="button" class="inkpen-image__control" data-alignment="full" title="Full width">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <span class="inkpen-image__divider"></span>
        <button type="button" class="inkpen-image__control" data-action="alt" title="Edit alt text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button type="button" class="inkpen-image__control" data-action="link" title="Add link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>
      `

      // Handle alignment button clicks
      controls.addEventListener("click", (e) => {
        const button = e.target.closest("button")
        if (!button) return

        const alignment = button.dataset.alignment
        const action = button.dataset.action

        if (alignment) {
          editor.chain().focus().setImageAlignment(alignment).run()
        } else if (action === "alt") {
          const newAlt = prompt("Enter alt text:", node.attrs.alt || "")
          if (newAlt !== null) {
            editor.chain().focus().updateAttributes("enhancedImage", { alt: newAlt }).run()
          }
        } else if (action === "link") {
          const newLink = prompt("Enter link URL:", node.attrs.link || "")
          if (newLink !== null) {
            editor.chain().focus().setImageLink(newLink || null).run()
          }
        }
      })

      container.appendChild(controls)

      // Create resize handles
      if (extension.options.resizable) {
        const handles = ["nw", "ne", "sw", "se"]
        handles.forEach(position => {
          const handle = document.createElement("div")
          handle.className = `inkpen-image__resize-handle inkpen-image__resize-handle--${position}`
          handle.addEventListener("mousedown", (e) => {
            e.preventDefault()
            startResize(e, position, img, editor, getPos, extension.options)
          })
          imageWrapper.appendChild(handle)
        })
      }

      // Lightbox on double-click
      if (extension.options.lightbox) {
        img.addEventListener("dblclick", (e) => {
          e.preventDefault()
          openLightbox(node.attrs.src, node.attrs.alt)
        })
      }

      // Update active alignment button
      const updateActiveAlignment = () => {
        const alignment = node.attrs.alignment || "center"
        controls.querySelectorAll("[data-alignment]").forEach(btn => {
          btn.classList.toggle("is-active", btn.dataset.alignment === alignment)
        })
      }
      updateActiveAlignment()

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "enhancedImage") return false

          // Update image
          img.src = updatedNode.attrs.src
          img.alt = updatedNode.attrs.alt || ""
          if (updatedNode.attrs.title) img.title = updatedNode.attrs.title
          img.style.width = updatedNode.attrs.width ? `${updatedNode.attrs.width}px` : ""

          // Update alignment
          container.className = `inkpen-image inkpen-image--${updatedNode.attrs.alignment || "center"}`
          container.setAttribute("data-alignment", updatedNode.attrs.alignment || "center")

          // Update caption
          if (document.activeElement !== caption) {
            caption.textContent = updatedNode.attrs.caption || ""
          }

          // Update active button
          controls.querySelectorAll("[data-alignment]").forEach(btn => {
            btn.classList.toggle("is-active", btn.dataset.alignment === (updatedNode.attrs.alignment || "center"))
          })

          return true
        },
        selectNode: () => {
          container.classList.add("is-selected")
        },
        deselectNode: () => {
          container.classList.remove("is-selected")
        },
        destroy: () => {
          // Cleanup if needed
        }
      }
    }
  },

  addCommands() {
    return {
      setEnhancedImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options
        })
      },

      setImageAlignment: (alignment) => ({ commands, state }) => {
        return commands.updateAttributes(this.name, { alignment })
      },

      setImageWidth: (width) => ({ commands }) => {
        return commands.updateAttributes(this.name, { width })
      },

      setImageCaption: (caption) => ({ commands }) => {
        return commands.updateAttributes(this.name, { caption })
      },

      setImageLink: (link) => ({ commands }) => {
        return commands.updateAttributes(this.name, { link })
      },

      setImageAlt: (alt) => ({ commands }) => {
        return commands.updateAttributes(this.name, { alt })
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      // Remove image on backspace/delete when selected
      "Backspace": ({ editor }) => {
        const { selection } = editor.state
        const node = selection.node

        if (node?.type.name === this.name) {
          return editor.commands.deleteSelection()
        }
        return false
      },
      "Delete": ({ editor }) => {
        const { selection } = editor.state
        const node = selection.node

        if (node?.type.name === this.name) {
          return editor.commands.deleteSelection()
        }
        return false
      }
    }
  },

  addProseMirrorPlugins() {
    const extension = this

    return [
      new Plugin({
        key: ENHANCED_IMAGE_KEY,
        props: {
          // Handle image paste
          handlePaste(view, event) {
            const items = event.clipboardData?.items
            if (!items) return false

            for (const item of items) {
              if (item.type.startsWith("image/")) {
                event.preventDefault()

                const file = item.getAsFile()
                if (!file) continue

                // Convert to base64 for now
                // In production, you'd upload to a server
                const reader = new FileReader()
                reader.onload = (e) => {
                  const src = e.target?.result
                  if (typeof src === "string") {
                    view.dispatch(
                      view.state.tr.replaceSelectionWith(
                        view.state.schema.nodes.enhancedImage.create({ src })
                      )
                    )
                  }
                }
                reader.readAsDataURL(file)

                return true
              }
            }

            return false
          },

          // Handle image drop
          handleDrop(view, event) {
            const files = event.dataTransfer?.files
            if (!files?.length) return false

            const imageFiles = Array.from(files).filter(file =>
              file.type.startsWith("image/")
            )

            if (!imageFiles.length) return false

            event.preventDefault()

            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
            if (!pos) return false

            imageFiles.forEach(file => {
              const reader = new FileReader()
              reader.onload = (e) => {
                const src = e.target?.result
                if (typeof src === "string") {
                  const node = view.state.schema.nodes.enhancedImage.create({ src })
                  const tr = view.state.tr.insert(pos.pos, node)
                  view.dispatch(tr)
                }
              }
              reader.readAsDataURL(file)
            })

            return true
          }
        }
      })
    ]
  }
})

// Helper: Start resize
function startResize(e, position, img, editor, getPos, options) {
  const startX = e.clientX
  const startY = e.clientY
  const startWidth = img.offsetWidth
  const startHeight = img.offsetHeight
  const aspectRatio = startWidth / startHeight

  const onMouseMove = (moveEvent) => {
    let newWidth

    if (position.includes("e")) {
      newWidth = startWidth + (moveEvent.clientX - startX)
    } else {
      newWidth = startWidth - (moveEvent.clientX - startX)
    }

    // Apply constraints
    if (options.minWidth) newWidth = Math.max(newWidth, options.minWidth)
    if (options.maxWidth) newWidth = Math.min(newWidth, options.maxWidth)

    img.style.width = `${newWidth}px`

    if (options.lockAspectRatio) {
      img.style.height = `${newWidth / aspectRatio}px`
    }
  }

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)

    // Update node attribute
    if (typeof getPos === "function") {
      const width = parseInt(img.style.width)
      editor.chain().focus().setImageWidth(width).run()
    }
  }

  document.addEventListener("mousemove", onMouseMove)
  document.addEventListener("mouseup", onMouseUp)
}

// Helper: Open lightbox
function openLightbox(src, alt) {
  const overlay = document.createElement("div")
  overlay.className = "inkpen-lightbox"
  overlay.innerHTML = `
    <div class="inkpen-lightbox__backdrop"></div>
    <div class="inkpen-lightbox__content">
      <img src="${src}" alt="${alt || ""}" />
      <button type="button" class="inkpen-lightbox__close" aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `

  const close = () => {
    overlay.classList.add("is-closing")
    setTimeout(() => overlay.remove(), 200)
  }

  overlay.querySelector(".inkpen-lightbox__backdrop").addEventListener("click", close)
  overlay.querySelector(".inkpen-lightbox__close").addEventListener("click", close)
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close()
  })

  document.body.appendChild(overlay)
  overlay.querySelector(".inkpen-lightbox__close").focus()

  // Animate in
  requestAnimationFrame(() => overlay.classList.add("is-open"))
}

export default EnhancedImage
