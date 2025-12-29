# frozen_string_literal: true

module Inkpen
  ##
  # PORO representing toolbar configuration.
  #
  # The Toolbar class configures the floating or fixed toolbar that
  # appears when text is selected (floating) or at the top of the
  # editor (fixed).
  #
  # @example Basic floating toolbar
  #   toolbar = Inkpen::Toolbar.new(style: :floating)
  #
  # @example Custom button set
  #   toolbar = Inkpen::Toolbar.new(
  #     style: :fixed,
  #     buttons: [:bold, :italic, :link, :heading]
  #   )
  #
  # @example Using presets
  #   toolbar = Inkpen::Toolbar.new(
  #     style: :floating,
  #     buttons: Inkpen::Toolbar::PRESET_MINIMAL
  #   )
  #
  # @see Inkpen::StickyToolbar For block insertion toolbar
  #
  # @author Nauman Tariq
  # @since 0.1.0
  #
  class Toolbar
    ##
    # @!attribute [r] style
    #   @return [Symbol] toolbar display style (:floating, :fixed, :none)
    #
    # @!attribute [r] buttons
    #   @return [Array<Symbol>] list of toolbar buttons
    #
    # @!attribute [r] position
    #   @return [Symbol] toolbar position (:top, :bottom)
    #
    attr_reader :style, :buttons, :position

    ##
    # Text formatting buttons (bold, italic, strike, underline).
    # @return [Array<Symbol>]
    FORMATTING_BUTTONS = %i[bold italic strike underline].freeze

    ##
    # Block-level formatting buttons.
    # @return [Array<Symbol>]
    BLOCK_BUTTONS = %i[heading bullet_list ordered_list blockquote code_block].freeze

    ##
    # Content insertion buttons.
    # @return [Array<Symbol>]
    INSERT_BUTTONS = %i[link image table horizontal_rule].freeze

    ##
    # Minimal preset (bold, italic, link).
    # @return [Array<Symbol>]
    PRESET_MINIMAL = %i[bold italic link].freeze

    ##
    # Standard preset with common formatting options.
    # @return [Array<Symbol>]
    PRESET_STANDARD = (FORMATTING_BUTTONS + %i[link heading bullet_list ordered_list blockquote]).freeze

    ##
    # Full preset with all available buttons.
    # @return [Array<Symbol>]
    PRESET_FULL = (FORMATTING_BUTTONS + BLOCK_BUTTONS + INSERT_BUTTONS).freeze

    ##
    # Initialize a new toolbar configuration.
    #
    # @param style [Symbol] toolbar style (:floating, :fixed, :none)
    # @param buttons [Array<Symbol>, nil] custom button list (defaults to preset)
    # @param position [Symbol] toolbar position (:top, :bottom)
    #
    def initialize(style: :floating, buttons: nil, position: :top)
      @style = style.to_sym
      @buttons = buttons || default_buttons_for_style
      @position = position.to_sym
    end

    ##
    # Check if toolbar uses floating (bubble menu) style.
    #
    # @return [Boolean] true if floating style
    #
    def floating?
      style == :floating
    end

    ##
    # Check if toolbar uses fixed style.
    #
    # @return [Boolean] true if fixed style
    #
    def fixed?
      style == :fixed
    end

    ##
    # Check if toolbar is hidden.
    #
    # @return [Boolean] true if toolbar is hidden
    #
    def hidden?
      style == :none
    end

    ##
    # Generate data attributes for Stimulus controller.
    #
    # @return [Hash] data attributes hash
    #
    def data_attributes
      {
        "inkpen--toolbar-style-value" => style.to_s,
        "inkpen--toolbar-buttons-value" => buttons.to_json,
        "inkpen--toolbar-position-value" => position.to_s
      }
    end

    private

    ##
    # Get default buttons based on toolbar style.
    #
    # @return [Array<Symbol>] default button list
    #
    def default_buttons_for_style
      case style
      when :floating
        PRESET_STANDARD
      when :fixed
        PRESET_FULL
      else
        []
      end
    end
  end
end
