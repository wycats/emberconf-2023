import { defineConfig } from "vite";
import type MarkdownIt from "markdown-it";
import attrs from "markdown-it-attrs";
import type { SlidevPluginOptions } from "@slidev/cli/dist/index.js";

export default defineConfig({
  slidev: {
    markdown: {
      /* markdown-it options */
      markdownItSetup(md: MarkdownIt) {
        /* custom markdown-it plugins */
        md.use(attrs);
      },
    },
    /* options for other plugins */
  } satisfies SlidevPluginOptions,
});
