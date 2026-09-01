# frozen_string_literal: true

require "test_helper"
require_relative "../app/helpers/inkpen/editor_helper"

class TestEditorHelper < Minitest::Test
  class HelperHarness
    include Inkpen::EditorHelper

    attr_reader :rendered_editor

    def bind(name, object)
      instance_variable_set("@#{name}", object)
    end

    private

    def render_inkpen_editor(editor)
      @rendered_editor = editor
    end
  end

  def setup
    @helper = HelperHarness.new
  end

  def test_explicit_value_wins_over_bound_object
    @helper.bind(:post, Struct.new(:body).new("<p>Bound</p>"))

    editor = @helper.inkpen_field(:post, :body, value: "<p>Explicit</p>")

    assert_equal "<p>Explicit</p>", editor.value
  end

  def test_uses_bound_object_value_when_value_is_absent
    @helper.bind(:post, Struct.new(:body).new("<p>Bound</p>"))

    editor = @helper.inkpen_field(:post, :body)

    assert_equal "<p>Bound</p>", editor.value
  end

  def test_missing_bound_method_leaves_value_nil
    @helper.bind(:post, Object.new)

    editor = @helper.inkpen_field(:post, :body)

    assert_nil editor.value
  end

  def test_forwards_name_and_editor_options
    editor = @helper.inkpen_field(:post, :body, toolbar: :fixed, placeholder: "Compose")

    assert_equal "post[body]", editor.name
    assert_equal :fixed, editor.toolbar
    assert_equal "Compose", editor.placeholder
    assert_same editor, @helper.rendered_editor
  end
end
