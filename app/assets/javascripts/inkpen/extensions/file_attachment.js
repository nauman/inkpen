import { Node, mergeAttributes } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

/**
 * File Attachment Extension for TipTap
 *
 * Upload and display file attachments with:
 * - Drag & drop file upload
 * - File type icons (PDF, Word, Excel, ZIP, etc.)
 * - File size display
 * - Download button
 * - Upload progress indicator
 * - Configurable upload endpoint
 *
 * @since 0.5.0
 */

const FILE_ATTACHMENT_KEY = new PluginKey("fileAttachment")

// File type configurations with icons and colors
const FILE_TYPES = {
  // Documents
  pdf: { icon: "📄", label: "PDF", color: "#dc2626" },
  doc: { icon: "📝", label: "Word", color: "#2563eb" },
  docx: { icon: "📝", label: "Word", color: "#2563eb" },
  txt: { icon: "📃", label: "Text", color: "#6b7280" },
  rtf: { icon: "📃", label: "RTF", color: "#6b7280" },
  odt: { icon: "📝", label: "ODT", color: "#2563eb" },

  // Spreadsheets
  xls: { icon: "📊", label: "Excel", color: "#16a34a" },
  xlsx: { icon: "📊", label: "Excel", color: "#16a34a" },
  csv: { icon: "📊", label: "CSV", color: "#16a34a" },
  ods: { icon: "📊", label: "ODS", color: "#16a34a" },

  // Presentations
  ppt: { icon: "📽", label: "PowerPoint", color: "#ea580c" },
  pptx: { icon: "📽", label: "PowerPoint", color: "#ea580c" },
  odp: { icon: "📽", label: "ODP", color: "#ea580c" },

  // Archives
  zip: { icon: "📦", label: "ZIP", color: "#854d0e" },
  rar: { icon: "📦", label: "RAR", color: "#854d0e" },
  "7z": { icon: "📦", label: "7Z", color: "#854d0e" },
  tar: { icon: "📦", label: "TAR", color: "#854d0e" },
  gz: { icon: "📦", label: "GZ", color: "#854d0e" },

  // Audio
  mp3: { icon: "🎵", label: "MP3", color: "#7c3aed" },
  wav: { icon: "🎵", label: "WAV", color: "#7c3aed" },
  ogg: { icon: "🎵", label: "OGG", color: "#7c3aed" },
  flac: { icon: "🎵", label: "FLAC", color: "#7c3aed" },
  m4a: { icon: "🎵", label: "M4A", color: "#7c3aed" },

  // Video
  mp4: { icon: "🎬", label: "MP4", color: "#db2777" },
  mov: { icon: "🎬", label: "MOV", color: "#db2777" },
  avi: { icon: "🎬", label: "AVI", color: "#db2777" },
  mkv: { icon: "🎬", label: "MKV", color: "#db2777" },
  webm: { icon: "🎬", label: "WebM", color: "#db2777" },

  // Images (fallback, usually handled by image extension)
  png: { icon: "🖼", label: "PNG", color: "#0891b2" },
  jpg: { icon: "🖼", label: "JPG", color: "#0891b2" },
  jpeg: { icon: "🖼", label: "JPEG", color: "#0891b2" },
  gif: { icon: "🖼", label: "GIF", color: "#0891b2" },
  svg: { icon: "🖼", label: "SVG", color: "#0891b2" },
  webp: { icon: "🖼", label: "WebP", color: "#0891b2" },

  // Code
  js: { icon: "⚡", label: "JavaScript", color: "#eab308" },
  ts: { icon: "⚡", label: "TypeScript", color: "#3b82f6" },
  py: { icon: "🐍", label: "Python", color: "#22c55e" },
  rb: { icon: "💎", label: "Ruby", color: "#dc2626" },
  json: { icon: "{}", label: "JSON", color: "#6b7280" },
  xml: { icon: "<>", label: "XML", color: "#6b7280" },
  html: { icon: "🌐", label: "HTML", color: "#ea580c" },
  css: { icon: "🎨", label: "CSS", color: "#3b82f6" },

  // Default
  default: { icon: "📎", label: "File", color: "#6b7280" }
}

// Format file size for display
function formatFileSize(bytes) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

// Get file extension from filename
function getFileExtension(filename) {
  return filename?.split(".").pop()?.toLowerCase() || ""
}

// Get file type config
function getFileType(filename) {
  const ext = getFileExtension(filename)
  return FILE_TYPES[ext] || FILE_TYPES.default
}

export const FileAttachment = Node.create({
  name: "fileAttachment",

  group: "block",

  atom: true,

  draggable: true,

  addOptions() {
    return {
      // Upload configuration
      uploadUrl: null, // If null, uses base64 data URLs
      uploadHeaders: {},
      uploadFieldName: "file",
      // File restrictions
      allowedTypes: null, // null = all, or ["application/pdf", "image/*"]
      maxSize: 10 * 1024 * 1024, // 10MB default
      // Callbacks
      onUploadStart: null,
      onUploadProgress: null,
      onUploadComplete: null,
      onUploadError: null,
      // Custom upload handler (overrides default)
      uploadHandler: null
    }
  },

  addAttributes() {
    return {
      url: {
        default: null
      },
      filename: {
        default: null
      },
      filesize: {
        default: null
      },
      filetype: {
        default: null
      },
      uploadProgress: {
        default: null // null = complete, 0-100 = uploading
      },
      uploadError: {
        default: null
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file-attachment"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const fileType = getFileType(node.attrs.filename)

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "file-attachment",
        class: "inkpen-file"
      }),
      [
        "a",
        {
          href: node.attrs.url,
          download: node.attrs.filename,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "inkpen-file__link"
        },
        [
          "span",
          { class: "inkpen-file__icon", style: `color: ${fileType.color}` },
          fileType.icon
        ],
        [
          "span",
          { class: "inkpen-file__info" },
          [
            "span",
            { class: "inkpen-file__name" },
            node.attrs.filename || "Unknown file"
          ],
          [
            "span",
            { class: "inkpen-file__meta" },
            `${fileType.label} · ${formatFileSize(node.attrs.filesize || 0)}`
          ]
        ],
        [
          "span",
          { class: "inkpen-file__download" },
          "↓"
        ]
      ]
    ]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const extension = this

      // Create container
      const container = document.createElement("div")
      container.className = "inkpen-file"
      container.setAttribute("data-type", "file-attachment")

      // Build the file card
      const buildCard = () => {
        const fileType = getFileType(node.attrs.filename)
        const isUploading = node.attrs.uploadProgress !== null && node.attrs.uploadProgress < 100
        const hasError = node.attrs.uploadError !== null

        container.innerHTML = ""

        if (hasError) {
          // Error state
          container.innerHTML = `
            <div class="inkpen-file__error">
              <span class="inkpen-file__icon">⚠️</span>
              <span class="inkpen-file__info">
                <span class="inkpen-file__name">${node.attrs.filename || "Upload failed"}</span>
                <span class="inkpen-file__meta inkpen-file__meta--error">${node.attrs.uploadError}</span>
              </span>
              <button type="button" class="inkpen-file__retry" title="Retry upload">↻</button>
              <button type="button" class="inkpen-file__remove" title="Remove">×</button>
            </div>
          `

          container.querySelector(".inkpen-file__retry")?.addEventListener("click", () => {
            // Would need to store the original file to retry
            // For now, just remove
          })

          container.querySelector(".inkpen-file__remove")?.addEventListener("click", () => {
            if (typeof getPos === "function") {
              editor.chain().focus().deleteRange({
                from: getPos(),
                to: getPos() + node.nodeSize
              }).run()
            }
          })
        } else if (isUploading) {
          // Uploading state
          container.innerHTML = `
            <div class="inkpen-file__uploading">
              <span class="inkpen-file__icon" style="color: ${fileType.color}">${fileType.icon}</span>
              <span class="inkpen-file__info">
                <span class="inkpen-file__name">${node.attrs.filename}</span>
                <span class="inkpen-file__meta">Uploading... ${Math.round(node.attrs.uploadProgress)}%</span>
              </span>
              <div class="inkpen-file__progress">
                <div class="inkpen-file__progress-bar" style="width: ${node.attrs.uploadProgress}%"></div>
              </div>
            </div>
          `
        } else {
          // Complete state
          const link = document.createElement("a")
          link.href = node.attrs.url || "#"
          link.download = node.attrs.filename
          link.target = "_blank"
          link.rel = "noopener noreferrer"
          link.className = "inkpen-file__link"

          link.innerHTML = `
            <span class="inkpen-file__icon" style="color: ${fileType.color}">${fileType.icon}</span>
            <span class="inkpen-file__info">
              <span class="inkpen-file__name">${node.attrs.filename || "Unknown file"}</span>
              <span class="inkpen-file__meta">${fileType.label} · ${formatFileSize(node.attrs.filesize || 0)}</span>
            </span>
            <span class="inkpen-file__download">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </span>
          `

          container.appendChild(link)
        }
      }

      buildCard()

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "fileAttachment") return false

          node = updatedNode
          buildCard()
          return true
        },
        selectNode: () => {
          container.classList.add("is-selected")
        },
        deselectNode: () => {
          container.classList.remove("is-selected")
        }
      }
    }
  },

  addCommands() {
    return {
      // Insert a file attachment with URL
      insertFileAttachment: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs
        })
      },

      // Upload a file
      uploadFile: (file) => ({ editor, commands }) => {
        const extension = this

        // Validate file type
        if (extension.options.allowedTypes) {
          const allowed = extension.options.allowedTypes.some(type => {
            if (type.endsWith("/*")) {
              return file.type.startsWith(type.replace("/*", ""))
            }
            return file.type === type
          })

          if (!allowed) {
            extension.options.onUploadError?.({
              file,
              error: `File type ${file.type} not allowed`
            })
            return false
          }
        }

        // Validate file size
        if (extension.options.maxSize && file.size > extension.options.maxSize) {
          extension.options.onUploadError?.({
            file,
            error: `File too large. Max size: ${formatFileSize(extension.options.maxSize)}`
          })
          return false
        }

        // Insert placeholder node
        const placeholderAttrs = {
          filename: file.name,
          filesize: file.size,
          filetype: file.type,
          uploadProgress: 0
        }

        commands.insertContent({
          type: this.name,
          attrs: placeholderAttrs
        })

        // Get the position of the inserted node
        const { state } = editor
        const pos = state.selection.from - 1

        // Custom upload handler
        if (extension.options.uploadHandler) {
          extension.options.uploadHandler({
            file,
            onProgress: (progress) => {
              updateNodeAttr(editor, pos, { uploadProgress: progress })
            },
            onComplete: (url) => {
              updateNodeAttr(editor, pos, {
                url,
                uploadProgress: null
              })
              extension.options.onUploadComplete?.({ file, url })
            },
            onError: (error) => {
              updateNodeAttr(editor, pos, {
                uploadProgress: null,
                uploadError: error
              })
              extension.options.onUploadError?.({ file, error })
            }
          })
          return true
        }

        // Default: upload to URL or use base64
        if (extension.options.uploadUrl) {
          uploadToServer(file, extension.options, {
            onProgress: (progress) => {
              updateNodeAttr(editor, pos, { uploadProgress: progress })
            },
            onComplete: (url) => {
              updateNodeAttr(editor, pos, {
                url,
                uploadProgress: null
              })
              extension.options.onUploadComplete?.({ file, url })
            },
            onError: (error) => {
              updateNodeAttr(editor, pos, {
                uploadProgress: null,
                uploadError: error
              })
              extension.options.onUploadError?.({ file, error })
            }
          })
        } else {
          // Use base64 data URL
          const reader = new FileReader()
          reader.onprogress = (e) => {
            if (e.lengthComputable) {
              const progress = (e.loaded / e.total) * 100
              updateNodeAttr(editor, pos, { uploadProgress: progress })
            }
          }
          reader.onload = (e) => {
            const url = e.target?.result
            updateNodeAttr(editor, pos, {
              url,
              uploadProgress: null
            })
            extension.options.onUploadComplete?.({ file, url })
          }
          reader.onerror = () => {
            updateNodeAttr(editor, pos, {
              uploadProgress: null,
              uploadError: "Failed to read file"
            })
            extension.options.onUploadError?.({ file, error: "Failed to read file" })
          }
          reader.readAsDataURL(file)
        }

        extension.options.onUploadStart?.({ file })
        return true
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { selection } = editor.state
        const node = selection.node

        if (node?.type.name === this.name) {
          return editor.commands.deleteSelection()
        }
        return false
      },
      Delete: ({ editor }) => {
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
        key: FILE_ATTACHMENT_KEY,
        props: {
          handleDrop(view, event) {
            const files = event.dataTransfer?.files
            if (!files?.length) return false

            // Filter out images (let image extension handle those)
            const nonImageFiles = Array.from(files).filter(
              file => !file.type.startsWith("image/")
            )

            if (!nonImageFiles.length) return false

            event.preventDefault()

            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
            if (!pos) return false

            // Focus editor and set selection
            view.focus()

            nonImageFiles.forEach(file => {
              extension.editor.commands.uploadFile(file)
            })

            return true
          },

          handlePaste(view, event) {
            const files = event.clipboardData?.files
            if (!files?.length) return false

            // Filter out images
            const nonImageFiles = Array.from(files).filter(
              file => !file.type.startsWith("image/")
            )

            if (!nonImageFiles.length) return false

            event.preventDefault()

            nonImageFiles.forEach(file => {
              extension.editor.commands.uploadFile(file)
            })

            return true
          }
        }
      })
    ]
  }
})

// Helper: Update node attribute at position
function updateNodeAttr(editor, pos, attrs) {
  const { state } = editor
  const node = state.doc.nodeAt(pos)

  if (node && node.type.name === "fileAttachment") {
    editor.view.dispatch(
      state.tr.setNodeMarkup(pos, null, { ...node.attrs, ...attrs })
    )
  }
}

// Helper: Upload file to server
function uploadToServer(file, options, callbacks) {
  const xhr = new XMLHttpRequest()

  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const progress = (e.loaded / e.total) * 100
      callbacks.onProgress(progress)
    }
  })

  xhr.addEventListener("load", () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const response = JSON.parse(xhr.responseText)
        const url = response.url || response.file_url || response.path
        if (url) {
          callbacks.onComplete(url)
        } else {
          callbacks.onError("Invalid server response")
        }
      } catch (e) {
        callbacks.onError("Failed to parse server response")
      }
    } else {
      callbacks.onError(`Upload failed: ${xhr.status}`)
    }
  })

  xhr.addEventListener("error", () => {
    callbacks.onError("Network error during upload")
  })

  xhr.open("POST", options.uploadUrl)

  // Set headers
  Object.entries(options.uploadHeaders || {}).forEach(([key, value]) => {
    xhr.setRequestHeader(key, value)
  })

  // Create form data
  const formData = new FormData()
  formData.append(options.uploadFieldName || "file", file)

  xhr.send(formData)
}

export default FileAttachment
