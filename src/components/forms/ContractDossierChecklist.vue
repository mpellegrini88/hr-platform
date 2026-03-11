<template>
  <form @submit.prevent="save" class="space-y-4">
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h4 class="font-semibold text-yellow-900 mb-2">Dossier Contratto Determinato</h4>
      <p class="text-sm text-yellow-800">Checklist dei documenti necessari per il rinnovo (30gg prima scadenza)</p>
    </div>

    <div class="space-y-3">
      <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
        <input v-model="form.verificaDocumenti" type="checkbox" class="w-4 h-4 rounded">
        <span class="text-sm font-medium text-gray-700">Documenti di identità aggiornati</span>
      </label>

      <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
        <input v-model="form.verificaStipendi" type="checkbox" class="w-4 h-4 rounded">
        <span class="text-sm font-medium text-gray-700">Stipendi pagati regolarmente</span>
      </label>

      <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
        <input v-model="form.verificaAssicurazione" type="checkbox" class="w-4 h-4 rounded">
        <span class="text-sm font-medium text-gray-700">Assicurazione confermata</span>
      </label>

      <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
        <input v-model="form.verificaAbsenze" type="checkbox" class="w-4 h-4 rounded">
        <span class="text-sm font-medium text-gray-700">Assenze registrate correttamente</span>
      </label>

      <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
        <input v-model="form.verificaDisciplinare" type="checkbox" class="w-4 h-4 rounded">
        <span class="text-sm font-medium text-gray-700">Nessun procedimento disciplinare pendente</span>
      </label>

      <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
        <input v-model="form.verificaPerformance" type="checkbox" class="w-4 h-4 rounded">
        <span class="text-sm font-medium text-gray-700">Valutazione performance completata</span>
      </label>

      <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
        <input v-model="form.verificaDichiarazioni" type="checkbox" class="w-4 h-4 rounded">
        <span class="text-sm font-medium text-gray-700">Dichiarazioni fiscali/previdenziali aggiornate</span>
      </label>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Note Dossier:</label>
      <textarea v-model="form.noteDossier" placeholder="Note sulla preparazione del dossier..."
        class="w-full px-3 py-2 border rounded-lg text-sm h-16"></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Data Scadenza Dossier:</label>
      <input v-model="form.scadenzaDossier" type="date" class="w-full px-3 py-2 border rounded-lg text-sm"></input>
    </div>

    <div class="flex gap-3 pt-4 border-t">
      <button type="submit" class="btn btn-primary">Salva Dossier</button>
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">Annulla</button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'

const props = defineProps({ employeeId: Number })
const emit = defineEmits(['saved', 'cancel'])
const store = useHrStore()

const form = ref({
  verificaDocumenti: false,
  verificaStipendi: false,
  verificaAssicurazione: false,
  verificaAbsenze: false,
  verificaDisciplinare: false,
  verificaPerformance: false,
  verificaDichiarazioni: false,
  noteDossier: '',
  scadenzaDossier: ''
})

function save() {
  const checklist = [
    form.value.verificaDocumenti,
    form.value.verificaStipendi,
    form.value.verificaAssicurazione,
    form.value.verificaAbsenze,
    form.value.verificaDisciplinare,
    form.value.verificaPerformance,
    form.value.verificaDichiarazioni
  ]
  const allComplete = checklist.every(v => v)

  store.updateContractRenewal(props.employeeId, {
    scadenzaDossierContratto: form.value.scadenzaDossier,
    statoDossierContratto: allComplete ? 'Fatto' : 'In Corso'
  })
  emit('saved')
}
</script>
