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
      "inkpen": fileURLToPath(new URL("./app/assets/javascripts/inkpen", import.meta.url))
    }
  }
})
