# frozen_string_literal: true

module Inkpen
  module Extensions
    ##
    # DocumentSection extension for TipTap.
    #
    # Provides true content grouping with a semantic H2 title and collapsible
    # content. Unlike the layout Section extension (which controls width/spacing),
    # DocumentSection groups related blocks under a heading for document structure.
    #
    # Features:
    # - Semantic H2 title (integrates with Table of Contents)
    # - Collapsible content with left-gutter toggle
    # - Nesting support (sections within sections, up to 3 levels)
    # - Draggable as a group
    # - Auto-generated IDs for deep linking
    #
    # @example Basic usage
    #   extension = Inkpen::Extensions::DocumentSection.new
    #
    # @example With custom options
    #   extension = Inkpen::Extensions::DocumentSection.new(
    #     default_collapsed: false,
    #     allow_nesting: true,
    #     max_depth: 3,
    #     show_controls: true
    #   )
    #
    # @see https://tiptap.dev/docs/editor/api/nodes
    # @author Inkpen Team
    # @since 0.8.0
    #
    class DocumentSection < Base
      ##
      # Default maximum nesting depth for sections.
      DEFAULT_MAX_DEPTH = 3

      ##
      # The unique name of this extension.
      #
      # @return [Symbol] :document_section
      #
      def name
        :document_section
      end

      ##
      # Default collapsed state for new sections.
      #
      # @return [Boolean] true if sections start collapsed
      #
      def default_collapsed
        options.fetch(:default_collapsed, false)
      end

      ##
      # Whether sections can be nested within each other.
      #
      # @return [Boolean] true to allow nesting
      #
      def allow_nesting?
        options.fetch(:allow_nesting, true)
      end

      ##
      # Maximum nesting depth for sections.
      #
      # @return [Integer] maximum depth allowed (1-3)
      #
      def max_depth
        depth = options.fetch(:max_depth, DEFAULT_MAX_DEPTH)
        [[depth, 1].max, 3].min # Clamp between 1 and 3
      end

      ##
      # Whether to show the collapse toggle control.
      #
      # @return [Boolean] true to show controls
      #
      def show_controls?
        options.fetch(:show_controls, true)
      end

      ##
      # Convert to configuration hash for JavaScript.
      #
      # @return [Hash] configuration for the TipTap extension
      #
      def to_config
        {
          defaultCollapsed: default_collapsed,
          allowNesting: allow_nesting?,
          maxDepth: max_depth,
          showControls: show_controls?
        }
      end

      private

      def default_options
        super.merge(
          default_collapsed: false,
          allow_nesting: true,
          max_depth: DEFAULT_MAX_DEPTH,
          show_controls: true
        )
      end
    end
  end
end
