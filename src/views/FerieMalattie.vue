<template>
  <div class="p-6 space-y-5">
    <div class="flex flex-wrap items-center gap-3">
      <input v-model="search" class="form-input max-w-xs" placeholder="🔍 Cerca...">
      <select v-model="filterTeam" class="form-select w-44">
        <option value="">Tutti i team</option>
        <option v-for="t in store.teams" :key="t">{{ t }}</option>
      </select>
    </div>

    <!-- KPI -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-primary-600">{{ totFerieSpettanti }}</div>
        <div class="text-xs text-gray-400 mt-0.5">Ferie totali spettanti</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-emerald-600">{{ totFerieGodute }}</div>
        <div class="text-xs text-gray-400 mt-0.5">Ferie godute</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-amber-600">{{ totFerieResidue }}</div>
        <div class="text-xs text-gray-400 mt-0.5">Ferie residue</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-red-600">{{ totMalattia }}</div>
        <div class="text-xs text-gray-400 mt-0.5">Giorni malattia totali</div>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="tbl">
          <thead><tr>
            <th>Dipendente</th><th>Team</th>
            <th>Ferie spettanti</th><th>Ferie godute</th><th>Residue</th><th>%</th>
            <th>Gg Malattia</th><th>Episodi</th><th>Gg Mal. 3m</th><th>Assenze n.g.</th><th></th>
          </tr></thead>
          <tbody>
            <tr v-for="e in filteredFerie" :key="e.nome" class="tbl-clickable" @click="openEdit(e)">
              <td class="font-medium text-sm">{{ e.nome }}</td>
              <td><span class="badge badge-gray">{{ e.team }}</span></td>
              <td class="text-center">{{ e.ferieSpettanti }}</td>
              <td class="text-center">{{ e.ferieGodute }}</td>
              <td class="text-center"><span :class="['font-semibold', e.ferieResidue > 15 ? 'text-amber-600' : 'text-gray-700']">{{ e.ferieResidue }}</span></td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                    <div class="h-full bg-primary-400 rounded-full" :style="{ width: (e.percGodute||0) + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ e.percGodute || 0 }}%</span>
                </div>
              </td>
              <td class="text-center"><span :class="e.ggMalattia > 10 ? 'text-red-600 font-semibold' : ''">{{ e.ggMalattia || 0 }}</span></td>
              <td class="text-center text-gray-600">{{ e.episodiMalattia || 0 }}</td>
              <td class="text-center"><span :class="e.ggMalattia3m > 5 ? 'text-amber-600' : ''">{{ e.ggMalattia3m || 0 }}</span></td>
              <td class="text-center"><span :class="e.assenzeNonGiust > 0 ? 'text-red-500 font-semibold' : ''">{{ e.assenzeNonGiust || 0 }}</span></td>
              <td><button class="btn btn-ghost btn-xs" @click.stop="openEdit(e)">✎</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">{{ filteredFerie.length }} dipendenti</div>
    </div>

    <!-- Edit modal -->
    <Modal :open="modal.open" :title="'Ferie & Malattie — ' + modal.data.nome" @close="modal.open = false">
      <div class="space-y-4">
        <Section title="Ferie">
          <div class="grid grid-cols-3 gap-4">
            <div><label class="form-label">Spettanti (gg)</label><input class="form-input" type="number" v-model.number="modal.data.ferieSpettanti" @input="recalc"></div>
            <div><label class="form-label">Godute (gg)</label><input class="form-input" type="number" v-model.number="modal.data.ferieGodute" @input="recalc"></div>
            <div><label class="form-label">Residue (calc.)</label><input class="form-input bg-gray-50" :value="modal.data.ferieResidue" readonly></div>
          </div>
          <div class="mt-3"><label class="form-label">Note ferie</label><textarea class="form-textarea" rows="2" v-model="modal.data.noteFerie"></textarea></div>
        </Section>
        <Section title="Malattia">
          <div class="grid grid-cols-3 gap-4">
            <div><label class="form-label">Giorni malattia anno</label><input class="form-input" type="number" v-model.number="modal.data.ggMalattia"></div>
            <div><label class="form-label">Episodi malattia</label><input class="form-input" type="number" v-model.number="modal.data.episodiMalattia"></div>
            <div><label class="form-label">Gg malattia ultimi 3m</label><input class="form-input" type="number" v-model.number="modal.data.ggMalattia3m"></div>
          </div>
          <div class="mt-3"><label class="form-label">Note malattia</label><textarea class="form-textarea" rows="2" v-model="modal.data.noteMalattia"></textarea></div>
        </Section>
        <Section title="Assenze">
          <div><label class="form-label">Assenze non giustificate</label><input class="form-input w-32" type="number" v-model.number="modal.data.assenzeNonGiust"></div>
          <div class="mt-3"><label class="form-label">Note assenze</label><textarea class="form-textarea" rows="2" v-model="modal.data.noteAssenze"></textarea></div>
        </Section>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="modal.open = false">Annulla</button>
        <button class="btn btn-primary" @click="save">💾 Salva</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useHrStore } from '@/stores/hrStore.js'
import Modal from '@/components/ui/Modal.vue'
import Section from '@/components/ui/Section.vue'

const store = useHrStore()
const search = ref(''), filterTeam = ref('')

const ferieWithEmp = computed(() => store.ferie.map(f => {
  const e = store.employees.find(e => e.nome === f.nome)
  return { ...f, team: f.team || e?.team || '—' }
}))

const filteredFerie = computed(() => ferieWithEmp.value.filter(f => {
  const s = search.value.toLowerCase()
  return (!s || (f.nome||'').toLowerCase().includes(s))
    && (!filterTeam.value || f.team === filterTeam.value)
}))

const totFerieSpettanti = computed(() => store.ferie.reduce((a, f) => a + (f.ferieSpettanti||0), 0))
const totFerieGodute    = computed(() => store.ferie.reduce((a, f) => a + (f.ferieGodute||0), 0))
const totFerieResidue   = computed(() => store.ferie.reduce((a, f) => a + (f.ferieResidue||0), 0))
const totMalattia       = computed(() => store.ferie.reduce((a, f) => a + (f.ggMalattia||0), 0))

const modal = reactive({ open: false, data: {} })

function openEdit(f) {
  modal.data = { ...f }
  modal.open = true
}

function recalc() {
  modal.data.ferieResidue = (modal.data.ferieSpettanti||0) - (modal.data.ferieGodute||0)
  modal.data.percGodute = modal.data.ferieSpettanti > 0 ? Math.round(modal.data.ferieGodute/modal.data.ferieSpettanti*100) : 0
}

function save() {
  store.saveFerie(modal.data.nome, modal.data)
  modal.open = false
}
</script>
