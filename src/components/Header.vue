<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MetronomeControls from './MetronomeControls.vue'
import { Icon } from '@iconify/vue'
import { useDialog } from 'primevue/usedialog'

const menuVisible = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (
    menuVisible.value &&
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    menuVisible.value = false
  }
}

onMounted(() => window.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => window.removeEventListener('mousedown', handleClickOutside))

const dialog = useDialog()

const handleShowMenu = () => {
  dialog.open(MetronomeControls, {
    props: {
      dismissableMask: true,
      header: 'Settings',
      modal: true
    }
  })
}
</script>

<template>
  <div
    ref="containerRef"
    class="flex flex-col gap-3 p-4 pl-2.5 relative z-50 bg-zinc-800 rounded-t-lg"
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:metronome" class="size-8" />
        <span class="text-xl lg:text-3xl font-bold">SPEED BUILDER</span>
      </div>

      <div class="p-2 rounded-md cursor-pointer hover:bg-zinc-700 transition-colors">
        <Icon
          :icon="menuVisible ? 'majesticons:close-line' : 'solar:hamburger-menu-linear'"
          class="size-8"
          @click="handleShowMenu"
        />
      </div>
    </div>

    <MetronomeControls v-if="menuVisible" />
  </div>
</template>
