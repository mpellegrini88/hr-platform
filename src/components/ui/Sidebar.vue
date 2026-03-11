<template>
  <aside class="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col">
    <!-- Logo -->
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
      <NavItem to="/dashboard"      icon="📊" label="Dashboard" />
      <NavItem to="/anagrafica"     icon="👥" label="Anagrafica" />
      <NavItem to="/onboarding"     icon="🚀" label="Onboarding" :badge="store.kpiScadenze.ppInCorso" />

      <div class="section-label px-2 mt-4 mb-2">People & Culture</div>
      <NavItem to="/people-culture" icon="💬" label="Colloqui P&C" />
      <NavItem to="/people-culture-analytics" icon="🎯" label="P&C Analytics" />
      <NavItem to="/dimissioni" icon="👋" label="Dimissioni" />
      <NavItem to="/ferie"          icon="🌴" label="Ferie & Malattie" />

      <div class="section-label px-2 mt-4 mb-2">Analytics</div>
      <NavItem to="/analytics"      icon="📈" label="Analytics & Report" />
    </nav>

    <!-- Footer -->
    <div class="p-3 border-t border-gray-100">
      <button @click="store.saveFile()" class="btn btn-secondary btn-sm w-full justify-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Esporta Excel
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useHrStore } from '@/stores/hrStore.js'
import NavItem from './NavItem.vue'
const store = useHrStore()
</script>
