<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold">{{ modalTitle }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ item?.nome }} • {{ item?.team }}</p>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      </div>

      <!-- Content Based on Item Type -->
      <div class="p-6">
        <!-- FU1 Form -->
        <div v-if="item?.tipo === 'FU1'" class="space-y-4">
          <p class="text-sm text-gray-600">Scadenza: <strong>{{ item.scadenza }}</strong></p>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            Compilare il primo follow-up (FU1) a 30 giorni da inizio onboarding
          </div>
          <FU1ColloquioForm :employee-name="item.nome" @saved="handleSaved" @cancel="closeModal" />
        </div>

        <!-- FU2 Manager Form -->
        <div v-if="item?.tipo === 'FU2_MANAGER'" class="space-y-4">
          <p class="text-sm text-gray-600">Scadenza: <strong>{{ item.scadenza }}</strong></p>
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-900">
            Valutazione Manager a 45 giorni da inizio onboarding
          </div>
          <EmployeeReviewManagerForm :employee-id="item.id" :initial-data="getManagerData()"
            @saved="handleSaved" @cancel="closeModal" />
        </div>

        <!-- FU2 Dipendente Form -->
        <div v-if="item?.tipo === 'FU2_DIP'" class="space-y-4">
          <p class="text-sm text-gray-600">Scadenza: <strong>{{ item.scadenza }}</strong></p>
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-900">
            Valutazione benessere dipendente: fine prova - 30 giorni
          </div>
          <FU2DipendenteSentimentForm :employee-name="item.nome"
            @saved="handleSaved" @cancel="closeModal" />
        </div>

        <!-- Employee Review Manager Form -->
        <div v-if="item?.tipo === 'REVIEW_MANAGER'" class="space-y-4">
          <p class="text-sm text-gray-600">Scadenza: <strong>{{ item.scadenza }}</strong></p>
          <EmployeeReviewManagerForm :employee-id="item.id" :initial-data="getManagerData()"
            @saved="handleSaved" @cancel="closeModal" />
        </div>

        <!-- Employee Review HR Form -->
        <div v-if="item?.tipo === 'REVIEW_HR'" class="space-y-4">
          <p class="text-sm text-gray-600">Scadenza: <strong>{{ item.scadenza }}</strong></p>
          <EmployeeReviewHRForm :employee-id="item.id" :initial-data="getHRData()"
            @saved="handleSaved" @cancel="closeModal" />
        </div>

        <!-- Contract Renewal Form -->
        <div v-if="item?.tipo === 'RINNOVO'" class="space-y-4">
          <p class="text-sm text-gray-600">Scadenza Rinnovo: <strong>{{ item.scadenza }}</strong></p>
          <ContractRenewalForm :employee-id="item.id" contract-type="determinato"
            @saved="handleSaved" @cancel="closeModal" />
        </div>

        <!-- Contract Dossier Checklist -->
        <div v-if="item?.tipo === 'DOSSIER'" class="space-y-4">
          <p class="text-sm text-gray-600">Scadenza Dossier: <strong>{{ item.scadenza }}</strong></p>
          <ContractDossierChecklist :employee-id="item.id"
            @saved="handleSaved" @cancel="closeModal" />
        </div>

        <!-- Fallback -->
        <div v-if="!['FU1', 'FU2_MANAGER', 'FU2_DIP', 'REVIEW_MANAGER', 'REVIEW_HR', 'RINNOVO', 'DOSSIER'].includes(item?.tipo)" class="text-center py-8">
          <p class="text-gray-500">Tipo di azione non riconosciuto: {{ item?.tipo }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import EmployeeReviewManagerForm from './EmployeeReviewManagerForm.vue'
import EmployeeReviewHRForm from './EmployeeReviewHRForm.vue'
// Import placeholder components (create stub versions)
import FU1ColloquioForm from './FU1ColloquioForm.vue'
import FU2DipendenteSentimentForm from './FU2DipendenteSentimentForm.vue'
import ContractRenewalForm from './ContractRenewalForm.vue'
import ContractDossierChecklist from './ContractDossierChecklist.vue'

const props = defineProps({
  isOpen: Boolean,
  item: Object
})

const emit = defineEmits(['close', 'saved'])
const store = useHrStore()

const modalTitle = computed(() => {
  const typeLabels = {
    'FU1': 'Follow-up 1 (30gg)',
    'FU2_MANAGER': 'Valutazione Manager (45gg)',
    'FU2_DIP': 'Sentimento Dipendente (Fine Prova)',
    'REVIEW_MANAGER': 'Review Manager',
    'REVIEW_HR': 'Review HR - Fine Prova',
    'RINNOVO': 'Rinnovo Contratto',
    'DOSSIER': 'Dossier Contratto'
  }
  return typeLabels[props.item?.tipo] || 'Azione'
})

function getManagerData() {
  if (!props.item?.id) return {}
  const emp = store.employees.find(e => e.id === props.item.id)
  return emp?.valutazionePeriodoProva?.manager || {}
}

function getHRData() {
  if (!props.item?.id) return {}
  const emp = store.employees.find(e => e.id === props.item.id)
  return emp?.valutazionePeriodoProva?.hr || {}
}

function handleSaved() {
  emit('saved')
  closeModal()
}

function closeModal() {
  emit('close')
}
</script>
