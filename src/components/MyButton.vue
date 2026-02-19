<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  label?: string
  icon?: string
  fullWidth?: boolean
  size?: 'normal' | 'big'
  severity?: string
  type?: 'primary' | 'secondary' | 'text' | 'alert'
  shape?: 'rounded' | 'square'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fullWidth: false,
  size: 'normal',
  severity: 'primary',
  shape: 'square',
  disabled: false
})
</script>

<template>
  <Button
    :severity="props.severity"
    :label="props.label"
    :disabled="props.disabled"
    :fluid="props.fullWidth"
    :class="[
      '!text-sm',
      { '!rounded-full !aspect-square': shape === 'rounded' },
      { '!rounded-md': shape === 'square' && props.size === 'normal' },
      { '!size-15 text-3xl !rounded-xl': props.size === 'big' }
    ]"
    :pt="{
      root: 'bg-blue-600 justify-center items-center hover:bg-blue-500 active:bg-blue-600 flex gap-2.5 !text-xs',
      label: '!text-lg !font-semibold !text-sm'
    }"
  >
    <template #icon>
      <Icon
        v-if="props.icon"
        :icon="props.icon"
        :class="['', props.size === 'big' ? 'size-7 ' : 'size-5']"
      />
    </template>
  </Button>
</template>
