<template>
  <div class="p-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">🏖️ Ferie, Malattie & Assenze</h2>
        <p class="text-sm text-gray-500 mt-1">Gestione completa per tutti i dipendenti · Anno 2026</p>
      </div>
      <div class="flex gap-6 text-right">
        <div>
          <div class="text-2xl font-bold text-indigo-600">{{ countBySocieta.silicon }}</div>
          <div class="text-[10px] text-gray-400">Silicon</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-emerald-600">{{ countBySocieta.move }}</div>
          <div class="text-[10px] text-gray-400">Move Solutions</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-primary-600">{{ ferie.length }}</div>
          <div class="text-xs text-gray-500">dipendenti</div>
        </div>
      </div>
    </div>

    <!-- KPI -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      <KpiCard label="Ferie annuali" :value="r2(totals.annuali)" icon="📅" color="blue" />
      <KpiCard label="Ferie maturate" :value="r2(totals.spettanti)" icon="📈" color="indigo" />
      <KpiCard label="Ferie godute" :value="r2(totals.godute)" icon="✅" color="emerald" />
      <KpiCard label="Ferie residue" :value="r2(totals.residue)" icon="⏳" color="amber" :alert="totals.residue > totals.spettanti * 0.7" />
      <KpiCard label="% Godute" :value="totals.percGodute + '%'" icon="📊" color="purple" />
      <KpiCard label="Permessi mat." :value="r2(totals.permessiSpett)" icon="📋" color="violet" />
      <KpiCard label="Gg Malattia" :value="totals.malattia" icon="🤒" color="red" />
      <KpiCard label="Assenze N.G." :value="totals.assenze" icon="⚠️" color="red" :alert="totals.assenze > 0" />
    </div>

    <!-- Filtri -->
    <div class="flex flex-wrap items-center gap-3">
      <input v-model="search" class="form-input max-w-xs" placeholder="🔍 Cerca dipendente...">
      <select v-model="filterSocieta" class="form-select w-40">
        <option value="">Tutte le società</option>
        <option value="Silicon">Silicon</option>
        <option value="Move Solutions">Move Solutions</option>
      </select>
      <select v-model="filterTeam" class="form-select w-44">
        <option value="">Tutti i team</option>
        <option v-for="t in teamsFiltered" :key="t">{{ t }}</option>
      </select>
      <select v-model="filterContratto" class="form-select w-44">
        <option value="">Tutti i contratti</option>
        <option value="proprio">Contratto proprio (21.96gg)</option>
        <option value="ccnl_commercio">CCNL Commercio (26gg+PAR)</option>
      </select>
      <select v-model="filterStatus" class="form-select w-44">
        <option value="">Tutti</option>
        <option value="residue_alte">Ferie residue > 20gg</option>
        <option value="malattia">Con malattia</option>
        <option value="assenze_ng">Con assenze N.G.</option>
        <option value="nessuna_feria">Nessuna ferie goduta</option>
      </select>
      <div class="ml-auto text-xs text-gray-400">{{ filtered.length }} di {{ ferie.length }} dipendenti</div>
    </div>

    <!-- Tabella dipendenti -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="tbl text-xs">
          <thead>
            <tr>
              <th class="cursor-pointer select-none" @click="toggleSort('nome')">
                Dipendente <span v-if="sortCol === 'nome'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th>Team</th>
              <th class="text-center">Contratto</th>
              <th class="text-center">Annuali</th>
              <th class="text-center">€/mese</th>
              <th class="text-center cursor-pointer select-none" @click="toggleSort('ferieSpettanti')">
                Maturate <span v-if="sortCol === 'ferieSpettanti'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="text-center">Residui AP</th>
              <th class="text-center cursor-pointer select-none" @click="toggleSort('ferieGodute')">
                Godute <span v-if="sortCol === 'ferieGodute'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="text-center cursor-pointer select-none" @click="toggleSort('ferieResidue')">
                Residue <span v-if="sortCol === 'ferieResidue'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="text-center">%</th>
              <th class="text-center cursor-pointer select-none" @click="toggleSort('permessiSpettantiGg')">
                Perm. Sp. <span v-if="sortCol === 'permessiSpettantiGg'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="text-center">Perm. God.</th>
              <th class="text-center">Perm. Res.</th>
              <th class="text-center cursor-pointer select-none" @click="toggleSort('ggMalattia')">
                Mal. <span v-if="sortCol === 'ggMalattia'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="text-center">Ep.</th>
              <th class="text-center cursor-pointer select-none" @click="toggleSort('assenzeNonGiust')">
                N.G. <span v-if="sortCol === 'assenzeNonGiust'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="text-center">Reg.</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in filtered" :key="f.nome" class="tbl-clickable" @click="openModal(f)">
              <td class="font-medium text-sm">{{ f.nome }}</td>
              <td>
                <span :class="['badge text-[10px]', f.societa === 'Silicon' ? 'badge-indigo' : 'badge-gray']">{{ f.societa || '—' }}</span>
                <span class="text-[10px] text-gray-400 block">{{ shortTeam(f.team) }}</span>
              </td>
              <td class="text-center">
                <span :class="['text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                  f.tipoContrattoFerie === 'proprio' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700']">
                  {{ f.tipoContrattoFerie === 'proprio' ? 'Proprio' : 'CCNL' }}
                </span>
              </td>
              <td class="text-center">{{ r2(f.ferieAnnuali) }}</td>
              <td class="text-center text-[10px] text-gray-400">{{ r2(f.rataMensile) }}</td>
              <td class="text-center">{{ r2(f.ferieSpettanti) }}</td>
              <td class="text-center">
                <span v-if="f.residuiAnniPrecedenti > 0" class="text-purple-600 font-medium">{{ r2(f.residuiAnniPrecedenti) }}</span>
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="text-center">{{ r2(f.ferieGodute) }}</td>
              <td class="text-center">
                <span :class="['font-semibold', f.ferieResidue > 20 ? 'text-amber-600' : f.ferieResidue > 10 ? 'text-yellow-600' : 'text-gray-700']">
                  {{ r2(f.ferieResidue) }}
                </span>
              </td>
              <td class="text-center">
                <div class="flex items-center gap-1 justify-center">
                  <div class="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-primary-400 rounded-full" :style="{ width: (f.percGodute || 0) + '%' }"></div>
                  </div>
                  <span class="text-[10px] text-gray-500">{{ f.percGodute || 0 }}%</span>
                </div>
              </td>
              <td class="text-center">
                <template v-if="f.tipoContrattoFerie === 'ccnl_commercio'">{{ r2(f.permessiSpettantiGg || 0) }}</template>
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="text-center">
                <template v-if="f.tipoContrattoFerie === 'ccnl_commercio'">{{ r2(f.permessiGodutiGg || 0) }}</template>
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="text-center">
                <template v-if="f.tipoContrattoFerie === 'ccnl_commercio'">
                  <span :class="['font-semibold', (f.permessiResiduiGg || 0) > 8 ? 'text-purple-600' : 'text-gray-700']">
                    {{ r2(f.permessiResiduiGg || 0) }}
                  </span>
                </template>
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="text-center">
                <span :class="(f.ggMalattia || 0) > 10 ? 'text-red-600 font-semibold' : ''">{{ r2(f.ggMalattia || 0) }}</span>
              </td>
              <td class="text-center text-gray-600">{{ f.episodiMalattia || 0 }}</td>
              <td class="text-center">
                <span :class="(f.assenzeNonGiust || 0) > 0 ? 'text-red-500 font-semibold' : ''">{{ r2(f.assenzeNonGiust || 0) }}</span>
              </td>
              <td class="text-center">
                <span class="badge badge-blue text-[10px]">{{ (f.entries || []).length }}</span>
              </td>
              <td>
                <button class="btn btn-ghost btn-xs" @click.stop="openModal(f)">✎</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== MODALE GESTIONE FERIE ===== -->
    <Modal :open="modal.open" :title="'Ferie & Assenze — ' + modal.data.nome" width="880px" @close="closeModal">
      <!-- Banner modifiche non salvate -->
      <div v-if="hasChanges" class="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-2xl">⚠️</span>
          <div>
            <p class="font-semibold text-amber-900">Modifiche non salvate</p>
            <p class="text-sm text-amber-700">Hai cambiato dei valori. Clicca il bottone sotto per salvarli.</p>
          </div>
        </div>
      </div>

      <div class="space-y-5">
        <!-- Tab switch -->
        <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button v-for="tab in tabs" :key="tab.key"
            :class="['flex-1 py-2 px-3 text-sm font-medium rounded-md transition', activeTab === tab.key ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700']"
            @click="activeTab = tab.key">
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>

        <!-- TAB: Riepilogo -->
        <div v-if="activeTab === 'riepilogo'">
          <!-- Contratto ferie -->
          <Section title="Tipo contratto ferie">
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer p-3 rounded-lg border-2 transition"
                :class="modal.data.tipoContrattoFerie === 'proprio' ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'"
                @click="changeContratto('proprio')">
                <input type="radio" name="contratto" value="proprio" :checked="modal.data.tipoContrattoFerie === 'proprio'" class="text-indigo-600">
                <div>
                  <div class="text-sm font-semibold text-gray-800">Contratto proprio</div>
                  <div class="text-[10px] text-gray-500">21.96 gg ferie (7.5h/giorno) · Solo ferie, no permessi</div>
                </div>
              </label>
              <label class="flex items-center gap-2 cursor-pointer p-3 rounded-lg border-2 transition"
                :class="modal.data.tipoContrattoFerie === 'ccnl_commercio' ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'"
                @click="changeContratto('ccnl_commercio')">
                <input type="radio" name="contratto" value="ccnl_commercio" :checked="modal.data.tipoContrattoFerie === 'ccnl_commercio'" class="text-emerald-600">
                <div>
                  <div class="text-sm font-semibold text-gray-800">CCNL Commercio</div>
                  <div class="text-[10px] text-gray-500">26 gg ferie + ROL 56h + Ex-festività 32h (88h = ~11gg permessi)</div>
                </div>
              </label>
            </div>
            <div class="mt-2 text-xs text-gray-400">
              Società: <strong>{{ modal.data.societa || '—' }}</strong> · Team: {{ modal.data.team }}
            </div>
          </Section>

          <Section title="Ferie annuali — Maturazione mensile">
            <div class="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4">
              <div class="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div class="text-xs text-blue-500 font-semibold uppercase">Annuali</div>
                  <div class="text-lg font-bold text-blue-900">{{ r2(modal.data.ferieAnnuali) }}</div>
                </div>
                <div>
                  <div class="text-xs text-blue-500 font-semibold uppercase">Rata/mese</div>
                  <div class="text-lg font-bold text-blue-900">{{ r2(modal.data.rataMensile) }}</div>
                </div>
                <div>
                  <div class="text-xs text-blue-500 font-semibold uppercase">Maturate</div>
                  <div class="text-lg font-bold text-indigo-700">{{ r2(modal.data.ferieSpettanti) }}</div>
                </div>
                <div>
                  <div class="text-xs text-blue-500 font-semibold uppercase">Da maturare</div>
                  <div class="text-lg font-bold text-gray-500">{{ r2((modal.data.ferieAnnuali || 0) - (modal.data.ferieSpettanti || 0)) }}</div>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="form-label">Residui anni precedenti</label>
                <input class="form-input" type="number" step="0.01" v-model.number="modal.data.residuiAnniPrecedenti" @input="recalcModal; trackChanges()">
                <p class="text-[10px] text-gray-400 mt-1">Impostare manualmente i residui da anni passati</p>
              </div>
              <div>
                <label class="form-label">Godute</label>
                <input class="form-input" type="number" step="0.01" v-model.number="modal.data.ferieGodute" @input="calcResidueDaInizioAnno; trackChanges()">
                <p class="text-[10px] text-gray-500 mt-1">Modifica manualmente - Residue calcolate automaticamente</p>
              </div>
              <div>
                <label class="form-label">Residue (auto)</label>
                <input class="form-input bg-blue-50" type="number" step="0.01" :value="modal.data.ferieResidue" readonly>
                <p class="text-[10px] text-blue-600 font-semibold mt-1">Calcolate: Maturate 2026 - Godute</p>
              </div>
            </div>
            <div class="mt-3">
              <label class="form-label">Note ferie</label>
              <textarea class="form-textarea" rows="2" v-model="modal.data.noteFerie" @input="trackChanges()"></textarea>
            </div>
          </Section>

          <!-- Permessi (solo CCNL) -->
          <Section v-if="modal.data.tipoContrattoFerie === 'ccnl_commercio'" title="Permessi (ROL + Ex-festività)">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="form-label">Spettanti (gg)</label>
                <input class="form-input bg-gray-50" :value="modal.data.permessiSpettantiGg" readonly>
                <div class="text-[10px] text-gray-400 mt-0.5">{{ modal.data.permessiSpettantiOre || 0 }}h totali</div>
              </div>
              <div>
                <label class="form-label">Goduti</label>
                <input class="form-input" type="number" step="0.01" v-model.number="modal.data.permessiGodutiGg" @input="trackChanges()">
                <p class="text-[10px] text-gray-500 mt-1">Modifica manualmente</p>
              </div>
              <div>
                <label class="form-label">Residui</label>
                <input class="form-input" type="number" step="0.01" v-model.number="modal.data.permessiResiduiGg" @input="trackChanges()">
                <p class="text-[10px] text-gray-500 mt-1">Modifica manualmente</p>
              </div>
            </div>
          </Section>

          <Section title="Malattia">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="form-label">Gg malattia anno (calc.)</label>
                <input class="form-input bg-gray-50" :value="modal.data.ggMalattia" readonly>
              </div>
              <div>
                <label class="form-label">Episodi (calc.)</label>
                <input class="form-input bg-gray-50" :value="modal.data.episodiMalattia" readonly>
              </div>
              <div>
                <label class="form-label">Gg malattia ultimi 3m (calc.)</label>
                <input class="form-input bg-gray-50" :value="modal.data.ggMalattia3m" readonly>
              </div>
            </div>
            <div class="mt-3">
              <label class="form-label">Note malattia</label>
              <textarea class="form-textarea" rows="2" v-model="modal.data.noteMalattia" @input="trackChanges()"></textarea>
            </div>
          </Section>

          <Section title="Assenze non giustificate">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Totale N.G. (calc.)</label>
                <input class="form-input bg-gray-50" :value="modal.data.assenzeNonGiust" readonly>
              </div>
            </div>
            <div class="mt-3">
              <label class="form-label">Note assenze</label>
              <textarea class="form-textarea" rows="2" v-model="modal.data.noteAssenze" @input="trackChanges()"></textarea>
            </div>
          </Section>
        </div>

        <!-- TAB: Registri (entries) -->
        <div v-if="activeTab === 'registri'">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-medium text-gray-700">{{ (modal.data.entries || []).length }} registri</div>
            <button class="btn btn-primary btn-sm" @click="showEntryForm = true; resetEntryForm()">+ Aggiungi registro</button>
          </div>

          <!-- New entry form -->
          <div v-if="showEntryForm" class="card p-4 mb-4 border-2 border-primary-200 bg-primary-50/30 space-y-3">
            <div class="text-sm font-semibold text-primary-800">{{ editingEntry ? '✏️ Modifica registro' : '➕ Nuovo registro' }}</div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label">Tipo</label>
                <select class="form-select" v-model="entryForm.tipo">
                  <option value="ferie">🏖️ Ferie</option>
                  <option value="malattia">🤒 Malattia</option>
                  <option value="permesso">📋 Permesso</option>
                  <option value="assenza_ng">⚠️ Assenza N.G.</option>
                </select>
              </div>
              <div>
                <label class="form-label">Stato</label>
                <select class="form-select" v-model="entryForm.stato">
                  <option value="approvata">✅ Approvata</option>
                  <option value="in_attesa">⏳ In attesa</option>
                  <option value="rifiutata">❌ Rifiutata</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="form-label">Data inizio</label>
                <input class="form-input" type="date" v-model="entryForm.dataInizio" @change="calcGiorni">
              </div>
              <div>
                <label class="form-label">Data fine</label>
                <input class="form-input" type="date" v-model="entryForm.dataFine" @change="calcGiorni">
              </div>
              <div>
                <label class="form-label">Giorni</label>
                <input class="form-input" type="number" v-model.number="entryForm.giorni" min="0.5" step="0.5">
              </div>
            </div>
            <div>
              <label class="form-label">Note</label>
              <input class="form-input" v-model="entryForm.note" placeholder="Facoltativo">
            </div>
            <div class="flex gap-2 justify-end">
              <button class="btn btn-secondary btn-sm" @click="showEntryForm = false; editingEntry = null">Annulla</button>
              <button class="btn btn-primary btn-sm" @click="saveEntry" :disabled="!entryForm.dataInizio || !entryForm.giorni">
                {{ editingEntry ? '💾 Aggiorna' : '💾 Salva' }}
              </button>
            </div>
          </div>

          <!-- Entries list -->
          <div v-if="(modal.data.entries || []).length === 0 && !showEntryForm" class="text-center py-8 text-gray-400">
            Nessun registro. Clicca "Aggiungi registro" per iniziare.
          </div>
          <div v-else class="space-y-2">
            <div v-for="entry in sortedEntries" :key="entry.id"
              :class="['p-3 rounded-lg border flex items-center gap-3', entryColors[entry.tipo] || 'bg-gray-50 border-gray-200']">
              <div class="text-xl">{{ entryIcons[entry.tipo] || '📋' }}</div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold">{{ entryLabels[entry.tipo] || entry.tipo }}</span>
                  <span :class="['text-xs px-1.5 py-0.5 rounded', statoColors[entry.stato] || 'bg-gray-100 text-gray-600']">
                    {{ statoLabels[entry.stato] || entry.stato }}
                  </span>
                </div>
                <div class="text-xs text-gray-500 mt-0.5">
                  {{ fmtDate(entry.dataInizio) }} → {{ fmtDate(entry.dataFine) }} · <strong>{{ entry.giorni }}gg</strong>
                  <span v-if="entry.note" class="ml-1 text-gray-400">· {{ entry.note }}</span>
                </div>
              </div>
              <div class="flex gap-1 shrink-0">
                <button class="btn btn-ghost btn-xs" @click="editEntry(entry)" title="Modifica">✏️</button>
                <button class="btn btn-ghost btn-xs text-red-500" @click="removeEntry(entry.id)" title="Elimina">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-secondary" @click="closeModal">Chiudi</button>
        <button 
          class="btn" 
          :class="hasChanges ? 'btn-primary animate-pulse' : 'btn-ghost'"
          :disabled="!hasChanges"
          @click="saveAll">
          {{ hasChanges ? '💾 Salva modifiche' : 'Nessuna modifica' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import Modal from '@/components/ui/Modal.vue'
import Section from '@/components/ui/Section.vue'
import KpiCard from '@/components/ui/KpiCard.vue'

const store = useHrStore()

function r2(v) { return v != null ? Number(v).toFixed(2) : '0.00' }

// Ensure ferie records exist for all employees
store.ensureFerieForAll()

const search = ref('')
const filterTeam = ref('')
const filterSocieta = ref('')
const filterContratto = ref('')
const filterStatus = ref('')
const sortCol = ref('nome')
const sortDir = ref('asc')
const activeTab = ref('riepilogo')
const showEntryForm = ref(false)
const editingEntry = ref(null)
const hasChanges = ref(false)
const originalData = ref({})

const tabs = [
  { key: 'riepilogo', label: 'Riepilogo', icon: '📊' },
  { key: 'registri', label: 'Registri', icon: '📋' }
]

const entryIcons = { ferie: '🏖️', malattia: '🤒', permesso: '📋', assenza_ng: '⚠️' }
const entryLabels = { ferie: 'Ferie', malattia: 'Malattia', permesso: 'Permesso', assenza_ng: 'Assenza N.G.' }
const entryColors = {
  ferie: 'bg-blue-50 border-blue-200',
  malattia: 'bg-red-50 border-red-200',
  permesso: 'bg-purple-50 border-purple-200',
  assenza_ng: 'bg-orange-50 border-orange-200'
}
const statoLabels = { approvata: 'Approvata', in_attesa: 'In attesa', rifiutata: 'Rifiutata' }
const statoColors = {
  approvata: 'bg-green-100 text-green-700',
  in_attesa: 'bg-yellow-100 text-yellow-700',
  rifiutata: 'bg-red-100 text-red-700'
}

const ferie = computed(() => store.ferie)

const countBySocieta = computed(() => {
  let silicon = 0, move = 0
  ferie.value.forEach(f => {
    if (f.societa === 'Silicon') silicon++
    else move++
  })
  return { silicon, move }
})

const teamsFiltered = computed(() => {
  if (!filterSocieta.value) return store.teams
  return [...new Set(ferie.value.filter(f => f.societa === filterSocieta.value).map(f => f.team))].sort()
})

const totals = computed(() => {
  const a = store.ferieAnalytics
  const base = a ? a.totals : { spettanti: 0, godute: 0, residue: 0, malattia: 0, assenze: 0, percGodute: 0 }
  // Annuali & permessi totals
  let annuali = 0, permessiSpett = 0, permessiGoduti = 0
  ferie.value.forEach(f => {
    annuali += f.ferieAnnuali || 0
    if (f.tipoContrattoFerie === 'ccnl_commercio') {
      permessiSpett += f.permessiSpettantiGg || 0
      permessiGoduti += f.permessiGodutiGg || 0
    }
  })
  return { ...base, annuali: Math.round(annuali * 100) / 100, permessiSpett: Math.round(permessiSpett * 100) / 100, permessiGoduti: Math.round(permessiGoduti * 100) / 100 }
})

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  let list = [...ferie.value].filter(f => f.tipoContratto !== 'freelance' && f.team !== 'Freelance')

  if (s) list = list.filter(f => (f.nome || '').toLowerCase().includes(s) || (f.team || '').toLowerCase().includes(s))
  if (filterSocieta.value) list = list.filter(f => f.societa === filterSocieta.value)
  if (filterTeam.value) list = list.filter(f => f.team === filterTeam.value)
  if (filterContratto.value) list = list.filter(f => f.tipoContrattoFerie === filterContratto.value)
  if (filterStatus.value === 'residue_alte') list = list.filter(f => (f.ferieResidue || 0) > 20)
  else if (filterStatus.value === 'malattia') list = list.filter(f => (f.ggMalattia || 0) > 0)
  else if (filterStatus.value === 'assenze_ng') list = list.filter(f => (f.assenzeNonGiust || 0) > 0)
  else if (filterStatus.value === 'nessuna_feria') list = list.filter(f => (f.ferieGodute || 0) === 0)

  list.sort((a, b) => {
    const col = sortCol.value
    let va = a[col], vb = b[col]
    if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase() }
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })

  return list
})

function toggleSort(col) {
  if (sortCol.value === col) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortCol.value = col; sortDir.value = 'asc' }
}

function shortTeam(team) {
  if (!team) return ''
  return team.replace('Solutions > ', '').replace('Business Development', 'BizDev')
}

// Modal
const modal = reactive({ open: false, data: {} })
const entryForm = reactive({
  tipo: 'ferie', stato: 'approvata',
  dataInizio: '', dataFine: '', giorni: 1, note: ''
})

function openModal(f) {
  modal.data = JSON.parse(JSON.stringify(f))
  originalData.value = JSON.parse(JSON.stringify(f))
  if (!modal.data.entries) modal.data.entries = []
  activeTab.value = 'riepilogo'
  showEntryForm.value = false
  editingEntry.value = null
  hasChanges.value = false
  modal.open = true
}

function closeModal() {
  modal.open = false
  showEntryForm.value = false
  editingEntry.value = null
  hasChanges.value = false
}

function trackChanges() {
  hasChanges.value = true
}

function calcResidueDaInizioAnno() {
  // Calcola residue solo da inizio 2026, senza toccare residui anni passati
  const maturateDaInizioAnno = modal.data.ferieSpettanti || 0  // Questo è già maturato da inizio 2026
  const godute = modal.data.ferieGodute || 0
  modal.data.ferieResidue = Math.round((maturateDaInizioAnno - godute) * 100) / 100
  
  const totDisponibili = maturateDaInizioAnno
  modal.data.percGodute = totDisponibili > 0
    ? Math.round(godute / totDisponibili * 100) : 0
}

function changeContratto(tipo) {
  modal.data.tipoContrattoFerie = tipo
  store.updateContrattoFerie(modal.data.nome, tipo)
  // Refresh modal data from store
  const fresh = store.ferie.find(f => f.nome === modal.data.nome)
  if (fresh) modal.data = JSON.parse(JSON.stringify(fresh))
}

function recalcModal() {
  const maturate = modal.data.ferieSpettanti || 0
  const residuiAP = modal.data.residuiAnniPrecedenti || 0
  const godute = modal.data.ferieGodute || 0
  modal.data.ferieResidue = Math.round((maturate + residuiAP - godute) * 100) / 100
  const totDisponibili = maturate + residuiAP
  modal.data.percGodute = totDisponibili > 0
    ? Math.round(godute / totDisponibili * 100) : 0
}

function resetEntryForm() {
  entryForm.tipo = 'ferie'
  entryForm.stato = 'approvata'
  entryForm.dataInizio = ''
  entryForm.dataFine = ''
  entryForm.giorni = 1
  entryForm.note = ''
  editingEntry.value = null
}

function calcGiorni() {
  if (entryForm.dataInizio && entryForm.dataFine) {
    const d1 = new Date(entryForm.dataInizio)
    const d2 = new Date(entryForm.dataFine)
    if (d2 >= d1) {
      let count = 0
      const cur = new Date(d1)
      while (cur <= d2) {
        const day = cur.getDay()
        if (day !== 0 && day !== 6) count++
        cur.setDate(cur.getDate() + 1)
      }
      entryForm.giorni = count || 1
    }
  }
}

const sortedEntries = computed(() => {
  if (!modal.data.entries) return []
  return [...modal.data.entries].sort((a, b) => {
    if (!a.dataInizio) return 1
    if (!b.dataInizio) return -1
    return b.dataInizio.localeCompare(a.dataInizio)
  })
})

function saveEntry() {
  if (!entryForm.dataInizio || !entryForm.giorni) return
  const entry = { ...entryForm }

  if (editingEntry.value) {
    store.updateFerieEntry(modal.data.nome, editingEntry.value, entry)
  } else {
    store.addFerieEntry(modal.data.nome, entry)
  }

  const fresh = store.ferie.find(f => f.nome === modal.data.nome)
  if (fresh) modal.data = JSON.parse(JSON.stringify(fresh))

  showEntryForm.value = false
  editingEntry.value = null
}

function editEntry(entry) {
  entryForm.tipo = entry.tipo
  entryForm.stato = entry.stato
  entryForm.dataInizio = entry.dataInizio
  entryForm.dataFine = entry.dataFine
  entryForm.giorni = entry.giorni
  entryForm.note = entry.note || ''
  editingEntry.value = entry.id
  showEntryForm.value = true
}

function removeEntry(entryId) {
  store.deleteFerieEntry(modal.data.nome, entryId)
  const fresh = store.ferie.find(f => f.nome === modal.data.nome)
  if (fresh) modal.data = JSON.parse(JSON.stringify(fresh))
}

function saveAll() {
  // Persist residui anni precedenti
  if (modal.data.residuiAnniPrecedenti !== undefined) {
    store.updateResiduiAnniPrecedenti(modal.data.nome, modal.data.residuiAnniPrecedenti)
  }
  
  // Prepare ferie data with manual overrides
  const ferieData = {
    noteFerie: modal.data.noteFerie,
    noteMalattia: modal.data.noteMalattia,
    noteAssenze: modal.data.noteAssenze
  }
  
  // Add manual ferie values
  if (modal.data.ferieGodute !== undefined) {
    ferieData.ferieGodute = modal.data.ferieGodute
  }
  if (modal.data.ferieResidue !== undefined) {
    ferieData.ferieResidue = modal.data.ferieResidue
  }
  
  // Add manual permessi values (for CCNL)
  if (modal.data.tipoContrattoFerie === 'ccnl_commercio') {
    if (modal.data.permessiGodutiGg !== undefined) {
      ferieData.permessiGodutiGg = modal.data.permessiGodutiGg
    }
    if (modal.data.permessiResiduiGg !== undefined) {
      ferieData.permessiResiduiGg = modal.data.permessiResiduiGg
    }
  }
  
  store.saveFerie(modal.data.nome, ferieData)
  closeModal()
}

function fmtDate(d) {
  if (!d) return '—'
  const p = d.split('-')
  return `${p[2]}/${p[1]}/${p[0]}`
}
</script>
