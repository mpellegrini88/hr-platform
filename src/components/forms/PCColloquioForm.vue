<template>
  <form @submit.prevent="save" class="space-y-4">
    <!-- Employee Context -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 class="font-semibold text-blue-900 mb-2">Colloquio P&C</h4>
      <p class="text-sm text-blue-800">
        <strong>{{ employeeName }}</strong> | Team: {{ employeeTeam }}
      </p>
      <p v-if="lastColloquioDate" class="text-xs text-blue-700 mt-1">
        Ultimo colloquio: {{ formatDate(lastColloquioDate) }} ({{ daysSinceLastColloquio }} giorni fa)
      </p>
    </div>

    <!-- Behavioral Scales Section -->
    <div class="space-y-4 border-t pt-4">
      <h3 class="font-semibold text-gray-900 text-sm">Scale Comportamentali</h3>

      <ScaleInput
        v-model="form.esaur"
        label="Esaurimento (MBI)"
        hint="Inverto"
        minLabel="1 = Non esausto"
        maxLabel="5 = Molto esausto"
        inverted
      />

      <ScaleInput
        v-model="form.carico"
        label="Carico Lavorativo"
        hint="Inverto"
        minLabel="1 = Basso"
        maxLabel="5 = Molto alto"
        inverted
      />

      <ScaleInput
        v-model="form.motiv"
        label="Motivazione"
        minLabel="1 = Molto bassa"
        maxLabel="5 = Molto alta"
      />

      <ScaleInput
        v-model="form.supp"
        label="Supporto Ricevuto"
        minLabel="1 = Molto basso"
        maxLabel="5 = Molto alto"
      />

      <ScaleInput
        v-model="form.equil"
        label="Equilibrio Vita-Lavoro"
        minLabel="1 = Molto basso"
        maxLabel="5 = Molto alto"
      />

      <ScaleInput
        v-model="form.intent"
        label="Intenzione di Restare"
        minLabel="1 = Molto bassa"
        maxLabel="5 = Molto alta"
      />
    </div>

    <!-- Manager Assessment -->
    <div class="space-y-4 border-t pt-4">
      <h3 class="font-semibold text-gray-900 text-sm">Valutazione Manager</h3>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Performance Score:</label>
          <select v-model.number="form.performanceScore" class="w-full px-3 py-2 border rounded-lg text-sm">
            <option :value="null">Seleziona...</option>
            <option :value="1">1 - Critico</option>
            <option :value="2">2 - Sottoperformant</option>
            <option :value="3">3 - Nella media</option>
            <option :value="4">4 - Buono</option>
            <option :value="5">5 - Eccellente</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Engagement Score:</label>
          <select v-model.number="form.engagementScore" class="w-full px-3 py-2 border rounded-lg text-sm">
            <option :value="null">Seleziona...</option>
            <option :value="1">1 - Molto basso</option>
            <option :value="2">2 - Basso</option>
            <option :value="3">3 - Nella media</option>
            <option :value="4">4 - Alto</option>
            <option :value="5">5 - Molto alto</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Note Colloquio:</label>
      <textarea
        v-model="form.noteColloquio"
        placeholder="Osservazioni generali sul colloquio, aree di miglioramento, punti di forza..."
        class="w-full px-3 py-2 border rounded-lg text-sm h-20"
      />
    </div>

    <!-- Next Review Date -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Prossimo Colloquio:</label>
      <input
        v-model="form.nextReviewDate"
        type="date"
        class="w-full px-3 py-2 border rounded-lg text-sm"
      />
      <p class="text-xs text-gray-500 mt-1">Default: oggi + 6 mesi</p>
    </div>

    <!-- Submit Buttons -->
    <div class="flex gap-3 pt-4 border-t">
      <button type="submit" class="btn btn-primary">Salva Colloquio P&C</button>
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">Annulla</button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import ScaleInput from '@/components/ui/ScaleInput.vue'

const props = defineProps({
  employeeName: String,
  employeeTeam: String,
  employeeId: Number,
  lastColloquioDate: String
})

const emit = defineEmits(['saved', 'cancel'])
const store = useHrStore()

// Initialize form with default data
const form = ref({
  date: new Date().toISOString().split('T')[0],
  esaur: null,
  carico: null,
  motiv: null,
  supp: null,
  equil: null,
  intent: null,
  performanceScore: null,
  engagementScore: null,
  noteColloquio: '',
  nextReviewDate: defaultNextReviewDate()
})

// Calculate days since last colloquio
const daysSinceLastColloquio = computed(() => {
  if (!props.lastColloquioDate) return null
  const last = new Date(props.lastColloquioDate)
  const today = new Date()
  return Math.floor((today - last) / 86400000)
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })
}

function defaultNextReviewDate() {
  const future = new Date()
  future.setMonth(future.getMonth() + 6)
  return future.toISOString().split('T')[0]
}

function save() {
  // Validate that at least one scale is filled
  if (!form.value.esaur && !form.value.carico && !form.value.motiv && !form.value.supp && !form.value.equil && !form.value.intent) {
    alert('Compila almeno una scala comportamentale')
    return
  }

  store.saveColloquioPC(props.employeeName, {
    date: form.value.date,
    esaur: form.value.esaur,
    carico: form.value.carico,
    motiv: form.value.motiv,
    supp: form.value.supp,
    equil: form.value.equil,
    intent: form.value.intent,
    performanceScore: form.value.performanceScore,
    engagementScore: form.value.engagementScore,
    noteColloquio: form.value.noteColloquio,
    nextReviewDate: form.value.nextReviewDate
  })

  emit('saved')
}
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-primary {
  @apply bg-emerald-600 text-white hover:bg-emerald-700;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}
</style>
