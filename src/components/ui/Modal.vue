<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="emit('close')">
        <div class="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" @click="emit('close')"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full flex flex-col max-h-[90vh]" :style="{ maxWidth: width }">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 class="text-base font-semibold text-gray-900">{{ title }}</h2>
            <button @click="emit('close')" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">✕</button>
          </div>
          <div class="overflow-y-auto scroll-thin flex-1 px-6 py-5">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({ open: Boolean, title: String, width: { type: String, default: '640px' } })
const emit = defineEmits(['close'])
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative, .modal-leave-to .relative { transform: scale(.96) translateY(8px); }
</style>
