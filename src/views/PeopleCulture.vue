<template>
  <div class="p-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">📋 People & Culture — Colloqui</h2>
        <p class="text-sm text-gray-500 mt-1">Gestione colloqui individuali · Scale scientifiche 1–5</p>
      </div>
      <div class="flex gap-5 text-right">
        <div>
          <div class="text-2xl font-bold text-emerald-600">{{ stats.compilati }}</div>
          <div class="text-[10px] text-gray-400">compilati</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-amber-600">{{ stats.daFare }}</div>
          <div class="text-[10px] text-gray-400">da fare</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-primary-600">{{ stats.copertura }}%</div>
          <div class="text-[10px] text-gray-400">copertura</div>
        </div>
      </div>
    </div>

    <!-- KPI rapidi -->
    <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
      <KpiCard label="😓 Esaur. medio" :value="kpi.esaur" icon="😓" color="red" :alert="kpi.esaur >= 3.5" />
      <KpiCard label="⚡ Carico medio" :value="kpi.carico" icon="⚡" color="orange" :alert="kpi.carico >= 3.5" />
      <KpiCard label="💪 Motiv. media" :value="kpi.motiv" icon="💪" color="emerald" />
      <KpiCard label="🤝 Supp. media" :value="kpi.supp" icon="🤝" color="blue" />
      <KpiCard label="⚖️ Equil. media" :value="kpi.equil" icon="⚖️" color="purple" />
      <KpiCard label="🏠 Intent. media" :value="kpi.intent" icon="🏠" color="indigo" />
    </div>

    <!-- Filtri -->
    <div class="flex flex-wrap items-center gap-3">
      <input v-model="search" class="form-input max-w-xs" placeholder="🔍 Cerca dipendente...">
      <select v-model="filterTeam" class="form-select w-44">
        <option value="">Tutti i team</option>
        <option v-for="t in store.teams" :key="t">{{ t }}</option>
      </select>
      <select v-model="filterStato" class="form-select w-44">
        <option value="">Tutti</option>
        <option value="compilato">✅ Compilati</option>
        <option value="da_fare">⏳ Da fare</option>
        <option value="critico">🔴 Critici (score ≤ 2)</option>
        <option value="monitorare">🟡 Da monitorare (2–3)</option>
      </select>
      <button class="btn btn-primary btn-sm" @click="openNewColloquio">+ Aggiungi colloquio</button>
      <div class="ml-auto text-xs text-gray-400">{{ filtered.length }} dipendenti</div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="tbl text-xs">
          <thead>
            <tr>
              <th class="cursor-pointer select-none" @click="toggleSort('nome')">
                Dipendente <span v-if="sortCol === 'nome'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th>Team</th>
              <th class="text-center text-red-500">😓 Esaur.</th>
              <th class="text-center text-orange-500">⚡ Carico</th>
              <th class="text-center text-emerald-500">💪 Motiv.</th>
              <th class="text-center text-blue-500">🤝 Supp.</th>
              <th class="text-center text-purple-500">⚖️ Equil.</th>
              <th class="text-center text-indigo-500">🏠 Intent.</th>
              <th class="text-center cursor-pointer select-none" @click="toggleSort('score')">
                Score <span v-if="sortCol === 'score'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="text-center">Storico</th>
              <th>Ultimo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in filtered" :key="e.id" class="tbl-clickable" @click="openModal(e)">
              <td>
                <div class="font-medium text-gray-900 text-sm">{{ e.nome }} {{ e.cognome }}</div>
                <div class="text-[10px] text-gray-400">{{ e.citta }}</div>
              </td>
              <td><span class="badge badge-gray text-[10px]">{{ e.team }}</span></td>
              <td class="text-center"><ScoreDot :value="pcColl(e.id)?.esaur" :inverted="true" /></td>
              <td class="text-center"><ScoreDot :value="pcColl(e.id)?.carico" :inverted="true" /></td>
              <td class="text-center"><ScoreDot :value="pcColl(e.id)?.motiv" /></td>
              <td class="text-center"><ScoreDot :value="pcColl(e.id)?.supp" /></td>
              <td class="text-center"><ScoreDot :value="pcColl(e.id)?.equil" /></td>
              <td class="text-center"><ScoreDot :value="pcColl(e.id)?.intent" /></td>
              <td class="text-center">
                <span v-if="pcColl(e.id)?.engagementScore != null"
                  :class="['font-bold text-sm', scoreColor(pcColl(e.id).engagementScore)]">
                  {{ pcColl(e.id).engagementScore }}
                </span>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>
              <td class="text-center">
                <span v-if="storicoCount(e.id) > 0" class="badge badge-purple text-[10px]">{{ storicoCount(e.id) }}</span>
                <span v-else class="text-gray-300 text-xs">0</span>
              </td>
              <td class="text-xs text-gray-500">{{ pcCollDate(e.id) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">
        {{ filtered.length }} dipendenti · Clicca per aprire il colloquio
        <span class="ml-2 text-gray-300">↑ = peggio per esaur/carico · ↑ = meglio per motiv/supp/equil/intent</span>
      </div>
    </div>

    <!-- MODAL COLLOQUIO P&C -->
    <Modal :open="modal.open" :title="'Colloquio P&C — ' + (modal.emp?.nome || '') + ' ' + (modal.emp?.cognome || '')" width="920px" @close="modal.open = false">
      <div v-if="modal.emp" class="space-y-5">
        <!-- Tab switch -->
        <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button v-for="tab in modalTabs" :key="tab.key"
            :class="['flex-1 py-2 px-3 text-sm font-medium rounded-md transition', modalTab === tab.key ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700']"
            @click="modalTab = tab.key">
            {{ tab.icon }} {{ tab.label }}
            <span v-if="tab.key === 'storico' && storicoCount(modal.emp.id) > 0" class="ml-1 badge badge-purple text-[10px]">{{ storicoCount(modal.emp.id) }}</span>
          </button>
        </div>

        <!-- TAB: Nuovo colloquio -->
        <div v-if="modalTab === 'nuovo'">
          <!-- Score summary -->
          <div class="grid grid-cols-4 gap-3 mb-4">
            <InfoBlock label="Team" :value="modal.emp.team" />
            <InfoBlock label="Città" :value="modal.emp.citta" />
            <InfoBlock label="Contratto" :value="modal.emp.tipoContratto" />
            <div class="bg-gray-50 rounded-xl p-3 text-center">
              <div class="text-xs text-gray-400 mb-1">Score attuale</div>
              <div :class="['text-3xl font-bold', scoreColor(pcColl(modal.emp.id)?.engagementScore)]">
                {{ pcColl(modal.emp.id)?.engagementScore ?? '—' }}
              </div>
            </div>
          </div>

          <!-- Info about archiving if existing -->
          <div v-if="pcColl(modal.emp.id)?.date" class="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700">
            ⚠️ Compilando un nuovo colloquio, quello attuale ({{ fmtDateShort(pcColl(modal.emp.id).date) }}) verrà archiviato nello storico.
          </div>

          <!-- Form -->
          <div class="bg-blue-50 rounded-xl p-5 border border-blue-100 space-y-5 mt-3">
            <div class="text-xs font-bold text-blue-600 uppercase tracking-widest">Nuovo colloquio P&C</div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Data colloquio</label>
                <input class="form-input" type="date" v-model="pcForm.data">
              </div>
              <div>
                <label class="form-label">Esito</label>
                <select class="form-select" v-model="pcForm.esito">
                  <option>Positivo</option><option>Da Monitorare</option><option>Critico</option><option>Urgente</option>
                </select>
              </div>
            </div>

            <!-- Legenda scale -->
            <details class="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <summary class="cursor-pointer text-sm font-semibold text-amber-800 select-none flex items-center gap-2">
                📖 Legenda Scale Scientifiche
                <span class="text-xs font-normal text-amber-600">(clicca per espandere)</span>
              </summary>
              <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
                <div class="bg-white rounded-lg p-3 border border-amber-100">
                  <p class="font-semibold text-gray-900 mb-1">😓 MBI-GS — Maslach Burnout Inventory</p>
                  <p>Misura il livello di <b>esaurimento emotivo</b> e depersonalizzazione. Gold standard per la valutazione del burnout (Maslach).</p>
                  <p class="mt-1 text-red-600 font-medium">⚠ Scala invertita: alto = peggio</p>
                </div>
                <div class="bg-white rounded-lg p-3 border border-amber-100">
                  <p class="font-semibold text-gray-900 mb-1">⚡ CBI — Copenhagen Burnout Inventory</p>
                  <p>Valuta il <b>carico di lavoro percepito</b> e lo stress organizzativo (Kristensen et al.).</p>
                  <p class="mt-1 text-red-600 font-medium">⚠ Scala invertita: alto = peggio</p>
                </div>
                <div class="bg-white rounded-lg p-3 border border-amber-100">
                  <p class="font-semibold text-gray-900 mb-1">💪 JD-R Motivazione (Bakker & Demerouti)</p>
                  <p>Misura <b>motivazione intrinseca e autonomia</b>. Risorse alte → engagement.</p>
                  <p class="mt-1 text-emerald-600 font-medium">✓ Alto = meglio</p>
                </div>
                <div class="bg-white rounded-lg p-3 border border-amber-100">
                  <p class="font-semibold text-gray-900 mb-1">🤝 JD-R Supporto (Bakker & Demerouti)</p>
                  <p>Valuta <b>supporto organizzativo</b> e chiarezza del ruolo.</p>
                  <p class="mt-1 text-emerald-600 font-medium">✓ Alto = meglio</p>
                </div>
                <div class="bg-white rounded-lg p-3 border border-amber-100">
                  <p class="font-semibold text-gray-900 mb-1">⚖️ WHO-5 — Well-Being Index (OMS)</p>
                  <p>Indice di <b>benessere e equilibrio vita-lavoro</b>. Validato in oltre 30 lingue.</p>
                  <p class="mt-1 text-emerald-600 font-medium">✓ Alto = meglio</p>
                </div>
                <div class="bg-white rounded-lg p-3 border border-amber-100">
                  <p class="font-semibold text-gray-900 mb-1">🏠 Mobley — Modello del Turnover (1977)</p>
                  <p>Misura l'<b>intenzione di restare</b> nell'organizzazione.</p>
                  <p class="mt-1 text-emerald-600 font-medium">✓ Alto = meglio</p>
                </div>
              </div>
            </details>

            <!-- Le 6 scale scientifiche -->
            <div class="space-y-5">
              <ScaleInput label="😓 Esaurimento emotivo (MBI-GS, Maslach)" v-model="pcForm.esaur" :inverted="true" hint="↑ = peggio" minLabel="1 = mai" maxLabel="5 = ogni giorno" />
              <ScaleInput label="⚡ Carico di lavoro (CBI, Copenhagen)" v-model="pcForm.carico" :inverted="true" hint="↑ = peggio" minLabel="1 = basso" maxLabel="5 = insostenibile" />
              <ScaleInput label="💪 Motivazione & Autonomia (JD-R, Bakker)" v-model="pcForm.motiv" hint="↑ = meglio" minLabel="1 = molto bassa" maxLabel="5 = molto alta" />
              <ScaleInput label="🤝 Supporto & Chiarezza (JD-R, Bakker)" v-model="pcForm.supp" hint="↑ = meglio" minLabel="1 = assente" maxLabel="5 = eccellente" />
              <ScaleInput label="⚖️ Equilibrio vita-lavoro (WHO-5)" v-model="pcForm.equil" hint="↑ = meglio" minLabel="1 = mai" maxLabel="5 = sempre" />
              <ScaleInput label="🏠 Intenzione di restare (Mobley)" v-model="pcForm.intent" hint="↑ = meglio" minLabel="1 = molto bassa" maxLabel="5 = molto alta" />
            </div>

            <div>
              <label class="form-label">Note colloquio</label>
              <textarea class="form-textarea" rows="3" v-model="pcForm.note" placeholder="Osservazioni, azioni concordate..."></textarea>
            </div>
          </div>
        </div>

        <!-- TAB: Storico -->
        <div v-if="modalTab === 'storico'">
          <div v-if="empStorico.length === 0" class="text-center py-10 text-gray-400">
            <div class="text-3xl mb-2">📂</div>
            Nessun colloquio nello storico. I colloqui precedenti verranno archiviati qui.
          </div>
          <div v-else class="space-y-3">
            <div v-for="(entry, idx) in empStorico" :key="entry.id || idx"
              :class="['p-4 rounded-lg border transition', idx === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200']">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-semibold text-gray-800">{{ fmtDateShort(entry.date) }}</span>
                  <span :class="['text-[10px] px-2 py-0.5 rounded-full font-medium',
                    entry.esito === 'Positivo' ? 'bg-green-100 text-green-700' :
                    entry.esito === 'Critico' ? 'bg-red-100 text-red-700' :
                    entry.esito === 'Urgente' ? 'bg-red-200 text-red-800' :
                    'bg-yellow-100 text-yellow-700']">{{ entry.esito || '—' }}</span>
                  <span v-if="entry.engagementScore != null" :class="['text-sm font-bold', scoreColor(entry.engagementScore)]">
                    Score: {{ entry.engagementScore }}
                  </span>
                </div>
                <button class="btn btn-ghost btn-xs text-red-400 hover:text-red-600" @click="deleteStoricoEntry(entry.id)" title="Elimina">🗑️</button>
              </div>
              <div class="grid grid-cols-6 gap-2 text-center">
                <div>
                  <div class="text-[10px] text-gray-400">😓 Esaur.</div>
                  <ScoreDot :value="entry.esaur" :inverted="true" />
                </div>
                <div>
                  <div class="text-[10px] text-gray-400">⚡ Carico</div>
                  <ScoreDot :value="entry.carico" :inverted="true" />
                </div>
                <div>
                  <div class="text-[10px] text-gray-400">💪 Motiv.</div>
                  <ScoreDot :value="entry.motiv" />
                </div>
                <div>
                  <div class="text-[10px] text-gray-400">🤝 Supp.</div>
                  <ScoreDot :value="entry.supp" />
                </div>
                <div>
                  <div class="text-[10px] text-gray-400">⚖️ Equil.</div>
                  <ScoreDot :value="entry.equil" />
                </div>
                <div>
                  <div class="text-[10px] text-gray-400">🏠 Intent.</div>
                  <ScoreDot :value="entry.intent" />
                </div>
              </div>
              <div v-if="entry.note" class="mt-2 text-xs text-gray-500 italic">{{ entry.note }}</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-secondary" @click="modal.open = false">Chiudi</button>
        <button v-if="modalTab === 'nuovo'" class="btn btn-primary" @click="savePCColloquio" :disabled="!pcForm.data">💾 Salva colloquio</button>
      </template>
    </Modal>

    <!-- PICKER DIPENDENTE per nuovo colloquio -->
    <Modal :open="picker.open" title="Seleziona dipendente" width="520px" @close="picker.open = false">
      <div class="space-y-3">
        <input v-model="picker.search" class="form-input" placeholder="🔍 Cerca per nome o team..." ref="pickerInput">
        <div class="max-h-72 overflow-y-auto space-y-1">
          <div v-for="e in pickerFiltered" :key="e.id"
            class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-primary-50 transition"
            @click="pickEmployee(e)">
            <div>
              <span class="text-sm font-medium text-gray-900">{{ e.nome }} {{ e.cognome }}</span>
              <span class="text-[10px] text-gray-400 ml-2">{{ e.team }}</span>
            </div>
            <span v-if="pcColl(e.id)?.date" class="badge badge-emerald text-[10px]">✓ Compilato</span>
            <span v-else class="badge badge-gray text-[10px]">Da fare</span>
          </div>
          <div v-if="pickerFiltered.length === 0" class="text-center py-6 text-gray-400 text-sm">Nessun risultato</div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import Modal from '@/components/ui/Modal.vue'
import Section from '@/components/ui/Section.vue'
import ScaleInput from '@/components/ui/ScaleInput.vue'
import ScoreDot from '@/components/ui/ScoreDot.vue'
import InfoBlock from '@/components/ui/InfoBlock.vue'
import KpiCard from '@/components/ui/KpiCard.vue'

const store = useHrStore()
const { fmtDateShort } = useHelpers()

const search = ref('')
const filterTeam = ref('')
const filterStato = ref('')
const sortCol = ref('nome')
const sortDir = ref('asc')
const modalTab = ref('nuovo')

const modalTabs = [
  { key: 'nuovo', label: 'Nuovo colloquio', icon: '✏️' },
  { key: 'storico', label: 'Storico', icon: '📂' }
]

const pcCollMap = computed(() => {
  const map = {}
  store.colloquiPC.forEach(c => { map[c.employeeId] = c })
  return map
})

const pcColl = (empId) => pcCollMap.value[empId]
const pcCollDate = (empId) => pcCollMap.value[empId]?.date ? fmtDateShort(pcCollMap.value[empId].date) : '—'
const storicoCount = (empId) => (pcCollMap.value[empId]?.storico || []).length

const stats = computed(() => {
  const total = store.enrichedEmployees.length
  const compilati = store.colloquiPC.filter(c => c.date).length
  return {
    compilati,
    daFare: total - compilati,
    copertura: total > 0 ? Math.round(compilati / total * 100) : 0
  }
})

const kpi = computed(() => {
  const colls = store.colloquiPC.filter(c => c.date)
  if (colls.length === 0) return { esaur: '—', carico: '—', motiv: '—', supp: '—', equil: '—', intent: '—' }
  const avg = (key) => {
    const vals = colls.map(c => c[key]).filter(v => v != null)
    return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—'
  }
  return { esaur: avg('esaur'), carico: avg('carico'), motiv: avg('motiv'), supp: avg('supp'), equil: avg('equil'), intent: avg('intent') }
})

function scoreColor(score) {
  if (score == null) return 'text-gray-400'
  if (score <= 2) return 'text-red-600'
  if (score <= 3) return 'text-amber-600'
  return 'text-emerald-600'
}

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  let list = [...store.enrichedEmployees]

  if (s) list = list.filter(e => (e.nome + ' ' + e.cognome).toLowerCase().includes(s) || (e.team || '').toLowerCase().includes(s))
  if (filterTeam.value) list = list.filter(e => e.team === filterTeam.value)
  if (filterStato.value === 'compilato') list = list.filter(e => pcColl(e.id)?.date)
  else if (filterStato.value === 'da_fare') list = list.filter(e => !pcColl(e.id)?.date)
  else if (filterStato.value === 'critico') list = list.filter(e => (pcColl(e.id)?.engagementScore || 999) <= 2)
  else if (filterStato.value === 'monitorare') list = list.filter(e => { const s = pcColl(e.id)?.engagementScore; return s != null && s > 2 && s <= 3 })

  list.sort((a, b) => {
    const col = sortCol.value
    if (col === 'score') {
      const sa = pcColl(a.id)?.engagementScore ?? -1
      const sb = pcColl(b.id)?.engagementScore ?? -1
      return sortDir.value === 'asc' ? sa - sb : sb - sa
    }
    let va = a[col], vb = b[col]
    if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase() }
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })

  return list
})

function toggleSort(col) {
  if (sortCol.value === col) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortCol.value = col; sortDir.value = 'asc' }
}

const modal = reactive({ open: false, emp: null })
const pcForm = reactive({ data: '', esaur: null, carico: null, motiv: null, supp: null, equil: null, intent: null, esito: '', note: '' })
const picker = reactive({ open: false, search: '' })

const pickerFiltered = computed(() => {
  const s = picker.search.toLowerCase()
  return store.enrichedEmployees.filter(e =>
    e.stato === 'Attivo' && (!s || (e.nome + ' ' + e.cognome).toLowerCase().includes(s) || (e.team || '').toLowerCase().includes(s))
  ).slice(0, 30)
})

function openNewColloquio() {
  picker.search = ''
  picker.open = true
}

function pickEmployee(e) {
  picker.open = false
  openModal(e)
}

const empStorico = computed(() => {
  if (!modal.emp) return []
  const coll = pcColl(modal.emp.id)
  return (coll?.storico || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''))
})

function openModal(e) {
  modal.emp = e
  modalTab.value = 'nuovo'
  // Reset form for new colloquio
  pcForm.data = new Date().toISOString().split('T')[0]
  pcForm.esaur = null
  pcForm.carico = null
  pcForm.motiv = null
  pcForm.supp = null
  pcForm.equil = null
  pcForm.intent = null
  pcForm.esito = 'Positivo'
  pcForm.note = ''
  modal.open = true
}

function savePCColloquio() {
  if (!modal.emp || !pcForm.data) return
  const update = {
    employeeId: modal.emp.id,
    date: pcForm.data,
    esaur: pcForm.esaur,
    carico: pcForm.carico,
    motiv: pcForm.motiv,
    supp: pcForm.supp,
    equil: pcForm.equil,
    intent: pcForm.intent,
    esito: pcForm.esito,
    note: pcForm.note
  }
  store.saveColloquioPC(modal.emp.id, update)
  modal.open = false
}

function deleteStoricoEntry(entryId) {
  if (!modal.emp || !entryId) return
  store.deletePCEntry(modal.emp.id, entryId)
}
</script>
