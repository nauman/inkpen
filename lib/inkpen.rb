# frozen_string_literal: true

require_relative "inkpen/version"
require_relative "inkpen/engine"
require_relative "inkpen/configuration"
require_relative "inkpen/editor"
require_relative "inkpen/toolbar"
require_relative "inkpen/sticky_toolbar"
require_relative "inkpen/markdown_mode"

# Extensions
require_relative "inkpen/extensions/base"
require_relative "inkpen/extensions/forced_document"
require_relative "inkpen/extensions/mention"
require_relative "inkpen/extensions/code_block_syntax"
require_relative "inkpen/extensions/table"
require_relative "inkpen/extensions/task_list"
require_relative "inkpen/extensions/slash_commands"
require_relative "inkpen/extensions/section"
require_relative "inkpen/extensions/preformatted"

##
# Inkpen is a TipTap-based rich text editor gem for Rails applications.
#
# It provides a customizable WYSIWYG editor with Notion-like features including:
# - Block-based editing with drag & drop
# - Slash commands for quick block insertion
# - Multiple toolbar options (floating, fixed, sticky)
# - 16+ custom TipTap extensions
# - Export to Markdown, HTML, and PDF
#
# @example Basic usage with Rails form
#   <%= inkpen_editor form, :content %>
#
# @example With configuration
#   Inkpen.configure do |config|
#     config.toolbar = :floating
#     config.extensions = [:bold, :italic, :link, :slash_commands]
#     config.placeholder = "Start writing..."
#   end
#
# @example Full-featured editor
#   <%= inkpen_editor form, :content,
#       toolbar: :sticky,
#       extensions: [:slash_commands, :block_gutter, :drag_handle, :export_commands] %>
#
# @see Inkpen::Configuration Global configuration options
# @see Inkpen::Editor Editor instance configuration
# @see Inkpen::Extensions Extension system
#
# @author Nauman Tariq
# @since 0.1.0
#
module Inkpen
  ##
  # Base error class for all Inkpen errors.
  #
  class Error < StandardError; end

  class << self
    ##
    # @return [Configuration] the global configuration instance
    attr_writer :configuration

    ##
    # Returns the global configuration instance.
    #
    # @return [Configuration] the configuration object
    #
    def configuration
      @configuration ||= Configuration.new
    end

    ##
    # Configure Inkpen globally.
    #
    # @yield [config] Yields the configuration object for modification
    # @yieldparam config [Configuration] the configuration object
    #
    # @example
    #   Inkpen.configure do |config|
    #     config.toolbar = :floating
    #     config.extensions = [:bold, :italic, :link]
    #   end
    #
    def configure
      yield(configuration)
    end

    ##
    # Reset configuration to defaults.
    #
    # Useful for testing or reinitializing the editor configuration.
    #
    # @return [Configuration] the new configuration object
    #
    def reset_configuration!
      @configuration = Configuration.new
    end
  end
end
