<template>
  <div class="p-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <svg class="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Gestione Uscite
        </h2>
        <p class="text-sm text-gray-500 mt-1">Dimissioni, Uscite concordate, Licenziamenti, Fine contratto, Mancato superamento prova</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-right">
          <div class="text-3xl font-bold text-gray-800">{{ allUscite.length }}</div>
          <div class="text-xs text-gray-500">uscite totali</div>
        </div>
        <button @click="openNewUscita" class="btn btn-primary gap-1">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Registra Uscita
        </button>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="card p-4 border-l-4 border-red-400">
        <div class="text-[10px] text-red-600 font-semibold uppercase tracking-wide">Dimissioni Volontarie</div>
        <div class="text-2xl font-bold text-red-700 mt-1">{{ kpi.dimissioni }}</div>
      </div>
      <div class="card p-4 border-l-4 border-orange-400">
        <div class="text-[10px] text-orange-600 font-semibold uppercase tracking-wide">Uscite Concordate</div>
        <div class="text-2xl font-bold text-orange-700 mt-1">{{ kpi.concordate }}</div>
      </div>
      <div class="card p-4 border-l-4 border-purple-400">
        <div class="text-[10px] text-purple-600 font-semibold uppercase tracking-wide">Licenziamenti</div>
        <div class="text-2xl font-bold text-purple-700 mt-1">{{ kpi.licenziamenti }}</div>
      </div>
      <div class="card p-4 border-l-4 border-amber-400">
        <div class="text-[10px] text-amber-600 font-semibold uppercase tracking-wide">Fine Contratto</div>
        <div class="text-2xl font-bold text-amber-700 mt-1">{{ kpi.fineContratto }}</div>
      </div>
      <div class="card p-4 border-l-4 border-gray-400">
        <div class="text-[10px] text-gray-600 font-semibold uppercase tracking-wide">Mancata Prova</div>
        <div class="text-2xl font-bold text-gray-700 mt-1">{{ kpi.mancataProva }}</div>
      </div>
      <div class="card p-4 border-l-4 border-blue-400">
        <div class="text-[10px] text-blue-600 font-semibold uppercase tracking-wide">Avg. Permanenza</div>
        <div class="text-2xl font-bold text-blue-700 mt-1">{{ kpi.avgPermanenza }}<span class="text-sm font-normal text-blue-400"> mesi</span></div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex rounded-lg border border-gray-200 bg-white overflow-hidden text-sm">
        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value"
          :class="['px-4 py-2.5 font-medium transition-colors flex items-center gap-1.5', activeTab === tab.value ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50']">
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>
      <input v-model="search" class="form-input max-w-xs" placeholder="Cerca dipendente o team...">
      <select v-model="filterMotivo" class="form-select w-48">
        <option value="">Tutti i motivi</option>
        <option v-for="m in MOTIVI" :key="m">{{ m }}</option>
      </select>
      <select v-model="filterAnno" class="form-select w-28">
        <option value="">Tutti gli anni</option>
        <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <!-- TAB: ELENCO -->
    <div v-if="activeTab === 'elenco'">
      <div v-if="filtered.length === 0" class="card p-12 text-center text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        Nessuna uscita registrata corrispondente ai filtri
      </div>

      <div class="card overflow-hidden" v-else>
        <table class="tbl">
          <thead>
            <tr>
              <th class="cursor-pointer select-none" @click="toggleSort('nome')">
                Dipendente
                <span v-if="sortCol === 'nome'" class="ml-1">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th>Team</th>
              <th>Contratto</th>
              <th class="cursor-pointer select-none" @click="toggleSort('dataAssunzione')">
                Assunzione
                <span v-if="sortCol === 'dataAssunzione'" class="ml-1">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="cursor-pointer select-none" @click="toggleSort('dataUscita')">
                Data Uscita
                <span v-if="sortCol === 'dataUscita'" class="ml-1">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th>Motivo</th>
              <th class="cursor-pointer select-none text-center" @click="toggleSort('permanenza')">
                Permanenza
                <span v-if="sortCol === 'permanenza'" class="ml-1">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in filtered" :key="d.key" class="tbl-clickable" @click="openDetail(d)">
              <td>
                <div class="font-medium text-gray-900">{{ d.nome }}</div>
              </td>
              <td><span class="badge badge-gray text-[10px]">{{ d.team }}</span></td>
              <td><span :class="['badge badge-sm', d.tipoContratto === 'determinato' ? 'badge-amber' : 'badge-blue']">{{ d.tipoContratto || '—' }}</span></td>
              <td class="text-sm text-gray-600">{{ fmtDateShort(d.dataAssunzione) }}</td>
              <td class="text-sm font-medium">{{ fmtDateShort(d.dataUscita) || '—' }}</td>
              <td><span class="badge badge-sm" :class="motivoBadge(d.motivoUscita)">{{ d.motivoUscita || '—' }}</span></td>
              <td class="text-center text-sm text-gray-600">{{ d.permanenza }} mesi</td>
              <td @click.stop>
                <button class="btn btn-ghost btn-xs" @click.stop="openDetail(d)">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">{{ filtered.length }} uscite</div>
      </div>
    </div>

    <!-- TAB: STORICO PER ANNO -->
    <div v-if="activeTab === 'storico'">
      <div v-for="[year, group] in storicoByYear" :key="year">
        <div class="flex items-center gap-3 mb-3 mt-6 first:mt-0">
          <span class="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">{{ year }}</span>
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-xs text-gray-400">{{ group.length }} uscite</span>
        </div>
        <div class="card overflow-hidden mb-4">
          <table class="tbl text-sm">
            <thead><tr>
              <th>Dipendente</th><th>Team</th><th>Data Uscita</th><th>Motivo</th><th class="text-center">Permanenza</th>
            </tr></thead>
            <tbody>
              <tr v-for="d in group" :key="d.key" class="tbl-clickable" @click="openDetail(d)">
                <td class="font-medium">{{ d.nome }}</td>
                <td><span class="badge badge-gray text-[10px]">{{ d.team }}</span></td>
                <td>{{ fmtDateShort(d.dataUscita) }}</td>
                <td><span class="badge badge-sm" :class="motivoBadge(d.motivoUscita)">{{ d.motivoUscita || '—' }}</span></td>
                <td class="text-center text-gray-500">{{ d.permanenza }} mesi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="storicoByYear.length === 0" class="card p-12 text-center text-gray-400">Nessun dato storico disponibile</div>
    </div>

    <!-- TAB: ANALISI -->
    <div v-if="activeTab === 'analisi'">
      <div class="grid grid-cols-12 gap-5">
        <!-- Uscite per tipo -->
        <div class="col-span-12 md:col-span-6 card p-5">
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
            Distribuzione per motivo
          </h3>
          <div class="space-y-3">
            <div v-for="(count, motivo) in motivoDistrib" :key="motivo">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-gray-600 flex items-center gap-1">
                  <span class="w-2.5 h-2.5 rounded-full" :class="motivoDotColor(motivo)"></span>
                  {{ motivo || 'Non specificato' }}
                </span>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-400">{{ Math.round(count / allUscite.length * 100) }}%</span>
                  <span class="text-sm font-bold w-6 text-right">{{ count }}</span>
                </div>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all" :class="motivoBarColor(motivo)" :style="{ width: (count / allUscite.length * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats sintetiche -->
        <div class="col-span-12 md:col-span-6 card p-5">
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
            Statistiche
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="text-[10px] text-gray-500 font-semibold uppercase">Totale uscite</div>
              <div class="text-3xl font-bold text-gray-900 mt-1">{{ allUscite.length }}</div>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="text-[10px] text-gray-500 font-semibold uppercase">Ultimi 12 mesi</div>
              <div class="text-3xl font-bold text-gray-900 mt-1">{{ recent.length }}</div>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="text-[10px] text-gray-500 font-semibold uppercase">Avg. permanenza</div>
              <div class="text-3xl font-bold text-gray-900 mt-1">{{ kpi.avgPermanenza }}<span class="text-sm font-normal text-gray-400"> mesi</span></div>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="text-[10px] text-gray-500 font-semibold uppercase">Tasso turnover</div>
              <div class="text-3xl font-bold" :class="turnoverRate > 15 ? 'text-red-600' : turnoverRate > 10 ? 'text-amber-600' : 'text-emerald-600'">{{ turnoverRate }}%</div>
            </div>
          </div>
        </div>

        <!-- Uscite per team -->
        <div class="col-span-12 md:col-span-6 card p-5">
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
            Per Team
          </h3>
          <div class="space-y-2">
            <div v-for="[team, count] in teamDistribSorted" :key="team" class="flex items-center justify-between">
              <span class="text-sm text-gray-600 truncate flex-1 mr-2">{{ team }}</span>
              <div class="flex items-center gap-2">
                <div class="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-gray-400 rounded-full" :style="{ width: (count / maxTeamCount * 100) + '%' }"></div>
                </div>
                <span class="badge badge-gray text-xs w-8 text-center">{{ count }}</span>
              </div>
            </div>
            <div v-if="Object.keys(teamDistrib).length === 0" class="text-sm text-gray-400 text-center py-4">Nessun dato</div>
          </div>
        </div>

        <!-- Trend annuale -->
        <div class="col-span-12 md:col-span-6 card p-5">
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            Trend Annuale
          </h3>
          <div class="space-y-3">
            <div v-for="[year, count] in yearTrend" :key="year">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-semibold text-gray-700">{{ year }}</span>
                <span class="text-sm font-bold text-gray-900">{{ count }}</span>
              </div>
              <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-gray-400 to-gray-600 rounded-full transition-all" :style="{ width: (count / maxYearCount * 100) + '%' }"></div>
              </div>
            </div>
            <div v-if="yearTrend.length === 0" class="text-sm text-gray-400 text-center py-4">Nessun dato</div>
          </div>
        </div>

        <!-- Permanenza media per motivo -->
        <div class="col-span-12 card p-5">
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Permanenza Media per Motivo
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div v-for="(data, motivo) in permanenzaPerMotivo" :key="motivo" class="bg-gray-50 rounded-xl p-4 text-center">
              <div class="text-[10px] text-gray-500 font-semibold uppercase">{{ motivo }}</div>
              <div class="text-2xl font-bold text-gray-800 mt-1">{{ data.avg }}<span class="text-sm font-normal text-gray-400"> mesi</span></div>
              <div class="text-xs text-gray-400 mt-0.5">{{ data.count }} persone</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAIL MODAL -->
    <Modal :open="detail.open" :title="detail.isNew ? 'Registra Uscita' : 'Dettaglio Uscita'" width="640px" @close="detail.open = false">
      <div class="space-y-4">
        <!-- Employee selection for new -->
        <div v-if="detail.isNew">
          <label class="form-label">Dipendente</label>
          <select class="form-select" v-model="detail.empId">
            <option value="">— Seleziona —</option>
            <option v-for="e in activeEmployees" :key="e.id" :value="e.id">{{ e.nome }} {{ e.cognome }} ({{ e.team }})</option>
          </select>
        </div>
        <div v-else class="bg-gray-50 round p-4 rounded-xl">
          <div class="font-semibold text-gray-900">{{ detail.emp?.nome }}</div>
          <div class="text-sm text-gray-500">{{ detail.emp?.team }} · Assunzione: {{ fmtDateShort(detail.emp?.dataAssunzione) }}</div>
        </div>

        <div>
          <label class="form-label">Data uscita</label>
          <input class="form-input" type="date" v-model="detail.dataUscita">
        </div>
        <div>
          <label class="form-label">Motivo uscita</label>
          <select class="form-select" v-model="detail.motivo">
            <option v-for="m in MOTIVI" :key="m">{{ m }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Note / Circostanze</label>
          <textarea class="form-textarea" rows="3" v-model="detail.note" placeholder="Circostanze, feedback, exit interview..."></textarea>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="detail.open = false">Chiudi</button>
        <button class="btn btn-primary" @click="saveDetail">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          Salva
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import Modal from '@/components/ui/Modal.vue'
import { ClockIcon, ListBulletIcon, ChartBarSquareIcon } from '@heroicons/vue/24/solid'

const store = useHrStore()
const { fmtDate, fmtDateShort } = useHelpers()

const MOTIVI = ['Dimissioni Volontarie', 'Uscita Concordata', 'Licenziamento', 'Fine Contratto Determinato', 'Mancato Superamento Prova', 'Promozione/Trasferimento', 'Altre circostanze']

const activeTab = ref('elenco')
const search = ref('')
const filterMotivo = ref('')
const filterAnno = ref('')
const sortCol = ref('dataUscita')
const sortDir = ref('desc')

const tabs = [
  { value: 'elenco', label: 'Elenco', icon: ListBulletIcon },
  { value: 'storico', label: 'Storico', icon: ClockIcon },
  { value: 'analisi', label: 'Analisi', icon: ChartBarSquareIcon },
]

// Merge all exit sources: dimissioni store + employees with non-active stato
const allUscite = computed(() => {
  const fromDimissioni = store.dimissioni.map(d => ({
    ...d,
    key: 'dim-' + d.nome,
    permanenza: mesiAzienda(d.dataAssunzione, d.dataUscita),
    source: 'dimissioni'
  }))

  // Also include employees with stato != Attivo (that aren't already in dimissioni)
  const dimNomi = new Set(store.dimissioni.map(d => d.nome))
  const STATI_USCITA = ['Dimissioni Volontarie', 'Mancato Superamento Prova', 'In Uscita Concordata', 'Inattivo', 'Licenziato']
  const fromEmployees = store.enrichedEmployees
    .filter(e => STATI_USCITA.includes(e.stato) && !dimNomi.has(e.nome) && !dimNomi.has(`${e.nome} ${e.cognome}`))
    .map(e => ({
      nome: `${e.nome} ${e.cognome}`,
      team: e.team,
      dataAssunzione: e.dataAssunzione,
      dataUscita: e.dataUscita || null,
      motivoUscita: statoToMotivo(e.stato),
      noteUscita: e.noteUscita || '',
      tipoContratto: e.tipoContratto,
      key: 'emp-' + e.id,
      empId: e.id,
      permanenza: mesiAzienda(e.dataAssunzione, e.dataUscita),
      source: 'employee'
    }))

  return [...fromDimissioni, ...fromEmployees].sort((a, b) => {
    const da = a.dataUscita || '9999'
    const db = b.dataUscita || '9999'
    return db.localeCompare(da)
  })
})

const today12mo = new Date(Date.now() - 365 * 86400000)
const recent = computed(() => allUscite.value.filter(d => d.dataUscita && new Date(d.dataUscita) >= today12mo))

// Available years
const availableYears = computed(() => {
  const years = new Set()
  allUscite.value.forEach(d => { if (d.dataUscita) years.add(d.dataUscita.slice(0, 4)) })
  return [...years].sort((a, b) => b.localeCompare(a))
})

// Filtered list
const filtered = computed(() => {
  const s = search.value.toLowerCase()
  let list = allUscite.value

  if (s) list = list.filter(d => (d.nome || '').toLowerCase().includes(s) || (d.team || '').toLowerCase().includes(s))
  if (filterMotivo.value) list = list.filter(d => d.motivoUscita === filterMotivo.value)
  if (filterAnno.value) list = list.filter(d => d.dataUscita && d.dataUscita.startsWith(filterAnno.value))

  list = [...list].sort((a, b) => {
    const col = sortCol.value
    let va = a[col] || '', vb = b[col] || ''
    if (typeof va === 'number') return sortDir.value === 'asc' ? va - vb : vb - va
    va = va.toString().toLowerCase(); vb = vb.toString().toLowerCase()
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })

  return list
})

function toggleSort(col) {
  if (sortCol.value === col) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortCol.value = col; sortDir.value = 'desc' }
}

// Storico by year
const storicoByYear = computed(() => {
  const map = {}
  allUscite.value.forEach(d => {
    const y = d.dataUscita ? d.dataUscita.slice(0, 4) : 'Senza data'
    if (!map[y]) map[y] = []
    map[y].push(d)
  })
  return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
})

// KPI
const kpi = computed(() => {
  let dimissioni = 0, concordate = 0, licenziamenti = 0, fineContratto = 0, mancataProva = 0
  allUscite.value.forEach(d => {
    if (d.motivoUscita === 'Dimissioni Volontarie') dimissioni++
    else if (d.motivoUscita === 'Uscita Concordata') concordate++
    else if (d.motivoUscita === 'Licenziamento') licenziamenti++
    else if (d.motivoUscita === 'Fine Contratto Determinato') fineContratto++
    else if (d.motivoUscita === 'Mancato Superamento Prova') mancataProva++
  })
  const perm = allUscite.value.filter(d => d.permanenza > 0)
  const avgPermanenza = perm.length > 0 ? Math.round(perm.reduce((a, d) => a + d.permanenza, 0) / perm.length) : 0
  return { dimissioni, concordate, licenziamenti, fineContratto, mancataProva, avgPermanenza }
})

const turnoverRate = computed(() => {
  const totaleAttivi = store.employees.filter(e => e.stato === 'Attivo').length
  const usciteAnno = recent.value.length
  const base = totaleAttivi + usciteAnno
  return base > 0 ? Math.round(usciteAnno / base * 100) : 0
})

// Distribuzione motivo
const motivoDistrib = computed(() => {
  const map = {}
  allUscite.value.forEach(d => {
    const m = d.motivoUscita || 'Non specificato'
    map[m] = (map[m] || 0) + 1
  })
  return map
})

// Distribuzione team
const teamDistrib = computed(() => {
  const map = {}
  allUscite.value.forEach(d => { if (d.team) map[d.team] = (map[d.team] || 0) + 1 })
  return map
})
const teamDistribSorted = computed(() => Object.entries(teamDistrib.value).sort((a, b) => b[1] - a[1]))
const maxTeamCount = computed(() => Math.max(...Object.values(teamDistrib.value), 1))

// Year trend
const yearTrend = computed(() => {
  const map = {}
  allUscite.value.forEach(d => {
    const y = d.dataUscita ? d.dataUscita.slice(0, 4) : null
    if (y) map[y] = (map[y] || 0) + 1
  })
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
})
const maxYearCount = computed(() => Math.max(...yearTrend.value.map(([, c]) => c), 1))

// Permanenza per motivo
const permanenzaPerMotivo = computed(() => {
  const map = {}
  allUscite.value.forEach(d => {
    const m = d.motivoUscita || 'Non specificato'
    if (!map[m]) map[m] = { total: 0, count: 0 }
    map[m].total += d.permanenza || 0
    map[m].count++
  })
  const result = {}
  for (const [m, v] of Object.entries(map)) {
    result[m] = { avg: v.count > 0 ? Math.round(v.total / v.count) : 0, count: v.count }
  }
  return result
})

// Active employees (for new uscita modal)
const activeEmployees = computed(() => store.employees.filter(e => e.stato === 'Attivo'))

// Helpers
function mesiAzienda(dataAss, dataUsc) {
  if (!dataAss) return 0
  const a = new Date(dataAss)
  const u = dataUsc ? new Date(dataUsc) : new Date()
  return Math.max(0, Math.round((u - a) / (30.44 * 86400000)))
}

function statoToMotivo(stato) {
  const map = {
    'Dimissioni Volontarie': 'Dimissioni Volontarie',
    'Mancato Superamento Prova': 'Mancato Superamento Prova',
    'In Uscita Concordata': 'Uscita Concordata',
    'Inattivo': 'Uscita Concordata',
    'Licenziato': 'Licenziamento'
  }
  return map[stato] || 'Altre circostanze'
}

function motivoBadge(motivo) {
  const map = {
    'Dimissioni Volontarie': 'bg-red-100 text-red-700',
    'Uscita Concordata': 'bg-orange-100 text-orange-700',
    'Licenziamento': 'bg-purple-100 text-purple-700',
    'Fine Contratto Determinato': 'bg-amber-100 text-amber-700',
    'Mancato Superamento Prova': 'bg-gray-100 text-gray-700',
    'Promozione/Trasferimento': 'bg-emerald-100 text-emerald-700',
    'Altre circostanze': 'bg-blue-100 text-blue-700'
  }
  return map[motivo] || 'bg-gray-100 text-gray-600'
}

function motivoDotColor(motivo) {
  const map = {
    'Dimissioni Volontarie': 'bg-red-500',
    'Uscita Concordata': 'bg-orange-500',
    'Licenziamento': 'bg-purple-500',
    'Fine Contratto Determinato': 'bg-amber-500',
    'Mancato Superamento Prova': 'bg-gray-500',
    'Promozione/Trasferimento': 'bg-emerald-500',
    'Altre circostanze': 'bg-blue-500',
    'Non specificato': 'bg-gray-300'
  }
  return map[motivo] || 'bg-gray-300'
}

function motivoBarColor(motivo) {
  const map = {
    'Dimissioni Volontarie': 'bg-red-400',
    'Uscita Concordata': 'bg-orange-400',
    'Licenziamento': 'bg-purple-400',
    'Fine Contratto Determinato': 'bg-amber-400',
    'Mancato Superamento Prova': 'bg-gray-400',
    'Promozione/Trasferimento': 'bg-emerald-400',
    'Altre circostanze': 'bg-blue-400',
    'Non specificato': 'bg-gray-300'
  }
  return map[motivo] || 'bg-gray-300'
}

// Detail modal
const detail = reactive({ open: false, isNew: false, emp: null, empId: '', dataUscita: '', motivo: MOTIVI[0], note: '' })

function openDetail(d) {
  detail.isNew = false
  detail.emp = d
  detail.empId = d.empId || ''
  detail.dataUscita = d.dataUscita || ''
  detail.motivo = d.motivoUscita || MOTIVI[0]
  detail.note = d.noteUscita || ''
  detail.open = true
}

function openNewUscita() {
  detail.isNew = true
  detail.emp = null
  detail.empId = ''
  detail.dataUscita = new Date().toISOString().split('T')[0]
  detail.motivo = MOTIVI[0]
  detail.note = ''
  detail.open = true
}

function saveDetail() {
  if (detail.isNew) {
    if (!detail.empId) { store.notify('Seleziona un dipendente', 'error'); return }
    const emp = store.employees.find(e => e.id === parseInt(detail.empId))
    if (!emp) return
    // Update employee status
    const statoMap = {
      'Dimissioni Volontarie': 'Dimissioni Volontarie',
      'Uscita Concordata': 'In Uscita Concordata',
      'Licenziamento': 'Licenziato',
      'Mancato Superamento Prova': 'Mancato Superamento Prova',
      'Fine Contratto Determinato': 'Inattivo',
      'Promozione/Trasferimento': 'Inattivo',
      'Altre circostanze': 'Inattivo'
    }
    store.updateEmployee(emp.id, {
      stato: statoMap[detail.motivo] || 'Inattivo',
      dataUscita: detail.dataUscita,
      motivoUscita: detail.motivo,
      noteUscita: detail.note
    })
    // Also save to dimissioni
    store.saveDimissione(emp.id, {
      nome: `${emp.nome} ${emp.cognome}`,
      team: emp.team,
      dataAssunzione: emp.dataAssunzione,
      dataUscita: detail.dataUscita,
      motivoUscita: detail.motivo,
      noteUscita: detail.note
    })
  } else {
    // Update existing
    if (detail.emp?.empId) {
      store.updateEmployee(detail.emp.empId, {
        dataUscita: detail.dataUscita,
        motivoUscita: detail.motivo,
        noteUscita: detail.note
      })
    }
    // Update dimissioni record if from dimissioni
    if (detail.emp?.source === 'dimissioni') {
      const idx = store.dimissioni.findIndex(d => d.nome === detail.emp.nome)
      if (idx !== -1) {
        store.dimissioni[idx].dataUscita = detail.dataUscita
        store.dimissioni[idx].motivoUscita = detail.motivo
        store.dimissioni[idx].noteUscita = detail.note
      }
    }
    store.notify('Uscita aggiornata ✓')
  }
  detail.open = false
}
</script>
