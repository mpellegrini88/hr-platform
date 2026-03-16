<template>
  <div class="p-6 space-y-6">
    <!-- KPI CONTRATTI -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
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
        color="amber" 
      />
      <KpiCard 
        label="Attivi" 
        :value="store.employees.filter(e => e.stato === 'Attivo').length" 
        icon="✓"
        color="emerald" 
      />
      <KpiCard 
        label="In Prova" 
        :value="store.employees.filter(e => e.esitoProva === 'In Corso').length" 
        icon="⏳"
        color="amber" 
      />
      <KpiCard 
        label="Ex-dipendenti" 
        :value="exDipendenti.length" 
        icon="👤"
        color="gray" 
      />
    </div>

    <!-- EX-DIPENDENTI (Uscita Concordata / Inattivo) -->
    <div v-if="exDipendenti.length > 0" class="card p-5 border-l-4 border-gray-400">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">👤 Ex-dipendenti — Uscita Concordata / Inattivo</h3>
        <span class="text-sm text-gray-500">{{ exDipendenti.length }} persone</span>
      </div>
      <div class="overflow-x-auto">
        <table class="tbl text-sm">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Team</th>
              <th>Contratto</th>
              <th>Data Assunzione</th>
              <th>Livello CCNL</th>
              <th>Stato</th>
              <th>Data Uscita</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in exDipendenti" :key="e.id">
              <td class="font-medium">{{ e.nome }} {{ e.cognome }}</td>
              <td><span class="badge badge-gray">{{ e.team }}</span></td>
              <td><span class="badge badge-sm" :class="e.tipoContratto === 'determinato' ? 'badge-amber' : 'badge-blue'">{{ e.tipoContratto }}</span></td>
              <td class="text-sm">{{ fmtDateShort(e.dataAssunzione) }}</td>
              <td class="text-sm text-gray-600">{{ e.livelloCCNL || '—' }}</td>
              <td><span class="badge badge-sm" :class="e.stato === 'Inattivo' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700'">{{ e.stato }}</span></td>
              <td class="text-sm">{{ fmtDateShort(e.dataUscita) || '—' }}</td>
              <td class="text-sm text-gray-500">{{ e.motivoUscita || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Stats summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">Uscita Concordata</div>
          <div class="text-xl font-bold text-gray-700">{{ exDipendenti.filter(e => e.stato === 'In Uscita Concordata').length }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">Inattivi</div>
          <div class="text-xl font-bold text-gray-700">{{ exDipendenti.filter(e => e.stato === 'Inattivo').length }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">Team coinvolti</div>
          <div class="text-xl font-bold text-gray-700">{{ new Set(exDipendenti.map(e => e.team)).size }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">Avg. permanenza</div>
          <div class="text-xl font-bold text-gray-700">{{ avgPermanenzaEx }} mesi</div>
        </div>
      </div>
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

    <!-- ===== FERIE & MALATTIE ANALYTICS ===== -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard label="Ferie spettanti" :value="r2(fa.totals.spettanti)" icon="📅" color="blue" />
      <KpiCard label="Ferie godute" :value="r2(fa.totals.godute)" icon="✅" color="emerald" />
      <KpiCard label="% Godute" :value="r2(fa.totals.percGodute) + '%'" icon="📊" color="indigo" />
      <KpiCard label="Gg Malattia" :value="r2(fa.totals.malattia)" icon="🤒" color="red" />
    </div>

    <div class="grid grid-cols-12 gap-5">
      <!-- Ferie per team -->
      <div class="col-span-12 lg:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">🏖️ Ferie per Team</h3>
        <div class="overflow-x-auto">
          <table class="tbl text-sm">
            <thead>
              <tr>
                <th>Team</th>
                <th class="text-center">Dip.</th>
                <th class="text-center">Spettanti</th>
                <th class="text-center">Godute</th>
                <th class="text-center">Residue</th>
                <th class="text-center">%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in fa.byTeam" :key="t.team">
                <td class="font-medium text-xs">{{ t.team }}</td>
                <td class="text-center">{{ t.n }}</td>
                <td class="text-center">{{ r2(t.spettanti) }}</td>
                <td class="text-center">{{ r2(t.godute) }}</td>
                <td class="text-center">
                  <span :class="['font-semibold', t.residue > t.spettanti * 0.8 ? 'text-amber-600' : '']">{{ r2(t.residue) }}</span>
                </td>
                <td class="text-center">
                  <div class="flex items-center gap-1 justify-center">
                    <div class="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-primary-400 rounded-full" :style="{ width: t.percGodute + '%' }"></div>
                    </div>
                    <span class="text-xs">{{ r2(t.percGodute) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Malattia per team -->
      <div class="col-span-12 lg:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">🤒 Malattia per Team</h3>
        <div class="overflow-x-auto">
          <table class="tbl text-sm">
            <thead>
              <tr>
                <th>Team</th>
                <th class="text-center">Dip.</th>
                <th class="text-center">Gg Totali</th>
                <th class="text-center">Media/dip</th>
                <th class="text-center">Gg 3m</th>
                <th class="text-center">Episodi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in fa.byTeam" :key="t.team">
                <td class="font-medium text-xs">{{ t.team }}</td>
                <td class="text-center">{{ t.n }}</td>
                <td class="text-center">
                  <span :class="t.malattia > 20 ? 'text-red-600 font-semibold' : ''">{{ r2(t.malattia) }}</span>
                </td>
                <td class="text-center">{{ r2(t.avgMal) }}</td>
                <td class="text-center">
                  <span :class="t.mal3m > 10 ? 'text-amber-600 font-semibold' : ''">{{ r2(t.mal3m) }}</span>
                </td>
                <td class="text-center">{{ t.episodi }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Top lists -->
    <div class="grid grid-cols-12 gap-5">
      <div class="col-span-12 lg:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">📌 Top 5 — Ferie Residue più alte</h3>
        <div class="space-y-2">
          <div v-for="(f, i) in fa.topResidue" :key="f.nome" class="flex items-center justify-between p-2 bg-amber-50 rounded">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-amber-600 w-5">{{ i + 1 }}.</span>
              <span class="text-sm font-medium text-gray-800">{{ f.nome }}</span>
              <span class="text-xs text-gray-400">{{ f.team }}</span>
            </div>
            <span class="font-bold text-amber-700">{{ r2(f.ferieResidue) }}gg</span>
          </div>
          <div v-if="fa.topResidue.length === 0" class="text-sm text-gray-400 text-center py-4">Nessun dato</div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">📌 Top 5 — Malattia (gg anno)</h3>
        <div class="space-y-2">
          <div v-for="(f, i) in fa.topMalattia" :key="f.nome" class="flex items-center justify-between p-2 bg-red-50 rounded">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-red-600 w-5">{{ i + 1 }}.</span>
              <span class="text-sm font-medium text-gray-800">{{ f.nome }}</span>
              <span class="text-xs text-gray-400">{{ f.team }}</span>
            </div>
            <span class="font-bold text-red-700">{{ r2(f.ggMalattia) }}gg</span>
          </div>
          <div v-if="fa.topMalattia.length === 0" class="text-sm text-gray-400 text-center py-4">Nessun dato</div>
        </div>
      </div>
    </div>

    <!-- P&C INFO -->
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
import { useHelpers } from '@/composables/useHelpers.js'
import KpiCard from '@/components/ui/KpiCard.vue'

const store = useHrStore()
const { fmtDateShort } = useHelpers()

function r2(v) { return v != null ? Math.round(Number(v) * 100) / 100 : 0 }

const STATI_ESCLUSI = ['In Uscita Concordata', 'Inattivo']
const exDipendenti = computed(() => store.enrichedEmployees.filter(e => STATI_ESCLUSI.includes(e.stato)))

const avgPermanenzaEx = computed(() => {
  if (exDipendenti.value.length === 0) return 0
  const now = new Date()
  const sum = exDipendenti.value.reduce((acc, e) => {
    const start = e.dataAssunzione ? new Date(e.dataAssunzione) : now
    const end = e.dataUscita ? new Date(e.dataUscita) : now
    return acc + Math.round((end - start) / (30.44 * 86400000))
  }, 0)
  return Math.round(sum / exDipendenti.value.length)
})

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

// Ferie analytics from store
const fa = computed(() => store.ferieAnalytics || { totals: { spettanti: 0, godute: 0, residue: 0, malattia: 0, percGodute: 0 }, byTeam: [], topMalattia: [], topResidue: [] })
</script>
