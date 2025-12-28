# frozen_string_literal: true

require "test_helper"

class TestInkpen < Minitest::Test
  def test_that_it_has_a_version_number
    refute_nil ::Inkpen::VERSION
  end

  def test_configuration_exists
    refute_nil Inkpen.configuration
  end

  def test_configure_block_works
    Inkpen.configure do |config|
      assert_kind_of Inkpen::Configuration, config
    end
  end

  def test_reset_configuration
    original = Inkpen.configuration
    Inkpen.reset_configuration!
    refute_same original, Inkpen.configuration
  end
end
