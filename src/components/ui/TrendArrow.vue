<template>
  <div class="flex flex-col items-center gap-0.5">
    <span v-if="prev != null && curr != null" class="text-lg font-bold" :style="{ color: arrowColor }">{{ arrow }}</span>
    <span v-if="curr != null" class="text-xs font-semibold" :style="{ color: arrowColor }">{{ curr }}</span>
    <span v-if="prev != null" class="text-xs text-gray-300">{{ prev }}</span>
    <span v-if="prev == null || curr == null" class="text-gray-300 text-xs">—</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ prev: Number, curr: Number, inverted: Boolean })
const arrow = computed(() => {
  if (props.prev == null || props.curr == null) return '—'
  if (props.curr > props.prev) return '↑'
  if (props.curr < props.prev) return '↓'
  return '→'
})
const arrowColor = computed(() => {
  if (props.prev == null || props.curr == null) return '#d1d5db'
  const better = props.curr > props.prev
  const worse  = props.curr < props.prev
  if (props.inverted) return worse ? '#10b981' : better ? '#ef4444' : '#9ca3af'
  return better ? '#10b981' : worse ? '#ef4444' : '#9ca3af'
})
</script>
