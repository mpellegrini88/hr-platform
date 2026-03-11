<template>
  <Transition name="fade">
    <div v-if="toastVisible"
      :class="['fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white text-sm shadow-lg z-50',
        toastType === 'success' ? 'bg-emerald-500' :
        toastType === 'error' ? 'bg-red-500' : 'bg-blue-500'
      ]">
      {{ toastMessage }}
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useToastNotification } from '@/composables/useToastNotification.js'

const { toastMessage, toastVisible, toastType } = useToastNotification()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
