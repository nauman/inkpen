# frozen_string_literal: true

module Inkpen
  class Engine < ::Rails::Engine
    isolate_namespace Inkpen

    initializer "inkpen.assets" do |app|
      # Add stylesheets to asset pipeline
      app.config.assets.paths << root.join("app/assets/stylesheets")
      app.config.assets.paths << root.join("app/assets/javascripts")
    end

    initializer "inkpen.importmap", before: "importmap" do |app|
      # Hook into importmap if available
      if app.config.respond_to?(:importmap)
        app.config.importmap.paths << root.join("config/importmap.rb")
        app.config.importmap.cache_sweepers << root.join("app/assets/javascripts")
      end
    end

    initializer "inkpen.helpers" do
      ActiveSupport.on_load(:action_view) do
        include Inkpen::EditorHelper
      end
    end

    # Allow precompilation of inkpen assets
    initializer "inkpen.precompile" do |app|
      app.config.assets.precompile += %w[inkpen/editor.css]
    end
  end
end
