# frozen_string_literal: true

require "test_helper"

class TestSlashCommands < Minitest::Test
  def setup
    @extension = Inkpen::Extensions::SlashCommands.new
  end

  # Lifecycle

  def test_name_returns_slash_commands
    assert_equal :slash_commands, @extension.name
  end

  def test_default_enabled
    assert @extension.enabled?
  end

  def test_can_be_disabled
    ext = Inkpen::Extensions::SlashCommands.new(enabled: false)
    refute ext.enabled?
  end

  # Configuration

  def test_default_commands_exist
    refute_empty Inkpen::Extensions::SlashCommands::DEFAULT_COMMANDS
  end

  def test_default_groups_exist
    refute_empty Inkpen::Extensions::SlashCommands::DEFAULT_GROUPS
  end

  def test_to_config_returns_hash
    config = @extension.to_config
    assert_kind_of Hash, config
  end

  def test_to_config_includes_trigger
    config = @extension.to_config
    assert_equal "/", config[:trigger]
  end

  def test_to_config_includes_commands
    config = @extension.to_config
    assert_kind_of Array, config[:commands]
  end

  def test_to_config_includes_groups
    config = @extension.to_config
    assert_kind_of Array, config[:groups]
  end

  # Custom options

  def test_custom_trigger
    ext = Inkpen::Extensions::SlashCommands.new(trigger: "!")
    assert_equal "!", ext.to_config[:trigger]
  end

  def test_custom_max_suggestions
    ext = Inkpen::Extensions::SlashCommands.new(max_suggestions: 5)
    assert_equal 5, ext.to_config[:maxSuggestions]
  end

  def test_to_h_includes_name_and_enabled
    result = @extension.to_h
    assert_equal :slash_commands, result[:name]
    assert result[:enabled]
    assert_kind_of Hash, result[:config]
  end

  # Commands structure

  def test_default_commands_have_required_fields
    Inkpen::Extensions::SlashCommands::DEFAULT_COMMANDS.each do |cmd|
      assert cmd[:name], "Command missing name"
      assert cmd[:label], "Command missing label"
      assert cmd[:group], "Command missing group"
    end
  end
end
