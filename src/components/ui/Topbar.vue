<template>
  <header class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
    <h1 class="text-lg font-semibold text-gray-900">{{ title }}</h1>
    <div class="flex items-center gap-3">
      <!-- Alerts badge -->
      <div v-if="store.kpiScadenze.fu1Scaduti > 0" class="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg text-xs font-medium text-red-700">
        <span>⚠</span> {{ store.kpiScadenze.fu1Scaduti }} FU1 scaduti
      </div>
      <div v-if="store.kpiScadenze.burnoutUrgenti > 0" class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg text-xs font-medium text-amber-700">
        <span>🔴</span> {{ store.kpiScadenze.burnoutUrgenti }} burnout alto
      </div>
      <div class="text-xs text-gray-400">{{ today }}</div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHrStore } from '@/stores/hrStore.js'

const store = useHrStore()
const route = useRoute()
const titleMap = {
  '/dashboard': 'Dashboard',
  '/anagrafica': 'Anagrafica Dipendenti',
  '/onboarding': 'Onboarding & Periodo di Prova',
  '/people-culture': 'Colloqui People & Culture',
  '/ferie': 'Ferie & Malattie',
  '/analytics': 'Analytics & Report',
}
const title = computed(() => titleMap[route.path] || 'MOVE HR')
const today = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
</script>
