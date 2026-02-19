<script setup lang="ts">
import MetronomeSection from './MetronomeSection.vue'
import { useMetronomeEngine } from '../composables/useMetronomeEngine'
import { useMetronomeStore } from '../stores/useMetronomeStore'
import MyButton from './MyButton.vue'
import Header from './Header.vue'
import BeatIndicator from './BeatIndicator.vue'
import Footer from './Footer.vue'
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'

const installPrompt = ref<any>(null)

const store = useMetronomeStore()
const engine = useMetronomeEngine()

// This will be used for showing the "install for offline use" banner
onMounted(() => {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault()
    installPrompt.value = e
  })
})

// ----------------------------------------
// start
// ----------------------------------------
function start() {
  store.isRunning = true
  engine.start(
    store.config.points,
    store.config.stopAtEnd,
    store.config.barsPerCell,
    store.config.tempoStep
  )
}

// ----------------------------------------
// stop
// ----------------------------------------
function stop() {
  engine.stop()
  store.isRunning = false
}

// ----------------------------------------
// handleInstall
// ----------------------------------------
async function handleInstall() {
  if (!installPrompt.value) return

  // Show the native install prompt
  installPrompt.value.prompt()

  // Wait for the user to respond to the prompt
  const { outcome } = await installPrompt.value.userChoice

  if (outcome === 'accepted') {
    console.log('User installed the PWA')
  }

  installPrompt.value = null
}
</script>

<template>
  <div
    class="size-full lg:h-auto mx-auto lg:rounded-lg flex flex-col gap-3 relative p-0 lg:border border-zinc-700 shadow-md"
  >
    <!-- <InstallPrompt /> -->

    <div
      v-if="installPrompt"
      class="flex items-center justify-between p-3 rounded-t-lg bg-zinc-800 border-b border-zinc-700"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-blue-500/10 rounded-lg">
          <Icon icon="solar:download-square-bold" class="text-blue-400 size-6" />
        </div>
        <span class="text-sm font-semibold text-zinc-200">Install for offline use</span>
      </div>

      <MyButton label="Install" @click="handleInstall" class="!py-1" />
    </div>

    <Header />

    <div class="flex flex-col gap-2 w-full">
      <BeatIndicator />

      <MetronomeSection :cols="16" :rows="37" :playhead-bar="store.visualBar" class="" />

      <div class="flex gap-3 justify-center items-center px-3">
        <MyButton
          v-if="!store.isRunning"
          icon="solar:play-bold"
          size="big"
          shape="rounded"
          @click="start"
        />
        <MyButton
          v-if="store.isRunning"
          icon="solar:stop-bold"
          severity="danger"
          shape="rounded"
          size="big"
          @click="stop"
        />
      </div>
    </div>

    <Footer />
  </div>
</template>
