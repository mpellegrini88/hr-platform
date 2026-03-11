<template>
  <form @submit.prevent="save" class="space-y-4">
    <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <h4 class="font-semibold text-purple-900 mb-2">Sentiment Dipendente - Fine Prova</h4>
      <p class="text-sm text-purple-800">Valutazione del benessere e dell'esperienza onboarding da parte del dipendente</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Benessere Globale (1-5):</label>
        <div class="flex gap-2">
          <button v-for="n in 5" :key="n" type="button" @click="form.benessereGlobale = n"
            :class="[n <= form.benessereGlobale ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border', 'px-3 py-2 rounded font-semibold']">
            {{ n }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Efficacia Onboarding (1-5):</label>
        <div class="flex gap-2">
          <button v-for="n in 5" :key="n" type="button" @click="form.efficaciaOnboarding = n"
            :class="[n <= form.efficaciaOnboarding ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border', 'px-3 py-2 rounded font-semibold']">
            {{ n }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Note Generali:</label>
        <textarea v-model="form.noteDipendente" placeholder="Come ti sei sentito durante l'onboarding?"
          class="w-full px-3 py-2 border rounded-lg text-sm h-24"></textarea>
      </div>
    </div>

    <div class="flex gap-3 pt-4 border-t">
      <button type="submit" class="btn btn-primary">Salva Sentiment</button>
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">Annulla</button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'

const props = defineProps({ employeeName: String })
const emit = defineEmits(['saved', 'cancel'])
const store = useHrStore()

const form = ref({
  benessereGlobale: 0,
  efficaciaOnboarding: 0,
  noteDipendente: ''
})

function save() {
  const emp = store.employees.find(e => e.nome === props.employeeName)
  if (emp) {
    store.updateEmployee(emp.id, { statoFU2Dip: 'Fatto' })
  }
  emit('saved')
}
</script>
