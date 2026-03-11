<template>
  <div :class="['rounded-lg p-3', highlight ? 'bg-primary-50 border border-primary-100' : 'bg-gray-50']">
    <div class="text-xs text-gray-400 font-medium mb-0.5">{{ label }}</div>
    <div :class="['text-sm font-semibold', highlight ? 'text-primary-700' : 'text-gray-800']">{{ value || '—' }}</div>
  </div>
</template>
<script setup>
defineProps({ label: String, value: String, highlight: Boolean })
</script>
