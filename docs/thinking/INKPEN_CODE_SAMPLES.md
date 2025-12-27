# Inkpen: Code Samples & Implementation Reference
## Complete Code Examples for INKPEN_MASTER_GUIDE.md

This document contains all detailed code samples referenced in the master guide.

---

## A. Extension Classes

### A1: ForcedDocument

```ruby
# lib/inkpen/extensions/forced_document.rb
# frozen_string_literal: true

module Inkpen
  module Extensions
    class ForcedDocument < Base
      DEFAULT_TITLE_LEVEL = 1
      DEFAULT_SUBTITLE_LEVEL = 2
      DEFAULT_TITLE_PLACEHOLDER = "Untitled"
      DEFAULT_SUBTITLE_PLACEHOLDER = "Add a subtitle..."

      def name
        :forced_document
      end

      def title_level
        options.fetch(:title_level, options.fetch(:heading_level, DEFAULT_TITLE_LEVEL))
      end

      def subtitle_level
        options.fetch(:subtitle_level, DEFAULT_SUBTITLE_LEVEL)
      end

      def subtitle?
        options.fetch(:subtitle, false)
      end

      def title_placeholder
        options.fetch(:title_placeholder, options.fetch(:placeholder, DEFAULT_TITLE_PLACEHOLDER))
      end

      def subtitle_placeholder
        options.fetch(:subtitle_placeholder, DEFAULT_SUBTITLE_PLACEHOLDER)
      end

      def allow_title_deletion?
        options.fetch(:allow_deletion, false)
      end

      def allow_subtitle_deletion?
        options.fetch(:allow_subtitle_deletion, true)
      end

      def content_expression
        if subtitle?
          "heading heading? block*"
        else
          "heading block*"
        end
      end

      def to_config
        config = {
          titleLevel: title_level,
          titlePlaceholder: title_placeholder,
          allowDeletion: allow_title_deletion?,
          contentExpression: content_expression,
          subtitle: subtitle?
        }

        if subtitle?
          config.merge!(
            subtitleLevel: subtitle_level,
            subtitlePlaceholder: subtitle_placeholder,
            allowSubtitleDeletion: allow_subtitle_deletion?
          )
        end

        config[:headingLevel] = title_level
        config
      end

      private

      def default_options
        super.merge(
          title_level: DEFAULT_TITLE_LEVEL,
          subtitle_level: DEFAULT_SUBTITLE_LEVEL,
          title_placeholder: DEFAULT_TITLE_PLACEHOLDER,
          subtitle_placeholder: DEFAULT_SUBTITLE_PLACEHOLDER,
          subtitle: false,
          allow_deletion: false,
          allow_subtitle_deletion: true
        )
      end
    end
  end
end
```

### A2: CodeBlockSyntax

```ruby
# lib/inkpen/extensions/code_block_syntax.rb
# frozen_string_literal: true

module Inkpen
  module Extensions
    class CodeBlockSyntax < Base
      AVAILABLE_LANGUAGES = %i[
        javascript typescript ruby python css xml html json
        bash shell sql markdown yaml go rust java kotlin swift
        php c cpp csharp elixir erlang haskell scala r matlab
        dockerfile nginx apache graphql
      ].freeze

      DEFAULT_LANGUAGES = %i[
        javascript typescript ruby python css xml json
        bash sql markdown
      ].freeze

      def name
        :code_block_syntax
      end

      def languages
        options.fetch(:languages, DEFAULT_LANGUAGES)
      end

      def default_language
        options[:default_language]
      end

      def line_numbers?
        options.fetch(:line_numbers, false)
      end

      def show_language_selector?
        options.fetch(:language_selector, true)
      end

      def copy_button?
        options.fetch(:copy_button, true)
      end

      def theme
        options.fetch(:theme, "github")
      end

      def to_config
        {
          languages: languages,
          defaultLanguage: default_language,
          lineNumbers: line_numbers?,
          languageSelector: show_language_selector?,
          copyButton: copy_button?,
          theme: theme,
          lowlight: {
            languages: languages
          }
        }
      end

      private

      def default_options
        super.merge(
          languages: DEFAULT_LANGUAGES,
          line_numbers: false,
          language_selector: true,
          copy_button: true,
          theme: "github"
        )
      end
    end
  end
end
```

### A3: TaskList

```ruby
# lib/inkpen/extensions/task_list.rb
# frozen_string_literal: true

module Inkpen
  module Extensions
    class TaskList < Base
      def name
        :task_list
      end

      def nested?
        options.fetch(:nested, true)
      end

      def list_class
        options.fetch(:list_class, "inkpen-task-list")
      end

      def item_class
        options.fetch(:item_class, "inkpen-task-item")
      end

      def checked_class
        options.fetch(:checked_class, "inkpen-task-checked")
      end

      def checkbox_class
        options.fetch(:checkbox_class, "inkpen-task-checkbox")
      end

      def html_attributes
        options.fetch(:html_attributes, { class: list_class })
      end

      def item_html_attributes
        options.fetch(:item_html_attributes, { class: item_class })
      end

      def text_toggle?
        options.fetch(:text_toggle, false)
      end

      def keyboard_shortcut
        options.fetch(:keyboard_shortcut, "Mod-Shift-9")
      end

      def to_config
        {
          nested: nested?,
          listClass: list_class,
          itemClass: item_class,
          checkedClass: checked_class,
          checkboxClass: checkbox_class,
          HTMLAttributes: html_attributes,
          itemHTMLAttributes: item_html_attributes,
          textToggle: text_toggle?,
          keyboardShortcut: keyboard_shortcut
        }
      end

      private

      def default_options
        super.merge(
          nested: true,
          text_toggle: false,
          keyboard_shortcut: "Mod-Shift-9"
        )
      end
    end
  end
end
```

### A4: Table

```ruby
# lib/inkpen/extensions/table.rb
# frozen_string_literal: true

module Inkpen
  module Extensions
    class Table < Base
      DEFAULT_CELL_MIN_WIDTH = 25
      DEFAULT_CELL_MAX_WIDTH = 500

      def name
        :table
      end

      def resizable?
        options.fetch(:resizable, true)
      end

      def header_row?
        options.fetch(:header_row, true)
      end

      def header_column?
        options.fetch(:header_column, false)
      end

      def cell_min_width
        options.fetch(:cell_min_width, DEFAULT_CELL_MIN_WIDTH)
      end

      def cell_max_width
        options[:cell_max_width]
      end

      def toolbar?
        options.fetch(:toolbar, true)
      end

      def cell_backgrounds?
        options.fetch(:cell_backgrounds, true)
      end

      def allow_merge?
        options.fetch(:allow_merge, true)
      end

      def default_rows
        options.fetch(:default_rows, 3)
      end

      def default_cols
        options.fetch(:default_cols, 3)
      end

      def with_header_row?
        options.fetch(:with_header_row, true)
      end

      def to_config
        {
          resizable: resizable?,
          headerRow: header_row?,
          headerColumn: header_column?,
          cellMinWidth: cell_min_width,
          cellMaxWidth: cell_max_width,
          toolbar: toolbar?,
          cellBackgrounds: cell_backgrounds?,
          allowMerge: allow_merge?,
          defaultRows: default_rows,
          defaultCols: default_cols,
          withHeaderRow: with_header_row?
        }.compact
      end

      private

      def default_options
        super.merge(
          resizable: true,
          header_row: true,
          header_column: false,
          cell_min_width: DEFAULT_CELL_MIN_WIDTH,
          toolbar: true,
          cell_backgrounds: true,
          allow_merge: true,
          default_rows: 3,
          default_cols: 3,
          with_header_row: true
        )
      end
    end
  end
end
```

### A5: Mention

```ruby
# lib/inkpen/extensions/mention.rb
# frozen_string_literal: true

module Inkpen
  module Extensions
    class Mention < Base
      DEFAULT_TRIGGER = "@"
      DEFAULT_MIN_CHARS = 1

      def name
        :mention
      end

      def trigger
        options.fetch(:trigger, DEFAULT_TRIGGER)
      end

      def search_url
        options[:search_url]
      end

      def items
        options[:items]
      end

      def min_chars
        options.fetch(:min_chars, DEFAULT_MIN_CHARS)
      end

      def suggestion_class
        options.fetch(:suggestion_class, "inkpen-mention-suggestions")
      end

      def item_class
        options.fetch(:item_class, "inkpen-mention-item")
      end

      def allow_custom?
        options.fetch(:allow_custom, false)
      end

      def html_attributes
        options.fetch(:html_attributes, { class: "inkpen-mention" })
      end

      def to_config
        {
          trigger: trigger,
          searchUrl: search_url,
          items: items,
          minChars: min_chars,
          suggestionClass: suggestion_class,
          itemClass: item_class,
          allowCustom: allow_custom?,
          HTMLAttributes: html_attributes
        }.compact
      end

      private

      def default_options
        super.merge(
          trigger: DEFAULT_TRIGGER,
          min_chars: DEFAULT_MIN_CHARS,
          allow_custom: false
        )
      end
    end
  end
end
```

### A6: SlashCommands

```ruby
# lib/inkpen/extensions/slash_commands.rb
# frozen_string_literal: true

module Inkpen
  module Extensions
    class SlashCommands < Base
      DEFAULT_COMMANDS = [
        { name: "paragraph", label: "Text", description: "Plain text block", icon: "text", group: "Basic", shortcut: nil },
        { name: "heading1", label: "Heading 1", description: "Large heading", icon: "h1", group: "Basic", shortcut: "#" },
        { name: "heading2", label: "Heading 2", description: "Medium heading", icon: "h2", group: "Basic", shortcut: "##" },
        { name: "heading3", label: "Heading 3", description: "Small heading", icon: "h3", group: "Basic", shortcut: "###" },
        { name: "bullet_list", label: "Bullet List", description: "Unordered list", icon: "list", group: "Lists", shortcut: "-" },
        { name: "ordered_list", label: "Numbered List", description: "Ordered list", icon: "list-ordered", group: "Lists", shortcut: "1." },
        { name: "task_list", label: "Task List", description: "Checklist with checkboxes", icon: "check-square", group: "Lists", shortcut: "[]" },
        { name: "blockquote", label: "Quote", description: "Quote block", icon: "quote", group: "Blocks", shortcut: ">" },
        { name: "code_block", label: "Code Block", description: "Code with syntax highlighting", icon: "code", group: "Blocks", shortcut: "```" },
        { name: "horizontal_rule", label: "Divider", description: "Horizontal line", icon: "minus", group: "Blocks", shortcut: "---" },
        { name: "image", label: "Image", description: "Upload or embed an image", icon: "image", group: "Media", shortcut: nil },
        { name: "youtube", label: "YouTube", description: "Embed a YouTube video", icon: "youtube", group: "Media", shortcut: nil },
        { name: "table", label: "Table", description: "Insert a table", icon: "table", group: "Advanced", shortcut: nil },
        { name: "callout", label: "Callout", description: "Highlighted callout box", icon: "alert-circle", group: "Advanced", shortcut: nil }
      ].freeze

      DEFAULT_GROUPS = %w[Basic Lists Blocks Media Advanced].freeze

      def name
        :slash_commands
      end

      def trigger
        options.fetch(:trigger, "/")
      end

      def commands
        options.fetch(:commands, DEFAULT_COMMANDS)
      end

      def groups
        options.fetch(:groups, DEFAULT_GROUPS)
      end

      def max_suggestions
        options.fetch(:max_suggestions, 10)
      end

      def allow_filtering?
        options.fetch(:allow_filtering, true)
      end

      def show_icons?
        options.fetch(:show_icons, true)
      end

      def show_descriptions?
        options.fetch(:show_descriptions, true)
      end

      def show_shortcuts?
        options.fetch(:show_shortcuts, false)
      end

      def suggestion_class
        options.fetch(:suggestion_class, "inkpen-slash-menu")
      end

      def item_class
        options.fetch(:item_class, "inkpen-slash-item")
      end

      def active_class
        options.fetch(:active_class, "is-selected")
      end

      def group_class
        options.fetch(:group_class, "inkpen-slash-group")
      end

      def to_config
        {
          trigger: trigger,
          commands: commands,
          groups: groups,
          maxSuggestions: max_suggestions,
          allowFiltering: allow_filtering?,
          showIcons: show_icons?,
          showDescriptions: show_descriptions?,
          showShortcuts: show_shortcuts?,
          suggestionClass: suggestion_class,
          itemClass: item_class,
          activeClass: active_class,
          groupClass: group_class
        }.compact
      end

      private

      def default_options
        super.merge(
          trigger: "/",
          commands: DEFAULT_COMMANDS,
          groups: DEFAULT_GROUPS,
          max_suggestions: 10,
          allow_filtering: true,
          show_icons: true,
          show_descriptions: true,
          show_shortcuts: false,
          suggestion_class: "inkpen-slash-menu",
          item_class: "inkpen-slash-item",
          active_class: "is-selected",
          group_class: "inkpen-slash-group"
        )
      end
    end
  end
end
```

---

## B. Feature Sets

### B1: Page Builder Feature Set

```ruby
# lib/inkpen/editor.rb - FEATURE_SETS[:page_builder]

module Inkpen
  class TiptapEditor
    FEATURE_SETS = {
      page_builder: {
        text: [:bold, :italic, :underline, :strike],
        headings: [1, 2, 3, 4, 5, 6],
        lists: [:bullet, :ordered, :task],
        media: [:image, :video, :embed],
        layout: [:columns, :hero, :cta, :testimonial, :features_grid],
        advanced: [:table, :code_block, :blockquote, :callout],
        collaboration: [:comments]
      },

      document: {
        text: [:bold, :italic, :code],
        headings: [1, 2, 3],
        lists: [:bullet, :ordered],
        code: [:code_block, :syntax_highlight],
        collaboration: [:comments, :suggestions, :mentions],
        advanced: [:table, :table_of_contents]
      },

      standard: {
        text: [:bold, :italic, :underline],
        headings: [1, 2, 3],
        lists: [:bullet, :ordered],
        media: [:image, :link],
        advanced: [:blockquote, :code_block, :callout]
      }
    }.freeze

    class << self
      def extensions_for(feature_set)
        features = FEATURE_SETS[feature_set.to_sym] || FEATURE_SETS[:standard]
        build_extensions(features)
      end

      private

      def build_extensions(features)
        extensions = []

        # Core extensions always included
        extensions << Extensions::ForcedDocument.new(
          subtitle: features[:headings]&.include?(2),
          title_level: 1
        )

        # Code block if code features requested
        if features[:code]&.include?(:code_block) || features[:advanced]&.include?(:code_block)
          extensions << Extensions::CodeBlockSyntax.new(
            languages: %i[ruby javascript python sql html css],
            line_numbers: features[:code]&.any?,
            copy_button: true
          )
        end

        # Task list if lists requested
        if features[:lists]&.include?(:task)
          extensions << Extensions::TaskList.new(nested: true)
        end

        # Table if advanced table requested
        if features[:advanced]&.include?(:table)
          extensions << Extensions::Table.new(
            resizable: true,
            header_row: true,
            allow_merge: true
          )
        end

        # Mentions if collaboration features
        if features[:collaboration]&.include?(:mentions)
          extensions << Extensions::Mention.new(
            search_url: "/api/users/search",
            trigger: "@"
          )
        end

        # Slash commands always included
        extensions << Extensions::SlashCommands.new(
          trigger: "/",
          show_icons: true,
          show_descriptions: true
        )

        extensions
      end
    end
  end
end
```

### B2: Document Feature Set

(Already included above in B1 as part of FEATURE_SETS)

### B3: Standard Feature Set

(Already included above in B1 as part of FEATURE_SETS)

---

## C. Integration Pattern

### C1: Rails Controller

```ruby
# app/controllers/inkpen/extensions_controller.rb

module Inkpen
  class ExtensionsController < ApplicationController
    skip_before_action :verify_authenticity_token, only: [:show]
    
    def show
      feature_set = params[:feature_set].to_sym
      extensions = TiptapEditor.extensions_for(feature_set)

      render json: {
        extensions: extensions.map { |ext| ext.to_config if ext.enabled? }.compact,
        version: Inkpen::VERSION,
        success: true
      }
    rescue => e
      render json: {
        error: e.message,
        success: false
      }, status: :unprocessable_entity
    end
  end
end
```

### C2: View Helper

```ruby
# app/helpers/inkpen/editor_helper.rb

module Inkpen
  module EditorHelper
    def tiptap_editor(model, field, options = {})
      controller_name = options[:controller] || model.class.name.underscore
      features = options[:features] || :standard
      
      render "inkpen/editor",
             model: model,
             field: field,
             controller_name: controller_name,
             features: features,
             options: options
    end
  end
end
```

### C3: Stimulus Controller

```javascript
// app/javascript/controllers/inkpen/editor_controller.js

import { Controller } from "@hotwired/stimulus"
import { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import ExtensionsLoader from "../utils/extensions_loader"

export default class extends Controller {
  static targets = ["editor", "content", "title"]
  static values = { features: String, autosave: Boolean }

  connect() {
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
        content: this.contentTarget.value,
        onUpdate: ({ editor }) => {
          this.contentTarget.value = editor.getHTML()
          
          if (this.autosaveValue) {
            this.debounce(() => this.autosave(), 1500)
          }
        }
      })

      this.attachObservers()
    } catch (error) {
      console.error("Failed to initialize editor:", error)
      this.editorTarget.innerHTML = '<p style="color: red;">Failed to load editor</p>'
    }
  }

  async fetchExtensionsConfig() {
    const response = await fetch(`/inkpen/extensions/${this.featuresValue}.json`)
    if (!response.ok) throw new Error(`Failed to fetch extensions: ${response.status}`)
    return await response.json()
  }

  autosave() {
    if (!this.form) return
    
    const formData = new FormData(this.form)
    fetch(this.form.action, {
      method: "PATCH",
      body: formData,
      headers: { "X-CSRF-Token": this.csrfToken }
    })
      .then(r => {
        if (r.ok) this.showAutosaveIndicator()
      })
      .catch(e => console.error("Autosave failed:", e))
  }

  showAutosaveIndicator() {
    // Show "Saved" indicator briefly
    const indicator = document.createElement("div")
    indicator.className = "autosave-indicator"
    indicator.textContent = "✓ Saved"
    document.body.appendChild(indicator)
    
    setTimeout(() => indicator.remove(), 2000)
  }

  attachObservers() {
    // Additional event handlers
  }

  disconnect() {
    if (this.editor) this.editor.destroy()
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

### C4: Extensions Loader

```javascript
// app/javascript/utils/extensions_loader.js

import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { lowlight } from "lowlight"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { Mention } from "@tiptap/extension-mention"
import MentionList from "./components/mention_list"
import CommandPalette from "./components/command_palette"
import tippy from "tippy.js"

export default class ExtensionsLoader {
  static async load(config) {
    const extensions = []

    for (const extConfig of config.extensions) {
      const ext = await this.loadExtension(extConfig)
      if (ext) extensions.push(ext)
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
        return null
    }
  }

  static configureForcedDocument(config) {
    // Load ForcedDocument extension from TipTap
    const ForcedDocument = require("@tiptap/extension-forced-document").default
    
    return ForcedDocument.configure({
      titleLevel: config.config.titleLevel,
      titlePlaceholder: config.config.titlePlaceholder,
      subtitle: config.config.subtitle,
      subtitleLevel: config.config.subtitleLevel
    })
  }

  static configureCodeBlock(config) {
    const languages = {}
    for (const lang of config.config.languages) {
      languages[lang] = require(`highlight.js/lib/languages/${lang}`).default
    }

    return CodeBlockLowlight.configure({
      lowlight,
      languages,
      defaultLanguage: config.config.defaultLanguage
    })
  }

  static configureTaskList(config) {
    return [
      TaskList.configure(config.config),
      TaskItem.configure({ nested: config.config.nested })
    ]
  }

  static configureTable(config) {
    return [
      Table.configure({
        resizable: config.config.resizable,
        handleWidth: 4,
        cellMinWidth: config.config.cellMinWidth,
        lastColumnResizable: true
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
            return await response.json()
          } catch (e) {
            console.error("Mention search failed:", e)
            return []
          }
        },

        render: () => {
          let component
          let popup

          return {
            onStart: props => {
              component = new MentionList(props)
              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start"
              })[0]
            },

            onUpdate(props) {
              component.update(props)
            },

            onKeyDown(props) {
              return component.onKeyDown(props)
            },

            onExit() {
              popup?.destroy()
              component?.destroy()
            }
          }
        }
      }
    })
  }

  static configureSlashCommands(config) {
    const SlashCommand = require("@tiptap/extension-slash-command").default

    return SlashCommand.configure({
      suggestion: {
        items: ({ query }) => {
          return config.config.commands
            .filter(cmd => 
              cmd.label.toLowerCase().startsWith(query.toLowerCase())
            )
            .slice(0, config.config.maxSuggestions)
        },

        render: () => {
          let component
          let popup

          return {
            onStart: props => {
              component = new CommandPalette(props)
              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start"
              })[0]
            },

            onUpdate(props) {
              component.update(props)
            },

            onKeyDown(props) {
              return component.onKeyDown(props)
            },

            onExit() {
              popup?.destroy()
              component?.destroy()
            }
          }
        }
      }
    })
  }
}
```

### C5: TipTap Initialization

(Covered in C3 Stimulus Controller above)

---

## D. Custom Blocks

### D1: Custom Block - Hero

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
        options.fetch(:text_align, "center")  # left, center, right
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

      private

      def default_options
        super.merge(
          text_align: "center",
          dark_overlay: false
        )
      end
    end
  end
end
```

JavaScript implementation:

```javascript
// app/javascript/extensions/hero.js

import { Node } from "@tiptap/core"
import { VueNodeViewRenderer } from "@tiptap/vue-3"
import HeroComponent from "../components/hero_block.vue"

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
    return ["hero-block", HTMLAttributes]
  },

  addNodeView() {
    return VueNodeViewRenderer(HeroComponent)
  }
})
```

---

## E. Implementation Steps

### E1: Gem Setup

```ruby
# lib/inkpen.rb
require "inkpen/version"
require "inkpen/engine"
require "inkpen/extensions"

module Inkpen
  class << self
    attr_accessor :configuration
    
    def configure
      self.configuration ||= Configuration.new
      yield(configuration)
    end
    
    def config
      configuration ||= Configuration.new
    end
  end
end

# lib/inkpen/engine.rb
module Inkpen
  class Engine < ::Rails::Engine
    isolate_namespace Inkpen
    
    initializer "inkpen.assets" do |app|
      app.config.assets.precompile += %w[inkpen_manifest.js]
    end
    
    initializer "inkpen.helpers" do
      ActiveSupport.on_load(:action_controller_base) do
        helper Inkpen::EditorHelper
      end
    end
  end
end

# lib/inkpen/configuration.rb
module Inkpen
  class Configuration
    attr_accessor :app_name, :custom_blocks, :feature_sets
    
    def initialize
      @app_name = "inkpen"
      @custom_blocks = []
      @feature_sets = {}
    end
    
    def register_block(name, block_class)
      @custom_blocks << { name: name, class: block_class }
    end
  end
end

# inkpen.gemspec
Gem::Specification.new do |spec|
  spec.name          = "inkpen"
  spec.version       = Inkpen::VERSION
  spec.authors       = ["Your Name"]
  spec.email         = ["your.email@example.com"]
  spec.summary       = "Rich text editor for Rails with TipTap"
  spec.homepage      = "https://github.com/yourname/inkpen"
  spec.license       = "MIT"

  spec.files         = Dir.glob("lib/**/*") + Dir.glob("app/**/*") + %w[README.md]
  
  spec.add_dependency "rails", ">= 7.0"
  spec.add_dependency "stimulus-rails", ">= 1.0"
  spec.add_dependency "jsbundling-rails", ">= 1.0"
  
  spec.add_development_dependency "rspec-rails"
  spec.add_development_dependency "bundler"
  spec.add_development_dependency "rake"
end
```

### E2: Backend Setup

```ruby
# lib/inkpen/editor.rb
module Inkpen
  class TiptapEditor
    FEATURE_SETS = {
      page_builder: { ... },
      document: { ... },
      standard: { ... }
    }
    
    class << self
      def extensions_for(feature_set)
        features = FEATURE_SETS[feature_set.to_sym] || FEATURE_SETS[:standard]
        build_extensions(features)
      end
      
      private
      
      def build_extensions(features)
        # Implementation (see section B above)
      end
    end
  end
end

# config/routes.rb (in gem)
Inkpen::Engine.routes.draw do
  namespace :inkpen do
    resources :extensions, only: [:show]
  end
end
```

### E3: Frontend Setup

(See C3 and C4 above for Stimulus and ExtensionsLoader)

### E4: Styling Setup

```css
/* app/assets/stylesheets/inkpen/editor.css */

:root {
  --inkpen-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --inkpen-font-size: 1rem;
  --inkpen-line-height: 1.6;
  --inkpen-color-text: #1a1a1a;
  --inkpen-color-text-muted: #666666;
  --inkpen-color-background: #fafafa;
  --inkpen-color-border: #e5e5e5;
  --inkpen-color-primary: #3b82f6;
  --inkpen-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  --inkpen-radius: 6px;
}

.inkpen-editor {
  font-family: var(--inkpen-font-family);
  font-size: var(--inkpen-font-size);
  line-height: var(--inkpen-line-height);
  color: var(--inkpen-color-text);
  background: var(--inkpen-color-background);
}

.inkpen-editor__content {
  outline: none;
  min-height: 200px;
  padding: 1rem;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --inkpen-color-text: #ffffff;
    --inkpen-color-background: #111111;
    --inkpen-color-primary: #60a5fa;
  }
}
```

### E5: Testing Setup

```ruby
# spec/lib/inkpen/extensions/code_block_syntax_spec.rb

RSpec.describe Inkpen::Extensions::CodeBlockSyntax do
  describe "#to_config" do
    it "converts to JSON-safe hash" do
      ext = described_class.new(
        languages: %i[ruby javascript],
        copy_button: true
      )
      
      config = ext.to_config
      expect(config).to be_a(Hash)
      expect(config[:languages]).to eq(%i[ruby javascript])
      expect(config[:copyButton]).to eq(true)
    end
  end
  
  describe "#name" do
    it "returns :code_block_syntax" do
      ext = described_class.new
      expect(ext.name).to eq(:code_block_syntax)
    end
  end
end
```

### E6: Deployment

```bash
# Build and publish gem
gem build inkpen.gemspec
# gem push inkpen-1.0.0.gem (to rubygems.org)
# or push to private gem server

# In app Gemfile
gem 'inkpen', '~> 1.0.0', git: 'https://github.com/yourname/inkpen.git'

# Run installer
rails generate inkpen:install
```

---

## F. Testing

### F1: Unit Tests

```ruby
# spec/lib/inkpen/extensions/base_spec.rb

RSpec.describe Inkpen::Extensions::Base do
  subject { described_class.new(enabled: true, custom: "value") }
  
  describe "#initialize" do
    it "merges options with defaults" do
      expect(subject.options[:enabled]).to eq(true)
      expect(subject.options[:custom]).to eq("value")
    end
  end
  
  describe "#enabled?" do
    it "returns true by default" do
      ext = described_class.new
      expect(ext.enabled?).to eq(true)
    end
    
    it "respects enabled option" do
      ext = described_class.new(enabled: false)
      expect(ext.enabled?).to eq(false)
    end
  end
  
  describe "#to_json" do
    it "serializes to valid JSON" do
      ext = described_class.new
      json = ext.to_json
      expect { JSON.parse(json) }.not_to raise_error
    end
  end
end
```

### F2: Integration Tests

```ruby
# spec/requests/inkpen/extensions_spec.rb

RSpec.describe "Inkpen Extensions" do
  describe "GET /inkpen/extensions/:feature_set.json" do
    it "returns page_builder extensions" do
      get "/inkpen/extensions/page_builder.json"
      expect(response).to be_successful
      
      json = JSON.parse(response.body)
      expect(json["extensions"]).to be_an(Array)
      expect(json["extensions"].length).to be > 0
    end
  end
end
```

### F3: Browser Tests

```javascript
// spec/browser/editor_spec.js (Cypress/Playwright)

describe("Inkpen Editor", () => {
  before(() => {
    cy.visit("/pages/new")
  })

  it("loads editor without errors", () => {
    cy.get('[data-controller="inkpen--editor"]').should("exist")
    cy.get('.ProseMirror').should("be.visible")
  })

  it("allows typing in editor", () => {
    cy.get('.ProseMirror').type("Hello, world!")
    cy.get('.ProseMirror').should("contain", "Hello, world!")
  })

  it("shows slash command palette", () => {
    cy.get('.ProseMirror').type("/")
    cy.get('[data-inkpen-target="slash-menu"]').should("be.visible")
  })
})
```

---

## G. Changelog Template

```markdown
# CHANGELOG.md

## [1.2.0] - 2024-01-15

### Added
- ForcedDocument extension for document structure enforcement
- CodeBlockSyntax extension with 30+ language support
- TaskList extension with nesting support
- Table extension with cell merging and resizing
- Mention extension for @mentions
- SlashCommands extension with 13 built-in commands
- Page Builder feature set for mademysite.com
- Document feature set for kuickr.co
- Standard feature set for blog posts

### Changed
- Refactored extension loading system for better modularity
- Simplified Stimulus controller API

### Fixed
- Fixed dark mode CSS variable scoping
- Fixed autosave timing issues

## [1.1.0] - 2024-01-01

### Added
- Initial gem release
- Basic Rails::Engine setup
- Stimulus controller integration

### Fixed
- Initial bug fixes from alpha testing
```

---

**End of Code Samples Document**

All code samples reference either existing files you provided or implementation patterns based on the Inkpen architecture.
