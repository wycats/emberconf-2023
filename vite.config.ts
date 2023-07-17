import { defineConfig } from "vite";
import type MarkdownIt from "markdown-it";
// @ts-expect-error
import spans from "markdown-it-bracketed-spans";
import attrs from "markdown-it-attrs";
import type { SlidevPluginOptions } from "@slidev/cli/dist/index.js";
import { include } from "@mdit/plugin-include";
import container from "@starbeam-docs/fenced-container";

export default defineConfig({
  slidev: {
    components: {
      dts: true,
    },
    markdown: {
      /* markdown-it options */
      markdownItSetup(md: MarkdownIt) {
        /* custom markdown-it plugins */
        md.use(attrs);
        md.use(spans);
        md.use(include);
        md.use(container, {});
      },
    },
    /* options for other plugins */
  } satisfies SlidevPluginOptions,
});
