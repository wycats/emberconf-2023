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
    <div class="grid columns">
      <div class="prose flex column">
        <slot name="a"></slot>
      </div>
      <div class="prose flex column">
        <slot name="b"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.columns {
  contain: strict;
  align-items: start;
}

.column {
  display: grid;
  grid-auto-flow: row dense;
  // grid-template-rows: max-content;
  width: 100%;
  height: 100%;
  contain: strict;
  align-items: start;

  grid-template-columns: 1fr;
  row-gap: var(--s-base);

  :deep(>*) {
    margin: 0 !important;
  }

  :deep(h1, h2, h3, h4, h5, h6) {
    height: max-content;
  }

  &:has(*) {
    grid-template-rows: 1fr;
  }

  &:has(> :nth-child(2)) {
    grid-template-rows: max-content 1fr;
  }

  &:has(> :nth-child(3)) {
    grid-template-rows: max-content max-content 1fr;
  }

  &:has(> :nth-child(4)) {
    grid-template-rows: max-content max-content max-content 1fr;
  }

  &:has(> :nth-child(5)) {
    grid-template-rows: max-content max-content max-content max-content 1fr;
  }



}

.slidev-layout {
  grid-template-rows: max-content 1fr;
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

}
</style>