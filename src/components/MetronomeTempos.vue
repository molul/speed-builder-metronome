<script setup lang="ts">
import { useMetronomeStore } from '../stores/useMetronomeStore'

defineProps<{ height: number }>()
const store = useMetronomeStore()
</script>

<template>
  <div class="flex flex-col select-none z-10 -translate-x-[2px]">
    <div
      v-for="r in store.rows +1"
      :key="r"
      class="text-[11px] text-white flex items-end justify-end pr-0.5 border-b-0 border-zinc-500 relative  font-semibold leading-none"
      :style="{
        width: '30px',
        //width: store.temposColumnWidth + 'px',
        height: height / store.rows + 'px'
      }"
    >
      <div class="absolute top-0 left-0 size-full flex">
        <div
          v-if="store.rowToBpm(r-1) === store.config.startBpm"
          class=" bg-green-400 size-full"
        >
          &nbsp;
        </div>
        <div
          v-if="store.rowToBpm(r-1) === store.config.maxBpm"
          class=" bg-red-400 size-full"
        >
          &nbsp;
        </div>
        <div
          v-if="store.rowToBpm(r-1) === store.config.endBpm"
          class=" bg-yellow-400 size-full"
        >
          &nbsp;
        </div>
      </div>
      <span
        :class="[
          [store.config.startBpm, store.config.maxBpm, store.config.endBpm].includes(
            store.rowToBpm(r-1)
          )
            ? 'text-zinc-900'
            : '',
          'z-30'
        ]"
        >{{ store.rowToBpm(r) +5 }}</span
      >
    </div>
  </div>
</template>
