# frozen_string_literal: true

module Inkpen
  module EditorHelper
    # Render an Inkpen editor field
    #
    # Usage:
    #   <%= inkpen_field :post, :body %>
    #   <%= inkpen_field :post, :body, toolbar: :floating %>
    #   <%= inkpen_field :post, :body, extensions: [:mentions, :hashtags] %>
    #
    def inkpen_field(object_name, method, options = {})
      value = options.delete(:value)

      # Try to get value from object if not provided
      if value.nil? && (object = instance_variable_get("@#{object_name}"))
        value = object.public_send(method) if object.respond_to?(method)
      end

      name = "#{object_name}[#{method}]"

      editor = Inkpen::Editor.new(
        name: name,
        value: value,
        **options
      )

      render_inkpen_editor(editor)
    end

    # Render an Inkpen editor with explicit configuration
    #
    # Usage:
    #   <%= inkpen_editor name: "content", value: @content %>
    #
    def inkpen_editor(name:, value: nil, **options)
      editor = Inkpen::Editor.new(
        name: name,
        value: value,
        **options
      )

      render_inkpen_editor(editor)
    end

    private

    def render_inkpen_editor(editor)
      render partial: "inkpen/editor", locals: { editor: editor }
    end
  end
end
