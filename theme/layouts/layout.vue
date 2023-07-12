<script setup lang="ts">
import { computed } from "vue";
import type { LayoutProps } from "./types";

const props = defineProps<LayoutProps & {
  columns: string;
}>();

const proseSize = computed(() => {
  return `prose-${props.prose ?? "normal"}`;
});

const kindClass = computed(() => {
  if (!props.kind) return ``;

  return `kind-${props.kind}`;
});

const codeClass = computed(() => {
  if (!props.code) return ``;

  return `code-${props.code}`;
});

const className = computed(() => {
  return `slidev-layout ${proseSize.value} ${kindClass.value} ${codeClass.value}`;
})
</script>

<template>
  <div :class="className">
    <header>
      <slot name="default" />
    </header>
    <div class="grid">
      <div class="prose">
        <slot name="a"></slot>
      </div>
      <div class="prose">
        <slot name="b"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.slidev-layout :deep(pre) {
  font-size: var(--s-down1);
}

.slidev-layout.prose-small :deep(p) {
  &:not([class^="fs-"]) {
    font-size: var(--s-down1);
    line-height: var(--s-up1);
  }
}

.slidev-layout.code-small :deep(pre) {
  font-size: var(--s-down2);
  line-height: var(--s-base);
}

.slidev-layout>div {
  display: grid;
  grid-template-columns: v-bind(columns);
  @apply gap-4;

  >.prose {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-rows: max-content;
    row-gap: var(--s-base);

    :deep(>*) {
      margin: 0 !important;
    }
  }
}

.slidev-layout {
  width: 100%;
  grid-auto-flow: row;
  grid-auto-columns: max-content;
}

.slidev-layout {
  --accent-color: var(--color-neutral-accent);

  &.kind-polaris {
    --accent-color: var(--color-polaris-accent);
  }

  &.kind-octane {
    --accent-color: var(--color-octane-accent);
  }
}

.slidev-layout>header {
  display: grid;
  row-gap: var(--s-down1);
  padding-block-end: var(--s-up2);
  margin-block-end: var(--s-up2);
  border-block-end: 1px solid var(--accent-color);

  > :deep(*) {
    margin: 0 !important;
    line-height: 1;
  }
}

.slidev-layout>div {
  display: grid;
  width: 100%;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  @apply gap-4;

  >.prose {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-rows: max-content;
    row-gap: var(--s-base);

    :deep(>*) {
      margin: 0 !important;
    }
  }
}
</style>