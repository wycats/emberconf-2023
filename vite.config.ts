import { defineConfig } from "vite";
import type MarkdownIt from "markdown-it";
// @ts-expect-error
import spans from "markdown-it-bracketed-spans";
import attrs from "markdown-it-attrs";
import type { SlidevPluginOptions } from "@slidev/cli/dist/index.js";

export default defineConfig({
  slidev: {
    markdown: {
      /* markdown-it options */
      markdownItSetup(md: MarkdownIt) {
        /* custom markdown-it plugins */
        md.use(attrs);
        md.use(spans);
      },
    },
    /* options for other plugins */
  } satisfies SlidevPluginOptions,
});
