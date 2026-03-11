<template>
  <RouterLink :to="to" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-100 group"
    :class="isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'">
    <span class="text-base leading-none">{{ icon }}</span>
    <span class="flex-1">{{ label }}</span>
    <span v-if="badge" class="text-xs font-semibold bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 min-w-[20px] text-center">{{ badge }}</span>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const props = defineProps({ to: String, icon: String, label: String, badge: Number })
const route = useRoute()
const isActive = computed(() => route.path === props.to)
</script>
