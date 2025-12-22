# frozen_string_literal: true

module Inkpen
  module Extensions
    ##
    # Base class for all Inkpen TipTap extensions.
    #
    # Extensions follow the TipTap extension pattern and are configured
    # through this Ruby PORO layer before being passed to the JavaScript
    # TipTap editor.
    #
    # @abstract Subclass and override {#name} and {#to_config} to implement
    #   a custom extension.
    #
    # @example Creating a custom extension
    #   class MyExtension < Inkpen::Extensions::Base
    #     def name
    #       :my_extension
    #     end
    #
    #     def to_config
    #       { custom_option: true }
    #     end
    #   end
    #
    # @author Inkpen Team
    # @since 0.2.0
    #
    class Base
      ##
      # @return [Hash] the options passed during initialization
      attr_reader :options

      ##
      # Initialize a new extension with optional configuration.
      #
      # @param options [Hash] configuration options for the extension
      # @option options [Boolean] :enabled whether the extension is enabled (default: true)
      #
      def initialize(**options)
        @options = default_options.merge(options)
      end

      ##
      # The unique name of the extension.
      #
      # @abstract Subclasses must override this method.
      # @return [Symbol] the extension name
      # @raise [NotImplementedError] if not overridden in subclass
      #
      def name
        raise NotImplementedError, "#{self.class} must implement #name"
      end

      ##
      # Whether this extension is currently enabled.
      #
      # @return [Boolean] true if enabled
      #
      def enabled?
        options.fetch(:enabled, true)
      end

      ##
      # Convert the extension configuration to a hash for JSON serialization.
      #
      # This hash is passed to the JavaScript TipTap extension.
      #
      # @return [Hash] configuration hash
      #
      def to_config
        {}
      end

      ##
      # Full configuration including name and enabled status.
      #
      # @return [Hash] complete extension configuration
      #
      def to_h
        {
          name: name,
          enabled: enabled?,
          config: to_config
        }
      end

      ##
      # JSON representation of the extension.
      #
      # @return [String] JSON string
      #
      def to_json(*args)
        to_h.to_json(*args)
      end

      private

      ##
      # Default options for this extension.
      #
      # @return [Hash] default options
      #
      def default_options
        { enabled: true }
      end
    end
  end
end
