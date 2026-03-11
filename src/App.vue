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
import { onMounted } from 'vue'
import Sidebar from '@/components/ui/Sidebar.vue'
import Topbar  from '@/components/ui/Topbar.vue'
import Toast   from '@/components/ui/Toast.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useIndexedDB } from '@/composables/useIndexedDB.js'
import { usePersistence } from '@/composables/usePersistence.js'

const store = useHrStore()
const idb = useIndexedDB()
const persistence = usePersistence()

// Load data from IndexedDB on app boot (persistent storage)
onMounted(async () => {
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
    console.warn('Could not restore from IndexedDB, falling back to seed data:', err)
  }
})
</script>
