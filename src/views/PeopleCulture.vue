<template>
  <div class="p-6 space-y-5">
    <!-- EMPTY STATE quando no P&C data -->
    <div v-if="store.colloquiPC.length === 0" class="card p-8 border-2 border-dashed border-gray-300">
      <div class="text-center">
        <div class="text-4xl mb-3">📋</div>
        <h3 class="font-semibold text-gray-900 mb-2">Nessun colloquio P&C compilato</h3>
        <p class="text-sm text-gray-600">
          Non ci sono ancora colloqui People & Culture. I dati e le analisi compariranno qui quando verranno compilati i primi colloqui.
        </p>
        <p class="text-xs text-gray-400 mt-3">
          Fase: Fresh Start 2026 - Avvia compilazione colloqui P&C per iniziare l'analisi
        </p>
      </div>
    </div>

    <!-- COLLOQUI when data exists -->
    <div v-else class="space-y-5">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="search" class="form-input max-w-xs" placeholder="🔍 Cerca dipendente...">
        <select v-model="filterTeam" class="form-select w-44">
          <option value="">Tutti i team</option>
          <option v-for="t in store.teams" :key="t">{{ t }}</option>
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
                <th>Ultimo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in filtered" :key="e.id" class="tbl-clickable" @click="openModal(e)">
                <td>
                  <div class="font-medium text-gray-900 text-sm">{{ e.nome }} {{ e.cognome }}</div>
                  <div class="text-xs text-gray-400">{{ e.citta }}</div>
                </td>
                <td><span class="badge badge-gray text-xs">{{ e.team }}</span></td>
                <td><ScoreDot :value="pcColl(e.id)?.esaur" :inverted="true" /></td>
                <td><ScoreDot :value="pcColl(e.id)?.carico" :inverted="true" /></td>
                <td><ScoreDot :value="pcColl(e.id)?.motiv" /></td>
                <td><ScoreDot :value="pcColl(e.id)?.supp" /></td>
                <td><ScoreDot :value="pcColl(e.id)?.equil" /></td>
                <td><ScoreDot :value="pcColl(e.id)?.intent" /></td>
                <td>
                  <span v-if="pcColl(e.id)?.engagementScore != null" class="font-bold text-sm">{{ pcColl(e.id).engagementScore }}</span>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </td>
                <td class="text-xs text-gray-500">{{ pcCollDate(e.id) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">{{ filtered.length }} dipendenti · Clicca per aprire il colloquio</div>
      </div>
    </div>

    <!-- MODAL COLLOQUIO P&C -->
    <Modal :open="modal.open" :title="'Colloquio P&C — ' + (modal.emp?.nome || '') + ' ' + (modal.emp?.cognome || '')" width="900px" @close="modal.open = false">
      <div v-if="modal.emp" class="space-y-5">
        <!-- Score summary -->
        <div class="grid grid-cols-4 gap-3">
          <InfoBlock label="Team" :value="modal.emp.team" />
          <InfoBlock label="Città" :value="modal.emp.citta" />
          <InfoBlock label="Contratto" :value="modal.emp.tipoContratto" />
          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <div class="text-xs text-gray-400 mb-1">Score globale</div>
            <div class="text-3xl font-bold">{{ pcColl(modal.emp.id)?.engagementScore ?? '—' }}</div>
          </div>
        </div>

        <!-- Form -->
        <div class="bg-blue-50 rounded-xl p-5 border border-blue-100 space-y-5">
          <div class="text-xs font-bold text-blue-600 uppercase tracking-widest">Colloquio P&C</div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Data colloquio</label>
              <input class="form-input" type="date" v-model="pcForm.data">
            </div>
            <div>
              <label class="form-label">Esito</label>
              <select class="form-select" v-model="pcForm.esito">
                <option>Positivo</option><option>Da Monitorare</option><option>Critico</option><option>Urgente</option>
              </select>
            </div>
          </div>

          <!-- Le 6 scale scientifiche -->
          <div class="space-y-5">
            <ScaleInput
              label="😓 Esaurimento emotivo (MBI-GS, Maslach)"
              v-model="pcForm.esaur"
              :inverted="true"
              hint="↑ = peggio"
              minLabel="1 = mai"
              maxLabel="5 = ogni giorno"
            />
            <ScaleInput
              label="⚡ Carico di lavoro (CBI, Copenhagen)"
              v-model="pcForm.carico"
              :inverted="true"
              hint="↑ = peggio"
              minLabel="1 = basso"
              maxLabel="5 = insostenibile"
            />
            <ScaleInput
              label="💪 Motivazione & Autonomia (JD-R, Bakker)"
              v-model="pcForm.motiv"
              hint="↑ = meglio"
              minLabel="1 = molto bassa"
              maxLabel="5 = molto alta"
            />
            <ScaleInput
              label="🤝 Supporto & Chiarezza (JD-R, Bakker)"
              v-model="pcForm.supp"
              hint="↑ = meglio"
              minLabel="1 = assente"
              maxLabel="5 = eccellente"
            />
            <ScaleInput
              label="⚖️ Equilibrio vita-lavoro (WHO-5)"
              v-model="pcForm.equil"
              hint="↑ = meglio"
              minLabel="1 = mai"
              maxLabel="5 = sempre"
            />
            <ScaleInput
              label="🏠 Intenzione di restare (Mobley)"
              v-model="pcForm.intent"
              hint="↑ = meglio"
              minLabel="1 = molto bassa"
              maxLabel="5 = molto alta"
            />
          </div>

          <div>
            <label class="form-label">Note colloquio</label>
            <textarea class="form-textarea" rows="3" v-model="pcForm.note" placeholder="Osservazioni, azioni concordate..."></textarea>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-secondary" @click="modal.open = false">Chiudi</button>
        <button class="btn btn-primary" @click="savePCColloquio">💾 Salva colloquio</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import Modal from '@/components/ui/Modal.vue'
import ScaleInput from '@/components/ui/ScaleInput.vue'
import ScoreDot from '@/components/ui/ScoreDot.vue'
import InfoBlock from '@/components/ui/InfoBlock.vue'

const store = useHrStore()
const { fmtDateShort } = useHelpers()

const search = ref(''), filterTeam = ref('')

const pcCollMap = computed(() => {
  const map = {}
  store.colloquiPC.forEach(c => {
    map[c.employeeId] = c
  })
  return map
})

const filtered = computed(() => store.enrichedEmployees.filter(e => {
  const s = search.value.toLowerCase()
  const hasPCData = pcCollMap.value[e.id]
  return hasPCData && (!s || e.nome.toLowerCase().includes(s) || (e.team||'').toLowerCase().includes(s))
    && (!filterTeam.value || e.team === filterTeam.value)
}))

const pcColl = (empId) => pcCollMap.value[empId]
const pcCollDate = (empId) => pcCollMap.value[empId]?.date ? fmtDateShort(pcCollMap.value[empId].date) : '—'

const modal = reactive({ open: false, emp: null })
const pcForm = reactive({ data: '', esaur: null, carico: null, motiv: null, supp: null, equil: null, intent: null, esito: '', note: '' })

function openModal(e) {
  modal.emp = e
  const coll = pcColl(e.id)
  if (coll) {
    pcForm.data = coll.date || ''
    pcForm.esaur = coll.esaur || null
    pcForm.carico = coll.carico || null
    pcForm.motiv = coll.motiv || null
    pcForm.supp = coll.supp || null
    pcForm.equil = coll.equil || null
    pcForm.intent = coll.intent || null
    pcForm.esito = coll.esito || ''
    pcForm.note = coll.note || ''
  } else {
    pcForm.data = ''
    pcForm.esaur = null
    pcForm.carico = null
    pcForm.motiv = null
    pcForm.supp = null
    pcForm.equil = null
    pcForm.intent = null
    pcForm.esito = ''
    pcForm.note = ''
  }
  modal.open = true
}

function savePCColloquio() {
  if (!modal.emp) return
  const update = {
    employeeId: modal.emp.id,
    date: pcForm.data,
    esaur: pcForm.esaur,
    carico: pcForm.carico,
    motiv: pcForm.motiv,
    supp: pcForm.supp,
    equil: pcForm.equil,
    intent: pcForm.intent,
    esito: pcForm.esito,
    note: pcForm.note
  }
  store.saveColloquioPC(modal.emp.id, update)
  modal.open = false
}
</script>
