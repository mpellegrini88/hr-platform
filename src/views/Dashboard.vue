<template>
  <div class="p-6 space-y-6">
    <!-- ONBOARDING SCADENZE KPI Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80" @click="router.push('/onboarding')"><KpiCard label="In periodo di prova" :value="kpiOnboarding.inCorso" icon="🚀" color="blue" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80" @click="router.push('/onboarding')"><KpiCard label="FU1 scaduti" :value="kpiOnboarding.fu1Scaduti" icon="⚠️" color="red" :alert="kpiOnboarding.fu1Scaduti > 0" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80" @click="router.push('/onboarding')"><KpiCard label="FU1 entro 7gg" :value="kpiOnboarding.fu1Entro7gg" icon="⏰" color="amber" :alert="kpiOnboarding.fu1Entro7gg > 0" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80" @click="router.push('/onboarding')"><KpiCard label="FU2 Manager scaduti" :value="kpiOnboarding.fu2ManagerScaduti" icon="📋" color="orange" :alert="kpiOnboarding.fu2ManagerScaduti > 0" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80" @click="router.push('/onboarding')"><KpiCard label="Fine prova 30gg" :value="kpiOnboarding.provaScadenza" icon="📅" color="indigo" :alert="kpiOnboarding.provaScadenza > 0" /></button>
    </div>

    <!-- CONTRACT SCADENZE KPI Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80"><KpiCard label="Rinnovi scaduti" :value="kpiContratti.rinnoveScadute" icon="📌" color="red" :alert="kpiContratti.rinnoveScadute > 0" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80"><KpiCard label="Rinnovi entro 30gg" :value="kpiContratti.rinnoveEntro30gg" icon="⏳" color="amber" :alert="kpiContratti.rinnoveEntro30gg > 0" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80"><KpiCard label="Dossier scaduti" :value="kpiContratti.dossieriScaduti" icon="📂" color="orange" :alert="kpiContratti.dossieriScaduti > 0" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80"><KpiCard label="Determinati attivi" :value="kpiContratti.determinatiInScadenza" icon="✍️" color="purple" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80" @click="router.push('/anagrafica')"><KpiCard label="Dipendenti attivi" :value="attivi" icon="👥" color="indigo" /></button>
    </div>

    <!-- KANBAN BOARD -->
    <div class="card">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">📋 Kanban - Monitoraggio Azioni</h3>
      </div>
      <div class="p-5">
        <KanbanBoard />
      </div>
    </div>

    <!-- Main grid -->
    <div class="grid grid-cols-12 gap-5">
      <!-- Azioni urgenti -->
      <div class="col-span-12 xl:col-span-8 card">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">⚡ Azioni urgenti</h3>
          <span class="text-xs text-gray-400">{{ urgenti.length }} elementi</span>
        </div>
        <div class="overflow-x-auto">
          <table class="tbl">
            <thead><tr>
              <th>Dipendente</th><th>Team</th><th>Tipo</th><th>Scadenza</th><th>Azione</th>
            </tr></thead>
            <tbody>
              <tr v-for="u in urgenti.slice(0,10)" :key="u.key" class="tbl-clickable">
                <td class="font-medium">{{ u.nome }}</td>
                <td><span class="badge badge-gray">{{ u.team }}</span></td>
                <td><span :class="['badge', u.badgeClass]">{{ u.tipo }}</span></td>
                <td class="font-mono text-sm">{{ fmtDateShort(u.data) }}</td>
                <td><span :class="['badge', u.urgClass]">{{ u.azione }}</span></td>
              </tr>
              <tr v-if="urgenti.length === 0">
                <td colspan="5" class="text-center py-8 text-gray-400">✅ Nessuna azione urgente</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Distribuzione team -->
      <div class="col-span-12 xl:col-span-4 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">👥 Team distribution</h3>
        <div class="space-y-2.5">
          <div v-for="t in topTeams" :key="t.team" class="flex items-center gap-3">
            <span class="text-xs text-gray-500 w-28 truncate">{{ t.team }}</span>
            <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-primary-500 rounded-full transition-all" :style="{ width: (t.n / maxTeam * 100) + '%' }"></div>
            </div>
            <span class="text-xs font-semibold text-gray-700 w-6 text-right">{{ t.n }}</span>
          </div>
        </div>
      </div>

      <!-- Burnout per team -->
      <div class="col-span-12 md:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-1">🔴 Burnout risk per team</h3>
        <p class="text-xs text-gray-400 mb-4">Basato su ultimo colloquio P&C (MBI-GS + CBI)</p>
        <div class="space-y-3">
          <div v-for="t in teamStatsFiltered" :key="t.team">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">{{ t.team }}</span>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400">Esaur. {{ t.avgEsaur ?? '—' }}</span>
                <span v-if="t.burnoutAlto > 0" class="badge badge-red">{{ t.burnoutAlto }} alto</span>
              </div>
            </div>
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all"
                :style="{ width: t.avgEsaur ? (t.avgEsaur / 5 * 100) + '%' : '0%', background: t.avgEsaur >= 4 ? '#ef4444' : t.avgEsaur >= 3 ? '#f59e0b' : '#10b981' }">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Retention & stato -->
      <div class="col-span-12 md:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">📈 Retention & Stato</h3>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-emerald-50 rounded-xl p-3 text-center">
            <div class="text-2xl font-bold text-emerald-700">{{ retentionRate }}%</div>
            <div class="text-xs text-emerald-600 mt-0.5">Retention rate</div>
          </div>
          <div class="bg-red-50 rounded-xl p-3 text-center">
            <div class="text-2xl font-bold text-red-700">{{ turnoverCount }}</div>
            <div class="text-xs text-red-600 mt-0.5">Uscite totali</div>
          </div>
        </div>
        <div class="space-y-2">
          <div v-for="s in statoDistrib" :key="s.label" class="flex items-center gap-3">
            <span :class="['w-2 h-2 rounded-full shrink-0', s.dot]"></span>
            <span class="text-xs text-gray-600 flex-1">{{ s.label }}</span>
            <span class="text-xs font-semibold text-gray-900">{{ s.n }}</span>
          </div>
        </div>
      </div>

      <!-- Contratti mix -->
      <div class="col-span-12 md:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">📋 Mix contrattuale</h3>
        <div class="space-y-2.5">
          <div v-for="c in contractMix" :key="c.tipo" class="flex items-center gap-3">
            <span :class="['badge', c.badge]">{{ c.label }}</span>
            <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-primary-400 rounded-full" :style="{ width: (c.n / totale * 100) + '%' }"></div>
            </div>
            <span class="text-xs font-semibold text-gray-700">{{ c.n }}</span>
          </div>
        </div>
      </div>

      <!-- Wellness radar summary -->
      <div class="col-span-12 md:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-1">💚 Benessere medio (ultimo colloquio)</h3>
        <p class="text-xs text-gray-400 mb-4">Scale validate: MBI-GS · Copenhagen BI · JD-R · WHO-5 · Mobley</p>
        <div class="space-y-3">
          <DimBar label="Esaurimento emotivo (MBI)" :value="globalAvg.esaur" :inverted="true" />
          <DimBar label="Carico lavoro (CBI)" :value="globalAvg.carico" :inverted="true" />
          <DimBar label="Motivazione & Autonomia (JD-R)" :value="globalAvg.motiv" />
          <DimBar label="Supporto & Chiarezza (JD-R)" :value="globalAvg.supp" />
          <DimBar label="Equilibrio vita-lavoro (WHO-5)" :value="globalAvg.equil" />
          <DimBar label="Intenzione di restare (Mobley)" :value="globalAvg.intent" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import KpiCard from '@/components/ui/KpiCard.vue'
import DimBar  from '@/components/ui/DimBar.vue'
import KanbanBoard from '@/components/dashboard/KanbanBoard.vue'

const router = useRouter()
const store = useHrStore()
const { fmtDateShort, contractBadge } = useHelpers()
const kpi = computed(() => store.kpiScadenze)
const kpiPC = computed(() => store.kpiPC)
const kpiOnboarding = computed(() => store.kpiOnboarding)
const kpiContratti = computed(() => store.kpiContratti)
const attivi = computed(() => store.employees.filter(e => e.stato === 'Attivo').length)
const totale = computed(() => store.employees.length)

const urgenti = computed(() => {
  const today = new Date()
  const list = []
  store.enrichedEmployees.forEach(e => {
    if (e.fu1Scaduto) list.push({ key: e.id+'fu1s', nome: e.nome, team: e.team, tipo: 'FU1', data: e.scadenzaFU1, azione: 'Scaduto!', badgeClass: 'badge-blue', urgClass: 'badge-red' })
    else if (e.fu1Urgente) list.push({ key: e.id+'fu1u', nome: e.nome, team: e.team, tipo: 'FU1', data: e.scadenzaFU1, azione: `${e.daysToFU1}gg`, badgeClass: 'badge-blue', urgClass: 'badge-yellow' })
    if (e.fu2Urgente) list.push({ key: e.id+'fu2u', nome: e.nome, team: e.team, tipo: 'FU2', data: e.scadenzaFU2, azione: `${e.daysToFU2}gg`, badgeClass: 'badge-purple', urgClass: 'badge-yellow' })
    if (e.provaUrgente) list.push({ key: e.id+'fp', nome: e.nome, team: e.team, tipo: 'Fine prova', data: e.fineProva, azione: `${e.daysToProva}gg`, badgeClass: 'badge-indigo', urgClass: 'badge-orange' })
    if (e.burnoutRisk === 'alto') list.push({ key: e.id+'br', nome: e.nome, team: e.team, tipo: 'Burnout', data: null, azione: 'Monitorare', badgeClass: 'badge-red', urgClass: 'badge-red' })
  })
  return list.sort((a, b) => (a.data || '9999') > (b.data || '9999') ? 1 : -1)
})

const topTeams = computed(() => store.teamStats.slice(0, 8))
const maxTeam  = computed(() => Math.max(...topTeams.value.map(t => t.n), 1))
const teamStatsFiltered = computed(() => store.teamStats.filter(t => t.avgEsaur != null).slice(0, 6))

const statoDistrib = computed(() => {
  const dotMap = { 'Attivo': 'bg-emerald-400', 'Dimissioni Volontarie': 'bg-red-400', 'Mancato Superamento Prova': 'bg-orange-400', 'In Uscita Concordata': 'bg-amber-400' }
  const map = {}
  store.employees.forEach(e => { map[e.stato] = (map[e.stato] || 0) + 1 })
  return Object.entries(map).map(([label, n]) => ({ label, n, dot: dotMap[label] || 'bg-gray-400' })).sort((a,b)=>b.n-a.n)
})

const retentionRate = computed(() => {
  const t = totale.value
  const a = attivi.value
  return t ? Math.round(a / t * 100) : 100
})
const turnoverCount = computed(() => store.employees.filter(e => e.stato !== 'Attivo').length)

const LABELS = { indeterminato:'Indeterminato', determinato:'Determinato', 'full-time':'Full-time', 'part-time':'Part-time', apprendistato:'Apprendistato', stage:'Stage', consulenza:'Consulenza' }
const contractMix = computed(() => {
  const map = {}
  store.employees.forEach(e => { map[e.tipoContratto] = (map[e.tipoContratto] || 0) + 1 })
  return Object.entries(map).map(([tipo, n]) => ({ tipo, label: LABELS[tipo]||tipo, n, badge: contractBadge(tipo) })).sort((a,b)=>b.n-a.n)
})

const globalAvg = computed(() => {
  const dims = { esaur:[], carico:[], motiv:[], supp:[], equil:[], intent:[] }
  store.enrichedEmployees.forEach(e => {
    if (e.lastC) { dims.esaur.push(e.lastC.esaur); dims.carico.push(e.lastC.carico); dims.motiv.push(e.lastC.motiv); dims.supp.push(e.lastC.supp); dims.equil.push(e.lastC.equil); dims.intent.push(e.lastC.intent) }
  })
  const avg = arr => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length*10)/10 : null
  return { esaur:avg(dims.esaur), carico:avg(dims.carico), motiv:avg(dims.motiv), supp:avg(dims.supp), equil:avg(dims.equil), intent:avg(dims.intent) }
})
</script>
