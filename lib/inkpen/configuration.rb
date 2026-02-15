# frozen_string_literal: true

module Inkpen
  ##
  # Global configuration for Inkpen.
  #
  # The Configuration class holds default settings that apply to all
  # editor instances. Individual editors can override these defaults.
  #
  # @example Basic configuration
  #   Inkpen.configure do |config|
  #     config.toolbar = :floating
  #     config.extensions = [:bold, :italic, :link, :slash_commands]
  #     config.placeholder = "Start writing..."
  #   end
  #
  # @example Enable all extensions
  #   Inkpen.configure do |config|
  #     config.extensions = config.all_extensions
  #   end
  #
  # @see Inkpen.configure Global configuration method
  #
  # @author Nauman Tariq
  # @since 0.1.0
  #
  class Configuration
    ##
    # @!attribute toolbar
    #   @return [Symbol] toolbar style (:floating, :fixed, :none)
    #
    # @!attribute extensions
    #   @return [Array<Symbol>] list of enabled extensions
    #
    # @!attribute placeholder
    #   @return [String] placeholder text for empty editors
    #
    # @!attribute autosave
    #   @return [Boolean] whether autosave is enabled by default
    #
    # @!attribute autosave_interval
    #   @return [Integer] autosave interval in milliseconds
    #
    # @!attribute min_height
    #   @return [String, nil] minimum editor height (CSS value)
    #
    # @!attribute max_height
    #   @return [String, nil] maximum editor height (CSS value)
    #
    attr_accessor :toolbar,
                  :extensions,
                  :placeholder,
                  :autosave,
                  :autosave_interval,
                  :min_height,
                  :max_height

    ##
    # Core text formatting extensions included by default.
    #
    # These provide basic rich text editing capabilities.
    #
    # @return [Array<Symbol>] list of core extension names
    #
    CORE_EXTENSIONS = %i[
      bold
      italic
      strike
      underline
      highlight
      link
      heading
      bullet_list
      ordered_list
      blockquote
      code_block
      horizontal_rule
      hard_break
      typography
    ].freeze

    ##
    # Advanced extensions for enhanced editing features.
    #
    # These provide Notion-like capabilities including databases,
    # drag & drop, slash commands, and export functionality.
    #
    # @return [Array<Symbol>] list of advanced extension names
    #
    ADVANCED_EXTENSIONS = %i[
      image
      table
      advanced_table
      inkpen_table
      slash_commands
      mention
      emoji
      search_replace
      footnotes
      placeholder
      typography
      highlight
      underline
      subscript
      superscript
      youtube
      character_count
      code_block_syntax
      task_list
      section
      document_section
      preformatted
      block_gutter
      drag_handle
      toggle_block
      columns
      callout
      block_commands
      enhanced_image
      file_attachment
      embed
      table_of_contents
      database
      export_commands
    ].freeze

    ##
    # Initialize configuration with sensible defaults.
    #
    def initialize
      @toolbar = :floating          # :floating, :fixed, :none
      @extensions = CORE_EXTENSIONS.dup
      @placeholder = "Start writing..."
      @autosave = false
      @autosave_interval = 5000     # milliseconds
      @min_height = "200px"
      @max_height = nil
    end

    ##
    # Enable a specific extension.
    #
    # @param name [Symbol, String] the extension name to enable
    # @return [Array<Symbol>] updated list of extensions
    #
    # @example
    #   config.enable_extension(:slash_commands)
    #
    def enable_extension(name)
      @extensions << name.to_sym unless @extensions.include?(name.to_sym)
    end

    ##
    # Disable a specific extension.
    #
    # @param name [Symbol, String] the extension name to disable
    # @return [Symbol, nil] the removed extension or nil
    #
    # @example
    #   config.disable_extension(:bold)
    #
    def disable_extension(name)
      @extensions.delete(name.to_sym)
    end

    ##
    # Get all available extensions (core + advanced).
    #
    # @return [Array<Symbol>] all extension names
    #
    def all_extensions
      CORE_EXTENSIONS + ADVANCED_EXTENSIONS
    end
  end
end
