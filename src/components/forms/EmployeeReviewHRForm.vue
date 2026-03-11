<template>
  <form @submit.prevent="saveReview" class="space-y-6">
    <!-- Header Info -->
    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 class="font-semibold text-green-900 mb-2">Valutazione HR - Fine Periodo di Prova</h3>
      <p class="text-sm text-green-700">Data: {{ new Date().toLocaleDateString('it-IT') }}</p>
      <p v-if="managerStatus" class="text-sm text-green-700 mt-1">
        Status Manager: <span class="font-semibold">{{ managerStatus }}</span>
      </p>
    </div>

    <!-- Validazione Amministrativa -->
    <section class="space-y-3">
      <h4 class="font-semibold text-gray-900">Validazione Amministrativa</h4>
      <div class="space-y-2 border rounded-lg p-4 bg-gray-50">
        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="form.verificaDocumentation" type="checkbox" class="w-4 h-4 rounded">
          <span class="text-sm text-gray-700">Documenti onboarding completi</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="form.verificaContratto" type="checkbox" class="w-4 h-4 rounded">
          <span class="text-sm text-gray-700">Contratto firmato e registrato</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="form.verificaAssicurazione" type="checkbox" class="w-4 h-4 rounded">
          <span class="text-sm text-gray-700">Copertura assicurativa attiva</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="form.verificaSystemIT" type="checkbox" class="w-4 h-4 rounded">
          <span class="text-sm text-gray-700">Sistemi IT e accessi configurati</span>
        </label>
      </div>
    </section>

    <!-- Allineamento Cultura -->
    <section class="space-y-3">
      <h4 class="font-semibold text-gray-900">Allineamento con Cultura Aziendale</h4>
      <label class="block text-sm text-gray-700 mb-2">Valutazione (1 = Scarso | 5 = Eccellente):</label>
      <div class="flex gap-2 mb-3">
        <button v-for="n in 5" :key="n" type="button" @click="form.allineamentoCultura = n"
          :class="[n <= form.allineamentoCultura ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300', 'px-3 py-2 rounded font-semibold']">
          {{ n }}
        </button>
      </div>
      <textarea v-model="form.noteAllineamentoCultura" placeholder="Note su allineamento con cultura..."
        class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
    </section>

    <!-- Esito Periodo di Prova -->
    <section class="space-y-3">
      <h4 class="font-semibold text-gray-900">Esito del Periodo di Prova</h4>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Esito Finale:</label>
        <div class="space-y-2">
          <button v-for="opt in ['Superato', 'Non Superato', 'Rinviato']" :key="opt" type="button"
            @click="form.esitoProvaFinale = opt"
            :class="[form.esitoProvaFinale === opt ? 'ring-2 ring-green-500 bg-green-50' : 'border', 'w-full px-4 py-2 rounded-lg text-left font-medium transition']">
            {{ opt }}
          </button>
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Scheda Prova Grade:</label>
        <div class="flex gap-2">
          <button v-for="grade in ['A+', 'A', 'B+', 'B']" :key="grade" type="button"
            @click="form.schedaProvaGrade = grade"
            :class="[form.schedaProvaGrade === grade ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300', 'py-2 px-4 rounded font-semibold']">
            {{ grade }}
          </button>
        </div>
      </div>
    </section>

    <!-- Note e Osservazioni -->
    <section class="space-y-3">
      <h4 class="font-semibold text-gray-900">Note e Osservazioni</h4>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Osservazioni Generali</label>
        <textarea v-model="form.noteHR" placeholder="Osservazioni generali su tutto il periodo di prova..."
          class="w-full px-3 py-2 border rounded-lg text-sm h-20"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Aree di Miglioramento</label>
        <textarea v-model="form.areiMiglioramentoHR" placeholder="Aree dove il dipendente dovrebbe continuare a svilupparsi..."
          class="w-full px-3 py-2 border rounded-lg text-sm h-20"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Punti di Forza</label>
        <textarea v-model="form.puntiForzaHR" placeholder="Punti di forza identificati durante il periodo..."
          class="w-full px-3 py-2 border rounded-lg text-sm h-20"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Riassunto Periodo di Prova</label>
        <textarea v-model="form.periodoProvaNote" placeholder="Sintesi complessiva del percorso onboarding..."
          class="w-full px-3 py-2 border rounded-lg text-sm h-24"></textarea>
      </div>
    </section>

    <!-- Firma HR -->
    <section class="space-y-3 border-t pt-4">
      <h4 class="font-semibold text-gray-900">Firma HR</h4>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome HR (Stampatello)</label>
          <input v-model="form.nomeHRFirma" placeholder="Es: Anna Bianchi" class="w-full px-3 py-2 border rounded-lg text-sm"></input>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <input v-model="form.dataFirmaHR" type="date" class="w-full px-3 py-2 border rounded-lg text-sm"></input>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Firma (digitale)</label>
        <input v-model="form.firmaHRDigitale" placeholder="Es: A. Bianchi" class="w-full px-3 py-2 border rounded-lg text-sm"></input>
      </div>
    </section>

    <!-- Approvazione CEO (Read-only Info) -->
    <section class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
      <h4 class="font-semibold text-yellow-900">Status Approvazione CEO (READ-ONLY)</h4>
      <div class="text-sm text-yellow-800">
        <p><strong>Status Attuale:</strong> {{ form.approvazioneFabnCEO || 'Pendente' }}</p>
        <p class="mt-2 text-xs">La revisione HR è completa. Il CEO la esaminerà per l'approvazione finale.</p>
      </div>
    </section>

    <!-- Action Buttons -->
    <div class="flex gap-3 pt-4 border-t">
      <button type="submit" class="btn btn-primary">
        Salva Valutazione HR
      </button>
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        Annulla
      </button>
      <button v-if="managerData" type="button" @click="showManagerReview = true" class="btn btn-outline text-xs">
        Visualizza Review Manager
      </button>
    </div>

    <!-- Manager Review Preview (Modal) -->
    <div v-if="showManagerReview && managerData" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6">
        <h3 class="font-semibold text-lg mb-4">Valutazione Manager - Preview</h3>
        <div class="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <label class="font-medium text-gray-700">Competenze Tecniche:</label>
            <p class="text-gray-600">{{ managerData.competenzeTecniche }} / 5</p>
          </div>
          <div>
            <label class="font-medium text-gray-700">Qualità Lavoro:</label>
            <p class="text-gray-600">{{ managerData.qualitaLavoro }} / 5</p>
          </div>
          <div>
            <label class="font-medium text-gray-700">Problem Solving:</label>
            <p class="text-gray-600">{{ managerData.problemSolving }} / 5</p>
          </div>
          <div>
            <label class="font-medium text-gray-700">Velocità Apprendimento:</label>
            <p class="text-gray-600">{{ managerData.velocitaApprendimento }} / 5</p>
          </div>
          <div>
            <label class="font-medium text-gray-700">Collaborazione:</label>
            <p class="text-gray-600">{{ managerData.collaborazione }} / 5</p>
          </div>
          <div>
            <label class="font-medium text-gray-700">Comunicazione:</label>
            <p class="text-gray-600">{{ managerData.comunicazione }} / 5</p>
          </div>
        </div>
        <div class="mb-4">
          <label class="text-sm font-medium text-gray-700">Raccomandazione Manager:</label>
          <p class="text-gray-600 font-semibold">{{ managerData.raccomandazioneManager }}</p>
        </div>
        <button type="button" @click="showManagerReview = false" class="btn btn-secondary w-full">Chiudi</button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'

const props = defineProps({
  employeeId: Number,
  initialData: Object
})

const emit = defineEmits(['saved', 'cancel'])
const store = useHrStore()

const showManagerReview = ref(false)

const form = ref({
  verificaDocumentation: props.initialData?.verificaDocumentation || false,
  verificaContratto: props.initialData?.verificaContratto || false,
  verificaAssicurazione: props.initialData?.verificaAssicurazione || false,
  verificaSystemIT: props.initialData?.verificaSystemIT || false,
  allineamentoCultura: props.initialData?.allineamentoCultura || 0,
  noteAllineamentoCultura: props.initialData?.noteAllineamentoCultura || '',
  esitoProvaFinale: props.initialData?.esitoProvaFinale || '',
  schedaProvaGrade: props.initialData?.schedaProvaGrade || '',
  noteHR: props.initialData?.noteHR || '',
  areiMiglioramentoHR: props.initialData?.areiMiglioramentoHR || '',
  puntiForzaHR: props.initialData?.puntiForzaHR || '',
  periodoProvaNote: props.initialData?.periodoProvaNote || '',
  nomeHRFirma: props.initialData?.nomeHRFirma || '',
  dataFirmaHR: props.initialData?.dataFirmaHR || new Date().toISOString().split('T')[0],
  firmaHRDigitale: props.initialData?.firmaHRDigitale || '',
  approvazioneFabnCEO: props.initialData?.approvazioneFabnCEO || 'Pendente'
})

// Carica manager data se esiste
const employee = computed(() => store.employees.find(e => e.id === props.employeeId))
const managerData = computed(() => employee.value?.valutazionePeriodoProva?.manager)
const managerStatus = computed(() => {
  if (!managerData.value) return 'Non compilato'
  return 'Completato'
})

function saveReview() {
  // Validazione base
  if (!form.value.esitoProvaFinale) {
    alert('Selezionare un esito finale')
    return
  }

  if (!form.value.schedaProvaGrade) {
    alert('Selezionare un grade')
    return
  }

  // Verifica che manager review sia completo
  if (!managerData.value) {
    alert('Errore: la valutazione Manager non è ancora completa. Compilare prima la valutazione Manager.')
    return
  }

  // Salva nel store
  store.saveValutazioneHR(props.employeeId, form.value)
  emit('saved')
}
</script>
