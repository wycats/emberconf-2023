<template>
  <div class="slidev-layout">
    <header>
      <slot name="default" />
    </header>
    <div class="grid grid-cols-2 gap-16">
      <div class="prose">
        <slot name="a"></slot>
      </div>
      <div class="prose">
        <slot name="b"></slot>
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout>div>.prose {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: min-content auto;
  row-gap: var(--s-base);
}
</style>