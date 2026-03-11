<template>
  <aside class="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col">
    <!-- Logo Staff -->
    <div class="h-16 flex items-center px-5 border-b border-gray-100">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
          </svg>
        </div>
        <div>
          <div class="text-sm font-bold text-gray-900 leading-none">MOVE HR</div>
          <div class="text-xs text-gray-400 mt-0.5">Platform</div>
        </div>
      </div>
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
      <NavItem to="/contratti-termine" :icon="DocumentDuplicateIcon" label="Contratti a Termine" />
      <NavItem to="/dimissioni" :icon="ArrowRightOnRectangleIcon" label="Dimissioni" />
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
import { ref } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useAutoSave } from '@/composables/useAutoSave.js'
import NavItem from './NavItem.vue'
import { ChartBarIcon, UsersIcon, SparklesIcon, ChatBubbleLeftIcon, ArrowTrendingUpIcon, ArrowRightOnRectangleIcon, CalendarIcon, PresentationChartLineIcon, DocumentDuplicateIcon } from '@heroicons/vue/24/solid'

const store = useHrStore()
const autoSave = useAutoSave()
const fileInput = ref(null)

function downloadBackup() {
  const storeData = {
    employees: store.employees,
    colloqui: store.colloqui,
    ferie: store.ferie,
    colloquiPC: store.colloquiPC,
    dimissioni: store.dimissioni,
    valutazioni360: [...store.valutazioni360],
    allUrgenze: [...store.allUrgenze],
    timestamp: Date.now()
  }
  autoSave.manualExportToExcel(storeData)
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
