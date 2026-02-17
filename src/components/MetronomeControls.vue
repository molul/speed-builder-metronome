<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useMetronomeStore } from '../stores/useMetronomeStore'
import type { MetronomePreset } from '../assets/types'
import SliderControl from './SliderControl.vue'
import MyButton from './MyButton.vue'
import SelectButtonControl from './SelectButtonControl.vue'
import CheckBoxControl from './CheckboxControl.vue'
import type { SelectChangeEvent } from 'primevue/select'

const store = useMetronomeStore()
const presets = reactive<MetronomePreset[]>(
  JSON.parse(window.localStorage.getItem('metronomePresets') || '[]')
)

function saveConfig() {
  window.localStorage.setItem('metronomeConfig', JSON.stringify(store.config))
  alert('Configuración guardada.')
}

function handleLoadDefault() {
  const saved = window.localStorage.getItem('metronomeConfig')
  if (!saved) {
    alert('No hay configuración predeterminada guardada.')
    return
  }
  store.loadPreset(JSON.parse(saved))
}

function savePreset() {
  const name = prompt('Nombre del preset:')
  if (!name) return
  const preset: MetronomePreset = {
    ...store.config,
    name,
    points: JSON.parse(JSON.stringify(store.config.points))
  }
  presets.push(preset)
  window.localStorage.setItem('metronomePresets', JSON.stringify(presets))
}

function handlePresetChange(event: SelectChangeEvent) {
  store.loadPreset(event.value)
}

watch(
  presets,
  () => window.localStorage.setItem('metronomePresets', JSON.stringify(presets)),
  { deep: true }
)

const labels = {
  startBpm: 'Start BPM',
  maxBpm: 'Max BPM',
  endBpm: 'Final BPM'
} as const
type BpmKey = keyof typeof labels
</script>

<template>
  <div class="flex w-full flex-col rounded-lg gap-4 text-sm transition-all">
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

    <hr class="border-zinc-500" />

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

    <hr class="border-zinc-500" />

    <div class="flex flex-col gap-4 w-full">
      <div class="flex gap-4">
        <MyButton
          icon="solar:diskette-linear"
          label="Save default"
          @click="saveConfig"
          class="flex-1"
        />
        <MyButton
          icon="solar:restart-linear"
          label="Load default"
          @click="handleLoadDefault"
          class="flex-1"
        />
      </div>

      <div class="flex gap-4">
        <MyButton
          icon="solar:diskette-linear"
          :full-width="true"
          label="Save new"
          @click="savePreset"
        />
        <Select
          :options="presets"
          option-label="name"
          fluid
          placeholder="Load preset"
          @change="handlePresetChange"
        />
      </div>
    </div>
  </div>
</template>
