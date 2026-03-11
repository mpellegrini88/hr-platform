<template>
  <Transition name="toast">
    <div v-if="store.toast.show"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border"
      :class="store.toast.type === 'success' ? 'bg-white text-emerald-700 border-emerald-200' : 'bg-white text-red-700 border-red-200'">
      <span>{{ store.toast.type === 'success' ? '✓' : '✗' }}</span>
      {{ store.toast.msg }}
    </div>
  </Transition>
</template>

<script setup>
import { useHrStore } from '@/stores/hrStore.js'
const store = useHrStore()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>
