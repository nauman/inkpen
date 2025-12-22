# frozen_string_literal: true

module Inkpen
  module Extensions
    ##
    # Table extension for TipTap.
    #
    # Enables table functionality including headers, cells, row/column
    # operations, and cell merging. Uses ProseMirror's table system
    # under the hood.
    #
    # @example Basic usage
    #   extension = Inkpen::Extensions::Table.new
    #
    # @example With custom options
    #   extension = Inkpen::Extensions::Table.new(
    #     resizable: true,
    #     header_row: true,
    #     cell_min_width: 100
    #   )
    #
    # @see https://tiptap.dev/docs/examples/basics/tables
    # @author Inkpen Team
    # @since 0.2.0
    #
    class Table < Base
      ##
      # Default minimum cell width in pixels.
      DEFAULT_CELL_MIN_WIDTH = 25

      ##
      # Default maximum cell width in pixels.
      DEFAULT_CELL_MAX_WIDTH = 500

      ##
      # The unique name of this extension.
      #
      # @return [Symbol] :table
      #
      def name
        :table
      end

      ##
      # Whether table columns can be resized.
      #
      # @return [Boolean] true to enable column resizing
      #
      def resizable?
        options.fetch(:resizable, true)
      end

      ##
      # Whether the first row is treated as a header row.
      #
      # @return [Boolean] true if first row is header
      #
      def header_row?
        options.fetch(:header_row, true)
      end

      ##
      # Whether the first column is treated as a header column.
      #
      # @return [Boolean] true if first column is header
      #
      def header_column?
        options.fetch(:header_column, false)
      end

      ##
      # Minimum cell width in pixels.
      #
      # @return [Integer] minimum width
      #
      def cell_min_width
        options.fetch(:cell_min_width, DEFAULT_CELL_MIN_WIDTH)
      end

      ##
      # Maximum cell width in pixels (optional).
      #
      # @return [Integer, nil] maximum width or nil for unlimited
      #
      def cell_max_width
        options[:cell_max_width]
      end

      ##
      # Whether to show the table toolbar.
      #
      # @return [Boolean] true to show toolbar
      #
      def toolbar?
        options.fetch(:toolbar, true)
      end

      ##
      # Whether to allow cell background colors.
      #
      # @return [Boolean] true to enable cell backgrounds
      #
      def cell_backgrounds?
        options.fetch(:cell_backgrounds, true)
      end

      ##
      # Whether to allow cell merging.
      #
      # @return [Boolean] true to enable cell merging
      #
      def allow_merge?
        options.fetch(:allow_merge, true)
      end

      ##
      # Default number of rows when inserting a new table.
      #
      # @return [Integer] default row count
      #
      def default_rows
        options.fetch(:default_rows, 3)
      end

      ##
      # Default number of columns when inserting a new table.
      #
      # @return [Integer] default column count
      #
      def default_cols
        options.fetch(:default_cols, 3)
      end

      ##
      # Whether to include headers when inserting a new table.
      #
      # @return [Boolean] true to include header row
      #
      def with_header_row?
        options.fetch(:with_header_row, true)
      end

      ##
      # Convert to configuration hash for JavaScript.
      #
      # @return [Hash] configuration for the TipTap extension
      #
      def to_config
        {
          resizable: resizable?,
          headerRow: header_row?,
          headerColumn: header_column?,
          cellMinWidth: cell_min_width,
          cellMaxWidth: cell_max_width,
          toolbar: toolbar?,
          cellBackgrounds: cell_backgrounds?,
          allowMerge: allow_merge?,
          defaultRows: default_rows,
          defaultCols: default_cols,
          withHeaderRow: with_header_row?
        }.compact
      end

      private

      def default_options
        super.merge(
          resizable: true,
          header_row: true,
          header_column: false,
          cell_min_width: DEFAULT_CELL_MIN_WIDTH,
          toolbar: true,
          cell_backgrounds: true,
          allow_merge: true,
          default_rows: 3,
          default_cols: 3,
          with_header_row: true
        )
      end
    end
  end
end
