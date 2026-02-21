<script setup lang="ts">
import { computed } from 'vue'
import { useMetronomeStore, type BeatType } from '../stores/useMetronomeStore'

const store = useMetronomeStore()

const currentBeatInBar = computed(() => {
  // Adjusting for the 1-beat offset you had
  return store.beatInBar === 0 ? store.config.beatsPerBar - 1 : store.beatInBar - 1
})

const getBeatClass = (index: number) => {
  const type = store.config.beatPattern[index]

  // Narrow the type and provide a fallback
  if (!type) return ''

  const isActive = currentBeatInBar.value === index

  const colors: Record<BeatType, string> = {
    high: 'bg-orange-500 border-orange-600',
    low: 'bg-yellow-400 border-yellow-500',
    mute: 'bg-zinc-300 dark:bg-zinc-700 border-zinc-400 dark:border-zinc-800'
  }

  return [
    'w-full h-4 border rounded-[3px] transition-all duration-150 cursor-pointer',
    isActive ? 'scale-y-125 brightness-110 shadow-sm' : 'opacity-80',
    colors[type] // Now TS knows 'type' is a valid key for 'colors'
  ]
}
</script>

<template>
  <div class="flex-1 flex flex-col gap-2 items-end h-15 justify-end">
    <span class="text-4xl font-black font-mono leading-none translate-y-1">
      {{ store.currentBpm }}
    </span>

    <div class="flex gap-2 flex-1 size-full">
      <div
        v-for="i in store.config.beatsPerBar"
        :key="`beat-${i}`"
        :class="getBeatClass(i - 1)"
        @click="store.toggleBeat(i - 1)"
      >
        &nbsp;
      </div>
    </div>
  </div>
</template>
