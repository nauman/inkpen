# Inkpen

<a href="https://builtonrails.com/@nauman"><img src="https://builtonrails.com/badges/inkpen.svg" alt="Built on Rails"></a>

A modern, TipTap-based rich text editor for Ruby on Rails applications. Inkpen provides a clean, extensible editor with a PORO-based architecture that seamlessly integrates with Rails forms and Hotwire/Stimulus.

## Features

- **TipTap/ProseMirror Foundation**: Built on the powerful TipTap editor framework
- **Rails Integration**: Works seamlessly with Rails forms, Turbo, and Stimulus
- **PORO Architecture**: Clean Ruby objects for configuration and extensions
- **Importmap Compatible**: No Node.js build step required
- **Extensible**: Modular extension system for adding features
- **Toolbar Options**: Floating, fixed, or hidden toolbar configurations

## Installation

Add to your Gemfile:

```ruby
gem "inkpen", github: "nauman/inkpen"
```

Then run:

```bash
bundle install
```

## Configuration

Configure Inkpen globally in an initializer:

```ruby
# config/initializers/inkpen.rb

Inkpen.configure do |config|
  config.toolbar = :floating            # :floating, :fixed, :none
  config.placeholder = "Start writing..."
  config.autosave = true
  config.autosave_interval = 5000       # milliseconds
  config.min_height = "200px"
  config.max_height = "600px"

  # Enable/disable extensions
  config.extensions = [:bold, :italic, :link, :heading, :bullet_list]
end
```

## Basic Usage

### Creating an Editor Instance

```ruby
# In your controller or view
editor = Inkpen::Editor.new(
  name: "post[body]",
  value: @post.body,
  toolbar: :floating,
  extensions: [:bold, :italic, :link, :heading, :mentions],
  placeholder: "Write your post..."
)
```

### In Views (ERB)

```erb
<%= tag.div editor.data_attributes do %>
  <%= hidden_field_tag editor.input_name, editor.value %>
  <div class="inkpen-editor" style="<%= editor.style_attributes %>"></div>
<% end %>
```

### Toolbar Configuration

```ruby
toolbar = Inkpen::Toolbar.new(
  style: :floating,
  buttons: [:bold, :italic, :link, :heading],
  position: :top
)

# Predefined button presets
Inkpen::Toolbar::PRESET_MINIMAL   # [:bold, :italic, :link]
Inkpen::Toolbar::PRESET_STANDARD  # Formatting + common blocks
Inkpen::Toolbar::PRESET_FULL      # All available buttons
```

### Sticky Toolbar

The sticky toolbar provides a fixed-position toolbar for inserting blocks, media, and widgets. It supports horizontal (bottom) and vertical (left/right) positions.

```ruby
# Enable sticky toolbar with default settings
editor = Inkpen::Editor.new(
  name: "post[body]",
  value: @post.body,
  sticky_toolbar: Inkpen::StickyToolbar.new(
    position: :bottom,  # :bottom, :left, :right
    buttons: [:table, :code_block, :image, :youtube, :widget],
    widget_types: %w[form gallery poll]
  )
)
```

**Available buttons:**

| Button | Description |
|--------|-------------|
| `table` | Insert a table |
| `code_block` | Insert code block |
| `blockquote` | Insert quote block |
| `horizontal_rule` | Insert divider line |
| `task_list` | Insert task list |
| `image` | Insert image (triggers `inkpen:request-image` event) |
| `youtube` | Insert YouTube video |
| `embed` | Insert embed (triggers `inkpen:request-embed` event) |
| `widget` | Open widget picker modal |
| `divider` | Visual separator |

**Presets:**

```ruby
Inkpen::StickyToolbar::PRESET_BLOCKS  # table, code_block, blockquote, etc.
Inkpen::StickyToolbar::PRESET_MEDIA   # image, youtube, embed
Inkpen::StickyToolbar::PRESET_FULL    # All buttons
```

**Handling widget events:**

```javascript
// In your application.js or page-specific controller
document.addEventListener("inkpen:insert-widget", (event) => {
  const { type, controller } = event.detail
  // type is "form", "gallery", or "poll"
  // Show your widget picker UI
})

document.addEventListener("inkpen:request-image", (event) => {
  const { controller } = event.detail
  // Show image upload modal
  // Then call: controller.insertImage(url, altText)
})
```

## Extensions

Inkpen uses a modular extension system. Each extension is a PORO that configures TipTap extensions.

### Core Extensions

Available by default:

- `bold`, `italic`, `strike`, `underline`
- `link`, `heading`
- `bullet_list`, `ordered_list`
- `blockquote`, `code_block`
- `horizontal_rule`, `hard_break`

### Advanced Extensions

#### Forced Document Structure

Enforces a document structure with a required title heading:

```ruby
extension = Inkpen::Extensions::ForcedDocument.new(
  heading_level: 1,
  placeholder: "Enter your title...",
  allow_deletion: false
)

extension.to_config
# => { headingLevel: 1, titlePlaceholder: "Enter your title...", ... }
```

#### Mentions

Enable @mentions functionality:

```ruby
extension = Inkpen::Extensions::Mention.new(
  search_url: "/api/users/search",
  trigger: "@",
  min_chars: 1,
  suggestion_class: "mention-popup",
  allow_custom: false
)

# Or with static items:
extension = Inkpen::Extensions::Mention.new(
  items: [
    { id: 1, label: "John Doe" },
    { id: 2, label: "Jane Smith" }
  ]
)
```

#### Code Block with Syntax Highlighting

Add syntax highlighting to code blocks:

```ruby
extension = Inkpen::Extensions::CodeBlockSyntax.new(
  languages: [:ruby, :javascript, :python, :sql],
  default_language: :ruby,
  line_numbers: true,
  language_selector: true,
  copy_button: true,
  theme: "github"  # or "monokai", "dracula"
)
```

Available languages: `javascript`, `typescript`, `ruby`, `python`, `css`, `xml`, `html`, `json`, `bash`, `sql`, `markdown`, `go`, `rust`, `java`, `kotlin`, `swift`, `php`, `c`, `cpp`, `csharp`, `elixir`, and more.

#### Tables

Add table support with resizing and toolbar:

```ruby
extension = Inkpen::Extensions::Table.new(
  resizable: true,
  header_row: true,
  header_column: false,
  cell_min_width: 25,
  toolbar: true,
  allow_merge: true,
  default_rows: 3,
  default_cols: 3
)
```

#### Task Lists

Add interactive checkboxes/task lists:

```ruby
extension = Inkpen::Extensions::TaskList.new(
  nested: true,
  list_class: "task-list",
  item_class: "task-item",
  checked_class: "task-checked",
  keyboard_shortcut: "Mod-Shift-9"
)
```

### Creating Custom Extensions

Extend `Inkpen::Extensions::Base`:

```ruby
module Inkpen
  module Extensions
    class MyCustomExtension < Base
      def name
        :my_custom
      end

      def to_config
        {
          optionOne: options.fetch(:option_one, "default"),
          optionTwo: options.fetch(:option_two, true)
        }
      end

      private

      def default_options
        super.merge(
          option_one: "default",
          option_two: true
        )
      end
    end
  end
end
```

## JavaScript Integration

Inkpen uses Stimulus controllers and importmaps. The gem automatically registers pins for TipTap and ProseMirror dependencies.

### Required Importmap Pins

The gem includes pins for:

- TipTap core and PM adapters
- ProseMirror packages
- TipTap extensions (document, paragraph, text, formatting, etc.)
- Lowlight for syntax highlighting
- Highlight.js language definitions

### Stimulus Controller

The editor is controlled by `inkpen--editor` Stimulus controller. Connect it to your editor container:

```html
<div data-controller="inkpen--editor"
     data-inkpen--editor-extensions-value='["bold","italic","link"]'
     data-inkpen--editor-toolbar-value="floating"
     data-inkpen--editor-placeholder-value="Start writing...">
  <!-- Editor content here -->
</div>
```

## Architecture

```
inkpen/
├── lib/
│   ├── inkpen.rb                    # Main entry point
│   ├── inkpen/
│   │   ├── configuration.rb         # Global config PORO
│   │   ├── editor.rb                # Editor instance PORO
│   │   ├── toolbar.rb               # Floating toolbar config PORO
│   │   ├── sticky_toolbar.rb        # Sticky toolbar config PORO
│   │   ├── engine.rb                # Rails engine
│   │   ├── version.rb
│   │   └── extensions/
│   │       ├── base.rb              # Extension base class
│   │       ├── forced_document.rb   # Title heading structure
│   │       ├── mention.rb           # @mentions
│   │       ├── code_block_syntax.rb # Syntax highlighting
│   │       ├── table.rb             # Table support
│   │       └── task_list.rb         # Task/checkbox lists
├── app/
│   └── assets/
│       ├── javascripts/
│       │   └── inkpen/
│       │       ├── controllers/
│       │       │   ├── editor_controller.js       # Main TipTap editor
│       │       │   ├── toolbar_controller.js      # Floating toolbar
│       │       │   └── sticky_toolbar_controller.js # Sticky toolbar
│       │       └── index.js         # Entry point
│       └── stylesheets/
│           └── inkpen/
│               ├── editor.css       # Editor styles
│               └── sticky_toolbar.css # Sticky toolbar styles
├── config/
│   └── importmap.rb                 # TipTap/PM dependencies
└── README.md
```

## API Reference

### Inkpen::Editor

| Method | Description |
|--------|-------------|
| `name` | Form field name |
| `value` | Current editor content |
| `toolbar` | Toolbar style (`:floating`, `:fixed`, `:none`) |
| `extensions` | Array of enabled extension symbols |
| `data_attributes` | Hash of Stimulus data attributes |
| `style_attributes` | CSS inline styles string |
| `extension_enabled?(name)` | Check if extension is enabled |
| `input_id` | Safe HTML ID from name |

### Inkpen::Toolbar

| Method | Description |
|--------|-------------|
| `style` | Toolbar style |
| `buttons` | Array of button symbols |
| `position` | Toolbar position (`:top`, `:bottom`) |
| `floating?` | Is floating toolbar? |
| `fixed?` | Is fixed toolbar? |
| `hidden?` | Is toolbar hidden? |

### Inkpen::StickyToolbar

| Method | Description |
|--------|-------------|
| `position` | Position (`:bottom`, `:left`, `:right`) |
| `buttons` | Array of button symbols |
| `widget_types` | Array of widget type strings |
| `enabled?` | Is sticky toolbar enabled? |
| `vertical?` | Is vertical layout (left/right)? |
| `horizontal?` | Is horizontal layout (bottom)? |
| `data_attributes` | Hash of Stimulus data attributes |

### Inkpen::Extensions::Base

| Method | Description |
|--------|-------------|
| `name` | Extension identifier (Symbol) |
| `enabled?` | Is extension enabled? |
| `options` | Configuration options hash |
| `to_config` | JS configuration hash |
| `to_h` | Full extension hash |
| `to_json` | JSON representation |

## Development

After checking out the repo:

```bash
bin/setup              # Install dependencies
bundle exec rake test  # Run tests
bin/console            # Interactive console
```

## Contributing

Bug reports and pull requests are welcome on GitHub.

## License

MIT License
