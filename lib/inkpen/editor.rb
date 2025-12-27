# frozen_string_literal: true

module Inkpen
  # PORO representing an editor instance
  #
  # Usage:
  #   editor = Inkpen::Editor.new(
  #     name: "post[body]",
  #     value: @post.body,
  #     toolbar: :floating,
  #     extensions: [:mentions, :hashtags],
  #     extension_config: {
  #       mention: { searchUrl: "/editor/mentions.json" }
  #     }
  #   )
  #
  class Editor
    attr_reader :name, :value, :toolbar, :sticky_toolbar, :extensions, :extension_config,
                :placeholder, :autosave, :autosave_interval, :min_height,
                :max_height, :html_attributes

    def initialize(name:, value: nil, **options)
      @name = name
      @value = value
      @toolbar = options.fetch(:toolbar, Inkpen.configuration.toolbar)
      @sticky_toolbar = options.fetch(:sticky_toolbar, nil)
      @extensions = options.fetch(:extensions, Inkpen.configuration.extensions)
      @extension_config = options.fetch(:extension_config, {})
      @placeholder = options.fetch(:placeholder, Inkpen.configuration.placeholder)
      @autosave = options.fetch(:autosave, Inkpen.configuration.autosave)
      @autosave_interval = options.fetch(:autosave_interval, Inkpen.configuration.autosave_interval)
      @min_height = options.fetch(:min_height, Inkpen.configuration.min_height)
      @max_height = options.fetch(:max_height, Inkpen.configuration.max_height)
      @html_attributes = options.fetch(:html, {})
    end

    # Generate data attributes for Stimulus controller
    # Uses nested :data key for proper Rails tag.attributes handling
    def data_attributes
      controllers = ["inkpen--editor"]
      controllers << "inkpen--sticky-toolbar" if sticky_toolbar&.enabled?

      attrs = {
        data: {
          controller: controllers.join(" "),
          "inkpen--editor-extensions-value" => extensions.to_json,
          "inkpen--editor-extension-config-value" => extension_config.to_json,
          "inkpen--editor-toolbar-value" => toolbar.to_s,
          "inkpen--editor-placeholder-value" => placeholder,
          "inkpen--editor-autosave-value" => autosave.to_s,
          "inkpen--editor-autosave-interval-value" => autosave_interval.to_s
        }
      }

      # Merge sticky toolbar data attributes if enabled
      if sticky_toolbar&.enabled?
        attrs[:data].merge!(sticky_toolbar.data_attributes)
      end

      attrs
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
