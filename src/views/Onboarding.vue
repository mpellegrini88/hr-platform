<template>
  <div class="p-6 space-y-5">
    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex rounded-lg border border-gray-200 bg-white overflow-hidden text-sm">
        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value"
          :class="['px-4 py-2 font-medium transition-colors', activeTab===tab.value ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50']">
          {{ tab.label }}
        </button>
      </div>
      <select v-model="filterYear" class="form-select w-32">
        <option value="">Tutti gli anni</option>
        <option v-for="y in years" :key="y">{{ y }}</option>
      </select>
      <input v-model="search" class="form-input max-w-xs" placeholder="🔍 Cerca...">
      <div class="ml-auto flex items-center gap-2 text-xs text-gray-500">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>Superato</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-blue-400 inline-block"></span>In corso</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-red-400 inline-block"></span>Urgente</span>
      </div>
    </div>

    <!-- IN CORSO -->
    <div v-if="activeTab === 'inCorso'">
      <div v-if="inCorso.length === 0" class="card p-12 text-center text-gray-400">Nessun dipendente in periodo di prova</div>
      <div v-else class="space-y-4">
        <div v-for="e in inCorso" :key="e.id" class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-50 flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
              {{ initials(e.nome) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900">{{ e.nome }} {{ e.cognome }}</div>
              <div class="text-xs text-gray-400">{{ e.team }} · {{ e.citta }} · {{ e.tipoContratto }}{{ e.oreSettimana ? ' · ' + e.oreSettimana + 'h/sett' : '' }}</div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <div class="text-right">
                <div class="text-xs text-gray-400">Fine prova</div>
                <div :class="['text-sm font-bold', e.daysToProva <= 7 ? 'text-red-600' : e.daysToProva <= 30 ? 'text-amber-600' : 'text-gray-700']">
                  {{ fmtDateShort(e.fineProva) }}
                </div>
                <div class="text-xs text-gray-400">{{ e.daysToProva }}gg rimasti</div>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-400">Livello CCNL</div>
                <div class="text-sm font-medium text-gray-700">{{ e.livelloCCNL }}</div>
                <div class="text-xs text-gray-400">{{ e.durataProva }}</div>
              </div>
              <button @click="openDetail(e)" class="btn btn-secondary btn-sm">Gestisci →</button>
            </div>
          </div>

          <!-- Timeline onboarding -->
          <div class="px-5 py-4">
            <div class="relative">
              <!-- Progress bar -->
              <div class="absolute top-4 left-8 right-8 h-0.5 bg-gray-100">
                <div class="h-full bg-primary-300 transition-all" :style="{ width: progressPct(e) + '%' }"></div>
              </div>
              <div class="relative flex justify-between">
                <TimelineNode
                  :done="true"
                  :date="e.dataAssunzione"
                  label="Ingresso"
                  icon="🚀"
                  color="emerald"
                  desc="Primo giorno in azienda"
                />
                <TimelineNode
                  :done="e.statoFU1 === 'Fatto'"
                  :urgent="e.fu1Urgente || e.fu1Scaduto"
                  :date="e.scadenzaFU1"
                  label="FU1 Dipendente"
                  icon="💬"
                  color="blue"
                  desc="Colloquio con dipendente entro 30gg"
                  :stato="e.statoFU1"
                />
                <TimelineNode
                  :done="e.statoFU2Manager === 'Fatto'"
                  :urgent="e.fu2ManagerUrgente || e.fu2ManagerScaduto"
                  :date="e.scadenzaFU2Manager"
                  label="FU Manager"
                  icon="👨‍💼"
                  color="orange"
                  desc="Valutazione manager a 45gg"
                  :stato="e.statoFU2Manager"
                />
                <TimelineNode
                  :done="e.statoFU2Dip === 'Fatto'"
                  :urgent="e.fu2Urgente"
                  :date="e.scadenzaFU2"
                  label="FU2 Dipendente"
                  icon="👔"
                  color="purple"
                  desc="30gg prima fine prova (dip.)"
                  :stato="e.statoFU2Dip"
                />
                <TimelineNode
                  :done="e.esitoProva === 'Superato'"
                  :failed="e.esitoProva === 'Non Superato'"
                  :urgent="e.provaUrgente && e.esitoProva === 'In Corso'"
                  :date="e.fineProva"
                  label="Fine prova"
                  icon="🏁"
                  color="indigo"
                  desc="Valutazione periodo di prova"
                  :stato="e.esitoProva"
                />
              </div>
            </div>
          </div>

          <!-- Scale benessere onboarding (se ha colloquio) -->
          <div v-if="e._coll && (e._coll.c1_esaur || e._coll.c1_motiv)" class="px-5 pb-4">
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Scale onboarding (FU1)</div>
              <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
                <ScorePill label="Esaurimento" :value="e._coll.c1_esaur" :inverted="true" />
                <ScorePill label="Carico" :value="e._coll.c1_carico" :inverted="true" />
                <ScorePill label="Motivazione" :value="e._coll.c1_motiv" />
                <ScorePill label="Supporto" :value="e._coll.c1_supp" />
                <ScorePill label="Equilibrio" :value="e._coll.c1_equil" />
                <ScorePill label="Intenzione" :value="e._coll.c1_intent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- STORICO per anno -->
    <div v-if="activeTab === 'storico'">
      <div v-for="(group, year) in storicoByYear" :key="year">
        <div class="flex items-center gap-3 mb-3 mt-6 first:mt-0">
          <span class="text-sm font-bold text-gray-700">{{ year }}</span>
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-xs text-gray-400">{{ group.length }} onboarding</span>
        </div>
        <div class="card overflow-hidden mb-4">
          <table class="tbl">
            <thead><tr>
              <th>Dipendente</th><th>Team</th><th>Contratto</th><th>Assunzione</th><th>Fine prova</th>
              <th>Durata</th><th>Esito</th><th>FU1</th><th>FU2</th><th>Score onb.</th>
            </tr></thead>
            <tbody>
              <tr v-for="e in group" :key="e.id" class="tbl-clickable" @click="openDetail(e)">
                <td><div class="font-medium">{{ e.nome }} {{ e.cognome }}</div><div class="text-xs text-gray-400">{{ e.citta }}</div></td>
                <td><span class="badge badge-gray">{{ e.team }}</span></td>
                <td>
                  <span :class="['badge', contractBadge(e.tipoContratto)]">{{ e.tipoContratto }}</span>
                  <span v-if="e.oreSettimana" class="block text-xs text-gray-400 mt-0.5">{{ e.oreSettimana }}h/sett</span>
                </td>
                <td class="text-sm">{{ fmtDateShort(e.dataAssunzione) }}</td>
                <td class="text-sm">{{ fmtDateShort(e.fineProva) }}</td>
                <td class="text-xs text-gray-500">{{ e.durataProva }}</td>
                <td><span :class="['badge', esitoClass(e.esitoProva)]">{{ e.esitoProva }}</span></td>
                <td><span :class="['badge', e.statoFU1==='Fatto'?'badge-green':'badge-gray']">{{ e.statoFU1 }}</span></td>
                <td><span :class="['badge', e.statoFU2Dip==='Fatto'?'badge-green':'badge-gray']">{{ e.statoFU2Dip }}</span></td>
                <td>
                  <div v-if="e._coll && e._coll.c1_esaur" class="flex gap-1">
                    <span v-for="v in [e._coll.c1_esaur,e._coll.c1_motiv,e._coll.c1_intent]" :key="v"
                      class="w-5 h-5 rounded text-xs flex items-center justify-center font-bold"
                      :style="{ background: scoreColor(v) + '22', color: scoreColor(v) }">{{ v }}</span>
                  </div>
                  <span v-else class="text-xs text-gray-300">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- DETAIL MODAL -->
    <Modal :open="detail.open" :title="'Onboarding — ' + (detail.emp?.nome||'')" width="820px" @close="detail.open=false">
      <div v-if="detail.emp" class="space-y-5">
        <!-- Header info -->
        <div class="grid grid-cols-4 gap-3">
          <InfoBlock label="Team" :value="detail.emp.team" />
          <InfoBlock label="Contratto" :value="detail.emp.tipoContratto + (detail.emp.oreSettimana ? ' · '+detail.emp.oreSettimana+'h/sett' : '')" />
          <InfoBlock label="Livello CCNL" :value="detail.emp.livelloCCNL" />
          <InfoBlock label="Durata prova" :value="detail.emp.durataProva" />
        </div>
        <div class="grid grid-cols-3 gap-3">
          <InfoBlock label="Data assunzione" :value="fmtDate(detail.emp.dataAssunzione)" />
          <InfoBlock label="Fine periodo di prova" :value="fmtDate(detail.emp.fineProva)" highlight />
          <InfoBlock label="Metodo computo" :value="detail.emp.metodoComputo" />
        </div>

        <Section title="Follow-up 1 — entro 30gg dall'assunzione (con dipendente)">
          <div class="grid grid-cols-2 gap-4">
            <div><label class="form-label">Scadenza FU1</label><input class="form-input bg-gray-50" :value="fmtDateShort(detail.emp.scadenzaFU1)" readonly></div>
            <div>
              <label class="form-label">Stato FU1</label>
              <select class="form-select" v-model="detail.emp.statoFU1" @change="saveDetail">
                <option>Da Fare</option><option>Fatto</option><option>Non Necessario</option>
              </select>
            </div>
          </div>
          <!-- Legenda scale scientifiche -->
          <details class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <summary class="cursor-pointer text-sm font-semibold text-amber-800 select-none flex items-center gap-2">
              📖 Legenda Scale Scientifiche
              <span class="text-xs font-normal text-amber-600">(clicca per espandere)</span>
            </summary>
            <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
              <div class="bg-white rounded-lg p-3 border border-amber-100">
                <p class="font-semibold text-gray-900 mb-1">😓 MBI-GS — Maslach Burnout Inventory</p>
                <p>Misura il livello di <b>esaurimento emotivo</b> e depersonalizzazione. Gold standard per la valutazione del burnout.</p>
                <p class="mt-1 text-red-600 font-medium">⚠ Scala invertita: alto = peggio</p>
              </div>
              <div class="bg-white rounded-lg p-3 border border-amber-100">
                <p class="font-semibold text-gray-900 mb-1">⚡ CBI — Copenhagen Burnout Inventory</p>
                <p>Valuta il <b>carico di lavoro percepito</b> e lo stress organizzativo.</p>
                <p class="mt-1 text-red-600 font-medium">⚠ Scala invertita: alto = peggio</p>
              </div>
              <div class="bg-white rounded-lg p-3 border border-amber-100">
                <p class="font-semibold text-gray-900 mb-1">💪 JD-R Motivazione (Bakker & Demerouti)</p>
                <p>Misura <b>motivazione intrinseca e autonomia</b>. Risorse alte → engagement.</p>
                <p class="mt-1 text-emerald-600 font-medium">✓ Alto = meglio</p>
              </div>
              <div class="bg-white rounded-lg p-3 border border-amber-100">
                <p class="font-semibold text-gray-900 mb-1">🤝 JD-R Supporto (Bakker & Demerouti)</p>
                <p>Valuta <b>supporto organizzativo</b> e chiarezza del ruolo.</p>
                <p class="mt-1 text-emerald-600 font-medium">✓ Alto = meglio</p>
              </div>
              <div class="bg-white rounded-lg p-3 border border-amber-100">
                <p class="font-semibold text-gray-900 mb-1">⚖️ WHO-5 — Well-Being Index (OMS)</p>
                <p>Indice di <b>benessere e equilibrio vita-lavoro</b>. Validato in oltre 30 lingue.</p>
                <p class="mt-1 text-emerald-600 font-medium">✓ Alto = meglio</p>
              </div>
              <div class="bg-white rounded-lg p-3 border border-amber-100">
                <p class="font-semibold text-gray-900 mb-1">🏠 Mobley — Modello del Turnover (1977)</p>
                <p>Misura l'<b>intenzione di restare</b> nell'organizzazione.</p>
                <p class="mt-1 text-emerald-600 font-medium">✓ Alto = meglio</p>
              </div>
            </div>
          </details>

          <!-- Scale FU1 - da behavioral wellness -->
          <div class="mt-4 space-y-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide">Scale onboarding FU1 (Behavioral Wellness)</p>
            <div class="grid grid-cols-2 gap-5">
              <ScaleInput label="Esaurimento emotivo (MBI-GS)" v-model="fu1Scores.esaur" :inverted="true" hint="↑ = peggio" minLabel="1 = mai" maxLabel="5 = sempre" />
              <ScaleInput label="Carico di lavoro (CBI)" v-model="fu1Scores.carico" :inverted="true" hint="↑ = peggio" minLabel="1 = basso" maxLabel="5 = alto" />
              <ScaleInput label="Motivazione & Autonomia (JD-R)" v-model="fu1Scores.motiv" hint="↑ = meglio" minLabel="1 = bassa" maxLabel="5 = alta" />
              <ScaleInput label="Supporto & Chiarezza (JD-R)" v-model="fu1Scores.supp" hint="↑ = meglio" minLabel="1 = basso" maxLabel="5 = alto" />
              <ScaleInput label="Equilibrio vita-lavoro (WHO-5)" v-model="fu1Scores.equil" hint="↑ = meglio" minLabel="1 = mai" maxLabel="5 = sempre" />
              <ScaleInput label="Intenzione di restare (Mobley)" v-model="fu1Scores.intent" hint="↑ = meglio" minLabel="1 = bassa" maxLabel="5 = alta" />
            </div>
            <div><label class="form-label">Note FU1</label><textarea class="form-textarea" rows="2" v-model="fu1Scores.note"></textarea></div>
          </div>
        </Section>

        <Section title="Follow-up 2 — 30gg prima fine prova (dipendente + manager)">
          <div class="grid grid-cols-3 gap-4">
            <div><label class="form-label">Scadenza FU2</label><input class="form-input bg-gray-50" :value="fmtDateShort(detail.emp.scadenzaFU2)" readonly></div>
            <div>
              <label class="form-label">Stato FU2 — Dipendente</label>
              <select class="form-select" v-model="detail.emp.statoFU2Dip" @change="saveDetail">
                <option>Da Fare</option><option>Fatto</option><option>Non Necessario</option>
              </select>
            </div>
            <div>
              <label class="form-label">Stato FU2 — Manager</label>
              <select class="form-select" v-model="detail.emp.statoFU2Manager" @change="saveDetail">
                <option>Da Fare</option><option>Fatto</option><option>Non Necessario</option>
              </select>
            </div>
          </div>
          <!-- Scale FU2 - da behavioral wellness + performance -->
          <div class="mt-4 space-y-4 bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p class="text-xs font-semibold text-purple-600 uppercase tracking-wide">Scale FU2 (Behavioral Wellness + Performance)</p>
            <div class="grid grid-cols-2 gap-5">
              <ScaleInput label="Esaurimento emotivo (MBI-GS)" v-model="fu2Scores.esaur" :inverted="true" hint="↑ = peggio" minLabel="1 = mai" maxLabel="5 = sempre" />
              <ScaleInput label="Carico di lavoro (CBI)" v-model="fu2Scores.carico" :inverted="true" hint="↑ = peggio" minLabel="1 = basso" maxLabel="5 = alto" />
              <ScaleInput label="Motivazione & Autonomia (JD-R)" v-model="fu2Scores.motiv" hint="↑ = meglio" minLabel="1 = bassa" maxLabel="5 = alta" />
              <ScaleInput label="Supporto & Chiarezza (JD-R)" v-model="fu2Scores.supp" hint="↑ = meglio" minLabel="1 = basso" maxLabel="5 = alto" />
              <ScaleInput label="Equilibrio vita-lavoro (WHO-5)" v-model="fu2Scores.equil" hint="↑ = meglio" minLabel="1 = mai" maxLabel="5 = sempre" />
              <ScaleInput label="Intenzione di restare (Mobley)" v-model="fu2Scores.intent" hint="↑ = meglio" minLabel="1 = bassa" maxLabel="5 = alta" />
            </div>
            <div><label class="form-label">Note FU2</label><textarea class="form-textarea" rows="2" v-model="fu2Scores.note"></textarea></div>
          </div>
        </Section>

        <Section title="🎯 Valutazione Manager (nuova)">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-start gap-3">
              <div class="text-3xl flex-shrink-0">👨‍💼</div>
              <div class="flex-1">
                <h4 class="font-semibold text-blue-900 mb-2">Valutazione del Responsabile Tecnico</h4>
                <p class="text-sm text-blue-800 mb-3">
                  Prima di decidere il responso finale della prova, il responsabile tecnico deve compilare una valutazione dettagliata con voti (scala 1-5) su:
                  competenze, qualità, problem solving, velocità, collaborazione, comunicazione e attitudine al ruolo.
                </p>
                
                <div class="space-y-2 text-sm">
                  <p class="font-medium text-blue-900">📋 Due opzioni:</p>
                  
                  <div class="bg-white p-3 rounded border-l-4 border-purple-400">
                    <p class="font-semibold text-purple-900 mb-1">🤖 Opzione 1: Usa l'Assistente AI</p>
                    <p class="text-xs text-purple-700 mb-2">Scrivi le osservazioni del dipendente e l'AI suggerirà automaticamente i voti.</p>
                    <button @click="goToValutazioneWithAI" class="btn btn-sm text-xs px-3 bg-purple-600 hover:bg-purple-700 text-white">
                      → Apri AI Chat Hub
                    </button>
                  </div>

                  <div class="bg-white p-3 rounded border-l-4 border-blue-400">
                    <p class="font-semibold text-blue-900 mb-1">✍️ Opzione 2: Compila Manualmente</p>
                    <p class="text-xs text-blue-700 mb-2">Accedi alla sezione valutazione prova e compila il form direttamente.</p>
                    <button @click="goToValutazione" class="btn btn-sm text-xs px-3 bg-blue-600 hover:bg-blue-700 text-white">
                      → Vai alla Valutazione Prova
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Valutazione periodo di prova">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Esito periodo di prova</label>
              <select class="form-select" v-model="detail.emp.esitoProva" @change="saveDetail">
                <option>In Corso</option><option>Superato</option><option>Non Superato</option>
              </select>
            </div>
          </div>
          <div v-if="detail.emp.esitoProva === 'Superato'" class="mt-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <p class="text-sm font-medium text-emerald-800">✅ Periodo di prova superato — il dipendente passa al rapporto a tempo indeterminato/contratto pieno.</p>
          </div>
          <div v-if="detail.emp.esitoProva === 'Non Superato'" class="mt-3 p-4 bg-red-50 rounded-xl border border-red-200">
            <p class="text-sm font-medium text-red-800">❌ Periodo di prova non superato — aggiornare lo stato del dipendente in Anagrafica.</p>
          </div>
        </Section>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="detail.open=false">Chiudi</button>
        <button class="btn btn-primary" @click="saveDetailFull">💾 Salva tutto</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import Modal from '@/components/ui/Modal.vue'
import Section from '@/components/ui/Section.vue'
import ScaleInput from '@/components/ui/ScaleInput.vue'
import TimelineNode from '@/components/ui/TimelineNode.vue'
import ScorePill from '@/components/ui/ScorePill.vue'
import InfoBlock from '@/components/ui/InfoBlock.vue'

const store = useHrStore()
const router = useRouter()
const { fmtDate, fmtDateShort, contractBadge, scoreColor } = useHelpers()

const activeTab = ref('inCorso')
const search = ref(''), filterYear = ref('')

const tabs = [
  { value: 'inCorso', label: '🚀 In corso' },
  { value: 'storico', label: '📚 Storico' },
]

const allOnboarding = computed(() => store.enrichedEmployees.filter(e => e.fineProva || e.dataAssunzione))

const inCorso = computed(() => {
  return allOnboarding.value
    .filter(e => e.inProva && (!search.value || e.nome.toLowerCase().includes(search.value.toLowerCase())))
    .sort((a, b) => (a.daysToProva ?? 9999) - (b.daysToProva ?? 9999))
})

const storico = computed(() => {
  return allOnboarding.value.filter(e => {
    const inS = !search.value || e.nome.toLowerCase().includes(search.value.toLowerCase())
    const inY = !filterYear.value || (e.dataAssunzione || '').startsWith(filterYear.value)
    return !e.inProva && inS && inY
  }).sort((a, b) => (b.dataAssunzione || '') > (a.dataAssunzione || '') ? 1 : -1)
})

const storicoByYear = computed(() => {
  const map = {}
  storico.value.forEach(e => {
    const y = e.dataAssunzione ? e.dataAssunzione.slice(0, 4) : 'N/D'
    if (!map[y]) map[y] = []
    map[y].push(e)
  })
  return Object.fromEntries(Object.entries(map).sort((a, b) => b[0] > a[0] ? 1 : -1))
})

const years = computed(() => [...new Set(store.employees.map(e => e.dataAssunzione?.slice(0,4)).filter(Boolean))].sort().reverse())

function progressPct(e) {
  const steps = [true, e.statoFU1==='Fatto', e.statoFU2Manager==='Fatto', e.statoFU2Dip==='Fatto', e.esitoProva==='Superato']
  return (steps.filter(Boolean).length / steps.length) * 100
}

function initials(nome) {
  return (nome || '').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

function esitoClass(e) {
  return e==='Superato'?'badge-green':e==='Non Superato'?'badge-red':'badge-blue'
}

// Detail modal
const detail = reactive({ open: false, emp: null })
const fu1Scores = reactive({ esaur:null, carico:null, motiv:null, supp:null, equil:null, intent:null, note:'' })
const fu2Scores = reactive({ esaur:null, carico:null, motiv:null, supp:null, equil:null, intent:null, note:'' })

function openDetail(e) {
  detail.emp = { ...e }
  const c = e._coll || {}
  Object.assign(fu1Scores, { esaur:c.c1_esaur||null, carico:c.c1_carico||null, motiv:c.c1_motiv||null, supp:c.c1_supp||null, equil:c.c1_equil||null, intent:c.c1_intent||null, note:c.c1_note||'' })
  Object.assign(fu2Scores, { esaur:c.c2_esaur||null, carico:c.c2_carico||null, motiv:c.c2_motiv||null, supp:c.c2_supp||null, equil:c.c2_equil||null, intent:c.c2_intent||null, note:c.c2_note||'' })
  detail.open = true
}

function saveDetail() {
  if (!detail.emp) return
  store.updateEmployee(detail.emp.id, { statoFU1: detail.emp.statoFU1, statoFU2Dip: detail.emp.statoFU2Dip, statoFU2Manager: detail.emp.statoFU2Manager, esitoProva: detail.emp.esitoProva })
}

function saveDetailFull() {
  saveDetail()
  store.saveColloquio(detail.emp.nome, {
    c1_esaur: fu1Scores.esaur, c1_carico: fu1Scores.carico, c1_motiv: fu1Scores.motiv, c1_supp: fu1Scores.supp, c1_equil: fu1Scores.equil, c1_intent: fu1Scores.intent, c1_note: fu1Scores.note,
    c2_esaur: fu2Scores.esaur, c2_carico: fu2Scores.carico, c2_motiv: fu2Scores.motiv, c2_supp: fu2Scores.supp, c2_equil: fu2Scores.equil, c2_intent: fu2Scores.intent, c2_note: fu2Scores.note,
  })
  detail.open = false
}

// Navigation to Valutazione prova
function goToValutazione() {
  if (!detail.emp) return
  detail.open = false
  router.push(`/valutazione-prova?empId=${detail.emp.id}`)
}

function goToValutazioneWithAI() {
  if (!detail.emp) return
  detail.open = false
  // Navigate to valutazione with AI focus (could pass a flag, but for now just navigate)
  router.push(`/valutazione-prova?empId=${detail.emp.id}#ai-chat-hub`)
}
</script>
