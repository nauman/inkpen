# frozen_string_literal: true

$LOAD_PATH.unshift File.expand_path("../lib", __dir__)

# Mock Rails for unit tests (no Rails dependency needed for pure Ruby tests)
unless defined?(Rails)
  module Rails
    class Engine
      def self.isolate_namespace(*)
        # No-op for tests
      end

      def self.initializer(*, &)
        # No-op for tests
      end

      def self.config
        @config ||= Struct.new(:generators).new(Struct.new(:api_only).new(false))
      end
    end
  end
end

require "inkpen"

require "minitest/autorun"
