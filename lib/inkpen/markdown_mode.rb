# frozen_string_literal: true

module Inkpen
  ##
  # PORO representing markdown mode configuration.
  #
  # MarkdownMode enables switching between WYSIWYG, raw markdown,
  # and split view editing modes. When enabled, a mode toggle appears
  # allowing users to edit content as markdown source.
  #
  # @example Basic usage
  #   markdown_mode = Inkpen::MarkdownMode.new(enabled: true)
  #
  # @example With split view default
  #   markdown_mode = Inkpen::MarkdownMode.new(
  #     enabled: true,
  #     default_mode: :split,
  #     sync_delay: 500
  #   )
  #
  # @example In editor
  #   editor = Inkpen::Editor.new(
  #     name: "post[body]",
  #     markdown_mode: Inkpen::MarkdownMode.new(enabled: true)
  #   )
  #
  # @see Inkpen::Editor Editor configuration
  #
  # @author Nauman Tariq
  # @since 0.5.0
  #
  class MarkdownMode
    ##
    # Valid editing modes.
    # @return [Array<Symbol>]
    MODES = %i[wysiwyg markdown split].freeze

    ##
    # Default sync delay in milliseconds for split view.
    # @return [Integer]
    DEFAULT_SYNC_DELAY = 300

    ##
    # @!attribute [r] enabled
    #   @return [Boolean] whether markdown mode is enabled
    #
    # @!attribute [r] default_mode
    #   @return [Symbol] the default editing mode
    #
    # @!attribute [r] show_toggle
    #   @return [Boolean] whether to show the mode toggle button
    #
    # @!attribute [r] sync_delay
    #   @return [Integer] debounce delay for split view sync (ms)
    #
    # @!attribute [r] keyboard_shortcuts
    #   @return [Boolean] whether keyboard shortcuts are enabled
    #
    attr_reader :default_mode, :show_toggle, :sync_delay, :keyboard_shortcuts

    ##
    # Initialize a new markdown mode configuration.
    #
    # @param enabled [Boolean] whether markdown mode is enabled
    # @param default_mode [Symbol] initial mode (:wysiwyg, :markdown, :split)
    # @param show_toggle [Boolean] show mode toggle button
    # @param sync_delay [Integer] debounce delay for split sync (ms)
    # @param keyboard_shortcuts [Boolean] enable keyboard shortcuts
    #
    def initialize(
      enabled: false,
      default_mode: :wysiwyg,
      show_toggle: true,
      sync_delay: DEFAULT_SYNC_DELAY,
      keyboard_shortcuts: true
    )
      @enabled = enabled
      @default_mode = validate_mode(default_mode)
      @show_toggle = show_toggle
      @sync_delay = sync_delay.to_i
      @keyboard_shortcuts = keyboard_shortcuts
    end

    ##
    # Check if markdown mode is enabled.
    #
    # @return [Boolean] true if enabled
    #
    def enabled?
      @enabled
    end

    ##
    # Check if the default mode is WYSIWYG.
    #
    # @return [Boolean] true if default is WYSIWYG
    #
    def wysiwyg_default?
      default_mode == :wysiwyg
    end

    ##
    # Check if the default mode is markdown.
    #
    # @return [Boolean] true if default is markdown
    #
    def markdown_default?
      default_mode == :markdown
    end

    ##
    # Check if the default mode is split view.
    #
    # @return [Boolean] true if default is split
    #
    def split_default?
      default_mode == :split
    end

    ##
    # Generate data attributes for Stimulus controller.
    #
    # @return [Hash] data attributes hash
    #
    def data_attributes
      {
        "inkpen--editor-markdown-enabled-value" => enabled?.to_s,
        "inkpen--editor-markdown-mode-value" => default_mode.to_s,
        "inkpen--editor-markdown-show-toggle-value" => show_toggle.to_s,
        "inkpen--editor-markdown-sync-delay-value" => sync_delay.to_s,
        "inkpen--editor-markdown-shortcuts-value" => keyboard_shortcuts.to_s
      }
    end

    ##
    # Convert to configuration hash for JavaScript.
    #
    # @return [Hash] configuration hash
    #
    def to_config
      {
        enabled: enabled?,
        defaultMode: default_mode.to_s,
        showToggle: show_toggle,
        syncDelay: sync_delay,
        keyboardShortcuts: keyboard_shortcuts
      }
    end

    ##
    # Convert to JSON representation.
    #
    # @return [String] JSON string
    #
    def to_json(*args)
      to_config.to_json(*args)
    end

    private

    ##
    # Validate and normalize mode value.
    #
    # @param mode [Symbol, String] mode to validate
    # @return [Symbol] validated mode
    #
    def validate_mode(mode)
      mode = mode.to_sym
      MODES.include?(mode) ? mode : :wysiwyg
    end
  end
end
