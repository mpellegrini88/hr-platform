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
      <div class="flex items-center gap-2">
        <button 
          @click="openSyncInfo"
          :class="[
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition cursor-pointer',
            store.backendAvailable 
              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
              : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
          ]"
          :title="syncTooltip">
          <span :class="['w-2 h-2 rounded-full', store.backendAvailable ? 'bg-emerald-400' : 'bg-amber-400']"></span>
          {{ store.backendAvailable ? 'Sincronizzato' : 'Locale' }}
        </button>
        <div class="text-xs text-gray-400">{{ today }}</div>
      </div>
    </div>
  </header>

  <!-- Sync Info Modal -->
  <Teleport to="body">
    <div v-if="showSyncModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black/50" @click="showSyncModal = false"></div>
      <div class="relative bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6 z-10">
        <h3 class="text-lg font-bold text-gray-900 mb-4">🔄 Stato Sincronizzazione</h3>
        
        <div class="space-y-4">
          <!-- Backend Status -->
          <div class="p-3 rounded-lg" :class="store.backendAvailable ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'">
            <div class="flex items-center gap-2 mb-1">
              <span :class="['w-2 h-2 rounded-full', store.backendAvailable ? 'bg-emerald-400' : 'bg-amber-400']"></span>
              <span class="font-semibold" :class="store.backendAvailable ? 'text-emerald-700' : 'text-amber-700'">
                {{ store.backendAvailable ? 'Server Connesso' : 'Offline - Modo Locale' }}
              </span>
            </div>
            <p class="text-xs" :class="store.backendAvailable ? 'text-emerald-600' : 'text-amber-600'">
              {{ syncStatusText }}
            </p>
          </div>

          <!-- Sync Times -->
          <div class="space-y-2 text-sm">
            <div v-if="store.backendAvailable" class="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span class="text-gray-600">Server sync:</span>
              <span class="font-mono text-gray-900">{{ lastBackendSyncText }}</span>
            </div>
            <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span class="text-gray-600">Cache locale:</span>
              <span class="font-mono text-gray-900">{{ lastLocalSyncText }}</span>
            </div>
          </div>

          <!-- Data Summary -->
          <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-xs font-semibold text-blue-700 mb-2">📊 Dati Caricati</p>
            <div class="grid grid-cols-2 gap-2 text-xs text-blue-600">
              <div>{{ store.employees.length }} dipendenti</div>
              <div>{{ store.colloqui.length }} colloqui</div>
              <div>{{ store.ferie.length }} ferie</div>
              <div>{{ store.dimissioni.length }} uscite</div>
              <div>{{ store.colloquiPC.length }} P&C</div>
              <div>{{ store.valutazioni360.length }} valutazioni</div>
            </div>
          </div>

          <!-- Info Text -->
          <p class="text-xs text-gray-500 mb-4">
            ℹ️ I dati si sincronizzano automaticamente ogni 30 secondi quando il server è disponibile.
            In offline, rimangono salvati nella cache locale.
          </p>

          <!-- Close Button -->
          <button 
            @click="showSyncModal = false"
            class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHrStore } from '@/stores/hrStore.js'
import { useSyncStatus } from '@/composables/useSyncStatus.js'

const store = useHrStore()
const route = useRoute()
const syncStatus = useSyncStatus()
const showSyncModal = ref(false)

const titleMap = {
  '/dashboard': 'Dashboard',
  '/anagrafica': 'Anagrafica Dipendenti',
  '/onboarding': 'Onboarding & Periodo di Prova',
  '/people-culture': 'Colloqui People & Culture',
  '/people-culture-analytics': 'P&C Analytics',
  '/valutazione-prova': 'Valutazione Periodo di Prova',
  '/contratti-termine': 'Contratti a Termine',
  '/uscite': 'Gestione Uscite',
  '/ferie': 'Ferie & Malattie',
  '/analytics': 'Analytics & Report',
}
const title = computed(() => titleMap[route.path] || 'MOVE HR')
const today = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const lastBackendSyncText = computed(() => syncStatus.getTimeSinceSync())
const lastLocalSyncText = computed(() => syncStatus.getTimeSinceLocalSync())

const syncStatusText = computed(() => {
  if (store.backendAvailable) {
    return `Ultimo sync: ${lastBackendSyncText.value}`
  } else {
    return 'I dati rimangono salvati in cache locale'
  }
})

const syncTooltip = computed(() => {
  if (store.backendAvailable) {
    return `✅ Connesso - Ultimo sync: ${lastBackendSyncText.value} - Clicca per vedi dettagli`
  } else {
    return `⚠️ Offline - Dati salvati localmente - Clicca per vedi dettagli`
  }
})

const openSyncInfo = () => {
  showSyncModal.value = true
}
</script>
