<template>
  <div>
    <div class="flex items-center gap-3 mb-3">
      <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">{{ title }}</span>
      <div class="flex-1 h-px bg-gray-100"></div>
    </div>
    <slot />
  </div>
</template>
<script setup>
defineProps({ title: String })
</script>
