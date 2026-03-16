<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">📥 Pre-Onboarding & Hiring Pipeline</h2>
        <p class="text-sm text-gray-500 mt-1">Gestisci le attività pre-ingresso con scadenze automatiche</p>
      </div>
      <button @click="newEmployeeModal.open = true" class="btn btn-primary">➕ Nuovo Dipendente</button>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card p-4 border-l-4 border-blue-500 bg-blue-50">
        <div class="text-xs text-blue-600 font-semibold uppercase">In Arrivo</div>
        <div class="text-2xl font-bold text-blue-700 mt-1">{{ prossimiIngressi.length }}</div>
      </div>
      <div class="card p-4 border-l-4 border-red-500 bg-red-50">
        <div class="text-xs text-red-600 font-semibold uppercase">Scrittura Scaduta</div>
        <div class="text-2xl font-bold text-red-700 mt-1">{{ getTaksOverdue('invioScritturaPrivata') }}</div>
      </div>
      <div class="card p-4 border-l-4 border-amber-500 bg-amber-50">
        <div class="text-xs text-amber-600 font-semibold uppercase">Task Urgenti (≤3gg)</div>
        <div class="text-2xl font-bold text-amber-700 mt-1">{{ getUrgentTasks() }}</div>
      </div>
      <div class="card p-4 border-l-4 border-emerald-500 bg-emerald-50">
        <div class="text-xs text-emerald-600 font-semibold uppercase">Completamento Medio</div>
        <div class="text-2xl font-bold text-emerald-700 mt-1">{{ avgCompletion }}%</div>
      </div>
    </div>

    <!-- List di dipendenti in arrivo -->
    <div v-if="prossimiIngressi.length === 0" class="card p-12 text-center text-gray-400">
      Nessun dipendente in arrivo
    </div>

    <div v-else class="space-y-4">
      <div v-for="emp in prossimiIngressi" :key="emp.id" class="card overflow-hidden">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {{ initials(emp.nome) }}
            </div>
            <div>
              <div class="font-semibold text-gray-900">{{ emp.nome }} {{ emp.cognome }}</div>
              <div class="text-xs text-gray-500">{{ emp.team }} · {{ emp.citta }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500">Ingresso</div>
            <div class="text-lg font-bold text-blue-600">{{ fmtDateShort(emp.dataAssunzione) }}</div>
            <div class="text-xs text-gray-500">{{ daysUntilHire(emp.dataAssunzione) }}gg</div>
          </div>
        </div>

        <!-- Tasks Timeline -->
        <div class="px-5 py-4 space-y-3">
          <!-- Task 1: Scrittura Privata (1 mese prima) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  :checked="emp.preoboardingChecklist?.invioScritturaPrivata || false"
                  @change="updateTask(emp.id, 'invioScritturaPrivata', $event.target.checked)"
                  class="w-4 h-4 rounded"
                >
                <span class="font-medium text-gray-900">📄 Invio Scrittura Privata allo Studio</span>
              </label>
              <span :class="['text-xs font-semibold px-2 py-1 rounded', getStatusBadge(emp, 'invioScritturaPrivata')]">
                {{ getTaskDaysLeft(emp, 'invioScritturaPrivata') }}
              </span>
            </div>
            <div class="ml-7 text-xs text-gray-600">
              <span class="font-medium">Scadenza:</span> {{ getTaskDeadline(emp, 'invioScritturaPrivata') }}
              <span class="ml-3">Entro 1 mese prima dell'ingresso</span>
            </div>
          </div>

          <!-- Task 2: Creazione Email & Teams (2 settimane prima) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  :checked="emp.preoboardingChecklist?.creazioneProfiliweb || false"
                  @change="updateTask(emp.id, 'creazioneProfiliweb', $event.target.checked)"
                  class="w-4 h-4 rounded"
                >
                <span class="font-medium text-gray-900">💻 Creazione Email e Profili (Teams, Sistema)</span>
              </label>
              <span :class="['text-xs font-semibold px-2 py-1 rounded', getStatusBadge(emp, 'creazioneProfiliweb')]">
                {{ getTaskDaysLeft(emp, 'creazioneProfiliweb') }}
              </span>
            </div>
            <div class="ml-7 text-xs text-gray-600">
              <span class="font-medium">Scadenza:</span> {{ getTaskDeadline(emp, 'creazioneProfiliweb') }}
              <span class="ml-3">Entro 2 settimane prima dell'ingresso</span>
            </div>
          </div>

          <!-- Task 3: Procedute (1 settimana prima) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  :checked="emp.preoboardingChecklist?.invioProcedure || false"
                  @change="updateTask(emp.id, 'invioProcedure', $event.target.checked)"
                  class="w-4 h-4 rounded"
                >
                <span class="font-medium text-gray-900">📋 Invio Procedure e Documentazione</span>
              </label>
              <span :class="['text-xs font-semibold px-2 py-1 rounded', getStatusBadge(emp, 'invioProcedure')]">
                {{ getTaskDaysLeft(emp, 'invioProcedure') }}
              </span>
            </div>
            <div class="ml-7 text-xs text-gray-600">
              <span class="font-medium">Scadenza:</span> {{ getTaskDeadline(emp, 'invioProcedure') }}
              <span class="ml-3">Entro 1 settimana prima dell'ingresso</span>
            </div>
          </div>

          <!-- Task 4: Contratti (1 settimana prima) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  :checked="emp.preoboardingChecklist?.invioContratti || false"
                  @change="updateTask(emp.id, 'invioContratti', $event.target.checked)"
                  class="w-4 h-4 rounded"
                >
                <span class="font-medium text-gray-900">✍️ Invio Contratti e Firmamento</span>
              </label>
              <span :class="['text-xs font-semibold px-2 py-1 rounded', getStatusBadge(emp, 'invioContratti')]">
                {{ getTaskDaysLeft(emp, 'invioContratti') }}
              </span>
            </div>
            <div class="ml-7 text-xs text-gray-600">
              <span class="font-medium">Scadenza:</span> {{ getTaskDeadline(emp, 'invioContratti') }}
              <span class="ml-3">Entro 1 settimana prima dell'ingresso</span>
            </div>
          </div>

          <!-- Task 5: Visita Medica (fino a 1 settimana dopo) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  :checked="emp.preoboardingChecklist?.visitaMedica || false"
                  @change="updateTask(emp.id, 'visitaMedica', $event.target.checked)"
                  class="w-4 h-4 rounded"
                >
                <span class="font-medium text-gray-900">🏥 Visita Medica Preventiva</span>
              </label>
              <span :class="['text-xs font-semibold px-2 py-1 rounded', getStatusBadge(emp, 'visitaMedica', true)]">
                {{ getTaskDaysLeft(emp, 'visitaMedica', true) }}
              </span>
            </div>
            <div class="ml-7 text-xs text-gray-600">
              <span class="font-medium">Termine:</span> {{ getTaskDeadline(emp, 'visitaMedica', true) }}
              <span class="ml-3">Fino a 1 settimana dopo l'ingresso</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-gray-700">Completamento Pre-Ingresso</span>
              <span class="text-xs font-bold text-gray-900">{{ getEmployeeCompletion(emp.id) }}/5</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all"
                :style="{ width: (getEmployeeCompletion(emp.id) / 5 * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NEW EMPLOYEE MODAL -->
    <Modal :open="newEmployeeModal.open" @close="newEmployeeModal.open = false" width="max-w-2xl">
      <template #header>
        <h2 class="text-xl font-bold text-gray-900">➕ Nuovo Dipendente in Arrivo</h2>
        <p class="text-sm text-gray-600 mt-1">Registra un nuovo dipendente con data di assunzione futura</p>
      </template>

      <div class="space-y-4">
        <!-- Row 1: Nome & Cognome -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Nome *</label>
            <input v-model="newEmployeeModal.form.nome" type="text" class="form-input" placeholder="es. Marco">
          </div>
          <div>
            <label class="form-label">Cognome *</label>
            <input v-model="newEmployeeModal.form.cognome" type="text" class="form-input" placeholder="es. Rossi">
          </div>
        </div>

        <!-- Row 2: Email & Città -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Email (opzionale)</label>
            <input v-model="newEmployeeModal.form.email" type="email" class="form-input" placeholder="nome.cognome@azienda.it">
          </div>
          <div>
            <label class="form-label">Città</label>
            <input v-model="newEmployeeModal.form.citta" type="text" class="form-input" placeholder="es. Lucca">
          </div>
        </div>

        <!-- Row 3: Team & Data Assunzione -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Team *</label>
            <select v-model="newEmployeeModal.form.team" class="form-select">
              <option value="">Seleziona team</option>
              <option v-for="t in store.teams" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="form-label">Data Assunzione *</label>
            <input v-model="newEmployeeModal.form.dataAssunzione" type="date" class="form-input">
          </div>
        </div>

        <!-- Row 4: Tipo Contratto & Livello CCNL -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Tipo Contratto *</label>
            <select v-model="newEmployeeModal.form.tipoContratto" class="form-select">
              <option value="">Seleziona tipo</option>
              <option value="indeterminato">Indeterminato</option>
              <option value="determinato">Determinato</option>
              <option value="apprendistato">Apprendistato</option>
              <option value="stage">Stage</option>
            </select>
          </div>
          <div>
            <label class="form-label">Livello CCNL (opzionale)</label>
            <input v-model="newEmployeeModal.form.livelloCCNL" type="text" class="form-input" placeholder="es. 1° Livello">
          </div>
        </div>

        <!-- Row 5: Ore Settimana -->
        <div>
          <label class="form-label">Ore Settimana (opzionale)</label>
          <input v-model.number="newEmployeeModal.form.oreSettimana" type="number" class="form-input" placeholder="es. 40">
        </div>

        <!-- Info box -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p class="text-xs text-blue-700">
            <strong>📌 Info:</strong> Le scadenze dei task saranno calcolate automaticamente in base alla data di ingresso.
          </p>
        </div>
      </div>

      <template #footer>
        <button @click="newEmployeeModal.open = false" class="btn btn-ghost">Annulla</button>
        <button @click="saveNewEmployee" class="btn btn-primary" :disabled="!newEmployeeModal.form.nome || !newEmployeeModal.form.cognome || !newEmployeeModal.form.dataAssunzione || !newEmployeeModal.form.team || !newEmployeeModal.form.tipoContratto">
          ✓ Crea Dipendente
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import Modal from '@/components/ui/Modal.vue'

const store = useHrStore()
const { fmtDateShort } = useHelpers()

const newEmployeeModal = reactive({
  open: false,
  form: {
    nome: '',
    cognome: '',
    email: '',
    citta: '',
    team: '',
    dataAssunzione: '',
    tipoContratto: '',
    livelloCCNL: '',
    oreSettimana: null
  }
})

function initials(nome) {
  return (nome || '').substring(0, 1).toUpperCase()
}

function daysUntilHire(dataAssunzione) {
  const today = new Date()
  const hire = new Date(dataAssunzione)
  return Math.round((hire - today) / 86400000)
}

function getTaskDeadline(emp, taskKey, isAfterHire = false) {
  const dataAssun = new Date(emp.dataAssunzione)
  let deadline

  if (isAfterHire) {
    // Visita medica: fino a 1 settimana DOPO ingresso
    deadline = new Date(dataAssun)
    deadline.setDate(deadline.getDate() + 7)
  } else {
    // Tutti gli altri task: giorni PRIMA
    const daysBeforeFromToday = taskKey === 'invioScritturaPrivata' ? 30 :
                                 taskKey === 'creazioneProfiliweb' ? 14 :
                                 taskKey === 'invioProcedure' ? 7 :
                                 taskKey === 'invioContratti' ? 7 : 0

    deadline = new Date(dataAssun)
    deadline.setDate(deadline.getDate() - daysBeforeFromToday)
  }

  return fmtDateShort(deadline.toISOString().split('T')[0])
}

function getTaskDaysLeft(emp, taskKey, isAfterHire = false) {
  const dataAssun = new Date(emp.dataAssunzione)
  let deadline

  if (isAfterHire) {
    deadline = new Date(dataAssun)
    deadline.setDate(deadline.getDate() + 7)
  } else {
    const daysBeforeFromToday = taskKey === 'invioScritturaPrivata' ? 30 :
                                 taskKey === 'creazioneProfiliweb' ? 14 :
                                 taskKey === 'invioProcedure' ? 7 :
                                 taskKey === 'invioContratti' ? 7 : 0

    deadline = new Date(dataAssun)
    deadline.setDate(deadline.getDate() - daysBeforeFromToday)
  }

  const today = new Date()
  const daysLeft = Math.round((deadline - today) / 86400000)

  if (isAfterHire && daysLeft < 0) {
    return `${Math.abs(daysLeft)}gg fa`
  } else if (!isAfterHire && daysLeft < 0) {
    return `SCADUTO ${Math.abs(daysLeft)}gg`
  } else {
    return `${daysLeft}gg`
  }
}

function getStatusBadge(emp, taskKey, isAfterHire = false) {
  const dataAssun = new Date(emp.dataAssunzione)
  let deadline

  if (isAfterHire) {
    deadline = new Date(dataAssun)
    deadline.setDate(deadline.getDate() + 7)
  } else {
    const daysBeforeFromToday = taskKey === 'invioScritturaPrivata' ? 30 :
                                 taskKey === 'creazioneProfiliweb' ? 14 :
                                 taskKey === 'invioProcedure' ? 7 :
                                 taskKey === 'invioContratti' ? 7 : 0

    deadline = new Date(dataAssun)
    deadline.setDate(deadline.getDate() - daysBeforeFromToday)
  }

  const today = new Date()
  const daysLeft = Math.round((deadline - today) / 86400000)

  if (emp.preoboardingChecklist?.[taskKey]) {
    return 'bg-emerald-100 text-emerald-700'
  } else if (daysLeft < 0 && !isAfterHire) {
    return 'bg-red-100 text-red-700'
  } else if (daysLeft <= 3) {
    return 'bg-red-100 text-red-700'
  } else if (daysLeft <= 7) {
    return 'bg-amber-100 text-amber-700'
  } else {
    return 'bg-gray-100 text-gray-700'
  }
}

const prossimiIngressi = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return store.enrichedEmployees
    .filter(e => {
      if (!e.dataAssunzione) return false
      const dataAssunzione = new Date(e.dataAssunzione)
      dataAssunzione.setHours(0, 0, 0, 0)
      return dataAssunzione > today
    })
    .sort((a, b) => new Date(a.dataAssunzione) - new Date(b.dataAssunzione))
})

function updateTask(empId, taskKey, isChecked) {
  store.updateEmployee(empId, {
    preoboardingChecklist: {
      ...(store.employees.find(e => e.id === empId)?.preoboardingChecklist || {}),
      [taskKey]: isChecked
    }
  })
}

function getEmployeeCompletion(empId) {
  const emp = store.employees.find(e => e.id === empId)
  const checklist = emp?.preoboardingChecklist || {}
  const tasks = Object.values(checklist).filter(v => v === true)
  return tasks.length
}

const avgCompletion = computed(() => {
  if (prossimiIngressi.length === 0) return 0
  const total = prossimiIngressi.reduce((sum, emp) => sum + getEmployeeCompletion(emp.id), 0)
  return Math.round((total / (prossimiIngressi.length * 5)) * 100)
})

function getUrgentTasks() {
  let count = 0
  prossimiIngressi.forEach(emp => {
    const tasks = ['invioScritturaPrivata', 'creazioneProfiliweb', 'invioProcedure', 'invioContratti', 'visitaMedica']
    tasks.forEach(task => {
      if (!emp.preoboardingChecklist?.[task]) {
        const dataAssun = new Date(emp.dataAssunzione)
        const isAfterHire = task === 'visitaMedica'
        let deadline

        if (isAfterHire) {
          deadline = new Date(dataAssun)
          deadline.setDate(deadline.getDate() + 7)
        } else {
          const daysBeforeFromToday = task === 'invioScritturaPrivata' ? 30 :
                                       task === 'creazioneProfiliweb' ? 14 :
                                       task === 'invioProcedure' ? 7 :
                                       task === 'invioContratti' ? 7 : 0
          deadline = new Date(dataAssun)
          deadline.setDate(deadline.getDate() - daysBeforeFromToday)
        }

        const today = new Date()
        const daysLeft = Math.round((deadline - today) / 86400000)

        if (daysLeft <= 3) count++
      }
    })
  })
  return count
}

function getTaksOverdue(taskKey) {
  let count = 0
  prossimiIngressi.forEach(emp => {
    if (!emp.preoboardingChecklist?.[taskKey]) {
      const dataAssun = new Date(emp.dataAssunzione)
      const daysBeforeFromToday = taskKey === 'invioScritturaPrivata' ? 30 : 0
      const deadline = new Date(dataAssun)
      deadline.setDate(deadline.getDate() - daysBeforeFromToday)
      const today = new Date()
      const daysLeft = Math.round((deadline - today) / 86400000)
      if (daysLeft < 0) count++
    }
  })
  return count
}

function saveNewEmployee() {
  if (!newEmployeeModal.form.nome || !newEmployeeModal.form.cognome || !newEmployeeModal.form.dataAssunzione || !newEmployeeModal.form.team || !newEmployeeModal.form.tipoContratto) {
    alert('Compila i campi obbligatori: Nome, Cognome, Data Assunzione, Team, Tipo Contratto')
    return
  }

  const dataAssun = new Date(newEmployeeModal.form.dataAssunzione)
  const durataProvaGiorni = 30
  const fineProva = new Date(dataAssun)
  fineProva.setDate(fineProva.getDate() + durataProvaGiorni)

  const scadenzaFU1 = new Date(fineProva)
  const scadenzaFU2Manager = new Date(dataAssun)
  scadenzaFU2Manager.setDate(scadenzaFU2Manager.getDate() + 45)
  const scadenzaFU2 = new Date(fineProva)
  scadenzaFU2.setDate(scadenzaFU2.getDate() - 30)

  const newEmp = {
    nome: newEmployeeModal.form.nome,
    cognome: newEmployeeModal.form.cognome,
    nomeBreve: newEmployeeModal.form.nome,
    societa: 'Move-X',
    citta: newEmployeeModal.form.citta,
    team: newEmployeeModal.form.team,
    email: newEmployeeModal.form.email || '',
    dataAssunzione: newEmployeeModal.form.dataAssunzione,
    tipoContratto: newEmployeeModal.form.tipoContratto,
    oreSettimana: newEmployeeModal.form.oreSettimana || null,
    livelloCCNL: newEmployeeModal.form.livelloCCNL || '',
    durataProva: '30 giorni',
    fineProva: fineProva.toISOString().split('T')[0],
    esitoProva: 'In Corso',
    scadenzaFU1: scadenzaFU1.toISOString().split('T')[0],
    statoFU1: 'Da Fare',
    scadenzaFU2Manager: scadenzaFU2Manager.toISOString().split('T')[0],
    statoFU2Manager: 'Da Fare',
    scadenzaFU2: scadenzaFU2.toISOString().split('T')[0],
    statoFU2Dip: 'Da Fare',
    stato: 'Attivo',
    motivoUscita: '',
    valutazionePeriodoProva: {
      faseCorrente: 'manager-pending',
      dataValutazioneManager: null,
      dataValutazioneHR: null,
      dataDecisioneCEO: null,
      manager: null,
      hr: null,
      ceo: null
    },
    preoboardingChecklist: {
      invioScritturaPrivata: false,
      creazioneProfiliweb: false,
      invioProcedure: false,
      visitaMedica: false,
      corsoFormazione: false,
      invioContratti: false
    }
  }

  store.addEmployee(newEmp)

  newEmployeeModal.form = {
    nome: '', cognome: '', email: '', citta: '', team: '',
    dataAssunzione: '', tipoContratto: '', livelloCCNL: '', oreSettimana: null
  }
  newEmployeeModal.open = false
}
</script>
