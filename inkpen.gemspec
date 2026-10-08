# frozen_string_literal: true

# stub: inkpen 0.9.3 ruby lib

Gem::Specification.new do |s|
  s.name = "inkpen"
  s.version = "0.9.3"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  if s.respond_to? :metadata=
    s.metadata = {
      "changelog_uri" => "https://github.com/nauman/inkpen/blob/main/CHANGELOG.md",
      "homepage_uri" => "https://github.com/nauman/inkpen",
      "source_code_uri" => "https://github.com/nauman/inkpen",
      "rubygems_mfa_required" => "true"
    }
  end
  s.require_paths = ["lib"]
  s.authors = ["Nauman Tariq"]
  s.bindir = "exe"
  s.description = "Inkpen provides a modern, extensible rich text editor built on TipTap/ProseMirror " \
                  "with Stimulus controllers for Rails applications."
  s.email = ["nauman@intellectaco.com"]
  s.files = [
    ".DS_Store",
    ".rubocop.yml",
    ".yardopts",
    "CLAUDE.md",
    "README.md",
    "Rakefile",
    "app/assets/javascripts/inkpen.bundle.js",
    "app/assets/javascripts/inkpen.bundle.js.map",
    "app/assets/javascripts/inkpen/controllers/editor_controller.js",
    "app/assets/javascripts/inkpen/controllers/sticky_toolbar_controller.js",
    "app/assets/javascripts/inkpen/controllers/toolbar_controller.js",
    "app/assets/javascripts/inkpen/export/html.js",
    "app/assets/javascripts/inkpen/export/index.js",
    "app/assets/javascripts/inkpen/export/markdown.js",
    "app/assets/javascripts/inkpen/export/pdf.js",
    "app/assets/javascripts/inkpen/extensions/advanced_table.js",
    "app/assets/javascripts/inkpen/extensions/block_commands.js",
    "app/assets/javascripts/inkpen/extensions/block_gutter.js",
    "app/assets/javascripts/inkpen/extensions/callout.js",
    "app/assets/javascripts/inkpen/extensions/columns.js",
    "app/assets/javascripts/inkpen/extensions/database.js",
    "app/assets/javascripts/inkpen/extensions/document_section.js",
    "app/assets/javascripts/inkpen/extensions/drag_handle.js",
    "app/assets/javascripts/inkpen/extensions/embed.js",
    "app/assets/javascripts/inkpen/extensions/enhanced_image.js",
    "app/assets/javascripts/inkpen/extensions/export_commands.js",
    "app/assets/javascripts/inkpen/extensions/file_attachment.js",
    "app/assets/javascripts/inkpen/extensions/inkpen_table/index.js",
    "app/assets/javascripts/inkpen/extensions/inkpen_table/inkpen_table.js",
    "app/assets/javascripts/inkpen/extensions/inkpen_table/inkpen_table_cell.js",
    "app/assets/javascripts/inkpen/extensions/inkpen_table/inkpen_table_header.js",
    "app/assets/javascripts/inkpen/extensions/inkpen_table/table_constants.js",
    "app/assets/javascripts/inkpen/extensions/inkpen_table/table_helpers.js",
    "app/assets/javascripts/inkpen/extensions/inkpen_table/table_menu.js",
    "app/assets/javascripts/inkpen/extensions/preformatted.js",
    "app/assets/javascripts/inkpen/extensions/section.js",
    "app/assets/javascripts/inkpen/extensions/section_title.js",
    "app/assets/javascripts/inkpen/extensions/slash_commands.js",
    "app/assets/javascripts/inkpen/extensions/table_of_contents.js",
    "app/assets/javascripts/inkpen/extensions/toggle_block.js",
    "app/assets/javascripts/inkpen/index.js",
    "app/assets/stylesheets/inkpen/advanced_table.css",
    "app/assets/stylesheets/inkpen/animations.css",
    "app/assets/stylesheets/inkpen/block_gutter.css",
    "app/assets/stylesheets/inkpen/callout.css",
    "app/assets/stylesheets/inkpen/columns.css",
    "app/assets/stylesheets/inkpen/database.css",
    "app/assets/stylesheets/inkpen/document_section.css",
    "app/assets/stylesheets/inkpen/drag_drop.css",
    "app/assets/stylesheets/inkpen/editor.css",
    "app/assets/stylesheets/inkpen/embed.css",
    "app/assets/stylesheets/inkpen/enhanced_image.css",
    "app/assets/stylesheets/inkpen/export.css",
    "app/assets/stylesheets/inkpen/file_attachment.css",
    "app/assets/stylesheets/inkpen/footnotes.css",
    "app/assets/stylesheets/inkpen/inkpen_table.css",
    "app/assets/stylesheets/inkpen/preformatted.css",
    "app/assets/stylesheets/inkpen/search_replace.css",
    "app/assets/stylesheets/inkpen/section.css",
    "app/assets/stylesheets/inkpen/slash_menu.css",
    "app/assets/stylesheets/inkpen/sticky_toolbar.css",
    "app/assets/stylesheets/inkpen/toc.css",
    "app/assets/stylesheets/inkpen/toggle.css",
    "app/helpers/inkpen/editor_helper.rb",
    "app/views/inkpen/_editor.html.erb",
    "config/importmap.rb",
    "docs/.DS_Store",
    "docs/CHANGELOG.md",
    "docs/FEATURES.md",
    "docs/ROADMAP.md",
    "docs/VISION.md",
    "docs/extensions/INKPEN_TABLE.md",
    "docs/thinking/CORRECTED_NO_VUE.md",
    "docs/thinking/EXECUTIVE_SUMMARY.md",
    "docs/thinking/INKPEN_CODE_SAMPLES.md",
    "docs/thinking/INKPEN_MASTER_GUIDE.md",
    "docs/thinking/README_START_HERE.md",
    "lib/inkpen.rb",
    "lib/inkpen/configuration.rb",
    "lib/inkpen/editor.rb",
    "lib/inkpen/engine.rb",
    "lib/inkpen/extensions/base.rb",
    "lib/inkpen/extensions/code_block_syntax.rb",
    "lib/inkpen/extensions/document_section.rb",
    "lib/inkpen/extensions/forced_document.rb",
    "lib/inkpen/extensions/mention.rb",
    "lib/inkpen/extensions/preformatted.rb",
    "lib/inkpen/extensions/section.rb",
    "lib/inkpen/extensions/slash_commands.rb",
    "lib/inkpen/extensions/table.rb",
    "lib/inkpen/extensions/task_list.rb",
    "lib/inkpen/markdown_mode.rb",
    "lib/inkpen/sticky_toolbar.rb",
    "lib/inkpen/toolbar.rb",
    "lib/inkpen/version.rb",
    "sig/inkpen.rbs"
  ]
  s.homepage = "https://github.com/nauman/inkpen"
  s.licenses = ["MIT"]
  s.required_ruby_version = Gem::Requirement.new(">= 3.1.0")
  s.summary = "A TipTap-based rich text editor for Rails"

  s.installed_by_version = "3.6.9"

  s.add_dependency("importmap-rails", [">= 1.0"])
  s.add_dependency("rails", [">= 7.0"])
end
