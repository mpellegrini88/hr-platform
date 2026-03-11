<template>
  <div v-for="team in teams" :key="team.team" class="mb-4">
    <div class="flex items-center justify-between mb-1.5">
      <span class="text-sm font-medium text-gray-700">{{ team.team }}</span>
      <span class="text-xs text-gray-400">{{ team.n }} dipendenti</span>
    </div>
    <div class="flex gap-0.5 h-8 rounded-lg overflow-hidden border border-gray-100">
      <div
        v-if="pct(team.engaged) > 0"
        :style="{ width: pct(team.engaged) + '%' }"
        class="bg-green-500 hover:bg-green-600 transition cursor-pointer flex items-center justify-center text-xs font-bold text-white opacity-90"
        :title="`Engaged: ${team.engaged}`"
      >
        {{ team.engaged > 0 ? team.engaged : '' }}
      </div>
      <div
        v-if="pct(team.atRisk) > 0"
        :style="{ width: pct(team.atRisk) + '%' }"
        class="bg-orange-500 hover:bg-orange-600 transition cursor-pointer flex items-center justify-center text-xs font-bold text-white opacity-90"
        :title="`At Risk: ${team.atRisk}`"
      >
        {{ team.atRisk > 0 && pct(team.atRisk) > 15 ? team.atRisk : '' }}
      </div>
      <div
        v-if="pct(team.burnedOut) > 0"
        :style="{ width: pct(team.burnedOut) + '%' }"
        class="bg-red-500 hover:bg-red-600 transition cursor-pointer flex items-center justify-center text-xs font-bold text-white opacity-90"
        :title="`Burned Out: ${team.burnedOut}`"
      >
        {{ team.burnedOut > 0 && pct(team.burnedOut) > 15 ? team.burnedOut : '' }}
      </div>
      <div
        v-if="pct(team.disengaged) > 0"
        :style="{ width: pct(team.disengaged) + '%' }"
        class="bg-blue-500 hover:bg-blue-600 transition cursor-pointer flex items-center justify-center text-xs font-bold text-white opacity-90"
        :title="`Disengaged: ${team.disengaged}`"
      >
        {{ team.disengaged > 0 && pct(team.disengaged) > 15 ? team.disengaged : '' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'

const store = useHrStore()

const teams = computed(() => store.pcStats)

function pct(n) {
  const total = teams.value[0]?.n || 1
  return (n / total) * 100
}
</script>
