<script setup lang="ts">
import Label from './Label.vue'
import Slider from 'primevue/slider'

interface Props {
  label: string
  min: number
  max: number
  step?: number
  externalMin?: number
  externalMax?: number
}

const props = withDefaults(defineProps<Props>(), {
  step: 1
})

const model = defineModel<number>({ required: true })

function handleSlideEnd() {
  if (props.externalMin && model.value <= props.externalMin) {
    model.value = props.externalMin
  }

  if (props.externalMax && model.value >= props.externalMax) {
    model.value = props.externalMax
  }
}
</script>

<template>
  <div class="flex gap-2 items-center justify-between w-full">
    <Label :label="props.label" class="w-30 text-left" />
    <div class="flex items-center gap-4 flex-1">
      <Slider
        ref="sliderRef"
        v-model="model"
        :step="props.step"
        :min="props.min"
        :max="props.max"
        class="w-full"
        @slideend="handleSlideEnd"
      />
      <span
        class="w-10 text-right font-mono"
        :class="{
          'text-orange-500 font-bold':
            (props.externalMin && model < props.externalMin) ||
            (props.externalMax && model > props.externalMax)
        }"
      >
        {{ model }}
      </span>
    </div>
  </div>
</template>
