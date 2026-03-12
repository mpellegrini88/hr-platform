<template>
  <div class="p-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">📋 Contratti a Termine</h2>
        <p class="text-sm text-gray-500 mt-1">Gestione scadenze e reminder valutazione di prova</p>
      </div>
      <div class="text-right">
        <div class="text-3xl font-bold text-amber-600">{{ allContratti.length }}</div>
        <div class="text-xs text-gray-500">contratti determinati</div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card p-4 border-l-4 border-red-500 bg-red-50">
        <div class="text-xs text-red-600 font-semibold uppercase">Scaduti</div>
        <div class="text-2xl font-bold text-red-700 mt-1">{{ scaduti }}</div>
      </div>
      <div class="card p-4 border-l-4 border-orange-500 bg-orange-50">
        <div class="text-xs text-orange-600 font-semibold uppercase">Entro 7 giorni</div>
        <div class="text-2xl font-bold text-orange-700 mt-1">{{ entro7gg }}</div>
      </div>
      <div class="card p-4 border-l-4 border-yellow-500 bg-yellow-50">
        <div class="text-xs text-yellow-600 font-semibold uppercase">Entro 30 giorni</div>
        <div class="text-2xl font-bold text-yellow-700 mt-1">{{ entro30gg }}</div>
      </div>
      <div class="card p-4 border-l-4 border-emerald-500 bg-emerald-50">
        <div class="text-xs text-emerald-600 font-semibold uppercase">Attivi</div>
        <div class="text-2xl font-bold text-emerald-700 mt-1">{{ attivi }}</div>
      </div>
    </div>

    <!-- Filtri -->
    <div class="flex flex-wrap items-center gap-3">
      <input v-model="search" class="form-input max-w-xs" placeholder="🔍 Cerca dipendente...">
      <select v-model="filterTeam" class="form-select w-44">
        <option value="">Tutti i team</option>
        <option v-for="t in store.teams" :key="t">{{ t }}</option>
      </select>
      <select v-model="filterStatus" class="form-select w-44">
        <option value="">Tutti gli stati</option>
        <option value="scaduti">Scaduti</option>
        <option value="urgenti">Entro 7 giorni</option>
        <option value="attenzione">Entro 30 giorni</option>
        <option value="ok">Oltre 30 giorni</option>
      </select>
    </div>

    <!-- Tabelle per categoria -->
    <div class="space-y-6">
      <!-- SCADUTI -->
      <div v-if="scaduti > 0" class="card border-l-4 border-red-500 overflow-hidden">
        <div class="px-5 py-4 bg-red-50 border-b border-red-200">
          <h3 class="font-semibold text-red-900">🔴 Scaduti ({{ scaduti }})</h3>
          <p class="text-xs text-red-700 mt-1">Contratti la cui scadenza è stata superata</p>
        </div>
        <div class="overflow-x-auto">
          <table class="tbl">
            <thead><tr>
              <th>Dipendente</th><th>Team</th><th>Data Scadenza</th><th>Giorni</th><th>Esito Prova</th><th>FU1/FU2</th><th>P&C</th><th>Stato</th><th>Decisione</th><th>Azione</th>
            </tr></thead>
            <tbody>
              <tr v-for="c in filtered.filter(x => x.daysToEnd <= 0)" :key="c.id" class="bg-red-50">
                <td class="font-medium text-red-900">{{ c.nome }} {{ c.cognome }}</td>
                <td><span class="badge badge-gray">{{ c.team }}</span></td>
                <td class="font-mono text-sm text-red-800">{{ fmtDateShort(c.scadenzaContratto) }}</td>
                <td><span class="badge badge-red font-mono">{{ c.daysToEnd }} gg</span></td>
                <td>
                  <div class="flex flex-col gap-0.5">
                    <span :class="['badge badge-sm', c.esitoProva==='Superato'?'badge-green':c.esitoProva==='Non Superato'?'badge-red':'badge-blue']">{{ c.esitoProva }}</span>
                    <button v-if="c.valutazioneStatus === 'complete'" @click.stop="viewValutazione(c)" class="badge badge-sm bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100 text-[10px]">✓ {{ c.valutazioneRaccomandazione || 'Valutata' }}</button>
                    <button v-else-if="c.valutazioneStatus !== 'pending'" @click.stop="viewValutazione(c)" class="badge badge-sm bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer hover:bg-amber-100 text-[10px] animate-pulse">🎯 {{ c.valutazioneStatus === 'hr-pending' ? 'HR Pending' : 'CEO Pending' }}</button>
                    <button v-else @click.stop="viewValutazione(c)" class="badge badge-sm bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-100 text-[10px]">🎯 Da valutare</button>
                  </div>
                </td>
                <td class="text-xs">
                  <div class="flex flex-col gap-0.5">
                    <span v-if="c.scadenzaFU1">FU1: {{ fmtDateShort(c.scadenzaFU1) }}</span>
                    <span v-if="c.scadenzaFU2" class="text-gray-700">FU2: {{ fmtDateShort(c.scadenzaFU2) }}</span>
                  </div>
                </td>
                <td class="text-xs">
                  <span v-if="c.pcStatus === 'Aggiornato'" class="badge bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Aggiornato</span>
                  <span v-else-if="c.pcStatus === 'Scaduto'" class="badge bg-orange-50 text-orange-700 border border-orange-200">⚠️ Scaduto</span>
                  <span v-else class="badge bg-red-50 text-red-700 border border-red-200">❌ Nessuno</span>
                </td>
                <td><span class="badge badge-red">SCADUTO</span></td>
                <td class="text-xs">
                  <span v-if="c.decisione === 'Rinnovato'" class="badge bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Rinnovato</span>
                  <span v-else-if="c.decisione === 'Proroga'" class="badge bg-amber-50 text-amber-700 border border-amber-200">⏳ Proroga</span>
                  <span v-else-if="c.decisione === 'Non Rinnovato'" class="badge bg-red-50 text-red-700 border border-red-200">✗ Non Rinnovato</span>
                  <span v-else class="text-gray-400 text-xs">-</span>
                </td>
                <td class="space-x-1">
                  <button @click="openReminder(c)" class="text-red-700 hover:text-red-900 font-medium text-sm">📧 CEO</button>
                  <button @click="viewValutazione(c)" class="text-red-700 hover:text-red-900 font-medium text-sm">🎯 Valut</button>
                  <button @click="openRenewalDecision(c)" class="text-red-700 hover:text-red-900 font-medium text-sm">⚡ Rinnova</button>
                </td>
              </tr>
              <tr v-if="filtered.filter(x => x.daysToEnd <= 0).length === 0">
                <td colspan="10" class="text-center py-6 text-gray-400 text-sm">Nessun contratto scaduto</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ENTRO 7 GIORNI -->
      <div v-if="entro7gg > 0" class="card border-l-4 border-orange-500 overflow-hidden">
        <div class="px-5 py-4 bg-orange-50 border-b border-orange-200">
          <h3 class="font-semibold text-orange-900">🟠 Scadenza entro 7 giorni ({{ entro7gg }})</h3>
          <p class="text-xs text-orange-700 mt-1">Azione urgente richiesta - inviare report valutazione al CEO</p>
        </div>
        <div class="overflow-x-auto">
          <table class="tbl">
            <thead><tr>
              <th>Dipendente</th><th>Team</th><th>Data Scadenza</th><th>Giorni</th><th>Esito Prova</th><th>FU1/FU2</th><th>Stato</th><th>Azione</th>
            </tr></thead>
            <tbody>
              <tr v-for="c in filtered.filter(x => x.daysToEnd > 0 && x.daysToEnd <= 7)" :key="c.id" class="bg-orange-50">
                <td class="font-medium text-orange-900">{{ c.nome }} {{ c.cognome }}</td>
                <td><span class="badge badge-gray">{{ c.team }}</span></td>
                <td class="font-mono text-sm text-orange-800">{{ fmtDateShort(c.scadenzaContratto) }}</td>
                <td><span class="badge badge-orange font-mono">{{ c.daysToEnd }} gg</span></td>
                <td>
                  <div class="flex flex-col gap-0.5">
                    <span :class="['badge badge-sm', c.esitoProva==='Superato'?'badge-green':c.esitoProva==='Non Superato'?'badge-red':'badge-blue']">{{ c.esitoProva }}</span>
                    <button v-if="c.valutazioneStatus === 'complete'" @click.stop="viewValutazione(c)" class="badge badge-sm bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100 text-[10px]">✓ {{ c.valutazioneRaccomandazione || 'Valutata' }}</button>
                    <button v-else-if="c.valutazioneStatus !== 'pending'" @click.stop="viewValutazione(c)" class="badge badge-sm bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer hover:bg-amber-100 text-[10px] animate-pulse">🎯 {{ c.valutazioneStatus === 'hr-pending' ? 'HR Pending' : 'CEO Pending' }}</button>
                    <button v-else @click.stop="viewValutazione(c)" class="badge badge-sm bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-100 text-[10px]">🎯 Da valutare</button>
                  </div>
                </td>
                <td class="text-xs">
                  <div class="flex flex-col gap-0.5">
                    <span v-if="c.scadenzaFU1">FU1: {{ fmtDateShort(c.scadenzaFU1) }}</span>
                    <span v-if="c.scadenzaFU2" class="text-gray-700">FU2: {{ fmtDateShort(c.scadenzaFU2) }}</span>
                  </div>
                </td>
                <td><span class="badge badge-orange">URGENTE</span></td>
                <td class="space-x-1">
                  <button @click="openReminder(c)" class="text-orange-700 hover:text-orange-900 font-medium text-sm">📧 CEO</button>
                  <button @click="viewValutazione(c)" class="text-orange-700 hover:text-orange-900 font-medium text-sm">🎯 Valut</button>
                </td>
              </tr>
              <tr v-if="filtered.filter(x => x.daysToEnd > 0 && x.daysToEnd <= 7).length === 0">
                <td colspan="7" class="text-center py-6 text-gray-400 text-sm">Nessun contratto in scadenza</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ENTRO 30 GIORNI -->
      <div v-if="entro30gg > 0" class="card border-l-4 border-yellow-500 overflow-hidden">
        <div class="px-5 py-4 bg-yellow-50 border-b border-yellow-200">
          <h3 class="font-semibold text-yellow-900">🟡 Scadenza entro 30 giorni ({{ entro30gg }})</h3>
          <p class="text-xs text-yellow-700 mt-1">Pianificare report valutazione di prova - 1 mese prima scadenza</p>
        </div>
        <div class="overflow-x-auto">
          <table class="tbl">
            <thead><tr>
              <th>Dipendente</th><th>Team</th><th>Data Scadenza</th><th>Giorni</th><th>Esito Prova</th><th>FU1/FU2</th><th>Stato</th><th>Azione</th>
            </tr></thead>
            <tbody>
              <tr v-for="c in filtered.filter(x => x.daysToEnd > 7 && x.daysToEnd <= 30)" :key="c.id" class="bg-yellow-50">
                <td class="font-medium text-yellow-900">{{ c.nome }} {{ c.cognome }}</td>
                <td><span class="badge badge-gray">{{ c.team }}</span></td>
                <td class="font-mono text-sm text-yellow-800">{{ fmtDateShort(c.scadenzaContratto) }}</td>
                <td><span class="badge badge-yellow font-mono">{{ c.daysToEnd }} gg</span></td>
                <td>
                  <div class="flex flex-col gap-0.5">
                    <span :class="['badge badge-sm', c.esitoProva==='Superato'?'badge-green':c.esitoProva==='Non Superato'?'badge-red':'badge-blue']">{{ c.esitoProva }}</span>
                    <button v-if="c.valutazioneStatus === 'complete'" @click.stop="viewValutazione(c)" class="badge badge-sm bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100 text-[10px]">✓ {{ c.valutazioneRaccomandazione || 'Valutata' }}</button>
                    <button v-else-if="c.valutazioneStatus !== 'pending'" @click.stop="viewValutazione(c)" class="badge badge-sm bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer hover:bg-amber-100 text-[10px] animate-pulse">🎯 {{ c.valutazioneStatus === 'hr-pending' ? 'HR Pending' : 'CEO Pending' }}</button>
                    <button v-else @click.stop="viewValutazione(c)" class="badge badge-sm bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-100 text-[10px]">🎯 Da valutare</button>
                  </div>
                </td>
                <td class="text-xs">
                  <div class="flex flex-col gap-0.5">
                    <span v-if="c.scadenzaFU1">FU1: {{ fmtDateShort(c.scadenzaFU1) }}</span>
                    <span v-if="c.scadenzaFU2" class="text-gray-700">FU2: {{ fmtDateShort(c.scadenzaFU2) }}</span>
                  </div>
                </td>
                <td><span class="badge badge-yellow">Attenzione</span></td>
                <td class="space-x-1">
                  <button @click="openReminder(c)" class="text-yellow-700 hover:text-yellow-900 font-medium text-sm">📧 CEO</button>
                  <button @click="viewValutazione(c)" class="text-yellow-700 hover:text-yellow-900 font-medium text-sm">🎯 Valut</button>
                </td>
              </tr>
              <tr v-if="filtered.filter(x => x.daysToEnd > 7 && x.daysToEnd <= 30).length === 0">
                <td colspan="7" class="text-center py-6 text-gray-400 text-sm">Nessun contratto in scadenza</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ATTIVI - oltre 30 giorni -->
      <div class="card border-l-4 border-emerald-500 overflow-hidden">
        <div class="px-5 py-4 bg-emerald-50 border-b border-emerald-200">
          <h3 class="font-semibold text-emerald-900">✅ Attivi (oltre 30 giorni - {{ attivi }})</h3>
          <p class="text-xs text-emerald-700 mt-1">Contratti determinati in buono stato</p>
        </div>
        <div class="overflow-x-auto">
          <table class="tbl">
            <thead><tr>
              <th>Dipendente</th><th>Team</th><th>Data Scadenza</th><th>Giorni</th><th>Esito Prova</th><th>FU1/FU2</th><th>Stato</th>
            </tr></thead>
            <tbody>
              <tr v-for="c in filtered.filter(x => x.daysToEnd > 30)" :key="c.id">
                <td class="font-medium text-emerald-900">{{ c.nome }} {{ c.cognome }}</td>
                <td><span class="badge badge-gray">{{ c.team }}</span></td>
                <td class="font-mono text-sm text-emerald-800">{{ fmtDateShort(c.scadenzaContratto) }}</td>
                <td><span class="badge badge-emerald font-mono">{{ c.daysToEnd }} gg</span></td>
                <td>
                  <div class="flex flex-col gap-0.5">
                    <span :class="['badge badge-sm', c.esitoProva==='Superato'?'badge-green':c.esitoProva==='Non Superato'?'badge-red':'badge-blue']">{{ c.esitoProva }}</span>
                    <button v-if="c.valutazioneStatus !== 'pending'" @click.stop="viewValutazione(c)" class="badge badge-sm bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-100 text-[10px]">🎯 Valutazione →</button>
                  </div>
                </td>
                <td class="text-xs">
                  <div class="flex flex-col gap-0.5">
                    <span v-if="c.scadenzaFU1">FU1: {{ fmtDateShort(c.scadenzaFU1) }}</span>
                    <span v-if="c.scadenzaFU2" class="text-gray-700">FU2: {{ fmtDateShort(c.scadenzaFU2) }}</span>
                  </div>
                </td>
                <td><span class="badge badge-emerald">OK</span></td>
              </tr>
              <tr v-if="filtered.filter(x => x.daysToEnd > 30).length === 0">
                <td colspan="6" class="text-center py-6 text-gray-400 text-sm">Nessun contratto attivo in questa categoria</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- INFO BANNER -->
    <div class="card bg-blue-50 border-l-4 border-blue-500 p-4">
      <div class="flex items-start gap-3">
        <div class="text-2xl pt-1">ℹ️</div>
        <div>
          <h4 class="font-semibold text-blue-900 mb-1">Processo di Scadenza Contratto</h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li><strong>30 giorni prima:</strong> Pianificare e compilare valutazione di prova</li>
            <li><strong>15 giorni prima:</strong> Inviare report al CEO con raccomandazione (rinnovo / non rinnovo)</li>
            <li><strong>Giorno della scadenza:</strong> Gestire transizione (rinnovo / conclusione)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL REMINDER CEO -->
  <Modal :open="reminderModal.open" @close="reminderModal.open = false" width="max-w-lg">
    <template #header>📧 Invia Reminder Valutazione al CEO</template>
    <div class="space-y-4 py-4">
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p class="text-sm font-medium text-gray-900 mb-2">{{ reminderModal.contratto?.nome }} {{ reminderModal.contratto?.cognome }}</p>
        <p class="text-xs text-gray-600">Team: {{ reminderModal.contratto?.team }}</p>
        <p class="text-xs text-gray-600">Scadenza: {{ reminderModal.contratto ? fmtDateShort(reminderModal.contratto.scadenzaContratto) : '' }}</p>
      </div>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-sm text-yellow-900">
          <strong>Reminder:</strong> Inviare report valutazione di prova al CEO <strong>1 mese prima</strong> della scadenza contratto per permettere decisione su rinnovo/conclusione.
        </p>
      </div>
      <textarea v-model="reminderModal.message" class="form-textarea" rows="6" placeholder="Messaggio personalizzato per CEO..."></textarea>
    </div>
    <template #footer>
      <button @click="reminderModal.open = false" class="btn btn-ghost">Chiudi</button>
      <button @click="sendReminder" class="btn btn-primary">📧 Invia Email</button>
    </template>
  </Modal>

  <!-- CONTRACT RENEWAL DECISION MODAL -->
  <ContractRenewalDecisionModal
    :open="renewalModal.open"
    :employee-id="renewalModal.contratto?.id"
    :employee-name="`${renewalModal.contratto?.nome} ${renewalModal.contratto?.cognome}`"
    :employee-team="renewalModal.contratto?.team"
    :scadenza-contratto="renewalModal.contratto?.scadenzaContratto"
    :esito-prova="renewalModal.contratto?.esitoProva"
    @close="renewalModal.open = false"
    @saved="handleRenewalSaved"
  />

  <!-- ADD P&C COLLOQUIO MODAL -->
  <AddPCColloquioModal
    :open="pcModal.open"
    :employee-id="pcModal.contratto?.id"
    :employee-name="`${pcModal.contratto?.nome} ${pcModal.contratto?.cognome}`"
    :employee-team="pcModal.contratto?.team"
    :last-colloquio-date="pcModal.contratto?.pcLastDate"
    @close="pcModal.open = false"
    @saved="handlePCColloquioSaved"
  />
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import Modal from '@/components/ui/Modal.vue'
import ContractRenewalDecisionModal from '@/components/dashboard/ContractRenewalDecisionModal.vue'
import AddPCColloquioModal from '@/components/dashboard/AddPCColloquioModal.vue'

const router = useRouter()
const store = useHrStore()
const { fmtDateShort } = useHelpers()

const search = ref('')
const filterTeam = ref('')
const filterStatus = ref('')

// Modal states
const renewalModal = reactive({ open: false, contratto: null })
const pcModal = reactive({ open: false, contratto: null })

const allContratti = computed(() => {
  const today = new Date()
  const list = []
  store.employees.forEach(e => {
    if (e.tipoContratto !== 'determinato' || !e.scadenzaContratto || e.stato !== 'Attivo') return
    const scadenza = new Date(e.scadenzaContratto)
    const daysToEnd = Math.round((scadenza - today) / 86400000)
    const pcStatus = store.pcColloquiStatus[e.id]
    list.push({
      id: e.id,
      nome: e.nome,
      cognome: e.cognome,
      team: e.team,
      citta: e.citta,
      scadenzaContratto: e.scadenzaContratto,
      scadenzaFU1: e.scadenzaFU1,
      scadenzaFU2: e.scadenzaFU2,
      daysToEnd: daysToEnd,
      esitoProva: e.esitoProva,
      tipoContratto: e.tipoContratto,
      stato: e.stato,
      decisione: e.decisione,
      dataDecisioneRinnovo: e.dataDecisioneRinnovo,
      dataProrogaFino: e.dataProrogaFino,
      pcStatus: pcStatus?.status || 'Non Fatto',
      pcLastDate: pcStatus?.lastDate,
      employee: e, // Store full employee object for modal access
      // Valutazione data
      valutazionePeriodoProva: e.valutazionePeriodoProva,
      valutazioneStatus: (() => {
        const v = e.valutazionePeriodoProva
        if (!v) return 'pending'
        if (v.faseCorrente === 'ceo-complete') return 'complete'
        if (v.faseCorrente === 'hr-complete') return 'ceo-pending'
        if (v.faseCorrente === 'manager-complete') return 'hr-pending'
        return 'pending'
      })(),
      valutazioneRaccomandazione: e.valutazionePeriodoProva?.manager?.raccomandazione || null,
      valutazioneHRVoto: e.valutazionePeriodoProva?.hr?.voto || null,
      valutazioneCEODecisione: e.valutazionePeriodoProva?.ceo?.decisione || null
    })
  })
  return list
})

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  return allContratti.value.filter(c => {
    const matchSearch = !s || c.nome.toLowerCase().includes(s) || c.cognome.toLowerCase().includes(s) || c.team.toLowerCase().includes(s)
    const matchTeam = !filterTeam.value || c.team === filterTeam.value
    let matchStatus = true
    if (filterStatus.value === 'scaduti') matchStatus = c.daysToEnd <= 0
    if (filterStatus.value === 'urgenti') matchStatus = c.daysToEnd > 0 && c.daysToEnd <= 7
    if (filterStatus.value === 'attenzione') matchStatus = c.daysToEnd > 7 && c.daysToEnd <= 30
    if (filterStatus.value === 'ok') matchStatus = c.daysToEnd > 30
    return matchSearch && matchTeam && matchStatus
  }).sort((a, b) => a.daysToEnd - b.daysToEnd)
})

const scaduti = computed(() => allContratti.value.filter(c => c.daysToEnd <= 0).length)
const entro7gg = computed(() => allContratti.value.filter(c => c.daysToEnd > 0 && c.daysToEnd <= 7).length)
const entro30gg = computed(() => allContratti.value.filter(c => c.daysToEnd > 7 && c.daysToEnd <= 30).length)
const attivi = computed(() => allContratti.value.filter(c => c.daysToEnd > 30).length)

const reminderModal = reactive({ open: false, contratto: null, message: '' })

function openReminder(contratto) {
  const template = `REMINDER: Report Valutazione di Prova

Dipendente: ${contratto.nome} ${contratto.cognome}
Team: ${contratto.team}
Data Scadenza Contratto: ${fmtDateShort(contratto.scadenzaContratto)}
Esito Prova: ${contratto.esitoProva}

RICHIESTA:
Inviare report di valutazione di prova al CEO per permette una decisione su rinnovo/conclusione del contratto.

⚠️ Nota: Questo deve essere fatto almeno 1 mese prima della scadenza contratto.`

  reminderModal.contratto = contratto
  reminderModal.message = template
  reminderModal.open = true
}

function sendReminder() {
  // In future: integrate with email service
  const msg = `Reminder inviato per ${reminderModal.contratto.nome} ${reminderModal.contratto.cognome}`
  alert(msg)
  reminderModal.open = false
}

function viewValutazione(contratto) {
  // Navigate to ValutazioneProva page with employee ID pre-selected
  router.push(`/valutazione-prova?empId=${contratto.id}`)
}

function openRenewalDecision(contratto) {
  renewalModal.contratto = contratto
  renewalModal.open = true
}

function openPCColloquio(contratto) {
  pcModal.contratto = contratto
  pcModal.open = true
}

function handleRenewalSaved() {
  renewalModal.open = false
  renewalModal.contratto = null
  // Data already saved to store via modal
}

function handlePCColloquioSaved() {
  pcModal.open = false
  pcModal.contratto = null
  // Data already saved to store via modal
}
</script>
