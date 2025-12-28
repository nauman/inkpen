# frozen_string_literal: true

module Inkpen
  module Extensions
    # SlashCommands Extension
    #
    # Adds "/" command palette for quick insertion of blocks and formatting.
    # Similar to Notion's slash commands or Dropbox Paper's "/" menu.
    #
    # @example Basic usage
    #   extension = Inkpen::Extensions::SlashCommands.new
    #
    # @example With custom commands
    #   extension = Inkpen::Extensions::SlashCommands.new(
    #     trigger: "/",
    #     commands: [
    #       { name: "heading1", label: "Heading 1", icon: "h1", group: "Basic" },
    #       { name: "heading2", label: "Heading 2", icon: "h2", group: "Basic" },
    #       { name: "bullet_list", label: "Bullet List", icon: "list", group: "Lists" },
    #       { name: "code_block", label: "Code Block", icon: "code", group: "Advanced" }
    #     ],
    #     groups: ["Basic", "Lists", "Media", "Advanced"],
    #     max_suggestions: 10,
    #     allow_filtering: true
    #   )
    #
    class SlashCommands < Base
      # Default command set matching Notion/Paper experience
      DEFAULT_COMMANDS = [
        # Text blocks
        { name: "paragraph", label: "Text", description: "Plain text block", icon: "text", group: "Basic", shortcut: nil },
        { name: "heading1", label: "Heading 1", description: "Large heading", icon: "h1", group: "Basic", shortcut: "#" },
        { name: "heading2", label: "Heading 2", description: "Medium heading", icon: "h2", group: "Basic", shortcut: "##" },
        { name: "heading3", label: "Heading 3", description: "Small heading", icon: "h3", group: "Basic", shortcut: "###" },

        # Lists
        { name: "bullet_list", label: "Bullet List", description: "Unordered list", icon: "list", group: "Lists", shortcut: "-" },
        { name: "ordered_list", label: "Numbered List", description: "Ordered list", icon: "list-ordered", group: "Lists", shortcut: "1." },
        { name: "task_list", label: "Task List", description: "Checklist with checkboxes", icon: "check-square", group: "Lists", shortcut: "[]" },

        # Blocks
        { name: "blockquote", label: "Quote", description: "Quote block", icon: "quote", group: "Blocks", shortcut: ">" },
        { name: "code_block", label: "Code Block", description: "Code with syntax highlighting", icon: "code", group: "Blocks", shortcut: "```" },
        { name: "horizontal_rule", label: "Divider", description: "Horizontal line", icon: "minus", group: "Blocks", shortcut: "---" },

        # Media
        { name: "image", label: "Image", description: "Upload or embed an image", icon: "image", group: "Media", shortcut: nil },
        { name: "youtube", label: "YouTube", description: "Embed a YouTube video", icon: "youtube", group: "Media", shortcut: nil },

        # Advanced
        { name: "table", label: "Table", description: "Insert a table", icon: "table", group: "Advanced", shortcut: nil },
        { name: "callout", label: "Callout", description: "Highlighted callout box", icon: "alert-circle", group: "Advanced", shortcut: nil },
        { name: "section", label: "Section", description: "Page section with width control", icon: "layout", group: "Advanced", shortcut: nil },
        { name: "preformatted", label: "Plain Text", description: "Preformatted text for ASCII art", icon: "file-text", group: "Advanced", shortcut: nil }
      ].freeze

      DEFAULT_GROUPS = %w[Basic Lists Blocks Media Advanced].freeze

      def name
        :slash_commands
      end

      def to_config
        {
          trigger: options[:trigger],
          commands: options[:commands],
          groups: options[:groups],
          maxSuggestions: options[:max_suggestions],
          allowFiltering: options[:allow_filtering],
          showIcons: options[:show_icons],
          showDescriptions: options[:show_descriptions],
          showShortcuts: options[:show_shortcuts],
          suggestionClass: options[:suggestion_class],
          itemClass: options[:item_class],
          activeClass: options[:active_class],
          groupClass: options[:group_class]
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
