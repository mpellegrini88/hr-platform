<template>
  <div class="p-6 space-y-6">
    <!-- Header with employee info -->
    <div class="card p-6 border-l-4 border-primary-500">
      <div class="flex items-start gap-6">
        <!-- Avatar -->
        <div class="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl shrink-0">
          {{ initials(emp?.nome || '') }}
        </div>

        <!-- Employee info -->
        <div class="flex-1">
          <h2 class="text-3xl font-bold text-gray-900">{{ emp?.nome }} {{ emp?.cognome }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ emp?.team }}</p>
          <div class="flex flex-wrap gap-3 mt-3">
            <span class="badge badge-blue">{{ emp?.tipoContratto || 'N/A' }}</span>
            <span :class="['badge', emp?.stato === 'Attivo' ? 'badge-green' : 'badge-gray']">{{ emp?.stato || 'N/A' }}</span>
            <span class="badge badge-gray">📍 {{ emp?.citta || 'Non specificato' }}</span>
          </div>

          <!-- Quick stats -->
          <div class="grid grid-cols-3 gap-4 mt-4">
            <div class="bg-gray-50 rounded p-2">
              <div class="text-xs text-gray-500">Assunto il</div>
              <div class="text-sm font-semibold text-gray-900">{{ emp?.dataAssunzione ? fmtDateShort(emp.dataAssunzione) : '—' }}</div>
            </div>
            <div class="bg-gray-50 rounded p-2">
              <div class="text-xs text-gray-500">Livello CCNL</div>
              <div class="text-sm font-semibold text-gray-900">{{ emp?.livelloCCNL || '—' }}</div>
            </div>
            <div class="bg-gray-50 rounded p-2">
              <div class="text-xs text-gray-500">Manager</div>
              <div class="text-sm font-semibold text-gray-900">{{ emp?.manager || '—' }}</div>
            </div>
          </div>
        </div>

        <!-- Back button -->
        <div>
          <button @click="router.back()" class="btn btn-secondary">← Indietro</button>
        </div>
      </div>
    </div>

    <!-- TIMELINE Section -->
    <div class="card">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">📅 Timeline Onboarding & Valutazioni</h3>
      </div>
      <div class="p-6">
        <div class="space-y-6">
          <!-- Assunzione -->
          <div class="flex gap-4">
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">✓</div>
              <div class="w-0.5 h-12 bg-gray-200 my-2"></div>
            </div>
            <div class="flex-1 pt-1">
              <div class="font-semibold text-gray-900">Assunzione</div>
              <div class="text-sm text-gray-600">{{ emp?.dataAssunzione ? fmtDateShort(emp.dataAssunzione) : 'N/A' }}</div>
            </div>
          </div>

          <!-- FU1 (30gg) -->
          <div v-if="emp?.team !== 'Freelance'" class="flex gap-4">
            <div class="flex flex-col items-center">
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                emp?.statoFU1 === 'Fatto' ? 'bg-emerald-500' : emp?.statoFU1 === 'In Corso' ? 'bg-amber-500' : 'bg-red-500']">
                {{ emp?.statoFU1 === 'Fatto' ? '✓' : '!' }}
              </div>
              <div class="w-0.5 h-12 bg-gray-200 my-2"></div>
            </div>
            <div class="flex-1 pt-1">
              <div class="font-semibold text-gray-900">FU1 (30 giorni)</div>
              <div v-if="emp?.statoFU1 === 'Da Fare' && emp?.scadenzaFU1" class="text-sm text-gray-600">{{ fmtDateShort(emp.scadenzaFU1) }}</div>
              <div class="text-xs mt-1">
                <span :class="['font-medium', emp?.statoFU1 === 'Fatto' ? 'text-emerald-600' : emp?.statoFU1 === 'Da Fare' ? 'text-red-600' : 'text-gray-700']">{{ emp?.statoFU1 || 'Da Fare' }}</span>
              </div>
              <div v-if="emp?.noteFU1" class="text-xs text-gray-600 mt-1 italic">{{ emp.noteFU1 }}</div>
            </div>
          </div>

          <!-- FU2 Manager (45gg) -->
          <div v-if="emp?.team !== 'Freelance'" class="flex gap-4">
            <div class="flex flex-col items-center">
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                emp?.statoFU2Manager === 'Fatto' ? 'bg-emerald-500' : emp?.statoFU2Manager === 'In Corso' ? 'bg-amber-500' : emp?.statoFU2Manager === 'Da Fare' ? 'bg-red-500' : 'bg-gray-400']">
                {{ emp?.statoFU2Manager === 'Fatto' ? '✓' : emp?.statoFU2Manager === 'Da Fare' ? '!' : '—' }}
              </div>
              <div class="w-0.5 h-12 bg-gray-200 my-2"></div>
            </div>
            <div class="flex-1 pt-1">
              <div class="font-semibold text-gray-900">FU2 Manager (45 giorni)</div>
              <div v-if="emp?.statoFU2Manager === 'Da Fare' && emp?.scadenzaFU2Manager" class="text-sm text-gray-600">{{ fmtDateShort(emp.scadenzaFU2Manager) }}</div>
              <div class="text-xs mt-1">
                <span :class="['font-medium', emp?.statoFU2Manager === 'Fatto' ? 'text-emerald-600' : emp?.statoFU2Manager === 'Da Fare' ? 'text-red-600' : 'text-gray-700']">{{ emp?.statoFU2Manager || 'Da Fare' }}</span>
              </div>
            </div>
          </div>

          <!-- FU2 Dipendente (Fine prova - 30gg) -->
          <div v-if="emp?.team !== 'Freelance'" class="flex gap-4">
            <div class="flex flex-col items-center">
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                emp?.statoFU2Dip === 'Fatto' ? 'bg-emerald-500' : emp?.statoFU2Dip === 'In Corso' ? 'bg-amber-500' : emp?.statoFU2Dip === 'Da Fare' ? 'bg-red-500' : 'bg-gray-400']">
                {{ emp?.statoFU2Dip === 'Fatto' ? '✓' : emp?.statoFU2Dip === 'Da Fare' ? '!' : '—' }}
              </div>
              <div class="w-0.5 h-12 bg-gray-200 my-2"></div>
            </div>
            <div class="flex-1 pt-1">
              <div class="font-semibold text-gray-900">FU2 Follow-up Dipendente</div>
              <div v-if="emp?.statoFU2Dip === 'Da Fare' && emp?.scadenzaFU2" class="text-sm text-gray-600">{{ fmtDateShort(emp.scadenzaFU2) }}</div>
              <div class="text-xs mt-1">
                <span :class="['font-medium', emp?.statoFU2Dip === 'Fatto' ? 'text-emerald-600' : emp?.statoFU2Dip === 'Da Fare' ? 'text-red-600' : 'text-gray-700']">{{ emp?.statoFU2Dip || 'Da Fare' }}</span>
              </div>
            </div>
          </div>

          <!-- Fine Prova -->
          <div class="flex gap-4">
            <div class="flex flex-col items-center">
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                emp?.esitoProva === 'Superato' ? 'bg-emerald-500' : emp?.esitoProva === 'In Corso' ? 'bg-blue-500' : 'bg-orange-500']">
                {{ emp?.esitoProva === 'Superato' ? '✓' : emp?.esitoProva === 'Non Superato' ? '✗' : '—' }}
              </div>
              <div v-if="emp?.esitoProva === 'Superato'" class="w-0.5 h-12 bg-gray-200 my-2"></div>
            </div>
            <div class="flex-1 pt-1">
              <div class="font-semibold text-gray-900">Fine Periodo di Prova</div>
              <div class="text-sm text-gray-600">{{ emp?.fineProva ? fmtDateShort(emp.fineProva) : 'N/A' }}</div>
              <div :class="['text-xs font-medium mt-1', emp?.esitoProva === 'Superato' ? 'text-emerald-600' : emp?.esitoProva === 'Non Superato' ? 'text-red-600' : 'text-gray-700']">
                Esito: {{ emp?.esitoProva || 'In Corso' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TRIAL PERIOD EVALUATION Section -->
    <div v-if="emp?.esitoProva === 'Superato' || emp?.esitoProva === 'Non Superato'" class="card">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">🎯 Valutazione Periodo di Prova</h3>
      </div>
      <div class="p-6 space-y-6">
        <!-- Manager Evaluation -->
        <div v-if="emp?.valutazionePeriodoProva?.manager" class="bg-blue-50 rounded-lg p-5 border border-blue-200">
          <h4 class="font-semibold text-blue-900 mb-3">👨‍💼 Valutazione Manager/Responsabile Tecnico</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
            <div class="bg-white p-2 rounded"><strong>Competenze:</strong> {{ emp.valutazionePeriodoProva.manager.competenze }}/5</div>
            <div class="bg-white p-2 rounded"><strong>Qualità:</strong> {{ emp.valutazionePeriodoProva.manager.qualita }}/5</div>
            <div class="bg-white p-2 rounded"><strong>P. Solving:</strong> {{ emp.valutazionePeriodoProva.manager.problemSolving }}/5</div>
            <div class="bg-white p-2 rounded"><strong>Velocità:</strong> {{ emp.valutazionePeriodoProva.manager.velocita }}/5</div>
            <div class="bg-white p-2 rounded"><strong>Collaborazione:</strong> {{ emp.valutazionePeriodoProva.manager.collaborazione }}/5</div>
            <div class="bg-white p-2 rounded"><strong>Comunicazione:</strong> {{ emp.valutazionePeriodoProva.manager.comunicazione }}/5</div>
            <div class="bg-white p-2 rounded"><strong>Attitudine:</strong> {{ emp.valutazionePeriodoProva.manager.attitudine }}/5</div>
          </div>
          <div class="text-xs space-y-2">
            <p><strong>Raccomandazione:</strong> {{ emp.valutazionePeriodoProva.manager.raccomandazione }}</p>
            <p v-if="emp.valutazionePeriodoProva.manager.osservazioni"><strong>Osservazioni:</strong> {{ emp.valutazionePeriodoProva.manager.osservazioni }}</p>
          </div>
        </div>

        <!-- HR Validation -->
        <div v-if="emp?.valutazionePeriodoProva?.hr" class="bg-purple-50 rounded-lg p-5 border border-purple-200">
          <h4 class="font-semibold text-purple-900 mb-3">👩‍💼 Validazione HR</h4>
          <div class="space-y-2 text-sm">
            <p><strong>Data validazione:</strong> {{ emp.valutazionePeriodoProva.hr.data ? fmtDateShort(emp.valutazionePeriodoProva.hr.data) : '—' }}</p>
            <p><strong>Voto HR (1-10):</strong> {{ emp.valutazionePeriodoProva.hr.voto }}/10</p>
            <p v-if="emp.valutazionePeriodoProva.hr.commento"><strong>Commento:</strong> {{ emp.valutazionePeriodoProva.hr.commento }}</p>
          </div>
        </div>

        <!-- CEO Decision -->
        <div v-if="emp?.valutazionePeriodoProva?.ceo" class="bg-amber-50 rounded-lg p-5 border border-amber-200">
          <h4 class="font-semibold text-amber-900 mb-3">👑 Decisione CEO</h4>
          <div class="space-y-2 text-sm">
            <p><strong>Data decisione:</strong> {{ emp.valutazionePeriodoProva.ceo.data ? fmtDateShort(emp.valutazionePeriodoProva.ceo.data) : '—' }}</p>
            <p :class="['font-bold',
              emp.valutazionePeriodoProva.ceo.decisione === 'Confermare il dipendente' ? 'text-emerald-700' :
              emp.valutazionePeriodoProva.ceo.decisione === 'Proroga temporanea' ? 'text-yellow-700' : 'text-red-700']">
              <strong>Decisione:</strong> {{ emp.valutazionePeriodoProva.ceo.decisione }}
            </p>
            <p v-if="emp.valutazionePeriodoProva.ceo.motivazione"><strong>Motivazione:</strong> {{ emp.valutazionePeriodoProva.ceo.motivazione }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CONTRACT DETAILS Section -->
    <div class="card">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">📋 Dettagli Contratto</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gray-50 p-3 rounded">
            <div class="text-xs text-gray-500">Tipo Contratto</div>
            <div class="font-semibold text-gray-900 mt-1">{{ emp?.tipoContratto || '—' }}</div>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <div class="text-xs text-gray-500">Data Inizio</div>
            <div class="font-semibold text-gray-900 mt-1">{{ emp?.dataAssunzione ? fmtDateShort(emp.dataAssunzione) : '—' }}</div>
          </div>
          <div v-if="emp?.tipoContratto === 'determinato'" class="bg-gray-50 p-3 rounded">
            <div class="text-xs text-gray-500">Scadenza Contratto</div>
            <div class="font-semibold text-gray-900 mt-1">{{ emp?.scadenzaContratto ? fmtDateShort(emp.scadenzaContratto) : '—' }}</div>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <div class="text-xs text-gray-500">Stato</div>
            <div :class="['font-semibold mt-1', emp?.stato === 'Attivo' ? 'text-emerald-700' : 'text-gray-700']">{{ emp?.stato || '—' }}</div>
          </div>
        </div>

        <!-- Exit info if not active -->
        <div v-if="emp?.stato !== 'Attivo'" class="mt-4 bg-orange-50 p-4 rounded border border-orange-200">
          <div class="text-sm font-semibold text-orange-900 mb-2">Informazioni Uscita</div>
          <div class="text-sm space-y-1 text-orange-800">
            <p><strong>Data uscita:</strong> {{ emp?.dataUscita ? fmtDateShort(emp.dataUscita) : '—' }}</p>
            <p><strong>Motivo:</strong> {{ emp?.motivoUscita || '—' }}</p>
            <p v-if="emp?.noteUscita"><strong>Note:</strong> {{ emp.noteUscita }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CONTRACT RENEWAL STATUS Section (for determinati only) -->
    <div v-if="emp?.tipoContratto === 'determinato'" class="card">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">📌 Stato Rinnovo Contratto</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 gap-4">
          <!-- Rinnovo Status -->
          <div class="bg-blue-50 p-4 rounded border border-blue-200">
            <div class="text-sm font-semibold text-blue-900 mb-2">Rinnovo Contratto</div>
            <div v-if="emp?.decisione" class="space-y-2">
              <p class="text-sm"><strong>Decisione:</strong> {{ emp.decisione }}</p>
              <p class="text-sm"><strong>Data:</strong> {{ fmtDateShort(emp.dataDecisioneRinnovo) }}</p>
              <p v-if="emp.noteDecisioneRinnovo" class="text-xs text-blue-800 italic">{{ emp.noteDecisioneRinnovo }}</p>
              <p v-if="emp.decisione === 'Proroga'" class="text-sm font-medium text-amber-700">
                Proroga fino: {{ fmtDateShort(emp.dataProrogaFino) }}
              </p>
            </div>
            <div v-else class="text-sm text-blue-700">
              Decisione non ancora registrata
            </div>
            <div v-if="emp?.scadenzaRinnovo" class="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-800">
              <strong>Scadenza Rinnovo:</strong> {{ fmtDateShort(emp.scadenzaRinnovo) }}
            </div>
          </div>

          <!-- Dossier Status -->
          <div class="bg-purple-50 p-4 rounded border border-purple-200">
            <div class="text-sm font-semibold text-purple-900 mb-2">Dossier Contratto</div>
            <div class="space-y-2">
              <p class="text-sm"><strong>Stato:</strong> {{ emp?.statoDossierContratto || 'Da Fare' }}</p>
              <p v-if="emp?.scadenzaDossierContratto" class="text-sm"><strong>Scadenza:</strong> {{ fmtDateShort(emp.scadenzaDossierContratto) }}</p>
              <p v-else class="text-sm text-gray-600">Nessuna scadenza registrata</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- P&C COLLOQUI Section -->
    <div v-if="emp?.stato === 'Attivo'" class="card">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">📋 Colloqui P&C (People & Culture)</h3>
      </div>
      <div class="p-6">
        <div v-if="pcData" class="space-y-6">
          <!-- Last P&C Colloquio -->
          <div v-if="pcData.lastDate" class="bg-green-50 p-4 rounded border border-green-200">
            <div class="text-sm font-semibold text-green-900 mb-3">Ultimo Colloquio P&C</div>
            <div class="grid grid-cols-3 gap-3 mb-3">
              <div class="text-sm">
                <div class="text-xs text-green-700">Data</div>
                <div class="font-semibold text-green-900">{{ fmtDateShort(pcData.lastDate) }}</div>
              </div>
              <div class="text-sm">
                <div class="text-xs text-green-700">Giorni fa</div>
                <div class="font-semibold text-green-900">{{ pcData.daysSinceColloquio }}</div>
              </div>
              <div class="text-sm">
                <div class="text-xs text-green-700">Prossimo</div>
                <div class="font-semibold text-green-900">{{ pcData.nextReviewDate ? fmtDateShort(pcData.nextReviewDate) : 'Da pianificare' }}</div>
              </div>
            </div>

            <!-- Behavioral Scores from last colloquio -->
            <div v-if="lastColloquio" class="grid grid-cols-3 gap-2 text-xs mt-4 pt-4 border-t border-green-200">
              <div class="bg-white p-2 rounded"><strong>Esaurimento:</strong> {{ lastColloquio.esaur }}/5</div>
              <div class="bg-white p-2 rounded"><strong>Carico:</strong> {{ lastColloquio.carico }}/5</div>
              <div class="bg-white p-2 rounded"><strong>Motivazione:</strong> {{ lastColloquio.motiv }}/5</div>
              <div class="bg-white p-2 rounded"><strong>Supporto:</strong> {{ lastColloquio.supp }}/5</div>
              <div class="bg-white p-2 rounded"><strong>Equilibrio:</strong> {{ lastColloquio.equil }}/5</div>
              <div class="bg-white p-2 rounded"><strong>Intenzione:</strong> {{ lastColloquio.intent }}/5</div>
            </div>

            <!-- Manager Assessment -->
            <div v-if="lastColloquio && (lastColloquio.performanceScore || lastColloquio.engagementScore)" class="grid grid-cols-2 gap-2 text-xs mt-3">
              <div v-if="lastColloquio.performanceScore" class="bg-white p-2 rounded">
                <strong>Performance Score:</strong> {{ lastColloquio.performanceScore }}/5
              </div>
              <div v-if="lastColloquio.engagementScore" class="bg-white p-2 rounded">
                <strong>Engagement Score:</strong> {{ lastColloquio.engagementScore }}/5
              </div>
            </div>

            <!-- Notes -->
            <div v-if="lastColloquio && lastColloquio.noteColloquio" class="text-xs text-gray-700 mt-3 italic">
              {{ lastColloquio.noteColloquio }}
            </div>
          </div>

          <!-- Status Badge -->
          <div :class="['p-3 rounded text-sm font-semibold',
            pcData.status === 'Aggiornato' ? 'bg-green-100 text-green-800' :
            pcData.status === 'Scaduto' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800']">
            Status: {{ pcData.status === 'Aggiornato' ? '✓ Aggiornato' : pcData.status === 'Scaduto' ? '⚠️ Scaduto' : '❌ Non Fatto' }}
          </div>
        </div>

        <div v-else class="text-sm text-gray-600">
          Nessun colloquio P&C registrato per questo dipendente
        </div>
      </div>
    </div>

    <!-- PERSONAL DETAILS Section -->
    <div class="card">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">👤 Dati Anagrafici</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div class="text-xs text-gray-500">Nome</div>
            <div class="font-semibold text-gray-900 mt-1">{{ emp?.nome || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Cognome</div>
            <div class="font-semibold text-gray-900 mt-1">{{ emp?.cognome || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Città</div>
            <div class="font-semibold text-gray-900 mt-1">{{ emp?.citta || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Email</div>
            <div class="font-semibold text-gray-900 mt-1">{{ emp?.email || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Telefono</div>
            <div class="font-semibold text-gray-900 mt-1">{{ emp?.telefono || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Livello CCNL</div>
            <div class="font-semibold text-gray-900 mt-1">{{ emp?.livelloCCNL || '—' }}</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'

const router = useRouter()
const route = useRoute()
const store = useHrStore()
const { fmtDateShort } = useHelpers()

const empId = parseInt(route.params.id)
const emp = computed(() => store.employees.find(e => e.id === empId))

// P&C Colloquio data
const pcData = computed(() => {
  if (!emp.value) return null
  return store.pcColloquiStatus[emp.value.id] || null
})

// Last P&C Colloquio details
const lastColloquio = computed(() => {
  if (!emp.value) return null
  return store.colloquiPCMap[emp.value.nome] || null
})

function initials(nome) {
  return nome.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
</script>
