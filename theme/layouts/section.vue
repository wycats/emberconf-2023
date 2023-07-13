<script setup lang="ts">
const props = defineProps<{ heading?: "center" | undefined }>();
</script>

<template>
  <div :class="`slidev-layout section grid justify-${props.heading ?? 'normal'}`">
    <LayoutHeader />
    <CornerCurves class="absolute left-0 top-0 transform rotate-90" />
    <div class="grid section-grid">
      <slot />
    </div>
    <AsGraphic type="zigzag" class="absolute top-20 -right-30" />
  </div>
</template>

<style scoped>
.slidev-layout.section {
  &.justify-center :is(h1, h2, h3, h4, h5, h6) {
    text-align: center;
  }

  :deep(h1) {
    @apply text-6xl leading-20 font-display font-extrabold text-primary;
  }

  :deep(h1+p) {
    @apply opacity-60 -mt-4 text-2xl;
  }

  :deep(a) {
    @apply text-secondary-400 hover: text-secondary-500 dark:(text-white hover:text-gray-200);
  }
}
</style>
