import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  rules: [
    [
      /^fs-(.*)$/,
      ([, c]) => ({
        "font-size": `var(--s-${c})`,
      }),
    ],
    [
      /^lh-(.*)$/,
      ([, c]) => ({
        "line-height": `var(--s-${c}) !important`,
      }),
    ],
    [
      /^grid-area-(.*)$/,
      ([, c]) => ({
        "grid-area": c,
      }),
    ],
    [/^grid-column=(.*)$/, ([, c]) => parseColumn(c)],
  ],
  theme: {
    colors: {
      // ...
    },
  },

  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      },
    }),
  ],

  transformers: [transformerDirectives(), transformerVariantGroup()],
});

function parseColumn(column: string) {
  const syntax = /^(?<start>\d+)(?:(?<range>..)?(?<inclusive>=?)(?<end>\d+))$/u;
  const groups = syntax.exec(column)?.groups as
    | {
        start: string;
        range?: string | undefined;
        inclusive?: string | undefined;
        end?: string | undefined;
      }
    | undefined;

  console.log(groups);

  if (!groups) return undefined;

  const { start, range, inclusive, end } = groups;

  if (!range) {
    return { "grid-column": start };
  }

  const endInt = parseInt(end!);
  const endCol = inclusive === "=" ? endInt + 1 : endInt;

  return { "grid-column": `${start} / ${endCol}` };
}
