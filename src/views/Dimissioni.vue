<template>
  <div class="p-6 space-y-5">
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex rounded-lg border border-gray-200 bg-white overflow-hidden text-sm">
        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value"
          :class="['px-4 py-2 font-medium transition-colors', activeTab===tab.value ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50']">
          {{ tab.label }}
        </button>
      </div>
      <input v-model="search" class="form-input max-w-xs" placeholder="🔍 Cerca...">
    </div>

    <!-- DIMISSIONI RECENTI -->
    <div v-if="activeTab === 'recenti'">
      <div v-if="recent.length === 0" class="card p-12 text-center text-gray-400">Nessuna dimissione registrata negli ultimi 12 mesi</div>
      <div v-else class="space-y-3">
        <div v-for="d in recent" :key="d.nome" class="card p-4 border-l-4 border-red-400">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-semibold text-gray-900">{{ d.nome }}</div>
              <div class="text-sm text-gray-600">{{ d.team }} | Assunto: {{ fmtDateShort(d.dataAssunzione) }} | Uscita: {{ fmtDateShort(d.dataUscita) }}</div>
              <div class="text-sm font-medium mt-2"><span class="badge badge-sm" :class="motivoBadge(d.motivoUscita)">{{ d.motivoUscita || '—' }}</span></div>
              <p v-if="d.noteUscita" class="text-xs text-gray-500 mt-2">{{ d.noteUscita }}</p>
            </div>
            <button @click="openDetail(d)" class="text-primary-600 hover:text-primary-700 text-sm font-medium">Dettagli →</button>
          </div>
        </div>
      </div>
    </div>

    <!-- STORICO PER ANNO -->
    <div v-if="activeTab === 'storico'">
      <div v-for="(group, year) in storicoByYear" :key="year">
        <div class="flex items-center gap-3 mb-3 mt-6 first:mt-0">
          <span class="text-sm font-bold text-gray-700">{{ year }}</span>
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-xs text-gray-400">{{ group.length }} uscite</span>
        </div>
        <div class="card overflow-hidden mb-4">
          <table class="tbl">
            <thead><tr>
              <th>Dipendente</th><th>Team</th><th>Data Uscita</th><th>Motivazione</th><th>Tempo Azienda</th>
            </tr></thead>
            <tbody>
              <tr v-for="d in group" :key="d.nome">
                <td class="font-medium">{{ d.nome }}</td>
                <td><span class="badge badge-gray">{{ d.team }}</span></td>
                <td class="text-sm">{{ fmtDateShort(d.dataUscita) }}</td>
                <td><span class="badge badge-sm" :class="motivoBadge(d.motivoUscita)">{{ d.motivoUscita || '—' }}</span></td>
                <td class="text-xs text-gray-500">{{ mesiAzienda(d.dataAssunzione, d.dataUscita) }} mesi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ANALISI -->
    <div v-if="activeTab === 'analisi'">
      <div class="grid grid-cols-12 gap-5">
        <!-- Uscite per motivo -->
        <div class="col-span-12 md:col-span-6 card p-5">
          <h3 class="font-semibold text-gray-900 mb-4">📊 Uscite per motivo</h3>
          <div class="space-y-3">
            <div v-for="(count, motivo) in motivoDistrib" :key="motivo">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-gray-600">{{ motivo || 'Non specificato' }}</span>
                <span class="text-sm font-bold">{{ count }}</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-primary-500" :style="{ width: (count / totDimissioni * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats uscite -->
        <div class="col-span-12 md:col-span-6 card p-5">
          <h3 class="font-semibold text-gray-900 mb-4">📈 Statistiche</h3>
          <div class="space-y-3">
            <div class="bg-gray-50 rounded-xl p-3">
              <div class="text-xs text-gray-500">Totale dimissioni</div>
              <div class="text-3xl font-bold text-gray-900">{{ totDimissioni }}</div>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <div class="text-xs text-gray-500">Ultime 12 mesi</div>
              <div class="text-3xl font-bold text-gray-900">{{ recent.length }}</div>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <div class="text-xs text-gray-500">Avg. permanenza</div>
              <div class="text-3xl font-bold text-gray-900">{{ avgMesi }} mesi</div>
            </div>
          </div>
        </div>

        <!-- Uscite per team -->
        <div class="col-span-12 card p-5">
          <h3 class="font-semibold text-gray-900 mb-4">👥 Uscite per team</h3>
          <div class="space-y-2">
            <div v-for="(count, team) in teamDistrib" :key="team" class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ team }}</span>
              <span class="badge badge-gray">{{ count }} uscite</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAIL MODAL -->
    <Modal :open="detail.open" :title="'Dimissione — ' + (detail.emp?.nome || '')" width="600px" @close="detail.open=false">
      <div v-if="detail.emp" class="space-y-4">
        <InfoBlock label="Team" :value="detail.emp.team" />
        <InfoBlock label="Data Assunzione" :value="fmtDate(detail.emp.dataAssunzione)" />
        <InfoBlock label="Data Uscita" :value="fmtDate(detail.emp.dataUscita)" />
        <div>
          <label class="form-label">Motivo uscita</label>
          <select class="form-select" v-model="detail.motivo">
            <option>Volontaria</option>
            <option>Licenziamento</option>
            <option>Fine Contratto Determinato</option>
            <option>Promozione/Trasferimento</option>
            <option>Altre circostanze</option>
          </select>
        </div>
        <div>
          <label class="form-label">Note</label>
          <textarea class="form-textarea" rows="3" v-model="detail.note" placeholder="Circostanze, feedback..."></textarea>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="detail.open=false">Chiudi</button>
        <button class="btn btn-primary" @click="saveDetail">💾 Salva</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import Modal from '@/components/ui/Modal.vue'
import InfoBlock from '@/components/ui/InfoBlock.vue'

const store = useHrStore()
const { fmtDate, fmtDateShort } = useHelpers()

const activeTab = ref('recenti')
const search = ref('')

const tabs = [
  { value: 'recenti', label: '📊 Ultimi 12 mesi' },
  { value: 'storico', label: '📚 Storico' },
  { value: 'analisi', label: '📈 Analisi' },
]

const today = new Date()
const year12mo = new Date(today.getTime() - 12 * 30 * 24 * 60 * 60 * 1000)

const recent = computed(() => {
  return store.dimissioni.filter(d => {
    const dataUscita = new Date(d.dataUscita)
    return dataUscita >= year12mo && (!search.value || d.nome.toLowerCase().includes(search.value.toLowerCase()))
  }).sort((a, b) => new Date(b.dataUscita) - new Date(a.dataUscita))
})

const storico = computed(() => {
  const map = {}
  store.dimissioni.forEach(d => {
    const y = d.dataUscita.slice(0, 4)
    if (!map[y]) map[y] = []
    map[y].push(d)
  })
  return Object.fromEntries(Object.entries(map).sort((a, b) => b[0] > a[0] ? 1 : -1))
})

const storicoByYear = computed(() => storico.value)

const totDimissioni = computed(() => store.dimissioni.length)

const motivoDistrib = computed(() => {
  const map = {}
  store.dimissioni.forEach(d => {
    const m = d.motivoUscita || 'Non specificato'
    map[m] = (map[m] || 0) + 1
  })
  return map
})

const teamDistrib = computed(() => {
  const map = {}
  store.dimissioni.forEach(d => {
    map[d.team] = (map[d.team] || 0) + 1
  })
  return map
})

const avgMesi = computed(() => {
  if (store.dimissioni.length === 0) return 0
  const tot = store.dimissioni.reduce((acc, d) => acc + mesiAzienda(d.dataAssunzione, d.dataUscita), 0)
  return Math.round(tot / store.dimissioni.length)
})

function mesiAzienda(dataAss, dataUsc) {
  const a = new Date(dataAss)
  const u = new Date(dataUsc)
  return Math.floor((u - a) / (30 * 24 * 60 * 60 * 1000))
}

function motivoBadge(motivo) {
  const map = {
    'Volontaria': 'badge-yellow',
    'Licenziamento': 'badge-red',
    'Fine Contratto Determinato': 'badge-orange',
    'Promozione/Trasferimento': 'badge-green',
    'Altre circostanze': 'badge-gray'
  }
  return map[motivo] || 'badge-gray'
}

const detail = reactive({ open: false, emp: null, motivo: '', note: '' })

function openDetail(d) {
  detail.emp = d
  detail.motivo = d.motivoUscita || ''
  detail.note = d.noteUscita || ''
  detail.open = true
}

function saveDetail() {
  store.saveDimissione(0, { motivoUscita: detail.motivo, noteUscita: detail.note })
  detail.open = false
}
</script>
