<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-wrap gap-3 items-center">
      <div class="flex gap-2">
        <label class="text-sm font-medium text-gray-700">Filtra Tipo:</label>
        <select v-model="filters.tipo" class="px-3 py-1 border rounded-lg text-sm">
          <option value="">-- Tutti --</option>
          <option value="FU1">FU1</option>
          <option value="FU2_MANAGER">FU2 Manager</option>
          <option value="REVIEW_MANAGER">Review Manager</option>
          <option value="REVIEW_HR">Review HR</option>
          <option value="RINNOVO">Rinnovo</option>
          <option value="DOSSIER">Dossier</option>
        </select>
      </div>

      <div class="flex gap-2">
        <label class="text-sm font-medium text-gray-700">Team:</label>
        <select v-model="filters.team" class="px-3 py-1 border rounded-lg text-sm">
          <option value="">-- Tutti --</option>
          <option v-for="team in store.teams" :key="team" :value="team">{{ team }}</option>
        </select>
      </div>

      <div class="flex gap-2 ml-auto">
        <button @click="handleExportExcel" class="btn btn-sm bg-green-50 text-green-700 hover:bg-green-100">📊 Excel</button>
        <button @click="handleExportJSON" class="btn btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100">📋 JSON</button>
        <button @click="handleExportCSV" class="btn btn-sm bg-amber-50 text-amber-700 hover:bg-amber-100">📄 CSV</button>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="grid grid-cols-3 gap-4">
      <!-- DA FARE Column -->
      <div class="bg-gray-50 rounded-lg border border-gray-200">
        <div class="bg-red-500 text-white px-4 py-3 rounded-t-lg font-semibold flex items-center justify-between">
          <span>DA FARE</span>
          <span class="bg-red-600 rounded-full px-2 py-1 text-xs font-bold">{{ daFareItems.length }}</span>
        </div>
        <div class="p-3 space-y-2 max-h-[600px] overflow-y-auto">
          <div v-for="item in daFareItems" :key="`${item.id}-${item.tipo}`"
            @click="openModal(item)"
            class="bg-white border-l-4 border-red-500 rounded p-3 cursor-pointer hover:shadow-md transition group">
            <p class="font-semibold text-sm text-gray-900 group-hover:text-red-600">{{ item.nome }} {{ item.cognome }}</p>
            <p class="text-xs text-gray-600 mt-1">{{ item.tipo }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ item.team }}</p>
            <div class="flex items-center justify-between mt-2">
              <span :class="['text-xs px-2 py-1 rounded font-semibold', urgencyBadgeClass(item.urgenza)]">
                {{ item.urgenza }}
              </span>
              <div class="text-right">
                <span class="text-xs font-semibold" :class="item.giorni <= 0 ? 'text-red-600' : 'text-gray-700'">{{ item.giorni }} gg</span>
                <div v-if="item.scadenza" class="text-[10px] text-gray-400">{{ fmtDateShort(item.scadenza) }}</div>
              </div>
            </div>
            <div class="flex gap-2 mt-2">
              <button @click.stop="moveToCompleted(item)" class="text-xs text-green-600 hover:text-green-800 font-medium flex-1 py-1 rounded bg-green-50 hover:bg-green-100">
                ✓ Risolvi
              </button>
              <button @click.stop="archiveItem(item)" class="text-xs text-gray-600 hover:text-red-600 font-medium px-2 py-1">
                ✕
              </button>
            </div>
          </div>
          <div v-if="daFareItems.length === 0" class="text-center py-8">
            <p class="text-gray-400 text-sm">Nessun item</p>
          </div>
        </div>
      </div>

      <!-- IN CORSO Column -->
      <div class="bg-gray-50 rounded-lg border border-gray-200">
        <div class="bg-orange-500 text-white px-4 py-3 rounded-t-lg font-semibold flex items-center justify-between">
          <span>IN CORSO</span>
          <span class="bg-orange-600 rounded-full px-2 py-1 text-xs font-bold">{{ inCorsoItems.length }}</span>
        </div>
        <div class="p-3 space-y-2 max-h-[600px] overflow-y-auto">
          <div v-for="item in inCorsoItems" :key="`${item.id}-${item.tipo}`"
            @click="openModal(item)"
            class="bg-white border-l-4 border-orange-500 rounded p-3 cursor-pointer hover:shadow-md transition group">
            <p class="font-semibold text-sm text-gray-900 group-hover:text-orange-600">{{ item.nome }} {{ item.cognome }}</p>
            <p class="text-xs text-gray-600 mt-1">{{ item.tipo }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ item.team }}</p>
            <div class="flex items-center justify-between mt-2">
              <span :class="['text-xs px-2 py-1 rounded font-semibold', urgencyBadgeClass(item.urgenza)]">
                {{ item.urgenza }}
              </span>
              <div class="text-right">
                <span class="text-xs font-semibold" :class="item.giorni <= 0 ? 'text-red-600' : 'text-gray-700'">{{ item.giorni }} gg</span>
                <div v-if="item.scadenza" class="text-[10px] text-gray-400">{{ fmtDateShort(item.scadenza) }}</div>
              </div>
            </div>
            <button @click.stop="moveToCompleted(item)" class="text-xs text-green-600 hover:text-green-800 mt-2 font-medium">
              Completa ✓
            </button>
          </div>
          <div v-if="inCorsoItems.length === 0" class="text-center py-8">
            <p class="text-gray-400 text-sm">Nessun item</p>
          </div>
        </div>
      </div>

      <!-- COMPLETATO Column -->
      <div class="bg-gray-50 rounded-lg border border-gray-200">
        <div class="bg-green-500 text-white px-4 py-3 rounded-t-lg font-semibold flex items-center justify-between">
          <span>COMPLETATO</span>
          <span class="bg-green-600 rounded-full px-2 py-1 text-xs font-bold">{{ completatoItems.length }}</span>
        </div>
        <div class="p-3 space-y-2 max-h-[600px] overflow-y-auto">
          <div v-for="item in completatoItems" :key="`${item.id}-${item.tipo}`"
            class="bg-white border-l-4 border-green-500 rounded p-3 opacity-75 hover:opacity-100 transition">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="font-semibold text-sm text-gray-900 line-through">{{ item.nome }} {{ item.cognome }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ item.tipo }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ item.team }}</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs px-2 py-1 rounded font-semibold bg-green-100 text-green-700">
                    ✓ FATTO
                  </span>
                  <div class="text-right">
                    <span class="text-xs text-gray-600">{{ item.giorni }} gg fa</span>
                    <div v-if="item.scadenza" class="text-[10px] text-gray-400">{{ fmtDateShort(item.scadenza) }}</div>
                  </div>
                </div>
              </div>
              <button @click.stop="deleteItem(item)" class="text-xs text-red-500 hover:text-red-700 font-medium ml-2 p-1 rounded hover:bg-red-50" title="Elimina">
                🗑️
              </button>
            </div>
          </div>
          <div v-if="completatoItems.length === 0" class="text-center py-8">
            <p class="text-gray-400 text-sm">Nessun item</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <ActionItemModal :is-open="modalOpen && selectedItem" :item="selectedItem"
      @close="closeModal" @saved="handleItemSaved" />

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="deleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/50" @click="closeDeleteModal"></div>
        <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 z-10">
          <h3 class="text-lg font-bold text-gray-900 mb-2">
            {{ deleteModalAction === 'elimina' ? '🗑️ Eliminazione definitiva' : '✕ Scartare attività' }}
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            {{ deleteModalAction === 'elimina'
              ? 'Sei sicuro di voler eliminare definitivamente questa attività? L\'azione non è reversibile.'
              : 'Sei sicuro di voler scartare questa attività? Verrà rimossa dalla Kanban.' }}
          </p>
          <div v-if="deleteModalItem" class="bg-gray-50 rounded-lg p-4 mb-5 border border-gray-200">
            <p class="font-semibold text-gray-900">{{ deleteModalItem.nome }} {{ deleteModalItem.cognome }}</p>
            <p class="text-sm text-gray-600 mt-1">Tipo: <strong>{{ deleteModalItem.tipo }}</strong></p>
            <p class="text-sm text-gray-600">Team: {{ deleteModalItem.team }}</p>
            <p v-if="deleteModalItem.scadenza" class="text-sm text-gray-600">Scadenza: {{ fmtDateShort(deleteModalItem.scadenza) }}</p>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="closeDeleteModal" class="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 font-medium">Annulla</button>
            <button @click="confirmDelete" class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium">
              {{ deleteModalAction === 'elimina' ? '🗑️ Elimina' : '✕ Scarta' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import { useExport } from '@/composables/useExport.js'
import ActionItemModal from './ActionItemModal.vue'

const store = useHrStore()
const { fmtDateShort } = useHelpers()
const { exportToExcel, exportToJSON, exportKanbanCSV } = useExport()
const modalOpen = ref(false)
const selectedItem = ref(null)

// Delete modal state
const deleteModalOpen = ref(false)
const deleteModalItem = ref(null)
const deleteModalAction = ref('')  // 'elimina' or 'scarta'

const filters = ref({
  tipo: '',
  team: ''
})

// Get all urgencies from store
const allItems = computed(() => store.allUrgenze)

// Filter items
const filteredItems = computed(() => {
  return allItems.value.filter(item => {
    if (filters.value.tipo && item.tipo !== filters.value.tipo) return false
    if (filters.value.team && item.team !== filters.value.team) return false
    return true
  })
})

// Separate into columns (assuming items have a 'stato' field that could be tracked)
// For now, we'll use a simple heuristic: newest items in DA FARE, some in IN CORSO, old stuff in COMPLETATO
const daFareItems = computed(() => {
  return filteredItems.value.filter(item => {
    // Exclude archived/eliminated items
    if (item.stato === 'Scartato' || item.stato === 'Eliminato') return false
    // Items with CRITICA or ALTA urgenza go to DA FARE
    return ['CRITICA', 'ALTA'].includes(item.urgenza)
  })
})

const inCorsoItems = computed(() => {
  return filteredItems.value.filter(item => {
    // Exclude archived/eliminated items
    if (item.stato === 'Scartato' || item.stato === 'Eliminato') return false
    // Items with MEDIA urgenza go to IN CORSO
    return item.urgenza === 'MEDIA'
  })
})

const completatoItems = computed(() => {
  return filteredItems.value.filter(item => {
    // Items that are "Fatto" or very old go to COMPLETATO
    // But exclude "Eliminato" and "Scartato" statuses
    if (item.stato === 'Eliminato' || item.stato === 'Scartato') return false
    return item.stato === 'Fatto' || item.urgenza === 'BASSA'
  })
})

function urgencyBadgeClass(urgenza) {
  const classes = {
    'CRITICA': 'bg-red-100 text-red-700',
    'ALTA': 'bg-orange-100 text-orange-700',
    'MEDIA': 'bg-yellow-100 text-yellow-700',
    'BASSA': 'bg-green-100 text-green-700'
  }
  return classes[urgenza] || 'bg-gray-100 text-gray-700'
}

function openModal(item) {
  selectedItem.value = item
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  selectedItem.value = null
}

function moveToCompleted(item) {
  // Mark item as completed based on tipo
  if (item.tipo === 'FU1') {
    store.updateEmployee(item.id, { statoFU1: 'Fatto' })
  } else if (item.tipo === 'FU2_MANAGER') {
    store.updateEmployee(item.id, { statoFU2Manager: 'Fatto' })
  } else if (item.tipo === 'FU2_DIP') {
    store.updateEmployee(item.id, { statoFU2Dip: 'Fatto' })
  } else if (item.tipo === 'RINNOVO') {
    store.updateEmployee(item.id, { statoRinnovo: 'Fatto' })
  } else if (item.tipo === 'DOSSIER') {
    store.updateEmployee(item.id, { statoDossierContratto: 'Fatto' })
  }
  closeModal()
}

function archiveItem(item) {
  deleteModalItem.value = item
  deleteModalAction.value = 'scarta'
  deleteModalOpen.value = true
}

function deleteItem(item) {
  deleteModalItem.value = item
  deleteModalAction.value = 'elimina'
  deleteModalOpen.value = true
}

function closeDeleteModal() {
  deleteModalOpen.value = false
  deleteModalItem.value = null
  deleteModalAction.value = ''
}

function confirmDelete() {
  const item = deleteModalItem.value
  if (!item) return
  const stato = deleteModalAction.value === 'elimina' ? 'Eliminato' : 'Scartato'
  if (item.tipo === 'FU1') {
    store.updateEmployee(item.id, { statoFU1: stato })
  } else if (item.tipo === 'FU2_MANAGER') {
    store.updateEmployee(item.id, { statoFU2Manager: stato })
  } else if (item.tipo === 'FU2_DIP') {
    store.updateEmployee(item.id, { statoFU2Dip: stato })
  } else if (item.tipo === 'RINNOVO') {
    store.updateEmployee(item.id, { statoRinnovo: stato })
  } else if (item.tipo === 'DOSSIER') {
    store.updateEmployee(item.id, { statoDossierContratto: stato })
  } else if (item.tipo === 'REVIEW_MANAGER') {
    store.updateEmployee(item.id, { statoReviewManager: stato })
  } else if (item.tipo === 'PC_SCADUTO' || item.tipo === 'PC_NON_FATTO') {
    store.updateEmployee(item.id, { statoPCKanban: stato })
  }
  closeDeleteModal()
}

function handleItemSaved() {
  closeModal()
  // Re-render: allUrgenze computed property will update automatically
}

function handleExportExcel() {
  const storeSnapshot = {
    employees: store.employees,
    colloqui: store.colloqui,
    ferie: store.ferie,
    colloquiPC: store.colloquiPC,
    dimissioni: store.dimissioni,
    valutazioni360: store.valutazioni360,
    allUrgenze: store.allUrgenze
  }
  exportToExcel(storeSnapshot)
}

function handleExportJSON() {
  const storeSnapshot = {
    employees: store.employees,
    colloqui: store.colloqui,
    ferie: store.ferie,
    colloquiPC: store.colloquiPC,
    dimissioni: store.dimissioni,
    valutazioni360: store.valutazioni360,
    allUrgenze: store.allUrgenze
  }
  exportToJSON(storeSnapshot)
}

function handleExportCSV() {
  exportKanbanCSV(store.allUrgenze)
}
</script>
