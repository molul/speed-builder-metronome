<script setup lang="ts">
import { reactive, watch, type Ref } from "vue";
import type { MetronomeConfig, MetronomePreset } from "../assets/types";
import TempoVariables from "./TempoVariables.vue";
import Button from "./Button.vue";
import Label from "./Label.vue";

interface Props {
  isRunning: Ref<boolean>;
}
const props = defineProps<Props>();
const model = defineModel<MetronomeConfig>();

const presets = reactive<MetronomePreset[]>(
  JSON.parse(localStorage.getItem("metronomePresets") || "[]")
);

function bump(key: keyof MetronomeConfig, delta: number) {
  if (model.value && typeof model.value[key] === "number") {
    const currentValue = model.value[key] as number;
    (model.value[key] as number) = Math.min(
      200,
      Math.max(40, currentValue + delta)
    );
  }
}

function saveConfig() {
  localStorage.setItem("metronomeConfig", JSON.stringify(model.value));
  alert("Configuración guardada.");
}

function savePreset() {
  const name = prompt("Nombre del preset:");
  if (!name) return;
  const preset: MetronomePreset = {
    startBpm: model.value?.startBpm ?? 100,
    maxBpm: model.value?.maxBpm ?? 140,
    endBpm: model.value?.endBpm ?? 115,
    stopAtEnd: model.value?.stopAtEnd ?? false,
    barsPerCell: model.value?.barsPerCell ?? 1,
    name,
  };
  presets.push(preset);
  localStorage.setItem("metronomePresets", JSON.stringify(presets));
}

function loadPreset(p: MetronomePreset | undefined) {
  if (!p || !model.value) return;
  model.value.startBpm = p.startBpm;
  model.value.maxBpm = p.maxBpm;
  model.value.endBpm = p.endBpm;
  model.value.stopAtEnd = p.stopAtEnd;
  model.value.barsPerCell = p.barsPerCell;
}

watch(
  presets,
  () => localStorage.setItem("metronomePresets", JSON.stringify(presets)),
  { deep: true }
);
</script>

<template>
  <div
    v-if="model"
    class="flex w-full flex-col rounded-lg p-3 gap-4 text-sm absolute top-12 left-0 z-50 bg-gray-600"
  >
    <TempoVariables :model="model" @bump="(key, delta) => bump(key, delta)" />
    <hr />
    <div class="flex gap-3 flex-wrap items-center rounded">
      <div class="flex gap-2 justify-between w-full items-center">
        <Label label="Bars per cell" />
        <input
          type="number"
          v-model.number="model.barsPerCell"
          class="border w-20 px-1 py-2 rounded-md"
        />
      </div>
      <label class="flex gap-2 items-center py-2">
        <input type="checkbox" v-model="model.stopAtEnd" />
        <Label label="Stop at end" />
      </label>
    </div>
    <hr />
    <div class="flex flex-col lg:flex-row flex-wrap gap-3 w-full">
      <Button label="Save default" @click="saveConfig" />
      <Button label="Save preset" @click="savePreset" />
      <div class="flex gap-2 items-center justify-between">
        <Label label="Load preset" />
        <select
          class="font-bold rounded-md py-2 bg-white text-black min-w-[200px]"
          @change="
            loadPreset(
              presets[($event.target as HTMLSelectElement)?.selectedIndex - 1]
            )
          "
        >
          <option disabled selected>-</option>
          <option v-for="p in presets" :key="`preset-${p.name}`">
            {{ p.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
