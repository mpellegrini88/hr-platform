<template>
  <div class="p-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">🎯 Valutazione Periodi di Prova</h2>
        <p class="text-sm text-gray-500 mt-1">Manager → HR → CEO: Scala dettagliata (1-5) + Raccomandazione</p>
      </div>
      <div class="text-right">
        <div class="text-3xl font-bold text-primary-600">{{ inCorso.length }}</div>
        <div class="text-xs text-gray-500">dipendenti (esclusi freelance)</div>
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
        <option v-for="t in getTeamsExcludingFreelance" :key="t">{{ t }}</option>
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

    <!-- Elenco dipendenti -->
    <div class="space-y-4">
      <div v-if="filtered.length === 0" class="card p-8 text-center text-gray-400">
        Nessun dipendente corrisponde ai criteri selezionati (i freelance sono esclusi)
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

        <!-- Expanded Content -->
        <div v-if="expanded.includes(emp.id)" class="px-5 py-4 bg-white space-y-6 border-t border-gray-100">
          <!-- Manager Evaluation -->
          <div class="bg-blue-50 rounded-lg p-5 border border-blue-200">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-semibold text-blue-900">👨‍💼 Valutazione Manager/Responsabile Tecnico</h4>
              <button v-if="!getManagerEvaluation(emp.id)" @click="openEvaluation(emp, 'manager')" class="btn btn-sm btn-primary">
                Aggiungi valutazione
              </button>
              <button v-else @click="openEvaluation(emp, 'manager')" class="text-xs text-blue-600 hover:text-blue-800 font-medium">
                ✎ Modifica
              </button>
            </div>

            <div v-if="!getManagerEvaluation(emp.id)" class="text-sm text-blue-700">
              Valutazione non ancora compilata
            </div>
            <div v-else class="space-y-3">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div class="bg-white p-2 rounded"><strong>Competenze:</strong> {{ getManagerEvaluation(emp.id).competenze }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Qualità:</strong> {{ getManagerEvaluation(emp.id).qualita }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Problem Solving:</strong> {{ getManagerEvaluation(emp.id).problemSolving }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Velocità:</strong> {{ getManagerEvaluation(emp.id).velocita }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Collaborazione:</strong> {{ getManagerEvaluation(emp.id).collaborazione }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Comunicazione:</strong> {{ getManagerEvaluation(emp.id).comunicazione }}/5</div>
                <div class="bg-white p-2 rounded col-span-2"><strong>Attitudine:</strong> {{ getManagerEvaluation(emp.id).attitudine }}/5</div>
              </div>
              <div class="bg-white p-3 rounded text-sm">
                <strong>Raccomandazione:</strong> {{ getManagerEvaluation(emp.id).raccomandazione }}
              </div>
            </div>
          </div>

          <!-- HR Evaluation -->
          <div class="bg-purple-50 rounded-lg p-5 border border-purple-200">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-semibold text-purple-900">👩‍💼 Validazione HR</h4>
              <button v-if="!getHRValidation(emp.id)" @click="openEvaluation(emp, 'hr')" class="btn btn-sm btn-primary" :disabled="!getManagerEvaluation(emp.id)">
                Valida
              </button>
              <button v-else @click="openEvaluation(emp, 'hr')" class="text-xs text-purple-600 hover:text-purple-800 font-medium">
                ✎ Modifica
              </button>
            </div>

            <div v-if="!getManagerEvaluation(emp.id)" class="text-sm text-purple-700 bg-purple-100 p-2 rounded">
              ⚠️ Completare prima la valutazione del Manager
            </div>
            <div v-else-if="!getHRValidation(emp.id)" class="text-sm text-purple-700">
              In attesa di validazione HR
            </div>
            <div v-else class="space-y-2">
              <div class="bg-white p-3 rounded text-sm">
                <strong>Data validazione:</strong> {{ fmtDateShort(getHRValidation(emp.id).data) }}
              </div>
              <div class="bg-white p-3 rounded text-sm">
                <strong>Voto HR (1-10):</strong> {{ getHRValidation(emp.id).voto }}
              </div>
              <div class="bg-white p-3 rounded text-sm">
                <strong>Commento HR:</strong> {{ getHRValidation(emp.id).commento }}
              </div>
            </div>
          </div>

          <!-- CEO Decision -->
          <div class="bg-amber-50 rounded-lg p-5 border border-amber-200">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-semibold text-amber-900">👑 Decisione CEO</h4>
              <button v-if="!getCEODecision(emp.id)" @click="openEvaluation(emp, 'ceo')" class="btn btn-sm btn-primary" :disabled="!getHRValidation(emp.id)">
                Registra decisione
              </button>
              <button v-else @click="openEvaluation(emp, 'ceo')" class="text-xs text-amber-600 hover:text-amber-800 font-medium">
                ✎ Modifica
              </button>
            </div>

            <div v-if="!getHRValidation(emp.id)" class="text-sm text-amber-700 bg-amber-100 p-2 rounded">
              ⚠️ Completare prima la validazione HR
            </div>
            <div v-else-if="!getCEODecision(emp.id)" class="text-sm text-amber-700">
              In attesa di decisione CEO
            </div>
            <div v-else class="space-y-2">
              <div class="bg-white p-3 rounded text-sm">
                <strong>Data decisione:</strong> {{ fmtDateShort(getCEODecision(emp.id).data) }}
              </div>
              <div :class="['bg-white p-3 rounded text-sm font-bold', getCEODecision(emp.id).decisione === 'Confermare' ? 'text-emerald-700' : getCEODecision(emp.id).decisione === 'Proroga temporanea' ? 'text-yellow-700' : 'text-red-700']">
                <strong>Decisione:</strong> {{ getCEODecision(emp.id).decisione }}
              </div>
              <div class="bg-white p-3 rounded text-sm">
                <strong>Motivazione:</strong> {{ getCEODecision(emp.id).motivazione }}
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
            <li>🔵 <strong>Manager/Responsabile Tecnico:</strong> Compila scala 7 criteri (1-5) + raccomandazione (Confermare / Proroga / Non Confermare)</li>
            <li>🔵 <strong>HR:</strong> Valida con voto 1-10 + commento + approvazione finale</li>
            <li>👑 <strong>CEO:</strong> Decisione finale con motivazione (Rinnovo / Proroga / Conclusione)</li>
            <li>📋 <strong>Freelance:</strong> Esclusi da questo processo - gestiti solo in "Contratti a Termine"</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL EVALUATION -->
  <Modal :open="modal.open" @close="modal.open = false" width="max-w-4xl">
    <template #header>{{ getModalTitle() }}</template>
    <div class="space-y-4 py-4 max-h-96 overflow-y-auto">
      <!-- Dipendente info -->
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p class="text-sm font-medium text-gray-900">{{ modal.emp?.nome }} {{ modal.emp?.cognome }}</p>
        <p class="text-xs text-gray-600">{{ modal.emp?.team }} · {{ modal.emp?.livelloCCNL }}</p>
      </div>

      <!-- Manager Evaluation Form -->
      <div v-if="modal.tipo === 'manager'" class="space-y-4">
        <h4 class="font-semibold text-gray-900">Scala di Valutazione (1-5)</h4>

        <!-- Competenze Tecniche -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">1. Competenze Tecniche</label>
          <input v-model.number="evalForm.competenze" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.competenze }}/5</div>
          <textarea v-model="evalForm.competenzeNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Qualità del Lavoro -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">2. Qualità del Lavoro (precisione, autonomia, affidabilità)</label>
          <input v-model.number="evalForm.qualita" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.qualita }}/5</div>
          <textarea v-model="evalForm.qualitaNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Problem Solving -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">3. Capacità di Problem-Solving</label>
          <input v-model.number="evalForm.problemSolving" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.problemSolving }}/5</div>
          <textarea v-model="evalForm.problemSolvingNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Velocità di Apprendimento -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">4. Velocità di Apprendimento</label>
          <input v-model.number="evalForm.velocita" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.velocita }}/5</div>
          <textarea v-model="evalForm.velocitaNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Collaborazione -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">5. Collaborazione e Teamwork</label>
          <input v-model.number="evalForm.collaborazione" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.collaborazione }}/5</div>
          <textarea v-model="evalForm.collaborazioneNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Comunicazione -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">6. Comunicazione (chiarezza, proattività, disponibilità)</label>
          <input v-model.number="evalForm.comunicazione" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.comunicazione }}/5</div>
          <textarea v-model="evalForm.comunicazioneNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Attitudine -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">7. Attitudine e Cultura Aziendale (allineamento valori, atteggiamento, spirito iniziativa)</label>
          <input v-model.number="evalForm.attitudine" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.attitudine }}/5</div>
          <textarea v-model="evalForm.attitudineNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Osservazioni Generali -->
        <div>
          <label class="form-label">Osservazioni Generali (performance, atteggiamento, collaborazione, punti di forza, aree attenzione)</label>
          <textarea v-model="evalForm.osservazioni" class="form-textarea" rows="3" placeholder="Valutazione discorsiva..."></textarea>
        </div>

        <!-- Raccomandazione -->
        <div>
          <label class="form-label">Raccomandazione del Responsabile Tecnico</label>
          <select v-model="evalForm.raccomandazione" class="form-select">
            <option>Confermare il dipendente</option>
            <option>Proroga temporanea</option>
            <option>Non confermare</option>
          </select>
          <textarea v-model="evalForm.motivazioneRaccomandazione" class="form-textarea mt-2" rows="2" placeholder="Motivazione dettagliata..."></textarea>
        </div>

        <!-- Suggerimenti -->
        <div>
          <label class="form-label">Suggerimenti o Necessità (formazione, supporto, cambi ruolo, affiancamento, ecc.)</label>
          <textarea v-model="evalForm.suggerimenti" class="form-textarea" rows="2" placeholder="Suggerimenti..."></textarea>
        </div>

        <!-- Aree di Miglioramento -->
        <div>
          <label class="form-label">Aree di Miglioramento e Punti di Forza</label>
          <textarea v-model="evalForm.areaeMiglioramento" class="form-textarea" rows="2" placeholder="Analisi..."></textarea>
        </div>
      </div>

      <!-- HR Validation Form -->
      <div v-else-if="modal.tipo === 'hr'" class="space-y-4">
        <div v-if="getManagerEvaluation(modal.emp?.id)" class="bg-blue-50 p-3 rounded border border-blue-200 text-sm">
          <strong>Raccomandazione Manager:</strong> {{ getManagerEvaluation(modal.emp?.id).raccomandazione }}
        </div>

        <div>
          <label class="form-label">Data validazione</label>
          <input v-model="evalForm.hrData" type="date" class="form-input">
        </div>

        <div>
          <label class="form-label">Voto HR (1-10)</label>
          <input v-model.number="evalForm.hrVoto" type="range" min="1" max="10" class="w-full">
          <div class="text-sm text-gray-600 mt-1">{{ evalForm.hrVoto }}/10</div>
        </div>

        <div>
          <label class="form-label">Commento di Validazione HR</label>
          <textarea v-model="evalForm.hrCommento" class="form-textarea" rows="4" placeholder="Valutazione e parere HR..."></textarea>
        </div>
      </div>

      <!-- CEO Decision Form -->
      <div v-else-if="modal.tipo === 'ceo'" class="space-y-4">
        <div v-if="getManagerEvaluation(modal.emp?.id)" class="bg-blue-50 p-3 rounded border border-blue-200 text-xs space-y-1">
          <p><strong>Manager:</strong> {{ getManagerEvaluation(modal.emp?.id).raccomandazione }}</p>
        </div>
        <div v-if="getHRValidation(modal.emp?.id)" class="bg-purple-50 p-3 rounded border border-purple-200 text-xs space-y-1">
          <p><strong>HR Voto:</strong> {{ getHRValidation(modal.emp?.id).voto }}/10</p>
        </div>

        <div>
          <label class="form-label">Data decisione</label>
          <input v-model="evalForm.ceoData" type="date" class="form-input">
        </div>

        <div>
          <label class="form-label">Decisione CEO</label>
          <select v-model="evalForm.ceoDecisione" class="form-select">
            <option>Confermare il dipendente</option>
            <option>Proroga temporanea</option>
            <option>Non confermare</option>
          </select>
        </div>

        <div>
          <label class="form-label">Motivazione della Decisione</label>
          <textarea v-model="evalForm.ceoMotivazione" class="form-textarea" rows="3" placeholder="Motivazione dettagliata..."></textarea>
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="modal.open = false" class="btn btn-ghost">Annulla</button>
      <button @click="saveEvaluation" class="btn btn-primary">💾 Salva</button>
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

const valutazioni = reactive({
  manager: {},
  hr: {},
  ceo: {}
})

const modal = reactive({ open: false, emp: null, tipo: null })
const evalForm = reactive({
  // Manager
  competenze: 3, competenzeNote: '',
  qualita: 3, qualitaNote: '',
  problemSolving: 3, problemSolvingNote: '',
  velocita: 3, velocitaNote: '',
  collaborazione: 3, collaborazioneNote: '',
  comunicazione: 3, comunicazioneNote: '',
  attitudine: 3, attitudineNote: '',
  osservazioni: '',
  raccomandazione: 'Confermare il dipendente',
  motivazioneRaccomandazione: '',
  suggerimenti: '',
  areaeMiglioramento: '',
  // HR
  hrData: '', hrVoto: 5, hrCommento: '',
  // CEO
  ceoData: '', ceoDecisione: 'Confermare il dipendente', ceoMotivazione: ''
})

const getTeamsExcludingFreelance = computed(() => {
  return store.teams.filter(t => !t.toLowerCase().includes('freelance'))
})

const inCorso = computed(() => {
  return store.employees.filter(e =>
    e.stato === 'Attivo' &&
    e.esitoProva === 'In Corso' &&
    !e.team.toLowerCase().includes('freelance')
  )
})

const scaduti = computed(() => {
  const today = new Date()
  return inCorso.value.filter(e => new Date(e.fineProva) < today)
})

const entro7gg = computed(() => {
  const today = new Date()
  return inCorso.value.filter(e => {
    const days = Math.round((new Date(e.fineProva) - today) / 86400000)
    return days > 0 && days <= 7
  })
})

const entro30gg = computed(() => {
  const today = new Date()
  return inCorso.value.filter(e => {
    const days = Math.round((new Date(e.fineProva) - today) / 86400000)
    return days > 7 && days <= 30
  })
})

const completate = computed(() => {
  return store.employees.filter(e =>
    (e.esitoProva === 'Superato' || e.esitoProva === 'Non Superato') &&
    !e.team.toLowerCase().includes('freelance')
  )
})

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

function toggleExpanded(empId) {
  const idx = expanded.value.indexOf(empId)
  if (idx > -1) expanded.value.splice(idx, 1)
  else expanded.value.push(empId)
}

function getManagerEvaluation(empId) {
  return valutazioni.manager[empId]
}

function getHRValidation(empId) {
  return valutazioni.hr[empId]
}

function getCEODecision(empId) {
  return valutazioni.ceo[empId]
}

function openEvaluation(emp, tipo) {
  modal.emp = emp
  modal.tipo = tipo

  if (tipo === 'manager') {
    const existing = valutazioni.manager[emp.id]
    if (existing) {
      Object.assign(evalForm, existing)
    } else {
      evalForm.competenze = 3
      evalForm.qualita = 3
      evalForm.problemSolving = 3
      evalForm.velocita = 3
      evalForm.collaborazione = 3
      evalForm.comunicazione = 3
      evalForm.attitudine = 3
      evalForm.osservazioni = ''
      evalForm.raccomandazione = 'Confermare il dipendente'
      evalForm.motivazioneRaccomandazione = ''
      evalForm.suggerimenti = ''
      evalForm.areaeMiglioramento = ''
    }
  } else if (tipo === 'hr') {
    const existing = valutazioni.hr[emp.id]
    if (existing) {
      evalForm.hrData = existing.data
      evalForm.hrVoto = existing.voto
      evalForm.hrCommento = existing.commento
    } else {
      evalForm.hrData = ''
      evalForm.hrVoto = 5
      evalForm.hrCommento = ''
    }
  } else if (tipo === 'ceo') {
    const existing = valutazioni.ceo[emp.id]
    if (existing) {
      evalForm.ceoData = existing.data
      evalForm.ceoDecisione = existing.decisione
      evalForm.ceoMotivazione = existing.motivazione
    } else {
      evalForm.ceoData = ''
      evalForm.ceoDecisione = 'Confermare il dipendente'
      evalForm.ceoMotivazione = ''
    }
  }

  modal.open = true
}

function getModalTitle() {
  if (!modal.emp) return ''
  const tipo = modal.tipo === 'manager' ? 'Manager' : modal.tipo === 'hr' ? 'HR' : 'CEO'
  return `Valutazione ${tipo} — ${modal.emp.nome} ${modal.emp.cognome}`
}

function saveEvaluation() {
  if (!modal.emp) return

  if (modal.tipo === 'manager') {
    valutazioni.manager[modal.emp.id] = {
      competenze: evalForm.competenze, competenzeNote: evalForm.competenzeNote,
      qualita: evalForm.qualita, qualitaNote: evalForm.qualitaNote,
      problemSolving: evalForm.problemSolving, problemSolvingNote: evalForm.problemSolvingNote,
      velocita: evalForm.velocita, velocitaNote: evalForm.velocitaNote,
      collaborazione: evalForm.collaborazione, collaborazioneNote: evalForm.collaborazioneNote,
      comunicazione: evalForm.comunicazione, comunicazioneNote: evalForm.comunicazioneNote,
      attitudine: evalForm.attitudine, attitudineNote: evalForm.attitudineNote,
      osservazioni: evalForm.osservazioni,
      raccomandazione: evalForm.raccomandazione,
      motivazioneRaccomandazione: evalForm.motivazioneRaccomandazione,
      suggerimenti: evalForm.suggerimenti,
      areaeMiglioramento: evalForm.areaeMiglioramento
    }
  } else if (modal.tipo === 'hr') {
    valutazioni.hr[modal.emp.id] = {
      data: evalForm.hrData,
      voto: evalForm.hrVoto,
      commento: evalForm.hrCommento
    }
  } else if (modal.tipo === 'ceo') {
    valutazioni.ceo[modal.emp.id] = {
      data: evalForm.ceoData,
      decisione: evalForm.ceoDecisione,
      motivazione: evalForm.ceoMotivazione
    }
  }

  modal.open = false
}
</script>
