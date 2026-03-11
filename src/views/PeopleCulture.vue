<template>
  <div class="p-6 space-y-5">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <input v-model="search" class="form-input max-w-xs" placeholder="🔍 Cerca dipendente...">
      <select v-model="filterTeam" class="form-select w-44">
        <option value="">Tutti i team</option>
        <option v-for="t in store.teams" :key="t">{{ t }}</option>
      </select>
      <select v-model="filterRischio" class="form-select w-40">
        <option value="">Tutti i rischi</option>
        <option value="alto">Burnout alto</option>
        <option value="medio">Burnout medio</option>
        <option value="basso">Burnout basso</option>
      </select>
      <div class="ml-auto text-xs text-gray-500 space-x-3">
        <span>↑ = peggio per esaur/carico</span>
        <span>↑ = meglio per motiv/supp/equil/intent</span>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="tbl">
          <thead>
            <tr>
              <th>Dipendente</th>
              <th>Team</th>
              <th class="text-red-500">😓 Esaur. <span class="text-gray-300 font-normal">(MBI)</span></th>
              <th class="text-orange-500">⚡ Carico <span class="text-gray-300 font-normal">(CBI)</span></th>
              <th class="text-emerald-500">💪 Motiv. <span class="text-gray-300 font-normal">(JD-R)</span></th>
              <th class="text-blue-500">🤝 Supp. <span class="text-gray-300 font-normal">(JD-R)</span></th>
              <th class="text-purple-500">⚖️ Equil. <span class="text-gray-300 font-normal">(WHO-5)</span></th>
              <th class="text-indigo-500">🏠 Intent. <span class="text-gray-300 font-normal">(Mobley)</span></th>
              <th>Score</th>
              <th>Burnout</th>
              <th>Retention</th>
              <th>Ultimo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in filtered" :key="e.id" class="tbl-clickable" @click="openModal(e)">
              <td>
                <div class="font-medium text-gray-900 text-sm">{{ e.nome }}</div>
                <div class="text-xs text-gray-400">{{ e.citta }}</div>
              </td>
              <td><span class="badge badge-gray text-xs">{{ e.team }}</span></td>
              <td><ScoreDot :value="e.lastC?.esaur" :inverted="true" /></td>
              <td><ScoreDot :value="e.lastC?.carico" :inverted="true" /></td>
              <td><ScoreDot :value="e.lastC?.motiv" /></td>
              <td><ScoreDot :value="e.lastC?.supp" /></td>
              <td><ScoreDot :value="e.lastC?.equil" /></td>
              <td><ScoreDot :value="e.lastC?.intent" /></td>
              <td>
                <span v-if="e.scoreGlobale != null" class="font-bold text-sm" :style="{ color: scoreColor(e.scoreGlobale, true) }">{{ e.scoreGlobale }}</span>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>
              <td>
                <span v-if="e.burnoutRisk" :class="['badge', burnoutBadge(e.burnoutRisk)]">{{ e.burnoutRisk }}</span>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>
              <td>
                <span v-if="e.rischioRitenzione" :class="['badge', burnoutBadge(e.rischioRitenzione)]">{{ e.rischioRitenzione }}</span>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>
              <td class="text-xs text-gray-500">{{ lastDate(e) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">{{ filtered.length }} dipendenti · Clicca per aprire il colloquio</div>
    </div>

    <!-- MODAL COLLOQUIO -->
    <Modal :open="modal.open" :title="'Colloqui P&C — ' + (modal.emp?.nome || '')" width="900px" @close="modal.open = false">
      <div v-if="modal.emp" class="space-y-5">
        <!-- Score summary -->
        <div class="grid grid-cols-4 gap-3">
          <InfoBlock label="Team" :value="modal.emp.team" />
          <InfoBlock label="Città" :value="modal.emp.citta" />
          <InfoBlock label="Contratto" :value="modal.emp.tipoContratto" />
          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <div class="text-xs text-gray-400 mb-1">Score globale</div>
            <div class="text-3xl font-bold" :style="{ color: scoreColor(modal.emp.scoreGlobale, true) }">{{ modal.emp.scoreGlobale ?? '—' }}</div>
            <div class="flex gap-1 justify-center mt-1 flex-wrap">
              <span v-if="modal.emp.burnoutRisk" :class="['badge text-xs', burnoutBadge(modal.emp.burnoutRisk)]">B: {{ modal.emp.burnoutRisk }}</span>
              <span v-if="modal.emp.rischioRitenzione" :class="['badge text-xs', burnoutBadge(modal.emp.rischioRitenzione)]">R: {{ modal.emp.rischioRitenzione }}</span>
            </div>
          </div>
        </div>

        <!-- Ciclo tabs -->
        <div class="border-b border-gray-100">
          <div class="flex gap-1">
            <button v-for="tab in ['C1','C2','C3']" :key="tab" @click="modal.tab = tab"
              :class="['px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                modal.tab===tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
              {{ tab === 'C1' ? '1° Colloquio' : tab === 'C2' ? '2° Colloquio' : '3° Colloquio' }}
              <span v-if="hasData(tab)" class="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block align-middle"></span>
            </button>
          </div>
        </div>

        <!-- Ciclo form -->
        <div class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Data colloquio</label>
              <input class="form-input" type="date" v-model="currentCycle.data">
            </div>
            <div>
              <label class="form-label">Esito</label>
              <select class="form-select" v-model="currentCycle.esito">
                <option>Positivo</option><option>Da Monitorare</option><option>Critico</option><option>Urgente</option>
              </select>
            </div>
          </div>

          <!-- Le 6 scale scientifiche -->
          <div class="bg-blue-50 rounded-xl p-5 border border-blue-100 space-y-5">
            <div class="text-xs font-bold text-blue-600 uppercase tracking-widest">Scale Behavioral Wellness validate</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ScaleInput
                label="😓 Esaurimento emotivo (MBI-GS, Maslach)"
                v-model="currentCycle.esaur"
                :inverted="true"
                hint="↑ = peggio"
                minLabel="1 = mai"
                maxLabel="5 = ogni giorno"
              />
              <ScaleInput
                label="⚡ Carico di lavoro (CBI, Copenhagen)"
                v-model="currentCycle.carico"
                :inverted="true"
                hint="↑ = peggio"
                minLabel="1 = basso"
                maxLabel="5 = insostenibile"
              />
              <ScaleInput
                label="💪 Motivazione & Autonomia (JD-R, Bakker)"
                v-model="currentCycle.motiv"
                hint="↑ = meglio"
                minLabel="1 = molto bassa"
                maxLabel="5 = molto alta"
              />
              <ScaleInput
                label="🤝 Supporto & Chiarezza (JD-R, Bakker)"
                v-model="currentCycle.supp"
                hint="↑ = meglio"
                minLabel="1 = assente"
                maxLabel="5 = eccellente"
              />
              <ScaleInput
                label="⚖️ Equilibrio vita-lavoro (WHO-5)"
                v-model="currentCycle.equil"
                hint="↑ = meglio"
                minLabel="1 = mai"
                maxLabel="5 = sempre"
              />
              <ScaleInput
                label="🏠 Intenzione di restare (Mobley)"
                v-model="currentCycle.intent"
                hint="↑ = meglio"
                minLabel="1 = molto bassa"
                maxLabel="5 = molto alta"
              />
            </div>
          </div>

          <!-- Trend se c2 disponibile -->
          <div v-if="modal.tab !== 'C1' && hasPrevData" class="grid grid-cols-6 gap-2 bg-gray-50 rounded-xl p-4">
            <div v-for="dim in dims" :key="dim.key" class="text-center">
              <div class="text-xs text-gray-400 mb-1">{{ dim.label }}</div>
              <TrendArrow :prev="prevCycle[dim.key]" :curr="currentCycle[dim.key]" :inverted="dim.inverted" />
            </div>
          </div>

          <div>
            <label class="form-label">Note colloquio</label>
            <textarea class="form-textarea" rows="3" v-model="currentCycle.note" placeholder="Osservazioni, azioni concordate..."></textarea>
          </div>
        </div>

        <!-- Storico cicli -->
        <div v-if="hasSomeData" class="bg-gray-50 rounded-xl p-4">
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Storico score</div>
          <div class="overflow-x-auto">
            <table class="tbl text-xs">
              <thead><tr>
                <th>Ciclo</th><th>Data</th>
                <th class="text-red-500">Esaur.</th><th class="text-orange-500">Carico</th>
                <th class="text-emerald-500">Motiv.</th><th class="text-blue-500">Supp.</th>
                <th class="text-purple-500">Equil.</th><th class="text-indigo-500">Intent.</th>
                <th>Esito</th>
              </tr></thead>
              <tbody>
                <tr v-for="row in storicoRows" :key="row.label">
                  <td class="font-semibold">{{ row.label }}</td>
                  <td>{{ row.data || '—' }}</td>
                  <td><ScoreDot :value="row.esaur" :inverted="true" /></td>
                  <td><ScoreDot :value="row.carico" :inverted="true" /></td>
                  <td><ScoreDot :value="row.motiv" /></td>
                  <td><ScoreDot :value="row.supp" /></td>
                  <td><ScoreDot :value="row.equil" /></td>
                  <td><ScoreDot :value="row.intent" /></td>
                  <td><span v-if="row.esito" :class="['badge text-xs', esitoCollClass(row.esito)]">{{ row.esito }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="modal.emp._coll?.note_trasversali" class="mt-2 text-xs text-gray-500">Note trasversali: {{ modal.emp._coll.note_trasversali }}</div>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-secondary" @click="modal.open = false">Chiudi</button>
        <button class="btn btn-primary" @click="save">💾 Salva colloquio</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import Modal from '@/components/ui/Modal.vue'
import Section from '@/components/ui/Section.vue'
import ScaleInput from '@/components/ui/ScaleInput.vue'
import ScoreDot from '@/components/ui/ScoreDot.vue'
import InfoBlock from '@/components/ui/InfoBlock.vue'
import TrendArrow from '@/components/ui/TrendArrow.vue'

const store = useHrStore()
const { fmtDateShort, burnoutBadge, scoreColor, esitoCollClass } = useHelpers()

const search = ref(''), filterTeam = ref(''), filterRischio = ref('')

const filtered = computed(() => store.enrichedEmployees.filter(e => {
  const s = search.value.toLowerCase()
  return (!s || e.nome.toLowerCase().includes(s) || (e.team||'').toLowerCase().includes(s))
    && (!filterTeam.value || e.team === filterTeam.value)
    && (!filterRischio.value || e.burnoutRisk === filterRischio.value)
}))

const modal = reactive({ open: false, emp: null, tab: 'C1' })
const currentCycle = reactive({ data: '', esaur: null, carico: null, motiv: null, supp: null, equil: null, intent: null, esito: '', note: '' })

const dims = [
  { key: 'esaur', label: 'Esaur.', inverted: true },
  { key: 'carico', label: 'Carico', inverted: true },
  { key: 'motiv', label: 'Motiv.', inverted: false },
  { key: 'supp', label: 'Supp.', inverted: false },
  { key: 'equil', label: 'Equil.', inverted: false },
  { key: 'intent', label: 'Intent.', inverted: false },
]

function cyclePrefix(tab) { return tab.toLowerCase() + '_' }

function loadCycle(tab) {
  const c = modal.emp?._coll || {}
  const p = cyclePrefix(tab)
  Object.assign(currentCycle, { data: c[p+'data']||'', esaur: c[p+'esaur']||null, carico: c[p+'carico']||null, motiv: c[p+'motiv']||null, supp: c[p+'supp']||null, equil: c[p+'equil']||null, intent: c[p+'intent']||null, esito: c[p+'esito']||'', note: c[p+'note']||'' })
}

watch(() => modal.tab, loadCycle)

function hasData(tab) {
  const c = modal.emp?._coll || {}
  return !!c[cyclePrefix(tab)+'esaur']
}

const hasSomeData = computed(() => ['C1','C2','C3'].some(t => hasData(t)))

const hasPrevData = computed(() => {
  if (modal.tab === 'C2') return hasData('C1')
  if (modal.tab === 'C3') return hasData('C2')
  return false
})

const prevCycle = computed(() => {
  const c = modal.emp?._coll || {}
  const p = modal.tab === 'C2' ? 'c1_' : 'c2_'
  return { esaur: c[p+'esaur'], carico: c[p+'carico'], motiv: c[p+'motiv'], supp: c[p+'supp'], equil: c[p+'equil'], intent: c[p+'intent'] }
})

const storicoRows = computed(() => {
  const c = modal.emp?._coll || {}
  return ['C1','C2','C3'].map(t => {
    const p = cyclePrefix(t)
    return { label: t, data: c[p+'data'], esaur: c[p+'esaur'], carico: c[p+'carico'], motiv: c[p+'motiv'], supp: c[p+'supp'], equil: c[p+'equil'], intent: c[p+'intent'], esito: c[p+'esito'] }
  }).filter(r => r.esaur || r.data)
})

function openModal(e) {
  modal.emp = e; modal.tab = 'C1'; modal.open = true
  loadCycle('C1')
}

function save() {
  const p = cyclePrefix(modal.tab)
  const update = {}
  update[p+'data']  = currentCycle.data
  update[p+'esaur'] = currentCycle.esaur
  update[p+'carico']= currentCycle.carico
  update[p+'motiv'] = currentCycle.motiv
  update[p+'supp']  = currentCycle.supp
  update[p+'equil'] = currentCycle.equil
  update[p+'intent']= currentCycle.intent
  update[p+'esito'] = currentCycle.esito
  update[p+'note']  = currentCycle.note
  store.saveColloquio(modal.emp.nome, update)
  modal.open = false
}

function lastDate(e) {
  const c = e._coll || {}
  return c.c2_data ? fmtDateShort(c.c2_data) : c.c1_data ? fmtDateShort(c.c1_data) : '—'
}
</script>
