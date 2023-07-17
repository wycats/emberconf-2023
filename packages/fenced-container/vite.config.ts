import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "./dist",
    minify: false,
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
    },
  },
});
