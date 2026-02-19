<script setup lang="ts">
import { useMetronomeStore } from '../stores/useMetronomeStore'

defineProps<{ height: number }>()
const store = useMetronomeStore()

const getRowBgClass = (rowIndex: number) => {
  const bpm = store.rowToBpm(rowIndex)
  const { startBpm, peakBpm, endBpm } = store.config

  if (bpm === startBpm) return 'bg-green-400'
  if (bpm === peakBpm) return 'bg-red-400'
  if (bpm === endBpm) return 'bg-yellow-400'

  return ''
}
</script>

<template>
  <div class="flex flex-col select-none z-10 -translate-x-[2px]">
    <div
      v-for="r in store.rows + 1"
      :key="r"
      class="text-[11px] text-white flex items-center justify-end pr-0.5 relative font-semibold leading-tight"
      :style="{ width: '24px', height: height / store.rows + 'px' }"
    >
      <div class="absolute top-0 left-0 size-full z-0 rounded-l-xs" :class="getRowBgClass(r - 1)" />

      <span :class="['z-30 ', { 'text-zinc-900': getRowBgClass(r - 1) !== '' }]">
        {{ store.rowToBpm(r) + 5 }}
      </span>
    </div>
  </div>
</template>
