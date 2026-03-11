<template>
  <div class="flex items-center justify-center">
    <div v-if="value != null" :class="['w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold', colorClass]">{{ value }}</div>
    <span v-else class="text-gray-200 text-sm">—</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ value: Number, inverted: Boolean })
const colorClass = computed(() => {
  if (props.value == null) return ''
  if (props.inverted) return props.value >= 4 ? 'bg-red-100 text-red-700' : props.value >= 3 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
  return props.value >= 4 ? 'bg-emerald-100 text-emerald-700' : props.value >= 3 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
})
</script>
