# frozen_string_literal: true

require "test_helper"

class TestMarkdownMode < Minitest::Test
  # ===================
  # Initialization
  # ===================

  def test_disabled_by_default
    mode = Inkpen::MarkdownMode.new
    refute mode.enabled?
  end

  def test_can_be_enabled
    mode = Inkpen::MarkdownMode.new(enabled: true)
    assert mode.enabled?
  end

  def test_default_mode_is_wysiwyg
    mode = Inkpen::MarkdownMode.new
    assert_equal :wysiwyg, mode.default_mode
  end

  def test_can_set_default_mode_to_markdown
    mode = Inkpen::MarkdownMode.new(default_mode: :markdown)
    assert_equal :markdown, mode.default_mode
  end

  def test_can_set_default_mode_to_split
    mode = Inkpen::MarkdownMode.new(default_mode: :split)
    assert_equal :split, mode.default_mode
  end

  def test_invalid_mode_defaults_to_wysiwyg
    mode = Inkpen::MarkdownMode.new(default_mode: :invalid)
    assert_equal :wysiwyg, mode.default_mode
  end

  def test_string_mode_is_converted_to_symbol
    mode = Inkpen::MarkdownMode.new(default_mode: "markdown")
    assert_equal :markdown, mode.default_mode
  end

  def test_show_toggle_is_true_by_default
    mode = Inkpen::MarkdownMode.new
    assert mode.show_toggle
  end

  def test_toggle_placement_defaults_to_top
    mode = Inkpen::MarkdownMode.new
    assert_equal :top, mode.toggle_placement
  end

  def test_can_set_toggle_placement_to_inline
    mode = Inkpen::MarkdownMode.new(toggle_placement: :inline)
    assert_equal :inline, mode.toggle_placement
  end

  def test_invalid_toggle_placement_defaults_to_top
    mode = Inkpen::MarkdownMode.new(toggle_placement: :invalid)
    assert_equal :top, mode.toggle_placement
  end

  def test_can_hide_toggle
    mode = Inkpen::MarkdownMode.new(show_toggle: false)
    refute mode.show_toggle
  end

  def test_toolbar_button_is_false_by_default
    mode = Inkpen::MarkdownMode.new
    refute mode.toolbar_button
  end

  def test_can_enable_toolbar_button
    mode = Inkpen::MarkdownMode.new(toolbar_button: true)
    assert mode.toolbar_button
  end

  def test_default_sync_delay
    mode = Inkpen::MarkdownMode.new
    assert_equal 300, mode.sync_delay
  end

  def test_custom_sync_delay
    mode = Inkpen::MarkdownMode.new(sync_delay: 500)
    assert_equal 500, mode.sync_delay
  end

  def test_sync_delay_is_converted_to_integer
    mode = Inkpen::MarkdownMode.new(sync_delay: "400")
    assert_equal 400, mode.sync_delay
  end

  def test_keyboard_shortcuts_enabled_by_default
    mode = Inkpen::MarkdownMode.new
    assert mode.keyboard_shortcuts
  end

  def test_can_disable_keyboard_shortcuts
    mode = Inkpen::MarkdownMode.new(keyboard_shortcuts: false)
    refute mode.keyboard_shortcuts
  end

  # ===================
  # Mode Predicates
  # ===================

  def test_wysiwyg_default_predicate
    mode = Inkpen::MarkdownMode.new(default_mode: :wysiwyg)
    assert mode.wysiwyg_default?
    refute mode.markdown_default?
    refute mode.split_default?
  end

  def test_markdown_default_predicate
    mode = Inkpen::MarkdownMode.new(default_mode: :markdown)
    refute mode.wysiwyg_default?
    assert mode.markdown_default?
    refute mode.split_default?
  end

  def test_split_default_predicate
    mode = Inkpen::MarkdownMode.new(default_mode: :split)
    refute mode.wysiwyg_default?
    refute mode.markdown_default?
    assert mode.split_default?
  end

  # ===================
  # Data Attributes
  # ===================

  def test_data_attributes_includes_enabled
    mode = Inkpen::MarkdownMode.new(enabled: true)
    attrs = mode.data_attributes
    assert_equal "true", attrs["inkpen--editor-markdown-enabled-value"]
  end

  def test_data_attributes_includes_mode
    mode = Inkpen::MarkdownMode.new(default_mode: :split)
    attrs = mode.data_attributes
    assert_equal "split", attrs["inkpen--editor-markdown-mode-value"]
  end

  def test_data_attributes_includes_show_toggle
    mode = Inkpen::MarkdownMode.new(show_toggle: false)
    attrs = mode.data_attributes
    assert_equal "false", attrs["inkpen--editor-markdown-show-toggle-value"]
  end

  def test_data_attributes_includes_toggle_placement
    mode = Inkpen::MarkdownMode.new(toggle_placement: :inline)
    attrs = mode.data_attributes
    assert_equal "inline", attrs["inkpen--editor-markdown-toggle-placement-value"]
  end

  def test_data_attributes_includes_toolbar_button
    mode = Inkpen::MarkdownMode.new(toolbar_button: true)
    attrs = mode.data_attributes
    assert_equal "true", attrs["inkpen--editor-markdown-toolbar-button-value"]
  end

  def test_data_attributes_includes_sync_delay
    mode = Inkpen::MarkdownMode.new(sync_delay: 500)
    attrs = mode.data_attributes
    assert_equal "500", attrs["inkpen--editor-markdown-sync-delay-value"]
  end

  def test_data_attributes_includes_keyboard_shortcuts
    mode = Inkpen::MarkdownMode.new(keyboard_shortcuts: false)
    attrs = mode.data_attributes
    assert_equal "false", attrs["inkpen--editor-markdown-shortcuts-value"]
  end

  # ===================
  # to_config
  # ===================

  def test_to_config_returns_hash
    mode = Inkpen::MarkdownMode.new(
      enabled: true,
      default_mode: :split,
      show_toggle: true,
      toggle_placement: :inline,
      toolbar_button: true,
      sync_delay: 400,
      keyboard_shortcuts: true
    )
    config = mode.to_config

    assert_equal true, config[:enabled]
    assert_equal "split", config[:defaultMode]
    assert_equal true, config[:showToggle]
    assert_equal "inline", config[:togglePlacement]
    assert_equal true, config[:toolbarButton]
    assert_equal 400, config[:syncDelay]
    assert_equal true, config[:keyboardShortcuts]
  end

  def test_to_config_with_disabled_mode
    mode = Inkpen::MarkdownMode.new(enabled: false)
    config = mode.to_config

    assert_equal false, config[:enabled]
  end

  # ===================
  # to_json
  # ===================

  def test_to_json_returns_valid_json
    mode = Inkpen::MarkdownMode.new(enabled: true, default_mode: :markdown)
    json = mode.to_json
    parsed = JSON.parse(json)

    assert_equal true, parsed["enabled"]
    assert_equal "markdown", parsed["defaultMode"]
  end

  # ===================
  # Constants
  # ===================

  def test_modes_constant
    assert_equal %i[wysiwyg markdown split], Inkpen::MarkdownMode::MODES
  end

  def test_default_sync_delay_constant
    assert_equal 300, Inkpen::MarkdownMode::DEFAULT_SYNC_DELAY
  end
end
