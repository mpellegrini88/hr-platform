<template>
  <form @submit.prevent="saveReview" class="space-y-6">
    <!-- Header Info -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="font-semibold text-blue-900 mb-2">Valutazione Manager - Periodo di Prova (45gg)</h3>
      <p class="text-sm text-blue-700">Data: {{ new Date().toLocaleDateString('it-IT') }}</p>
    </div>

    <!-- 7 Scale Sections -->
    <section class="space-y-4">
      <h4 class="font-semibold text-gray-900">Valutazione delle Competenze</h4>

      <!-- Competenze Tecniche -->
      <div class="border rounded-lg p-4 bg-gray-50">
        <label class="block font-medium text-gray-900 mb-3">1. Competenze Tecniche</label>
        <div class="flex gap-2 mb-3">
          <button v-for="n in 5" :key="n" type="button" @click="form.competenzeTecniche = n"
            :class="[n <= form.competenzeTecniche ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300', 'px-3 py-2 rounded font-semibold']">
            {{ n }}
          </button>
        </div>
        <textarea v-model="form.noteCompetenzeTecniche" placeholder="Note su competenze tecniche..."
          class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
      </div>

      <!-- Qualità Lavoro -->
      <div class="border rounded-lg p-4 bg-gray-50">
        <label class="block font-medium text-gray-900 mb-3">2. Qualità del Lavoro</label>
        <div class="flex gap-2 mb-3">
          <button v-for="n in 5" :key="n" type="button" @click="form.qualitaLavoro = n"
            :class="[n <= form.qualitaLavoro ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300', 'px-3 py-2 rounded font-semibold']">
            {{ n }}
          </button>
        </div>
        <textarea v-model="form.noteQualitaLavoro" placeholder="Note su qualità del lavoro..."
          class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
      </div>

      <!-- Problem Solving -->
      <div class="border rounded-lg p-4 bg-gray-50">
        <label class="block font-medium text-gray-900 mb-3">3. Problem Solving</label>
        <div class="flex gap-2 mb-3">
          <button v-for="n in 5" :key="n" type="button" @click="form.problemSolving = n"
            :class="[n <= form.problemSolving ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300', 'px-3 py-2 rounded font-semibold']">
            {{ n }}
          </button>
        </div>
        <textarea v-model="form.noteProblemSolving" placeholder="Note su problem solving..."
          class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
      </div>

      <!-- Velocità Apprendimento -->
      <div class="border rounded-lg p-4 bg-gray-50">
        <label class="block font-medium text-gray-900 mb-3">4. Velocità di Apprendimento</label>
        <div class="flex gap-2 mb-3">
          <button v-for="n in 5" :key="n" type="button" @click="form.velocitaApprendimento = n"
            :class="[n <= form.velocitaApprendimento ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300', 'px-3 py-2 rounded font-semibold']">
            {{ n }}
          </button>
        </div>
        <textarea v-model="form.noteVelocitaApprendimento" placeholder="Note su velocità di apprendimento..."
          class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
      </div>

      <!-- Collaborazione -->
      <div class="border rounded-lg p-4 bg-gray-50">
        <label class="block font-medium text-gray-900 mb-3">5. Collaborazione e Teamwork</label>
        <div class="flex gap-2 mb-3">
          <button v-for="n in 5" :key="n" type="button" @click="form.collaborazione = n"
            :class="[n <= form.collaborazione ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300', 'px-3 py-2 rounded font-semibold']">
            {{ n }}
          </button>
        </div>
        <textarea v-model="form.noteCollaborazione" placeholder="Note su collaborazione..."
          class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
      </div>

      <!-- Comunicazione -->
      <div class="border rounded-lg p-4 bg-gray-50">
        <label class="block font-medium text-gray-900 mb-3">6. Comunicazione</label>
        <div class="flex gap-2 mb-3">
          <button v-for="n in 5" :key="n" type="button" @click="form.comunicazione = n"
            :class="[n <= form.comunicazione ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300', 'px-3 py-2 rounded font-semibold']">
            {{ n }}
          </button>
        </div>
        <textarea v-model="form.noteComunicazione" placeholder="Note su comunicazione..."
          class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
      </div>

      <!-- Attitudine/Cultura -->
      <div class="border rounded-lg p-4 bg-gray-50">
        <label class="block font-medium text-gray-900 mb-3">7. Attitudine verso la Cultura Aziendale</label>
        <div class="flex gap-2 mb-3">
          <button v-for="n in 5" :key="n" type="button" @click="form.attitudineCultura = n"
            :class="[n <= form.attitudineCultura ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300', 'px-3 py-2 rounded font-semibold']">
            {{ n }}
          </button>
        </div>
        <textarea v-model="form.noteAttitudineCultura" placeholder="Note su attitudine culturale..."
          class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
      </div>
    </section>

    <!-- Osservazioni Generali -->
    <section class="space-y-2">
      <h4 class="font-semibold text-gray-900">Osservazioni Generali</h4>
      <textarea v-model="form.noteGenerali" placeholder="Osservazioni generali sul periodo..."
        class="w-full px-3 py-2 border rounded-lg text-sm h-24"></textarea>
    </section>

    <!-- Aree di Miglioramento -->
    <section class="space-y-2">
      <h4 class="font-semibold text-gray-900">Aree di Miglioramento</h4>
      <textarea v-model="form.areiMiglioramento" placeholder="Indicare le aree dove il dipendente dovrebbe migliorare..."
        class="w-full px-3 py-2 border rounded-lg text-sm h-20"></textarea>
    </section>

    <!-- Punti di Forza -->
    <section class="space-y-2">
      <h4 class="font-semibold text-gray-900">Punti di Forza</h4>
      <textarea v-model="form.puntiForzaManager" placeholder="Punti di forza identificati..."
        class="w-full px-3 py-2 border rounded-lg text-sm h-20"></textarea>
    </section>

    <!-- Raccomandazione -->
    <section class="space-y-2">
      <h4 class="font-semibold text-gray-900">Raccomandazione</h4>
      <label class="block text-sm text-gray-700 mb-2">Azione consigliata per fine periodo di prova:</label>
      <div class="space-y-2">
        <button v-for="opt in ['Confermare', 'Proroga', 'Non confermare']" :key="opt" type="button"
          @click="form.raccomandazioneManager = opt"
          :class="[form.raccomandazioneManager === opt ? 'ring-2 ring-blue-500 bg-blue-50' : 'border', 'w-full px-4 py-2 rounded-lg text-left font-medium transition']">
          {{ opt }}
        </button>
      </div>
    </section>

    <!-- Motivazione Raccomandazione -->
    <section class="space-y-2">
      <h4 class="font-semibold text-gray-900">Motivazione della Raccomandazione</h4>
      <textarea v-model="form.motivazione" placeholder="Spiegare il motivo della raccomandazione..."
        class="w-full px-3 py-2 border rounded-lg text-sm h-24"></textarea>
    </section>

    <!-- Suggerimenti e Necessità -->
    <section class="space-y-2">
      <h4 class="font-semibold text-gray-900">Suggerimenti e Necessità</h4>
      <textarea v-model="form.suggerimenti" placeholder="Supporto, training, o risorse necessarie..."
        class="w-full px-3 py-2 border rounded-lg text-sm h-20"></textarea>
    </section>

    <!-- Firma Manager -->
    <section class="space-y-3 border-t pt-4">
      <h4 class="font-semibold text-gray-900">Firma Manager</h4>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome Manager (Stampatello)</label>
          <input v-model="form.nomeManagerFirma" placeholder="Es: Marco Rossi" class="w-full px-3 py-2 border rounded-lg text-sm"></input>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <input v-model="form.dataFirmaManager" type="date" class="w-full px-3 py-2 border rounded-lg text-sm"></input>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Firma (digitale)</label>
        <input v-model="form.firmaManagerDigitale" placeholder="Es: M. Rossi" class="w-full px-3 py-2 border rounded-lg text-sm"></input>
      </div>
    </section>

    <!-- Action Buttons -->
    <div class="flex gap-3 pt-4 border-t">
      <button type="submit" class="btn btn-primary">
        Salva Valutazione Manager
      </button>
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        Annulla
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'

const props = defineProps({
  employeeId: Number,
  initialData: Object
})

const emit = defineEmits(['saved', 'cancel'])
const store = useHrStore()

const form = ref({
  competenzeTecniche: props.initialData?.competenzeTecniche || 0,
  noteCompetenzeTecniche: props.initialData?.noteCompetenzeTecniche || '',
  qualitaLavoro: props.initialData?.qualitaLavoro || 0,
  noteQualitaLavoro: props.initialData?.noteQualitaLavoro || '',
  problemSolving: props.initialData?.problemSolving || 0,
  noteProblemSolving: props.initialData?.noteProblemSolving || '',
  velocitaApprendimento: props.initialData?.velocitaApprendimento || 0,
  noteVelocitaApprendimento: props.initialData?.noteVelocitaApprendimento || '',
  collaborazione: props.initialData?.collaborazione || 0,
  noteCollaborazione: props.initialData?.noteCollaborazione || '',
  comunicazione: props.initialData?.comunicazione || 0,
  noteComunicazione: props.initialData?.noteComunicazione || '',
  attitudineCultura: props.initialData?.attitudineCultura || 0,
  noteAttitudineCultura: props.initialData?.noteAttitudineCultura || '',
  noteGenerali: props.initialData?.noteGenerali || '',
  areiMiglioramento: props.initialData?.areiMiglioramento || '',
  puntiForzaManager: props.initialData?.puntiForzaManager || '',
  raccomandazioneManager: props.initialData?.raccomandazioneManager || '',
  motivazione: props.initialData?.motivazione || '',
  suggerimenti: props.initialData?.suggerimenti || '',
  nomeManagerFirma: props.initialData?.nomeManagerFirma || '',
  dataFirmaManager: props.initialData?.dataFirmaManager || new Date().toISOString().split('T')[0],
  firmaManagerDigitale: props.initialData?.firmaManagerDigitale || ''
})

function saveReview() {
  // Validazione base
  if (!form.value.raccomandazioneManager) {
    alert('Selezionare una raccomandazione')
    return
  }

  // Salva nel store
  store.saveValutazioneManager(props.employeeId, form.value)
  emit('saved')
}
</script>
