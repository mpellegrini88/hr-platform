<template>
  <aside class="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col">
    <!-- Logo Rotante Move Solutions / Move Silicon -->
    <div class="h-16 flex items-center px-5 border-b border-gray-100 overflow-hidden">
      <transition name="logo-fade" mode="out-in">
        <div v-if="showSolutions" key="solutions" class="flex items-center gap-2.5 w-full">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold text-gray-900 leading-none tracking-tight">MOVE Solutions</div>
            <div class="text-[10px] text-blue-500 font-medium mt-0.5">HR Platform</div>
          </div>
        </div>
        <div v-else key="silicon" class="flex items-center gap-2.5 w-full">
          <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-lg flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold text-gray-900 leading-none tracking-tight">MOVE Silicon</div>
            <div class="text-[10px] text-emerald-500 font-medium mt-0.5">HR Platform</div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scroll-thin">
      <div class="section-label px-2 mb-2">Generale</div>
      <NavItem to="/dashboard"      :icon="ChartBarIcon" label="Dashboard" />
      <NavItem to="/anagrafica"     :icon="UsersIcon" label="Anagrafica" />
      <NavItem to="/onboarding"     :icon="SparklesIcon" label="Onboarding" :badge="store.kpiScadenze.ppInCorso" />

      <div class="section-label px-2 mt-4 mb-2">People & Culture</div>
      <NavItem to="/people-culture" :icon="ChatBubbleLeftIcon" label="Colloqui P&C" />
      <NavItem to="/people-culture-analytics" :icon="ArrowTrendingUpIcon" label="P&C Analytics" />
      <NavItem to="/valutazione-prova" :icon="CheckCircleIcon" label="Valutazione Prova" />
      <NavItem to="/contratti-termine" :icon="DocumentDuplicateIcon" label="Contratti a Termine" />
      <NavItem to="/uscite" :icon="ArrowRightOnRectangleIcon" label="Uscite" />
      <NavItem to="/ferie"          :icon="CalendarIcon" label="Ferie & Malattie" />

      <div class="section-label px-2 mt-4 mb-2">Analytics</div>
      <NavItem to="/analytics"      :icon="PresentationChartLineIcon" label="Analytics & Report" />
    </nav>

    <!-- Footer: Auto-Save & Backup Section -->
    <div class="p-3 border-t border-gray-100 space-y-2">
      <button @click="downloadBackup"
        class="btn btn-secondary btn-sm w-full justify-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Scarica Backup Excel
      </button>

      <button @click="triggerImport"
        class="btn btn-secondary btn-sm w-full justify-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-5l-4-4m0 0l-4 4m4-4v12"/>
        </svg>
        Ripristina Backup
      </button>

      <input ref="fileInput" type="file" accept=".json" hidden @change="handleFileImport">
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useAutoSave } from '@/composables/useAutoSave.js'
import NavItem from './NavItem.vue'
import { ChartBarIcon, UsersIcon, SparklesIcon, ChatBubbleLeftIcon, ArrowTrendingUpIcon, ArrowRightOnRectangleIcon, CalendarIcon, PresentationChartLineIcon, DocumentDuplicateIcon, CheckCircleIcon } from '@heroicons/vue/24/solid'

const store = useHrStore()
const autoSave = useAutoSave()
const fileInput = ref(null)

// Rotating logos
const showSolutions = ref(true)
let logoTimer = null
onMounted(() => { logoTimer = setInterval(() => { showSolutions.value = !showSolutions.value }, 3000) })
onUnmounted(() => { if (logoTimer) clearInterval(logoTimer) })

function downloadBackup() {
  store.saveFile()
}

function triggerImport() {
  fileInput.value?.click()
}

function handleFileImport(event) {
  const file = event.target.files[0]
  if (file) {
    autoSave.manualImportFromJSON(file)
  }
  // Reset input so same file can be selected again
  event.target.value = ''
}
</script>

<style scoped>
.logo-fade-enter-active, .logo-fade-leave-active { transition: opacity 0.4s ease; }
.logo-fade-enter-from, .logo-fade-leave-to { opacity: 0; }
</style>
