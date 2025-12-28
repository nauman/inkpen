# frozen_string_literal: true

module Inkpen
  module Extensions
    ##
    # Section extension for TipTap.
    #
    # Block-level container that controls content width and vertical spacing.
    # Useful for page-builder style layouts where different sections need
    # different widths (narrow for reading, wide for media, full for heroes).
    #
    # @example Basic usage
    #   extension = Inkpen::Extensions::Section.new
    #
    # @example With custom options
    #   extension = Inkpen::Extensions::Section.new(
    #     default_width: "wide",
    #     default_spacing: "spacious",
    #     show_controls: true
    #   )
    #
    # @see https://tiptap.dev/docs/editor/api/nodes
    # @author Inkpen Team
    # @since 0.3.0
    #
    class Section < Base
      ##
      # Available width presets with their CSS values.
      WIDTH_PRESETS = {
        narrow: { max_width: "560px", label: "Narrow" },
        default: { max_width: "680px", label: "Default" },
        wide: { max_width: "900px", label: "Wide" },
        full: { max_width: "100%", label: "Full" }
      }.freeze

      ##
      # Available spacing presets with their CSS values.
      SPACING_PRESETS = {
        compact: { padding: "1rem 0", label: "Compact" },
        normal: { padding: "2rem 0", label: "Normal" },
        spacious: { padding: "4rem 0", label: "Spacious" }
      }.freeze

      ##
      # The unique name of this extension.
      #
      # @return [Symbol] :section
      #
      def name
        :section
      end

      ##
      # Default width preset for new sections.
      #
      # @return [String] the default width preset key
      #
      def default_width
        options.fetch(:default_width, "default")
      end

      ##
      # Default spacing preset for new sections.
      #
      # @return [String] the default spacing preset key
      #
      def default_spacing
        options.fetch(:default_spacing, "normal")
      end

      ##
      # Whether to show the section controls UI.
      #
      # @return [Boolean] true to show controls
      #
      def show_controls?
        options.fetch(:show_controls, true)
      end

      ##
      # Available width presets.
      #
      # @return [Hash] width presets with max_width and label
      #
      def width_presets
        custom_presets = options[:width_presets] || {}
        WIDTH_PRESETS.merge(custom_presets.transform_keys(&:to_sym))
      end

      ##
      # Available spacing presets.
      #
      # @return [Hash] spacing presets with padding and label
      #
      def spacing_presets
        custom_presets = options[:spacing_presets] || {}
        SPACING_PRESETS.merge(custom_presets.transform_keys(&:to_sym))
      end

      ##
      # Convert to configuration hash for JavaScript.
      #
      # @return [Hash] configuration for the TipTap extension
      #
      def to_config
        {
          defaultWidth: default_width,
          defaultSpacing: default_spacing,
          showControls: show_controls?,
          widthPresets: serialize_presets(width_presets),
          spacingPresets: serialize_presets(spacing_presets)
        }
      end

      private

      def default_options
        super.merge(
          default_width: "default",
          default_spacing: "normal",
          show_controls: true
        )
      end

      ##
      # Convert Ruby-style presets to JavaScript camelCase.
      #
      def serialize_presets(presets)
        presets.transform_values do |preset|
          preset.transform_keys { |k| camelize(k.to_s) }
        end
      end

      def camelize(string)
        string.gsub(/_([a-z])/) { ::Regexp.last_match(1).upcase }
      end
    end
  end
end
