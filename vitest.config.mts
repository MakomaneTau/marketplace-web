import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "http://localhost:3000" } },
    include: ["tests/{unit,components,integration}/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
  },
});
