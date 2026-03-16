<template>
  <div class="p-6 space-y-6">
    <!-- ONBOARDING SCADENZE KPI Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80" @click="router.push('/onboarding')"><KpiCard label="In periodo di prova" :value="kpiOnboarding.inCorso" icon="▶" color="blue" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80" @click="router.push('/onboarding')"><KpiCard label="FU1 scaduti" :value="kpiOnboarding.fu1Scaduti" icon="!" color="red" :alert="kpiOnboarding.fu1Scaduti > 0" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80" @click="router.push('/onboarding')"><KpiCard label="FU1 entro 7gg" :value="kpiOnboarding.fu1Entro7gg" icon="⧖" color="amber" :alert="kpiOnboarding.fu1Entro7gg > 0" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80" @click="router.push('/onboarding')"><KpiCard label="FU2 Manager scaduti" :value="kpiOnboarding.fu2ManagerScaduti" icon="≡" color="orange" :alert="kpiOnboarding.fu2ManagerScaduti > 0" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80" @click="router.push('/onboarding')"><KpiCard label="Fine prova 30gg" :value="kpiOnboarding.provaScadenza" icon="⊞" color="indigo" :alert="kpiOnboarding.provaScadenza > 0" /></button>
    </div>

    <!-- CONTRACT SCADENZE KPI Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80"><KpiCard label="Rinnovi scaduti" :value="kpiContratti.rinnoveScadute" icon="⊘" color="red" :alert="kpiContratti.rinnoveScadute > 0" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80"><KpiCard label="Rinnovi entro 30gg" :value="kpiContratti.rinnoveEntro30gg" icon="⧖" color="amber" :alert="kpiContratti.rinnoveEntro30gg > 0" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80"><KpiCard label="Dossier scaduti" :value="kpiContratti.dossieriScaduti" icon="☰" color="orange" :alert="kpiContratti.dossieriScaduti > 0" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80"><KpiCard label="Determinati attivi" :value="kpiContratti.determinatiInScadenza" icon="✎" color="purple" /></button>
      <button class="cursor-pointer bg-transparent border-0 p-0 hover:opacity-80" @click="router.push('/anagrafica')"><KpiCard label="Dipendenti attivi" :value="attivi" icon="⊙" color="indigo" /></button>
    </div>

    <!-- KANBAN BOARD -->
    <div class="card">
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900">Kanban — Monitoraggio Azioni</h3>
        <div class="flex gap-2">
          <button @click="handleExportExcel" class="text-xs px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition">
            📊 Excel
          </button>
          <button @click="handleExportJSON" class="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition">
            📋 JSON
          </button>
          <button @click="handleExportCSV" class="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-medium transition">
            📄 CSV
          </button>
        </div>
      </div>
      <div class="p-5">
        <KanbanBoard />
      </div>
    </div>

    <!-- CONTRATTI IN SCADENZA - Reminder valutazione prova per CEO -->
    <div v-if="contratiInScadenza.length > 0" class="card border-l-4 border-amber-500 bg-amber-50">
      <div class="px-5 py-4 border-b border-amber-200">
        <h3 class="font-semibold text-amber-900">Contratti in scadenza — Reminder Valutazione Prova</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="tbl">
          <thead><tr>
            <th>Dipendente</th><th>Team</th><th>Data Scadenza</th><th>Giorni Rimanenti</th><th>Stato</th><th>Azione</th>
          </tr></thead>
          <tbody>
            <tr v-for="c in contratiInScadenza" :key="c.id" :class="['tbl-clickable', c.daysToEnd <= 0 ? 'bg-red-100 border-l-4 border-l-red-400' : c.daysToEnd <= 7 ? 'bg-amber-100 border-l-4 border-l-amber-400' : c.daysToEnd <= 30 ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : '']">
              <td class="font-medium text-amber-900 relative pl-6">
                <span v-if="c.daysToEnd <= 7" class="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" :class="c.daysToEnd <= 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-400'"></span>
                {{ c.nome }} {{ c.cognome }}
              </td>
              <td><span class="badge badge-gray">{{ c.team }}</span></td>
              <td class="font-mono text-sm text-amber-800">{{ fmtDateShort(c.scadenzaContratto) }}</td>
              <td><span :class="['badge', c.daysToEnd <= 0 ? 'badge-red' : c.daysToEnd <= 7 ? 'badge-orange' : 'badge-yellow']">{{ c.daysToEnd }}gg</span></td>
              <td><span class="text-xs text-amber-800">{{ c.esitoProva }}</span></td>
              <td><button @click="openReminderCEO(c)" class="text-amber-700 hover:text-amber-900 font-medium text-sm">Invia CEO</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-3 bg-amber-100 border-t border-amber-200 text-xs text-amber-900">
        ℹ Reminder: Inviare report valutazione di prova al CEO <strong>1 mese prima</strong> della scadenza contratto
      </div>
    </div>

    <!-- Main grid -->
    <div class="grid grid-cols-12 gap-5">
      <!-- Azioni urgenti -->
      <div class="col-span-12 xl:col-span-8 card">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">Azioni urgenti</h3>
          <span class="text-xs text-gray-400">{{ urgenti.length }} elementi</span>
        </div>
        <div class="overflow-x-auto">
          <table class="tbl">
            <thead><tr>
              <th>Dipendente</th><th>Team</th><th>Tipo</th><th>Scadenza</th><th>Azione</th><th>Modifica</th>
            </tr></thead>
            <tbody>
              <tr v-for="u in urgenti.slice(0,10)" :key="u.key" :class="['tbl-clickable', u.rowClass]">
                <td class="font-medium relative pl-6">
                  <span class="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" :class="u.critical ? 'bg-red-500 animate-pulse' : 'bg-amber-400'"></span>
                  {{ u.nome }} {{ u.cognome }}
                </td>
                <td><span class="badge badge-gray">{{ u.team }}</span></td>
                <td><span :class="['badge', u.badgeClass]">{{ u.tipo }}</span></td>
                <td class="font-mono text-sm">{{ fmtDateShort(u.data) }}</td>
                <td><span :class="['badge', u.urgClass]">{{ u.azione }}</span></td>
                <td><button @click="openEditModal(u)" class="text-primary-600 hover:text-primary-800 font-medium text-sm">Modifica</button></td>
              </tr>
              <tr v-if="urgenti.length === 0">
                <td colspan="6" class="text-center py-8 text-gray-400">✅ Nessuna azione urgente</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Distribuzione team -->
      <div class="col-span-12 xl:col-span-4 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">Team distribution</h3>
        <div class="space-y-2.5">
          <div v-for="t in topTeams" :key="t.team" class="flex items-center gap-3">
            <span class="text-xs text-gray-500 w-28 truncate">{{ t.team }}</span>
            <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-primary-500 rounded-full transition-all" :style="{ width: (t.n / maxTeam * 100) + '%' }"></div>
            </div>
            <span class="text-xs font-semibold text-gray-700 w-6 text-right">{{ t.n }}</span>
          </div>
        </div>
      </div>

      <!-- Burnout per team -->
      <div class="col-span-12 md:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-1">Burnout risk per team</h3>
        <p class="text-xs text-gray-400 mb-4">Basato su colloqui P&C (quando disponibili)</p>
        <div v-if="store.colloquiPC.length === 0" class="py-12 text-center">
          <p class="text-gray-500 text-sm">Nessun dato P&C disponibile</p>
          <p class="text-gray-400 text-xs mt-1">I dati compariranno quando verranno compilati i colloqui</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="t in teamStatsFiltered" :key="t.team">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">{{ t.team }}</span>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400">Esaur. {{ t.avgEsaur ?? '—' }}</span>
                <span v-if="t.burnoutAlto > 0" class="badge badge-red">{{ t.burnoutAlto }} alto</span>
              </div>
            </div>
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all"
                :style="{ width: t.avgEsaur ? (t.avgEsaur / 5 * 100) + '%' : '0%', background: t.avgEsaur >= 4 ? '#ef4444' : t.avgEsaur >= 3 ? '#f59e0b' : '#10b981' }">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Retention & stato -->
      <div class="col-span-12 md:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">Retention & Stato</h3>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-emerald-50 rounded-xl p-3 text-center">
            <div class="text-2xl font-bold text-emerald-700">{{ retentionRate }}%</div>
            <div class="text-xs text-emerald-600 mt-0.5">Retention rate</div>
          </div>
          <div class="bg-red-50 rounded-xl p-3 text-center">
            <div class="text-2xl font-bold text-red-700">{{ turnoverCount }}</div>
            <div class="text-xs text-red-600 mt-0.5">Uscite totali</div>
          </div>
        </div>
        <div class="space-y-2">
          <div v-for="s in statoDistrib" :key="s.label" class="flex items-center gap-3">
            <span :class="['w-2 h-2 rounded-full shrink-0', s.dot]"></span>
            <span class="text-xs text-gray-600 flex-1">{{ s.label }}</span>
            <span class="text-xs font-semibold text-gray-900">{{ s.n }}</span>
          </div>
        </div>
      </div>

      <!-- Contratti mix -->
      <div class="col-span-12 md:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">Mix contrattuale</h3>
        <div class="space-y-2.5">
          <div v-for="c in contractMix" :key="c.tipo" class="flex items-center gap-3">
            <span :class="['badge', c.badge]">{{ c.label }}</span>
            <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-primary-400 rounded-full" :style="{ width: (c.n / totale * 100) + '%' }"></div>
            </div>
            <span class="text-xs font-semibold text-gray-700">{{ c.n }}</span>
          </div>
        </div>
      </div>

      <!-- Wellness radar summary -->
      <div class="col-span-12 md:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-1">Benessere medio (ultimo colloquio)</h3>
        <p class="text-xs text-gray-400 mb-4">Scale validate: MBI-GS · Copenhagen BI · JD-R · WHO-5 · Mobley</p>
        <div v-if="store.colloquiPC.length === 0" class="py-12 text-center">
          <p class="text-gray-500 text-sm">Nessun dato P&C disponibile</p>
          <p class="text-gray-400 text-xs mt-1">I dati compariranno quando verranno compilati i colloqui</p>
        </div>
        <div v-else class="space-y-3">
          <DimBar label="Esaurimento emotivo (MBI)" :value="globalAvg.esaur" :inverted="true" />
          <DimBar label="Carico lavoro (CBI)" :value="globalAvg.carico" :inverted="true" />
          <DimBar label="Motivazione & Autonomia (JD-R)" :value="globalAvg.motiv" />
          <DimBar label="Supporto & Chiarezza (JD-R)" :value="globalAvg.supp" />
          <DimBar label="Equilibrio vita-lavoro (WHO-5)" :value="globalAvg.equil" />
          <DimBar label="Intenzione di restare (Mobley)" :value="globalAvg.intent" />
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL INLINE EDIT URGENZA — Full feedback form (consistent with Onboarding/P&C) -->
  <Modal :open="!!selectedUrgenza" @close="closeEditModal" :title="modalTitle" width="880px">
    <div v-if="selectedUrgenza" class="space-y-5">
      <!-- Header info dipendente -->
      <div class="grid grid-cols-4 gap-3">
        <InfoBlock label="Dipendente" :value="selectedUrgenza.nome + ' ' + selectedUrgenza.cognome" />
        <InfoBlock label="Team" :value="selectedUrgenza.team" />
        <InfoBlock label="Tipo azione" :value="selectedUrgenza.tipo" />
        <InfoBlock label="Scadenza" :value="fmtDateShort(selectedUrgenza.data)" highlight />
      </div>

      <!-- ─── Legenda scale scientifiche ─── -->
      <details class="bg-amber-50 border border-amber-200 rounded-xl p-4 group">
        <summary class="cursor-pointer text-sm font-semibold text-amber-800 select-none flex items-center gap-2">
          Legenda Scale Scientifiche
          <span class="text-xs font-normal text-amber-600">(clicca per espandere)</span>
        </summary>
        <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
          <div class="bg-white rounded-lg p-3 border border-amber-100">
            <p class="font-semibold text-gray-900 mb-1">MBI-GS — Maslach Burnout Inventory (General Survey)</p>
            <p>Misura il livello di <b>esaurimento emotivo</b> e depersonalizzazione legato al lavoro. Sviluppata da Christina Maslach, è il gold standard per la valutazione del burnout.</p>
            <p class="mt-1 text-red-600 font-medium">! Scala invertita: punteggio alto = situazione peggiore</p>
          </div>
          <div class="bg-white rounded-lg p-3 border border-amber-100">
            <p class="font-semibold text-gray-900 mb-1">CBI — Copenhagen Burnout Inventory</p>
            <p>Valuta il <b>carico di lavoro percepito</b> e lo stress lavorativo. Complementare al MBI, si focalizza sulle cause organizzative del burnout (Kristensen et al.).</p>
            <p class="mt-1 text-red-600 font-medium">! Scala invertita: punteggio alto = situazione peggiore</p>
          </div>
          <div class="bg-white rounded-lg p-3 border border-amber-100">
            <p class="font-semibold text-gray-900 mb-1">JD-R Motivazione — Job Demands-Resources (Bakker & Demerouti)</p>
            <p>Misura la <b>motivazione intrinseca e autonomia</b> lavorativa. Il modello JD-R bilancia domande lavorative e risorse disponibili: risorse alte → engagement, domande alte → stress.</p>
            <p class="mt-1 text-emerald-600 font-medium">✓ Punteggio alto = situazione migliore</p>
          </div>
          <div class="bg-white rounded-lg p-3 border border-amber-100">
            <p class="font-semibold text-gray-900 mb-1">JD-R Supporto — Job Demands-Resources (Bakker & Demerouti)</p>
            <p>Valuta il <b>supporto organizzativo percepito</b> e la chiarezza del ruolo. Include supporto del manager, dei colleghi e chiarezza nelle aspettative lavorative.</p>
            <p class="mt-1 text-emerald-600 font-medium">✓ Punteggio alto = situazione migliore</p>
          </div>
          <div class="bg-white rounded-lg p-3 border border-amber-100">
            <p class="font-semibold text-gray-900 mb-1">WHO-5 — World Health Organization Well-Being Index</p>
            <p>Indice di <b>benessere e equilibrio vita-lavoro</b> dell'OMS. Cinque item che valutano umore positivo, vitalità e interesse nella vita quotidiana. Validato in oltre 30 lingue.</p>
            <p class="mt-1 text-emerald-600 font-medium">✓ Punteggio alto = situazione migliore</p>
          </div>
          <div class="bg-white rounded-lg p-3 border border-amber-100">
            <p class="font-semibold text-gray-900 mb-1">Mobley — Modello del Turnover (Mobley, 1977)</p>
            <p>Misura l'<b>intenzione di restare</b> nell'organizzazione. Il modello di Mobley collega insoddisfazione → pensiero di lasciare → ricerca alternative → intenzione → turnover effettivo.</p>
            <p class="mt-1 text-emerald-600 font-medium">✓ Punteggio alto = situazione migliore</p>
          </div>
        </div>
      </details>

      <!-- ─── FU1 / FU2: Onboarding follow-up form ─── -->
      <Section v-if="selectedUrgenza.tipo === 'FU1' || selectedUrgenza.tipo === 'FU2'" :title="selectedUrgenza.tipo === 'FU1' ? 'Follow-up 1 — Colloquio con dipendente (30gg)' : 'Follow-up 2 — Dipendente + Manager (fine prova -30gg)'">`
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="form-label">Data colloquio</label>
            <input class="form-input" type="date" v-model="editForm.dataColloquio">
          </div>
          <div>
            <label class="form-label">Stato {{ selectedUrgenza.tipo }}</label>
            <select class="form-select" v-model="editForm.statoAzione">
              <option>Da Fare</option><option>In Corso</option><option>Fatto</option>
            </select>
          </div>
        </div>

        <!-- Scale behavioral wellness -->
        <div class="bg-blue-50 rounded-xl p-5 border border-blue-100 space-y-5">
          <p class="text-xs font-semibold text-blue-600 uppercase tracking-widest">Scale Behavioral Wellness ({{ selectedUrgenza.tipo }})</p>
          <div class="grid grid-cols-2 gap-5">
            <ScaleInput label="Esaurimento emotivo (MBI-GS, Maslach)" v-model="editForm.esaur" :inverted="true" hint="↑ = peggio" minLabel="1 = mai" maxLabel="5 = ogni giorno" />
            <ScaleInput label="Carico di lavoro (CBI, Copenhagen)" v-model="editForm.carico" :inverted="true" hint="↑ = peggio" minLabel="1 = basso" maxLabel="5 = insostenibile" />
            <ScaleInput label="Motivazione & Autonomia (JD-R, Bakker)" v-model="editForm.motiv" hint="↑ = meglio" minLabel="1 = molto bassa" maxLabel="5 = molto alta" />
            <ScaleInput label="Supporto & Chiarezza (JD-R, Bakker)" v-model="editForm.supp" hint="↑ = meglio" minLabel="1 = assente" maxLabel="5 = eccellente" />
            <ScaleInput label="Equilibrio vita-lavoro (WHO-5)" v-model="editForm.equil" hint="↑ = meglio" minLabel="1 = mai" maxLabel="5 = sempre" />
            <ScaleInput label="Intenzione di restare (Mobley)" v-model="editForm.intent" hint="↑ = meglio" minLabel="1 = molto bassa" maxLabel="5 = molto alta" />
          </div>
          <div>
            <label class="form-label">Note colloquio</label>
            <textarea class="form-textarea" rows="3" v-model="editForm.note" placeholder="Osservazioni, azioni concordate..."></textarea>
          </div>
        </div>
      </Section>

      <!-- ─── Fine prova: Valutazione periodo di prova ─── -->
      <Section v-if="selectedUrgenza.tipo === 'Fine prova'" title="Valutazione Periodo di Prova">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="form-label">Esito periodo di prova</label>
            <select class="form-select" v-model="editForm.esitoProva">
              <option>In Corso</option><option>Superato</option><option>Non Superato</option>
            </select>
          </div>
          <div>
            <label class="form-label">Data valutazione</label>
            <input class="form-input" type="date" v-model="editForm.dataColloquio">
          </div>
        </div>
        <div v-if="editForm.esitoProva === 'Superato'" class="p-4 bg-emerald-50 rounded-xl border border-emerald-200 mb-4">
          <p class="text-sm font-medium text-emerald-800">✅ Periodo di prova superato — il dipendente passa al rapporto pieno.</p>
        </div>
        <div v-if="editForm.esitoProva === 'Non Superato'" class="p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
          <p class="text-sm font-medium text-red-800">❌ Periodo di prova non superato.<br>Aggiornare lo stato dipendente qui sotto.</p>
        </div>

        <!-- Scale finali -->
        <div class="bg-purple-50 rounded-xl p-5 border border-purple-100 space-y-5">
          <p class="text-xs font-semibold text-purple-600 uppercase tracking-widest">Scale Behavioral Wellness (Valutazione finale)</p>
          <div class="grid grid-cols-2 gap-5">
            <ScaleInput label="Esaurimento emotivo (MBI-GS)" v-model="editForm.esaur" :inverted="true" hint="↑ = peggio" minLabel="1 = mai" maxLabel="5 = ogni giorno" />
            <ScaleInput label="Carico di lavoro (CBI)" v-model="editForm.carico" :inverted="true" hint="↑ = peggio" minLabel="1 = basso" maxLabel="5 = insostenibile" />
            <ScaleInput label="Motivazione & Autonomia (JD-R)" v-model="editForm.motiv" hint="↑ = meglio" minLabel="1 = molto bassa" maxLabel="5 = molto alta" />
            <ScaleInput label="Supporto & Chiarezza (JD-R)" v-model="editForm.supp" hint="↑ = meglio" minLabel="1 = assente" maxLabel="5 = eccellente" />
            <ScaleInput label="Equilibrio vita-lavoro (WHO-5)" v-model="editForm.equil" hint="↑ = meglio" minLabel="1 = mai" maxLabel="5 = sempre" />
            <ScaleInput label="Intenzione di restare (Mobley)" v-model="editForm.intent" hint="↑ = meglio" minLabel="1 = molto bassa" maxLabel="5 = molto alta" />
          </div>
          <div>
            <label class="form-label">Note valutazione</label>
            <textarea class="form-textarea" rows="3" v-model="editForm.note" placeholder="Osservazioni su periodo di prova..."></textarea>
          </div>
        </div>
      </Section>

      <!-- ─── Burnout: Colloquio P&C ─── -->
      <Section v-if="selectedUrgenza.tipo === 'Burnout'" title="Colloquio P&C — Monitoraggio Burnout">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="form-label">Data colloquio</label>
            <input class="form-input" type="date" v-model="editForm.dataColloquio">
          </div>
          <div>
            <label class="form-label">Esito</label>
            <select class="form-select" v-model="editForm.esito">
              <option>Positivo</option><option>Da Monitorare</option><option>Critico</option><option>Urgente</option>
            </select>
          </div>
        </div>

        <div class="bg-red-50 rounded-xl p-5 border border-red-100 space-y-5">
          <p class="text-xs font-semibold text-red-600 uppercase tracking-widest">Scale scientifiche 1–5 (Colloquio P&C)</p>
          <div class="grid grid-cols-2 gap-5">
            <ScaleInput label="Esaurimento emotivo (MBI-GS, Maslach)" v-model="editForm.esaur" :inverted="true" hint="↑ = peggio" minLabel="1 = mai" maxLabel="5 = ogni giorno" />
            <ScaleInput label="Carico di lavoro (CBI, Copenhagen)" v-model="editForm.carico" :inverted="true" hint="↑ = peggio" minLabel="1 = basso" maxLabel="5 = insostenibile" />
            <ScaleInput label="Motivazione & Autonomia (JD-R, Bakker)" v-model="editForm.motiv" hint="↑ = meglio" minLabel="1 = molto bassa" maxLabel="5 = molto alta" />
            <ScaleInput label="Supporto & Chiarezza (JD-R, Bakker)" v-model="editForm.supp" hint="↑ = meglio" minLabel="1 = assente" maxLabel="5 = eccellente" />
            <ScaleInput label="Equilibrio vita-lavoro (WHO-5)" v-model="editForm.equil" hint="↑ = meglio" minLabel="1 = mai" maxLabel="5 = sempre" />
            <ScaleInput label="Intenzione di restare (Mobley)" v-model="editForm.intent" hint="↑ = meglio" minLabel="1 = molto bassa" maxLabel="5 = molto alta" />
          </div>
          <div>
            <label class="form-label">Note colloquio</label>
            <textarea class="form-textarea" rows="3" v-model="editForm.note" placeholder="Osservazioni, azioni concordate per burnout..."></textarea>
          </div>
        </div>
      </Section>

      <!-- ─── Stato Dipendente (sempre visibile) ─── -->
      <Section title="Stato Dipendente">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Stato attuale</label>
            <select class="form-select" v-model="editForm.statoDipendente">
              <option v-for="s in statiDipendente" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div v-if="editForm.statoDipendente !== 'Attivo'">
            <label class="form-label">Data Uscita</label>
            <input type="date" v-model="editForm.dataUscita" class="form-input" />
          </div>
        </div>
        <div v-if="editForm.statoDipendente !== 'Attivo'" class="mt-3 bg-orange-50 p-4 rounded-xl border border-orange-200 space-y-3">
          <div>
            <label class="form-label text-orange-800">Motivo Uscita</label>
            <textarea v-model="editForm.motivoUscita" rows="2" class="form-textarea" placeholder="Motivo..."></textarea>
          </div>
        </div>
      </Section>
    </div>

    <template #footer>
      <button @click="closeEditModal" class="btn btn-secondary">Annulla</button>
      <button @click="saveUrgenzaEdit" class="btn btn-primary">💾 Salva tutto</button>
    </template>
  </Modal>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import { useExport } from '@/composables/useExport.js'
import KpiCard from '@/components/ui/KpiCard.vue'
import DimBar  from '@/components/ui/DimBar.vue'
import KanbanBoard from '@/components/dashboard/KanbanBoard.vue'
import Modal from '@/components/ui/Modal.vue'
import Section from '@/components/ui/Section.vue'
import ScaleInput from '@/components/ui/ScaleInput.vue'
import InfoBlock from '@/components/ui/InfoBlock.vue'

const router = useRouter()
const store = useHrStore()
const { fmtDateShort, contractBadge } = useHelpers()
const { exportToExcel, exportToJSON, exportKanbanCSV } = useExport()

// ─── Edit modal state ───
const selectedUrgenza = ref(null)
const statiDipendente = ['Attivo', 'Dimissioni Volontarie', 'Mancato Superamento Prova', 'In Uscita Concordata', 'Licenziato']

const editForm = reactive({
  statoAzione: 'In Corso',
  esitoProva: 'In Corso',
  esito: 'Positivo',
  dataColloquio: '',
  esaur: null, carico: null, motiv: null, supp: null, equil: null, intent: null,
  note: '',
  statoDipendente: 'Attivo',
  dataUscita: '',
  motivoUscita: ''
})

const modalTitle = computed(() => {
  if (!selectedUrgenza.value) return ''
  const tipo = selectedUrgenza.value.tipo
  if (tipo === 'FU1') return '💬 Follow-up 1 — ' + selectedUrgenza.value.nome + ' ' + selectedUrgenza.value.cognome
  if (tipo === 'FU2') return '👔 Follow-up 2 — ' + selectedUrgenza.value.nome + ' ' + selectedUrgenza.value.cognome
  if (tipo === 'Fine prova') return '🏁 Valutazione Prova — ' + selectedUrgenza.value.nome + ' ' + selectedUrgenza.value.cognome
  if (tipo === 'Burnout') return '🔴 Monitoraggio Burnout — ' + selectedUrgenza.value.nome + ' ' + selectedUrgenza.value.cognome
  return '✎ Modifica — ' + selectedUrgenza.value.nome + ' ' + selectedUrgenza.value.cognome
})

const openEditModal = (urgenza) => {
  // Find enriched employee and existing colloquio data
  const empId = parseInt(urgenza.key)  // key is like "3fu1s" — extract numeric part
  const emp = store.employees.find(e => urgenza.key.startsWith(String(e.id)))
  const coll = emp ? (store.colloqui.find(c => c.nome === emp.nome) || {}) : {}

  // Pre-populate form with existing data
  const today = new Date().toISOString().split('T')[0]

  // Reset all scales
  editForm.esaur = null; editForm.carico = null; editForm.motiv = null
  editForm.supp = null; editForm.equil = null; editForm.intent = null
  editForm.note = ''
  editForm.dataColloquio = today
  editForm.esito = 'Positivo'
  editForm.statoDipendente = emp?.stato || 'Attivo'
  editForm.dataUscita = emp?.dataUscita || ''
  editForm.motivoUscita = emp?.motivoUscita || ''

  if (urgenza.tipo === 'FU1') {
    editForm.statoAzione = emp?.statoFU1 || 'Da Fare'
    // Pre-fill from existing FU1 colloquio if available
    if (coll.c1_esaur) {
      editForm.esaur = coll.c1_esaur; editForm.carico = coll.c1_carico
      editForm.motiv = coll.c1_motiv; editForm.supp = coll.c1_supp
      editForm.equil = coll.c1_equil; editForm.intent = coll.c1_intent
      editForm.note = coll.c1_note || ''
    }
  } else if (urgenza.tipo === 'FU2') {
    editForm.statoAzione = emp?.statoFU2Dip || 'Da Fare'
    if (coll.c2_esaur) {
      editForm.esaur = coll.c2_esaur; editForm.carico = coll.c2_carico
      editForm.motiv = coll.c2_motiv; editForm.supp = coll.c2_supp
      editForm.equil = coll.c2_equil; editForm.intent = coll.c2_intent
      editForm.note = coll.c2_note || ''
    }
  } else if (urgenza.tipo === 'Fine prova') {
    editForm.esitoProva = emp?.esitoProva || 'In Corso'
    // Pre-fill from FU2 (latest) if available
    if (coll.c2_esaur) {
      editForm.esaur = coll.c2_esaur; editForm.carico = coll.c2_carico
      editForm.motiv = coll.c2_motiv; editForm.supp = coll.c2_supp
      editForm.equil = coll.c2_equil; editForm.intent = coll.c2_intent
    }
  } else if (urgenza.tipo === 'Burnout') {
    // Pre-fill from P&C colloquio
    const pc = store.colloquiPC.find(c => c.employeeId === emp?.id)
    if (pc) {
      editForm.esaur = pc.esaur; editForm.carico = pc.carico
      editForm.motiv = pc.motiv; editForm.supp = pc.supp
      editForm.equil = pc.equil; editForm.intent = pc.intent
      editForm.note = pc.note || ''
      editForm.esito = pc.esito || 'Critico'
    }
  }

  selectedUrgenza.value = { ...urgenza }
}

const closeEditModal = () => {
  selectedUrgenza.value = null
}

const saveUrgenzaEdit = () => {
  if (!selectedUrgenza.value) return
  const u = selectedUrgenza.value
  const emp = store.employees.find(e => u.key.startsWith(String(e.id)))
  if (!emp) { selectedUrgenza.value = null; return }

  const tipo = u.tipo

  // ── Save scale data to colloqui (feeds Onboarding analytics) ──
  if (tipo === 'FU1') {
    const collData = {
      c1_esaur: editForm.esaur, c1_carico: editForm.carico,
      c1_motiv: editForm.motiv, c1_supp: editForm.supp,
      c1_equil: editForm.equil, c1_intent: editForm.intent,
      c1_note: editForm.note
    }
    store.saveColloquio(emp.nome, collData)
    store.updateEmployee(emp.id, {
      statoFU1: editForm.statoAzione,
      noteFU1: editForm.note
    })
  } else if (tipo === 'FU2') {
    const collData = {
      c2_esaur: editForm.esaur, c2_carico: editForm.carico,
      c2_motiv: editForm.motiv, c2_supp: editForm.supp,
      c2_equil: editForm.equil, c2_intent: editForm.intent,
      c2_note: editForm.note
    }
    store.saveColloquio(emp.nome, collData)
    store.updateEmployee(emp.id, {
      statoFU2Dip: editForm.statoAzione,
      noteFU2Dip: editForm.note
    })
  } else if (tipo === 'Fine prova') {
    // Save valutazione scales to colloquio (c2 = final assessment)
    const collData = {
      c2_esaur: editForm.esaur, c2_carico: editForm.carico,
      c2_motiv: editForm.motiv, c2_supp: editForm.supp,
      c2_equil: editForm.equil, c2_intent: editForm.intent,
      c2_note: editForm.note
    }
    store.saveColloquio(emp.nome, collData)
    store.updateEmployee(emp.id, { esitoProva: editForm.esitoProva })
  } else if (tipo === 'Burnout') {
    // Save as P&C colloquio (feeds P&C analytics)
    store.saveColloquioPC(emp.id, {
      date: editForm.dataColloquio,
      esaur: editForm.esaur, carico: editForm.carico,
      motiv: editForm.motiv, supp: editForm.supp,
      equil: editForm.equil, intent: editForm.intent,
      esito: editForm.esito,
      note: editForm.note
    })
  }

  // ── Update stato dipendente if changed ──
  if (editForm.statoDipendente !== emp.stato) {
    const statoUpdate = { stato: editForm.statoDipendente }
    if (editForm.statoDipendente !== 'Attivo') {
      statoUpdate.dataUscita = editForm.dataUscita || new Date().toISOString().split('T')[0]
      statoUpdate.motivoUscita = editForm.motivoUscita || editForm.statoDipendente
    } else {
      statoUpdate.dataUscita = null
      statoUpdate.motivoUscita = ''
    }
    store.updateEmployee(emp.id, statoUpdate)
  }

  selectedUrgenza.value = null
}
const kpi = computed(() => store.kpiScadenze)
const kpiPC = computed(() => store.kpiPC)
const kpiOnboarding = computed(() => store.kpiOnboarding)
const kpiContratti = computed(() => store.kpiContratti)
const attivi = computed(() => store.employees.filter(e => e.stato === 'Attivo').length)
const totale = computed(() => store.employees.length)

const urgenti = computed(() => {
  const today = new Date()
  const list = []
  store.enrichedEmployees.forEach(e => {
    // Solo urgenti da fare da qui in poi - escludere scaduti (days < 0)
    if (e.fu1Urgente) {
      const days = e.daysToFU1
      if (days >= 0) {  // Escludere scaduti
        list.push({ key: e.id+'fu1u', nome: e.nome, cognome: e.cognome, team: e.team, tipo: 'FU1', data: e.scadenzaFU1, azione: `${days}gg`, badgeClass: 'badge-blue', urgClass: 'badge-yellow', rowClass: days <= 7 ? 'bg-amber-100 border-l-4 border-l-amber-400' : 'bg-yellow-50 border-l-4 border-l-yellow-400', critical: false, daysRemaining: days })
      }
    }
    if (e.fu2Urgente) {
      const days = e.daysToFU2
      if (days >= 0) {  // Escludere scaduti
        list.push({ key: e.id+'fu2u', nome: e.nome, cognome: e.cognome, team: e.team, tipo: 'FU2', data: e.scadenzaFU2, azione: `${days}gg`, badgeClass: 'badge-purple', urgClass: 'badge-yellow', rowClass: days <= 7 ? 'bg-amber-100 border-l-4 border-l-amber-400' : 'bg-yellow-50 border-l-4 border-l-yellow-400', critical: false, daysRemaining: days })
      }
    }
    if (e.provaUrgente) {
      const days = e.daysToProva
      if (days >= 0) {  // Escludere scaduti
        list.push({ key: e.id+'fp', nome: e.nome, cognome: e.cognome, team: e.team, tipo: 'Fine prova', data: e.fineProva, azione: `${days}gg`, badgeClass: 'badge-indigo', urgClass: days <= 7 ? 'badge-orange' : 'badge-yellow', rowClass: days <= 7 ? 'bg-amber-100 border-l-4 border-l-amber-400' : 'bg-yellow-50 border-l-4 border-l-yellow-400', critical: false, daysRemaining: days })
      }
    }
    // Burnout risk: show only if P&C data exists
    if (store.colloquiPC.length > 0 && e.burnoutRisk === 'alto') list.push({ key: e.id+'br', nome: e.nome, cognome: e.cognome, team: e.team, tipo: 'Burnout', data: null, azione: 'Monitorare', badgeClass: 'badge-red', urgClass: 'badge-red', rowClass: 'bg-red-100 border-l-4 border-l-red-400', critical: true, daysRemaining: 999 })
  })
  return list.sort((a, b) => (a.daysRemaining || 999) - (b.daysRemaining || 999))
})

const topTeams = computed(() => store.teamStats.slice(0, 8))
const maxTeam  = computed(() => Math.max(...topTeams.value.map(t => t.n), 1))
const teamStatsFiltered = computed(() => store.teamStats.filter(t => t.avgEsaur != null).slice(0, 6))

// Contratti determinati in scadenza entro 30 giorni - con reminder valutazione prova
const contratiInScadenza = computed(() => {
  const today = new Date()
  const list = []
  store.employees.forEach(e => {
    if (e.tipoContratto !== 'determinato' || !e.scadenzaContratto || e.stato !== 'Attivo') return
    const scadenza = new Date(e.scadenzaContratto)
    const daysToEnd = Math.round((scadenza - today) / 86400000)
    // Show contratti che scadono entro 30 giorni oppure sono già scaduti
    if (daysToEnd <= 30) {
      list.push({
        id: e.id,
        nome: e.nome,
        cognome: e.cognome,
        team: e.team,
        scadenzaContratto: e.scadenzaContratto,
        daysToEnd: daysToEnd,
        esitoProva: e.esitoProva,
        urgente: daysToEnd <= 7 ? 'URGENTE' : daysToEnd <= 0 ? 'SCADUTO' : 'In tempo'
      })
    }
  })
  return list.sort((a, b) => a.daysToEnd - b.daysToEnd)
})

// Funzione per aprire reminder CEO
const openReminderCEO = (contratto) => {
  const message = `
REMINDER: Report Valutazione di Prova
Dipendente: ${contratto.nome} ${contratto.cognome}
Team: ${contratto.team}
Scadenza Contratto: ${fmtDateShort(contratto.scadenzaContratto)}
Esito Prova: ${contratto.esitoProva}

⚠️ Inviare report valutazione di prova al CEO
  `
  alert(message)
  // In futuro: integrare con email o system notification
}

const statoDistrib = computed(() => {
  const dotMap = { 'Attivo': 'bg-emerald-400', 'Dimissioni Volontarie': 'bg-red-400', 'Mancato Superamento Prova': 'bg-orange-400', 'In Uscita Concordata': 'bg-amber-400' }
  const map = {}
  store.employees.forEach(e => { map[e.stato] = (map[e.stato] || 0) + 1 })
  return Object.entries(map).map(([label, n]) => ({ label, n, dot: dotMap[label] || 'bg-gray-400' })).sort((a,b)=>b.n-a.n)
})

const retentionRate = computed(() => {
  const t = totale.value
  const a = attivi.value
  return t ? Math.round(a / t * 100) : 100
})
const turnoverCount = computed(() => store.employees.filter(e => e.stato !== 'Attivo').length)

const LABELS = { indeterminato:'Indeterminato', determinato:'Determinato', 'full-time':'Full-time', 'part-time':'Part-time', apprendistato:'Apprendistato', stage:'Stage', consulenza:'Consulenza' }
const contractMix = computed(() => {
  const map = {}
  store.employees.forEach(e => { map[e.tipoContratto] = (map[e.tipoContratto] || 0) + 1 })
  return Object.entries(map).map(([tipo, n]) => ({ tipo, label: LABELS[tipo]||tipo, n, badge: contractBadge(tipo) })).sort((a,b)=>b.n-a.n)
})

const globalAvg = computed(() => {
  const dims = { esaur:[], carico:[], motiv:[], supp:[], equil:[], intent:[] }
  store.enrichedEmployees.forEach(e => {
    if (e.lastC) { dims.esaur.push(e.lastC.esaur); dims.carico.push(e.lastC.carico); dims.motiv.push(e.lastC.motiv); dims.supp.push(e.lastC.supp); dims.equil.push(e.lastC.equil); dims.intent.push(e.lastC.intent) }
  })
  const avg = arr => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length*10)/10 : null
  return { esaur:avg(dims.esaur), carico:avg(dims.carico), motiv:avg(dims.motiv), supp:avg(dims.supp), equil:avg(dims.equil), intent:avg(dims.intent) }
})

// ─── Export functions ───
const handleExportExcel = () => {
  const storeSnapshot = {
    employees: store.employees,
    colloqui: store.colloqui,
    ferie: store.ferie,
    colloquiPC: store.colloquiPC,
    dimissioni: store.dimissioni,
    valutazioni360: store.valutazioni360,
    allUrgenze: store.allUrgenze
  }
  exportToExcel(storeSnapshot)
}

const handleExportJSON = () => {
  const storeSnapshot = {
    employees: store.employees,
    colloqui: store.colloqui,
    ferie: store.ferie,
    colloquiPC: store.colloquiPC,
    dimissioni: store.dimissioni,
    valutazioni360: store.valutazioni360,
    allUrgenze: store.allUrgenze
  }
  exportToJSON(storeSnapshot)
}

const handleExportCSV = () => {
  exportKanbanCSV(store.allUrgenze)
}
</script>
