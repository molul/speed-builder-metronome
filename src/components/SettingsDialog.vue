<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useMetronomeStore } from '../stores/useMetronomeStore'
import type { MetronomePreset } from '../assets/types'
import SliderControl from './SliderControl.vue'
import MyButton from './MyButton.vue'
import SelectButtonControl from './SelectButtonControl.vue'
import CheckBoxControl from './CheckboxControl.vue'
import { useDialog } from 'primevue/usedialog'
import SavePresetDialog from './SavePresetDialog.vue' // Import the new component
import ToggleThemeButton from './ToggleThemeButton.vue'

const store = useMetronomeStore()
const presets = reactive<MetronomePreset[]>(
  JSON.parse(window.localStorage.getItem('metronomePresets') || '[]')
)
const dialog = useDialog()

function handleOpenSaveModal() {
  dialog.open(SavePresetDialog, {
    props: {
      header: 'Save Preset',
      modal: true,
      dismissableMask: true,
      style: {
        width: '90vw',
        maxWidth: '24rem'
      }
    }
  })
}

watch(
  presets,
  () => window.localStorage.setItem('metronomePresets', JSON.stringify(presets)),
  { deep: true }
)

const labels = {
  startBpm: 'Start BPM',
  peakBpm: 'Peak BPM',
  endBpm: 'Final BPM'
} as const
type BpmKey = keyof typeof labels
</script>

<template>
  <div class="flex w-full flex-col rounded-lg gap-4 text-sm transition-all">
    <ToggleThemeButton />
    <div class="flex flex-col gap-3">
      <SliderControl
        v-for="key in (Object.keys(labels) as BpmKey[])"
        :key="key"
        :label="labels[key]"
        v-model="store.config[key]"
        :min="40"
        :max="225"
        :step="5"
      />
    </div>

    <div class="flex flex-col gap-4">
      <SliderControl
        label="Bars per cell"
        v-model="store.config.barsPerCell"
        :min="1"
        :max="8"
      />

      <SelectButtonControl
        v-model="store.config.tempoStep"
        label="Increase tempo"
        :options="['bar', 'cell']"
      />

      <CheckBoxControl label="Stop at end" v-model="store.config.stopAtEnd" />
    </div>

    <hr class="border-zinc-300 dark:border-zinc-700" />

    <div class="flex flex-col gap-4 w-full">
      <MyButton
        icon="solar:diskette-linear"
        :full-width="true"
        label="Save"
        @click="handleOpenSaveModal"
      />

      <MyButton
        icon="solar:refresh-linear"
        :full-width="true"
        severity="secondary"
        label="Reset"
        @click="store.reset()"
      />
    </div>
  </div>
</template>
