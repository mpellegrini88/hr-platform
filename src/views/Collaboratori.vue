<template>
  <div class="p-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">🤝 Collaboratori Esterni</h2>
        <p class="text-sm text-gray-500 mt-1">Gestione freelance e fornitori</p>
      </div>
      <div class="text-right">
        <div class="text-3xl font-bold text-purple-600">{{ collaboratori.length }}</div>
        <div class="text-xs text-gray-500">collaboratori</div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card p-4 border-l-4 border-emerald-500 bg-emerald-50">
        <div class="text-xs text-emerald-600 font-semibold uppercase">Attivi</div>
        <div class="text-2xl font-bold text-emerald-700 mt-1">{{ attivi }}</div>
      </div>
      <div class="card p-4 border-l-4 border-amber-500 bg-amber-50">
        <div class="text-xs text-amber-600 font-semibold uppercase">In Scadenza (30gg)</div>
        <div class="text-2xl font-bold text-amber-700 mt-1">{{ scadenzaProxima }}</div>
      </div>
      <div class="card p-4 border-l-4 border-orange-500 bg-orange-50">
        <div class="text-xs text-orange-600 font-semibold uppercase">Scaduti</div>
        <div class="text-2xl font-bold text-orange-700 mt-1">{{ scaduti }}</div>
      </div>
      <div class="card p-4 border-l-4 border-gray-500 bg-gray-50">
        <div class="text-xs text-gray-600 font-semibold uppercase">Inattivi</div>
        <div class="text-2xl font-bold text-gray-700 mt-1">{{ inattivi }}</div>
      </div>
    </div>

    <!-- Filtri -->
    <div class="flex flex-wrap items-center gap-3">
      <input v-model="search" class="form-input max-w-xs" placeholder="🔍 Cerca collaboratore...">
      <select v-model="filterStatus" class="form-select w-44">
        <option value="">Tutti</option>
        <option value="attivi">Attivi</option>
        <option value="scadenza">In Scadenza</option>
        <option value="scaduti">Scaduti</option>
        <option value="inattivi">Inattivi</option>
      </select>
      <button @click="openNewModal" class="btn btn-primary btn-sm gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Nuovo Collaboratore
      </button>
    </div>

    <!-- Lista Collaboratori -->
    <div class="space-y-4">
      <div v-if="filtered.length === 0" class="card p-8 text-center text-gray-400">
        Nessun collaboratore corrisponde ai criteri
      </div>

      <div v-for="collab in filtered" :key="collab.id" class="card overflow-hidden">
        <!-- Header -->
        <div class="px-5 py-4 bg-gradient-to-r from-purple-50 to-purple-25 border-b border-purple-100 flex items-center justify-between cursor-pointer" @click="toggleExpanded(collab.id)">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold shrink-0">
              {{ initials(collab.nome) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900">{{ collab.nome }} {{ collab.cognome }}</div>
              <div class="text-xs text-gray-500">{{ collab.specializzazione || '—' }}</div>
            </div>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <div class="text-xs font-medium" :class="statoBadgeColor(collab.stato)">{{ collab.stato || 'Attivo' }}</div>
              <div v-if="collab.scadenzaContratto" class="text-xs text-gray-500 mt-0.5">{{ fmtDateShort(collab.scadenzaContratto) }}</div>
            </div>
            <svg :class="['w-5 h-5 text-gray-400 transition-transform', expanded.includes(collab.id) ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        <!-- Contenuto Espandibile -->
        <div v-show="expanded.includes(collab.id)" class="px-5 py-4 space-y-4 bg-gray-50 border-t border-gray-100">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-lg p-3 border border-gray-100">
              <div class="text-xs text-gray-500 mb-1">Specializzazione</div>
              <div class="font-medium text-gray-900">{{ collab.specializzazione || '—' }}</div>
            </div>
            <div class="bg-white rounded-lg p-3 border border-gray-100">
              <div class="text-xs text-gray-500 mb-1">Tipo Contratto</div>
              <div class="font-medium text-gray-900">{{ collab.tipoContratto || 'Freelance' }}</div>
            </div>
            <div class="bg-white rounded-lg p-3 border border-gray-100">
              <div class="text-xs text-gray-500 mb-1">Data Inizio</div>
              <div class="font-medium text-gray-900">{{ fmtDateShort(collab.dataAssunzione) || '—' }}</div>
            </div>
            <div class="bg-white rounded-lg p-3 border border-gray-100">
              <div class="text-xs text-gray-500 mb-1">Data Scadenza</div>
              <div class="font-medium text-gray-900">{{ fmtDateShort(collab.scadenzaContratto) || '—' }}</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white rounded-lg p-3 border border-gray-100">
              <div class="text-xs text-gray-500 mb-1">Contatti</div>
              <div class="space-y-1 text-sm">
                <div v-if="collab.email" class="text-gray-700">📧 {{ collab.email }}</div>
                <div v-if="collab.telefono" class="text-gray-700">📱 {{ collab.telefono }}</div>
                <div v-if="collab.citta" class="text-gray-500 text-xs">{{ collab.citta }}</div>
              </div>
            </div>
            <div class="bg-white rounded-lg p-3 border border-gray-100">
              <div class="text-xs text-gray-500 mb-1">Note</div>
              <div class="text-sm text-gray-700">{{ collab.note || '—' }}</div>
            </div>
          </div>

          <!-- Azioni -->
          <div class="flex gap-2 pt-2">
            <button @click="openEditModal(collab)" class="btn btn-secondary btn-sm gap-1">
              ✏️ Modifica
            </button>
            <button @click="renewContract(collab)" class="btn btn-sm gap-1" :class="isScaduto(collab) ? 'btn-warning' : 'btn-secondary'">
              🔄 {{ isScaduto(collab) ? 'Rinnova Urgente' : 'Rinnova' }}
            </button>
            <button @click="deactivateCollab(collab)" class="btn btn-secondary btn-sm gap-1">
              🚫 Disattiva
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL NUOVO/MODIFICA -->
    <Modal :open="editModal.open" :title="editModal.id ? 'Modifica Collaboratore' : 'Nuovo Collaboratore'" width="700px" @close="closeEditModal">
      <div v-if="editModal.data" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Nome</label>
            <input v-model="editModal.data.nome" class="form-input w-full" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Cognome</label>
            <input v-model="editModal.data.cognome" class="form-input w-full" />
          </div>
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Specializzazione</label>
          <input v-model="editModal.data.specializzazione" class="form-input w-full" placeholder="es. Web Developer, Designer, Consulente" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Email</label>
            <input v-model="editModal.data.email" type="email" class="form-input w-full" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Telefono</label>
            <input v-model="editModal.data.telefono" class="form-input w-full" />
          </div>
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Città</label>
          <input v-model="editModal.data.citta" class="form-input w-full" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Data Inizio Collaborazione</label>
            <input v-model="editModal.data.dataAssunzione" type="date" class="form-input w-full" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Data Fine (Scadenza)</label>
            <input v-model="editModal.data.scadenzaContratto" type="date" class="form-input w-full" />
          </div>
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Stato</label>
          <select v-model="editModal.data.stato" class="form-select w-full">
            <option value="Attivo">Attivo</option>
            <option value="Pausa">Pausa</option>
            <option value="Inattivo">Inattivo</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Note</label>
          <textarea v-model="editModal.data.note" class="form-input w-full h-20" />
        </div>

        <div class="flex gap-2 pt-4 border-t">
          <button @click="saveCollab" class="btn btn-primary flex-1">Salva</button>
          <button @click="closeEditModal" class="btn btn-secondary flex-1">Annulla</button>
        </div>
      </div>
    </Modal>

    <!-- MODAL RINNOVO -->
    <Modal :open="renewalModal.open" title="Rinnova Contratto" width="600px" @close="renewalModal.open = false">
      <div v-if="renewalModal.data" class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm font-semibold text-blue-900">{{ renewalModal.data.nome }} {{ renewalModal.data.cognome }}</p>
          <p class="text-xs text-blue-700 mt-1">Specializzazione: {{ renewalModal.data.specializzazione }}</p>
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Data Attuale Scadenza</label>
          <input :value="fmtDateShort(renewalModal.data.scadenzaContratto)" disabled class="form-input w-full bg-gray-50" />
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Nuova Data Scadenza</label>
          <input v-model="renewalModal.newDate" type="date" class="form-input w-full" />
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Note per il Rinnovo</label>
          <textarea v-model="renewalModal.note" class="form-input w-full h-16" placeholder="es. Progetto esteso, alta qualità di lavoro..." />
        </div>

        <div class="flex gap-2 pt-4 border-t">
          <button @click="confirmRenewal" class="btn btn-primary flex-1">Conferma Rinnovo</button>
          <button @click="renewalModal.open = false" class="btn btn-secondary flex-1">Annulla</button>
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

const store = useHrStore()
const { fmtDateShort } = useHelpers()

const search = ref('')
const filterStatus = ref('')
const expanded = ref([])
const editModal = reactive({ open: false, id: null, data: null })
const renewalModal = reactive({ open: false, data: null, newDate: '', note: '' })

const today = new Date()

function initials(nome) {
  return nome?.charAt(0).toUpperCase() || '?'
}

const collaboratori = computed(() => {
  return store.employees.filter(e => e.team === 'Freelance' || e.tipoContratto === 'freelance')
})

const attivi = computed(() => {
  return collaboratori.value.filter(c => c.stato === 'Attivo' && !isScaduto(c)).length
})

const scadenzaProxima = computed(() => {
  return collaboratori.value.filter(c => {
    if (!c.scadenzaContratto || isScaduto(c)) return false
    const scad = new Date(c.scadenzaContratto)
    const days = Math.round((scad - today) / 86400000)
    return days > 0 && days <= 30
  }).length
})

const scaduti = computed(() => {
  return collaboratori.value.filter(c => isScaduto(c) && c.stato !== 'Inattivo').length
})

const inattivi = computed(() => {
  return collaboratori.value.filter(c => c.stato === 'Inattivo').length
})

function isScaduto(collab) {
  if (!collab.scadenzaContratto) return false
  const scad = new Date(collab.scadenzaContratto)
  return scad < today
}

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  return collaboratori.value.filter(c => {
    const matchSearch = !s || c.nome.toLowerCase().includes(s) || c.cognome.toLowerCase().includes(s) || (c.specializzazione || '').toLowerCase().includes(s)
    
    let matchStatus = true
    if (filterStatus.value === 'attivi') matchStatus = c.stato === 'Attivo' && !isScaduto(c)
    if (filterStatus.value === 'scadenza') matchStatus = !isScaduto(c) && c.scadenzaContratto && Math.round((new Date(c.scadenzaContratto) - today) / 86400000) <= 30
    if (filterStatus.value === 'scaduti') matchStatus = isScaduto(c) && c.stato !== 'Inattivo'
    if (filterStatus.value === 'inattivi') matchStatus = c.stato === 'Inattivo'
    
    return matchSearch && matchStatus
  }).sort((a, b) => {
    const scadA = a.scadenzaContratto ? new Date(a.scadenzaContratto) : new Date('9999-12-31')
    const scadB = b.scadenzaContratto ? new Date(b.scadenzaContratto) : new Date('9999-12-31')
    return scadA - scadB
  })
})

function statoBadgeColor(stato) {
  if (stato === 'Attivo') return 'text-emerald-700 font-semibold'
  if (stato === 'Pausa') return 'text-amber-700 font-semibold'
  if (stato === 'Inattivo') return 'text-gray-500'
  return 'text-gray-700'
}

function toggleExpanded(id) {
  const idx = expanded.value.indexOf(id)
  if (idx > -1) expanded.value.splice(idx, 1)
  else expanded.value.push(id)
}

function openNewModal() {
  editModal.id = null
  editModal.data = {
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    citta: '',
    specializzazione: '',
    dataAssunzione: '',
    scadenzaContratto: '',
    team: 'Freelance',
    tipoContratto: 'freelance',
    stato: 'Attivo',
    note: ''
  }
  editModal.open = true
}

function openEditModal(collab) {
  editModal.id = collab.id
  editModal.data = { ...collab }
  editModal.open = true
}

function closeEditModal() {
  editModal.open = false
  editModal.id = null
  editModal.data = null
}

function saveCollab() {
  if (editModal.id) {
    // Modifica
    const idx = store.employees.findIndex(e => e.id === editModal.id)
    if (idx > -1) {
      store.employees[idx] = { ...store.employees[idx], ...editModal.data }
    }
  } else {
    // Nuovo
    const newId = Math.max(...store.employees.map(e => e.id || 0), 0) + 1
    store.employees.push({
      id: newId,
      ...editModal.data
    })
  }
  closeEditModal()
}

function renewContract(collab) {
  renewalModal.data = collab
  renewalModal.newDate = ''
  renewalModal.note = ''
  renewalModal.open = true
}

function confirmRenewal() {
  if (!renewalModal.newDate) {
    alert('Inserire una data di scadenza')
    return
  }
  
  const idx = store.employees.findIndex(e => e.id === renewalModal.data.id)
  if (idx > -1) {
    store.employees[idx].scadenzaContratto = renewalModal.newDate
    if (renewalModal.note) {
      store.employees[idx].noteRinnovo = (store.employees[idx].noteRinnovo || '') + '\n[' + fmtDateShort(new Date()) + '] ' + renewalModal.note
    }
  }
  renewalModal.open = false
}

function deactivateCollab(collab) {
  if (confirm(`Disattivare ${collab.nome} ${collab.cognome}?`)) {
    const idx = store.employees.findIndex(e => e.id === collab.id)
    if (idx > -1) {
      store.employees[idx].stato = 'Inattivo'
    }
  }
}
</script>

<style scoped>
.section-label {
  @apply text-xs font-semibold text-gray-400 uppercase tracking-wider;
}
</style>
