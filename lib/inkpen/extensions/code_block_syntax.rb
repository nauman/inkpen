# frozen_string_literal: true

module Inkpen
  module Extensions
    ##
    # Code Block with Syntax Highlighting extension.
    #
    # Enhances the standard code block with syntax highlighting using
    # lowlight (highlight.js). Supports multiple programming languages
    # with automatic language detection.
    #
    # @example Basic usage
    #   extension = Inkpen::Extensions::CodeBlockSyntax.new
    #
    # @example With custom languages
    #   extension = Inkpen::Extensions::CodeBlockSyntax.new(
    #     languages: [:ruby, :javascript, :python, :sql],
    #     default_language: :ruby
    #   )
    #
    # @see https://tiptap.dev/docs/examples/advanced/syntax-highlighting
    # @author Inkpen Team
    # @since 0.2.0
    #
    class CodeBlockSyntax < Base
      ##
      # All available programming languages for syntax highlighting.
      # These are loaded from highlight.js via lowlight.
      AVAILABLE_LANGUAGES = %i[
        javascript
        typescript
        ruby
        python
        css
        xml
        html
        json
        bash
        shell
        sql
        markdown
        yaml
        go
        rust
        java
        kotlin
        swift
        php
        c
        cpp
        csharp
        elixir
        erlang
        haskell
        scala
        r
        matlab
        dockerfile
        nginx
        apache
        graphql
      ].freeze

      ##
      # Default languages to load (for performance).
      DEFAULT_LANGUAGES = %i[
        javascript
        typescript
        ruby
        python
        css
        xml
        json
        bash
        sql
        markdown
      ].freeze

      ##
      # The unique name of this extension.
      #
      # @return [Symbol] :code_block_syntax
      #
      def name
        :code_block_syntax
      end

      ##
      # Languages to enable for syntax highlighting.
      #
      # Only these languages will be loaded from highlight.js to
      # reduce bundle size.
      #
      # @return [Array<Symbol>] enabled language identifiers
      #
      def languages
        options.fetch(:languages, DEFAULT_LANGUAGES)
      end

      ##
      # Default language when none is specified.
      #
      # @return [Symbol, nil] default language or nil for auto-detect
      #
      def default_language
        options[:default_language]
      end

      ##
      # Whether to show line numbers in code blocks.
      #
      # @return [Boolean] true to show line numbers
      #
      def line_numbers?
        options.fetch(:line_numbers, false)
      end

      ##
      # Whether to show a language selector dropdown.
      #
      # @return [Boolean] true to show language selector
      #
      def show_language_selector?
        options.fetch(:language_selector, true)
      end

      ##
      # Whether to enable copy-to-clipboard button.
      #
      # @return [Boolean] true to show copy button
      #
      def copy_button?
        options.fetch(:copy_button, true)
      end

      ##
      # CSS theme for syntax highlighting.
      #
      # @return [String] theme name (e.g., "github", "monokai", "dracula")
      #
      def theme
        options.fetch(:theme, "github")
      end

      ##
      # Convert to configuration hash for JavaScript.
      #
      # @return [Hash] configuration for the TipTap extension
      #
      def to_config
        {
          languages: languages,
          defaultLanguage: default_language,
          lineNumbers: line_numbers?,
          languageSelector: show_language_selector?,
          copyButton: copy_button?,
          theme: theme,
          lowlight: {
            languages: languages
          }
        }
      end

      private

      def default_options
        super.merge(
          languages: DEFAULT_LANGUAGES,
          line_numbers: false,
          language_selector: true,
          copy_button: true,
          theme: "github"
        )
      end
    end
  end
end
