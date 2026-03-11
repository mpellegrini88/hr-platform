<template>
  <Modal :open="open" title="Aggiungi Colloquio P&C" width="700px" @close="$emit('close')">
    <PCColloquioForm
      :employee-name="employeeName"
      :employee-team="employeeTeam"
      :employee-id="employeeId"
      :last-colloquio-date="lastColloquioDate"
      @saved="handleSaved"
      @cancel="$emit('close')"
    />
  </Modal>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import PCColloquioForm from '@/components/forms/PCColloquioForm.vue'

defineProps({
  open: Boolean,
  employeeId: Number,
  employeeName: String,
  employeeTeam: String,
  lastColloquioDate: String
})

const emit = defineEmits(['close', 'saved'])

function handleSaved() {
  emit('saved')
  emit('close')
}
</script>
