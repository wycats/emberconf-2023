/* ./setup/shiki.ts */
import { defineShikiSetup } from "@slidev/types";
import { resolve } from "path";

const __dirname = new URL(".", import.meta.url).pathname;

export default defineShikiSetup((shiki) => {
  return {
    theme: "github-dark",
    langs: [
      ...shiki.BUNDLED_LANGUAGES,
      {
        id: "glimmer",
        scopeName: "inline.template",
        path: resolve(__dirname, "./inline-hbs.json"),
      },
    ],
  };
});
