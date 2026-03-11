<template>
  <div class="p-6 space-y-5">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <input v-model="search" class="form-input max-w-xs" placeholder="🔍 Cerca dipendente...">
      <select v-model="filterTeam" class="form-select w-44">
        <option value="">Tutti i team</option>
        <option v-for="t in store.teams" :key="t">{{ t }}</option>
      </select>
      <select v-model="filterContratto" class="form-select w-40">
        <option value="">Tutti i contratti</option>
        <option v-for="c in TIPI_CONTRATTO" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
      <select v-model="filterStato" class="form-select w-40">
        <option value="">Tutti gli stati</option>
        <option>Attivo</option>
        <option>Dimissioni Volontarie</option>
        <option>Mancato Superamento Prova</option>
        <option>In Uscita Concordata</option>
      </select>
      <button @click="openNew" class="btn btn-primary ml-auto">+ Nuovo dipendente</button>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Team</th>
              <th>Contratto</th>
              <th>Assunzione</th>
              <th>Livello CCNL</th>
              <th>Fine prova</th>
              <th>Durata prova</th>
              <th>Esito prova</th>
              <th>FU1</th>
              <th>FU2</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in filtered" :key="e.id" class="tbl-clickable" @click="openEdit(e)">
              <td class="text-gray-400 font-mono text-xs">{{ e.n }}</td>
              <td>
                <div class="font-medium text-gray-900">{{ e.nome }}</div>
                <div class="text-xs text-gray-400">{{ e.email }}</div>
              </td>
              <td><span class="badge badge-gray">{{ e.team }}</span></td>
              <td>
                <div class="flex flex-col gap-0.5">
                  <span :class="['badge', contractBadge(e.tipoContratto)]">{{ e.tipoContratto }}</span>
                  <span v-if="e.oreSettimana" class="text-xs text-gray-400">{{ e.oreSettimana }}h/sett</span>
                </div>
              </td>
              <td class="text-sm">{{ fmtDateShort(e.dataAssunzione) }}</td>
              <td class="text-sm text-gray-600">{{ e.livelloCCNL || '—' }}</td>
              <td class="text-sm">
                <span :class="provaUrgente(e) ? 'text-red-600 font-semibold' : ''">{{ fmtDateShort(e.fineProva) }}</span>
              </td>
              <td class="text-xs text-gray-500">{{ e.durataProva || '—' }}</td>
              <td>
                <span :class="['badge', esitoClass(e.esitoProva)]">{{ e.esitoProva || '—' }}</span>
              </td>
              <td>
                <div class="flex flex-col gap-0.5">
                  <span class="text-xs text-gray-500">{{ fmtDateShort(e.scadenzaFU1) }}</span>
                  <span :class="['badge badge-sm', fu1Class(e)]">{{ e.statoFU1 || '—' }}</span>
                </div>
              </td>
              <td>
                <div class="flex flex-col gap-0.5">
                  <span class="text-xs text-gray-500">{{ fmtDateShort(e.scadenzaFU2) }}</span>
                  <span :class="['badge badge-sm', fu2Class(e)]">{{ e.statoFU2Dip || '—' }}</span>
                </div>
              </td>
              <td><span :class="['badge', statoClass(e.stato)]">{{ e.stato }}</span></td>
              <td @click.stop>
                <button class="btn btn-ghost btn-xs text-red-400 hover:text-red-600" @click.stop="del(e.id)">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">{{ filtered.length }} dipendenti</div>
    </div>

    <!-- MODAL ADD/EDIT -->
    <Modal :open="modal.open" :title="modal.isNew ? 'Nuovo dipendente' : 'Modifica — ' + modal.data.nome" width="780px" @close="modal.open=false">
      <div class="space-y-5">
        <!-- Anagrafica -->
        <Section title="Anagrafica">
          <div class="grid grid-cols-2 gap-4">
            <div><label class="form-label">Nome e Cognome *</label><input class="form-input" v-model="modal.data.nome" placeholder="Mario Rossi"></div>
            <div><label class="form-label">Email</label><input class="form-input" v-model="modal.data.email" type="email" placeholder="mario.rossi@move.it"></div>
            <div><label class="form-label">Team *</label>
              <input class="form-input" v-model="modal.data.team" list="teams-dl" placeholder="Silicon">
              <datalist id="teams-dl"><option v-for="t in store.teams" :key="t" :value="t"/></datalist>
            </div>
            <div><label class="form-label">Città</label><input class="form-input" v-model="modal.data.citta" placeholder="Lucca"></div>
          </div>
        </Section>

        <!-- Contratto -->
        <Section title="Contratto">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Tipo contratto *</label>
              <select class="form-select" v-model="modal.data.tipoContratto">
                <option v-for="c in TIPI_CONTRATTO" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
            </div>
            <!-- Full-time / Part-time hours -->
            <div v-if="['full-time','part-time'].includes(modal.data.tipoContratto)">
              <label class="form-label">Ore settimanali</label>
              <div class="flex items-center gap-2">
                <input class="form-input" type="number" v-model.number="modal.data.oreSettimana" min="1" max="40" :placeholder="modal.data.tipoContratto==='full-time'?'40':'20'">
                <span class="text-sm text-gray-400">h/sett</span>
              </div>
              <p class="text-xs text-gray-400 mt-1">{{ modal.data.tipoContratto==='full-time' ? 'Full-time standard = 40h/sett.' : 'Part-time: inserire le ore contrattuali.' }}</p>
            </div>
            <div v-if="modal.data.tipoContratto === 'determinato'">
              <label class="form-label">Scadenza contratto *</label>
              <input class="form-input" type="date" v-model="modal.data.scadenzaContratto">
              <p class="text-xs text-gray-400 mt-1">Obbligatorio per calcolo periodo di prova proporzionale (D.Lgs 104/2022)</p>
            </div>
            <div>
              <label class="form-label">Data assunzione *</label>
              <input class="form-input" type="date" v-model="modal.data.dataAssunzione">
            </div>
            <div>
              <label class="form-label">Livello CCNL (Art.121)</label>
              <select class="form-select" v-model="modal.data.livelloCCNL" @change="recalc">
                <option value="">— seleziona —</option>
                <option v-for="l in LIVELLI_CCNL" :key="l">{{ l }}</option>
              </select>
            </div>
          </div>
        </Section>

        <!-- Periodo di prova (calcolato) -->
        <Section title="Periodo di prova — CCNL Commercio Art.121">
          <div v-if="modal.data.livelloCCNL && modal.data.dataAssunzione" class="grid grid-cols-3 gap-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div>
              <div class="text-xs text-blue-500 font-semibold mb-1 uppercase">Durata</div>
              <div class="font-bold text-blue-900">{{ modal.data.durataProva || '—' }}</div>
            </div>
            <div>
              <div class="text-xs text-blue-500 font-semibold mb-1 uppercase">Metodo computo</div>
              <div class="font-medium text-blue-800">{{ modal.data.metodoComputo || '—' }}</div>
            </div>
            <div>
              <div class="text-xs text-blue-500 font-semibold mb-1 uppercase">Fine periodo di prova</div>
              <div class="font-bold text-blue-900">{{ fmtDate(modal.data.fineProva) }}</div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400">Seleziona livello CCNL e data assunzione per calcolo automatico.</p>

          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label class="form-label">FU1 (assunzione +30gg) — automatico</label>
              <input class="form-input bg-gray-50" type="date" v-model="modal.data.scadenzaFU1" readonly>
            </div>
            <div>
              <label class="form-label">Stato FU1</label>
              <select class="form-select" v-model="modal.data.statoFU1">
                <option>Da Fare</option><option>Fatto</option><option>Non Necessario</option>
              </select>
            </div>
            <div>
              <label class="form-label">FU2 (fine prova -30gg) — automatico</label>
              <input class="form-input bg-gray-50" type="date" v-model="modal.data.scadenzaFU2" readonly>
            </div>
            <div>
              <label class="form-label">Stato FU2 Dipendente</label>
              <select class="form-select" v-model="modal.data.statoFU2Dip">
                <option>Da Fare</option><option>Fatto</option><option>Non Necessario</option>
              </select>
            </div>
            <div>
              <label class="form-label">Stato FU2 Manager</label>
              <select class="form-select" v-model="modal.data.statoFU2Manager">
                <option>Da Fare</option><option>Fatto</option><option>Non Necessario</option>
              </select>
            </div>
            <div>
              <label class="form-label">Esito periodo di prova</label>
              <select class="form-select" v-model="modal.data.esitoProva">
                <option>In Corso</option><option>Superato</option><option>Non Superato</option>
              </select>
            </div>
          </div>
          <div class="mt-3">
            <label class="form-label">Note FU1</label>
            <textarea class="form-textarea" rows="2" v-model="modal.data.noteFU1"></textarea>
          </div>
        </Section>

        <!-- Stato -->
        <Section title="Stato">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Stato dipendente</label>
              <select class="form-select" v-model="modal.data.stato">
                <option>Attivo</option>
                <option>Dimissioni Volontarie</option>
                <option>Mancato Superamento Prova</option>
                <option>In Uscita Concordata</option>
                <option>Licenziato</option>
              </select>
            </div>
          </div>
        </Section>
      </div>

      <template #footer>
        <button class="btn btn-secondary" @click="modal.open=false">Annulla</button>
        <button class="btn btn-primary" @click="save">💾 Salva</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import { useHelpers } from '@/composables/useHelpers.js'
import { LIVELLI_CCNL, TIPI_CONTRATTO, calcProvatione } from '@/composables/useCCNL.js'
import Modal from '@/components/ui/Modal.vue'
import Section from '@/components/ui/Section.vue'

const store = useHrStore()
const { fmtDate, fmtDateShort, toInput, statoClass, contractBadge } = useHelpers()

const search = ref(''), filterTeam = ref(''), filterContratto = ref(''), filterStato = ref('')

const filtered = computed(() => store.employees.filter(e => {
  const s = search.value.toLowerCase()
  return (!s || (e.nome||'').toLowerCase().includes(s) || (e.team||'').toLowerCase().includes(s))
    && (!filterTeam.value || e.team === filterTeam.value)
    && (!filterContratto.value || e.tipoContratto === filterContratto.value)
    && (!filterStato.value || e.stato === filterStato.value)
}))

const modal = reactive({ open: false, isNew: false, data: {} })

function openNew() {
  modal.isNew = true
  modal.data = { tipoContratto: 'indeterminato', stato: 'Attivo', statoFU1: 'Da Fare', statoFU2Dip: 'Da Fare', statoFU2Manager: 'Da Fare', esitoProva: 'In Corso' }
  modal.open = true
}
function openEdit(e) {
  modal.isNew = false
  modal.data = { ...e }
  modal.open = true
}
function save() {
  if (!modal.data.nome) { store.notify('Nome obbligatorio', 'error'); return }
  recalc()
  if (modal.isNew) store.addEmployee(modal.data)
  else store.updateEmployee(modal.data.id, modal.data)
  modal.open = false
}
function del(id) {
  if (confirm('Eliminare questo dipendente?')) store.deleteEmployee(id)
}
function recalc() {
  if (!modal.data.dataAssunzione || !modal.data.livelloCCNL) return
  const r = calcProvatione(modal.data.livelloCCNL, modal.data.tipoContratto, modal.data.dataAssunzione, modal.data.scadenzaContratto)
  modal.data.durataProva = r.durata; modal.data.metodoComputo = r.metodo; modal.data.fineProva = r.fineProva
  if (modal.data.dataAssunzione) {
    const h = new Date(modal.data.dataAssunzione)
    const fu1 = new Date(h); fu1.setDate(fu1.getDate()+30)
    modal.data.scadenzaFU1 = fu1.toISOString().split('T')[0]
  }
  if (r.fineProva) {
    const fu2 = new Date(r.fineProva); fu2.setDate(fu2.getDate()-30)
    modal.data.scadenzaFU2 = fu2.toISOString().split('T')[0]
  }
}

watch(() => [modal.data.dataAssunzione, modal.data.livelloCCNL, modal.data.tipoContratto, modal.data.scadenzaContratto], recalc)

function esitoClass(e) {
  return e==='Superato'?'badge-green':e==='Non Superato'?'badge-red':e==='In Corso'?'badge-blue':'badge-gray'
}
function fu1Class(e) {
  return e.statoFU1==='Fatto'?'badge-green':e.fu1Scaduto?'badge-red':'badge-gray'
}
function fu2Class(e) {
  return e.statoFU2Dip==='Fatto'?'badge-green':'badge-gray'
}
function provaUrgente(e) {
  if (!e.fineProva) return false
  const d = Math.round((new Date(e.fineProva)-new Date())/86400000)
  return d >= 0 && d <= 30
}
</script>
