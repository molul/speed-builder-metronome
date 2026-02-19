<script setup lang="ts">
import { computed } from 'vue'
import { useMetronomeStore } from '../stores/useMetronomeStore'

const store = useMetronomeStore()

const currentBeatInBar = computed(() => {
  return store.beatInBar === 0 ? 3 : store.beatInBar - 1
})
</script>

<template>
  <div class="flex-1 flex gap-1 flex-col items-end">
    <span class="text-4xl font-bold"> {{ store.currentBpm }} </span>
    <div class="flex gap-2 flex-1 size-full">
      <div
        v-for="i in 4"
        :key="`beat-${i}`"
        :class="[
          'w-full border rounded-full transition-colors duration-300 h-3',
          {
            'bg-green-500 dark:bg-green-400 border-green-700 dark:border-green-500':
              currentBeatInBar === i - 1,
            'bg-zinc-400 dark:bg-zinc-700 border-zinc-500 dark:border-zinc-600':
              currentBeatInBar !== i - 1
          }
        ]"
      >
        &nbsp;
      </div>
    </div>
  </div>
</template>
