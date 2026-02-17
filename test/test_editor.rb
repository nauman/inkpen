# frozen_string_literal: true

require "test_helper"

class TestEditor < Minitest::Test
  def setup
    Inkpen.reset_configuration!
  end

  def teardown
    Inkpen.reset_configuration!
  end

  # Initialization

  def test_requires_name
    editor = Inkpen::Editor.new(name: "post[body]")
    assert_equal "post[body]", editor.name
  end

  def test_optional_value
    editor = Inkpen::Editor.new(name: "post[body]", value: "<p>Hello</p>")
    assert_equal "<p>Hello</p>", editor.value
  end

  def test_nil_value_by_default
    editor = Inkpen::Editor.new(name: "post[body]")
    assert_nil editor.value
  end

  # Toolbar Configuration

  def test_default_toolbar_from_config
    Inkpen.configure { |c| c.toolbar = :fixed }
    editor = Inkpen::Editor.new(name: "post[body]")
    assert_equal :fixed, editor.toolbar
  end

  def test_override_toolbar
    editor = Inkpen::Editor.new(name: "post[body]", toolbar: :none)
    assert_equal :none, editor.toolbar
  end

  # Extensions

  def test_default_extensions_from_config
    editor = Inkpen::Editor.new(name: "post[body]")
    assert_equal Inkpen.configuration.extensions, editor.extensions
  end

  def test_override_extensions
    editor = Inkpen::Editor.new(
      name: "post[body]",
      extensions: %i[bold italic export_commands]
    )
    assert_equal %i[bold italic export_commands], editor.extensions
  end

  def test_extension_enabled
    editor = Inkpen::Editor.new(
      name: "post[body]",
      extensions: %i[bold export_commands]
    )
    assert editor.extension_enabled?(:export_commands)
    assert editor.extension_enabled?("export_commands")
  end

  def test_extension_not_enabled
    editor = Inkpen::Editor.new(
      name: "post[body]",
      extensions: %i[bold italic]
    )
    refute editor.extension_enabled?(:export_commands)
  end

  # Extension Config

  def test_extension_config_empty_by_default
    editor = Inkpen::Editor.new(name: "post[body]")
    assert_equal({}, editor.extension_config)
  end

  def test_extension_config_custom
    config = { export_commands: { defaultFilename: "my-doc" } }
    editor = Inkpen::Editor.new(name: "post[body]", extension_config: config)
    assert_equal config, editor.extension_config
  end

  # Input Name/ID

  def test_input_name
    editor = Inkpen::Editor.new(name: "post[body]")
    assert_equal "post[body]", editor.input_name
  end

  def test_input_id_from_bracket_notation
    editor = Inkpen::Editor.new(name: "post[body]")
    assert_equal "post_body", editor.input_id
  end

  def test_input_id_from_nested_brackets
    editor = Inkpen::Editor.new(name: "post[content][body]")
    assert_equal "post_content_body", editor.input_id
  end

  # Data Attributes

  def test_data_attributes_includes_controller
    editor = Inkpen::Editor.new(name: "post[body]")
    attrs = editor.data_attributes
    assert_includes attrs[:data][:controller], "inkpen--editor"
  end

  def test_data_attributes_includes_extensions
    editor = Inkpen::Editor.new(name: "post[body]", extensions: %i[bold])
    attrs = editor.data_attributes
    assert_equal '["bold"]', attrs[:data]["inkpen--editor-extensions-value"]
  end

  def test_data_attributes_includes_toolbar
    editor = Inkpen::Editor.new(name: "post[body]", toolbar: :floating)
    attrs = editor.data_attributes
    assert_equal "floating", attrs[:data]["inkpen--editor-toolbar-value"]
  end

  def test_data_attributes_includes_placeholder
    editor = Inkpen::Editor.new(name: "post[body]", placeholder: "Write here...")
    attrs = editor.data_attributes
    assert_equal "Write here...", attrs[:data]["inkpen--editor-placeholder-value"]
  end

  # Style Attributes

  def test_style_attributes_with_min_height
    editor = Inkpen::Editor.new(name: "post[body]", min_height: "300px")
    assert_includes editor.style_attributes, "min-height: 300px"
  end

  def test_style_attributes_with_max_height
    editor = Inkpen::Editor.new(name: "post[body]", max_height: "500px")
    assert_includes editor.style_attributes, "max-height: 500px"
  end

  def test_style_attributes_combined
    editor = Inkpen::Editor.new(
      name: "post[body]",
      min_height: "200px",
      max_height: "600px"
    )
    style = editor.style_attributes
    assert_includes style, "min-height: 200px"
    assert_includes style, "max-height: 600px"
  end

  # Sticky Toolbar

  def test_sticky_toolbar_nil_by_default
    editor = Inkpen::Editor.new(name: "post[body]")
    assert_nil editor.sticky_toolbar
  end

  def test_sticky_toolbar_can_be_set
    toolbar = Inkpen::StickyToolbar.new(position: :bottom)
    editor = Inkpen::Editor.new(name: "post[body]", sticky_toolbar: toolbar)
    assert_equal toolbar, editor.sticky_toolbar
  end

  def test_data_attributes_includes_sticky_toolbar_controller
    toolbar = Inkpen::StickyToolbar.new(position: :bottom)
    editor = Inkpen::Editor.new(name: "post[body]", sticky_toolbar: toolbar)
    attrs = editor.data_attributes
    assert_includes attrs[:data][:controller], "inkpen--sticky-toolbar"
  end

  # Markdown Mode

  def test_markdown_mode_nil_by_default
    editor = Inkpen::Editor.new(name: "post[body]")
    assert_nil editor.markdown_mode
  end

  def test_markdown_mode_can_be_set
    mode = Inkpen::MarkdownMode.new(enabled: true)
    editor = Inkpen::Editor.new(name: "post[body]", markdown_mode: mode)
    assert_equal mode, editor.markdown_mode
  end

  def test_data_attributes_includes_markdown_mode_when_enabled
    mode = Inkpen::MarkdownMode.new(enabled: true, default_mode: :split)
    editor = Inkpen::Editor.new(name: "post[body]", markdown_mode: mode)
    attrs = editor.data_attributes

    assert_equal "true", attrs[:data]["inkpen--editor-markdown-enabled-value"]
    assert_equal "split", attrs[:data]["inkpen--editor-markdown-mode-value"]
  end

  def test_data_attributes_excludes_markdown_mode_when_disabled
    mode = Inkpen::MarkdownMode.new(enabled: false)
    editor = Inkpen::Editor.new(name: "post[body]", markdown_mode: mode)
    attrs = editor.data_attributes

    refute attrs[:data].key?("inkpen--editor-markdown-enabled-value")
  end

  def test_data_attributes_excludes_markdown_mode_when_nil
    editor = Inkpen::Editor.new(name: "post[body]")
    attrs = editor.data_attributes

    refute attrs[:data].key?("inkpen--editor-markdown-enabled-value")
  end
end
