# frozen_string_literal: true

module Inkpen
  ##
  # PORO representing an editor instance.
  #
  # The Editor class encapsulates all configuration for a single TipTap
  # editor instance. It generates the necessary data attributes for the
  # Stimulus controller and handles form integration.
  #
  # @example Basic usage
  #   editor = Inkpen::Editor.new(name: "post[body]")
  #
  # @example With all options
  #   editor = Inkpen::Editor.new(
  #     name: "post[body]",
  #     value: @post.body,
  #     toolbar: :floating,
  #     extensions: [:bold, :italic, :slash_commands],
  #     extension_config: {
  #       mention: { searchUrl: "/editor/mentions.json" }
  #     },
  #     placeholder: "Start writing...",
  #     autosave: true,
  #     autosave_interval: 5000,
  #     min_height: "200px",
  #     max_height: "600px"
  #   )
  #
  # @see Inkpen::Toolbar Toolbar configuration
  # @see Inkpen::StickyToolbar Sticky toolbar configuration
  # @see Inkpen::Configuration Global defaults
  #
  # @author Nauman Tariq
  # @since 0.1.0
  #
  class Editor
    ##
    # @!attribute [r] name
    #   @return [String] the form field name (e.g., "post[body]")
    #
    # @!attribute [r] value
    #   @return [String, nil] the initial HTML content
    #
    # @!attribute [r] toolbar
    #   @return [Symbol] toolbar style (:floating, :fixed, :none)
    #
    # @!attribute [r] sticky_toolbar
    #   @return [StickyToolbar, nil] sticky toolbar configuration
    #
    # @!attribute [r] extensions
    #   @return [Array<Symbol>] list of enabled extensions
    #
    # @!attribute [r] extension_config
    #   @return [Hash] per-extension configuration options
    #
    # @!attribute [r] placeholder
    #   @return [String] placeholder text when editor is empty
    #
    # @!attribute [r] autosave
    #   @return [Boolean] whether autosave is enabled
    #
    # @!attribute [r] autosave_interval
    #   @return [Integer] autosave interval in milliseconds
    #
    # @!attribute [r] min_height
    #   @return [String, nil] minimum editor height (CSS value)
    #
    # @!attribute [r] max_height
    #   @return [String, nil] maximum editor height (CSS value)
    #
    # @!attribute [r] html_attributes
    #   @return [Hash] additional HTML attributes for the container
    #
    attr_reader :name, :value, :toolbar, :sticky_toolbar, :extensions, :extension_config,
                :placeholder, :autosave, :autosave_interval, :min_height,
                :max_height, :html_attributes

    ##
    # Initialize a new editor instance.
    #
    # @param name [String] the form field name (required)
    # @param value [String, nil] initial HTML content
    # @param options [Hash] additional configuration options
    #
    # @option options [Symbol] :toolbar (:floating) toolbar style
    # @option options [StickyToolbar] :sticky_toolbar sticky toolbar config
    # @option options [Array<Symbol>] :extensions list of extensions
    # @option options [Hash] :extension_config per-extension config
    # @option options [String] :placeholder placeholder text
    # @option options [Boolean] :autosave enable autosave
    # @option options [Integer] :autosave_interval autosave interval (ms)
    # @option options [String] :min_height minimum height
    # @option options [String] :max_height maximum height
    # @option options [Hash] :html additional HTML attributes
    #
    def initialize(name:, value: nil, **options)
      @name = name
      @value = value
      @toolbar = options.fetch(:toolbar, Inkpen.configuration.toolbar)
      @sticky_toolbar = options.fetch(:sticky_toolbar, nil)
      @extensions = options.fetch(:extensions, Inkpen.configuration.extensions)
      @extension_config = options.fetch(:extension_config, {})
      @placeholder = options.fetch(:placeholder, Inkpen.configuration.placeholder)
      @autosave = options.fetch(:autosave, Inkpen.configuration.autosave)
      @autosave_interval = options.fetch(:autosave_interval, Inkpen.configuration.autosave_interval)
      @min_height = options.fetch(:min_height, Inkpen.configuration.min_height)
      @max_height = options.fetch(:max_height, Inkpen.configuration.max_height)
      @html_attributes = options.fetch(:html, {})
    end

    ##
    # Generate data attributes for the Stimulus controller.
    #
    # Returns a hash with nested :data key for proper Rails
    # tag.attributes handling.
    #
    # @return [Hash] data attributes hash
    #
    def data_attributes
      controllers = ["inkpen--editor"]
      controllers << "inkpen--sticky-toolbar" if sticky_toolbar&.enabled?

      attrs = {
        data: {
          controller: controllers.join(" "),
          "inkpen--editor-extensions-value" => extensions.to_json,
          "inkpen--editor-extension-config-value" => extension_config.to_json,
          "inkpen--editor-toolbar-value" => toolbar.to_s,
          "inkpen--editor-placeholder-value" => placeholder,
          "inkpen--editor-autosave-value" => autosave.to_s,
          "inkpen--editor-autosave-interval-value" => autosave_interval.to_s
        }
      }

      # Merge sticky toolbar data attributes if enabled
      if sticky_toolbar&.enabled?
        attrs[:data].merge!(sticky_toolbar.data_attributes)
      end

      attrs
    end

    ##
    # Generate inline styles for the editor container.
    #
    # @return [String] CSS style string
    #
    def style_attributes
      styles = []
      styles << "min-height: #{min_height}" if min_height
      styles << "max-height: #{max_height}" if max_height
      styles.join("; ")
    end

    ##
    # Check if a specific extension is enabled.
    #
    # @param name [Symbol, String] the extension name to check
    # @return [Boolean] true if the extension is enabled
    #
    # @example
    #   editor.extension_enabled?(:slash_commands) # => true
    #
    def extension_enabled?(name)
      extensions.include?(name.to_sym)
    end

    ##
    # Get the input field name for form submission.
    #
    # @return [String] the form field name
    #
    def input_name
      name
    end

    ##
    # Generate a safe HTML ID from the field name.
    #
    # Converts bracket notation to underscores for valid HTML IDs.
    #
    # @return [String] safe HTML ID
    #
    # @example
    #   editor = Editor.new(name: "post[body]")
    #   editor.input_id # => "post_body"
    #
    def input_id
      name.to_s.gsub(/[\[\]]/, "_").gsub(/_+/, "_").chomp("_")
    end
  end
end
