<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm z-50">
    <div class="flex flex-col items-center gap-3">
      <!-- Spinner -->
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-4 border-gray-100"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
      </div>
      
      <!-- Message -->
      <p class="text-sm font-medium text-white">{{ message }}</p>
      
      <!-- Optional Sub-message -->
      <p v-if="submessage" class="text-xs text-gray-300">{{ submessage }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Caricamento...'
  },
  submessage: {
    type: String,
    default: null
  }
})
</script>
