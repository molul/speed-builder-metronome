<script setup lang="ts">
interface Props {
  label: string
}

const props = defineProps<Props>()
</script>

<template>
  <span class="font-semibold h-9 flex items-center">{{ props.label }}</span>
</template>
