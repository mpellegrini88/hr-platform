<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Topbar />
      <main class="flex-1 overflow-y-auto scroll-thin">
        <RouterView />
      </main>
    </div>
    <Toast />
    <!-- Global Toast Notifications for Auto-Save -->
    <ToastNotification />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Sidebar from '@/components/ui/Sidebar.vue'
import Topbar  from '@/components/ui/Topbar.vue'
import Toast   from '@/components/ui/Toast.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useIndexedDB } from '@/composables/useIndexedDB.js'
import { useBackendAPI } from '@/composables/useBackendAPI.js'
import { usePersistence } from '@/composables/usePersistence.js'

const store = useHrStore()
const idb = useIndexedDB()
const backend = useBackendAPI()
const persistence = usePersistence()

// Load data: backend first, then IndexedDB fallback, then seed data
onMounted(async () => {
  let loaded = false

  // 1) Try backend
  try {
    const isOnline = await backend.checkHealth()
    if (isOnline) {
      const savedData = await backend.loadAll()
      if (savedData && savedData.employees && savedData.employees.length > 0) {
        store.employees = savedData.employees
        store.colloqui = savedData.colloqui || []
        store.ferie = savedData.ferie || []
        store.colloquiPC = savedData.colloquiPC || []
        store.dimissioni = savedData.dimissioni || []
        store.valutazioni360 = savedData.valutazioni360 || []
        store.backendAvailable = true
        loaded = true
        console.log('✅ Data restored from backend server')
      }
    }
  } catch (err) {
    console.warn('Backend not available:', err.message)
  }

  // 2) Fallback: IndexedDB
  if (!loaded) {
    try {
      const savedData = await idb.loadAll()
      if (savedData && savedData.employees && savedData.employees.length > 0) {
        store.employees = savedData.employees
        store.colloqui = savedData.colloqui || []
        store.ferie = savedData.ferie || []
        store.colloquiPC = savedData.colloquiPC || []
        store.dimissioni = savedData.dimissioni || []
        store.valutazioni360 = savedData.valutazioni360 || []
        console.log('✅ Data restored from IndexedDB')
      }
    } catch (err) {
      console.warn('Could not restore from IndexedDB, using seed data:', err)
    }
  }

  // Aggiorna ferie maturate (ricalcolo mensile) dopo il caricamento dati
  store.aggiornaFerieMaturate()

  // Periodic backend health check (every 30s)
  setInterval(async () => {
    const wasAvailable = store.backendAvailable
    store.backendAvailable = await backend.checkHealth()
    if (!wasAvailable && store.backendAvailable) {
      console.log('✅ Backend server connected')
    }
  }, 30000)

  // Ricalcolo ferie maturate ogni ora (per transizioni di mese)
  setInterval(() => store.aggiornaFerieMaturate(), 3600000)
})
</script>
