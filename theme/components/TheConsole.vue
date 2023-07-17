<script setup lang="ts">
defineProps<{
  title?: string
  code?: "small" | "medium" | "large"
}>();
</script>
<template>
  <div class="console not-prose bg-primary text-white rounded-md relative">
    <div class="chrome py-2 px-3">

      <ul class="dots">
        <li class="!m-0 rounded w-2 h-2 bg-red-400 inline-block"></li>
        <li class="!m-0 rounded w-2 h-2 bg-yellow-300 inline-block"></li>
        <li class="!m-0 rounded w-2 h-2 bg-green-500 inline-block"></li>
      </ul>
      <h5 class="not-prose fw-normal font-mono fs-down1" v-if="$props.title">{{ $props.title }}</h5>
    </div>
    <div class="content" :data-size="$props.code ?? 'medium'">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.console {
  display: grid;
  overflow: hidden;
  align-items: start;
  column-gap: var(--s-base);
  width: 100%;
  height: 100%;
  grid-template:
    'dots title' max-content
    'content content' 1fr /
    max-content 1fr;

  :deep(pre) {
    overflow: auto;
  }

  :deep(.slidev-code-wrapper) {
    display: contents;
  }

  :deep(code) {
    @apply font-normal w-full grid text-left;
  }

  .chrome {
    display: grid;
    grid-template: "dots title" auto / max-content 1fr;
    align-items: center;
    column-gap: var(--s-down2);
    // grid-template-rows: max-content;
    contain: content;
  }

  ul.dots {
    grid-area: dots;
    contain: content;
    width: max-content;
    display: grid;
    grid-template-columns: repeat(3, max-content);
    column-gap: var(--s-down3);
  }

  h3 {
    @apply m0 p0 fs-down1 font-mono;
    grid-area: title;
    font-size: var(--s-down1);
  }

  .content {
    grid-area: content;
    display: grid;
    height: 100%;
    overflow: auto;

    :deep(pre .line:empty:not(:last-child)) {
      height: 1em;
      height: 1lh;
    }

    &[data-size="small"] :deep(pre) {
      @apply fs-base lh-up1;
    }

    &[data-size="medium"] :deep(pre) {
      @apply fs-down2 lh-base;
    }

    &[data-size="medium-lg"] :deep(pre) {
      @apply fs-base lh-up3;
    }

    &[data-size="large"] :deep(pre) {
      @apply fs-up2 lh-up5;
    }
  }
}
</style>