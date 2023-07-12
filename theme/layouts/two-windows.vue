<template>
  <div class="slidev-layout">
    <div class="grid grid-cols-2" :class="$attrs.reverse ? 'gap-16' : 'gap-8'">
      <div class="relative">
        <AsGraphic
          type="zigzag"
          class="absolute transform scale-75 -bottom-20 -right-16"
          :class="{ 'left-0': $attrs.reverse }"
        />
        <TheConsole class="rounded-lg shadow-lg object-cover z-10">
          <slot name="a"></slot>
        </TheConsole>
      </div>
      <div class="relative">
        <AsGraphic
          type="zigzag"
          class="absolute transform scale-75 -bottom-20 -right-16"
          :class="{ 'left-0': $attrs.reverse }"
        />
        <TheConsole class="rounded-lg shadow-lg object-cover z-10">
          <slot name="b"></slot>
        </TheConsole>
      </div>
    </div>
  </div>
</template>
