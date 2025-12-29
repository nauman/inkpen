# frozen_string_literal: true

module Inkpen
  ##
  # PORO representing sticky toolbar configuration.
  #
  # The StickyToolbar provides block and media insertion controls that
  # remain fixed on screen. It's separate from the text formatting
  # toolbar and focused on inserting new content blocks.
  #
  # Supports horizontal (bottom) and vertical (left/right) layouts.
  #
  # @example Basic bottom toolbar
  #   sticky_toolbar = Inkpen::StickyToolbar.new(position: :bottom)
  #
  # @example Custom buttons
  #   sticky_toolbar = Inkpen::StickyToolbar.new(
  #     position: :bottom,
  #     buttons: [:table, :code_block, :image, :divider]
  #   )
  #
  # @example In editor helper
  #   <%= inkpen_editor name: "post[body]",
  #       sticky_toolbar: Inkpen::StickyToolbar.new(position: :right) %>
  #
  # @see Inkpen::Toolbar For text formatting toolbar
  #
  # @author Nauman Tariq
  # @since 0.2.1
  #
  class StickyToolbar
    ##
    # @!attribute [r] position
    #   @return [Symbol] toolbar position (:bottom, :left, :right)
    #
    # @!attribute [r] buttons
    #   @return [Array<Symbol>] list of toolbar buttons
    #
    # @!attribute [r] widget_types
    #   @return [Array<String>] available widget types for widget picker
    #
    attr_reader :position, :buttons, :widget_types

    ##
    # Valid toolbar positions.
    # @return [Array<Symbol>]
    POSITIONS = %i[bottom left right].freeze

    ##
    # Block insertion buttons.
    # @return [Array<Symbol>]
    BLOCK_BUTTONS = %i[table code_block blockquote horizontal_rule task_list].freeze

    ##
    # Media insertion buttons.
    # @return [Array<Symbol>]
    MEDIA_BUTTONS = %i[image youtube embed].freeze

    ##
    # Widget insertion buttons (opens modal picker).
    # @return [Array<Symbol>]
    WIDGET_BUTTONS = %i[widget].freeze

    ##
    # Preset with block buttons only.
    # @return [Array<Symbol>]
    PRESET_BLOCKS = BLOCK_BUTTONS.freeze

    ##
    # Preset with media buttons only.
    # @return [Array<Symbol>]
    PRESET_MEDIA = MEDIA_BUTTONS.freeze

    ##
    # Full preset with all buttons.
    # @return [Array<Symbol>]
    PRESET_FULL = (BLOCK_BUTTONS + MEDIA_BUTTONS + WIDGET_BUTTONS).freeze

    ##
    # Initialize a new sticky toolbar configuration.
    #
    # @param position [Symbol] toolbar position (:bottom, :left, :right)
    # @param buttons [Array<Symbol>, nil] custom button list
    # @param widget_types [Array<String>, nil] widget types for picker
    # @param enabled [Boolean] whether the sticky toolbar is enabled
    #
    def initialize(position: :bottom, buttons: nil, widget_types: nil, enabled: true)
      @position = validate_position(position)
      @buttons = buttons || PRESET_FULL
      @widget_types = widget_types || default_widget_types
      @enabled = enabled
    end

    ##
    # Check if the sticky toolbar is enabled.
    #
    # @return [Boolean] true if enabled
    #
    def enabled?
      @enabled
    end

    ##
    # Check if toolbar uses vertical layout (left or right).
    #
    # @return [Boolean] true if vertical
    #
    def vertical?
      %i[left right].include?(position)
    end

    ##
    # Check if toolbar uses horizontal layout (bottom).
    #
    # @return [Boolean] true if horizontal
    #
    def horizontal?
      position == :bottom
    end

    ##
    # Generate data attributes for Stimulus controller.
    #
    # @return [Hash] data attributes hash
    #
    def data_attributes
      {
        "inkpen--sticky-toolbar-position-value" => position.to_s,
        "inkpen--sticky-toolbar-buttons-value" => buttons.to_json,
        "inkpen--sticky-toolbar-widget-types-value" => widget_types.to_json,
        "inkpen--sticky-toolbar-vertical-value" => vertical?.to_s
      }
    end

    private

    ##
    # Validate and normalize position value.
    #
    # @param pos [Symbol, String] position to validate
    # @return [Symbol] validated position
    #
    def validate_position(pos)
      pos = pos.to_sym
      POSITIONS.include?(pos) ? pos : :bottom
    end

    ##
    # Default widget types for the widget picker.
    #
    # @return [Array<String>] widget type names
    #
    def default_widget_types
      %w[form gallery poll]
    end
  end
end
