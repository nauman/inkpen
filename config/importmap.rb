# Inkpen importmap configuration
# These pins are automatically added to the host app's importmap
# Using esm.sh for browser-compatible builds (no Node.js polyfills needed)

# ProseMirror core (TipTap's underlying editor framework)
pin "prosemirror-state", to: "https://esm.sh/prosemirror-state@1.4.3"
pin "prosemirror-view", to: "https://esm.sh/prosemirror-view@1.33.8"
pin "prosemirror-model", to: "https://esm.sh/prosemirror-model@1.22.3"
pin "prosemirror-transform", to: "https://esm.sh/prosemirror-transform@1.9.0"
pin "prosemirror-commands", to: "https://esm.sh/prosemirror-commands@1.5.2"
pin "prosemirror-keymap", to: "https://esm.sh/prosemirror-keymap@1.2.2"
pin "prosemirror-history", to: "https://esm.sh/prosemirror-history@1.4.1"
pin "prosemirror-dropcursor", to: "https://esm.sh/prosemirror-dropcursor@1.8.1"
pin "prosemirror-gapcursor", to: "https://esm.sh/prosemirror-gapcursor@1.3.2"
pin "prosemirror-schema-list", to: "https://esm.sh/prosemirror-schema-list@1.4.1"
pin "prosemirror-inputrules", to: "https://esm.sh/prosemirror-inputrules@1.4.0"
pin "prosemirror-tables", to: "https://esm.sh/prosemirror-tables@1.4.0"
pin "rope-sequence", to: "https://esm.sh/rope-sequence@1.3.4"
pin "orderedmap", to: "https://esm.sh/orderedmap@2.1.1"
pin "w3c-keyname", to: "https://esm.sh/w3c-keyname@2.2.8"
pin "crelt", to: "https://esm.sh/crelt@1.0.6"

# TipTap core
pin "@tiptap/core", to: "https://esm.sh/@tiptap/core@2.10.3"
pin "@tiptap/pm/state", to: "https://esm.sh/@tiptap/pm@2.10.3/state"
pin "@tiptap/pm/view", to: "https://esm.sh/@tiptap/pm@2.10.3/view"
pin "@tiptap/pm/model", to: "https://esm.sh/@tiptap/pm@2.10.3/model"
pin "@tiptap/pm/transform", to: "https://esm.sh/@tiptap/pm@2.10.3/transform"
pin "@tiptap/pm/commands", to: "https://esm.sh/@tiptap/pm@2.10.3/commands"
pin "@tiptap/pm/keymap", to: "https://esm.sh/@tiptap/pm@2.10.3/keymap"
pin "@tiptap/pm/history", to: "https://esm.sh/@tiptap/pm@2.10.3/history"
pin "@tiptap/pm/dropcursor", to: "https://esm.sh/@tiptap/pm@2.10.3/dropcursor"
pin "@tiptap/pm/gapcursor", to: "https://esm.sh/@tiptap/pm@2.10.3/gapcursor"
pin "@tiptap/pm/schema-list", to: "https://esm.sh/@tiptap/pm@2.10.3/schema-list"
pin "@tiptap/pm/inputrules", to: "https://esm.sh/@tiptap/pm@2.10.3/inputrules"
pin "@tiptap/pm/tables", to: "https://esm.sh/@tiptap/pm@2.10.3/tables"

# TipTap starter kit (includes common extensions)
pin "@tiptap/starter-kit", to: "https://esm.sh/@tiptap/starter-kit@2.10.3"

# TipTap extensions
pin "@tiptap/extension-document", to: "https://esm.sh/@tiptap/extension-document@2.10.3"
pin "@tiptap/extension-paragraph", to: "https://esm.sh/@tiptap/extension-paragraph@2.10.3"
pin "@tiptap/extension-text", to: "https://esm.sh/@tiptap/extension-text@2.10.3"
pin "@tiptap/extension-bold", to: "https://esm.sh/@tiptap/extension-bold@2.10.3"
pin "@tiptap/extension-italic", to: "https://esm.sh/@tiptap/extension-italic@2.10.3"
pin "@tiptap/extension-strike", to: "https://esm.sh/@tiptap/extension-strike@2.10.3"
pin "@tiptap/extension-heading", to: "https://esm.sh/@tiptap/extension-heading@2.10.3"
pin "@tiptap/extension-bullet-list", to: "https://esm.sh/@tiptap/extension-bullet-list@2.10.3"
pin "@tiptap/extension-ordered-list", to: "https://esm.sh/@tiptap/extension-ordered-list@2.10.3"
pin "@tiptap/extension-list-item", to: "https://esm.sh/@tiptap/extension-list-item@2.10.3"
pin "@tiptap/extension-blockquote", to: "https://esm.sh/@tiptap/extension-blockquote@2.10.3"
pin "@tiptap/extension-code-block", to: "https://esm.sh/@tiptap/extension-code-block@2.10.3"
pin "@tiptap/extension-code", to: "https://esm.sh/@tiptap/extension-code@2.10.3"
pin "@tiptap/extension-horizontal-rule", to: "https://esm.sh/@tiptap/extension-horizontal-rule@2.10.3"
pin "@tiptap/extension-hard-break", to: "https://esm.sh/@tiptap/extension-hard-break@2.10.3"
pin "@tiptap/extension-history", to: "https://esm.sh/@tiptap/extension-history@2.10.3"
pin "@tiptap/extension-dropcursor", to: "https://esm.sh/@tiptap/extension-dropcursor@2.10.3"
pin "@tiptap/extension-gapcursor", to: "https://esm.sh/@tiptap/extension-gapcursor@2.10.3"
pin "@tiptap/extension-link", to: "https://esm.sh/@tiptap/extension-link@2.10.3"

# Link extension dependencies
pin "linkifyjs", to: "https://esm.sh/linkifyjs@4.1.3"
pin "@tiptap/extension-placeholder", to: "https://esm.sh/@tiptap/extension-placeholder@2.10.3"
pin "@tiptap/extension-table", to: "https://esm.sh/@tiptap/extension-table@2.10.3"
pin "@tiptap/extension-table-row", to: "https://esm.sh/@tiptap/extension-table-row@2.10.3"
pin "@tiptap/extension-table-cell", to: "https://esm.sh/@tiptap/extension-table-cell@2.10.3"
pin "@tiptap/extension-table-header", to: "https://esm.sh/@tiptap/extension-table-header@2.10.3"
pin "@tiptap/extension-image", to: "https://esm.sh/@tiptap/extension-image@2.10.3"

# Task List extension
pin "@tiptap/extension-task-list", to: "https://esm.sh/@tiptap/extension-task-list@2.10.3"
pin "@tiptap/extension-task-item", to: "https://esm.sh/@tiptap/extension-task-item@2.10.3"

# Mention extension
pin "@tiptap/extension-mention", to: "https://esm.sh/@tiptap/extension-mention@2.10.3"
pin "@tiptap/suggestion", to: "https://esm.sh/@tiptap/suggestion@2.10.3"

# Syntax highlighting for code blocks
pin "@tiptap/extension-code-block-lowlight", to: "https://esm.sh/@tiptap/extension-code-block-lowlight@2.10.3"

# Typography extension (markdown shortcuts, smart quotes)
pin "@tiptap/extension-typography", to: "https://esm.sh/@tiptap/extension-typography@2.10.3"

# Text formatting marks
pin "@tiptap/extension-highlight", to: "https://esm.sh/@tiptap/extension-highlight@2.10.3"
pin "@tiptap/extension-underline", to: "https://esm.sh/@tiptap/extension-underline@2.10.3"
pin "@tiptap/extension-subscript", to: "https://esm.sh/@tiptap/extension-subscript@2.10.3"
pin "@tiptap/extension-superscript", to: "https://esm.sh/@tiptap/extension-superscript@2.10.3"

# YouTube video embeds
pin "@tiptap/extension-youtube", to: "https://esm.sh/@tiptap/extension-youtube@2.10.3"

# Character count
pin "@tiptap/extension-character-count", to: "https://esm.sh/@tiptap/extension-character-count@2.10.3"

# BubbleMenu (floating toolbar on text selection)
pin "@tiptap/extension-bubble-menu", to: "https://esm.sh/@tiptap/extension-bubble-menu@2.10.3"

# FloatingMenu (toolbar on empty lines)
pin "@tiptap/extension-floating-menu", to: "https://esm.sh/@tiptap/extension-floating-menu@2.10.3"

# Tippy.js - required by BubbleMenu for positioning
pin "tippy.js", to: "https://esm.sh/tippy.js@6.3.7"
pin "@popperjs/core", to: "https://esm.sh/@popperjs/core@2.11.8"

# Lowlight with bundled dependencies
pin "lowlight", to: "https://esm.sh/lowlight@3?bundle"

# Highlight.js core and common languages for syntax highlighting
pin "highlight.js/lib/core", to: "https://esm.sh/highlight.js@11.9.0/lib/core"
pin "highlight.js/lib/languages/javascript", to: "https://esm.sh/highlight.js@11.9.0/lib/languages/javascript"
pin "highlight.js/lib/languages/typescript", to: "https://esm.sh/highlight.js@11.9.0/lib/languages/typescript"
pin "highlight.js/lib/languages/ruby", to: "https://esm.sh/highlight.js@11.9.0/lib/languages/ruby"
pin "highlight.js/lib/languages/python", to: "https://esm.sh/highlight.js@11.9.0/lib/languages/python"
pin "highlight.js/lib/languages/css", to: "https://esm.sh/highlight.js@11.9.0/lib/languages/css"
pin "highlight.js/lib/languages/xml", to: "https://esm.sh/highlight.js@11.9.0/lib/languages/xml"
pin "highlight.js/lib/languages/json", to: "https://esm.sh/highlight.js@11.9.0/lib/languages/json"
pin "highlight.js/lib/languages/bash", to: "https://esm.sh/highlight.js@11.9.0/lib/languages/bash"
pin "highlight.js/lib/languages/sql", to: "https://esm.sh/highlight.js@11.9.0/lib/languages/sql"
pin "highlight.js/lib/languages/markdown", to: "https://esm.sh/highlight.js@11.9.0/lib/languages/markdown"

# Emoji replacer extension (auto-replaces :emoji: shortcodes)
pin "@tiptap-extend/emoji-replacer", to: "https://esm.sh/@tiptap-extend/emoji-replacer@2.1.6?deps=@tiptap/core@2.10.3"

# Search and Replace extension
pin "@sereneinserenade/tiptap-search-and-replace", to: "https://esm.sh/@sereneinserenade/tiptap-search-and-replace@0.1.1"

# Footnotes extension
pin "tiptap-footnotes", to: "https://esm.sh/tiptap-footnotes@2.0.4?deps=@tiptap/core@2.10.3,@tiptap/pm@2.10.3"

# Inkpen controllers and extensions
pin "inkpen", to: "inkpen/index.js"
pin_all_from File.expand_path("../app/assets/javascripts/inkpen", __dir__), under: "inkpen"

# Inkpen custom extensions - explicit pins required for nested directories
pin "inkpen/extensions/section", to: "inkpen/extensions/section.js"
pin "inkpen/extensions/preformatted", to: "inkpen/extensions/preformatted.js"
pin "inkpen/extensions/slash_commands", to: "inkpen/extensions/slash_commands.js"
pin "inkpen/extensions/block_gutter", to: "inkpen/extensions/block_gutter.js"
pin "inkpen/extensions/drag_handle", to: "inkpen/extensions/drag_handle.js"
pin "inkpen/extensions/toggle_block", to: "inkpen/extensions/toggle_block.js"
pin "inkpen/extensions/columns", to: "inkpen/extensions/columns.js"
pin "inkpen/extensions/callout", to: "inkpen/extensions/callout.js"
pin "inkpen/extensions/block_commands", to: "inkpen/extensions/block_commands.js"
pin "inkpen/extensions/enhanced_image", to: "inkpen/extensions/enhanced_image.js"
pin "inkpen/extensions/file_attachment", to: "inkpen/extensions/file_attachment.js"
pin "inkpen/extensions/embed", to: "inkpen/extensions/embed.js"
pin "inkpen/extensions/advanced_table", to: "inkpen/extensions/advanced_table.js"
pin "inkpen/extensions/table_of_contents", to: "inkpen/extensions/table_of_contents.js"
pin "inkpen/extensions/database", to: "inkpen/extensions/database.js"
pin "inkpen/extensions/document_section", to: "inkpen/extensions/document_section.js"
pin "inkpen/extensions/section_title", to: "inkpen/extensions/section_title.js"
pin "inkpen/extensions/export_commands", to: "inkpen/extensions/export_commands.js"

# Export modules - explicit pins for relative import resolution
pin "inkpen/export", to: "inkpen/export/index.js"
pin "inkpen/export/markdown", to: "inkpen/export/markdown.js"
pin "inkpen/export/html", to: "inkpen/export/html.js"
pin "inkpen/export/pdf", to: "inkpen/export/pdf.js"

# InkpenTable module - explicit pins for all sub-modules
pin "inkpen/extensions/inkpen_table", to: "inkpen/extensions/inkpen_table/index.js"
pin "inkpen/extensions/inkpen_table/inkpen_table", to: "inkpen/extensions/inkpen_table/inkpen_table.js"
pin "inkpen/extensions/inkpen_table/inkpen_table_cell", to: "inkpen/extensions/inkpen_table/inkpen_table_cell.js"
pin "inkpen/extensions/inkpen_table/inkpen_table_header", to: "inkpen/extensions/inkpen_table/inkpen_table_header.js"
pin "inkpen/extensions/inkpen_table/table_menu", to: "inkpen/extensions/inkpen_table/table_menu.js"
pin "inkpen/extensions/inkpen_table/table_helpers", to: "inkpen/extensions/inkpen_table/table_helpers.js"
pin "inkpen/extensions/inkpen_table/table_constants", to: "inkpen/extensions/inkpen_table/table_constants.js"
