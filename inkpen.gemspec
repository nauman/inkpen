# frozen_string_literal: true

require_relative "lib/inkpen/version"

Gem::Specification.new do |spec|
  spec.name = "inkpen"
  spec.version = Inkpen::VERSION
  spec.authors = ["Nauman Tariq"]
  spec.email = ["nauman@intellectaco.com"]

  spec.summary = "A TipTap-based rich text editor for Rails"
  spec.description = "Inkpen provides a modern, extensible rich text editor built on TipTap/ProseMirror with Stimulus controllers for Rails applications."
  spec.homepage = "https://github.com/Intellectaco/inkpen"
  spec.license = "MIT"
  spec.required_ruby_version = ">= 3.1.0"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/Intellectaco/inkpen"
  spec.metadata["changelog_uri"] = "https://github.com/Intellectaco/inkpen/blob/main/CHANGELOG.md"

  # Include all files tracked by git, excluding development files
  gemspec = File.basename(__FILE__)
  spec.files = IO.popen(%w[git ls-files -z], chdir: __dir__, err: IO::NULL) do |ls|
    ls.readlines("\x0", chomp: true).reject do |f|
      (f == gemspec) ||
        f.start_with?(*%w[bin/ test/ spec/ features/ .git .github appveyor Gemfile])
    end
  end
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  # Runtime dependencies
  spec.add_dependency "rails", ">= 7.0"
  spec.add_dependency "importmap-rails", ">= 1.0"
end
