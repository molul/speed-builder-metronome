<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SettingsDialog from './SettingsDialog.vue'
import { Icon } from '@iconify/vue'
import { useDialog } from 'primevue/usedialog'
import MyButton from './MyButton.vue'
import { useMetronomeStore } from '../stores/useMetronomeStore'
import InfoModal from './InfoModal.vue'
import PresetsDialog from './PresetsDialog.vue'

const menuVisible = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const dialog = useDialog()
const store = useMetronomeStore()

onMounted(() => window.addEventListener('mousedown', handleClickOutside))

onUnmounted(() => window.removeEventListener('mousedown', handleClickOutside))

// ----------------------------------------
// handleClickOutside
// ----------------------------------------
const handleClickOutside = (event: MouseEvent) => {
  if (
    menuVisible.value &&
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    menuVisible.value = false
  }
}

// ----------------------------------------
// handleShowSettingsDialog
// ----------------------------------------
const handleShowSettingsDialog = () => {
  dialog.open(SettingsDialog, {
    props: {
      dismissableMask: true,
      header: 'Settings',
      modal: true
    }
  })
}

// ----------------------------------------
// handleShowInfoModal
// ----------------------------------------
const handleShowInfoModal = () => {
  dialog.open(InfoModal, {
    props: {
      dismissableMask: true,
      header: 'Info',
      modal: true
    }
  })
}

// ----------------------------------------
// handleShowPresetsModal
// ----------------------------------------
const handleShowPresetsModal = () => {
  dialog.open(PresetsDialog, {
    props: {
      dismissableMask: true,
      header: 'Saved Presets',
      modal: true,
      style: {
        width: '90vw',
        maxWidth: '24rem'
      }
    }
  })
}
</script>

<template>
  <div
    ref="containerRef"
    class="flex flex-col gap-3 px-4 py-5 pl-2.5 relative z-50 rounded-t-lg border-b border-zinc-700"
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:metronome" class="size-8" />
        <span class="text-lg font-bold text-left leading-none">
          SPEED TRAINING <br />
          METRONOME
        </span>
      </div>

      <div class="flex gap-2.5">
        <MyButton
          v-tooltip.bottom="'Info'"
          icon="solar:info-circle-linear"
          severity="secondary"
          :disabled="store.isRunning"
          @click="handleShowInfoModal"
        />

        <MyButton
          v-tooltip.bottom="'Presets'"
          icon="solar:library-linear"
          severity="secondary"
          :disabled="store.isRunning"
          @click="handleShowPresetsModal"
        />

        <MyButton
          v-tooltip.bottom="'Settings'"
          icon="solar:settings-linear"
          severity="secondary"
          :disabled="store.isRunning"
          @click="handleShowSettingsDialog"
        />
      </div>
    </div>

    <MetronomeControls v-if="menuVisible" />
  </div>
</template>
