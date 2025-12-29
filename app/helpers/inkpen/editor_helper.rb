# frozen_string_literal: true

module Inkpen
  ##
  # View helpers for rendering Inkpen editors in Rails views.
  #
  # Include this module in your ApplicationHelper or use it directly
  # in views that need Inkpen editors.
  #
  # @example Basic form field
  #   <%= inkpen_field :post, :body %>
  #
  # @example With configuration
  #   <%= inkpen_field :post, :body,
  #       toolbar: :floating,
  #       extensions: [:slash_commands, :drag_handle] %>
  #
  # @example Standalone editor
  #   <%= inkpen_editor name: "content", value: @content %>
  #
  # @author Nauman Tariq
  # @since 0.1.0
  #
  module EditorHelper
    ##
    # Render an Inkpen editor field bound to a model attribute.
    #
    # This helper automatically retrieves the value from the model
    # instance variable if available.
    #
    # @param object_name [Symbol, String] the model name (e.g., :post)
    # @param method [Symbol, String] the attribute name (e.g., :body)
    # @param options [Hash] editor configuration options
    #
    # @option options [String] :value override the attribute value
    # @option options [Symbol] :toolbar toolbar style (:floating, :fixed, :none)
    # @option options [Array<Symbol>] :extensions list of extensions
    # @option options [Hash] :extension_config per-extension config
    # @option options [String] :placeholder placeholder text
    #
    # @return [String] rendered editor HTML
    #
    # @example Basic usage
    #   <%= inkpen_field :post, :body %>
    #
    # @example With extensions
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

    ##
    # Render an Inkpen editor with explicit configuration.
    #
    # Use this when you need full control over the field name and value,
    # or when not binding to a model.
    #
    # @param name [String] the form field name
    # @param value [String, nil] initial HTML content
    # @param options [Hash] editor configuration options
    #
    # @option options [Symbol] :toolbar toolbar style
    # @option options [Array<Symbol>] :extensions list of extensions
    # @option options [StickyToolbar] :sticky_toolbar sticky toolbar config
    #
    # @return [String] rendered editor HTML
    #
    # @example Basic usage
    #   <%= inkpen_editor name: "content", value: @content %>
    #
    # @example Full-featured
    #   <%= inkpen_editor name: "post[body]",
    #       toolbar: :sticky,
    #       extensions: [:slash_commands, :export_commands] %>
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

    ##
    # Render the editor partial.
    #
    # @param editor [Editor] the editor instance
    # @return [String] rendered HTML
    #
    def render_inkpen_editor(editor)
      render partial: "inkpen/editor", locals: { editor: editor }
    end
  end
end
