/* ./setup/shiki.ts */
import { defineShikiSetup, type ShikiOptions } from "@slidev/types";
import { resolve } from "path";
import {
  getHighlighter as getProcessorHighlighter,
  createFocusProcessor,
  createHighlightProcessor,
} from "shiki-processor";
import type { Highlighter, IThemedToken } from "shiki";
import exp from "constants";

const __dirname = new URL(".", import.meta.url).pathname;

type CodeToHtmlOptions = NonNullable<
  Parameters<Highlighter["codeToHtml"]>["1"]
>;

export default defineShikiSetup(async (shiki) => {
  const ts = findLang("ts");
  const js = findLang("js");
  const html = findLang("html");
  const yaml = findLang("yaml");
  const md = findLang("md");

  const theme = await shiki.loadTheme(
    resolve(__dirname, "themes", "dracula.json")
  );

  const highlighter = await getProcessorHighlighter({
    theme,
    langs: [
      html,
      yaml,
      ts,
      js,
      md,
      {
        id: "handlebars",
        scopeName: "text.html.handlebars",
        path: resolve(__dirname, "./handlebars.jsonc"),
        aliases: ["hbs", "htmlbars"],
      },
      {
        id: "glimmer-ts",
        scopeName: "source.gts",
        path: resolve(__dirname, "./glimmer-ts.json"),
        aliases: ["gts", "gjs", "ts", "js"],
      },
    ],
    processors: [createFocusProcessor(), createHighlightProcessor()],
  });

  const codeToHTML = highlighter.codeToHtml;

  highlighter.codeToHtml = ((code: string, options: CodeToHtmlOptions) => {
    if (process.env.DEBUG_SHIKI)
      console.log(
        highlighter
          .codeToThemedTokens(code, options.lang, options.theme, {
            includeExplanation: true,
          })
          .flat()
          .map(renderToken)
          .join("\n")
      );

    return codeToHTML(code, options);
  }) as typeof highlighter.codeToHtml;

  return {
    theme,
    get highlighter() {
      return highlighter;
    },

    set highlighter(_) {
      // intentionally ignore slidev's attempt to set the highlighter
    },
  } satisfies ShikiOptions;

  function findLang(id: string) {
    const lang = shiki.BUNDLED_LANGUAGES.find(
      (lang) => lang.id === id || lang.aliases?.includes(id)
    );

    if (lang === undefined) {
      throw new Error(`Language ${id} not found`);
    }

    return lang;
  }
});

function renderToken({ content, explanation, color }: IThemedToken) {
  if (!explanation) {
    return JSON.stringify(content);
  }

  const match = explanation.findLast((e) =>
    e.scopes.some((s) =>
      s.themeMatches.some((m) => m.settings.foreground === color)
    )
  );

  if (!match) {
    return `${JSON.stringify(content)}\n${explanation
      .flatMap((e) => {
        return e.scopes.map((s) => `  - ${s.scopeName}`);
      })
      .join("\n")}`;
  }

  const scopes = match.scopes.map((s) =>
    s.themeMatches.some((m) => m.settings.foreground === color)
      ? `*${s.scopeName} (${color})`
      : s.scopeName
  );

  return `${JSON.stringify(content)}\n${scopes
    .map((s) => `  - ${s}`)
    .join("\n")}`;
}
