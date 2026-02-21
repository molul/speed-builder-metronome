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
    class="size-full text-sm text-zinc-900 dark:text-zinc-100 transition-colors duration-500"
  >
    <div
      class="size-full sm:max-w-sm sm:m-auto flex sm:rounded-lg shadow-md overflow-y-auto"
    >
      <div
        class="size-full sm:rounded-lg flex flex-col gap-0 relative p-0 sm:border border-zinc-300 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900"
      >
        <div
          v-if="installPrompt"
          class="flex items-center justify-between p-3 bg-blue-200 dark:bg-zinc-800 border-b border-transparent dark:border-zinc-700"
        >
          <div class="flex items-center gap-2.5">
            <div class="p-0 bg-white rounded-lg">
              <Icon icon="solar:download-square-bold" class="text-blue-400 size-8" />
            </div>
            <span class="text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >Install for offline use</span
            >
          </div>

          <MyButton label="Install" @click="handleInstall" class="!py-1" />
        </div>

        <Header />

        <div class="flex flex-col gap-2 w-full py-3">
          <MetronomeSection
            :cols="16"
            :rows="37"
            :playhead-bar="store.visualBar"
            class=""
          />

          <div class="flex gap-3 justify-between items-center px-4">
            <MyButton
              v-if="!store.isRunning"
              icon="solar:play-bold"
              size="big"
              @click="start"
            />
            <MyButton
              v-if="store.isRunning"
              icon="solar:stop-bold"
              severity="danger"
              size="big"
              @click="stop"
            />

            <BeatIndicator />
          </div>

          <Footer />
        </div>
      </div>
    </div>
  </div>
</template>
