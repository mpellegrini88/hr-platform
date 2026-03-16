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

    <!-- PROSSIMI INGRESSI -->
    <div v-if="activeTab === 'prossimiIngressi'">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900">📥 Prossimi Ingressi</h3>
      </div>
      <div v-if="prossimiIngressi.length === 0" class="card p-12 text-center space-y-3">
        <div class="text-gray-400 text-lg">Nessun dipendente in arrivo</div>
        <router-link to="/pre-onboarding" class="inline-block text-primary-600 hover:text-primary-700 font-medium text-sm">
          📥 Aggiungi un nuovo dipendente in Pre-Onboarding →
        </router-link>
      </div>
      <div v-else class="space-y-4">
        <div v-for="e in prossimiIngressi" :key="e.id" class="card overflow-hidden">
          <!-- Header -->
          <div class="px-5 py-4 border-b border-gray-50 flex items-center gap-4 bg-gradient-to-r from-blue-50 to-blue-50">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
              {{ initials(e.nome) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900">{{ e.nome }} {{ e.cognome }}</div>
              <div class="text-xs text-gray-500">{{ e.team }} · {{ e.citta }} · {{ e.livelloCCNL }}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-xs text-gray-500">Ingresso previsto</div>
              <div class="text-lg font-bold text-blue-700">{{ fmtDateShort(e.dataAssunzione) }}</div>
            </div>
          </div>

          <!-- Pre-Entry Checklist -->
          <div class="px-5 py-4">
            <div class="mb-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">📋 Checklist Pre-Ingresso</h4>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition group">
                  <input
                    type="checkbox"
                    :checked="e.preoboardingChecklist?.invioScritturaPrivata || false"
                    @change="updatePreboardingChecklist(e.id, 'invioScritturaPrivata', $event.target.checked)"
                    class="rounded"
                  >
                  <span class="text-sm">📄 Invio scrittura privata allo studio</span>
                  <span class="ml-auto text-xs text-amber-600 opacity-0 group-hover:opacity-100 transition">Entro 1 mese prima</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition group">
                  <input
                    type="checkbox"
                    :checked="e.preoboardingChecklist?.creazioneProfiliweb || false"
                    @change="updatePreboardingChecklist(e.id, 'creazioneProfiliweb', $event.target.checked)"
                    class="rounded"
                  >
                  <span class="text-sm">💻 Creazione email e profili sistema/Teams</span>
                  <span class="ml-auto text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition">Entro 2 settimane</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition group">
                  <input
                    type="checkbox"
                    :checked="e.preoboardingChecklist?.invioProcedure || false"
                    @change="updatePreboardingChecklist(e.id, 'invioProcedure', $event.target.checked)"
                    class="rounded"
                  >
                  <span class="text-sm">📋 Invio procedure e documentazione</span>
                  <span class="ml-auto text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition">Entro 2 settimane</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition group">
                  <input
                    type="checkbox"
                    :checked="e.preoboardingChecklist?.visitaMedica || false"
                    @change="updatePreboardingChecklist(e.id, 'visitaMedica', $event.target.checked)"
                    class="rounded"
                  >
                  <span class="text-sm">🏥 Visita medica preventiva</span>
                  <span class="ml-auto text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition">Entro 1 settimana</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition group">
                  <input
                    type="checkbox"
                    :checked="e.preoboardingChecklist?.corsoFormazione || false"
                    @change="updatePreboardingChecklist(e.id, 'corsoFormazione', $event.target.checked)"
                    class="rounded"
                  >
                  <span class="text-sm">🎓 Corso di formazione/induction</span>
                  <span class="ml-auto text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition">Facoltativo</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition group">
                  <input
                    type="checkbox"
                    :checked="e.preoboardingChecklist?.invioContratti || false"
                    @change="updatePreboardingChecklist(e.id, 'invioContratti', $event.target.checked)"
                    class="rounded"
                  >
                  <span class="text-sm">✍️ Invio contratti e firmamento</span>
                  <span class="ml-auto text-xs text-red-600 opacity-0 group-hover:opacity-100 transition">1 settimana prima</span>
                </label>
              </div>
            </div>

            <!-- Progress indicator -->
            <div class="mt-4 pt-3 border-t border-gray-100">
              <div class="text-xs font-semibold text-gray-600 mb-1">Completamento</div>
              <div class="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  class="bg-blue-600 h-1.5 rounded-full transition-all"
                  :style="{ width: ((getChecklistProgress(e.id) / 6) * 100) + '%' }"
                ></div>
              </div>
              <div class="text-xs text-gray-500 mt-1">{{ getChecklistProgress(e.id) }} di 6 completate</div>
            </div>
          </div>
        </div>
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
                  :done="e.statoValutazionePrimaManager === 'Fatto'"
                  :urgent="e.valutazionePrimaManagerUrgente"
                  :date="e.scadenzaValutazionePrimaManager"
                  label="Stima Manager"
                  icon="📋"
                  color="amber"
                  desc="Stima preliminare (45gg prima)"
                  @click="goToValutazione(e)"
                  class="cursor-pointer"
                  :stato="e.statoValutazionePrimaManager"
                />
                <TimelineNode
                  :done="e.statoFU2Dip === 'Fatto'"
                  :urgent="e.fu2Urgente"
                  :date="e.scadenzaFU2"
                  label="FU2 Dipendente"
                  icon="👔"
                  color="purple"
                  desc="30gg prima fine prova"
                  :stato="e.statoFU2Dip"
                />
                <TimelineNode
                  :done="e.esitoProva === 'Superato'"
                  :failed="e.esitoProva === 'Non Superato'"
                  :urgent="e.provaUrgente && e.esitoProva === 'In Corso'"
                  :date="e.fineProva"
                  label="Fine Prova"
                  icon="🏁"
                  color="indigo"
                  desc="Valutazione periodo di prova"
                  :stato="e.esitoProva"
                />
                <TimelineNode
                  :done="e.statoValutazioneFinalManager === 'Fatto'"
                  :urgent="e.valutazioneFinalManagerUrgente"
                  :date="e.scadenzaValutazioneFinalManager"
                  label="Valutazione Manager"
                  icon="📝"
                  color="rose"
                  desc="Valutazione finale (45gg dopo)"
                  @click="goToValutazione(e)"
                  class="cursor-pointer"
                  :stato="e.statoValutazioneFinalManager"
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

        <Section title="Follow-up Manager — 45gg (Valutazione Responsabile Tecnico)">
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
            <div class="flex items-start gap-2">
              <div class="text-lg">👨‍💼</div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-blue-900">Valutazione Responsabile Tecnico</p>
                <p class="text-xs text-blue-700 mt-1">Il manager valuta il dipendente su criteri tecnici e comportamentali. Questo feedback servirà come pre-valutazione per il responso finale della prova.</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="form-label">Scadenza Valutazione Manager</label>
              <input class="form-input bg-gray-50" :value="fmtDateShort(detail.emp.scadenzaValutazionePrimaManager)" readonly>
              <div class="text-xs text-gray-500 mt-1">1 mese e 1 settimana prima della fine prova</div>
            </div>
            <div>
              <label class="form-label">Stato Valutazione Manager</label>
              <select class="form-select" v-model="detail.emp.statoValutazionePrimaManager" @change="saveDetail">
                <option>Da Fare</option><option>Fatto</option><option>Non Necessario</option>
              </select>
            </div>
          </div>

          <div v-if="detail.emp.statoValutazionePrimaManager === 'Da Fare'" class="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p class="text-sm font-medium text-blue-900">📝 Questa è la <strong>prima valutazione preliminare</strong> del manager (senza conferma finale).</p>
            <p class="text-xs text-blue-800 mt-1">Scarica una stima dei voti. La pratica sarà successivamente confermata o definita nella valutazione finale a fine prova.</p>
            <button @click="goToValutazione(detail.emp)" class="mt-3 btn btn-primary btn-sm">➜ Vai a Valutazione Prova</button>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4 mt-6">
            <div>
              <label class="form-label">Scadenza Stima Preliminare</label>
              <input class="form-input bg-gray-50" :value="fmtDateShort(detail.emp.scadenzaValutazionePrimaManager)" readonly>
            </div>
            <div>
              <label class="form-label">Stato Stima Manager</label>
              <select class="form-select" v-model="detail.emp.statoValutazionePrimaManager" @change="saveDetail">
                <option>Da Fare</option><option>Fatto</option><option>Non Necessario</option>
              </select>
            </div>
          </div>

          <!-- Manager Evaluation Form -->
          <div v-if="detail.emp.statoValutazionePrimaManager === 'Fatto'" class="space-y-4">
            <!-- Osservazioni Generali -->
            <div class="bg-white p-4 rounded border border-gray-200">
              <label class="form-label">Osservazioni Generali (performance, atteggiamento, collaborazione, punti di forza, aree di attenzione)</label>
              <textarea v-model="managerEval.osservazioni" class="form-textarea" rows="4" placeholder="Descrivi il comportamento, la performance e l'integrazione del dipendente nei primi 45 giorni..."></textarea>
            </div>

            <!-- Scale Manager (7 criteri) -->
            <div class="bg-white p-4 rounded border border-gray-200 space-y-4">
              <p class="text-sm font-semibold text-gray-900">Scala di Valutazione (1-5):</p>
              
              <!-- Competenze Tecniche -->
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">1. Competenze Tecniche</label>
                <input v-model.number="managerEval.competenze" type="range" min="1" max="5" class="w-full">
                <div class="flex justify-between text-xs text-gray-500">
                  <span>{{ managerEval.competenze }}/5</span>
                  <span>1=Inadeguato, 5=Eccellente</span>
                </div>
              </div>

              <!-- Qualità del Lavoro -->
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">2. Qualità del Lavoro (precisione, affidabilità, autonomia)</label>
                <input v-model.number="managerEval.qualita" type="range" min="1" max="5" class="w-full">
                <div class="flex justify-between text-xs text-gray-500">
                  <span>{{ managerEval.qualita }}/5</span>
                  <span>1=Incompleto, 5=Eccellente e puntuale</span>
                </div>
              </div>

              <!-- Problem Solving -->
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">3. Capacità di Problem-Solving</label>
                <input v-model.number="managerEval.problemSolving" type="range" min="1" max="5" class="w-full">
                <div class="flex justify-between text-xs text-gray-500">
                  <span>{{ managerEval.problemSolving }}/5</span>
                  <span>1=Attende indicazioni, 5=Autonomo e metodico</span>
                </div>
              </div>

              <!-- Velocità di Apprendimento -->
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">4. Velocità di Apprendimento</label>
                <input v-model.number="managerEval.velocita" type="range" min="1" max="5" class="w-full">
                <div class="flex justify-between text-xs text-gray-500">
                  <span>{{ managerEval.velocita }}/5</span>
                  <span>1=Lento, 5=Molto veloce</span>
                </div>
              </div>

              <!-- Collaborazione -->
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">5. Collaborazione e Teamwork</label>
                <input v-model.number="managerEval.collaborazione" type="range" min="1" max="5" class="w-full">
                <div class="flex justify-between text-xs text-gray-500">
                  <span>{{ managerEval.collaborazione }}/5</span>
                  <span>1=Individuale, 5=Eccellente relatore</span>
                </div>
              </div>

              <!-- Comunicazione -->
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">6. Comunicazione (chiarezza, proattività, disponibilità)</label>
                <input v-model.number="managerEval.comunicazione" type="range" min="1" max="5" class="w-full">
                <div class="flex justify-between text-xs text-gray-500">
                  <span>{{ managerEval.comunicazione }}/5</span>
                  <span>1=Scarsa, 5=Eccellente</span>
                </div>
              </div>

              <!-- Attitudine -->
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">7. Attitudine e Cultura Aziendale (allineamento valori, spirito di iniziativa)</label>
                <input v-model.number="managerEval.attitudine" type="range" min="1" max="5" class="w-full">
                <div class="flex justify-between text-xs text-gray-500">
                  <span>{{ managerEval.attitudine }}/5</span>
                  <span>1=Non allineato, 5=Perfettamente allineato</span>
                </div>
              </div>
            </div>

            <!-- Raccomandazione -->
            <div class="bg-white p-4 rounded border border-gray-200">
              <label class="form-label">Raccomandazione del Responsabile Tecnico</label>
              <select v-model="managerEval.raccomandazione" class="form-select mb-3">
                <option>Confermare il dipendente</option>
                <option>Proroga temporanea</option>
                <option>Non confermare</option>
              </select>
              <label class="form-label text-xs">Motivazione dettagliata:</label>
              <textarea v-model="managerEval.motivazione" class="form-textarea" rows="3" placeholder="Motiva la tua raccomandazione con riferimento ai risultati osservati..."></textarea>
            </div>

            <!-- Suggerimenti e Aree di Miglioramento -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded border border-gray-200">
                <label class="form-label text-xs">Suggerimenti (formazione, supporto, cambi ruolo, affiancamento, ecc.)</label>
                <textarea v-model="managerEval.suggerimenti" class="form-textarea" rows="3" placeholder="Quali azioni consigli per lo sviluppo?"></textarea>
              </div>
              <div class="bg-white p-4 rounded border border-gray-200">
                <label class="form-label text-xs">Aree di Miglioramento e Punti di Forza</label>
                <textarea v-model="managerEval.areaeMiglioramento" class="form-textarea" rows="3" placeholder="Punti di forza... Aree su cui lavorare..."></textarea>
              </div>
            </div>
          </div>

          <div v-else-if="detail.emp.statoValutazionePrimaManager === 'Da Fare'" class="text-sm text-gray-600 p-4 bg-gray-50 rounded">
            Completa il form sopra una volta che hai completato la stima preliminare del dipendente (45 giorni prima fine prova).
          </div>
        </Section>

        <Section title="Follow-up 2 — 30gg prima fine prova (dipendente + manager)">
          <div class="grid grid-cols-2 gap-4">
            <div><label class="form-label">Scadenza FU2</label><input class="form-input bg-gray-50" :value="fmtDateShort(detail.emp.scadenzaFU2)" readonly></div>
            <div>
              <label class="form-label">Stato FU2 — Dipendente</label>
              <select class="form-select" v-model="detail.emp.statoFU2Dip" @change="saveDetail">
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

        <Section title="Valutazione Manager Finale (45gg dopo fine prova)">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="form-label">Scadenza Valutazione Finale</label>
              <input class="form-input bg-gray-50" :value="fmtDateShort(detail.emp.scadenzaValutazioneFinalManager)" readonly>
            </div>
            <div>
              <label class="form-label">Stato Valutazione Finale</label>
              <select class="form-select" v-model="detail.emp.statoValutazioneFinalManager" @change="saveDetail">
                <option>Da Fare</option><option>Fatto</option><option>Non Necessario</option>
              </select>
            </div>
          </div>
          <div v-if="detail.emp.statoValutazioneFinalManager === 'Da Fare'" class="text-sm text-gray-600 p-4 bg-gray-50 rounded">
            Questa valutazione si terrà dopo la fine del periodo di prova per un feedback definitivo sulla conferma del dipendente.
          </div>
        </Section>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="detail.open=false">Chiudi</button>
        <button class="btn btn-primary" @click="saveDetailFull">💾 Salva tutto</button>
      </template>
    </Modal>

    <!-- NEW EMPLOYEE MODAL -->

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
  { value: 'prossimiIngressi', label: '📥 Prossimi Ingressi' },
  { value: 'inCorso', label: '🚀 In corso' },
  { value: 'storico', label: '📚 Storico' },
]

const allOnboarding = computed(() => {
  return store.enrichedEmployees
    .filter(e => e.fineProva || e.dataAssunzione)
    .map(e => {
      const today = new Date()
      
      // Determina la data di riferimento per il flusso
      const dataRiferimento = 
        (e.tipoContratto === 'determinato' && e.scadenzaContratto) 
          ? new Date(e.scadenzaContratto)
          : e.fineProva ? new Date(e.fineProva) : null
      
      const daysToProva = dataRiferimento ? Math.round((dataRiferimento - today) / 86400000) : null
      
      // Calcola durata della prova per differenziare short vs long
      let totalProvaLength = 0
      if (e.dataAssunzione && dataRiferimento) {
        totalProvaLength = Math.round((dataRiferimento - new Date(e.dataAssunzione)) / 86400000)
      }
      
      // VALUTAZIONE 1: Stima preliminare - 45 giorni prima della fine prova/contratto
      const scadenzaValPrimaManager = dataRiferimento ? new Date(dataRiferimento.getTime() - 45 * 86400000) : null
      const daysToValManager = scadenzaValPrimaManager ? Math.round((scadenzaValPrimaManager - today) / 86400000) : null
      
      // VALUTAZIONE 2: Valutazione finale - 45 giorni DOPO la fine prova/contratto
      const scadenzaValFinalManager = dataRiferimento ? new Date(dataRiferimento.getTime() + 45 * 86400000) : null
      const daysToValFinalManager = scadenzaValFinalManager ? Math.round((scadenzaValFinalManager - today) / 86400000) : null
      
      return {
        ...e,
        inProva: e.esitoProva === 'In Corso',
        provaUrgente: daysToProva !== null && daysToProva <= 7,
        provaScaduta: daysToProva !== null && daysToProva < 0,
        daysToProva,
        fu1Urgente: e.scadenzaFU1 ? Math.round((new Date(e.scadenzaFU1) - today) / 86400000) <= 7 : false,
        fu1Scaduto: e.scadenzaFU1 ? Math.round((new Date(e.scadenzaFU1) - today) / 86400000) < 0 : false,
        fu2ManagerUrgente: e.scadenzaFU2Manager ? Math.round((new Date(e.scadenzaFU2Manager) - today) / 86400000) <= 7 : false,
        fu2ManagerScaduto: e.scadenzaFU2Manager ? Math.round((new Date(e.scadenzaFU2Manager) - today) / 86400000) < 0 : false,
        fu2Urgente: e.scadenzaFU2 ? Math.round((new Date(e.scadenzaFU2) - today) / 86400000) <= 7 : false,
        fu2Scaduto: e.scadenzaFU2 ? Math.round((new Date(e.scadenzaFU2) - today) / 86400000) < 0 : false,
        scadenzaValutazionePrimaManager: scadenzaValPrimaManager ? scadenzaValPrimaManager.toISOString().split('T')[0] : null,
        daysToValManager,
        valutazionePrimaManagerUrgente: daysToValManager !== null && daysToValManager <= 7,
        scadenzaValutazioneFinalManager: scadenzaValFinalManager ? scadenzaValFinalManager.toISOString().split('T')[0] : null,
        daysToValFinalManager,
        valutazioneFinalManagerUrgente: daysToValFinalManager !== null && daysToValFinalManager <= 7,
        statoValutazionePrimaManager: e.statoValutazionePrimaManager || 'Da Fare',
        statoValutazioneFinalManager: e.statoValutazioneFinalManager || 'Da Fare'
      }
    })
})

const prossimiIngressi = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return store.enrichedEmployees
    .filter(e => {
      if (!e.dataAssunzione) return false
      const dataAssunzione = new Date(e.dataAssunzione)
      dataAssunzione.setHours(0, 0, 0, 0)
      return dataAssunzione > today
    })
    .filter(e => !search.value || e.nome.toLowerCase().includes(search.value.toLowerCase()))
    .sort((a, b) => new Date(a.dataAssunzione) - new Date(b.dataAssunzione))
})

const inCorso = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return allOnboarding.value
    .filter(e => {
      if (!e.dataAssunzione) return false
      const dataAssunzione = new Date(e.dataAssunzione)
      dataAssunzione.setHours(0, 0, 0, 0)
      return dataAssunzione <= today
    })
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
  const steps = [true, e.statoFU1==='Fatto', e.statoValutazionePrimaManager==='Fatto', e.statoFU2Dip==='Fatto', e.esitoProva==='Superato', e.statoValutazioneFinalManager==='Fatto']
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
const managerEval = reactive({ 
  osservazioni: '', 
  competenze: 3, 
  qualita: 3, 
  problemSolving: 3, 
  velocita: 3, 
  collaborazione: 3, 
  comunicazione: 3, 
  attitudine: 3,
  raccomandazione: 'Confermare il dipendente',
  motivazione: '',
  suggerimenti: '',
  areaeMiglioramento: ''
})

function openDetail(e) {
  detail.emp = { ...e }
  const c = e._coll || {}
  const m = e.valutazionePeriodoProva?.manager || {}
  
  Object.assign(fu1Scores, { esaur:c.c1_esaur||null, carico:c.c1_carico||null, motiv:c.c1_motiv||null, supp:c.c1_supp||null, equil:c.c1_equil||null, intent:c.c1_intent||null, note:c.c1_note||'' })
  Object.assign(fu2Scores, { esaur:c.c2_esaur||null, carico:c.c2_carico||null, motiv:c.c2_motiv||null, supp:c.c2_supp||null, equil:c.c2_equil||null, intent:c.c2_intent||null, note:c.c2_note||'' })
  
  Object.assign(managerEval, {
    osservazioni: m.osservazioni || '',
    competenze: m.competenze || 3,
    qualita: m.qualita || 3,
    problemSolving: m.problemSolving || 3,
    velocita: m.velocita || 3,
    collaborazione: m.collaborazione || 3,
    comunicazione: m.comunicazione || 3,
    attitudine: m.attitudine || 3,
    raccomandazione: m.raccomandazione || 'Confermare il dipendente',
    motivazione: m.motivazioneRaccomandazione || '',
    suggerimenti: m.suggerimenti || '',
    areaeMiglioramento: m.areaeMiglioramento || ''
  })
  
  detail.open = true
}

function saveDetail() {
  if (!detail.emp) return
  store.updateEmployee(detail.emp.id, { 
    statoFU1: detail.emp.statoFU1, 
    statoFU2Dip: detail.emp.statoFU2Dip, 
    statoValutazionePrimaManager: detail.emp.statoValutazionePrimaManager,
    statoValutazioneFinalManager: detail.emp.statoValutazioneFinalManager,
    esitoProva: detail.emp.esitoProva 
  })
}

function goToValutazione(e) {
  router.push(`/valutazione-prova?empId=${e.id}`)
}

function saveDetailFull() {
  saveDetail()
  store.saveColloquio(detail.emp.nome, {
    c1_esaur: fu1Scores.esaur, c1_carico: fu1Scores.carico, c1_motiv: fu1Scores.motiv, c1_supp: fu1Scores.supp, c1_equil: fu1Scores.equil, c1_intent: fu1Scores.intent, c1_note: fu1Scores.note,
    c2_esaur: fu2Scores.esaur, c2_carico: fu2Scores.carico, c2_motiv: fu2Scores.motiv, c2_supp: fu2Scores.supp, c2_equil: fu2Scores.equil, c2_intent: fu2Scores.intent, c2_note: fu2Scores.note,
  })
  
  // Salva valutazione manager se completata
  if (detail.emp.statoValutazionePrimaManager === 'Fatto') {
    store.saveValutazioneManager(detail.emp.id, {
      osservazioni: managerEval.osservazioni,
      competenze: managerEval.competenze,
      qualita: managerEval.qualita,
      problemSolving: managerEval.problemSolving,
      velocita: managerEval.velocita,
      collaborazione: managerEval.collaborazione,
      comunicazione: managerEval.comunicazione,
      attitudine: managerEval.attitudine,
      raccomandazione: managerEval.raccomandazione,
      motivazioneRaccomandazione: managerEval.motivazione,
      suggerimenti: managerEval.suggerimenti,
      areaeMiglioramento: managerEval.areaeMiglioramento
    })
  }
  
  detail.open = false
}

function updatePreboardingChecklist(empId, taskKey, isChecked) {
  store.updateEmployee(empId, {
    preoboardingChecklist: {
      ...(store.employees.find(e => e.id === empId)?.preoboardingChecklist || {}),
      [taskKey]: isChecked
    }
  })
}

function getChecklistProgress(empId) {
  const emp = store.employees.find(e => e.id === empId)
  const checklist = emp?.preoboardingChecklist || {}
  const tasks = Object.values(checklist).filter(v => v === true)
  return tasks.length
}



</script>
