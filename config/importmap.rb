# Inkpen importmap configuration
# These pins are automatically added to the host app's importmap

# TipTap core
pin "@tiptap/core", to: "https://ga.jspm.io/npm:@tiptap/core@2.10.3/dist/index.js"
pin "@tiptap/pm/state", to: "https://ga.jspm.io/npm:@tiptap/pm@2.10.3/state/dist/index.js"
pin "@tiptap/pm/view", to: "https://ga.jspm.io/npm:@tiptap/pm@2.10.3/view/dist/index.js"
pin "@tiptap/pm/model", to: "https://ga.jspm.io/npm:@tiptap/pm@2.10.3/model/dist/index.js"
pin "@tiptap/pm/transform", to: "https://ga.jspm.io/npm:@tiptap/pm@2.10.3/transform/dist/index.js"
pin "@tiptap/pm/commands", to: "https://ga.jspm.io/npm:@tiptap/pm@2.10.3/commands/dist/index.js"
pin "@tiptap/pm/keymap", to: "https://ga.jspm.io/npm:@tiptap/pm@2.10.3/keymap/dist/index.js"
pin "@tiptap/pm/history", to: "https://ga.jspm.io/npm:@tiptap/pm@2.10.3/history/dist/index.js"
pin "@tiptap/pm/dropcursor", to: "https://ga.jspm.io/npm:@tiptap/pm@2.10.3/dropcursor/dist/index.js"
pin "@tiptap/pm/gapcursor", to: "https://ga.jspm.io/npm:@tiptap/pm@2.10.3/gapcursor/dist/index.js"
pin "@tiptap/pm/schema-list", to: "https://ga.jspm.io/npm:@tiptap/pm@2.10.3/schema-list/dist/index.js"

# TipTap starter kit (includes common extensions)
pin "@tiptap/starter-kit", to: "https://ga.jspm.io/npm:@tiptap/starter-kit@2.10.3/dist/index.js"

# TipTap extensions
pin "@tiptap/extension-document", to: "https://ga.jspm.io/npm:@tiptap/extension-document@2.10.3/dist/index.js"
pin "@tiptap/extension-paragraph", to: "https://ga.jspm.io/npm:@tiptap/extension-paragraph@2.10.3/dist/index.js"
pin "@tiptap/extension-text", to: "https://ga.jspm.io/npm:@tiptap/extension-text@2.10.3/dist/index.js"
pin "@tiptap/extension-bold", to: "https://ga.jspm.io/npm:@tiptap/extension-bold@2.10.3/dist/index.js"
pin "@tiptap/extension-italic", to: "https://ga.jspm.io/npm:@tiptap/extension-italic@2.10.3/dist/index.js"
pin "@tiptap/extension-strike", to: "https://ga.jspm.io/npm:@tiptap/extension-strike@2.10.3/dist/index.js"
pin "@tiptap/extension-heading", to: "https://ga.jspm.io/npm:@tiptap/extension-heading@2.10.3/dist/index.js"
pin "@tiptap/extension-bullet-list", to: "https://ga.jspm.io/npm:@tiptap/extension-bullet-list@2.10.3/dist/index.js"
pin "@tiptap/extension-ordered-list", to: "https://ga.jspm.io/npm:@tiptap/extension-ordered-list@2.10.3/dist/index.js"
pin "@tiptap/extension-list-item", to: "https://ga.jspm.io/npm:@tiptap/extension-list-item@2.10.3/dist/index.js"
pin "@tiptap/extension-blockquote", to: "https://ga.jspm.io/npm:@tiptap/extension-blockquote@2.10.3/dist/index.js"
pin "@tiptap/extension-code-block", to: "https://ga.jspm.io/npm:@tiptap/extension-code-block@2.10.3/dist/index.js"
pin "@tiptap/extension-code", to: "https://ga.jspm.io/npm:@tiptap/extension-code@2.10.3/dist/index.js"
pin "@tiptap/extension-horizontal-rule", to: "https://ga.jspm.io/npm:@tiptap/extension-horizontal-rule@2.10.3/dist/index.js"
pin "@tiptap/extension-hard-break", to: "https://ga.jspm.io/npm:@tiptap/extension-hard-break@2.10.3/dist/index.js"
pin "@tiptap/extension-history", to: "https://ga.jspm.io/npm:@tiptap/extension-history@2.10.3/dist/index.js"
pin "@tiptap/extension-dropcursor", to: "https://ga.jspm.io/npm:@tiptap/extension-dropcursor@2.10.3/dist/index.js"
pin "@tiptap/extension-gapcursor", to: "https://ga.jspm.io/npm:@tiptap/extension-gapcursor@2.10.3/dist/index.js"
pin "@tiptap/extension-link", to: "https://ga.jspm.io/npm:@tiptap/extension-link@2.10.3/dist/index.js"
pin "@tiptap/extension-placeholder", to: "https://ga.jspm.io/npm:@tiptap/extension-placeholder@2.10.3/dist/index.js"
pin "@tiptap/extension-table", to: "https://ga.jspm.io/npm:@tiptap/extension-table@2.10.3/dist/index.js"
pin "@tiptap/extension-table-row", to: "https://ga.jspm.io/npm:@tiptap/extension-table-row@2.10.3/dist/index.js"
pin "@tiptap/extension-table-cell", to: "https://ga.jspm.io/npm:@tiptap/extension-table-cell@2.10.3/dist/index.js"
pin "@tiptap/extension-table-header", to: "https://ga.jspm.io/npm:@tiptap/extension-table-header@2.10.3/dist/index.js"
pin "@tiptap/extension-image", to: "https://ga.jspm.io/npm:@tiptap/extension-image@2.10.3/dist/index.js"

# Inkpen controllers
pin "inkpen", to: "inkpen/index.js"
pin_all_from File.expand_path("../app/assets/javascripts/inkpen", __dir__), under: "inkpen"
