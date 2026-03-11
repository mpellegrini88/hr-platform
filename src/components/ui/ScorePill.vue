<template>
  <div class="text-center">
    <div :class="['w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold', colorClass]">{{ value ?? '—' }}</div>
    <div class="text-xs text-gray-400 mt-1 leading-tight">{{ label }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ value: Number, label: String, inverted: Boolean })
const colorClass = computed(() => {
  if (!props.value) return 'bg-gray-100 text-gray-400'
  if (props.inverted) return props.value >= 4 ? 'bg-red-100 text-red-700' : props.value >= 3 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
  return props.value >= 4 ? 'bg-emerald-100 text-emerald-700' : props.value >= 3 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
})
</script>
