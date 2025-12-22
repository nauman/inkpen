# frozen_string_literal: true

module Inkpen
  # Global configuration for Inkpen
  #
  # Usage:
  #   Inkpen.configure do |config|
  #     config.toolbar = :floating
  #     config.extensions = [:bold, :italic, :link, :slash_commands]
  #     config.placeholder = "Start writing..."
  #   end
  #
  class Configuration
    attr_accessor :toolbar,
                  :extensions,
                  :placeholder,
                  :autosave,
                  :autosave_interval,
                  :min_height,
                  :max_height

    # Default extensions available
    CORE_EXTENSIONS = %i[
      bold
      italic
      strike
      underline
      link
      heading
      bullet_list
      ordered_list
      blockquote
      code_block
      horizontal_rule
      hard_break
    ].freeze

    ADVANCED_EXTENSIONS = %i[
      image
      table
      slash_commands
      mention
      hashtags
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
    ].freeze

    def initialize
      @toolbar = :floating          # :floating, :fixed, :none
      @extensions = CORE_EXTENSIONS.dup
      @placeholder = "Start writing..."
      @autosave = false
      @autosave_interval = 5000     # milliseconds
      @min_height = "200px"
      @max_height = nil
    end

    def enable_extension(name)
      @extensions << name.to_sym unless @extensions.include?(name.to_sym)
    end

    def disable_extension(name)
      @extensions.delete(name.to_sym)
    end

    def all_extensions
      CORE_EXTENSIONS + ADVANCED_EXTENSIONS
    end
  end
end
