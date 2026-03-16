<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-wrap gap-3 items-center">
      <div class="flex gap-2">
        <label class="text-sm font-medium text-gray-700">📋 Mostra:</label>
        <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
          {{ visibleTypes.length }} settori attivi (entro 60 gg)
        </span>
      </div>

      <div class="flex gap-2">
        <label class="text-sm font-medium text-gray-700">Team:</label>
        <select v-model="filters.team" class="px-3 py-1 border rounded-lg text-sm">
          <option value="">-- Tutti --</option>
          <option v-for="team in store.teams" :key="team" :value="team">{{ team }}</option>
        </select>
      </div>

      <div class="flex gap-2">
        <label class="text-sm font-medium text-gray-700">Tipo:</label>
        <select v-model="filters.tipo" class="px-3 py-1 border rounded-lg text-sm">
          <option value="">-- Tutti i tipi --</option>
          <option value="onboarding">🤝 Onboarding</option>
          <option value="contratti">📋 Contratti</option>
          <option value="valutazioni">📊 Valutazioni</option>
          <option value="visite">🏥 Visite Mediche</option>
          <option value="preonboarding">⏳ Pre-Onboarding</option>
        </select>
      </div>

      <div class="flex gap-2 ml-auto">
        <button @click="handleExportExcel" class="btn btn-sm bg-green-50 text-green-700 hover:bg-green-100">📊 Excel</button>
        <button @click="handleExportJSON" class="btn btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100">📋 JSON</button>
        <button @click="handleExportCSV" class="btn btn-sm bg-amber-50 text-amber-700 hover:bg-amber-100">📄 CSV</button>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="grid grid-cols-2 gap-4">
      <!-- SCADENZA Column -->
      <div class="bg-gray-50 rounded-lg border-2 border-amber-300">
        <div class="bg-amber-600 text-white px-4 py-3 rounded-t-lg font-semibold flex items-center justify-between">
          <span>📅 SCADENZA</span>
          <span class="bg-amber-700 rounded-full px-2 py-1 text-xs font-bold">{{ scadenzaItems.length }}</span>
        </div>
        <div 
          @dragover.prevent="dragOverColumn = 'scadenza'"
          @drop="handleDrop('scadenza')"
          @dragleave="dragOverColumn = null"
          class="p-3 space-y-2 max-h-[600px] overflow-y-auto min-h-[400px] transition"
          :class="dragOverColumn === 'scadenza' ? 'bg-amber-50 border-2 border-dashed border-amber-400' : ''">
          <div v-for="item in scadenzaItems" 
            :key="`${item.id}-${item.tipo}`"
            draggable="true"
            @dragstart="startDrag($event, item, 'scadenza')"
            @click="openModal(item)"
            class="bg-white border-l-4 border-amber-500 rounded p-3 cursor-move hover:shadow-md transition group active:opacity-75">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="font-semibold text-sm text-gray-900 group-hover:text-amber-600">{{ item.nome }} {{ item.cognome }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ formatTipo(item.tipo) }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ item.team }}</p>
              </div>
              <span class="text-lg">{{ getTypeIcon(item.tipo) }}</span>
            </div>
            <div class="flex items-center justify-between mt-2">
              <span :class="['text-xs px-2 py-1 rounded font-semibold', urgencyBadgeClass(item.urgenza)]">
                {{ item.urgenza }}
              </span>
              <div class="text-right">
                <span class="text-xs font-semibold" :class="item.giorni <= 0 ? 'text-red-600' : 'text-gray-700'">{{ item.giorni }} gg</span>
                <div v-if="item.scadenza" class="text-[10px] text-gray-400">{{ fmtDateShort(item.scadenza) }}</div>
              </div>
            </div>
            <button @click.stop="moveToCompleted(item)" class="text-xs text-green-600 hover:text-green-800 font-medium py-1 rounded bg-green-50 hover:bg-green-100 w-full">
              ✓ Completa
            </button>
          </div>
          <div v-if="scadenzaItems.length === 0" class="text-center py-8">
            <p class="text-gray-300 text-sm">📭 Nessun item scadenza</p>
          </div>
        </div>
      </div>

      <!-- COMPLETATO Column -->
      <div class="bg-gray-50 rounded-lg border-2 border-green-300">
        <div class="bg-green-600 text-white px-4 py-3 rounded-t-lg font-semibold flex items-center justify-between">
          <span>✓ COMPLETATO</span>
          <span class="bg-green-700 rounded-full px-2 py-1 text-xs font-bold">{{ completatoItems.length }}</span>
        </div>
        <div 
          @dragover.prevent="dragOverColumn = 'completato'"
          @drop="handleDrop('completato')"
          @dragleave="dragOverColumn = null"
          class="p-3 space-y-2 max-h-[600px] overflow-y-auto min-h-[400px] transition"
          :class="dragOverColumn === 'completato' ? 'bg-green-50 border-2 border-dashed border-green-400' : ''">
          <div v-for="item in completatoItems" 
            :key="`${item.id}-${item.tipo}`"
            draggable="true"
            @dragstart="startDrag($event, item, 'completato')"
            class="bg-white border-l-4 border-green-500 rounded p-3 opacity-75 hover:opacity-100 transition cursor-move group">
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
            <p class="text-gray-300 text-sm">📭 Nessun completato</p>
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
        <div class="fixed inset-0 bg-black/50" @click="!isDeleting && closeDeleteModal"></div>
        <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 z-10 transition-all" 
          :class="isDeleting ? 'opacity-75' : ''">
          
          <!-- Loading Spinner Overlay -->
          <div v-if="isDeleting" class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-20 backdrop-blur-sm">
            <div class="flex flex-col items-center gap-3">
              <div class="relative w-12 h-12">
                <div class="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 border-r-red-500 animate-spin"></div>
              </div>
              <p class="text-sm font-medium text-gray-700">{{ deleteModalAction === 'elimina' ? 'Eliminazione...' : 'Scartamento...' }}</p>
            </div>
          </div>

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
            <button 
              @click="closeDeleteModal" 
              :disabled="isDeleting"
              class="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition">
              Annulla
            </button>
            <button 
              @click="confirmDelete" 
              :disabled="isDeleting"
              class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2">
              <span v-if="!isDeleting">{{ deleteModalAction === 'elimina' ? '🗑️ Elimina' : '✕ Scarta' }}</span>
              <span v-else class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
const isDeleting = ref(false)  // Loading state

const filters = ref({
  team: '',
  tipo: ''
})

// Drag & Drop state
const dragOverColumn = ref(null)
const draggedItem = ref(null)
const draggedFromColumn = ref(null)

// Calculate days from today
function getDaysFromToday(scadenzaDate) {
  if (!scadenzaDate) return 999
  const scadenza = new Date(scadenzaDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  scadenza.setHours(0, 0, 0, 0)
  const diff = scadenza - today
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Get all urgencies from store
const allItems = computed(() => store.allUrgenze.map(item => ({
  ...item,
  // Usa il campo giorni già calcolato dal store, oppure calcolalo se manca
  giorni: item.giorni !== undefined ? item.giorni : getDaysFromToday(item.scadenza)
})))

// Filter items
const filteredItems = computed(() => {
  return allItems.value.filter(item => {
    if (filters.value.team && item.team !== filters.value.team) return false
    
    // Apply type filter
    if (filters.value.tipo) {
      const tipoMap = {
        'onboarding': ['FU1', 'FU2_MANAGER', 'FU2_DIP', 'REVIEW_MANAGER'],
        'contratti': ['RINNOVO', 'DOSSIER', 'PC_SCADUTO', 'PC_NON_FATTO'],
        'valutazioni': ['VAL_CEO', 'VAL_HR', 'VAL_MANAGER'],
        'visite': ['VISITA_MEDICA'],
        'preonboarding': ['PRE_ONBOARDING']
      }
      const allowedTypes = tipoMap[filters.value.tipo] || []
      if (!allowedTypes.includes(item.tipo)) return false
    }
    
    return true
  })
})

const visibleTypes = computed(() => {
  const types = new Set(allItems.value.map(item => {
    if (['FU1', 'FU2_MANAGER', 'FU2_DIP', 'REVIEW_MANAGER'].includes(item.tipo)) return 'onboarding'
    if (['RINNOVO', 'DOSSIER', 'PC_SCADUTO', 'PC_NON_FATTO'].includes(item.tipo)) return 'contratti'
    if (['VAL_CEO', 'VAL_HR', 'VAL_MANAGER'].includes(item.tipo)) return 'valutazioni'
    if (item.tipo === 'VISITA_MEDICA') return 'visite'
    if (item.tipo === 'PRE_ONBOARDING') return 'preonboarding'
    return null
  }))
  types.delete(null)
  return Array.from(types)
})

// SCADENZA: tutti gli item non completati e non eliminati
const scadenzaItems = computed(() => {
  return filteredItems.value.filter(item => {
    if (item.stato === 'Fatto' || item.stato === 'Eliminato' || item.stato === 'Scartato') return false
    const giorni = getDaysFromToday(item.scadenza)
    return giorni >= 0
  }).sort((a, b) => getDaysFromToday(a.scadenza) - getDaysFromToday(b.scadenza))
})

// COMPLETATO: check stato field
const completatoItems = computed(() => {
  return filteredItems.value.filter(item => {
    return item.stato === 'Fatto'
  }).sort((a, b) => new Date(b.scadenza) - new Date(a.scadenza))
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

function getTypeIcon(tipo) {
  const icons = {
    'FU1': '🤝',
    'FU2_MANAGER': '👔',
    'FU2_DIP': '👤',
    'REVIEW_MANAGER': '📋',
    'RINNOVO': '🔄',
    'DOSSIER': '📁',
    'PC_SCADUTO': '⏰',
    'PC_NON_FATTO': '❌',
    'VAL_CEO': '👨‍💼',
    'VAL_HR': '📊',
    'VAL_MANAGER': '📈',
    'VISITA_MEDICA': '🏥',
    'PRE_ONBOARDING': '⏳'
  }
  return icons[tipo] || '📌'
}

function formatTipo(tipo) {
  const labels = {
    'FU1': 'Follow-up 1',
    'FU2_MANAGER': 'Follow-up 2 (Manager)',
    'FU2_DIP': 'Follow-up 2 (Dipendente)',
    'REVIEW_MANAGER': 'Valutazione Manager',
    'RINNOVO': 'Rinnovo Contratto',
    'DOSSIER': 'Dossier Contratto',
    'PC_SCADUTO': 'P&C Scaduto',
    'PC_NON_FATTO': 'P&C Non Fatto',
    'VAL_CEO': 'Approvazione CEO',
    'VAL_HR': 'Approvazione HR',
    'VAL_MANAGER': 'Valutazione Manager',
    'VISITA_MEDICA': 'Idoneità Medica',
    'PRE_ONBOARDING': 'Pre-Onboarding'
  }
  return labels[tipo] || tipo
}

// Drag & Drop handlers
function startDrag(event, item, column) {
  draggedItem.value = item
  draggedFromColumn.value = column
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/html', event.target.innerHTML)
}

function handleDrop(toColumn) {
  if (!draggedItem.value || !draggedFromColumn.value) return
  if (draggedFromColumn.value === toColumn) {
    draggedItem.value = null
    draggedFromColumn.value = null
    dragOverColumn.value = null
    return
  }

  const item = draggedItem.value
  const newStato = toColumn === 'completato' ? 'Fatto' : 'In Corso'

  // Update the item state based on target column
  if (item.tipo === 'FU1') {
    store.updateEmployee(item.id, { statoFU1: newStato })
  } else if (item.tipo === 'FU2_MANAGER') {
    store.updateEmployee(item.id, { statoFU2Manager: newStato })
  } else if (item.tipo === 'FU2_DIP') {
    store.updateEmployee(item.id, { statoFU2Dip: newStato })
  } else if (item.tipo === 'RINNOVO') {
    store.updateEmployee(item.id, { statoRinnovo: newStato })
  } else if (item.tipo === 'DOSSIER') {
    store.updateEmployee(item.id, { statoDossierContratto: newStato })
  } else if (item.tipo === 'REVIEW_MANAGER') {
    store.updateEmployee(item.id, { statoReviewManager: newStato })
  } else if (item.tipo === 'PC_SCADUTO' || item.tipo === 'PC_NON_FATTO') {
    store.updateEmployee(item.id, { statoPCKanban: newStato })
  } else if (item.tipo === 'VAL_CEO' || item.tipo === 'VAL_HR' || item.tipo === 'VAL_MANAGER') {
    store.updateEmployee(item.id, { statoValutazione: newStato })
  } else if (item.tipo === 'VISITA_MEDICA') {
    // For medical visits, mark completion but don't change the visit date
    // (completion would be marked by changing the visit status in the medical visit tracker)
    if (newStato === 'Fatto') {
      store.updateEmployee(item.id, { statoVisitaMedica: 'Fatto' })
    }
  } else if (item.tipo === 'PRE_ONBOARDING') {
    // Pre-onboarding just marks as Fatto when moved to completato (no state field to update)
    if (newStato === 'Fatto') {
      store.updateEmployee(item.id, { statoPreOnboarding: 'Fatto' })
    }
  }

  draggedItem.value = null
  draggedFromColumn.value = null
  dragOverColumn.value = null
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
  } else if (item.tipo === 'REVIEW_MANAGER') {
    store.updateEmployee(item.id, { statoReviewManager: 'Fatto' })
  } else if (item.tipo === 'PC_SCADUTO' || item.tipo === 'PC_NON_FATTO') {
    store.updateEmployee(item.id, { statoPCKanban: 'Fatto' })
  } else if (item.tipo === 'VAL_CEO' || item.tipo === 'VAL_HR' || item.tipo === 'VAL_MANAGER') {
    store.updateEmployee(item.id, { statoValutazione: 'Fatto' })
  } else if (item.tipo === 'VISITA_MEDICA') {
    store.updateEmployee(item.id, { statoVisitaMedica: 'Fatto' })
  } else if (item.tipo === 'PRE_ONBOARDING') {
    store.updateEmployee(item.id, { statoPreOnboarding: 'Fatto' })
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
  isDeleting.value = false
}

function confirmDelete() {
  const item = deleteModalItem.value
  if (!item || isDeleting.value) return
  
  isDeleting.value = true
  const stato = deleteModalAction.value === 'elimina' ? 'Eliminato' : 'Scartato'
  
  // Simulate slight delay for better UX (shows spinner)
  setTimeout(() => {
    try {
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
      
      // Close modal after successful deletion
      setTimeout(() => {
        closeDeleteModal()
        isDeleting.value = false
      }, 300)
    } catch (err) {
      console.error('Delete failed:', err)
      isDeleting.value = false
    }
  }, 500)
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
