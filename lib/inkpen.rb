# frozen_string_literal: true

require_relative "inkpen/version"
require_relative "inkpen/engine"
require_relative "inkpen/configuration"
require_relative "inkpen/editor"
require_relative "inkpen/toolbar"

# Extensions
require_relative "inkpen/extensions/base"
require_relative "inkpen/extensions/forced_document"
require_relative "inkpen/extensions/mention"
require_relative "inkpen/extensions/code_block_syntax"
require_relative "inkpen/extensions/table"
require_relative "inkpen/extensions/task_list"
require_relative "inkpen/extensions/slash_commands"

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
