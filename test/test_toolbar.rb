# frozen_string_literal: true

require "test_helper"

class TestToolbar < Minitest::Test
  # Initialization

  def test_default_style_is_floating
    toolbar = Inkpen::Toolbar.new
    assert_equal :floating, toolbar.style
  end

  def test_custom_style
    toolbar = Inkpen::Toolbar.new(style: :fixed)
    assert_equal :fixed, toolbar.style
  end

  def test_style_converted_to_symbol
    toolbar = Inkpen::Toolbar.new(style: "fixed")
    assert_equal :fixed, toolbar.style
  end

  def test_default_position_is_top
    toolbar = Inkpen::Toolbar.new
    assert_equal :top, toolbar.position
  end

  def test_custom_position
    toolbar = Inkpen::Toolbar.new(position: :bottom)
    assert_equal :bottom, toolbar.position
  end

  # Style Predicates

  def test_floating_predicate
    toolbar = Inkpen::Toolbar.new(style: :floating)
    assert toolbar.floating?
    refute toolbar.fixed?
    refute toolbar.hidden?
  end

  def test_fixed_predicate
    toolbar = Inkpen::Toolbar.new(style: :fixed)
    assert toolbar.fixed?
    refute toolbar.floating?
    refute toolbar.hidden?
  end

  def test_hidden_predicate
    toolbar = Inkpen::Toolbar.new(style: :none)
    assert toolbar.hidden?
    refute toolbar.floating?
    refute toolbar.fixed?
  end

  # Default Buttons

  def test_floating_style_gets_standard_preset
    toolbar = Inkpen::Toolbar.new(style: :floating)
    assert_equal Inkpen::Toolbar::PRESET_STANDARD, toolbar.buttons
  end

  def test_fixed_style_gets_full_preset
    toolbar = Inkpen::Toolbar.new(style: :fixed)
    assert_equal Inkpen::Toolbar::PRESET_FULL, toolbar.buttons
  end

  def test_none_style_gets_empty_buttons
    toolbar = Inkpen::Toolbar.new(style: :none)
    assert_empty toolbar.buttons
  end

  def test_custom_buttons_override_default
    buttons = %i[bold italic]
    toolbar = Inkpen::Toolbar.new(buttons: buttons)
    assert_equal buttons, toolbar.buttons
  end

  # Presets

  def test_minimal_preset_has_basic_formatting
    preset = Inkpen::Toolbar::PRESET_MINIMAL
    assert_includes preset, :bold
    assert_includes preset, :italic
    assert_includes preset, :link
  end

  def test_standard_preset_includes_formatting_buttons
    preset = Inkpen::Toolbar::PRESET_STANDARD
    Inkpen::Toolbar::FORMATTING_BUTTONS.each do |btn|
      assert_includes preset, btn
    end
  end

  def test_full_preset_includes_all_button_groups
    preset = Inkpen::Toolbar::PRESET_FULL
    (Inkpen::Toolbar::FORMATTING_BUTTONS +
     Inkpen::Toolbar::BLOCK_BUTTONS +
     Inkpen::Toolbar::INSERT_BUTTONS).each do |btn|
      assert_includes preset, btn
    end
  end

  # Data Attributes

  def test_data_attributes_includes_style
    toolbar = Inkpen::Toolbar.new(style: :floating)
    attrs = toolbar.data_attributes
    assert_equal "floating", attrs["inkpen--toolbar-style-value"]
  end

  def test_data_attributes_includes_buttons_as_json
    toolbar = Inkpen::Toolbar.new(buttons: %i[bold italic])
    attrs = toolbar.data_attributes
    assert_equal '["bold","italic"]', attrs["inkpen--toolbar-buttons-value"]
  end

  def test_data_attributes_includes_position
    toolbar = Inkpen::Toolbar.new(position: :top)
    attrs = toolbar.data_attributes
    assert_equal "top", attrs["inkpen--toolbar-position-value"]
  end
end
