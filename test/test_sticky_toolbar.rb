# frozen_string_literal: true

require "test_helper"

class TestStickyToolbar < Minitest::Test
  # Initialization

  def test_default_position_is_bottom
    toolbar = Inkpen::StickyToolbar.new
    assert_equal :bottom, toolbar.position
  end

  def test_custom_position
    toolbar = Inkpen::StickyToolbar.new(position: :left)
    assert_equal :left, toolbar.position
  end

  def test_invalid_position_falls_back_to_bottom
    toolbar = Inkpen::StickyToolbar.new(position: :invalid)
    assert_equal :bottom, toolbar.position
  end

  def test_default_enabled
    toolbar = Inkpen::StickyToolbar.new
    assert toolbar.enabled?
  end

  def test_can_be_disabled
    toolbar = Inkpen::StickyToolbar.new(enabled: false)
    refute toolbar.enabled?
  end

  # Position Predicates

  def test_horizontal_for_bottom
    toolbar = Inkpen::StickyToolbar.new(position: :bottom)
    assert toolbar.horizontal?
    refute toolbar.vertical?
  end

  def test_vertical_for_left
    toolbar = Inkpen::StickyToolbar.new(position: :left)
    assert toolbar.vertical?
    refute toolbar.horizontal?
  end

  def test_vertical_for_right
    toolbar = Inkpen::StickyToolbar.new(position: :right)
    assert toolbar.vertical?
    refute toolbar.horizontal?
  end

  # Default Buttons

  def test_default_buttons_is_full_preset
    toolbar = Inkpen::StickyToolbar.new
    assert_equal Inkpen::StickyToolbar::PRESET_FULL, toolbar.buttons
  end

  def test_custom_buttons
    buttons = %i[table image]
    toolbar = Inkpen::StickyToolbar.new(buttons: buttons)
    assert_equal buttons, toolbar.buttons
  end

  # Button Presets

  def test_block_buttons_include_table
    assert_includes Inkpen::StickyToolbar::BLOCK_BUTTONS, :table
  end

  def test_block_buttons_include_code_block
    assert_includes Inkpen::StickyToolbar::BLOCK_BUTTONS, :code_block
  end

  def test_media_buttons_include_image
    assert_includes Inkpen::StickyToolbar::MEDIA_BUTTONS, :image
  end

  def test_media_buttons_include_youtube
    assert_includes Inkpen::StickyToolbar::MEDIA_BUTTONS, :youtube
  end

  def test_full_preset_includes_all_groups
    preset = Inkpen::StickyToolbar::PRESET_FULL
    (Inkpen::StickyToolbar::BLOCK_BUTTONS +
     Inkpen::StickyToolbar::MEDIA_BUTTONS +
     Inkpen::StickyToolbar::WIDGET_BUTTONS).each do |btn|
      assert_includes preset, btn
    end
  end

  # Widget Types

  def test_default_widget_types
    toolbar = Inkpen::StickyToolbar.new
    assert_includes toolbar.widget_types, "form"
    assert_includes toolbar.widget_types, "gallery"
    assert_includes toolbar.widget_types, "poll"
  end

  def test_custom_widget_types
    types = %w[chart map]
    toolbar = Inkpen::StickyToolbar.new(widget_types: types)
    assert_equal types, toolbar.widget_types
  end

  # Data Attributes

  def test_data_attributes_includes_position
    toolbar = Inkpen::StickyToolbar.new(position: :bottom)
    attrs = toolbar.data_attributes
    assert_equal "bottom", attrs["inkpen--sticky-toolbar-position-value"]
  end

  def test_data_attributes_includes_buttons_as_json
    toolbar = Inkpen::StickyToolbar.new(buttons: %i[table image])
    attrs = toolbar.data_attributes
    assert_equal '["table","image"]', attrs["inkpen--sticky-toolbar-buttons-value"]
  end

  def test_data_attributes_includes_widget_types_as_json
    toolbar = Inkpen::StickyToolbar.new(widget_types: %w[form])
    attrs = toolbar.data_attributes
    assert_equal '["form"]', attrs["inkpen--sticky-toolbar-widget-types-value"]
  end

  def test_data_attributes_includes_vertical_flag
    toolbar = Inkpen::StickyToolbar.new(position: :left)
    attrs = toolbar.data_attributes
    assert_equal "true", attrs["inkpen--sticky-toolbar-vertical-value"]
  end
end
