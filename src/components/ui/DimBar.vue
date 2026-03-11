<template>
  <div class="flex items-center gap-3">
    <span class="text-xs text-gray-500 w-44 leading-tight truncate">{{ label }}</span>
    <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div class="h-full rounded-full transition-all duration-500"
        :style="{ width: value ? (value/5*100)+'%' : '0%', background: barColor }">
      </div>
    </div>
    <span class="text-xs font-bold w-8 text-right" :style="{ color: barColor }">{{ value ?? '—' }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ label: String, value: Number, inverted: { type: Boolean, default: false } })
const barColor = computed(() => {
  if (!props.value) return '#d1d5db'
  if (props.inverted) return props.value >= 4 ? '#ef4444' : props.value >= 3 ? '#f59e0b' : '#10b981'
  return props.value >= 4 ? '#10b981' : props.value >= 3 ? '#f59e0b' : '#ef4444'
})
</script>
