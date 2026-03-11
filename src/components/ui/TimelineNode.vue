<template>
  <div class="flex flex-col items-center gap-2 w-32 text-center">
    <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-base ring-4 ring-white shadow-sm z-10 relative', bgClass]">
      {{ icon }}
    </div>
    <div>
      <div class="text-xs font-semibold text-gray-700">{{ label }}</div>
      <div class="text-xs text-gray-400 leading-tight mt-0.5">{{ desc }}</div>
      <div v-if="date" class="text-xs font-mono mt-1" :class="urgent ? 'text-red-600 font-bold' : 'text-gray-500'">{{ fmtDateShort(date) }}</div>
      <span v-if="stato" :class="['badge mt-1 text-xs', statoClass]">{{ stato }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ icon:String, label:String, desc:String, date:String, stato:String, done:Boolean, failed:Boolean, urgent:Boolean, color:{type:String,default:'gray'} })
const colorMap = { emerald:'bg-emerald-100 text-emerald-600', blue:'bg-blue-100 text-blue-600', purple:'bg-purple-100 text-purple-600', indigo:'bg-indigo-100 text-indigo-600', gray:'bg-gray-100 text-gray-500' }
const bgClass = computed(() => {
  if (props.failed) return 'bg-red-100 text-red-600'
  if (props.done) return 'bg-emerald-100 text-emerald-600'
  if (props.urgent) return 'bg-red-50 text-red-500 ring-red-200'
  return colorMap[props.color] || colorMap.gray
})
const statoClass = computed(() => {
  if (props.stato === 'Fatto' || props.stato === 'Superato') return 'badge-green'
  if (props.stato === 'Non Superato') return 'badge-red'
  if (props.stato === 'In Corso') return 'badge-blue'
  return 'badge-gray'
})
function fmtDateShort(v) {
  if (!v) return ''
  const d = new Date(v)
  return isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit', year:'2-digit' })
}
</script>
