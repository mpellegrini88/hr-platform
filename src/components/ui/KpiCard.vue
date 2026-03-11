<template>
  <div :class="['card p-4 flex flex-col gap-1', alert ? 'ring-1 ring-red-200' : '']">
    <div class="flex items-center justify-between">
      <span class="text-lg leading-none">{{ icon }}</span>
      <span v-if="alert" class="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
    </div>
    <div :class="['text-3xl font-bold tracking-tight mt-1', colorMap[color]]">{{ value }}</div>
    <div class="text-xs text-gray-400 font-medium leading-tight">{{ label }}</div>
  </div>
</template>

<script setup>
defineProps({ label: String, value: [Number, String], icon: String, color: { type: String, default: 'indigo' }, alert: Boolean })
const colorMap = { indigo:'text-primary-600', blue:'text-blue-600', red:'text-red-600', amber:'text-amber-600', emerald:'text-emerald-600', purple:'text-purple-600' }
</script>
