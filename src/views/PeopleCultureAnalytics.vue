<template>
  <div class="p-6 space-y-6">
    <!-- EMPTY STATE quando no P&C data -->
    <div v-if="store.colloquiPC.length === 0" class="card p-8 border-2 border-dashed border-gray-300">
      <div class="text-center">
        <div class="text-4xl mb-3">📋</div>
        <h3 class="font-semibold text-gray-900 mb-2">Nessun colloquio P&C compilato</h3>
        <p class="text-sm text-gray-600">
          Non ci sono ancora dati di People & Culture. I colloqui, grafici e analisi compariranno qui quando verranno compilati i primi colloqui P&C.
        </p>
        <p class="text-xs text-gray-400 mt-3">
          Fase: Fresh Start 2026 - Avvia compilazione colloqui per vedere statistiche
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useHrStore } from '@/stores/hrStore'

const store = useHrStore()
</script>
