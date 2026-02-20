<script setup lang="ts">
import { ref, inject } from 'vue'
import { useMetronomeStore } from '../stores/useMetronomeStore'
import { useDialog } from 'primevue/usedialog'
import MyButton from './MyButton.vue'
import ConfirmDialog from './ConfirmDialog.vue'

const store = useMetronomeStore()
const dialog = useDialog()
const dialogRef = inject('dialogRef') as any

const presets = ref<any[]>(
  JSON.parse(window.localStorage.getItem('metronomePresets') || '[]')
)

const saveToStorage = () => {
  window.localStorage.setItem('metronomePresets', JSON.stringify(presets.value))
}

const handleLoad = (preset: any) => {
  store.loadPreset(preset)
  dialogRef.value.close()
}

const handleDelete = (index: number) => {
  const presetName = presets.value[index].name

  dialog.open(ConfirmDialog, {
    props: {
      header: 'Delete Preset',
      modal: true,
      dismissableMask: true,
      style: {
        width: '90vw',
        maxWidth: '24rem'
      }
    },
    data: {
      message: `Are you sure you want to delete <span class="dark:text-white font-bold">"${presetName}"</span>? This action cannot be undone.`,
      confirmLabel: 'Delete Preset',
      confirmSeverity: 'danger'
    },
    onClose: opt => {
      if (opt?.data?.confirmed) {
        presets.value.splice(index, 1)
        saveToStorage()
      }
    }
  })
}
</script>

<template>
  <div class="flex flex-col gap-4 max-h-[60vh]">
    <div
      v-if="presets.length === 0"
      class="text-sm text-center py-8 text-zinc-600 dark:text-zinc-500 italic"
    >
      No saved presets found.
    </div>

    <div v-else class="flex flex-col gap-2 overflow-y-auto pr-1">
      <div
        v-for="(p, i) in presets"
        :key="i"
        class="flex items-center justify-between px-4 py-3 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <span class="font-medium text-zinc-900 dark:text-white truncate mr-4 text-sm">{{
          p.name
        }}</span>

        <div class="flex gap-2 flex-shrink-0">
          <MyButton
            icon="solar:folder-open-outline"
            class="!py-1.5"
            @click="handleLoad(p)"
          />
          <MyButton
            icon="solar:trash-bin-minimalistic-linear"
            severity="danger"
            class="!py-1.5"
            @click="handleDelete(i)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
