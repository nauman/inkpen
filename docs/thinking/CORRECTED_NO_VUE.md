# INKPEN Code Samples - CORRECTED (Stimulus Only, No Vue)

## Complete Code Examples - All Stimulus + Vanilla JavaScript

---

## D. Custom Blocks (CORRECTED - No Vue)

### D1: Custom Block - Hero (Stimulus Implementation)

```ruby
# lib/inkpen/extensions/hero.rb
# frozen_string_literal: true

module Inkpen
  module Extensions
    class Hero < Base
      def name
        :hero
      end

      def background_image_url
        options[:background_image_url]
      end

      def headline
        options[:headline]
      end

      def subheadline
        options[:subheadline]
      end

      def cta_text
        options[:cta_text]
      end

      def cta_url
        options[:cta_url]
      end

      def text_align
        options.fetch(:text_align, "center")
      end

      def dark_overlay?
        options.fetch(:dark_overlay, false)
      end

      def to_config
        {
          backgroundImageUrl: background_image_url,
          headline: headline,
          subheadline: subheadline,
          ctaText: cta_text,
          ctaUrl: cta_url,
          textAlign: text_align,
          darkOverlay: dark_overlay?
        }.compact
      end
    end
  end
end
```

JavaScript (Pure Stimulus - No Vue):

```javascript
// app/javascript/extensions/hero.js
// Pure Stimulus implementation for Hero block

import { Node } from "@tiptap/core"

export const HeroBlock = Node.create({
  name: "hero",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      backgroundImageUrl: { default: null },
      headline: { default: "Your Headline Here" },
      subheadline: { default: "Add a subheadline" },
      ctaText: { default: "Learn More" },
      ctaUrl: { default: "#" },
      textAlign: { default: "center" },
      darkOverlay: { default: false }
    }
  },

  parseHTML() {
    return [{ tag: "hero-block" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "hero-block", ...HTMLAttributes },
      [
        "style",
        `
          background-image: url('${HTMLAttributes.backgroundImageUrl || ""}');
          text-align: ${HTMLAttributes.textAlign};
        `
      ],
      ["div", { class: "hero-overlay" }],
      [
        "div",
        { class: "hero-content" },
        ["h1", { class: "hero-headline" }, HTMLAttributes.headline],
        ["p", { class: "hero-subheadline" }, HTMLAttributes.subheadline],
        [
          "a",
          { href: HTMLAttributes.ctaUrl, class: "hero-cta" },
          HTMLAttributes.ctaText
        ]
      ]
    ]
  },

  addNodeView() {
    return {
      dom: this.createDOM(),
      contentDOM: null,
      update: (node, decorations, innerDecorations) => {
        this.updateDOM(node)
        return true
      }
    }
  },

  createDOM() {
    const dom = document.createElement("div")
    dom.className = "hero-block"
    dom.setAttribute("data-type", "hero")
    return dom
  },

  updateDOM(node) {
    // Update hero block with new attributes
    const { backgroundImageUrl, headline, subheadline, ctaText, ctaUrl, textAlign, darkOverlay } = node.attrs
    
    const heroContent = document.querySelector(".hero-content")
    if (heroContent) {
      heroContent.innerHTML = `
        <h1 class="hero-headline">${headline}</h1>
        <p class="hero-subheadline">${subheadline}</p>
        <a href="${ctaUrl}" class="hero-cta">${ctaText}</a>
      `
    }
  }
})
```

---

## C. Integration Pattern (CORRECTED - Stimulus Only)

### C3: Stimulus Controller (Pure Stimulus - No Vue Dependencies)

```javascript
// app/javascript/controllers/inkpen/editor_controller.js
// Pure Stimulus - no Vue.js, no frameworks

import { Controller } from "@hotwired/stimulus"
import { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import ExtensionsLoader from "../utils/extensions_loader"

export default class extends Controller {
  static targets = ["editor", "content", "title", "autosaveIndicator"]
  static values = { features: String, autosave: Boolean }

  connect() {
    console.log("Inkpen Editor Controller Connected")
    this.initEditor()
  }

  async initEditor() {
    try {
      const config = await this.fetchExtensionsConfig()
      const extensions = await ExtensionsLoader.load(config)
      
      this.editor = new Editor({
        element: this.editorTarget,
        extensions: [
          StarterKit.configure({
            heading: { levels: [1, 2, 3, 4, 5, 6] }
          }),
          ...extensions
        ],
        content: this.contentTarget.value || "",
        onUpdate: ({ editor }) => {
          this.contentTarget.value = editor.getHTML()
          
          if (this.autosaveValue) {
            this.debounce(() => this.autosave(), 1500)
          }
        },
        onSelectionUpdate: ({ editor }) => {
          this.updateToolbarState(editor)
        }
      })

      console.log("Editor initialized successfully")
      this.attachEditorListeners()
      
    } catch (error) {
      console.error("Failed to initialize editor:", error)
      this.showError("Failed to load editor: " + error.message)
    }
  }

  async fetchExtensionsConfig() {
    const response = await fetch(`/inkpen/extensions/${this.featuresValue}.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch extensions: ${response.status}`)
    }
    return await response.json()
  }

  updateToolbarState(editor) {
    // Update toolbar button states based on editor state
    document.querySelectorAll("[data-command]").forEach(btn => {
      const command = btn.dataset.command
      const isActive = this.isCommandActive(editor, command)
      
      if (isActive) {
        btn.classList.add("is-active")
      } else {
        btn.classList.remove("is-active")
      }
    })
  }

  isCommandActive(editor, command) {
    const [name, attr] = command.split(":")
    
    if (name === "bold") return editor.isActive("bold")
    if (name === "italic") return editor.isActive("italic")
    if (name === "underline") return editor.isActive("underline")
    if (name === "strike") return editor.isActive("strike")
    if (name === "heading") {
      const level = parseInt(attr)
      return editor.isActive("heading", { level })
    }
    if (name === "code") return editor.isActive("code")
    if (name === "codeBlock") return editor.isActive("codeBlock")
    if (name === "blockquote") return editor.isActive("blockquote")
    if (name === "bulletList") return editor.isActive("bulletList")
    if (name === "orderedList") return editor.isActive("orderedList")
    if (name === "taskList") return editor.isActive("taskList")
    
    return false
  }

  autosave() {
    if (!this.form) return
    
    const formData = new FormData(this.form)
    
    fetch(this.form.action, {
      method: "PATCH",
      body: formData,
      headers: { 
        "X-CSRF-Token": this.csrfToken,
        "Accept": "application/json"
      }
    })
      .then(r => {
        if (r.ok) {
          this.showAutosaveIndicator()
        } else {
          console.warn("Autosave returned status:", r.status)
        }
      })
      .catch(e => console.error("Autosave failed:", e))
  }

  showAutosaveIndicator() {
    const indicator = this.autosaveIndicatorTarget
    if (!indicator) return
    
    indicator.style.display = "block"
    indicator.textContent = "✓ Saved"
    
    setTimeout(() => {
      indicator.style.display = "none"
    }, 2000)
  }

  showError(message) {
    const errorDiv = document.createElement("div")
    errorDiv.className = "inkpen-error"
    errorDiv.textContent = message
    this.editorTarget.parentNode.insertBefore(errorDiv, this.editorTarget)
    
    setTimeout(() => errorDiv.remove(), 5000)
  }

  attachEditorListeners() {
    // Attach any custom listeners here
    this.editor.on("update", () => {
      console.log("Editor content updated")
    })
  }

  disconnect() {
    if (this.editor) {
      this.editor.destroy()
    }
    clearTimeout(this.debounceTimer)
  }

  debounce(fn, delay) {
    clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(fn, delay)
  }

  get form() {
    return this.element.closest("form")
  }

  get csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content || ""
  }
}
```

### C4: Extensions Loader (Pure Vanilla JavaScript - No Vue)

```javascript
// app/javascript/utils/extensions_loader.js
// Pure vanilla JavaScript - no framework dependencies

import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { lowlight } from "lowlight"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { Mention } from "@tiptap/extension-mention"
import { SlashCommand } from "@tiptap/extension-slash-command"
import tippy from "tippy.js"

export default class ExtensionsLoader {
  static async load(config) {
    const extensions = []

    for (const extConfig of config.extensions) {
      const ext = await this.loadExtension(extConfig)
      if (ext) {
        if (Array.isArray(ext)) {
          extensions.push(...ext)
        } else {
          extensions.push(ext)
        }
      }
    }

    return extensions
  }

  static async loadExtension(config) {
    switch (config.name) {
      case "forced_document":
        return this.configureForcedDocument(config)
      
      case "code_block_syntax":
        return this.configureCodeBlock(config)
      
      case "task_list":
        return this.configureTaskList(config)
      
      case "table":
        return this.configureTable(config)
      
      case "mention":
        return this.configureMention(config)
      
      case "slash_commands":
        return this.configureSlashCommands(config)
      
      default:
        console.warn(`Unknown extension: ${config.name}`)
        return null
    }
  }

  static configureForcedDocument(config) {
    const ForcedDocument = require("@tiptap/extension-forced-document").default
    
    return ForcedDocument.configure({
      titleLevel: config.config.titleLevel,
      titlePlaceholder: config.config.titlePlaceholder,
      subtitle: config.config.subtitle,
      subtitleLevel: config.config.subtitleLevel,
      subtitlePlaceholder: config.config.subtitlePlaceholder,
      allowDeletion: config.config.allowDeletion
    })
  }

  static configureCodeBlock(config) {
    const languages = {}
    
    // Dynamically load language modules
    for (const lang of config.config.languages) {
      try {
        languages[lang] = require(`highlight.js/lib/languages/${lang}`).default
      } catch (e) {
        console.warn(`Language not found: ${lang}`)
      }
    }

    return CodeBlockLowlight.configure({
      lowlight,
      languages,
      defaultLanguage: config.config.defaultLanguage || "javascript"
    })
  }

  static configureTaskList(config) {
    return [
      TaskList.configure({
        nested: config.config.nested,
        textToggle: config.config.textToggle,
        keyboardShortcut: config.config.keyboardShortcut
      }),
      TaskItem.configure({
        nested: config.config.nested
      })
    ]
  }

  static configureTable(config) {
    return [
      Table.configure({
        resizable: config.config.resizable,
        handleWidth: 4,
        cellMinWidth: config.config.cellMinWidth,
        lastColumnResizable: true,
        allowTableNodeSelection: false
      }),
      TableRow,
      TableHeader,
      TableCell
    ]
  }

  static configureMention(config) {
    return Mention.configure({
      HTMLAttributes: { class: "mention" },
      
      suggestion: {
        items: async ({ query }) => {
          if (!query) return []
          
          try {
            const response = await fetch(
              `${config.config.searchUrl}?query=${encodeURIComponent(query)}`
            )
            if (!response.ok) return []
            return await response.json()
          } catch (e) {
            console.error("Mention search failed:", e)
            return []
          }
        },

        render: () => {
          let mentionList = null
          let popup = null

          return {
            onStart: props => {
              // Create mention list using vanilla JavaScript
              mentionList = this.createMentionList(props)
              
              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: mentionList.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start"
              })[0]
            },

            onUpdate(props) {
              if (mentionList) {
                mentionList.update(props)
              }
            },

            onKeyDown(props) {
              if (mentionList) {
                return mentionList.onKeyDown(props)
              }
              return false
            },

            onExit() {
              if (popup) popup.destroy()
              if (mentionList) mentionList.destroy()
            }
          }
        }
      }
    })
  }

  static createMentionList(props) {
    const element = document.createElement("div")
    element.className = "mention-list"
    
    let selectedIndex = 0

    const update = (newProps) => {
      selectedIndex = 0
      
      element.innerHTML = ""
      
      if (newProps.items.length === 0) {
        const emptyItem = document.createElement("div")
        emptyItem.className = "mention-item empty"
        emptyItem.textContent = "No users found"
        element.appendChild(emptyItem)
        return
      }

      newProps.items.forEach((item, index) => {
        const itemEl = document.createElement("div")
        itemEl.className = "mention-item"
        if (index === selectedIndex) itemEl.classList.add("is-selected")
        
        itemEl.innerHTML = `
          <div class="mention-item-avatar">${item.avatar ? `<img src="${item.avatar}" />` : "?"}</div>
          <div class="mention-item-name">${item.label}</div>
        `
        
        itemEl.addEventListener("click", () => {
          newProps.command({ id: item.id, label: item.label })
        })
        
        element.appendChild(itemEl)
      })
    }

    const onKeyDown = (event) => {
      if (event.key === "ArrowUp") {
        selectedIndex = (selectedIndex - 1 + element.children.length) % element.children.length
        updateSelection()
        return true
      }
      
      if (event.key === "ArrowDown") {
        selectedIndex = (selectedIndex + 1) % element.children.length
        updateSelection()
        return true
      }
      
      if (event.key === "Enter") {
        const selectedItem = element.children[selectedIndex]
        if (selectedItem) {
          selectedItem.click()
        }
        return true
      }
      
      return false
    }

    const updateSelection = () => {
      element.querySelectorAll(".mention-item").forEach((item, index) => {
        if (index === selectedIndex) {
          item.classList.add("is-selected")
          item.scrollIntoView({ block: "nearest" })
        } else {
          item.classList.remove("is-selected")
        }
      })
    }

    const destroy = () => {
      element.remove()
    }

    update(props)

    return { element, update, onKeyDown, destroy }
  }

  static configureSlashCommands(config) {
    const commands = config.config.commands

    return SlashCommand.configure({
      suggestion: {
        items: ({ query }) => {
          return commands
            .filter(cmd => 
              cmd.label.toLowerCase().startsWith(query.toLowerCase()) ||
              cmd.description.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, config.config.maxSuggestions)
        },

        render: () => {
          let commandList = null
          let popup = null

          return {
            onStart: props => {
              // Create command palette using vanilla JavaScript
              commandList = this.createCommandPalette(props)
              
              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: commandList.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start"
              })[0]
            },

            onUpdate(props) {
              if (commandList) {
                commandList.update(props)
              }
            },

            onKeyDown(props) {
              if (commandList) {
                return commandList.onKeyDown(props)
              }
              return false
            },

            onExit() {
              if (popup) popup.destroy()
              if (commandList) commandList.destroy()
            }
          }
        }
      }
    })
  }

  static createCommandPalette(props) {
    const element = document.createElement("div")
    element.className = "command-palette"
    
    let selectedIndex = 0
    let items = []

    const update = (newProps) => {
      selectedIndex = 0
      items = newProps.items
      
      element.innerHTML = ""
      
      if (items.length === 0) {
        const emptyItem = document.createElement("div")
        emptyItem.className = "command-item empty"
        emptyItem.textContent = "No commands found"
        element.appendChild(emptyItem)
        return
      }

      items.forEach((cmd, index) => {
        const itemEl = document.createElement("div")
        itemEl.className = "command-item"
        if (index === selectedIndex) itemEl.classList.add("is-selected")
        
        itemEl.innerHTML = `
          <div class="command-icon">${cmd.icon ? `📝` : "•"}</div>
          <div class="command-info">
            <div class="command-name">${cmd.label}</div>
            <div class="command-desc">${cmd.description}</div>
          </div>
          ${cmd.shortcut ? `<div class="command-shortcut">${cmd.shortcut}</div>` : ""}
        `
        
        itemEl.addEventListener("click", () => {
          newProps.command({ name: cmd.name })
        })
        
        element.appendChild(itemEl)
      })
    }

    const onKeyDown = (event) => {
      if (event.key === "ArrowUp") {
        selectedIndex = (selectedIndex - 1 + element.children.length) % element.children.length
        updateSelection()
        return true
      }
      
      if (event.key === "ArrowDown") {
        selectedIndex = (selectedIndex + 1) % element.children.length
        updateSelection()
        return true
      }
      
      if (event.key === "Enter") {
        const selectedItem = element.children[selectedIndex]
        if (selectedItem && !selectedItem.classList.contains("empty")) {
          selectedItem.click()
        }
        return true
      }
      
      return false
    }

    const updateSelection = () => {
      element.querySelectorAll(".command-item").forEach((item, index) => {
        if (index === selectedIndex) {
          item.classList.add("is-selected")
          item.scrollIntoView({ block: "nearest" })
        } else {
          item.classList.remove("is-selected")
        }
      })
    }

    const destroy = () => {
      element.remove()
    }

    update(props)

    return { element, update, onKeyDown, destroy }
  }
}
```

---

## Key Changes Made:

✅ **Removed all Vue.js references**
✅ **Removed VueNodeViewRenderer**
✅ **Removed Vue component files**
✅ **Using pure vanilla JavaScript for dropdowns**
✅ **Using Stimulus for state management**
✅ **Custom list components using DOM API**
✅ **All interactive elements built with vanilla JS**

You were 100% correct - this is **pure Stimulus + vanilla JavaScript throughout**. No Vue, no component frameworks. Everything uses vanilla DOM manipulation.
