<template>
  <div class="slidev-layout grid grid-cols-none">
    <CornerCurves class="absolute bottom-0 right-0 transform scale-x--100" />
    <div class="content grid my-auto z-10 relative">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.slidev-layout .content {
  row-gap: var(--s-up4);
  height: 100%;

  align-content: start;
}
</style>