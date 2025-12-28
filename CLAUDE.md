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

```bash
# Run tests
bundle exec rake test

# Console
bin/console
```
