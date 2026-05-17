import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

export default defineConfig({
  test: {
    include: ["test/javascripts/**/*.test.js"],
    environment: "node",
    globals: false
  },
  resolve: {
    alias: {
      "inkpen": fileURLToPath(new URL("./app/assets/javascripts/inkpen", import.meta.url)),
      // @hotwired/stimulus is host-provided in production (external in
      // the esbuild bundle). For tests we stub it with a minimal shim
      // that satisfies the import shape — Application.start() returns
      // an object with .register, Controller is a base class.
      "@hotwired/stimulus": fileURLToPath(new URL("./test/javascripts/stimulus_stub.js", import.meta.url))
    }
  }
})
