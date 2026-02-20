<script setup lang="ts">
import Main from './components/Main.vue'
import DynamicDialog from 'primevue/dynamicdialog'

// Sync with saved preference on load
onMounted(() => {
  isDark.value =
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark'
  if (isDark.value) document.documentElement.classList.add('dark')
})
</script>

<template>
  <Main />
  <DynamicDialog />
</template>

<style scoped></style>
