<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">🏥 Visite Mediche & Rinnovi</h2>
        <p class="text-sm text-gray-500 mt-1">Gestione appuntamenti medici e rinnovi contrattuali per dipendenti</p>
      </div>
      <div class="text-right">
        <div class="text-3xl font-bold text-amber-600">{{ totalVisite }}</div>
        <div class="text-xs text-gray-500">visite registrate</div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card p-4 border-l-4 border-red-500 bg-red-50">
        <div class="text-xs text-red-600 font-semibold uppercase">Visite Scadute</div>
        <div class="text-2xl font-bold text-red-700 mt-1">{{ visitiScadute }}</div>
      </div>
      <div class="card p-4 border-l-4 border-orange-500 bg-orange-50">
        <div class="text-xs text-orange-600 font-semibold uppercase">Entro 7 giorni</div>
        <div class="text-2xl font-bold text-orange-700 mt-1">{{ visitiEntro7gg }}</div>
      </div>
      <div class="card p-4 border-l-4 border-yellow-500 bg-yellow-50">
        <div class="text-xs text-yellow-600 font-semibold uppercase">Entro 30 giorni</div>
        <div class="text-2xl font-bold text-yellow-700 mt-1">{{ visitiEntro30gg }}</div>
      </div>
      <div class="card p-4 border-l-4 border-emerald-500 bg-emerald-50">
        <div class="text-xs text-emerald-600 font-semibold uppercase">Con Dati</div>
        <div class="text-2xl font-bold text-emerald-700 mt-1">{{ empConVisite }}/{{ totaleEmp }}</div>
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
        <option value="scadute">Visite scadute</option>
        <option value="urgenti">Entro 7 giorni</option>
        <option value="attenzione">Entro 30 giorni</option>
        <option value="senza">Senza visite</option>
      </select>
    </div>

    <!-- Sezione Visite Mediche per Dipendente -->
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
              <div class="text-xs text-gray-400">Visite</div>
              <div class="font-mono text-sm font-bold text-gray-900">{{ (emp.visite_mediche || []).length }}</div>
            </div>
            <svg :class="['w-5 h-5 transition-transform', expanded.includes(emp.id) ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        <!-- Expanded Content -->
        <div v-if="expanded.includes(emp.id)" class="px-5 py-4 bg-white space-y-4 border-t border-gray-100">
          <!-- Lista visite mediche -->
          <div v-if="!emp.visite_mediche || emp.visite_mediche.length === 0" class="text-center py-6 text-gray-400 text-sm">
            ℹ️ Nessuna visita medica registrata
          </div>

          <div v-else class="space-y-3">
            <div v-for="(visit, idx) in emp.visite_mediche" :key="idx" class="bg-gray-50 p-3 rounded border border-gray-200">
              <div class="flex items-start justify-between mb-2">
                <div class="font-semibold text-gray-900">{{ visit.tipo }}</div>
                <button @click="removeVisita(emp.id, idx)" class="text-red-400 hover:text-red-600 text-sm">✕</button>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div><strong>Data ultima:</strong> {{ visit.data_ultima ? fmtDateShort(visit.data_ultima) : '—' }}</div>
                <div><strong>Prossima:</strong> {{ visit.data_prossima ? fmtDateShort(visit.data_prossima) : '—' }}</div>
                <div><strong>Periodicità:</strong> {{ visit.periodicita_mesi || '—' }} mesi</div>
                <div><strong>Esito:</strong> {{ visit.esito || '—' }}</div>
              </div>
              <div v-if="visit.medico" class="text-xs text-gray-600 mt-2">
                <strong>Medico:</strong> {{ visit.medico }}{{ visit.struttura ? ' (' + visit.struttura + ')' : '' }}
              </div>
              <div v-if="visit.note" class="text-xs text-gray-600 mt-2 italic">{{ visit.note }}</div>
            </div>
          </div>

          <!-- Bottone aggiungi visita -->
          <button @click="openVisitaModal(emp)" class="btn btn-sm btn-primary w-full">+ Aggiungi visita medica</button>
        </div>
      </div>
    </div>

    <!-- INFO BANNER -->
    <div class="card bg-blue-50 border-l-4 border-blue-500 p-4">
      <div class="flex items-start gap-3">
        <div class="text-2xl pt-1">ℹ️</div>
        <div>
          <h4 class="font-semibold text-blue-900 mb-1">Gestione Visite Mediche</h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>🔵 <strong>Registra visite:</strong> Aggiungi visite mediche con data, medico e struttura</li>
            <li>🔵 <strong>Periodicità:</strong> Sistema riporta quando è passato il periodo di rinnovo</li>
            <li>🔵 <strong>Tracking:</strong> Monitora visite scadute e prossime scadenze dal dashboard</li>
            <li>🔵 <strong>Tipi visita:</strong> Cardiologia, Oculistica, Medicina Generale, etc.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL AGGIUNGI/MODIFICA VISITA -->
  <Modal :open="modal.open" @close="modal.open = false" width="max-w-md">
    <template #header>🏥 Aggiungi Visita Medica</template>
    <div class="space-y-4 py-4" v-if="modal.emp">
      <!-- Info dipendente -->
      <div class="bg-gray-50 p-3 rounded border border-gray-100">
        <p class="text-sm font-medium text-gray-900">{{ modal.emp.nome }} {{ modal.emp.cognome }}</p>
        <p class="text-xs text-gray-600">{{ modal.emp.team }}</p>
      </div>

      <!-- Form visita -->
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo di Visita</label>
          <select v-model="visitaForm.tipo" class="form-select">
            <option value="">— seleziona —</option>
            <option>Cardiologia</option>
            <option>Oculistica</option>
            <option>Medicina Generale</option>
            <option>Dermatologia</option>
            <option>Pneumologia</option>
            <option>Ortopedia</option>
            <option>Psichiatria</option>
            <option>Odontoiatria</option>
            <option>Audiologia</option>
            <option>Altro</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Ultima Visita</label>
          <input v-model="visitaForm.data_ultima" type="date" class="form-input">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Prossima Visita</label>
          <input v-model="visitaForm.data_prossima" type="date" class="form-input">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Periodicità (mesi)</label>
          <input v-model.number="visitaForm.periodicita_mesi" type="number" class="form-input" placeholder="12">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Esito</label>
          <select v-model="visitaForm.esito" class="form-select">
            <option value="">— seleziona —</option>
            <option>Normal</option>
            <option>Attenzione</option>
            <option>Critico</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Medico</label>
          <input v-model="visitaForm.medico" type="text" class="form-input" placeholder="Dr. Rossi">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Struttura</label>
          <input v-model="visitaForm.struttura" type="text" class="form-input" placeholder="Clinica XXX">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea v-model="visitaForm.note" class="form-textarea" rows="2" placeholder="Osservazioni..."></textarea>
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="modal.open = false" class="btn btn-ghost">Annulla</button>
      <button @click="saveVisita" class="btn btn-primary">💾 Salva</button>
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

const modal = reactive({ open: false, emp: null })
const visitaForm = reactive({
  tipo: '',
  data_ultima: '',
  data_prossima: '',
  periodicita_mesi: 12,
  esito: '',
  medico: '',
  struttura: '',
  note: ''
})

function initials(nome) {
  return nome.split(' ').map(w => w[0]).join('').toUpperCase()
}

function toggleExpanded(empId) {
  const idx = expanded.value.indexOf(empId)
  if (idx > -1) expanded.value.splice(idx, 1)
  else expanded.value.push(empId)
}

function openVisitaModal(emp) {
  modal.emp = emp
  modal.open = true
}

function saveVisita() {
  if (!modal.emp || !visitaForm.tipo) return

  const emp = store.employees.find(e => e.id === modal.emp.id)
  if (!emp.visite_mediche) emp.visite_mediche = []

  emp.visite_mediche.push({
    ...visitaForm,
    periodicita_mesi: visitaForm.periodicita_mesi || 12
  })

  store.updateEmployee(emp.id, { visite_mediche: emp.visite_mediche })

  visitaForm.tipo = ''
  visitaForm.data_ultima = ''
  visitaForm.data_prossima = ''
  visitaForm.periodicita_mesi = 12
  visitaForm.esito = ''
  visitaForm.medico = ''
  visitaForm.struttura = ''
  visitaForm.note = ''

  modal.open = false
}

function removeVisita(empId, idx) {
  const emp = store.employees.find(e => e.id === empId)
  if (!emp.visite_mediche) return
  emp.visite_mediche.splice(idx, 1)
  store.updateEmployee(emp.id, { visite_mediche: emp.visite_mediche })
}

const empWithVisite = computed(() => {
  return store.employees.filter(e => e.visite_mediche && e.visite_mediche.length > 0)
})

const totalVisite = computed(() => {
  return store.employees.reduce((sum, e) => sum + (e.visite_mediche?.length || 0), 0)
})

const visitiScadute = computed(() => {
  const today = new Date()
  let count = 0
  store.employees.forEach(e => {
    (e.visite_mediche || []).forEach(v => {
      if (v.data_prossima && new Date(v.data_prossima) < today) count++
    })
  })
  return count
})

const visitiEntro7gg = computed(() => {
  const today = new Date()
  const future = new Date(); future.setDate(future.getDate() + 7)
  let count = 0
  store.employees.forEach(e => {
    (e.visite_mediche || []).forEach(v => {
      if (v.data_prossima) {
        const d = new Date(v.data_prossima)
        if (d >= today && d <= future) count++
      }
    })
  })
  return count
})

const visitiEntro30gg = computed(() => {
  const today = new Date()
  const future = new Date(); future.setDate(future.getDate() + 30)
  let count = 0
  store.employees.forEach(e => {
    (e.visite_mediche || []).forEach(v => {
      if (v.data_prossima) {
        const d = new Date(v.data_prossima)
        if (d >= today && d <= future) count++
      }
    })
  })
  return count
})

const empConVisite = computed(() => empWithVisite.value.length)
const totaleEmp = computed(() => store.employees.length)

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  let list = store.employees

  if (filterStatus.value === 'scadute') {
    list = list.filter(e => visitiScadute.value > 0 && (e.visite_mediche?.some(v => v.data_prossima && new Date(v.data_prossima) < new Date()) || false))
  } else if (filterStatus.value === 'urgenti') {
    list = list.filter(e => visitiEntro7gg.value > 0 && (e.visite_mediche?.some(v => {
      const d = new Date(v.data_prossima || '')
      return d >= new Date() && d <= new Date(Date.now() + 7 * 86400000)
    }) || false))
  } else if (filterStatus.value === 'attenzione') {
    list = list.filter(e => visitiEntro30gg.value > 0 && (e.visite_mediche?.some(v => {
      const d = new Date(v.data_prossima || '')
      return d >= new Date() && d <= new Date(Date.now() + 30 * 86400000)
    }) || false))
  } else if (filterStatus.value === 'senza') {
    list = list.filter(e => !e.visite_mediche || e.visite_mediche.length === 0)
  }

  return list.filter(e => {
    const matchSearch = !s || e.nome.toLowerCase().includes(s) || e.cognome.toLowerCase().includes(s) || e.team.toLowerCase().includes(s)
    const matchTeam = !filterTeam.value || e.team === filterTeam.value
    return matchSearch && matchTeam
  })
})
</script>
