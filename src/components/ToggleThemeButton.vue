<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MyButton from './MyButton.vue'

const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// Sync with saved preference on load
onMounted(() => {
  isDark.value =
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark'
  if (isDark.value) document.documentElement.classList.add('dark')
})
</script>

<template>
  <MyButton
    @click="toggleTheme"
    class="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 transition-colors border border-zinc-300 dark:border-zinc-700 hover:scale-105 active:scale-95"
    :full-width="true"
    label="Toggle Theme"
    aria-label="Toggle Theme"
    :icon="isDark ? 'solar:moon-bold' : 'solar:sun-bold'"
  />
</template>
