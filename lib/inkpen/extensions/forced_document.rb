# frozen_string_literal: true

module Inkpen
  module Extensions
    ##
    # Forced Document Structure extension.
    #
    # Enforces a specific document structure where the first element must be
    # a heading (typically used for post titles). This prevents users from
    # deleting the title heading and ensures consistent document structure.
    #
    # @example Basic usage
    #   extension = Inkpen::Extensions::ForcedDocument.new
    #
    # @example With custom heading level
    #   extension = Inkpen::Extensions::ForcedDocument.new(
    #     heading_level: 2,
    #     placeholder: "Enter your title..."
    #   )
    #
    # @see https://tiptap.dev/docs/examples/advanced/forced-content-structure
    # @author Inkpen Team
    # @since 0.2.0
    #
    class ForcedDocument < Base
      ##
      # Default heading level for the title.
      DEFAULT_HEADING_LEVEL = 1

      ##
      # Default placeholder text for the title heading.
      DEFAULT_TITLE_PLACEHOLDER = "Untitled"

      ##
      # The unique name of this extension.
      #
      # @return [Symbol] :forced_document
      #
      def name
        :forced_document
      end

      ##
      # The heading level for the forced title heading.
      #
      # @return [Integer] heading level (1-6)
      #
      def heading_level
        options.fetch(:heading_level, DEFAULT_HEADING_LEVEL)
      end

      ##
      # Placeholder text shown in the title heading when empty.
      #
      # @return [String] placeholder text
      #
      def title_placeholder
        options.fetch(:placeholder, DEFAULT_TITLE_PLACEHOLDER)
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
      # Document structure schema.
      #
      # Defines the required structure as: heading + block*
      # This means a heading must come first, followed by zero or more blocks.
      #
      # @return [String] ProseMirror content expression
      #
      def content_expression
        "heading block*"
      end

      ##
      # Convert to configuration hash for JavaScript.
      #
      # @return [Hash] configuration for the TipTap extension
      #
      def to_config
        {
          headingLevel: heading_level,
          titlePlaceholder: title_placeholder,
          allowDeletion: allow_title_deletion?,
          contentExpression: content_expression
        }
      end

      private

      def default_options
        super.merge(
          heading_level: DEFAULT_HEADING_LEVEL,
          placeholder: DEFAULT_TITLE_PLACEHOLDER,
          allow_deletion: false
        )
      end
    end
  end
end
