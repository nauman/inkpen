# frozen_string_literal: true

module Inkpen
  module Extensions
    ##
    # Task List extension for TipTap.
    #
    # Enables interactive checkbox/task list functionality. Users can
    # create todo lists with checkable items that persist their state.
    #
    # @example Basic usage
    #   extension = Inkpen::Extensions::TaskList.new
    #
    # @example With nested tasks disabled
    #   extension = Inkpen::Extensions::TaskList.new(
    #     nested: false,
    #     item_class: "my-task-item"
    #   )
    #
    # @see https://tiptap.dev/docs/examples/tasks
    # @author Inkpen Team
    # @since 0.2.0
    #
    class TaskList < Base
      ##
      # The unique name of this extension.
      #
      # @return [Symbol] :task_list
      #
      def name
        :task_list
      end

      ##
      # Whether task lists can be nested.
      #
      # @return [Boolean] true to allow nested task lists
      #
      def nested?
        options.fetch(:nested, true)
      end

      ##
      # CSS class applied to task list container.
      #
      # @return [String] CSS class name
      #
      def list_class
        options.fetch(:list_class, "inkpen-task-list")
      end

      ##
      # CSS class applied to individual task items.
      #
      # @return [String] CSS class name
      #
      def item_class
        options.fetch(:item_class, "inkpen-task-item")
      end

      ##
      # CSS class applied to checked task items.
      #
      # @return [String] CSS class name
      #
      def checked_class
        options.fetch(:checked_class, "inkpen-task-checked")
      end

      ##
      # CSS class applied to the checkbox element.
      #
      # @return [String] CSS class name
      #
      def checkbox_class
        options.fetch(:checkbox_class, "inkpen-task-checkbox")
      end

      ##
      # HTML attributes for the task list element.
      #
      # @return [Hash] HTML attributes
      #
      def html_attributes
        options.fetch(:html_attributes, { class: list_class })
      end

      ##
      # HTML attributes for task item elements.
      #
      # @return [Hash] HTML attributes
      #
      def item_html_attributes
        options.fetch(:item_html_attributes, { class: item_class })
      end

      ##
      # Whether clicking on the text toggles the checkbox.
      #
      # @return [Boolean] true if text click toggles checkbox
      #
      def text_toggle?
        options.fetch(:text_toggle, false)
      end

      ##
      # Keyboard shortcut to create a task list.
      #
      # @return [String] keyboard shortcut
      #
      def keyboard_shortcut
        options.fetch(:keyboard_shortcut, "Mod-Shift-9")
      end

      ##
      # Convert to configuration hash for JavaScript.
      #
      # @return [Hash] configuration for the TipTap extension
      #
      def to_config
        {
          nested: nested?,
          listClass: list_class,
          itemClass: item_class,
          checkedClass: checked_class,
          checkboxClass: checkbox_class,
          HTMLAttributes: html_attributes,
          itemHTMLAttributes: item_html_attributes,
          textToggle: text_toggle?,
          keyboardShortcut: keyboard_shortcut
        }
      end

      private

      def default_options
        super.merge(
          nested: true,
          text_toggle: false,
          keyboard_shortcut: "Mod-Shift-9"
        )
      end
    end
  end
end
