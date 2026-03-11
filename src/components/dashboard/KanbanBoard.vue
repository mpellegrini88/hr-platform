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

      <button @click="exportCSV" class="btn btn-secondary text-sm">Scarica CSV</button>
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
            <p class="font-semibold text-sm text-gray-900 group-hover:text-red-600">{{ item.nome }}</p>
            <p class="text-xs text-gray-600 mt-1">{{ item.tipo }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ item.team }}</p>
            <div class="flex items-center justify-between mt-2">
              <span :class="['text-xs px-2 py-1 rounded font-semibold', urgencyBadgeClass(item.urgenza)]">
                {{ item.urgenza }}
              </span>
              <span class="text-xs text-gray-600">{{ item.giorni }} gg</span>
            </div>
            <button @click.stop="openModal(item)" class="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium">
              Apri →
            </button>
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
            <p class="font-semibold text-sm text-gray-900 group-hover:text-orange-600">{{ item.nome }}</p>
            <p class="text-xs text-gray-600 mt-1">{{ item.tipo }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ item.team }}</p>
            <div class="flex items-center justify-between mt-2">
              <span :class="['text-xs px-2 py-1 rounded font-semibold', urgencyBadgeClass(item.urgenza)]">
                {{ item.urgenza }}
              </span>
              <span class="text-xs text-gray-600">{{ item.giorni }} gg</span>
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
            class="bg-white border-l-4 border-green-500 rounded p-3 opacity-75">
            <p class="font-semibold text-sm text-gray-900 line-through">{{ item.nome }}</p>
            <p class="text-xs text-gray-600 mt-1">{{ item.tipo }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ item.team }}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs px-2 py-1 rounded font-semibold bg-green-100 text-green-700">
                ✓ FATTO
              </span>
              <span class="text-xs text-gray-600">{{ item.giorni }} gg fa</span>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import ActionItemModal from './ActionItemModal.vue'

const store = useHrStore()
const modalOpen = ref(false)
const selectedItem = ref(null)

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
    // Items with CRITICA or ALTA urgenza go to DA FARE
    return ['CRITICA', 'ALTA'].includes(item.urgenza)
  })
})

const inCorsoItems = computed(() => {
  return filteredItems.value.filter(item => {
    // Items with MEDIA urgenza go to IN CORSO
    return item.urgenza === 'MEDIA'
  })
})

const completatoItems = computed(() => {
  return filteredItems.value.filter(item => {
    // Items that are "Fatto" or very old go to COMPLETATO
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

function handleItemSaved() {
  closeModal()
  // Re-render: allUrgenze computed property will update automatically
}

function exportCSV() {
  const headers = ['Nome', 'Team', 'Tipo', 'Scadenza', 'Urgenza', 'Stato']
  const rows = filteredItems.value.map(item => [
    item.nome,
    item.team,
    item.tipo,
    item.scadenza,
    item.urgenza,
    item.stato || 'Da Fare'
  ])

  let csv = headers.join(',') + '\n'
  rows.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n'
  })

  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv))
  element.setAttribute('download', 'kanban-export.csv')
  element.click()
}
</script>
