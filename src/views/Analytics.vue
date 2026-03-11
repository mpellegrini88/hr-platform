<template>
  <div class="p-6 space-y-6">
    <!-- KPI CONTRATTI -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard 
        label="Indeterminati" 
        :value="countByContractType('indeterminato')" 
        icon="📋"
        color="blue" 
      />
      <KpiCard 
        label="Determinati" 
        :value="countByContractType('determinato')" 
        icon="⏰"
        color="orange" 
      />
      <KpiCard 
        label="Attivi" 
        :value="store.employees.filter(e => e.stato === 'Attivo').length" 
        icon="✓"
        color="green" 
      />
      <KpiCard 
        label="In Prova" 
        :value="store.employees.filter(e => e.esitoProva === 'In Corso').length" 
        icon="⏳"
        color="yellow" 
      />
    </div>

    <!-- ROW 1: Contratti + Headcount -->
    <div class="grid grid-cols-12 gap-5">
      <div class="col-span-12 lg:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">📋 Distribuzione contratti</h3>
        <div class="space-y-3">
          <div v-for="type in contractTypes" :key="type" class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span class="font-medium text-gray-700">{{ type }}</span>
            <span class="text-lg font-semibold text-gray-900">{{ countByContractType(type) }}</span>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">👥 Top Teams (Headcount)</h3>
        <div class="space-y-2">
          <div v-for="team in topTeams" :key="team.name" class="flex items-center justify-between">
            <span class="text-sm text-gray-700">{{ team.name }}</span>
            <div class="flex items-center gap-2">
              <div class="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-primary-500" :style="{ width: (team.total / maxTeam * 100) + '%' }"></div>
              </div>
              <span class="text-sm font-semibold text-gray-900 w-6 text-right">{{ team.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TEAM STATISTICS TABLE -->
    <div class="card p-5">
      <h3 class="font-semibold text-gray-900 mb-4">👥 Dipendenti per team (Dettaglio)</h3>
      <div class="overflow-x-auto">
        <table class="tbl text-sm">
          <thead>
            <tr>
              <th>Team</th>
              <th>Totale</th>
              <th>Attivi</th>
              <th>In Prova</th>
              <th>% Attivi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in teamStats" :key="team.name">
              <td class="font-medium text-xs">{{ team.name }}</td>
              <td>{{ team.total }}</td>
              <td><span class="badge badge-green">{{ team.attivi }}</span></td>
              <td><span class="badge badge-yellow">{{ team.inProva }}</span></td>
              <td>{{ Math.round(team.attivi / team.total * 100) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- INFO: P&C Data is empty (fresh start) -->
    <div class="card p-5 border border-amber-200 bg-amber-50">
      <h3 class="font-semibold text-amber-900 mb-2">ℹ️ Dati People & Culture</h3>
      <p class="text-sm text-amber-800">
        I dati di benessere e colloqui P&C sono stati rimossi (fresh start 2026). 
        I grafici relativi a esaurimento, motivazione e altre scale non hanno dati disponibili.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHrStore } from '@/stores/hrStore'
import KpiCard from '@/components/ui/KpiCard.vue'

const store = useHrStore()

const contractTypes = ['indeterminato', 'determinato']

const countByContractType = (type) => {
  return store.employees.filter(e => e.tipoContratto === type).length
}

const teamStats = computed(() => {
  const teams = {}
  
  store.employees.forEach(emp => {
    if (!teams[emp.team]) {
      teams[emp.team] = { name: emp.team, total: 0, attivi: 0, inProva: 0 }
    }
    teams[emp.team].total++
    if (emp.stato === 'Attivo') teams[emp.team].attivi++
    if (emp.esitoProva === 'In Corso') teams[emp.team].inProva++
  })

  return Object.values(teams).sort((a, b) => b.total - a.total)
})

const topTeams = computed(() => teamStats.value.slice(0, 8))
const maxTeam = computed(() => Math.max(...topTeams.value.map(t => t.total), 1))
</script>
