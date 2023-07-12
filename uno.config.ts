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
  rules: [[/^fs-(.*)$/, ([, c]) => ({ "font-size": `var(--s-${c})` })]],
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
