<template>
  <div class="w-full h-96 relative bg-white rounded-xl border border-gray-100 p-4">
    <!-- SVG plotting -->
    <svg class="w-full h-full" viewBox="0 0 500 400" preserveAspectRatio="xMidYMid meet">
      <!-- Quadrant backgrounds -->
      <rect x="0" y="0" width="250" height="200" fill="#dcfce7" opacity="0.3" />
      <rect x="250" y="0" width="250" height="200" fill="#fecaca" opacity="0.3" />
      <rect x="0" y="200" width="250" height="200" fill="#dbeafe" opacity="0.3" />
      <rect x="250" y="200" width="250" height="200" fill="#fcd34d" opacity="0.3" />

      <!-- Grid lines (center) -->
      <line x1="250" y1="0" x2="250" y2="400" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="5,5" />
      <line x1="0" y1="200" x2="500" y2="200" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="5,5" />

      <!-- Axis labels -->
      <text x="485" y="395" class="text-xs fill-gray-400" text-anchor="end">Intenzione (Retention)</text>
      <text x="10" y="20" class="text-xs fill-gray-400">Esaurimento (Burnout)</text>

      <!-- Scale labels -->
      <text x="20" y="15" class="text-xs fill-gray-500">5</text>
      <text x="20" y="395" class="text-xs fill-gray-500">1</text>
      <text x="10" y="210" class="text-xs fill-gray-500">1</text>
      <text x="470" y="210" class="text-xs fill-gray-500">5</text>

      <!-- Quadrant overlay texts -->
      <text x="125" y="100" class="text-sm font-bold fill-green-700" text-anchor="middle" opacity="0.5">ENGAGED</text>
      <text x="375" y="100" class="text-sm font-bold fill-red-700" text-anchor="middle" opacity="0.5">AT RISK</text>
      <text x="125" y="320" class="text-sm font-bold fill-blue-700" text-anchor="middle" opacity="0.5">DISENGAGED</text>
      <text x="375" y="320" class="text-sm font-bold fill-amber-700" text-anchor="middle" opacity="0.5">BURNED OUT</text>

      <!-- Data points (dots) -->
      <circle
        v-for="emp in employees"
        :key="emp.id"
        :cx="mapX(emp.esaur)"
        :cy="mapY(emp.intent)"
        r="6"
        :fill="getQuadrantColor(emp)"
        opacity="0.8"
        class="cursor-pointer hover:opacity-100"
        @click="selectEmployee(emp)"
      />
    </svg>

    <!-- Legend -->
    <div class="absolute bottom-2 right-2 text-xs space-y-1">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-green-500"></div>
        <span>Engaged ({{ quadrants.engaged.length }})</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-500"></div>
        <span>Burned Out ({{ quadrants.burnedOut.length }})</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-amber-500"></div>
        <span>At Risk ({{ quadrants.atRisk.length }})</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
        <span>Disengaged ({{ quadrants.disengaged.length }})</span>
      </div>
    </div>

    <!-- Selected employee info -->
    <div v-if="selected" class="absolute top-2 left-2 bg-white border border-gray-200 rounded px-2 py-1 text-xs">
      <div class="font-semibold">{{ selected.nome }}</div>
      <div class="text-gray-500">{{ selected.team }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'

const props = defineProps({ filter: { type: String, default: '' } })
const emits = defineEmits(['select'])

const store = useHrStore()
const selected = ref(null)

const quadrants = computed(() => store.burnoutRetentionQuadrants)

const employees = computed(() => {
  const list = []
  quadrants.value.engaged.forEach(e => list.push(e))
  quadrants.value.atRisk.forEach(e => list.push(e))
  quadrants.value.burnedOut.forEach(e => list.push(e))
  quadrants.value.disengaged.forEach(e => list.push(e))
  return list.filter(e => !props.filter || e.team === props.filter)
})

function mapX(esaur) {
  // X-axis: intenzione (da store) → SVG (250 = center, 1=50, 5=450)
  return 50 + (esaur || 3) * 80
}

function mapY(intenzione) {
  // Y-axis: intenzione (da store) → SVG (200 = center, 1=350, 5=50)
  return 350 - (intenzione || 3) * 60
}

function getQuadrantColor(emp) {
  const esaur = emp.lastC?.esaur || 3
  const intent = emp.lastC?.intent || 3
  if (esaur <= 2.5 && intent >= 3.5) return '#22c55e' // Engaged - green
  if (esaur > 2.5 && intent >= 3.5) return '#f97316' // At Risk - orange
  if (esaur > 2.5 && intent < 3.5) return '#dc2626' // Burned Out - red
  return '#3b82f6' // Disengaged - blue
}

function selectEmployee(emp) {
  selected.value = emp
  emits('select', emp)
}
</script>
