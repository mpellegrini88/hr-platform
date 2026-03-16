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
      <select v-model="sortBy" class="form-select w-48">
        <option value="urgenza">Ordina per Urgenza</option>
        <option value="nome">Ordina per Nome A-Z</option>
        <option value="cognome">Ordina per Cognome A-Z</option>
      </select>
    </div>

    <!-- Tabella Visite Mediche -->
    <div class="card overflow-hidden">
      <div v-if="filtered.length === 0" class="p-8 text-center text-gray-400">
        Nessun dipendente corrisponde ai criteri selezionati
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Dipendente</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Team</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Tipo Visita</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700">Ultima Visita</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700">Scadenza Prossima</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700">Giorni</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="row in tableRows" :key="row.key" :class="['hover:bg-gray-50 transition-colors', getRowClass(row)]">
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="font-medium text-gray-900">{{ row.nome }} {{ row.cognome }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="text-xs text-gray-600">{{ row.team }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="text-xs text-gray-700">{{ row.tipo }}</span>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <span class="text-xs text-gray-600">{{ row.data_ultima }}</span>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <span :class="['text-sm font-semibold', getDateTdColor(row.data_prossima)]">{{ row.data_prossima }}</span>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <span :class="['text-sm font-semibold', getGiorniClass(row.giorni)]">{{ row.giorni !== null ? row.giorni : '—' }}</span>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <button @click="openVisitaDetail(row)" :class="['text-xs px-2 py-1 rounded font-medium', getStatusBadgeClass(row)]">
                {{ getStatusText(row) }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- INFO BANNER -->
    <div class="card bg-blue-50 border-l-4 border-blue-500 p-4">
      <div class="flex items-start gap-3">
        <div class="text-2xl pt-1">ℹ️</div>
        <div>
          <h4 class="font-semibold text-blue-900 mb-1">Gestione Visite Mediche</h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>🔵 <strong>Registra visite:</strong> Aggiungi visite di idoneità medica con date di rinnovo</li>
            <li>🔵 <strong>Periodicità:</strong> Sistema riporta quando è passato il periodo di rinnovo</li>
            <li>🔵 <strong>Tracking:</strong> Monitora visite scadute e prossime scadenze dal dashboard</li>
            <li>🔵 <strong>Priorità:</strong> Visualizzazione ordinata per urgenza (scadenti prima)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL AGGIUNGI/MODIFICA VISITA -->
  <Modal :open="modal.open" @close="closeVisitaModal" width="max-w-md">
    <template #header>🏥 {{ modal.selectedVisita !== null ? 'Modifica' : 'Aggiungi' }} Visita Medica</template>
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
            <option>Idoneità Medica</option>
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
const sortBy = ref('urgenza')

const modal = reactive({ open: false, emp: null, selectedVisita: null })
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

function openVisitaModal(emp) {
  modal.emp = emp
  modal.selectedVisita = null
  resetVisitaForm()
  modal.open = true
}

function resetVisitaForm() {
  visitaForm.tipo = ''
  visitaForm.data_ultima = ''
  visitaForm.data_prossima = ''
  visitaForm.periodicita_mesi = 12
  visitaForm.esito = ''
  visitaForm.medico = ''
  visitaForm.struttura = ''
  visitaForm.note = ''
}

function closeVisitaModal() {
  modal.open = false
  modal.selectedVisita = null
  resetVisitaForm()
}

function saveVisita() {
  if (!modal.emp || !visitaForm.tipo) return

  const emp = store.employees.find(e => e.id === modal.emp.id)
  if (!emp.visite_mediche) emp.visite_mediche = []

  const visita = {
    ...visitaForm,
    periodicita_mesi: visitaForm.periodicita_mesi || 12
  }

  // Se modal.selectedVisita è valorizzato, modifico la visita esistente
  if (modal.selectedVisita !== null) {
    emp.visite_mediche[modal.selectedVisita] = visita
  } else {
    // Altrimenti aggiungo una nuova visita
    emp.visite_mediche.push(visita)
  }

  store.updateEmployee(emp.id, { visite_mediche: emp.visite_mediche })

  closeVisitaModal()
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

function getDateColor(dateStr) {
  if (!dateStr) return 'text-gray-600'
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  
  // Se è passato = scaduto = rosso scuro
  if (date < today) {
    return 'text-red-700 font-semibold'
  }
  
  // Se è nel 2026
  if (date.getFullYear() === 2026) {
    // Calcola se è entro 6 mesi da oggi
    const sixMonthsLater = new Date()
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)
    
    if (date <= sixMonthsLater) {
      // Rosso se scade entro 6 mesi
      return 'text-red-600 font-semibold'
    } else {
      // Arancione se scade tra più di 6 mesi ma entro l'anno
      return 'text-orange-500 font-semibold'
    }
  }
  
  // Se è oltre il 2026 = neurto
  return 'text-gray-600'
}

function getDaysToDate(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  return Math.round((date - today) / 86400000)
}

function getGiorniClass(giorni) {
  if (giorni === null) return 'text-gray-400'
  if (giorni < 0) return 'text-red-700 font-bold'
  if (giorni <= 30) return 'text-red-600 font-bold'
  if (giorni <= 180) return 'text-orange-500 font-semibold'
  return 'text-gray-600'
}

function getDateTdColor(dateStr) {
  if (!dateStr) return 'text-gray-400'
  const giorni = getDaysToDate(dateStr)
  if (giorni < 0) return 'text-red-700 font-bold bg-red-50 px-2 py-1 rounded'
  if (giorni <= 30) return 'text-red-600 font-bold bg-red-50 px-2 py-1 rounded'
  if (giorni <= 180) return 'text-orange-500 font-semibold bg-orange-50 px-2 py-1 rounded'
  return 'text-gray-600'
}

function getStatusText(row) {
  const giorni = getDaysToDate(row.data_prossima)
  if (!row.data_prossima) return 'Senza data'
  if (giorni < 0) return `Scaduta da ${Math.abs(giorni)}gg`
  if (giorni === 0) return 'Scade oggi'
  if (giorni <= 7) return `Entro ${giorni}gg`
  if (giorni <= 30) return `Entro ${Math.round(giorni/7)}w`
  return 'In pianificazione'
}

function getStatusBadgeClass(row) {
  const giorni = getDaysToDate(row.data_prossima)
  if (!row.data_prossima) return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  if (giorni < 0) return 'bg-red-600 text-white hover:bg-red-700'
  if (giorni <= 7) return 'bg-red-500 text-white hover:bg-red-600'
  if (giorni <= 30) return 'bg-orange-500 text-white hover:bg-orange-600'
  if (giorni <= 180) return 'bg-amber-400 text-white hover:bg-amber-500'
  return 'bg-gray-300 text-gray-700 hover:bg-gray-400'
}

function getRowClass(row) {
  const giorni = getDaysToDate(row.data_prossima)
  if (!row.data_prossima) return 'bg-white'
  if (giorni < 0) return 'bg-red-50 border-l-4 border-red-600'
  if (giorni <= 7) return 'bg-red-50 border-l-4 border-red-500'
  if (giorni <= 30) return 'bg-orange-50 border-l-4 border-orange-500'
  if (giorni <= 180) return 'bg-yellow-50'
  return 'bg-white'
}

function openVisitaDetail(row) {
  const emp = store.employees.find(e => e.id === row.empId)
  if (emp && row.visitaIdx !== null) {
    modal.emp = emp
    modal.selectedVisita = row.visitaIdx
    // Carica i dati della visita nel form
    const visita = emp.visite_mediche[row.visitaIdx]
    if (visita) {
      visitaForm.tipo = visita.tipo || ''
      visitaForm.data_ultima = visita.data_ultima || ''
      visitaForm.data_prossima = visita.data_prossima || ''
      visitaForm.periodicita_mesi = visita.periodicita_mesi || 12
      visitaForm.esito = visita.esito || ''
      visitaForm.medico = visita.medico || ''
      visitaForm.struttura = visita.struttura || ''
      visitaForm.note = visita.note || ''
    }
    modal.open = true
  }
}

const tableRows = computed(() => {
  const rows = []
  filtered.value.forEach(emp => {
    if (emp.visite_mediche && emp.visite_mediche.length > 0) {
      emp.visite_mediche.forEach((visit, idx) => {
        const giorni = getDaysToDate(visit.data_prossima)
        rows.push({
          empId: emp.id,
          visitaIdx: idx,
          key: `${emp.id}-${idx}`,
          nome: emp.nome,
          cognome: emp.cognome,
          team: emp.team,
          tipo: visit.tipo,
          data_ultima: visit.data_ultima ? new Date(visit.data_ultima).toLocaleDateString('it-IT') : '—',
          data_prossima: visit.data_prossima ? new Date(visit.data_prossima).toLocaleDateString('it-IT') : '—',
          giorni: giorni,
          visit: visit
        })
      })
    } else {
      rows.push({
        empId: emp.id,
        visitaIdx: null,
        key: `${emp.id}-empty`,
        nome: emp.nome,
        cognome: emp.cognome,
        team: emp.team,
        tipo: '—',
        data_ultima: '—',
        data_prossima: '—',
        giorni: null,
        visit: null
      })
    }
  })
  // Apply sorting based on sortBy selection
  if (sortBy.value === 'nome') {
    return rows.sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
  } else if (sortBy.value === 'cognome') {
    return rows.sort((a, b) => a.cognome.localeCompare(b.cognome, 'it'))
  } else {
    // 'urgenza' - sort by days (ascending, most urgent first)
    return rows.sort((a, b) => {
      const gA = a.giorni ?? 999999
      const gB = b.giorni ?? 999999
      return gA - gB
    })
  }
})

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let list = store.employees.filter(e => {
    return e.team !== 'Freelance' && e.tipoContratto !== 'freelance' && (!e.dataAssunzione || new Date(e.dataAssunzione) <= today)
  })

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
