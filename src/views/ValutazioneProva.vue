<template>
  <div class="p-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">🎯 Valutazione Periodi di Prova</h2>
        <p class="text-sm text-gray-500 mt-1">Gestione timeline: FU1 → FU2Manager → FU2Dip → Fine Prova → Decisione CEO</p>
      </div>
      <div class="text-right">
        <div class="text-3xl font-bold text-primary-600">{{ inCorso.length }}</div>
        <div class="text-xs text-gray-500">dipendenti in prova</div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="card p-4 border-l-4 border-blue-500 bg-blue-50">
        <div class="text-xs text-blue-600 font-semibold uppercase">In Corso</div>
        <div class="text-2xl font-bold text-blue-700 mt-1">{{ inCorso.length }}</div>
      </div>
      <div class="card p-4 border-l-4 border-red-500 bg-red-50">
        <div class="text-xs text-red-600 font-semibold uppercase">Scaduti</div>
        <div class="text-2xl font-bold text-red-700 mt-1">{{ scaduti.length }}</div>
      </div>
      <div class="card p-4 border-l-4 border-orange-500 bg-orange-50">
        <div class="text-xs text-orange-600 font-semibold uppercase">Entro 7gg</div>
        <div class="text-2xl font-bold text-orange-700 mt-1">{{ entro7gg.length }}</div>
      </div>
      <div class="card p-4 border-l-4 border-yellow-500 bg-yellow-50">
        <div class="text-xs text-yellow-600 font-semibold uppercase">Entro 30gg</div>
        <div class="text-2xl font-bold text-yellow-700 mt-1">{{ entro30gg.length }}</div>
      </div>
      <div class="card p-4 border-l-4 border-emerald-500 bg-emerald-50">
        <div class="text-xs text-emerald-600 font-semibold uppercase">Completate</div>
        <div class="text-2xl font-bold text-emerald-700 mt-1">{{ completate.length }}</div>
      </div>
    </div>

    <!-- Filtri -->
    <div class="flex flex-wrap items-center gap-3">
      <input v-model="search" class="form-input max-w-xs" placeholder="🔍 Cerca dipendente...">
      <select v-model="filterTeam" class="form-select w-44">
        <option value="">Tutti i team</option>
        <option v-for="t in store.teams" :key="t">{{ t }}</option>
      </select>
      <select v-model="filterStatus" class="form-select w-44">
        <option value="">Tutti gli stati</option>
        <option value="scaduti">Scaduti</option>
        <option value="urgenti">Entro 7 giorni</option>
        <option value="attenzione">Entro 30 giorni</option>
        <option value="ok">In corso</option>
        <option value="completate">Completate</option>
      </select>
    </div>

    <!-- Elenco dipendenti con timeline -->
    <div class="space-y-4">
      <div v-if="filtered.length === 0" class="card p-8 text-center text-gray-400">
        Nessun dipendente corrisponde ai criteri selezionati
      </div>

      <div v-for="emp in filtered" :key="emp.id" class="card overflow-hidden">
        <!-- Header -->
        <div class="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleExpanded(emp.id)">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
              {{ initials(emp.nome) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900">{{ emp.nome }} {{ emp.cognome }}</div>
              <div class="text-xs text-gray-500">{{ emp.team }} · {{ emp.livelloCCNL }}</div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="text-xs text-gray-400">Fine prova</div>
              <div class="font-mono text-sm font-bold" :class="{'text-red-600': emp.daysToProva <= 0, 'text-orange-600': emp.daysToProva <= 7, 'text-yellow-600': emp.daysToProva <= 30}">
                {{ fmtDateShort(emp.fineProva) }}
              </div>
              <div class="text-xs text-gray-500">{{ emp.daysToProva }}gg</div>
            </div>
            <svg :class="['w-5 h-5 transition-transform', expanded.includes(emp.id) ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        <!-- Timeline -->
        <div v-if="expanded.includes(emp.id)" class="px-5 py-4 bg-white space-y-5">
          <!-- Timeline visiva -->
          <div class="relative">
            <div class="absolute top-5 left-0 right-0 h-1 bg-gray-200"></div>
            <div class="absolute top-5 left-0 h-1" :style="{ width: progressPct(emp) + '%', backgroundColor: progressColor(emp) }"></div>

            <div class="relative flex justify-between">
              <!-- FU1 -->
              <div class="text-center">
                <div :class="['w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-white text-sm', emp.statoFU1 === 'Fatto' ? 'bg-emerald-500' : 'bg-gray-400']">
                  ✓
                </div>
                <div class="text-xs font-medium text-gray-700">FU1</div>
                <div class="text-xs text-gray-500">30gg</div>
                <div class="text-xs text-gray-400 mt-1">{{ fmtDateShort(emp.scadenzaFU1) }}</div>
              </div>

              <!-- FU2Manager -->
              <div class="text-center">
                <div :class="['w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-white text-sm', emp.statoFU2Manager === 'Fatto' ? 'bg-emerald-500' : 'bg-gray-400']">
                  ✓
                </div>
                <div class="text-xs font-medium text-gray-700">FU2M</div>
                <div class="text-xs text-gray-500">45gg</div>
                <div class="text-xs text-gray-400 mt-1">{{ fmtDateShort(emp.scadenzaFU2Manager) }}</div>
              </div>

              <!-- FU2Dip -->
              <div class="text-center">
                <div :class="['w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-white text-sm', emp.statoFU2Dip === 'Fatto' ? 'bg-emerald-500' : 'bg-gray-400']">
                  ✓
                </div>
                <div class="text-xs font-medium text-gray-700">FU2D</div>
                <div class="text-xs text-gray-500">30d prima fine</div>
                <div class="text-xs text-gray-400 mt-1">{{ fmtDateShort(emp.scadenzaFU2) }}</div>
              </div>

              <!-- Fine prova -->
              <div class="text-center">
                <div :class="['w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-white text-sm', emp.esitoProva ? 'bg-blue-500' : 'bg-gray-400']">
                  🏁
                </div>
                <div class="text-xs font-medium text-gray-700">Fine Prova</div>
                <div class="text-xs text-gray-500">{{ emp.durataProva }}</div>
                <div class="text-xs text-gray-400 mt-1">{{ fmtDateShort(emp.fineProva) }}</div>
              </div>

              <!-- Decisione CEO -->
              <div class="text-center">
                <div :class="['w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-white text-sm', getValutazioneCEO(emp.id) ? 'bg-emerald-500' : 'bg-gray-400']">
                  👔
                </div>
                <div class="text-xs font-medium text-gray-700">Decision CEO</div>
                <div class="text-xs text-gray-500">Rinnovo/No</div>
                <div v-if="getValutazioneCEO(emp.id)" class="text-xs font-bold mt-1" :class="{'text-emerald-600': getValutazioneCEO(emp.id).decisione === 'Rinnovo', 'text-red-600': getValutazioneCEO(emp.id).decisione === 'Non Rinnovo'}">
                  {{ getValutazioneCEO(emp.id).decisione }}
                </div>
              </div>
            </div>
          </div>

          <!-- Valutazioni -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
            <!-- Valutazione Manager -->
            <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 class="font-semibold text-blue-900 text-sm mb-3">👨‍💼 Valutazione Manager</h4>
              <button v-if="!getValutazioneManager(emp.id)" @click="openValutazione(emp, 'manager')" class="btn btn-sm btn-primary w-full mb-2">
                Aggiungi valutazione
              </button>
              <div v-else class="space-y-2">
                <p class="text-xs text-blue-700"><strong>Data:</strong> {{ fmtDateShort(getValutazioneManager(emp.id).data) }}</p>
                <p class="text-xs text-blue-700"><strong>Voto:</strong> {{ getValutazioneManager(emp.id).voto }}/10</p>
                <p class="text-xs text-blue-700"><strong>Note:</strong> {{ getValutazioneManager(emp.id).note }}</p>
                <button @click="openValutazione(emp, 'manager')" class="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2">
                  ✎ Modifica
                </button>
              </div>
            </div>

            <!-- Valutazione HR -->
            <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 class="font-semibold text-purple-900 text-sm mb-3">👩‍💼 Valutazione HR</h4>
              <button v-if="!getValutazioneHR(emp.id)" @click="openValutazione(emp, 'hr')" class="btn btn-sm btn-primary w-full mb-2">
                Aggiungi valutazione
              </button>
              <div v-else class="space-y-2">
                <p class="text-xs text-purple-700"><strong>Data:</strong> {{ fmtDateShort(getValutazioneHR(emp.id).data) }}</p>
                <p class="text-xs text-purple-700"><strong>Voto:</strong> {{ getValutazioneHR(emp.id).voto }}/10</p>
                <p class="text-xs text-purple-700"><strong>Note:</strong> {{ getValutazioneHR(emp.id).note }}</p>
                <button @click="openValutazione(emp, 'hr')" class="text-xs text-purple-600 hover:text-purple-800 font-medium mt-2">
                  ✎ Modifica
                </button>
              </div>
            </div>

            <!-- Decisione CEO -->
            <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <h4 class="font-semibold text-amber-900 text-sm mb-3">👑 Decisione CEO</h4>
              <button v-if="!getValutazioneCEO(emp.id)" @click="openValutazione(emp, 'ceo')" class="btn btn-sm btn-primary w-full mb-2">
                Registra decisione
              </button>
              <div v-else class="space-y-2">
                <p class="text-xs text-amber-700"><strong>Data:</strong> {{ fmtDateShort(getValutazioneCEO(emp.id).data) }}</p>
                <p :class="['text-xs font-bold', getValutazioneCEO(emp.id).decisione === 'Rinnovo' ? 'text-emerald-700' : 'text-red-700']">
                  <strong>Decisione:</strong> {{ getValutazioneCEO(emp.id).decisione }}
                </p>
                <p class="text-xs text-amber-700"><strong>Note:</strong> {{ getValutazioneCEO(emp.id).note }}</p>
                <button @click="openValutazione(emp, 'ceo')" class="text-xs text-amber-600 hover:text-amber-800 font-medium mt-2">
                  ✎ Modifica
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- INFO BANNER -->
    <div class="card bg-blue-50 border-l-4 border-blue-500 p-4">
      <div class="flex items-start gap-3">
        <div class="text-2xl pt-1">ℹ️</div>
        <div>
          <h4 class="font-semibold text-blue-900 mb-1">Processo di Valutazione della Prova</h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>🔵 <strong>FU1 (30gg):</strong> Colloquio dipendente + Manager Assessment</li>
            <li>🔵 <strong>FU2 Manager (45gg):</strong> Valutazione formale del Manager</li>
            <li>🔵 <strong>FU2 Dipendente (30d prima fine):</strong> Autovalutazione dipendente</li>
            <li>🔵 <strong>Fine Prova:</strong> Data di scadenza del periodo di prova</li>
            <li>👑 <strong>Decisione CEO:</strong> Rinnovo del contratto o conclusione</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL VALUTAZIONE -->
  <Modal :open="modal.open" @close="modal.open = false" width="max-w-2xl">
    <template #header>{{ getModalTitle() }}</template>
    <div class="space-y-4 py-4">
      <!-- Dipendente info -->
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p class="text-sm font-medium text-gray-900">{{ modal.emp?.nome }} {{ modal.emp?.cognome }}</p>
        <p class="text-xs text-gray-600">{{ modal.emp?.team }}</p>
      </div>

      <!-- Data -->
      <div>
        <label class="form-label">Data valutazione</label>
        <input v-model="valutazioneForm.data" type="date" class="form-input">
      </div>

      <!-- Voto (per manager e HR) -->
      <div v-if="modal.tipo !== 'ceo'">
        <label class="form-label">Voto (1-10)</label>
        <input v-model.number="valutazioneForm.voto" type="range" min="1" max="10" class="w-full">
        <div class="text-sm text-gray-600 mt-1">{{ valutazioneForm.voto }}/10</div>
      </div>

      <!-- Decisione (per CEO) -->
      <div v-else>
        <label class="form-label">Decisione</label>
        <select v-model="valutazioneForm.decisione" class="form-select">
          <option>Rinnovo</option>
          <option>Non Rinnovo</option>
        </select>
      </div>

      <!-- Note -->
      <div>
        <label class="form-label">Note valutazione</label>
        <textarea v-model="valutazioneForm.note" class="form-textarea" rows="4" placeholder="Osservazioni, feedback, motivazioni..."></textarea>
      </div>
    </div>
    <template #footer>
      <button @click="modal.open = false" class="btn btn-ghost">Annulla</button>
      <button @click="saveValutazione" class="btn btn-primary">💾 Salva valutazione</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import Modal from '@/components/ui/Modal.vue'

const store = useHrStore()
const { fmtDateShort } = useHelpers()

const search = ref('')
const filterTeam = ref('')
const filterStatus = ref('')
const expanded = ref([])

// Valutazioni stored in local state (in future in store)
const valutazioni = reactive({
  manager: {}, // { empId: { data, voto, note } }
  hr: {},      // { empId: { data, voto, note } }
  ceo: {}      // { empId: { data, decisione, note } }
})

const modal = reactive({ open: false, emp: null, tipo: null })
const valutazioneForm = reactive({ data: '', voto: 5, decisione: 'Rinnovo', note: '' })

const inCorso = computed(() => store.employees.filter(e => e.stato === 'Attivo' && e.esitoProva === 'In Corso'))
const scaduti = computed(() => {
  const today = new Date()
  return inCorso.value.filter(e => {
    const fine = new Date(e.fineProva)
    return fine < today
  })
})
const entro7gg = computed(() => {
  const today = new Date()
  return inCorso.value.filter(e => {
    const fine = new Date(e.fineProva)
    const days = Math.round((fine - today) / 86400000)
    return days > 0 && days <= 7
  })
})
const entro30gg = computed(() => {
  const today = new Date()
  return inCorso.value.filter(e => {
    const fine = new Date(e.fineProva)
    const days = Math.round((fine - today) / 86400000)
    return days > 7 && days <= 30
  })
})
const completate = computed(() => store.employees.filter(e => e.esitoProva === 'Superato' || e.esitoProva === 'Non Superato'))

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  let list = inCorso.value

  if (filterStatus.value === 'scaduti') list = scaduti.value
  else if (filterStatus.value === 'urgenti') list = entro7gg.value
  else if (filterStatus.value === 'attenzione') list = entro30gg.value
  else if (filterStatus.value === 'completate') list = completate.value

  return list.filter(e => {
    const matchSearch = !s || e.nome.toLowerCase().includes(s) || e.cognome.toLowerCase().includes(s) || e.team.toLowerCase().includes(s)
    const matchTeam = !filterTeam.value || e.team === filterTeam.value
    return matchSearch && matchTeam
  })
})

function initials(nome) {
  return nome.split(' ').map(w => w[0]).join('').toUpperCase()
}

function progressPct(emp) {
  let pct = 0
  if (emp.statoFU1 === 'Fatto') pct += 20
  if (emp.statoFU2Manager === 'Fatto') pct += 20
  if (emp.statoFU2Dip === 'Fatto') pct += 20
  if (emp.esitoProva && emp.esitoProva !== 'In Corso') pct += 20
  if (getValutazioneCEO(emp.id)) pct += 20
  return pct
}

function progressColor(emp) {
  const pct = progressPct(emp)
  if (pct === 100) return '#10b981' // emerald
  if (pct >= 60) return '#f59e0b'   // amber
  if (pct >= 20) return '#3b82f6'   // blue
  return '#ef4444'                   // red
}

function toggleExpanded(empId) {
  const idx = expanded.value.indexOf(empId)
  if (idx > -1) expanded.value.splice(idx, 1)
  else expanded.value.push(empId)
}

function getValutazioneManager(empId) {
  return valutazioni.manager[empId]
}

function getValutazioneHR(empId) {
  return valutazioni.hr[empId]
}

function getValutazioneCEO(empId) {
  return valutazioni.ceo[empId]
}

function openValutazione(emp, tipo) {
  modal.emp = emp
  modal.tipo = tipo
  const existing =
    tipo === 'manager' ? valutazioni.manager[emp.id] :
    tipo === 'hr' ? valutazioni.hr[emp.id] :
    valutazioni.ceo[emp.id]

  if (existing) {
    valutazioneForm.data = existing.data || ''
    valutazioneForm.voto = existing.voto || 5
    valutazioneForm.decisione = existing.decisione || 'Rinnovo'
    valutazioneForm.note = existing.note || ''
  } else {
    valutazioneForm.data = ''
    valutazioneForm.voto = 5
    valutazioneForm.decisione = 'Rinnovo'
    valutazioneForm.note = ''
  }
  modal.open = true
}

function getModalTitle() {
  if (!modal.emp) return ''
  const tipo = modal.tipo === 'manager' ? 'Manager' : modal.tipo === 'hr' ? 'HR' : 'CEO'
  return `Valutazione ${tipo} — ${modal.emp.nome} ${modal.emp.cognome}`
}

function saveValutazione() {
  if (!modal.emp) return
  const data = {
    data: valutazioneForm.data,
    note: valutazioneForm.note
  }
  if (modal.tipo !== 'ceo') {
    data.voto = valutazioneForm.voto
  } else {
    data.decisione = valutazioneForm.decisione
  }

  if (modal.tipo === 'manager') {
    valutazioni.manager[modal.emp.id] = data
  } else if (modal.tipo === 'hr') {
    valutazioni.hr[modal.emp.id] = data
  } else if (modal.tipo === 'ceo') {
    valutazioni.ceo[modal.emp.id] = data
  }

  modal.open = false
}
</script>
