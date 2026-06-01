import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    include: ["packages/shared/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reports: ["text", "lcov"],
      include: ["packages/shared/**/*.{ts,tsx}"],
    },
  },
});
