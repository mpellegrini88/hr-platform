<template>
  <form @submit.prevent="save" class="space-y-4">
    <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <h4 class="font-semibold text-orange-900 mb-2">Rinnovo Contratto Determinato</h4>
      <p class="text-sm text-orange-800">Registrare la scadenza del rinnovo e lo stato della pratica</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Data Scadenza Rinnovo:</label>
        <input v-model="form.scadenzaRinnovo" type="date" class="w-full px-3 py-2 border rounded-lg text-sm"></input>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Stato Rinnovo:</label>
        <select v-model="form.statoRinnovo" class="w-full px-3 py-2 border rounded-lg text-sm">
          <option value="Da Fare">Da Fare</option>
          <option value="In Corso">In Corso</option>
          <option value="Fatto">Fatto</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Note Rinnovo:</label>
        <textarea v-model="form.noteRinnovo" placeholder="Note sulla pratica di rinnovo..."
          class="w-full px-3 py-2 border rounded-lg text-sm h-20"></textarea>
      </div>
    </div>

    <div class="flex gap-3 pt-4 border-t">
      <button type="submit" class="btn btn-primary">Salva Rinnovo</button>
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">Annulla</button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'

const props = defineProps({ 
  employeeId: Number,
  initialData: {
    type: Object,
    default: () => ({ scadenzaRinnovo: '', statoRinnovo: 'Da Fare', noteRinnovo: '' })
  }
})
const emit = defineEmits(['saved', 'cancel'])
const store = useHrStore()

const form = ref({
  scadenzaRinnovo: props.initialData?.scadenzaRinnovo || '',
  statoRinnovo: props.initialData?.statoRinnovo || 'Da Fare',
  noteRinnovo: props.initialData?.noteRinnovo || ''
})

// Watch per aggiornare il form se initialData cambia
watch(() => props.initialData, (newData) => {
  if (newData) {
    form.value = {
      scadenzaRinnovo: newData.scadenzaRinnovo || '',
      statoRinnovo: newData.statoRinnovo || 'Da Fare',
      noteRinnovo: newData.noteRinnovo || ''
    }
  }
}, { deep: true })

function save() {
  store.updateContractRenewal(props.employeeId, {
    scadenzaRinnovo: form.value.scadenzaRinnovo,
    statoRinnovo: form.value.statoRinnovo
  })
  emit('saved')
}
</script>
