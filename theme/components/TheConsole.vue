<script setup lang="ts">
defineProps<{
  title?: string
}>();
</script>
<template>
  <div class="console bg-primary text-white text-xs rounded-md relative">
    <ul class="dots">
      <li class="!m-0 rounded w-2 h-2 bg-red-400 inline-block"></li>
      <li class="!m-0 rounded w-2 h-2 bg-yellow-300 inline-block"></li>
      <li class="!m-0 rounded w-2 h-2 bg-green-500 inline-block"></li>
    </ul>
    <h3 class="not-prose" v-if="$props.title">{{ $props.title }}</h3>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.console {
  display: grid;
  align-items: start;
  column-gap: var(--s-base);
  height: max-content;
  grid-template:
    'dots title' max-content
    'content content' max-content /
    max-content 1fr;

  ul.dots {
    grid-area: dots;
    display: grid;
    grid-template-columns: repeat(3, max-content);
    column-gap: var(--s-down3);
  }

  h3 {
    @apply m0 p0 fs-down1 fw-normal font-mono;
    grid-area: title;
    font-size: var(--s-down1);
  }

  .content {
    grid-area: content;
  }
}
</style>