<script lang="ts" setup>
import Layout from "./layout.vue";
import type { LayoutProps } from "./types";

const props = defineProps<LayoutProps>();
</script>

<template>
  <Layout :prose="props.prose" :kind="props.kind" :code="props.code" columns="1fr 1fr">
    <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>
  </Layout>
</template>
