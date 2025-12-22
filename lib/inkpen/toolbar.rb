# frozen_string_literal: true

module Inkpen
  # PORO representing toolbar configuration
  #
  # Usage:
  #   toolbar = Inkpen::Toolbar.new(
  #     style: :floating,
  #     buttons: [:bold, :italic, :link]
  #   )
  #
  class Toolbar
    attr_reader :style, :buttons, :position

    # Predefined button groups
    FORMATTING_BUTTONS = %i[bold italic strike underline].freeze
    BLOCK_BUTTONS = %i[heading bullet_list ordered_list blockquote code_block].freeze
    INSERT_BUTTONS = %i[link image table horizontal_rule].freeze

    PRESET_MINIMAL = %i[bold italic link].freeze
    PRESET_STANDARD = (FORMATTING_BUTTONS + %i[link heading bullet_list ordered_list blockquote]).freeze
    PRESET_FULL = (FORMATTING_BUTTONS + BLOCK_BUTTONS + INSERT_BUTTONS).freeze

    def initialize(style: :floating, buttons: nil, position: :top)
      @style = style.to_sym
      @buttons = buttons || default_buttons_for_style
      @position = position.to_sym
    end

    def floating?
      style == :floating
    end

    def fixed?
      style == :fixed
    end

    def hidden?
      style == :none
    end

    def data_attributes
      {
        "inkpen--toolbar-style-value" => style.to_s,
        "inkpen--toolbar-buttons-value" => buttons.to_json,
        "inkpen--toolbar-position-value" => position.to_s
      }
    end

    private

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
