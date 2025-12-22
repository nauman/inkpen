# frozen_string_literal: true

require_relative "inkpen/version"
require_relative "inkpen/engine"
require_relative "inkpen/configuration"
require_relative "inkpen/editor"
require_relative "inkpen/toolbar"

module Inkpen
  class Error < StandardError; end

  class << self
    attr_writer :configuration

    def configuration
      @configuration ||= Configuration.new
    end

    def configure
      yield(configuration)
    end

    def reset_configuration!
      @configuration = Configuration.new
    end
  end
end
