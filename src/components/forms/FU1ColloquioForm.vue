<template>
  <form @submit.prevent="save" class="space-y-4">
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 class="font-semibold text-blue-900 mb-2">Colloquio FU1 (30 giorni)</h4>
      <p class="text-sm text-blue-800">Valutazione di feedback dopo il primo mese di onboarding</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Benessere Generale (1-5):</label>
        <div class="flex gap-2">
          <button v-for="n in 5" :key="n" type="button" @click="form.benessere = n"
            :class="[n <= form.benessere ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border', 'px-3 py-2 rounded font-semibold']">
            {{ n }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Note Colloquio:</label>
        <textarea v-model="form.noteColloquio" placeholder="Note del colloquio FU1..."
          class="w-full px-3 py-2 border rounded-lg text-sm h-20"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Esito:</label>
        <select v-model="form.esito" class="w-full px-3 py-2 border rounded-lg text-sm">
          <option value="">-- Selezionare --</option>
          <option value="Positivo">Positivo</option>
          <option value="Neutro">Neutro</option>
          <option value="Critico">Critico</option>
        </select>
      </div>
    </div>

    <div class="flex gap-3 pt-4 border-t">
      <button type="submit" class="btn btn-primary">Salva FU1</button>
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
  benessere: 0,
  noteColloquio: '',
  esito: ''
})

function save() {
  const emp = store.employees.find(e => e.nome === props.employeeName)
  if (emp) {
    store.updateEmployee(emp.id, { statoFU1: 'Fatto' })
    store.saveColloquio(props.employeeName, form.value)
  }
  emit('saved')
}
</script>
