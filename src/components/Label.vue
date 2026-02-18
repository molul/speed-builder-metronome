<script setup lang="ts">
interface Props {
  label: string
}

const props = defineProps<Props>()
</script>

<template>
  <span class="font-semibold text-white h-9">{{ props.label }}</span>
</template>
