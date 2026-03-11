<template>
  <div class="space-y-1">
    <div class="flex items-center justify-between">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ label }}</span>
      <span class="text-xs text-gray-400">{{ hint }}</span>
    </div>
    <div class="flex items-center gap-1.5">
      <button v-for="n in 5" :key="n" type="button"
        @click="emit('update:modelValue', n)"
        :class="[
          'scale-btn',
          modelValue === n ? activeClass(n) : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
        ]">
        {{ n }}
      </button>
      <span class="ml-2 text-xs text-gray-400">{{ levelLabel }}</span>
      <button v-if="modelValue" type="button" @click="emit('update:modelValue', null)" class="ml-1 text-xs text-gray-300 hover:text-gray-500">✕</button>
    </div>
    <div class="flex justify-between text-xs text-gray-300 px-0.5">
      <span>{{ minLabel }}</span>
      <span>{{ maxLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: Number,
  label: String,
  hint: { type: String, default: '' },
  minLabel: { type: String, default: '1 = min' },
  maxLabel: { type: String, default: '5 = max' },
  inverted: { type: Boolean, default: false }, // inverted=true means high is bad (burnout dims)
})
const emit = defineEmits(['update:modelValue'])

const LEVEL_LABELS_NORMAL   = ['', 'Molto bassa', 'Bassa', 'Nella media', 'Alta', 'Molto alta']
const LEVEL_LABELS_INVERTED = ['', 'Mai', 'Raramente', 'A volte', 'Spesso', 'Sempre']

const levelLabel = computed(() => {
  if (!props.modelValue) return ''
  return props.inverted ? LEVEL_LABELS_INVERTED[props.modelValue] : LEVEL_LABELS_NORMAL[props.modelValue]
})

function activeClass(n) {
  if (props.inverted) {
    // High = bad (red)
    if (n <= 2) return 'border-emerald-400 bg-emerald-50 text-emerald-700 scale-105'
    if (n === 3) return 'border-amber-400 bg-amber-50 text-amber-700 scale-105'
    return 'border-red-400 bg-red-50 text-red-700 scale-105'
  } else {
    // High = good (green)
    if (n >= 4) return 'border-emerald-400 bg-emerald-50 text-emerald-700 scale-105'
    if (n === 3) return 'border-amber-400 bg-amber-50 text-amber-700 scale-105'
    return 'border-red-400 bg-red-50 text-red-700 scale-105'
  }
}
</script>
