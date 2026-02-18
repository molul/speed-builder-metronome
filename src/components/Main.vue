<script setup lang="ts">
import MetronomeSection from './MetronomeSection.vue'
import { useMetronomeEngine } from '../composables/useMetronomeEngine'
import { useMetronomeStore } from '../stores/useMetronomeStore'
import MyButton from './MyButton.vue'
import Header from './Header.vue'
import BeatIndicator from './BeatIndicator.vue'
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'

const installPrompt = ref<any>(null)

const store = useMetronomeStore()
const engine = useMetronomeEngine()

function start() {
  store.isRunning = true
  engine.start(
    store.config.points,
    store.config.stopAtEnd,
    store.config.barsPerCell,
    store.config.tempoStep
  )
}

function stop() {
  engine.stop()
  store.isRunning = false
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', e => {
    // Prevent the default mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later
    installPrompt.value = e
  })
})

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
    class="size-full lg:h-auto mx-auto lg:rounded-lg flex flex-col gap-0 relative p-0 lg:border border-zinc-700 shadow-md"
  >
    <div
      v-if="installPrompt"
      class="flex items-center justify-between p-3 rounded-t-lg bg-zinc-800 border-b border-zinc-700"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-blue-500/10 rounded-lg">
          <Icon icon="solar:download-square-bold" class="text-blue-400 size-5" />
        </div>
        <span class="text-sm font-semibold text-zinc-200">Install for offline use</span>
      </div>

      <MyButton label="Install" @click="handleInstall" class="!py-1" />
    </div>

    <Header />

    <div class="flex flex-col gap-3 w-full">
      <BeatIndicator />

      <MetronomeSection :cols="16" :rows="37" :playhead-bar="store.visualBar" />

      <div class="flex gap-2 justify-center items-center px-3">
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

      <div class="text-xs text-center font-medium p-4 pt-0">
        Developed by
        <a
          href="https://www.luismorcilloluque.com"
          rel="noopener noreferrer"
          target="_blank"
          class="text-blue-300 hover:underline"
        >
          Luis Morcillo Luque
        </a>
        with Vue 3 © 2026
      </div>
    </div>
  </div>
</template>
