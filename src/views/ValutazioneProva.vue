<template>
  <div class="p-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">🎯 Valutazione Periodi di Prova</h2>
        <p class="text-sm text-gray-500 mt-1">Manager → HR → CEO: Scala dettagliata (1-5) + Raccomandazione</p>
      </div>
      <div class="text-right">
        <div class="text-3xl font-bold text-primary-600">{{ allVisibili.length }}</div>
        <div class="text-xs text-gray-500">dipendenti (esclusi freelance)</div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
      <div class="card p-4 border-l-4 border-blue-500 bg-blue-50">
        <div class="text-xs text-blue-600 font-semibold uppercase">In Corso</div>
        <div class="text-2xl font-bold text-blue-700 mt-1">{{ inCorso.length }}</div>
      </div>
      <div class="card p-4 border-l-4 border-red-500 bg-red-50">
        <div class="text-xs text-red-600 font-semibold uppercase">Scaduti</div>
        <div class="text-2xl font-bold text-red-700 mt-1">{{ scaduti.length }}</div>
      </div>
      <div class="card p-4 border-l-4 border-orange-500 bg-orange-50">
        <div class="text-xs text-orange-600 font-semibold uppercase">Entro 7gg</div>
        <div class="text-2xl font-bold text-orange-700 mt-1">{{ entro7gg.length }}</div>
      </div>
      <div class="card p-4 border-l-4 border-yellow-500 bg-yellow-50">
        <div class="text-xs text-yellow-600 font-semibold uppercase">Entro 30gg</div>
        <div class="text-2xl font-bold text-yellow-700 mt-1">{{ entro30gg.length }}</div>
      </div>
      <div class="card p-4 border-l-4 border-purple-500 bg-purple-50">
        <div class="text-xs text-purple-600 font-semibold uppercase">Contratti a termine</div>
        <div class="text-2xl font-bold text-purple-700 mt-1">{{ determinatiInScadenza.length }}</div>
        <div class="text-[10px] text-purple-500">scadenza ≤ 30gg</div>
      </div>
      <div class="card p-4 border-l-4 border-emerald-500 bg-emerald-50">
        <div class="text-xs text-emerald-600 font-semibold uppercase">Completate</div>
        <div class="text-2xl font-bold text-emerald-700 mt-1">{{ completate.length }}</div>
      </div>
    </div>

    <!-- Context Banners (if employee pre-selected from ContrattiTermine) -->
    <div v-if="selectedEmployee" class="space-y-3">
      <!-- Contract Deadline Banner -->
      <div v-if="hasContractDeadline" class="card bg-orange-50 border-l-4 border-orange-500 p-4">
        <div class="flex items-start gap-3">
          <div class="text-2xl">⚡</div>
          <div class="flex-1">
            <h4 class="font-semibold text-orange-900 mb-1">Contratto a Termine in Scadenza</h4>
            <p class="text-sm text-orange-800 mb-3">
              {{ selectedEmployee.nome }} {{ selectedEmployee.cognome }} ha contratto che scade il {{ fmtDateShort(selectedEmployee.scadenzaContratto) }}.
              La valutazione della prova influenzerà la decisione di rinnovo.
            </p>
            <button @click="goToContractRenewal" class="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition">
              → Vai al Rinnovo Contratto
            </button>
          </div>
        </div>
      </div>

      <!-- P&C Colloquio Banner -->
      <div v-if="hasMissingPCColloquio" class="card bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div class="flex items-start gap-3">
          <div class="text-2xl">📋</div>
          <div class="flex-1">
            <h4 class="font-semibold text-yellow-900 mb-1">P&C Colloquio Scaduto o Mancante</h4>
            <p class="text-sm text-yellow-800 mb-3">
              {{ selectedEmployee.nome }} {{ selectedEmployee.cognome }} non ha colloquio P&C recente.
              Consigliato: completa la valutazione e poi schedula il P&C.
            </p>
            <button @click="goToPCColloquio" class="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition">
              → Aggiungi P&C Colloquio
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri -->
    <div class="flex flex-wrap items-center gap-3">
      <input v-model="search" class="form-input max-w-xs" placeholder="🔍 Cerca dipendente...">
      <select v-model="filterTeam" class="form-select w-44">
        <option value="">Tutti i team</option>
        <option v-for="t in getTeamsExcludingFreelance" :key="t">{{ t }}</option>
      </select>
      <select v-model="filterStatus" class="form-select w-44">
        <option value="">Tutti gli stati</option>
        <option value="scaduti">Scaduti</option>
        <option value="urgenti">Entro 7 giorni</option>
        <option value="attenzione">Entro 30 giorni</option>
        <option value="ok">In corso</option>
        <option value="determinati">📄 Contratti a termine</option>
        <option value="completate">Completate</option>
      </select>
    </div>

    <!-- Elenco dipendenti -->
    <div class="space-y-4">
      <div v-if="filtered.length === 0" class="card p-8 text-center text-gray-400">
        Nessun dipendente corrisponde ai criteri selezionati (i freelance sono esclusi)
      </div>

      <div v-for="emp in filtered" :key="emp.id" class="card overflow-hidden">
        <!-- Header -->
        <div class="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleExpanded(emp.id)">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
              :class="emp._isDeterminato ? 'bg-purple-100 text-purple-700' : 'bg-primary-100 text-primary-700'">
              {{ initials(emp.nome) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900">
                {{ emp.nome }} {{ emp.cognome }}
                <span v-if="emp._isDeterminato" class="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">📄 Determinato</span>
              </div>
              <div class="text-xs text-gray-500">{{ emp.team }} · {{ emp.livelloCCNL }}</div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <!-- Scadenza contratto (per determinati) -->
            <div v-if="emp._isDeterminato && emp.scadenzaContratto" class="text-right">
              <div class="text-xs text-purple-500">Scad. contratto</div>
              <div class="font-mono text-sm font-bold" :class="{'text-red-600': emp._daysToContratto <= 0, 'text-orange-600': emp._daysToContratto <= 7, 'text-purple-600': emp._daysToContratto <= 30}">
                {{ fmtDateShort(emp.scadenzaContratto) }}
              </div>
              <div class="text-xs text-gray-500">{{ emp._daysToContratto }}gg</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-400">Fine prova</div>
              <div class="font-mono text-sm font-bold" :class="{'text-red-600': emp.daysToProva <= 0, 'text-orange-600': emp.daysToProva <= 7, 'text-yellow-600': emp.daysToProva <= 30}">
                {{ fmtDateShort(emp.fineProva) }}
              </div>
              <div class="text-xs text-gray-500">{{ emp.daysToProva != null ? emp.daysToProva + 'gg' : '—' }}</div>
            </div>
            <svg :class="['w-5 h-5 transition-transform', expanded.includes(emp.id) ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        <!-- Expanded Content -->
        <div v-if="expanded.includes(emp.id)" class="px-5 py-4 bg-white space-y-6 border-t border-gray-100">
          <!-- Esito Periodo di Prova -->
          <div :class="['rounded-lg p-5 border', emp.esitoProva === 'Superato' ? 'bg-emerald-50 border-emerald-200' : emp.esitoProva === 'Non Superato' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200']">
            <div class="flex items-center justify-between mb-4">
              <h4 :class="['font-semibold', emp.esitoProva === 'Superato' ? 'text-emerald-900' : emp.esitoProva === 'Non Superato' ? 'text-red-900' : 'text-amber-900']">🎯 Esito Periodo di Prova</h4>
              <button @click="toggleEsitoEdit(emp.id)" :class="['text-xs font-medium', emp.esitoProva === 'Superato' ? 'text-emerald-600 hover:text-emerald-800' : emp.esitoProva === 'Non Superato' ? 'text-red-600 hover:text-red-800' : 'text-amber-600 hover:text-amber-800']">
                ✎ Modifica
              </button>
            </div>

            <div v-if="!esitoEditMode.includes(emp.id)" :class="['text-sm', emp.esitoProva === 'Superato' ? 'text-emerald-700' : emp.esitoProva === 'Non Superato' ? 'text-red-700' : 'text-amber-700']">
              <strong>Esito attuale:</strong> {{ emp.esitoProva }}
            </div>

            <div v-else class="space-y-3">
              <select v-model="tempEsitoProva" class="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="In Corso">In Corso</option>
                <option value="Superato">Superato</option>
                <option value="Non Superato">Non Superato</option>
              </select>
              <div class="flex gap-2">
                <button @click="saveEsito(emp, tempEsitoProva)" class="btn btn-sm btn-primary">Salva</button>
                <button @click="toggleEsitoEdit(emp.id)" class="btn btn-sm btn-secondary">Annulla</button>
              </div>
            </div>
          </div>

          <!-- Manager Evaluation -->
          <div class="bg-blue-50 rounded-lg p-5 border border-blue-200">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-semibold text-blue-900">👨‍💼 Stima Preliminare Manager (45gg prima)</h4>
              <div class="flex gap-2">
                <button v-if="!getManagerEvaluation(emp.id, 'prima')" @click="openEvaluation(emp, 'valutazione-prima')" class="btn btn-sm btn-primary">
                  Aggiungi valutazione
                </button>
                <button v-else @click="openEvaluation(emp, 'valutazione-prima')" class="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  ✎ Modifica
                </button>
              </div>
            </div>

            <div v-if="!getManagerEvaluation(emp.id, 'prima')" class="text-sm text-blue-700">
              Valutazione non ancora compilata
            </div>
            <div v-else class="space-y-3" data-ai-result>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div class="bg-white p-2 rounded"><strong>Competenze:</strong> {{ getManagerEvaluation(emp.id, 'prima').competenze }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Qualità:</strong> {{ getManagerEvaluation(emp.id, 'prima').qualita }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Problem Solving:</strong> {{ getManagerEvaluation(emp.id, 'prima').problemSolving }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Velocità:</strong> {{ getManagerEvaluation(emp.id, 'prima').velocita }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Collaborazione:</strong> {{ getManagerEvaluation(emp.id, 'prima').collaborazione }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Comunicazione:</strong> {{ getManagerEvaluation(emp.id, 'prima').comunicazione }}/5</div>
                <div class="bg-white p-2 rounded col-span-2"><strong>Attitudine:</strong> {{ getManagerEvaluation(emp.id, 'prima').attitudine }}/5</div>
              </div>
              <div class="bg-white p-3 rounded text-sm">
                <strong>Raccomandazione:</strong> {{ getManagerEvaluation(emp.id, 'prima').raccomandazione }}
              </div>
            </div>
          </div>

          <!-- Manager Final Evaluation -->
          <div class="bg-rose-50 rounded-lg p-5 border border-rose-200">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-semibold text-rose-900">👨‍💼 Valutazione Finale Manager (45gg dopo)</h4>
              <div class="flex gap-2">
                <button v-if="!getManagerEvaluation(emp.id, 'finale')" @click="openEvaluation(emp, 'valutazione-finale')" class="btn btn-sm btn-primary" :disabled="!getManagerEvaluation(emp.id, 'prima')">
                  Aggiungi valutazione
                </button>
                <button v-else @click="openEvaluation(emp, 'valutazione-finale')" class="text-xs text-rose-600 hover:text-rose-800 font-medium">
                  ✎ Modifica
                </button>
              </div>
            </div>

            <div v-if="!getManagerEvaluation(emp.id, 'prima')" class="text-sm text-rose-700 bg-rose-100 p-2 rounded">
              ⚠️ Completare prima la stima preliminare
            </div>
            <div v-else-if="!getManagerEvaluation(emp.id, 'finale')" class="text-sm text-rose-700">
              Valutazione non ancora compilata
            </div>
            <div v-else class="space-y-3" data-ai-result>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div class="bg-white p-2 rounded"><strong>Competenze:</strong> {{ getManagerEvaluation(emp.id, 'finale').competenze }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Qualità:</strong> {{ getManagerEvaluation(emp.id, 'finale').qualita }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Problem Solving:</strong> {{ getManagerEvaluation(emp.id, 'finale').problemSolving }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Velocità:</strong> {{ getManagerEvaluation(emp.id, 'finale').velocita }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Collaborazione:</strong> {{ getManagerEvaluation(emp.id, 'finale').collaborazione }}/5</div>
                <div class="bg-white p-2 rounded"><strong>Comunicazione:</strong> {{ getManagerEvaluation(emp.id, 'finale').comunicazione }}/5</div>
                <div class="bg-white p-2 rounded col-span-2"><strong>Attitudine:</strong> {{ getManagerEvaluation(emp.id, 'finale').attitudine }}/5</div>
              </div>
              <div class="bg-white p-3 rounded text-sm">
                <strong>Raccomandazione:</strong> {{ getManagerEvaluation(emp.id, 'finale').raccomandazione }}
              </div>
            </div>
          </div>

          <!-- HR Evaluation -->
          <div class="bg-purple-50 rounded-lg p-5 border border-purple-200">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-semibold text-purple-900">👩‍💼 Validazione HR</h4>
              <button v-if="!getHRValidation(emp.id)" @click="openEvaluation(emp, 'hr')" class="btn btn-sm btn-primary" :disabled="!getManagerEvaluation(emp.id)">
                Valida
              </button>
              <button v-else @click="openEvaluation(emp, 'hr')" class="text-xs text-purple-600 hover:text-purple-800 font-medium">
                ✎ Modifica
              </button>
            </div>

            <div v-if="!getManagerEvaluation(emp.id)" class="text-sm text-purple-700 bg-purple-100 p-2 rounded">
              ⚠️ Completare prima la valutazione del Manager
            </div>
            <div v-else-if="!getHRValidation(emp.id)" class="text-sm text-purple-700">
              In attesa di validazione HR
            </div>
            <div v-else class="space-y-2">
              <div class="bg-white p-3 rounded text-sm">
                <strong>Data validazione:</strong> {{ fmtDateShort(getHRValidation(emp.id).data) }}
              </div>
              <div class="bg-white p-3 rounded text-sm">
                <strong>Voto HR (1-10):</strong> {{ getHRValidation(emp.id).voto }}
              </div>
              <div class="bg-white p-3 rounded text-sm">
                <strong>Commento HR:</strong> {{ getHRValidation(emp.id).commento }}
              </div>
            </div>
          </div>

          <!-- CEO Decision -->
          <div class="bg-amber-50 rounded-lg p-5 border border-amber-200">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-semibold text-amber-900">👑 Decisione CEO</h4>
              <button v-if="!getCEODecision(emp.id)" @click="openEvaluation(emp, 'ceo')" class="btn btn-sm btn-primary" :disabled="!getHRValidation(emp.id)">
                Registra decisione
              </button>
              <button v-else @click="openEvaluation(emp, 'ceo')" class="text-xs text-amber-600 hover:text-amber-800 font-medium">
                ✎ Modifica
              </button>
            </div>

            <div v-if="!getHRValidation(emp.id)" class="text-sm text-amber-700 bg-amber-100 p-2 rounded">
              ⚠️ Completare prima la validazione HR
            </div>
            <div v-else-if="!getCEODecision(emp.id)" class="text-sm text-amber-700">
              In attesa di decisione CEO
            </div>
            <div v-else class="space-y-2">
              <div class="bg-white p-3 rounded text-sm">
                <strong>Data decisione:</strong> {{ fmtDateShort(getCEODecision(emp.id).data) }}
              </div>
              <div :class="['bg-white p-3 rounded text-sm font-bold', getCEODecision(emp.id).decisione === 'Confermare' ? 'text-emerald-700' : getCEODecision(emp.id).decisione === 'Proroga temporanea' ? 'text-yellow-700' : 'text-red-700']">
                <strong>Decisione:</strong> {{ getCEODecision(emp.id).decisione }}
              </div>
              <div class="bg-white p-3 rounded text-sm">
                <strong>Motivazione:</strong> {{ getCEODecision(emp.id).motivazione }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- INFO BANNER -->
    <div class="card bg-blue-50 border-l-4 border-blue-500 p-4">
      <div class="flex items-start gap-3">
        <div class="text-2xl pt-1">ℹ️</div>
        <div>
          <h4 class="font-semibold text-blue-900 mb-1">Processo di Valutazione della Prova</h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>� <strong>Stima Preliminare Manager (45gg prima):</strong> Valutazione iniziale senza obbligo di conferma</li>
            <li>📝 <strong>Valutazione Finale Manager (45gg dopo):</strong> Valutazione definitiva dopo fine prova per decisione conferma/proroga</li>
            <li>🔵 <strong>HR:</strong> Valida con voto 1-10 + commento + approvazione finale</li>
            <li>👑 <strong>CEO:</strong> Decisione finale con motivazione (Rinnovo / Proroga / Conclusione)</li>
            <li>📋 <strong>Freelance:</strong> Esclusi da questo processo - gestiti solo in "Contratti a Termine"</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL EVALUATION -->
  <Modal :open="modal.open" @close="modal.open = false" width="max-w-4xl">
    <template #header>{{ getModalTitle() }}</template>
    <div class="space-y-4 py-4 max-h-96 overflow-y-auto">
      <!-- Dipendente info -->
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p class="text-sm font-medium text-gray-900">{{ modal.emp?.nome }} {{ modal.emp?.cognome }}</p>
        <p class="text-xs text-gray-600">{{ modal.emp?.team }} · {{ modal.emp?.livelloCCNL }}</p>
      </div>

      <!-- Manager Evaluation Form -->
      <div v-if="modal.tipo === 'valutazione-prima' || modal.tipo === 'valutazione-finale'" class="space-y-4">
        <h4 class="font-semibold text-gray-900 mb-2">
          {{ modal.tipo === 'valutazione-prima' ? '📋 Stima Preliminare (45gg prima fine prova)' : '📝 Valutazione Finale (45gg dopo fine prova)' }}
        </h4>
        <h5 class="font-semibold text-gray-900">Scala di Valutazione (1-5)</h5>

        <!-- Competenze Tecniche -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">1. Competenze Tecniche</label>
          <input v-model.number="evalForm.competenze" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.competenze }}/5</div>
          <textarea v-model="evalForm.competenzeNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Qualità del Lavoro -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">2. Qualità del Lavoro (precisione, autonomia, affidabilità)</label>
          <input v-model.number="evalForm.qualita" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.qualita }}/5</div>
          <textarea v-model="evalForm.qualitaNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Problem Solving -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">3. Capacità di Problem-Solving</label>
          <input v-model.number="evalForm.problemSolving" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.problemSolving }}/5</div>
          <textarea v-model="evalForm.problemSolvingNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Velocità di Apprendimento -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">4. Velocità di Apprendimento</label>
          <input v-model.number="evalForm.velocita" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.velocita }}/5</div>
          <textarea v-model="evalForm.velocitaNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Collaborazione -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">5. Collaborazione e Teamwork</label>
          <input v-model.number="evalForm.collaborazione" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.collaborazione }}/5</div>
          <textarea v-model="evalForm.collaborazioneNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Comunicazione -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">6. Comunicazione (chiarezza, proattività, disponibilità)</label>
          <input v-model.number="evalForm.comunicazione" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.comunicazione }}/5</div>
          <textarea v-model="evalForm.comunicazioneNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Attitudine -->
        <div class="border border-gray-200 p-3 rounded">
          <label class="block text-sm font-medium text-gray-700 mb-1">7. Attitudine e Cultura Aziendale (allineamento valori, atteggiamento, spirito iniziativa)</label>
          <input v-model.number="evalForm.attitudine" type="range" min="1" max="5" class="w-full">
          <div class="text-sm text-gray-600 mt-1">Voto: {{ evalForm.attitudine }}/5</div>
          <textarea v-model="evalForm.attitudineNote" class="form-textarea mt-2" rows="2" placeholder="Commento qualitativo..."></textarea>
        </div>

        <!-- Osservazioni Generali -->
        <div>
          <label class="form-label">Osservazioni Generali (performance, atteggiamento, collaborazione, punti di forza, aree attenzione)</label>
          <textarea v-model="evalForm.osservazioni" class="form-textarea" rows="3" placeholder="Valutazione discorsiva..."></textarea>
        </div>

        <!-- Raccomandazione -->
        <div>
          <label class="form-label">Raccomandazione del Responsabile Tecnico</label>
          <select v-model="evalForm.raccomandazione" class="form-select">
            <option>Confermare il dipendente</option>
            <option>Proroga temporanea</option>
            <option>Non confermare</option>
          </select>
          <textarea v-model="evalForm.motivazioneRaccomandazione" class="form-textarea mt-2" rows="2" placeholder="Motivazione dettagliata..."></textarea>
        </div>

        <!-- Suggerimenti -->
        <div>
          <label class="form-label">Suggerimenti o Necessità (formazione, supporto, cambi ruolo, affiancamento, ecc.)</label>
          <textarea v-model="evalForm.suggerimenti" class="form-textarea" rows="2" placeholder="Suggerimenti..."></textarea>
        </div>

        <!-- Aree di Miglioramento -->
        <div>
          <label class="form-label">Aree di Miglioramento e Punti di Forza</label>
          <textarea v-model="evalForm.areaeMiglioramento" class="form-textarea" rows="2" placeholder="Analisi..."></textarea>
        </div>
      </div>

      <!-- HR Validation Form -->
      <div v-else-if="modal.tipo === 'hr'" class="space-y-4">
        <!-- Manager Evaluation Summary -->
        <div v-if="getManagerEvaluation(modal.emp?.id, 'prima')" class="bg-blue-50 p-4 rounded border border-blue-200">
          <p class="text-xs font-semibold text-blue-700 uppercase mb-2">Recap Valutazione Preliminare Manager</p>
          <div class="grid grid-cols-2 gap-2 text-xs mb-2">
            <div class="bg-white p-2 rounded"><strong>Competenze:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').competenze }}/5</div>
            <div class="bg-white p-2 rounded"><strong>Qualità:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').qualita }}/5</div>
            <div class="bg-white p-2 rounded"><strong>Problem Solving:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').problemSolving }}/5</div>
            <div class="bg-white p-2 rounded"><strong>Velocità:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').velocita }}/5</div>
            <div class="bg-white p-2 rounded"><strong>Collaborazione:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').collaborazione }}/5</div>
            <div class="bg-white p-2 rounded"><strong>Comunicazione:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').comunicazione }}/5</div>
            <div class="bg-white p-2 rounded col-span-2"><strong>Attitudine:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').attitudine }}/5</div>
          </div>
          <p class="text-xs text-blue-700"><strong>Raccomandazione:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').raccomandazione }}</p>
        </div>

        <div class="bg-purple-50 border border-purple-200 rounded p-4">
          <p class="text-xs font-semibold text-purple-700 uppercase mb-4">🧠 Assessment Psicologico HR (Best Practice)</p>
          
          <!-- Onboarding Success -->
          <div class="space-y-1 mb-3">
            <label class="text-sm font-medium text-gray-700">1. Successo Onboarding (integrazione e apprendimento iniziale)</label>
            <input v-model.number="evalForm.hrOnboarding" type="range" min="1" max="5" class="w-full">
            <div class="flex justify-between text-xs text-gray-500">
              <span>{{ evalForm.hrOnboarding }}/5</span>
              <span>1=Difficile, 5=Eccellente</span>
            </div>
          </div>

          <!-- Engagement -->
          <div class="space-y-1 mb-3">
            <label class="text-sm font-medium text-gray-700">2. Engagement (coinvolgimento, motivazione, dedizione)</label>
            <input v-model.number="evalForm.hrEngagement" type="range" min="1" max="5" class="w-full">
            <div class="flex justify-between text-xs text-gray-500">
              <span>{{ evalForm.hrEngagement }}/5</span>
              <span>1=Disimpegnato, 5=Molto coinvolto</span>
            </div>
          </div>

          <!-- Wellbeing -->
          <div class="space-y-1 mb-3">
            <label class="text-sm font-medium text-gray-700">3. Wellbeing (benessere psicologico, equilibrio vita-lavoro)</label>
            <input v-model.number="evalForm.hrWellbeing" type="range" min="1" max="5" class="w-full">
            <div class="flex justify-between text-xs text-gray-500">
              <span>{{ evalForm.hrWellbeing }}/5</span>
              <span>1=Sotto stress, 5=Equilibrato</span>
            </div>
          </div>

          <!-- Cultural Fit -->
          <div class="space-y-1 mb-3">
            <label class="text-sm font-medium text-gray-700">4. Cultural Fit (allineamento valori, integrazione cultura)</label>
            <input v-model.number="evalForm.hrCulturalFit" type="range" min="1" max="5" class="w-full">
            <div class="flex justify-between text-xs text-gray-500">
              <span>{{ evalForm.hrCulturalFit }}/5</span>
              <span>1=Non allineato, 5=Perfetto alignment</span>
            </div>
          </div>

          <!-- Growth Potential -->
          <div class="space-y-1 mb-3">
            <label class="text-sm font-medium text-gray-700">5. Growth Potential (potenziale di sviluppo, progressione futura)</label>
            <input v-model.number="evalForm.hrGrowthPotential" type="range" min="1" max="5" class="w-full">
            <div class="flex justify-between text-xs text-gray-500">
              <span>{{ evalForm.hrGrowthPotential }}/5</span>
              <span>1=Limitato, 5=Alto potenziale</span>
            </div>
          </div>

          <!-- Retention Risk (Inverted) -->
          <div class="space-y-1 mb-3">
            <label class="text-sm font-medium text-gray-700">6. Retention Risk (fedeltà, rischio di turnover)</label>
            <input v-model.number="evalForm.hrRetention" type="range" min="1" max="5" class="w-full">
            <div class="flex justify-between text-xs text-gray-500">
              <span>{{ evalForm.hrRetention }}/5</span>
              <span>1=Alto rischio abbandono, 5=Molto fedele</span>
            </div>
          </div>
        </div>

        <!-- Data validazione -->
        <div>
          <label class="form-label">Data validazione</label>
          <input v-model="evalForm.hrData" type="date" class="form-input">
        </div>

        <!-- Voto HR Finale -->
        <div>
          <label class="form-label">Voto HR Finale (1-10)</label>
          <input v-model.number="evalForm.hrVoto" type="range" min="1" max="10" class="w-full">
          <div class="text-sm text-gray-600 mt-1">{{ evalForm.hrVoto }}/10</div>
        </div>

        <!-- Commento di Validazione -->
        <div>
          <label class="form-label">Commento di Validazione HR (Assessment e raccomandazioni)</label>
          <textarea v-model="evalForm.hrCommento" class="form-textarea" rows="4" placeholder="Sintesi dell'assessment psicologico, feedback e raccomandazioni per lo sviluppo..."></textarea>
        </div>
      </div>

      <!-- CEO Decision Form -->
      <div v-else-if="modal.tipo === 'ceo'" class="space-y-4">
        <div v-if="getManagerEvaluation(modal.emp?.id, 'prima')" class="bg-blue-50 p-4 rounded border border-blue-200 text-xs space-y-2">
          <div class="font-semibold text-blue-900 mb-2">📊 Valutazione Preliminare Manager</div>
          <p><strong>Raccomandazione:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').raccomandazione }}</p>
          <div class="mt-2 pt-2 border-t border-blue-200 grid grid-cols-2 gap-1 text-xs">
            <span><strong>Competenze:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').competenze }}/5</span>
            <span><strong>Qualità:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').qualita }}/5</span>
            <span><strong>Problem Solving:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').problemSolving }}/5</span>
            <span><strong>Velocità:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').velocita }}/5</span>
            <span><strong>Collaborazione:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').collaborazione }}/5</span>
            <span><strong>Comunicazione:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').comunicazione }}/5</span>
            <span class="col-span-2"><strong>Attitudine:</strong> {{ getManagerEvaluation(modal.emp?.id, 'prima').attitudine }}/5</span>
          </div>
          <p class="text-gray-500 italic mt-2">{{ getManagerEvaluation(modal.emp?.id, 'prima').osservazioni }}</p>
        </div>
        <div v-if="getHRValidation(modal.emp?.id)" class="bg-purple-50 p-4 rounded border border-purple-200 text-xs space-y-2">
          <div class="font-semibold text-purple-900 mb-2">🧠 Valutazione HR</div>
          <p><strong>Voto:</strong> {{ getHRValidation(modal.emp?.id).voto }}/10</p>
          <p v-if="getHRValidation(modal.emp?.id).commento" class="text-gray-600 italic">{{ getHRValidation(modal.emp?.id).commento }}</p>
          
          <!-- HR Psychometric Summary -->
          <div v-if="getHRValidation(modal.emp?.id).hrOnboarding" class="mt-2 pt-2 border-t border-purple-200 grid grid-cols-2 gap-1 text-xs">
            <span><strong>Onboarding:</strong> {{ getHRValidation(modal.emp?.id).hrOnboarding }}/5</span>
            <span><strong>Engagement:</strong> {{ getHRValidation(modal.emp?.id).hrEngagement }}/5</span>
            <span><strong>Wellbeing:</strong> {{ getHRValidation(modal.emp?.id).hrWellbeing }}/5</span>
            <span><strong>Cultural Fit:</strong> {{ getHRValidation(modal.emp?.id).hrCulturalFit }}/5</span>
            <span><strong>Growth:</strong> {{ getHRValidation(modal.emp?.id).hrGrowthPotential }}/5</span>
            <span><strong>Retention:</strong> {{ getHRValidation(modal.emp?.id).hrRetention }}/5</span>
          </div>
        </div>

        <!-- Contract impact banner for determinato -->
        <div v-if="modal.emp?.tipoContratto === 'determinato'" class="bg-orange-50 border border-orange-300 rounded-lg p-3">
          <p class="text-sm font-semibold text-orange-900">⚡ Contratto a Termine</p>
          <p class="text-xs text-orange-700 mt-1">La decisione verrà propagata automaticamente al rinnovo contratto.<br>Scadenza: {{ modal.emp?.scadenzaContratto ? fmtDateShort(modal.emp.scadenzaContratto) : 'N/D' }}</p>
        </div>

        <div>
          <label class="form-label">Decisione CEO</label>
          <select v-model="evalForm.ceoDecisione" class="form-select">
            <option>Confermare il dipendente</option>
            <option>Proroga temporanea</option>
            <option>Non confermare</option>
          </select>
        </div>

        <!-- Proroga date (conditional) -->
        <div v-if="evalForm.ceoDecisione === 'Proroga temporanea' && modal.emp?.tipoContratto === 'determinato'" class="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <label class="text-sm font-semibold text-amber-900 block mb-1">Proroga fino a:</label>
          <input v-model="evalForm.ceoDataProrogaFino" type="date" class="form-input">
        </div>

        <div>
          <label class="form-label">Motivazione della Decisione</label>
          <textarea v-model="evalForm.ceoMotivazione" class="form-textarea" rows="3" placeholder="Motivazione dettagliata..."></textarea>
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="modal.open = false" class="btn btn-ghost">Annulla</button>
      <button @click="saveEvaluation" :disabled="modal.tipo === 'valutazione-finale' && !getManagerEvaluation(modal.emp?.id, 'prima')" class="btn btn-primary">💾 Salva</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import Modal from '@/components/ui/Modal.vue'

const store = useHrStore()
const route = useRoute()
const router = useRouter()
const { fmtDateShort } = useHelpers()

const search = ref('')
const filterTeam = ref('')
const filterStatus = ref('')
const expanded = ref([])
const esitoEditMode = ref([])  // Dipendenti in edit mode per esito
const tempEsitoProva = ref('')  // Valore temporaneo durante edit
const preSelectedEmpId = ref(null)

const modal = reactive({ open: false, emp: null, tipo: null })
const evalForm = reactive({
  // Manager
  competenze: 3, competenzeNote: '',
  qualita: 3, qualitaNote: '',
  problemSolving: 3, problemSolvingNote: '',
  velocita: 3, velocitaNote: '',
  collaborazione: 3, collaborazioneNote: '',
  comunicazione: 3, comunicazioneNote: '',
  attitudine: 3, attitudineNote: '',
  osservazioni: '',
  raccomandazione: 'Confermare il dipendente',
  motivazioneRaccomandazione: '',
  suggerimenti: '',
  areaeMiglioramento: '',
  // HR - Base
  hrData: '', hrVoto: 5, hrCommento: '',
  // HR - Psychometric Assessment
  hrOnboarding: 3, hrEngagement: 3, hrWellbeing: 3, hrCulturalFit: 3, hrGrowthPotential: 3, hrRetention: 3,
  // CEO
  ceoData: '', ceoDecisione: 'Confermare il dipendente', ceoMotivazione: '', ceoDataProrogaFino: ''
})

const getTeamsExcludingFreelance = computed(() => {
  return store.teams.filter(t => !t.toLowerCase().includes('freelance'))
})

const inCorso = computed(() => {
  const today = new Date()
  return store.employees.filter(e => {
    if (e.stato !== 'Attivo') return false
    if (!e.fineProva) return false
    if (e.team.toLowerCase().includes('freelance')) return false
    
    // Se prova ancora in corso (esitoProva === 'In Corso'), includi sempre
    if (e.esitoProva === 'In Corso') return true
    
    // Se prova conclusa, includi solo se:
    // - ha la valutazione preliminare completata (managerPreliminary exists)
    // - e non ha ancora quella finale (managerFinal is null/undefined)
    const hasPreliminary = e.valutazionePeriodoProva?.managerPreliminary
    const hasNoFinal = !e.valutazionePeriodoProva?.managerFinal
    
    if (hasPreliminary && hasNoFinal) return true
    
    return false
  }).sort((a, b) => {
    const dateA = a.fineProva ? new Date(a.fineProva).getTime() : Infinity
    const dateB = b.fineProva ? new Date(b.fineProva).getTime() : Infinity
    return dateA - dateB  // Earliest (closest deadline) first
  })
})

const scaduti = computed(() => {
  const today = new Date()
  return inCorso.value.filter(e => new Date(e.fineProva) < today).sort((a, b) => {
    const dateA = a.fineProva ? new Date(a.fineProva).getTime() : 0
    const dateB = b.fineProva ? new Date(b.fineProva).getTime() : 0
    return dateA - dateB  // Earliest scaduto first
  })
})

const entro7gg = computed(() => {
  const today = new Date()
  return inCorso.value.filter(e => {
    const days = Math.round((new Date(e.fineProva) - today) / 86400000)
    return days > 0 && days <= 7
  }).sort((a, b) => {
    const dateA = a.fineProva ? new Date(a.fineProva).getTime() : Infinity
    const dateB = b.fineProva ? new Date(b.fineProva).getTime() : Infinity
    return dateA - dateB  // Earliest first
  })
})

const entro30gg = computed(() => {
  const today = new Date()
  return inCorso.value.filter(e => {
    const days = Math.round((new Date(e.fineProva) - today) / 86400000)
    return days > 7 && days <= 30
  }).sort((a, b) => {
    const dateA = a.fineProva ? new Date(a.fineProva).getTime() : Infinity
    const dateB = b.fineProva ? new Date(b.fineProva).getTime() : Infinity
    return dateA - dateB  // Earliest first
  })
})

const completate = computed(() => {
  return store.employees.filter(e =>
    (e.esitoProva === 'Superato' || e.esitoProva === 'Non Superato') &&
    !e.team.toLowerCase().includes('freelance')
  ).sort((a, b) => {
    const dateA = a.fineProva ? new Date(a.fineProva).getTime() : 0
    const dateB = b.fineProva ? new Date(b.fineProva).getTime() : 0
    return dateB - dateA  // Newest (most recent) first
  })
})

// Contratti a termine in scadenza entro 30gg (anche se non "In Corso" come prova)
const determinatiInScadenza = computed(() => {
  const today = new Date()
  return store.enrichedEmployees.filter(e => {
    if (e.stato !== 'Attivo') return false
    if (e.tipoContratto !== 'determinato') return false
    if (e.team.toLowerCase().includes('freelance')) return false
    if (!e.scadenzaContratto) return false
    const days = Math.round((new Date(e.scadenzaContratto) - today) / 86400000)
    return days <= 30
  }).map(e => ({
    ...e,
    _isDeterminato: true,
    _daysToContratto: Math.round((new Date(e.scadenzaContratto) - today) / 86400000)
  })).sort((a, b) => {
    const dateA = a.scadenzaContratto ? new Date(a.scadenzaContratto).getTime() : Infinity
    const dateB = b.scadenzaContratto ? new Date(b.scadenzaContratto).getTime() : Infinity
    return dateA - dateB  // Earliest (closest contract deadline) first
  })
})

// Combina inCorso + determinati (senza duplicati)
const allVisibili = computed(() => {
  const inCorsoIds = new Set(inCorso.value.map(e => e.id))
  const extra = determinatiInScadenza.value.filter(e => !inCorsoIds.has(e.id))
  // Enrichisci inCorso con flag determinato
  const today = new Date()
  const enriched = inCorso.value.map(e => {
    const isDet = e.tipoContratto === 'determinato' && e.scadenzaContratto
    return {
      ...e,
      _isDeterminato: isDet,
      _daysToContratto: isDet ? Math.round((new Date(e.scadenzaContratto) - today) / 86400000) : null
    }
  })
  return [...enriched, ...extra]
})

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  let list = allVisibili.value

  if (filterStatus.value === 'scaduti') list = scaduti.value
  else if (filterStatus.value === 'urgenti') list = entro7gg.value
  else if (filterStatus.value === 'attenzione') list = entro30gg.value
  else if (filterStatus.value === 'determinati') list = determinatiInScadenza.value
  else if (filterStatus.value === 'completate') list = completate.value

  return list.filter(e => {
    const matchSearch = !s || e.nome.toLowerCase().includes(s) || e.cognome.toLowerCase().includes(s) || e.team.toLowerCase().includes(s)
    const matchTeam = !filterTeam.value || e.team === filterTeam.value
    return matchSearch && matchTeam
  }).sort((a, b) => {
    // Ordina per data scadenza più vicina in alto, più lontana in basso
    const dateA = a.fineProva ? new Date(a.fineProva).getTime() : (a.scadenzaContratto ? new Date(a.scadenzaContratto).getTime() : Infinity)
    const dateB = b.fineProva ? new Date(b.fineProva).getTime() : (b.scadenzaContratto ? new Date(b.scadenzaContratto).getTime() : Infinity)
    return dateA - dateB  // Earliest (soonest) deadline first
  })
})

// Contract context check
const selectedEmployee = computed(() => {
  if (!preSelectedEmpId.value) return null
  return store.enrichedEmployees.find(e => e.id === preSelectedEmpId.value)
})

const hasContractDeadline = computed(() => {
  if (!selectedEmployee.value) return false
  if (selectedEmployee.value.tipoContratto !== 'determinato') return false
  if (!selectedEmployee.value.scadenzaContratto) return false
  const scadDate = new Date(selectedEmployee.value.scadenzaContratto)
  const today = new Date()
  const daysUntil = Math.floor((scadDate - today) / 86400000)
  return daysUntil <= 90 && daysUntil > 0
})

// P&C colloquio check
const hasMissingPCColloquio = computed(() => {
  if (!selectedEmployee.value) return false
  const pcStatus = store.pcColloquiStatus[selectedEmployee.value.id]
  if (!pcStatus) return false
  return pcStatus.status === 'Scaduto' || pcStatus.status === 'Non Fatto'
})

function initials(nome) {
  return nome.split(' ').map(w => w[0]).join('').toUpperCase()
}

// Lifecycle: Check route.query.empId on mount
onMounted(() => {
  if (route.query.empId) {
    preSelectedEmpId.value = parseInt(route.query.empId)
    // Auto-expand the pre-selected employee
    if (preSelectedEmpId.value && !expanded.value.includes(preSelectedEmpId.value)) {
      expanded.value.push(preSelectedEmpId.value)
    }
  }
})

// Navigation functions
function goToContractRenewal() {
  if (selectedEmployee.value) {
    router.push(`/contratti-termine?emp=${selectedEmployee.value.id}`)
  }
}

function goToPCColloquio() {
  if (selectedEmployee.value) {
    // Open P&C colloquio modal (delegated to parent or global event)
    // For now, navigate to dashboard or trigger event
    alert(`Aggiungi P&C Colloquio per ${selectedEmployee.value.nome} ${selectedEmployee.value.cognome}`)
  }
}

function toggleExpanded(empId) {
  const idx = expanded.value.indexOf(empId)
  if (idx > -1) expanded.value.splice(idx, 1)
  else expanded.value.push(empId)
}

function getManagerEvaluation(empId, tipo = 'prima') {
  const emp = store.employees.find(e => e.id === empId)
  if (!emp) return null
  
  if (tipo === 'prima') {
    return emp?.valutazionePeriodoProva?.managerPreliminary || null
  } else if (tipo === 'finale') {
    return emp?.valutazionePeriodoProva?.managerFinal || null
  }
  return null
}

function getHRValidation(empId) {
  const emp = store.employees.find(e => e.id === empId)
  const hr = emp?.valutazionePeriodoProva?.hr
  if (!hr) return null
  return { 
    data: emp.valutazionePeriodoProva.dataValutazioneHR, 
    voto: hr.voto, 
    commento: hr.commento,
    hrOnboarding: hr.hrOnboarding,
    hrEngagement: hr.hrEngagement,
    hrWellbeing: hr.hrWellbeing,
    hrCulturalFit: hr.hrCulturalFit,
    hrGrowthPotential: hr.hrGrowthPotential,
    hrRetention: hr.hrRetention
  }
}

function getCEODecision(empId) {
  const emp = store.employees.find(e => e.id === empId)
  const ceo = emp?.valutazionePeriodoProva?.ceo
  if (!ceo) return null
  return { data: emp.valutazionePeriodoProva.dataDecisioneCEO, decisione: ceo.decisione, motivazione: ceo.motivazione }
}

function openEvaluation(emp, tipo) {
  modal.emp = emp
  modal.tipo = tipo

  if (tipo === 'valutazione-prima' || tipo === 'valutazione-finale') {
    const existing = getManagerEvaluation(emp.id, tipo === 'valutazione-prima' ? 'prima' : 'finale')
    if (existing) {
      Object.assign(evalForm, existing)
    } else {
      evalForm.competenze = 3
      evalForm.qualita = 3
      evalForm.problemSolving = 3
      evalForm.velocita = 3
      evalForm.collaborazione = 3
      evalForm.comunicazione = 3
      evalForm.attitudine = 3
      evalForm.osservazioni = ''
      evalForm.raccomandazione = 'Confermare il dipendente'
      evalForm.motivazioneRaccomandazione = ''
      evalForm.suggerimenti = ''
      evalForm.areaeMiglioramento = ''
    }
  } else if (tipo === 'manager') {
    const existing = getManagerEvaluation(emp.id, 'prima')
    if (existing) {
      Object.assign(evalForm, existing)
    } else {
      evalForm.competenze = 3
      evalForm.qualita = 3
      evalForm.problemSolving = 3
      evalForm.velocita = 3
      evalForm.collaborazione = 3
      evalForm.comunicazione = 3
      evalForm.attitudine = 3
      evalForm.osservazioni = ''
      evalForm.raccomandazione = 'Confermare il dipendente'
      evalForm.motivazioneRaccomandazione = ''
      evalForm.suggerimenti = ''
      evalForm.areaeMiglioramento = ''
    }
  } else if (tipo === 'hr') {
    const existing = getHRValidation(emp.id)
    if (existing) {
      evalForm.hrData = existing.data
      evalForm.hrVoto = existing.voto
      evalForm.hrCommento = existing.commento
      evalForm.hrOnboarding = existing.hrOnboarding || 3
      evalForm.hrEngagement = existing.hrEngagement || 3
      evalForm.hrWellbeing = existing.hrWellbeing || 3
      evalForm.hrCulturalFit = existing.hrCulturalFit || 3
      evalForm.hrGrowthPotential = existing.hrGrowthPotential || 3
      evalForm.hrRetention = existing.hrRetention || 3
    } else {
      evalForm.hrData = ''
      evalForm.hrVoto = 5
      evalForm.hrCommento = ''
      evalForm.hrOnboarding = 3
      evalForm.hrEngagement = 3
      evalForm.hrWellbeing = 3
      evalForm.hrCulturalFit = 3
      evalForm.hrGrowthPotential = 3
      evalForm.hrRetention = 3
    }
  } else if (tipo === 'ceo') {
    const existing = getCEODecision(emp.id)
    if (existing) {
      evalForm.ceoData = existing.data
      evalForm.ceoDecisione = existing.decisione
      evalForm.ceoMotivazione = existing.motivazione
    } else {
      evalForm.ceoData = ''
      evalForm.ceoDecisione = 'Confermare il dipendente'
      evalForm.ceoMotivazione = ''
    }
  }

  modal.open = true
}

function getModalTitle() {
  if (!modal.emp) return ''
  let tipo = ''
  if (modal.tipo === 'valutazione-prima') tipo = 'Stima Preliminare Manager (45gg prima)'
  else if (modal.tipo === 'valutazione-finale') tipo = 'Valutazione Finale Manager (45gg dopo)'
  else if (modal.tipo === 'hr') tipo = 'Validazione HR'
  else if (modal.tipo === 'ceo') tipo = 'Decisione CEO'
  return `${tipo} — ${modal.emp.nome} ${modal.emp.cognome}`
}

function avgManagerScore(empId) {
  const m = getManagerEvaluation(empId, 'prima')
  if (!m) return '—'
  const vals = [m.competenze, m.qualita, m.problemSolving, m.velocita, m.collaborazione, m.comunicazione, m.attitudine]
  return (vals.reduce((a, b) => a + (b || 0), 0) / vals.length).toFixed(1)
}

function saveEvaluation() {
  if (!modal.emp) return

  if (modal.tipo === 'valutazione-prima' || modal.tipo === 'valutazione-finale') {
    const isFinale = modal.tipo === 'valutazione-finale'
    store.saveValutazioneManager(modal.emp.id, {
      competenze: evalForm.competenze, competenzeNote: evalForm.competenzeNote,
      qualita: evalForm.qualita, qualitaNote: evalForm.qualitaNote,
      problemSolving: evalForm.problemSolving, problemSolvingNote: evalForm.problemSolvingNote,
      velocita: evalForm.velocita, velocitaNote: evalForm.velocitaNote,
      collaborazione: evalForm.collaborazione, collaborazioneNote: evalForm.collaborazioneNote,
      comunicazione: evalForm.comunicazione, comunicazioneNote: evalForm.comunicazioneNote,
      attitudine: evalForm.attitudine, attitudineNote: evalForm.attitudineNote,
      osservazioni: evalForm.osservazioni,
      raccomandazione: evalForm.raccomandazione,
      motivazioneRaccomandazione: evalForm.motivazioneRaccomandazione,
      suggerimenti: evalForm.suggerimenti,
      areaeMiglioramento: evalForm.areaeMiglioramento,
      tipo: isFinale ? 'finale' : 'preliminare'
    })
    
    // Aggiorna lo stato
    const updateData = isFinale 
      ? { statoValutazioneFinalManager: 'Fatto' }
      : { statoValutazionePrimaManager: 'Fatto' }
    store.updateEmployee(modal.emp.id, updateData)
  } else if (modal.tipo === 'hr') {
    store.saveValutazioneHR(modal.emp.id, {
      voto: evalForm.hrVoto,
      commento: evalForm.hrCommento,
      hrOnboarding: evalForm.hrOnboarding,
      hrEngagement: evalForm.hrEngagement,
      hrWellbeing: evalForm.hrWellbeing,
      hrCulturalFit: evalForm.hrCulturalFit,
      hrGrowthPotential: evalForm.hrGrowthPotential,
      hrRetention: evalForm.hrRetention
    })
  } else if (modal.tipo === 'ceo') {
    store.saveCEODecision(modal.emp.id, {
      decisione: evalForm.ceoDecisione,
      motivazione: evalForm.ceoMotivazione,
      dataProrogaFino: evalForm.ceoDataProrogaFino || null
    })
  }

  modal.open = false
}

function toggleEsitoEdit(empId) {
  const idx = esitoEditMode.value.indexOf(empId)
  if (idx === -1) {
    // Entrare in edit mode
    const emp = store.employees.find(e => e.id === empId)
    tempEsitoProva.value = emp?.esitoProva || 'In Corso'
    esitoEditMode.value.push(empId)
  } else {
    // Uscire da edit mode
    esitoEditMode.value.splice(idx, 1)
  }
}

function saveEsito(emp, nuovoEsito) {
  store.updateEmployee(emp.id, { esitoProva: nuovoEsito })
  esitoEditMode.value = esitoEditMode.value.filter(id => id !== emp.id)
}
</script>
