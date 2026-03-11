<template>
  <div class="p-6 space-y-6">
    <!-- Row 1: Score per team -->
    <div class="grid grid-cols-12 gap-5">
      <div class="col-span-12 lg:col-span-7 card p-5">
        <h3 class="font-semibold text-gray-900 mb-1">📊 Score benessere per team</h3>
        <p class="text-xs text-gray-400 mb-4">Media dimensioni ultimo colloquio P&C (1–5)</p>
        <div v-if="teamStatsChartData.labels.length" class="h-72">
          <Bar :data="teamStatsChartData" :options="barOpts" />
        </div>
        <div v-else class="h-72 flex items-center justify-center text-gray-300">Nessun dato disponibile</div>
      </div>

      <div class="col-span-12 lg:col-span-5 card p-5">
        <h3 class="font-semibold text-gray-900 mb-1">🍩 Distribuzione contratti</h3>
        <p class="text-xs text-gray-400 mb-4">Mix contrattuale attuale</p>
        <div class="h-72 flex items-center justify-center">
          <Doughnut :data="contractData" :options="doughnutOpts" />
        </div>
      </div>
    </div>

    <!-- Row 2: Team size + burnout -->
    <div class="grid grid-cols-12 gap-5">
      <div class="col-span-12 lg:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-1">👥 Headcount per team</h3>
        <p class="text-xs text-gray-400 mb-4">Numero dipendenti per team</p>
        <div class="h-64">
          <Bar :data="headcountData" :options="{ ...barOpts, indexAxis: 'y' }" />
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-1">🔴 Rischio burnout per team</h3>
        <p class="text-xs text-gray-400 mb-4">Distribuzione alto / medio / basso</p>
        <div class="h-64">
          <Bar :data="burnoutData" :options="stackedOpts" />
        </div>
      </div>
    </div>

    <!-- Row 3: Radar welfare + tabella team -->
    <div class="grid grid-cols-12 gap-5">
      <div class="col-span-12 lg:col-span-5 card p-5">
        <h3 class="font-semibold text-gray-900 mb-1">🕸 Radar benessere aziendale</h3>
        <p class="text-xs text-gray-400 mb-4">Media globale 6 dimensioni (scala 1–5)</p>
        <div class="h-72 flex items-center justify-center">
          <Radar :data="radarData" :options="radarOpts" />
        </div>
      </div>

      <div class="col-span-12 lg:col-span-7 card overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900">📋 Dettaglio team</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="tbl text-xs">
            <thead><tr>
              <th>Team</th><th>N</th>
              <th class="text-red-500">Esaur.</th><th class="text-orange-500">Carico</th>
              <th class="text-emerald-500">Motiv.</th><th class="text-blue-500">Supp.</th>
              <th class="text-purple-500">Equil.</th><th class="text-indigo-500">Intent.</th>
              <th>Burnout alto</th><th>At risk</th><th>Gg mal.</th>
            </tr></thead>
            <tbody>
              <tr v-for="t in store.teamStats" :key="t.team">
                <td class="font-medium">{{ t.team }}</td>
                <td>{{ t.n }}</td>
                <td><ScoreDot :value="t.avgEsaur" :inverted="true" /></td>
                <td><ScoreDot :value="t.avgCarico" :inverted="true" /></td>
                <td><ScoreDot :value="t.avgMotiv" /></td>
                <td><ScoreDot :value="t.avgSupp" /></td>
                <td><ScoreDot :value="t.avgEquil" /></td>
                <td><ScoreDot :value="t.avgIntent" /></td>
                <td>
                  <span v-if="t.burnoutAlto > 0" class="badge badge-red">{{ t.burnoutAlto }}</span>
                  <span v-else class="text-gray-300">0</span>
                </td>
                <td>
                  <span v-if="t.atRisk > 0" class="badge badge-orange">{{ t.atRisk }}</span>
                  <span v-else class="text-gray-300">0</span>
                </td>
                <td class="text-gray-600">{{ t.ggMal || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Row 4: Assunzioni timeline -->
    <div class="card p-5">
      <h3 class="font-semibold text-gray-900 mb-1">📅 Assunzioni per anno</h3>
      <p class="text-xs text-gray-400 mb-4">Numero di nuovi ingressi per anno solare</p>
      <div class="h-48">
        <Bar :data="hiresData" :options="barOpts" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import { Bar, Doughnut, Radar } from 'vue-chartjs'
import ScoreDot from '@/components/ui/ScoreDot.vue'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  RadialLinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, RadialLinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const store = useHrStore()

// --- Chart: team wellness score ---
const teamStatsChartData = computed(() => {
  const ts = store.teamStats.filter(t => t.avgEsaur != null).slice(0, 10)
  return {
    labels: ts.map(t => t.team),
    datasets: [
      { label: 'Esaurimento (↑=peggio)', data: ts.map(t => t.avgEsaur), backgroundColor: '#fca5a5', borderRadius: 4 },
      { label: 'Carico (↑=peggio)',      data: ts.map(t => t.avgCarico), backgroundColor: '#fdba74', borderRadius: 4 },
      { label: 'Motivazione',           data: ts.map(t => t.avgMotiv),  backgroundColor: '#6ee7b7', borderRadius: 4 },
      { label: 'Supporto',              data: ts.map(t => t.avgSupp),   backgroundColor: '#93c5fd', borderRadius: 4 },
      { label: 'Equilibrio',            data: ts.map(t => t.avgEquil),  backgroundColor: '#c4b5fd', borderRadius: 4 },
      { label: 'Intenzione restare',    data: ts.map(t => t.avgIntent), backgroundColor: '#a5b4fc', borderRadius: 4 },
    ]
  }
})

// --- Chart: contratti ---
const CONTRACT_COLORS = { indeterminato:'#6366f1', determinato:'#3b82f6', 'full-time':'#8b5cf6', 'part-time':'#a78bfa', apprendistato:'#f59e0b', stage:'#9ca3af', consulenza:'#d1d5db', freelance:'#6b7280' }
const contractData = computed(() => {
  const map = {}
  store.employees.forEach(e => { const k = (e.tipoContratto||'').toLowerCase(); map[k] = (map[k]||0)+1 })
  const entries = Object.entries(map).sort((a,b)=>b[1]-a[1])
  return {
    labels: entries.map(([k]) => k),
    datasets: [{ data: entries.map(([,v])=>v), backgroundColor: entries.map(([k])=>CONTRACT_COLORS[k]||'#9ca3af'), borderWidth: 0 }]
  }
})

// --- Chart: headcount ---
const headcountData = computed(() => {
  const ts = store.teamStats.slice(0, 12)
  return {
    labels: ts.map(t => t.team),
    datasets: [{ label: 'Dipendenti', data: ts.map(t => t.n), backgroundColor: '#6366f1', borderRadius: 4 }]
  }
})

// --- Chart: burnout stacked ---
const burnoutData = computed(() => {
  const ts = store.teamStats.filter(t => t.esaur.length > 0).slice(0, 10)
  return {
    labels: ts.map(t => t.team),
    datasets: [
      { label: 'Alto', data: ts.map(t => t.burnoutAlto), backgroundColor: '#fca5a5', borderRadius: 2 },
      { label: 'Medio', data: ts.map(t => t.esaur.filter(v=>v===3).length), backgroundColor: '#fde68a', borderRadius: 2 },
      { label: 'Basso', data: ts.map(t => t.n - t.burnoutAlto - t.esaur.filter(v=>v===3).length), backgroundColor: '#6ee7b7', borderRadius: 2 },
    ]
  }
})

// --- Chart: radar globale ---
const radarData = computed(() => {
  const all = store.enrichedEmployees.filter(e => e.lastC)
  const avg = key => all.length ? Math.round(all.reduce((a,e)=>a+e.lastC[key],0)/all.length*10)/10 : 0
  return {
    labels: ['Esaurimento\n(inv)', 'Carico\n(inv)', 'Motivazione', 'Supporto', 'Equilibrio', 'Intenzione'],
    datasets: [{
      label: 'Media aziendale',
      data: [avg('esaur'), avg('carico'), avg('motiv'), avg('supp'), avg('equil'), avg('intent')],
      backgroundColor: 'rgba(99,102,241,0.15)', borderColor: '#6366f1', borderWidth: 2, pointBackgroundColor: '#6366f1'
    }]
  }
})

// --- Chart: assunzioni per anno ---
const hiresData = computed(() => {
  const map = {}
  store.employees.forEach(e => {
    const y = e.dataAssunzione?.slice(0,4)
    if (y) map[y] = (map[y]||0)+1
  })
  const keys = Object.keys(map).sort()
  return {
    labels: keys,
    datasets: [{ label: 'Assunzioni', data: keys.map(k=>map[k]), backgroundColor: '#6366f1', borderRadius: 4 }]
  }
})

// Chart options
const barOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: true, position: 'top', labels: { font: { size: 11 }, usePointStyle: true } } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: '#f3f4f6' }, max: 5, min: 0 } }
}
const stackedOpts = {
  ...barOpts,
  scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: '#f3f4f6' } } }
}
const doughnutOpts = {
  responsive: true, maintainAspectRatio: false, cutout: '65%',
  plugins: { legend: { position: 'right', labels: { font: { size: 11 }, usePointStyle: true } } }
}
const radarOpts = {
  responsive: true, maintainAspectRatio: false,
  scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: '#e5e7eb' }, pointLabels: { font: { size: 10 } } } },
  plugins: { legend: { display: false } }
}
</script>
