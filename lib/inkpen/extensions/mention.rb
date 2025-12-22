# frozen_string_literal: true

module Inkpen
  module Extensions
    ##
    # Mention extension for @mentions functionality.
    #
    # Enables users to mention other users or entities using the @ symbol.
    # When triggered, a popup appears with suggestions that can be filtered
    # by typing.
    #
    # The suggestion data is fetched from a configurable endpoint.
    #
    # @example Basic usage
    #   extension = Inkpen::Extensions::Mention.new(
    #     search_url: "/api/users/search"
    #   )
    #
    # @example With custom trigger and styling
    #   extension = Inkpen::Extensions::Mention.new(
    #     search_url: "/api/users/search",
    #     trigger: "@",
    #     suggestion_class: "mention-suggestion",
    #     item_class: "mention-item"
    #   )
    #
    # @see https://tiptap.dev/docs/examples/advanced/mentions
    # @author Inkpen Team
    # @since 0.2.0
    #
    class Mention < Base
      ##
      # Default trigger character for mentions.
      DEFAULT_TRIGGER = "@"

      ##
      # Default minimum characters to start searching.
      DEFAULT_MIN_CHARS = 1

      ##
      # The unique name of this extension.
      #
      # @return [Symbol] :mention
      #
      def name
        :mention
      end

      ##
      # The character that triggers the mention popup.
      #
      # @return [String] trigger character (default: "@")
      #
      def trigger
        options.fetch(:trigger, DEFAULT_TRIGGER)
      end

      ##
      # URL endpoint for fetching mention suggestions.
      #
      # The endpoint receives a `query` parameter with the search text.
      # Expected response format: [{ id: 1, label: "Username", ... }]
      #
      # @return [String, nil] search URL or nil if using static items
      #
      def search_url
        options[:search_url]
      end

      ##
      # Static items to show in the suggestion popup.
      #
      # Use this instead of search_url for fixed suggestion lists.
      #
      # @return [Array<Hash>, nil] array of suggestion items
      #
      def items
        options[:items]
      end

      ##
      # Minimum characters before triggering search.
      #
      # @return [Integer] minimum character count
      #
      def min_chars
        options.fetch(:min_chars, DEFAULT_MIN_CHARS)
      end

      ##
      # CSS class for the suggestion popup container.
      #
      # @return [String] CSS class name
      #
      def suggestion_class
        options.fetch(:suggestion_class, "inkpen-mention-suggestions")
      end

      ##
      # CSS class for individual suggestion items.
      #
      # @return [String] CSS class name
      #
      def item_class
        options.fetch(:item_class, "inkpen-mention-item")
      end

      ##
      # Whether to allow creating new mentions not in the suggestion list.
      #
      # @return [Boolean] true to allow custom mentions
      #
      def allow_custom?
        options.fetch(:allow_custom, false)
      end

      ##
      # HTML attributes rendered on the mention node.
      #
      # @return [Hash] HTML attributes
      #
      def html_attributes
        options.fetch(:html_attributes, { class: "inkpen-mention" })
      end

      ##
      # Convert to configuration hash for JavaScript.
      #
      # @return [Hash] configuration for the TipTap extension
      #
      def to_config
        {
          trigger: trigger,
          searchUrl: search_url,
          items: items,
          minChars: min_chars,
          suggestionClass: suggestion_class,
          itemClass: item_class,
          allowCustom: allow_custom?,
          HTMLAttributes: html_attributes
        }.compact
      end

      private

      def default_options
        super.merge(
          trigger: DEFAULT_TRIGGER,
          min_chars: DEFAULT_MIN_CHARS,
          allow_custom: false
        )
      end
    end
  end
end
