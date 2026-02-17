<script setup lang="ts">
import Label from './Label.vue'
interface Props {
  label: string
  options: string[]
}

const props = defineProps<Props>()
const model = defineModel<string>()
</script>

<template>
  <div class="flex gap-2 items-center justify-between w-full">
    <Label :label="props.label" class="w-30 text-left" />
    <SelectButton v-model="model" :options="props.options" class="!rounded-lg">
      <template #option="{ option }">
        <span
          :class="[
            'text-sm font-bold',
            option === model ? 'text-white' : 'text-zinc-400'
          ]"
          >Every {{ option }}</span
        >
      </template>
    </SelectButton>
  </div>
</template>
