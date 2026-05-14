# CLAUDE.md

This file provides guidance to Claude Code when working with the Inkpen gem.

## Project Overview

Inkpen is a TipTap-based rich text editor gem for Rails. It provides a customizable WYSIWYG editor with:
- BubbleMenu (floating toolbar on text selection)
- Fixed toolbar option
- Extensions system (mentions, tables, code blocks, task lists)
- Theme support (light/dark)

## Usage

Inkpen is used for **Posts only** in MadeMySite. Pages use Monaco editor instead.

## JavaScript/Stimulus Patterns (Fizzy Style)

**IMPORTANT:** Always follow Fizzy patterns from `/Users/naumantariq/Code/00-source/fizzy`.

### Controller Structure

```javascript
import { Controller } from "@hotwired/stimulus"
import { helperFunction } from "helpers/helper_name"

const CONSTANTS_HERE = 3000

export default class extends Controller {
  static targets = ["element"]
  static values = { url: String, delay: Number }

  #privateField    // Use # for private fields, NOT underscore

  // Lifecycle

  connect() { }
  disconnect() { this.#cleanup() }  // Always clean up

  // Actions

  actionMethod() { }

  // Private

  #privateMethod() { }
}
```

### Key Rules

- **Private fields**: Use `#field` NOT `_field`
- **Section comments**: `// Lifecycle`, `// Actions`, `// Private`
- **Always clean up**: Clear timers/observers in `disconnect()`
- **Values API**: Use `this.urlValue` NOT `getAttribute()`
- **Dispatch events**: For controller communication, NOT direct calls
- **Single responsibility**: Each controller does ONE thing well

### Helper Files

```javascript
// ✅ Named function exports
export function throttle(fn, delay = 1000) { }
export function debounce(fn, delay = 1000) { }

// ❌ DON'T use object exports
export const Helpers = { throttle() { } }
```

### Import Pattern

```javascript
// ✅ Named imports
import { throttle, debounce } from "helpers/timing_helpers"

// ❌ DON'T import objects
import { TimingHelpers } from "helpers/timing_helpers"
```

## Ruby Patterns

### PORO Structure

```ruby
module Inkpen
  class SomeClass
    attr_reader :option1, :option2

    def initialize(option1:, option2: default)
      @option1 = option1
      @option2 = option2
    end

    def some_method
      # Implementation
    end

    private

    def private_method
      # Private logic
    end
  end
end
```

## File Structure

```
lib/inkpen/
├── editor.rb           # Main editor PORO
├── toolbar.rb          # Toolbar configuration
├── configuration.rb    # Global config
├── extensions/         # TipTap extension configs
│   ├── base.rb
│   ├── mention.rb
│   ├── table.rb
│   └── task_list.rb
└── engine.rb           # Rails engine

app/
├── assets/
│   ├── javascripts/inkpen/
│   │   ├── controllers/
│   │   │   ├── editor_controller.js
│   │   │   └── toolbar_controller.js
│   │   └── index.js
│   └── stylesheets/inkpen/
└── helpers/inkpen/
    └── editor_helper.rb
```

## Development

### Ruby side

```bash
bundle install
bundle exec rake test    # Minitest unit tests
bin/console              # IRB with Inkpen loaded
```

### JavaScript side (since 0.8.0)

```bash
npm install              # installs production deps + esbuild + vitest
npm test                 # runs the spec 01 markdown round-trip tests (vitest)
npm run build            # rebuilds app/assets/javascripts/inkpen.bundle.js
npm run build:check      # validates the bundle: parses, has expected
                         # exports, contains zero third-party CDN refs
```

**The bundle is committed to the repo.** Run `npm run build` after every
JS change so consumers don't need to install npm.

### Releasing a new version

See `02-addons/107-inkpen-docs/docs/release-process.md` for the full
release runbook. TL;DR:

1. Bump `lib/inkpen/version.rb` + `inkpen.gemspec` (stub line +
   `s.version`).
2. `npm run build && npm run build:check && npm test &&
   bundle exec rake test`.
3. `bundle exec rake build` → `pkg/inkpen-X.Y.Z.gem`.
4. Smoke test in InventList (open Nodepad, confirm zero `esm.sh`
   requests in DevTools).
5. Publish (path-pinned / private gemserver / rubygems — see release
   doc).

## Bundle / vendoring (since 0.8.0)

`config/importmap.rb` no longer pins to `esm.sh`. All upstream
dependencies (TipTap@2.10.3, ProseMirror@1.x, lowlight, highlight.js,
tippy, popperjs, linkifyjs, and three third-party TipTap extensions)
are vendored into a single ESM bundle at
`app/assets/javascripts/inkpen.bundle.js` (1.9 MB minified, source map
beside it).

The build entrypoint is `app/assets/javascripts/inkpen/index.js`. The
bundle preserves `import "inkpen"` as a side-effecting import that
registers `inkpen--editor`, `inkpen--toolbar`,
`inkpen--sticky-toolbar` Stimulus controllers on `window.Stimulus`
(or starts its own Application if the host hasn't already).

**Host externals kept out of the bundle** (host provides them):

- `@hotwired/stimulus`
- `@hotwired/turbo-rails`

**Why this exists:** three production CDN incidents on 2026-05-14
caused by importmap pinning to esm.sh. Plan and audit live at
`02-addons/107-inkpen-docs/plans/05-vendor-bundle-cdn-decoupling.md`.

## Internal planning docs

Inkpen has a dedicated planning surface at
`02-addons/107-inkpen-docs/`. Roadmap, plans, sessions, handoffs,
audits all live there. Don't recreate that structure here; this gem
ships its own consumer-facing docs in `docs/` (README, CHANGELOG,
FEATURES, ROADMAP, MARKDOWN_MODE planning doc, audits).
