<template>
  <div class="p-6 space-y-6">
    <!-- KPI TOP -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard label="Engaged" :value="kpi.engaged" icon="😊" color="green" />
      <KpiCard label="At Risk" :value="kpi.atRisk" icon="⚠️" color="orange" />
      <KpiCard label="Burned Out" :value="kpi.burnedOut" icon="🔴" color="red" :alert="kpi.burnedOut > 0" />
      <KpiCard label="Disengaged" :value="kpi.disengaged" icon="😐" color="blue" />
    </div>

    <!-- EMPTY STATE - Nessun dato P&C disponibile -->
    <div class="card p-8 border-2 border-dashed border-gray-300">
      <div class="text-center">
        <div class="text-4xl mb-3">📊</div>
        <h3 class="font-semibold text-gray-900 mb-2">Nessun dato disponibile</h3>
        <p class="text-sm text-gray-600">
          I colloqui People & Culture non hanno ancora dati. I grafici e le analisi compariranno qui quando verranno compilati i colloqui P&C.
        </p>
        <p class="text-xs text-gray-400 mt-3">
          Fase: Fresh Start 2026 - Zero dati precedenti
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHrStore } from '@/stores/hrStore'
import KpiCard from '@/components/ui/KpiCard.vue'

const store = useHrStore()

const kpi = computed(() => {
  const colloqui = store.colloquiPC || []
  const engaged = colloqui.filter(c => c.intent >= 3.5 && c.esaur < 3).length
  const atRisk = colloqui.filter(c => c.intent >= 3.5 && c.esaur >= 3).length
  const burnedOut = colloqui.filter(c => c.intent < 3.5 && c.esaur >= 3).length
  const disengaged = colloqui.filter(c => c.intent < 3.5 && c.esaur < 3).length
  
  return { engaged, atRisk, burnedOut, disengaged }
})
</script>
