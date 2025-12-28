# frozen_string_literal: true

require "test_helper"

class TestSection < Minitest::Test
  def setup
    @extension = Inkpen::Extensions::Section.new
  end

  # Lifecycle

  def test_name_returns_section
    assert_equal :section, @extension.name
  end

  def test_default_enabled
    assert @extension.enabled?
  end

  def test_can_be_disabled
    ext = Inkpen::Extensions::Section.new(enabled: false)
    refute ext.enabled?
  end

  # Presets

  def test_width_presets_exist
    refute_empty Inkpen::Extensions::Section::WIDTH_PRESETS
  end

  def test_spacing_presets_exist
    refute_empty Inkpen::Extensions::Section::SPACING_PRESETS
  end

  def test_width_presets_have_required_keys
    Inkpen::Extensions::Section::WIDTH_PRESETS.each do |key, preset|
      assert preset[:max_width], "Width preset #{key} missing max_width"
      assert preset[:label], "Width preset #{key} missing label"
    end
  end

  def test_spacing_presets_have_required_keys
    Inkpen::Extensions::Section::SPACING_PRESETS.each do |key, preset|
      assert preset[:padding], "Spacing preset #{key} missing padding"
      assert preset[:label], "Spacing preset #{key} missing label"
    end
  end

  # Default options

  def test_default_width
    assert_equal "default", @extension.default_width
  end

  def test_default_spacing
    assert_equal "normal", @extension.default_spacing
  end

  def test_default_show_controls_is_true
    assert @extension.show_controls?
  end

  # Custom options

  def test_custom_default_width
    ext = Inkpen::Extensions::Section.new(default_width: "wide")
    assert_equal "wide", ext.default_width
  end

  def test_custom_default_spacing
    ext = Inkpen::Extensions::Section.new(default_spacing: "spacious")
    assert_equal "spacious", ext.default_spacing
  end

  def test_custom_show_controls
    ext = Inkpen::Extensions::Section.new(show_controls: false)
    refute ext.show_controls?
  end

  def test_custom_width_presets
    custom = { extra_wide: { max_width: "1200px", label: "Extra Wide" } }
    ext = Inkpen::Extensions::Section.new(width_presets: custom)
    assert ext.width_presets.key?(:extra_wide)
    assert ext.width_presets.key?(:narrow) # Original presets still exist
  end

  # Configuration

  def test_to_config_returns_hash
    config = @extension.to_config
    assert_kind_of Hash, config
  end

  def test_to_config_uses_camel_case
    config = @extension.to_config
    assert config.key?(:defaultWidth)
    assert config.key?(:defaultSpacing)
    assert config.key?(:showControls)
    assert config.key?(:widthPresets)
    assert config.key?(:spacingPresets)
  end

  def test_to_config_presets_use_camel_case
    config = @extension.to_config
    # Check that max_width becomes maxWidth
    narrow_preset = config[:widthPresets][:narrow]
    assert narrow_preset.key?(:maxWidth) || narrow_preset.key?("maxWidth")
  end

  def test_to_h_includes_name_and_enabled
    result = @extension.to_h
    assert_equal :section, result[:name]
    assert result[:enabled]
    assert_kind_of Hash, result[:config]
  end
end
