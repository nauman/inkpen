# frozen_string_literal: true

module Inkpen
  module Extensions
    ##
    # Forced Document Structure extension.
    #
    # Enforces a specific document structure where the first element must be
    # a title heading (H1), optionally followed by a subtitle heading (H2).
    # This prevents users from deleting required headings and ensures
    # consistent document structure similar to Medium, Notion, or Dropbox Paper.
    #
    # @example Basic usage (title only)
    #   extension = Inkpen::Extensions::ForcedDocument.new
    #
    # @example With subtitle enabled
    #   extension = Inkpen::Extensions::ForcedDocument.new(
    #     subtitle: true,
    #     title_placeholder: "Your title here...",
    #     subtitle_placeholder: "Add a subtitle..."
    #   )
    #
    # @example Custom heading levels
    #   extension = Inkpen::Extensions::ForcedDocument.new(
    #     title_level: 1,
    #     subtitle_level: 2,
    #     subtitle: true
    #   )
    #
    # @see https://tiptap.dev/docs/examples/advanced/forced-content-structure
    # @author Inkpen Team
    # @since 0.2.0
    #
    class ForcedDocument < Base
      ##
      # Default heading level for the title (H1).
      DEFAULT_TITLE_LEVEL = 1

      ##
      # Default heading level for the subtitle (H2).
      DEFAULT_SUBTITLE_LEVEL = 2

      ##
      # Default placeholder text for the title heading.
      DEFAULT_TITLE_PLACEHOLDER = "Untitled"

      ##
      # Default placeholder text for the subtitle heading.
      DEFAULT_SUBTITLE_PLACEHOLDER = "Add a subtitle..."

      ##
      # The unique name of this extension.
      #
      # @return [Symbol] :forced_document
      #
      def name
        :forced_document
      end

      ##
      # The heading level for the title (first heading).
      #
      # @return [Integer] heading level (1-6), default 1
      #
      def title_level
        options.fetch(:title_level, options.fetch(:heading_level, DEFAULT_TITLE_LEVEL))
      end

      ##
      # The heading level for the subtitle (second heading).
      #
      # @return [Integer] heading level (1-6), default 2
      #
      def subtitle_level
        options.fetch(:subtitle_level, DEFAULT_SUBTITLE_LEVEL)
      end

      ##
      # Whether subtitle is enabled.
      #
      # @return [Boolean] true if subtitle heading should be enforced
      #
      def subtitle?
        options.fetch(:subtitle, false)
      end

      ##
      # Placeholder text shown in the title heading when empty.
      #
      # @return [String] placeholder text
      #
      def title_placeholder
        options.fetch(:title_placeholder, options.fetch(:placeholder, DEFAULT_TITLE_PLACEHOLDER))
      end

      ##
      # Placeholder text shown in the subtitle heading when empty.
      #
      # @return [String] placeholder text
      #
      def subtitle_placeholder
        options.fetch(:subtitle_placeholder, DEFAULT_SUBTITLE_PLACEHOLDER)
      end

      ##
      # Whether to allow the title heading to be deleted.
      #
      # @return [Boolean] false by default (title cannot be deleted)
      #
      def allow_title_deletion?
        options.fetch(:allow_deletion, false)
      end

      ##
      # Whether to allow the subtitle heading to be deleted.
      #
      # @return [Boolean] true by default (subtitle can be deleted/cleared)
      #
      def allow_subtitle_deletion?
        options.fetch(:allow_subtitle_deletion, true)
      end

      ##
      # Document structure schema.
      #
      # Defines the required structure:
      # - Without subtitle: heading block*
      # - With subtitle: heading heading? block*
      #
      # @return [String] ProseMirror content expression
      #
      def content_expression
        if subtitle?
          "heading heading? block*"
        else
          "heading block*"
        end
      end

      ##
      # Convert to configuration hash for JavaScript.
      #
      # @return [Hash] configuration for the TipTap extension
      #
      def to_config
        config = {
          titleLevel: title_level,
          titlePlaceholder: title_placeholder,
          allowDeletion: allow_title_deletion?,
          contentExpression: content_expression,
          subtitle: subtitle?
        }

        if subtitle?
          config.merge!(
            subtitleLevel: subtitle_level,
            subtitlePlaceholder: subtitle_placeholder,
            allowSubtitleDeletion: allow_subtitle_deletion?
          )
        end

        # Legacy support for headingLevel
        config[:headingLevel] = title_level

        config
      end

      private

      def default_options
        super.merge(
          title_level: DEFAULT_TITLE_LEVEL,
          subtitle_level: DEFAULT_SUBTITLE_LEVEL,
          title_placeholder: DEFAULT_TITLE_PLACEHOLDER,
          subtitle_placeholder: DEFAULT_SUBTITLE_PLACEHOLDER,
          subtitle: false,
          allow_deletion: false,
          allow_subtitle_deletion: true
        )
      end
    end
  end
end
