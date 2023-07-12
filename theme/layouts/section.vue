<template>
  <div class="slidev-layout section grid">
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
