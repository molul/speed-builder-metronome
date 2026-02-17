<script setup lang="ts">
import Label from './Label.vue'
interface Props {
  label: string
}

const props = defineProps<Props>()
const model = defineModel<boolean>()
</script>

<template>
  <div class="flex gap-2 items-center justify-between w-full">
    <Label :label="props.label" class="w-30 text-left" />
    <Checkbox v-model="model" binary />
  </div>
</template>
