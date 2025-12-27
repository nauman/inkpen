# frozen_string_literal: true

module Inkpen
  # PORO representing sticky toolbar configuration
  #
  # The sticky toolbar provides block/media/widget insertion controls
  # that remain fixed on screen. Supports horizontal (bottom) and
  # vertical (left/right) layouts.
  #
  # Usage:
  #   sticky_toolbar = Inkpen::StickyToolbar.new(
  #     position: :bottom,
  #     buttons: [:table, :code_block, :image, :divider, :widget]
  #   )
  #
  #   # In editor helper:
  #   <%= inkpen_editor name: "post[body]",
  #                     sticky_toolbar: Inkpen::StickyToolbar.new(position: :right) %>
  #
  class StickyToolbar
    attr_reader :position, :buttons, :widget_types

    # Available positions
    POSITIONS = %i[bottom left right].freeze

    # Button groups
    BLOCK_BUTTONS = %i[table code_block blockquote horizontal_rule task_list].freeze
    MEDIA_BUTTONS = %i[image youtube embed].freeze
    WIDGET_BUTTONS = %i[widget].freeze # Opens modal picker

    PRESET_BLOCKS = BLOCK_BUTTONS.freeze
    PRESET_MEDIA = MEDIA_BUTTONS.freeze
    PRESET_FULL = (BLOCK_BUTTONS + MEDIA_BUTTONS + WIDGET_BUTTONS).freeze

    def initialize(position: :bottom, buttons: nil, widget_types: nil, enabled: true)
      @position = validate_position(position)
      @buttons = buttons || PRESET_FULL
      @widget_types = widget_types || default_widget_types
      @enabled = enabled
    end

    def enabled?
      @enabled
    end

    def vertical?
      %i[left right].include?(position)
    end

    def horizontal?
      position == :bottom
    end

    # Generate data attributes for Stimulus controller
    def data_attributes
      {
        "inkpen--sticky-toolbar-position-value" => position.to_s,
        "inkpen--sticky-toolbar-buttons-value" => buttons.to_json,
        "inkpen--sticky-toolbar-widget-types-value" => widget_types.to_json,
        "inkpen--sticky-toolbar-vertical-value" => vertical?.to_s
      }
    end

    private

    def validate_position(pos)
      pos = pos.to_sym
      POSITIONS.include?(pos) ? pos : :bottom
    end

    def default_widget_types
      %w[form gallery poll]
    end
  end
end
