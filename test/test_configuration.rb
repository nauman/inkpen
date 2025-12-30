# frozen_string_literal: true

require "test_helper"

class TestConfiguration < Minitest::Test
  def setup
    Inkpen.reset_configuration!
    @config = Inkpen.configuration
  end

  def teardown
    Inkpen.reset_configuration!
  end

  # Defaults

  def test_default_toolbar
    assert_equal :floating, @config.toolbar
  end

  def test_default_extensions_are_core_only
    assert_equal Inkpen::Configuration::CORE_EXTENSIONS, @config.extensions
  end

  def test_default_placeholder
    assert_equal "Start writing...", @config.placeholder
  end

  def test_default_autosave_disabled
    refute @config.autosave
  end

  def test_default_autosave_interval
    assert_equal 5000, @config.autosave_interval
  end

  def test_default_min_height
    assert_equal "200px", @config.min_height
  end

  def test_default_max_height_is_nil
    assert_nil @config.max_height
  end

  # Core Extensions

  def test_core_extensions_include_formatting
    %i[bold italic strike underline].each do |ext|
      assert_includes Inkpen::Configuration::CORE_EXTENSIONS, ext
    end
  end

  def test_core_extensions_include_blocks
    %i[heading bullet_list ordered_list blockquote code_block].each do |ext|
      assert_includes Inkpen::Configuration::CORE_EXTENSIONS, ext
    end
  end

  # Advanced Extensions

  def test_advanced_extensions_include_export_commands
    assert_includes Inkpen::Configuration::ADVANCED_EXTENSIONS, :export_commands
  end

  def test_advanced_extensions_include_slash_commands
    assert_includes Inkpen::Configuration::ADVANCED_EXTENSIONS, :slash_commands
  end

  def test_advanced_extensions_include_block_gutter
    assert_includes Inkpen::Configuration::ADVANCED_EXTENSIONS, :block_gutter
  end

  def test_advanced_extensions_include_drag_handle
    assert_includes Inkpen::Configuration::ADVANCED_EXTENSIONS, :drag_handle
  end

  def test_advanced_extensions_include_database
    assert_includes Inkpen::Configuration::ADVANCED_EXTENSIONS, :database
  end

  def test_advanced_extensions_include_table_of_contents
    assert_includes Inkpen::Configuration::ADVANCED_EXTENSIONS, :table_of_contents
  end

  # Enable/Disable Extensions

  def test_enable_extension
    @config.enable_extension(:slash_commands)
    assert_includes @config.extensions, :slash_commands
  end

  def test_enable_extension_is_idempotent
    @config.enable_extension(:slash_commands)
    @config.enable_extension(:slash_commands)
    count = @config.extensions.count(:slash_commands)
    assert_equal 1, count
  end

  def test_disable_extension
    @config.disable_extension(:bold)
    refute_includes @config.extensions, :bold
  end

  def test_disable_extension_returns_removed
    result = @config.disable_extension(:bold)
    assert_equal :bold, result
  end

  def test_disable_nonexistent_extension_returns_nil
    result = @config.disable_extension(:nonexistent)
    assert_nil result
  end

  # All Extensions

  def test_all_extensions_returns_combined
    all = @config.all_extensions
    assert_includes all, :bold
    assert_includes all, :export_commands
  end

  def test_all_extensions_count
    expected = Inkpen::Configuration::CORE_EXTENSIONS.size +
               Inkpen::Configuration::ADVANCED_EXTENSIONS.size
    assert_equal expected, @config.all_extensions.size
  end

  # Configuration Block

  def test_configure_toolbar
    Inkpen.configure do |config|
      config.toolbar = :fixed
    end
    assert_equal :fixed, Inkpen.configuration.toolbar
  end

  def test_configure_extensions
    Inkpen.configure do |config|
      config.extensions = %i[bold italic]
    end
    assert_equal %i[bold italic], Inkpen.configuration.extensions
  end

  def test_configure_placeholder
    Inkpen.configure do |config|
      config.placeholder = "Write something..."
    end
    assert_equal "Write something...", Inkpen.configuration.placeholder
  end
end
