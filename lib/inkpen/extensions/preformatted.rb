# frozen_string_literal: true

module Inkpen
  module Extensions
    ##
    # Preformatted text extension for TipTap.
    #
    # Plain text block that preserves whitespace exactly as typed.
    # Perfect for ASCII art, ASCII tables, diagrams, and any content
    # that requires precise character alignment.
    #
    # Unlike CodeBlock, this has NO syntax highlighting - just pure
    # monospace text with preserved whitespace.
    #
    # @example Basic usage
    #   extension = Inkpen::Extensions::Preformatted.new
    #
    # @example With custom options
    #   extension = Inkpen::Extensions::Preformatted.new(
    #     show_line_numbers: false,
    #     wrap_lines: false
    #   )
    #
    # @see https://tiptap.dev/docs/editor/api/nodes
    # @author Inkpen Team
    # @since 0.3.0
    #
    class Preformatted < Base
      ##
      # The unique name of this extension.
      #
      # @return [Symbol] :preformatted
      #
      def name
        :preformatted
      end

      ##
      # Whether to show line numbers.
      #
      # @return [Boolean] true to show line numbers
      #
      def show_line_numbers?
        options.fetch(:show_line_numbers, false)
      end

      ##
      # Whether to wrap long lines.
      #
      # @return [Boolean] true to wrap lines
      #
      def wrap_lines?
        options.fetch(:wrap_lines, false)
      end

      ##
      # Tab size in spaces.
      #
      # @return [Integer] number of spaces per tab
      #
      def tab_size
        options.fetch(:tab_size, 4)
      end

      ##
      # Whether to show a label/badge.
      #
      # @return [Boolean] true to show label
      #
      def show_label?
        options.fetch(:show_label, true)
      end

      ##
      # Custom label text.
      #
      # @return [String] the label text
      #
      def label_text
        options.fetch(:label_text, "Plain Text")
      end

      ##
      # Convert to configuration hash for JavaScript.
      #
      # @return [Hash] configuration for the TipTap extension
      #
      def to_config
        {
          showLineNumbers: show_line_numbers?,
          wrapLines: wrap_lines?,
          tabSize: tab_size,
          showLabel: show_label?,
          labelText: label_text
        }
      end

      private

      def default_options
        super.merge(
          show_line_numbers: false,
          wrap_lines: false,
          tab_size: 4,
          show_label: true,
          label_text: "Plain Text"
        )
      end
    end
  end
end
