<script setup lang="ts">
import { ref, inject } from 'vue'
import { useMetronomeStore } from '../stores/useMetronomeStore'
import { useDialog } from 'primevue/usedialog'
import InputText from 'primevue/inputtext'
import ConfirmDialog from './ConfirmDialog.vue'
import MyButton from './MyButton.vue'

const store = useMetronomeStore()
const dialog = useDialog()
const dialogRef = inject('dialogRef') as any

const newName = ref('')
const presets = ref<any[]>(
  JSON.parse(window.localStorage.getItem('metronomePresets') || '[]')
)

const closeDialog = () => dialogRef.value.close()

const handleSaveNew = () => {
  if (!newName.value.trim()) return

  const newPreset = {
    ...store.config,
    name: newName.value,
    points: JSON.parse(JSON.stringify(store.config.points))
  }

  presets.value.push(newPreset)
  saveToStorage()
  closeDialog()
}

const openConfirmOverwrite = (preset: any, index: number) => {
  dialog.open(ConfirmDialog, {
    props: {
      header: 'Confirm Overwrite',
      modal: true,
      dismissableMask: true,
      style: {
        width: '90vw',
        maxWidth: '24rem'
      }
    },
    data: {
      message: `Are you sure you want to overwrite <span class="dark:text-white font-bold">"${preset.name}"</span> with your current settings?`,
      confirmLabel: 'Confirm Overwrite',
      confirmSeverity: 'danger'
    },
    onClose: opt => {
      if (opt?.data?.confirmed) {
        presets.value[index] = {
          ...store.config,
          name: preset.name,
          points: JSON.parse(JSON.stringify(store.config.points))
        }
        saveToStorage()
        closeDialog()
      }
    }
  })
}

const saveToStorage = () => {
  window.localStorage.setItem('metronomePresets', JSON.stringify(presets.value))
}
</script>

<template>
  <div class="flex flex-col gap-6 pt-2">
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >Save New Preset</span
      >
      <div class="flex gap-2">
        <InputText
          v-model="newName"
          placeholder="Enter name..."
          class="flex-1"
          autofocus
        />
        <MyButton label="Save" @click="handleSaveNew" :disabled="!newName.trim()" />
      </div>
    </div>

    <hr class="border-zinc-400" />

    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >Overwrite Existing</span
      >
      <div
        v-if="presets.length === 0"
        class="text-zinc-600 dark:text-zinc-500 italic text-sm py-4 text-center"
      >
        No presets saved yet.
      </div>
      <div class="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
        <button
          v-for="(p, i) in presets"
          :key="i"
          @click="openConfirmOverwrite(p, i)"
          class="text-sm flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors text-left group cursor-pointer"
        >
          <span class="font-medium">{{ p.name }}</span>
          <span
            class="text-xs text-zinc-700 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-300"
          >
            Click to overwrite
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
