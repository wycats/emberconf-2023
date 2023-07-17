<script setup lang="ts">
import { useAttrs } from "vue";

const attrs = useAttrs() as { media: string };
</script>

<template>
  <div class="slidev-layout grid grid-cols-2">
    <header class="grid-column=1..2">
      <slot name="default" />
    </header>
    <div class="grid grid-cols-2" :class="$attrs.reverse ? 'gap-16' : 'gap-8'">
      <div class="grid-column=1 grid gap-8">
        <slot name="text" />
      </div>
      <figure class="relative flex flex-col justify-center grid-column=2">
        <AsGraphic type="zigzag" absolute bottom-4 right-0 />
        <img :src="attrs.media" class="rounded-lg shadow-lg object-cover z-10" />
        <figcaption class="mt-2 text-xs w-full">
          {{ $attrs.caption }}
        </figcaption>
      </figure>
    </div>
  </div>
</template>
