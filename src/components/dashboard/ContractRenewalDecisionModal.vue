<template>
  <Modal :open="open" title="Decisione Rinnovo Contratto" width="700px" @close="$emit('close')">
    <!-- Employee Context -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <p class="text-sm">
        <strong>Dipendente:</strong> {{ employeeName }} ({{ employeeTeam }})
      </p>
      <p class="text-sm mt-1">
        <strong>Scadenza Contratto:</strong> {{ formatDate(scadenzaContratto) }}
      </p>
      <p v-if="esitoProva" class="text-sm mt-1">
        <strong>Valutazione Prova:</strong>
        <span :class="esitoProva === 'Superato' ? 'text-emerald-600 font-medium' : esitoProva === 'Non Superato' ? 'text-red-600 font-medium' : 'text-blue-600 font-medium'">
          {{ esitoProva }}
        </span>
      </p>
    </div>

    <!-- Valutazione Summary (if available) -->
    <div v-if="valutazioneSummary" class="mb-4 space-y-2">
      <div v-if="valutazioneSummary.manager" class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
        <p class="font-semibold text-blue-900 mb-1">👨‍💼 Valutazione Manager</p>
        <p><strong>Raccomandazione:</strong> {{ valutazioneSummary.manager.raccomandazione }}</p>
        <p class="text-gray-500">Media voti: {{ valutazioneSummary.managerAvg }}/5</p>
      </div>
      <div v-if="valutazioneSummary.hr" class="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs">
        <p class="font-semibold text-purple-900 mb-1">👩‍💼 Validazione HR</p>
        <p><strong>Voto:</strong> {{ valutazioneSummary.hr.voto }}/10</p>
        <p v-if="valutazioneSummary.hr.commento" class="text-gray-500 mt-1">{{ valutazioneSummary.hr.commento }}</p>
      </div>
      <div v-if="valutazioneSummary.ceo" class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
        <p class="font-semibold text-amber-900 mb-1">👑 Decisione CEO</p>
        <p :class="valutazioneSummary.ceo.decisione === 'Confermare il dipendente' ? 'text-emerald-700 font-bold' : valutazioneSummary.ceo.decisione === 'Non confermare' ? 'text-red-700 font-bold' : 'text-amber-700 font-bold'">{{ valutazioneSummary.ceo.decisione }}</p>
      </div>
      <div v-if="!valutazioneSummary.manager" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
        <p class="text-yellow-800">⚠️ Nessuna valutazione del periodo di prova disponibile. <strong>Attenzione:</strong> si consiglia di completare la valutazione prima di decidere.</p>
      </div>
    </div>

    <form @submit.prevent="saveDecision" class="space-y-4">
      <!-- Decision Radio Buttons -->
      <div class="space-y-3">
        <fieldset>
          <legend class="text-sm font-semibold text-gray-900 mb-3">Decisione Rinnovo:</legend>

          <div class="space-y-2">
            <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors" :class="form.decisione === 'Rinnovato' ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
              <input
                v-model="form.decisione"
                type="radio"
                value="Rinnovato"
                class="w-4 h-4 text-emerald-600"
              />
              <span>
                <span class="font-medium text-gray-900">✓ Rinnovare</span>
                <span class="text-xs text-gray-600 block">(Stessi termini e condizioni)</span>
              </span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors" :class="form.decisione === 'Proroga' ? 'border-amber-400 bg-amber-50' : 'border-gray-200'">
              <input
                v-model="form.decisione"
                type="radio"
                value="Proroga"
                class="w-4 h-4 text-amber-600"
              />
              <span>
                <span class="font-medium text-gray-900">⏳ Proroga Temporanea</span>
                <span class="text-xs text-gray-600 block">(Estensione temporale del contratto)</span>
              </span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors" :class="form.decisione === 'Non Rinnovato' ? 'border-red-400 bg-red-50' : 'border-gray-200'">
              <input
                v-model="form.decisione"
                type="radio"
                value="Non Rinnovato"
                class="w-4 h-4 text-red-600"
              />
              <span>
                <span class="font-medium text-gray-900">✗ Non Rinnovare</span>
                <span class="text-xs text-gray-600 block">(Concludere il contratto)</span>
              </span>
            </label>
          </div>
        </fieldset>
      </div>

      <!-- Proroga Date Picker (conditional) -->
      <div v-if="form.decisione === 'Proroga'" class="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
        <label class="text-sm font-semibold text-amber-900 block">Proroga Fino A:</label>
        <input
          v-model="form.dataProrogaFino"
          type="date"
          class="w-full px-3 py-2 border rounded-lg text-sm"
        />
        <p class="text-xs text-amber-700">
          Specifica la nuova data di scadenza se si sceglie la proroga temporanea
        </p>
      </div>

      <!-- Notes -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-900">Note Decisione:</label>
        <textarea
          v-model="form.noteDecisioneRinnovo"
          placeholder="Ragione della decisione, circostanze, commenti per i registri HR..."
          class="w-full px-3 py-2 border rounded-lg text-sm h-24"
        />
      </div>

      <!-- Submit Buttons -->
      <div class="flex gap-3 pt-4 border-t justify-end">
        <button type="button" @click="$emit('close')" class="btn btn-secondary">Annulla</button>
        <button type="submit" :disabled="!form.decisione" class="btn btn-primary" :class="!form.decisione ? 'opacity-50 cursor-not-allowed' : ''">
          Salva Decisione
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import Modal from '@/components/ui/Modal.vue'

const props = defineProps({
  open: Boolean,
  employeeId: Number,
  employeeName: String,
  employeeTeam: String,
  scadenzaContratto: String,
  esitoProva: String
})

const emit = defineEmits(['close', 'saved'])
const store = useHrStore()

const form = ref({
  decisione: null,
  dataProrogaFino: null,
  noteDecisioneRinnovo: ''
})

// Get valutazione summary for the employee
const valutazioneSummary = computed(() => {
  if (!props.employeeId) return null
  const emp = store.employees.find(e => e.id === props.employeeId)
  if (!emp?.valutazionePeriodoProva) return { manager: null, hr: null, ceo: null }
  const v = emp.valutazionePeriodoProva
  const m = v.manager
  let managerAvg = '—'
  if (m) {
    const vals = [m.competenze, m.qualita, m.problemSolving, m.velocita, m.collaborazione, m.comunicazione, m.attitudine]
    managerAvg = (vals.reduce((a, b) => a + (b || 0), 0) / vals.length).toFixed(1)
  }
  return { manager: m || null, hr: v.hr || null, ceo: v.ceo || null, managerAvg }
})

// Reset form when modal opens
watch(() => props.open, (newVal) => {
  if (newVal) {
    form.value = {
      decisione: null,
      dataProrogaFino: null,
      noteDecisioneRinnovo: ''
    }
    // Set default proroga date to 3 months from scadenza
    if (props.scadenzaContratto) {
      const scadDate = new Date(props.scadenzaContratto)
      scadDate.setMonth(scadDate.getMonth() + 3)
      form.value.dataProrogaFino = scadDate.toISOString().split('T')[0]
    }
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })
}

function saveDecision() {
  if (!form.value.decisione) {
    alert('Seleziona una decisione')
    return
  }

  if (form.value.decisione === 'Proroga' && !form.value.dataProrogaFino) {
    alert('Specifica la data di proroga')
    return
  }

  // Update employee with decision
  store.updateEmployee(props.employeeId, {
    decisione: form.value.decisione,
    dataDecisioneRinnovo: new Date().toISOString().split('T')[0],
    noteDecisioneRinnovo: form.value.noteDecisioneRinnovo,
    dataProrogaFino: form.value.decisione === 'Proroga' ? form.value.dataProrogaFino : null
  })

  emit('saved')
  emit('close')
}
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-primary {
  @apply bg-emerald-600 text-white hover:bg-emerald-700;
}

.btn-primary:disabled {
  @apply bg-gray-300 cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}
</style>
