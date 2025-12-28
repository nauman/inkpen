# frozen_string_literal: true

require "test_helper"

class TestPreformatted < Minitest::Test
  def setup
    @extension = Inkpen::Extensions::Preformatted.new
  end

  # Lifecycle

  def test_name_returns_preformatted
    assert_equal :preformatted, @extension.name
  end

  def test_default_enabled
    assert @extension.enabled?
  end

  def test_can_be_disabled
    ext = Inkpen::Extensions::Preformatted.new(enabled: false)
    refute ext.enabled?
  end

  # Default options

  def test_default_show_line_numbers_is_false
    refute @extension.show_line_numbers?
  end

  def test_default_wrap_lines_is_false
    refute @extension.wrap_lines?
  end

  def test_default_tab_size_is_4
    assert_equal 4, @extension.tab_size
  end

  def test_default_show_label_is_true
    assert @extension.show_label?
  end

  def test_default_label_text
    assert_equal "Plain Text", @extension.label_text
  end

  # Custom options

  def test_custom_show_line_numbers
    ext = Inkpen::Extensions::Preformatted.new(show_line_numbers: true)
    assert ext.show_line_numbers?
  end

  def test_custom_wrap_lines
    ext = Inkpen::Extensions::Preformatted.new(wrap_lines: true)
    assert ext.wrap_lines?
  end

  def test_custom_tab_size
    ext = Inkpen::Extensions::Preformatted.new(tab_size: 2)
    assert_equal 2, ext.tab_size
  end

  def test_custom_label_text
    ext = Inkpen::Extensions::Preformatted.new(label_text: "ASCII Art")
    assert_equal "ASCII Art", ext.label_text
  end

  # Configuration

  def test_to_config_returns_hash
    config = @extension.to_config
    assert_kind_of Hash, config
  end

  def test_to_config_uses_camel_case
    config = @extension.to_config
    assert config.key?(:showLineNumbers)
    assert config.key?(:wrapLines)
    assert config.key?(:tabSize)
    assert config.key?(:showLabel)
    assert config.key?(:labelText)
  end

  def test_to_config_values_match_methods
    config = @extension.to_config
    assert_equal @extension.show_line_numbers?, config[:showLineNumbers]
    assert_equal @extension.wrap_lines?, config[:wrapLines]
    assert_equal @extension.tab_size, config[:tabSize]
    assert_equal @extension.show_label?, config[:showLabel]
    assert_equal @extension.label_text, config[:labelText]
  end

  def test_to_h_includes_name_and_enabled
    result = @extension.to_h
    assert_equal :preformatted, result[:name]
    assert result[:enabled]
    assert_kind_of Hash, result[:config]
  end
end
