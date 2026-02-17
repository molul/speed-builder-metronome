<script setup lang="ts">
import Label from './Label.vue'
interface Props {
  label: string
  min: number
  max: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  step: 1
})
const model = defineModel<number>()
</script>

<template>
  <div class="flex gap-2 items-center justify-between w-full">
    <Label :label="props.label" class="w-30 text-left" />
    <div class="flex items-center gap-4 flex-1">
      <Slider
        v-model="model"
        :step="props.step"
        :min="props.min"
        :max="props.max"
        class="w-full"
      />
      <span class="w-10 text-right">{{ model }}</span>
    </div>
  </div>
</template>
