<script setup lang="ts">
import { computed } from 'vue'
import { useMetronomeStore } from '../stores/useMetronomeStore'

const store = useMetronomeStore()

const currentBeatInBar = computed(() => {
  return store.beatInBar === 0 ? 3 : store.beatInBar - 1
})
</script>

<template>
  <div class="flex gap-2 h-3 w-full px-4">
    <div
      v-for="i in 4"
      :key="`beat-${i}`"
      :class="[
        'w-full border rounded-full transition-colors duration-300',
        {
          'bg-green-400 border-green-500': currentBeatInBar === i - 1,
          'bg-zinc-700 border-zinc-600': currentBeatInBar !== i - 1
        }
      ]"
    >
      &nbsp;
    </div>
  </div>
</template>
