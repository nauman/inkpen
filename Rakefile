# frozen_string_literal: true

require "bundler/gem_tasks"
require "minitest/test_task"

Minitest::TestTask.create

require "rubocop/rake_task"

RuboCop::RakeTask.new

require "yard"

YARD::Rake::YardocTask.new do |t|
  t.files = ["lib/**/*.rb", "app/helpers/**/*.rb"]
  t.options = ["--title", "Inkpen - TipTap Rich Text Editor for Rails"]
end

task default: %i[test rubocop]
