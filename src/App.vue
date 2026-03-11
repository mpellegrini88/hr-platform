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
import { usePersistence } from '@/composables/usePersistence.js'

const store = useHrStore()
const persistence = usePersistence()

// Load data from localStorage on app boot
onMounted(() => {
  try {
    const savedData = persistence.load('hrStore')
    if (savedData && savedData.employees) {
      store.employees = savedData.employees
      // Restore other collections
      if (savedData.colloqui) store.colloqui = savedData.colloqui
      if (savedData.ferie) store.ferie = savedData.ferie
      if (savedData.colloquiPC) store.colloquiPC = savedData.colloquiPC
      if (savedData.dimissioni) store.dimissioni = savedData.dimissioni
      if (savedData.valutazioni360) store.valutazioni360 = savedData.valutazioni360
      console.log('✅ Data restored from localStorage')
    }
  } catch (err) {
    console.warn('Could not restore saved data:', err)
  }
})
</script>
