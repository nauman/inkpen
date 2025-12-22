# frozen_string_literal: true

module Inkpen
  # PORO representing an editor instance
  #
  # Usage:
  #   editor = Inkpen::Editor.new(
  #     name: "post[body]",
  #     value: @post.body,
  #     toolbar: :floating,
  #     extensions: [:mentions, :hashtags]
  #   )
  #
  class Editor
    attr_reader :name, :value, :toolbar, :extensions, :placeholder,
                :autosave, :autosave_interval, :min_height, :max_height,
                :html_attributes

    def initialize(name:, value: nil, **options)
      @name = name
      @value = value
      @toolbar = options.fetch(:toolbar, Inkpen.configuration.toolbar)
      @extensions = options.fetch(:extensions, Inkpen.configuration.extensions)
      @placeholder = options.fetch(:placeholder, Inkpen.configuration.placeholder)
      @autosave = options.fetch(:autosave, Inkpen.configuration.autosave)
      @autosave_interval = options.fetch(:autosave_interval, Inkpen.configuration.autosave_interval)
      @min_height = options.fetch(:min_height, Inkpen.configuration.min_height)
      @max_height = options.fetch(:max_height, Inkpen.configuration.max_height)
      @html_attributes = options.fetch(:html, {})
    end

    # Generate data attributes for Stimulus controller
    def data_attributes
      {
        controller: "inkpen--editor",
        "inkpen--editor-extensions-value" => extensions.to_json,
        "inkpen--editor-toolbar-value" => toolbar.to_s,
        "inkpen--editor-placeholder-value" => placeholder,
        "inkpen--editor-autosave-value" => autosave.to_s,
        "inkpen--editor-autosave-interval-value" => autosave_interval.to_s
      }
    end

    # Generate inline styles
    def style_attributes
      styles = []
      styles << "min-height: #{min_height}" if min_height
      styles << "max-height: #{max_height}" if max_height
      styles.join("; ")
    end

    # Check if a specific extension is enabled
    def extension_enabled?(name)
      extensions.include?(name.to_sym)
    end

    # Get the input field name for form submission
    def input_name
      name
    end

    # Get a safe ID from the name
    def input_id
      name.to_s.gsub(/[\[\]]/, "_").gsub(/_+/, "_").chomp("_")
    end
  end
end
