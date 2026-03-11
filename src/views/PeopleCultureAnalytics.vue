<template>
  <div class="p-6 space-y-6">
    <!-- KPI TOP -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard label="Engaged" :value="kpi.engaged" icon="😊" color="green" />
      <KpiCard label="At Risk" :value="kpi.atRisk" icon="⚠️" color="orange" />
      <KpiCard label="Burned Out" :value="kpi.burnedOut" icon="🔴" color="red" :alert="kpi.burnedOut > 0" />
      <KpiCard label="Disengaged" :value="kpi.disengaged" icon="😐" color="blue" />
    </div>

    <!-- QUADRANTI SCATTER -->
    <div class="card p-5">
      <h3 class="font-semibold text-gray-900 mb-4">📊 Burnout vs Retention Quadranti</h3>
      <p class="text-xs text-gray-500 mb-3">Clicca sui punti per visualizzare dettagli dipendente</p>
      <QuadrantChart @select="selectEmp" />
    </div>

    <!-- Dettagli dipendente selezionato -->
    <div v-if="selected" class="card p-5 bg-blue-50 border border-blue-100">
      <div class="flex items-start justify-between">
        <div>
          <h4 class="font-semibold text-gray-900 mb-1">{{ selected.nome }}</h4>
          <p class="text-sm text-gray-600">{{ selected.team }} · {{ selected.citta }}</p>
          <div class="flex gap-3 mt-2">
            <span v-if="selected.lastC" class="badge badge-sm" :class="{ 'badge-green': selected.lastC.intent >= 3.5, 'badge-red': selected.lastC.intent < 3.5 }">
              Intent: {{ selected.lastC.intent }}/5
            </span>
            <span v-if="selected.lastC" class="badge badge-sm" :class="{ 'badge-red': selected.lastC.esaur >= 3, 'badge-green': selected.lastC.esaur < 3 }">
              Esaur: {{ selected.lastC.esaur }}/5
            </span>
          </div>
        </div>
        <button class="text-gray-400 hover:text-gray-600" @click="selected = null">✕</button>
      </div>
    </div>

    <!-- TEAM QUADRANT DISTRIBUTION -->
    <div class="card p-5">
      <h3 class="font-semibold text-gray-900 mb-4">👥 Distribuzione quadranti per team</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <TeamQuadrantBar />
        </div>
        <div class="space-y-2">
          <div class="text-xs font-semibold text-gray-500 uppercase">Legenda</div>
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-green-500"></div>
              <span class="text-sm">Engaged: basso esaurimento + alta intenzione</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-orange-500"></div>
              <span class="text-sm">At Risk: alto esaurimento + alta intenzione</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-red-500"></div>
              <span class="text-sm">Burned Out: alto esaurimento + bassa intenzione</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-blue-500"></div>
              <span class="text-sm">Disengaged: basso esaurimento + bassa intenzione</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DIMENSIONI MEDIE PER TEAM -->
    <div class="card p-5">
      <h3 class="font-semibold text-gray-900 mb-4">📈 Behavioral Dimensions per team (Top 6)</h3>
      <div class="overflow-x-auto">
        <table class="tbl text-xs">
          <thead><tr>
            <th>Team</th><th>Dipendenti</th>
            <th class="text-red-500">Esaur.</th><th class="text-orange-500">Carico</th>
            <th class="text-emerald-500">Motiv.</th><th class="text-blue-500">Supp.</th>
            <th class="text-purple-500">Equil.</th><th class="text-indigo-500">Intent.</th>
          </tr></thead>
          <tbody>
            <tr v-for="t in teamDetails" :key="t.team">
              <td class="font-medium">{{ t.team }}</td>
              <td>{{ t.n }}</td>
              <td><ScoreDot :value="t.avgEsaur" :inverted="true" /></td>
              <td><ScoreDot :value="t.avgCarico" :inverted="true" /></td>
              <td><ScoreDot :value="t.avgMotiv" /></td>
              <td><ScoreDot :value="t.avgSupp" /></td>
              <td><ScoreDot :value="t.avgEquil" /></td>
              <td><ScoreDot :value="t.avgIntent" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- P&C SCADUTI -->
    <div v-if="store.nextPC.length > 0" class="card p-5 border border-red-100 bg-red-50">
      <h3 class="font-semibold text-red-900 mb-3">⏰ Colloqui P&C in scadenza</h3>
      <div class="space-y-2">
        <div v-for="e in store.nextPC.slice(0,5)" :key="e.id" class="flex items-center justify-between text-sm">
          <span>{{ e.nome }} ({{ e.team }})</span>
          <span :class="['badge text-xs', e.urgenza === 'Scaduto' ? 'badge-red' : 'badge-yellow']">{{ e.daysAgo }}gg fa · {{ e.urgenza }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import KpiCard from '@/components/ui/KpiCard.vue'
import QuadrantChart from '@/components/ui/QuadrantChart.vue'
import TeamQuadrantBar from '@/components/ui/TeamQuadrantBar.vue'
import ScoreDot from '@/components/ui/ScoreDot.vue'

const store = useHrStore()
const selected = ref(null)

const kpi = computed(() => store.kpiPC)
const teamDetails = computed(() => store.teamStats.slice(0, 6))

function selectEmp(emp) {
  selected.value = emp
}
</script>
