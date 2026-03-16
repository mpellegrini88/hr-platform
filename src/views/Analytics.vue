<template>
  <div class="p-6 space-y-6">
    <!-- KPI CONTRATTI -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <KpiCard 
        label="Indeterminati" 
        :value="countByContractType('indeterminato')" 
        icon="📋"
        color="blue" 
      />
      <KpiCard 
        label="Determinati" 
        :value="countByContractType('determinato')" 
        icon="⏰"
        color="amber" 
      />
      <KpiCard 
        label="Attivi" 
        :value="store.employees.filter(e => e.stato === 'Attivo').length" 
        icon="✓"
        color="emerald" 
      />
      <KpiCard 
        label="In Prova" 
        :value="store.employees.filter(e => e.esitoProva === 'In Corso').length" 
        icon="⏳"
        color="amber" 
      />
      <KpiCard 
        label="Ex-dipendenti" 
        :value="exDipendenti.length" 
        icon="👤"
        color="gray" 
      />
    </div>

    <!-- ===== AGE ANALYTICS ===== -->
    <div class="card p-5 border-t-4 border-indigo-500">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">🎂 Age & Generational Analytics</h3>
        <button @click="expandAgeAnalytics = !expandAgeAnalytics" class="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-transform" :style="{ transform: expandAgeAnalytics ? 'rotate(180deg)' : 'rotate(0deg)' }">
          ▼ {{ expandAgeAnalytics ? 'Riduci' : 'Espandi' }}
        </button>
      </div>
      
      <div v-if="expandAgeAnalytics" class="space-y-5">
      <!-- KPI Age -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500 font-medium">Età Media</div>
          <div class="text-2xl font-bold text-indigo-600">{{ r2(avgAge) }}y</div>
        </div>
        <div class="border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500 font-medium">Più Giovane</div>
          <div class="text-2xl font-bold text-emerald-600">{{ minAge }}y</div>
        </div>
        <div class="border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500 font-medium">Più Anziano</div>
          <div class="text-2xl font-bold text-red-600">{{ maxAge }}y</div>
        </div>
        <div class="border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500 font-medium">Seniority Avg</div>
          <div class="text-2xl font-bold text-blue-600">{{ r2(avgSeniority) }}y</div>
        </div>
        <div class="border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500 font-medium">Risk Pensionamento</div>
          <div class="text-2xl font-bold" :class="ageRiskRetirement > 10 ? 'text-red-600' : 'text-gray-600'">{{ ageRiskRetirement }}</div>
        </div>
      </div>

      <!-- Age Distribution & Team Comparison -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Distribution by Age Band -->
        <div class="border border-gray-200 rounded-lg p-4">
          <h4 class="font-semibold text-gray-900 mb-3 text-sm">Distribuzione per Fascia d'Età</h4>
          <div class="space-y-3">
            <div v-for="band in ageBands" :key="band.label" class="flex items-center gap-3">
              <span class="text-xs font-medium text-gray-600 w-16">{{ band.label }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden flex items-center">
                <div :class="['h-full transition-all', band.color]" :style="{ width: (band.count / maxAgeBand * 100) + '%' }"></div>
              </div>
              <span class="text-sm font-bold text-gray-900 w-10 text-right">{{ band.count }}</span>
              <span class="text-xs text-gray-500 w-12 text-right">{{ r2(band.percent) }}%</span>
            </div>
          </div>
        </div>

        <!-- Age by Team -->
        <div class="border border-gray-200 rounded-lg p-4">
          <h4 class="font-semibold text-gray-900 mb-3 text-sm">Età Media per Team</h4>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div v-for="team in ageByTeam" :key="team.team" class="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span class="text-xs font-medium text-gray-700 flex-1">{{ team.team }}</span>
              <div class="flex items-center gap-2">
                <div class="w-24 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div class="bg-indigo-500 h-full rounded-full" :style="{ width: (team.avgAge / maxAge * 100) + '%' }"></div>
                </div>
                <span class="text-sm font-semibold text-gray-900 w-8 text-right">{{ r2(team.avgAge) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Age vs CCNL Level heatmap -->
      <div class="mt-5 border border-gray-200 rounded-lg p-4">
        <h4 class="font-semibold text-gray-900 mb-3 text-sm">📊 Correlazione: Età → Livello CCNL</h4>
        <div class="overflow-x-auto">
          <table class="tbl text-xs">
            <thead>
              <tr>
                <th>Fascia d'Età</th>
                <th v-for="level in allCcnlLevels" :key="level" class="text-center">{{ level || 'N/A' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="band in ageBands" :key="band.label">
                <td class="font-medium">{{ band.label }}</td>
                <td v-for="level in allCcnlLevels" :key="level" class="text-center">
                  <span :class="['px-2 py-1 rounded text-white font-semibold', getHeatmapColor(getCcnlCountInAgeBand(band.min, band.max, level) / Math.max(band.count, 1))]">
                    {{ getCcnlCountInAgeBand(band.min, band.max, level) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Contract Type by Age Band -->
      <div class="mt-5 border border-gray-200 rounded-lg p-4">
        <h4 class="font-semibold text-gray-900 mb-3 text-sm">📋 Tipo Contratto per Fascia d'Età</h4>
        <div class="overflow-x-auto">
          <table class="tbl text-xs">
            <thead>
              <tr>
                <th>Fascia d'Età</th>
                <th class="text-center">Indeterminato</th>
                <th class="text-center">Determinato</th>
                <th class="text-center">% Indeter.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="band in ageBands" :key="band.label">
                <td class="font-medium">{{ band.label }}</td>
                <td class="text-center">{{ getContractCountInAgeBand(band.min, band.max, 'indeterminato') }}</td>
                <td class="text-center">{{ getContractCountInAgeBand(band.min, band.max, 'determinato') }}</td>
                <td class="text-center">
                  <span :class="getContractCountInAgeBand(band.min, band.max, 'indeterminato') >= band.count * 0.7 ? 'text-emerald-600 font-semibold' : ''">
                    {{ r2(getContractCountInAgeBand(band.min, band.max, 'indeterminato') / Math.max(band.count, 1) * 100) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>

    <!-- HIRING TREND BY DIVISION -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Silicon Trend -->
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">🔌 Silicon Division — Trend Assunzioni</h3>
          <span class="text-2xl font-bold" :class="siliconTrend >= 0 ? 'text-emerald-600' : 'text-red-600'">{{ siliconTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(siliconTrend) }}</span>
        </div>
        <div class="space-y-2">
          <div v-for="year in yearsAvailable" :key="year" class="flex items-center justify-between gap-3">
            <span class="text-sm font-medium text-gray-700 w-12">{{ year }}</span>
            <div class="flex-1 flex items-center gap-2">
              <div class="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500" :style="{ width: (getHiringByDivisionYear('silicon', year) / maxHiringYear * 100) + '%', transition: 'width 0.3s' }"></div>
              </div>
              <span class="text-sm font-semibold text-gray-700 w-8 text-right">{{ getHiringByDivisionYear('silicon', year) }}</span>
            </div>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <p><strong>Totale:</strong> {{ getTotalHiringByDivision('silicon') }} persone</p>
          <p><strong>Media/anno:</strong> {{ r2(getTotalHiringByDivision('silicon') / yearsAvailable.length) }}</p>
        </div>
      </div>

      <!-- Solutions Trend -->
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">💡 Solutions Division — Trend Assunzioni</h3>
          <span class="text-2xl font-bold" :class="solutionsTrend >= 0 ? 'text-emerald-600' : 'text-red-600'">{{ solutionsTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(solutionsTrend) }}</span>
        </div>
        <div class="space-y-2">
          <div v-for="year in yearsAvailable" :key="year" class="flex items-center justify-between gap-3">
            <span class="text-sm font-medium text-gray-700 w-12">{{ year }}</span>
            <div class="flex-1 flex items-center gap-2">
              <div class="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-purple-500" :style="{ width: (getHiringByDivisionYear('solutions', year) / maxHiringYear * 100) + '%', transition: 'width 0.3s' }"></div>
              </div>
              <span class="text-sm font-semibold text-gray-700 w-8 text-right">{{ getHiringByDivisionYear('solutions', year) }}</span>
            </div>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <p><strong>Totale:</strong> {{ getTotalHiringByDivision('solutions') }} persone</p>
          <p><strong>Media/anno:</strong> {{ r2(getTotalHiringByDivision('solutions') / yearsAvailable.length) }}</p>
        </div>
      </div>
    </div>

    <!-- EX-DIPENDENTI (Uscita Concordata / Inattivo) -->
    <div v-if="exDipendenti.length > 0" class="card p-5 border-l-4 border-gray-400">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">👤 Ex-dipendenti — Uscita Concordata / Inattivo</h3>
        <span class="text-sm text-gray-500">{{ exDipendenti.length }} persone</span>
      </div>
      <div class="overflow-x-auto">
        <table class="tbl text-sm">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Team</th>
              <th>Contratto</th>
              <th>Data Assunzione</th>
              <th>Livello CCNL</th>
              <th>Stato</th>
              <th>Data Uscita</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in exDipendenti" :key="e.id">
              <td class="font-medium">{{ e.nome }} {{ e.cognome }}</td>
              <td><span class="badge badge-gray">{{ e.team }}</span></td>
              <td><span class="badge badge-sm" :class="e.tipoContratto === 'determinato' ? 'badge-amber' : 'badge-blue'">{{ e.tipoContratto }}</span></td>
              <td class="text-sm">{{ fmtDateShort(e.dataAssunzione) }}</td>
              <td class="text-sm text-gray-600">{{ e.livelloCCNL || '—' }}</td>
              <td><span class="badge badge-sm" :class="e.stato === 'Inattivo' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700'">{{ e.stato }}</span></td>
              <td class="text-sm">{{ fmtDateShort(e.dataUscita) || '—' }}</td>
              <td class="text-sm text-gray-500">{{ e.motivoUscita || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Stats summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">Uscita Concordata</div>
          <div class="text-xl font-bold text-gray-700">{{ exDipendenti.filter(e => e.stato === 'In Uscita Concordata').length }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">Inattivi</div>
          <div class="text-xl font-bold text-gray-700">{{ exDipendenti.filter(e => e.stato === 'Inattivo').length }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">Team coinvolti</div>
          <div class="text-xl font-bold text-gray-700">{{ new Set(exDipendenti.map(e => e.team)).size }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">Avg. permanenza</div>
          <div class="text-xl font-bold text-gray-700">{{ avgPermanenzaEx }} mesi</div>
        </div>
      </div>
    </div>

    <!-- ROW 1: Contratti + Headcount -->
    <div class="grid grid-cols-12 gap-5">
      <div class="col-span-12 lg:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">📋 Distribuzione contratti</h3>
        <div class="space-y-3">
          <div v-for="type in contractTypes" :key="type" class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span class="font-medium text-gray-700">{{ type }}</span>
            <span class="text-lg font-semibold text-gray-900">{{ countByContractType(type) }}</span>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">👥 Top Teams (Headcount)</h3>
        <div class="space-y-2">
          <div v-for="team in topTeams" :key="team.name" class="flex items-center justify-between">
            <span class="text-sm text-gray-700">{{ team.name }}</span>
            <div class="flex items-center gap-2">
              <div class="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-primary-500" :style="{ width: (team.total / maxTeam * 100) + '%' }"></div>
              </div>
              <span class="text-sm font-semibold text-gray-900 w-6 text-right">{{ team.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TEAM STATISTICS TABLE -->
    <div class="card p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">👥 Dipendenti per team (Dettaglio)</h3>
        <button @click="expandTeamStatsTable = !expandTeamStatsTable" class="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
          {{ expandTeamStatsTable ? '▼ Riduci' : '▶ Espandi' }}
        </button>
      </div>
      <div class="overflow-x-auto" :style="{ maxHeight: expandTeamStatsTable ? 'none' : '300px', overflowY: expandTeamStatsTable ? 'visible' : 'auto' }">
        <table class="tbl text-sm">
          <thead>
            <tr>
              <th>Team</th>
              <th>Totale</th>
              <th>Attivi</th>
              <th>In Prova</th>
              <th>% Attivi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in teamStats" :key="team.name">
              <td class="font-medium text-xs">{{ team.name }}</td>
              <td>{{ team.total }}</td>
              <td><span class="badge badge-green">{{ team.attivi }}</span></td>
              <td><span class="badge badge-yellow">{{ team.inProva }}</span></td>
              <td>{{ Math.round(team.attivi / team.total * 100) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== FERIE & MALATTIE ANALYTICS ===== -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard label="Ferie spettanti" :value="r2(fa.totals.spettanti)" icon="📅" color="blue" />
      <KpiCard label="Ferie godute" :value="r2(fa.totals.godute)" icon="✅" color="emerald" />
      <KpiCard label="% Godute" :value="r2(fa.totals.percGodute) + '%'" icon="📊" color="indigo" />
      <KpiCard label="Gg Malattia" :value="r2(fa.totals.malattia)" icon="🤒" color="red" />
    </div>

    <div class="grid grid-cols-12 gap-5">
      <!-- Ferie per team -->
      <div class="col-span-12 lg:col-span-6 card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">🏖️ Ferie per Team</h3>
          <button @click="expandFerieTable = !expandFerieTable" class="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
            {{ expandFerieTable ? '▼ Riduci' : '▶ Espandi' }}
          </button>
        </div>
        <div class="overflow-x-auto" :style="{ maxHeight: expandFerieTable ? 'none' : '300px', overflowY: expandFerieTable ? 'visible' : 'auto' }">
          <table class="tbl text-sm">
            <thead>
              <tr>
                <th>Team</th>
                <th class="text-center">Dip.</th>
                <th class="text-center">Spettanti</th>
                <th class="text-center">Godute</th>
                <th class="text-center">Residue</th>
                <th class="text-center">%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in fa.byTeam" :key="t.team">
                <td class="font-medium text-xs">{{ t.team }}</td>
                <td class="text-center">{{ t.n }}</td>
                <td class="text-center">{{ r2(t.spettanti) }}</td>
                <td class="text-center">{{ r2(t.godute) }}</td>
                <td class="text-center">
                  <span :class="['font-semibold', t.residue > t.spettanti * 0.8 ? 'text-amber-600' : '']">{{ r2(t.residue) }}</span>
                </td>
                <td class="text-center">
                  <div class="flex items-center gap-1 justify-center">
                    <div class="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-primary-400 rounded-full" :style="{ width: t.percGodute + '%' }"></div>
                    </div>
                    <span class="text-xs">{{ r2(t.percGodute) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Malattia per team -->
      <div class="col-span-12 lg:col-span-6 card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">🤒 Malattia per Team</h3>
          <button @click="expandMalattiaTable = !expandMalattiaTable" class="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
            {{ expandMalattiaTable ? '▼ Riduci' : '▶ Espandi' }}
          </button>
        </div>
        <div class="overflow-x-auto" :style="{ maxHeight: expandMalattiaTable ? 'none' : '300px', overflowY: expandMalattiaTable ? 'visible' : 'auto' }">
          <table class="tbl text-sm">
            <thead>
              <tr>
                <th>Team</th>
                <th class="text-center">Dip.</th>
                <th class="text-center">Gg Totali</th>
                <th class="text-center">Media/dip</th>
                <th class="text-center">Gg 3m</th>
                <th class="text-center">Episodi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in fa.byTeam" :key="t.team">
                <td class="font-medium text-xs">{{ t.team }}</td>
                <td class="text-center">{{ t.n }}</td>
                <td class="text-center">
                  <span :class="t.malattia > 20 ? 'text-red-600 font-semibold' : ''">{{ r2(t.malattia) }}</span>
                </td>
                <td class="text-center">{{ r2(t.avgMal) }}</td>
                <td class="text-center">
                  <span :class="t.mal3m > 10 ? 'text-amber-600 font-semibold' : ''">{{ r2(t.mal3m) }}</span>
                </td>
                <td class="text-center">{{ t.episodi }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Top lists -->
    <div class="grid grid-cols-12 gap-5">
      <div class="col-span-12 lg:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">📌 Top 5 — Ferie Residue più alte</h3>
        <div class="space-y-2">
          <div v-for="(f, i) in fa.topResidue" :key="f.nome" class="flex items-center justify-between p-2 bg-amber-50 rounded">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-amber-600 w-5">{{ i + 1 }}.</span>
              <span class="text-sm font-medium text-gray-800">{{ f.nome }}</span>
              <span class="text-xs text-gray-400">{{ f.team }}</span>
            </div>
            <span class="font-bold text-amber-700">{{ r2(f.ferieResidue) }}gg</span>
          </div>
          <div v-if="fa.topResidue.length === 0" class="text-sm text-gray-400 text-center py-4">Nessun dato</div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6 card p-5">
        <h3 class="font-semibold text-gray-900 mb-4">📌 Top 5 — Malattia (gg anno)</h3>
        <div class="space-y-2">
          <div v-for="(f, i) in fa.topMalattia" :key="f.nome" class="flex items-center justify-between p-2 bg-red-50 rounded">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-red-600 w-5">{{ i + 1 }}.</span>
              <span class="text-sm font-medium text-gray-800">{{ f.nome }}</span>
              <span class="text-xs text-gray-400">{{ f.team }}</span>
            </div>
            <span class="font-bold text-red-700">{{ r2(f.ggMalattia) }}gg</span>
          </div>
          <div v-if="fa.topMalattia.length === 0" class="text-sm text-gray-400 text-center py-4">Nessun dato</div>
        </div>
      </div>
    </div>

    <!-- P&C INFO -->
    <div class="card p-5 border border-amber-200 bg-amber-50">
      <h3 class="font-semibold text-amber-900 mb-2">ℹ️ Dati People & Culture</h3>
      <p class="text-sm text-amber-800">
        I dati di benessere e colloqui P&C sono stati rimossi (fresh start 2026). 
        I grafici relativi a esaurimento, motivazione e altre scale non hanno dati disponibili.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useHrStore } from '@/stores/hrStore'
import { useHelpers } from '@/composables/useHelpers.js'
import KpiCard from '@/components/ui/KpiCard.vue'

const store = useHrStore()
const { fmtDateShort } = useHelpers()
const expandFerieTable = ref(false)
const expandMalattiaTable = ref(false)
const expandTeamStatsTable = ref(false)
const expandAgeAnalytics = ref(false)

function r2(v) { return v != null ? Math.round(Number(v) * 100) / 100 : 0 }

function getDivisionFromTeam(team) {
  if (!team) return ''
  if (team.toLowerCase().includes('silicon')) return 'silicon'
  if (team.toLowerCase().includes('solutions')) return 'solutions'
  return 'other'
}

function getHiringByDivisionYear(division, year) {
  return store.employees.filter(e => {
    const d = getDivisionFromTeam(e.team)
    return d === division && e.dataAssunzione && e.dataAssunzione.startsWith(String(year))
  }).length
}

function getTotalHiringByDivision(division) {
  return store.employees.filter(e => getDivisionFromTeam(e.team) === division).length
}

const yearsAvailable = computed(() => {
  const years = new Set()
  store.employees.forEach(e => {
    if (e.dataAssunzione) {
      const year = parseInt(e.dataAssunzione.substring(0, 4))
      years.add(year)
    }
  })
  return Array.from(years).sort((a, b) => a - b)
})

const maxHiringYear = computed(() => {
  let max = 1
  yearsAvailable.value.forEach(year => {
    max = Math.max(max, getHiringByDivisionYear('silicon', year), getHiringByDivisionYear('solutions', year))
  })
  return max
})

const siliconTrend = computed(() => {
  if (yearsAvailable.value.length < 2) return 0
  const current = getHiringByDivisionYear('silicon', yearsAvailable.value[yearsAvailable.value.length - 1])
  const previous = getHiringByDivisionYear('silicon', yearsAvailable.value[yearsAvailable.value.length - 2])
  return current - previous
})

const solutionsTrend = computed(() => {
  if (yearsAvailable.value.length < 2) return 0
  const current = getHiringByDivisionYear('solutions', yearsAvailable.value[yearsAvailable.value.length - 1])
  const previous = getHiringByDivisionYear('solutions', yearsAvailable.value[yearsAvailable.value.length - 2])
  return current - previous
})

const STATI_ESCLUSI = ['In Uscita Concordata', 'Inattivo']
const exDipendenti = computed(() => store.enrichedEmployees.filter(e => STATI_ESCLUSI.includes(e.stato)))

const avgPermanenzaEx = computed(() => {
  if (exDipendenti.value.length === 0) return 0
  const now = new Date()
  const sum = exDipendenti.value.reduce((acc, e) => {
    const start = e.dataAssunzione ? new Date(e.dataAssunzione) : now
    const end = e.dataUscita ? new Date(e.dataUscita) : now
    return acc + Math.round((end - start) / (30.44 * 86400000))
  }, 0)
  return Math.round(sum / exDipendenti.value.length)
})

const contractTypes = ['indeterminato', 'determinato']

const countByContractType = (type) => {
  return store.employees.filter(e => e.tipoContratto === type).length
}

const teamStats = computed(() => {
  const teams = {}
  
  store.employees.forEach(emp => {
    if (!teams[emp.team]) {
      teams[emp.team] = { name: emp.team, total: 0, attivi: 0, inProva: 0 }
    }
    teams[emp.team].total++
    if (emp.stato === 'Attivo') teams[emp.team].attivi++
    if (emp.esitoProva === 'In Corso') teams[emp.team].inProva++
  })

  return Object.values(teams).sort((a, b) => b.total - a.total)
})

const topTeams = computed(() => teamStats.value.slice(0, 8))
const maxTeam = computed(() => Math.max(...topTeams.value.map(t => t.total), 1))

// Ferie analytics from store
const fa = computed(() => store.ferieAnalytics || { totals: { spettanti: 0, godute: 0, residue: 0, malattia: 0, percGodute: 0 }, byTeam: [], topMalattia: [], topResidue: [] })

// ===== AGE ANALYTICS =====
function calculateAge(birthDate) {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function calculateSeniority(hireDate) {
  if (!hireDate) return null
  const today = new Date()
  const hire = new Date(hireDate)
  return (today - hire) / (365 * 86400000)
}

const allEmployeesWithAge = computed(() => {
  return store.employees
    .filter(e => e.dataNascita && e.stato === 'Attivo' && e.team !== 'Freelance')
    .map(e => ({
      ...e,
      age: calculateAge(e.dataNascita),
      seniority: calculateSeniority(e.dataAssunzione)
    }))
    .filter(e => e.age !== null)
})

const avgAge = computed(() => {
  if (allEmployeesWithAge.value.length === 0) return 0
  const sum = allEmployeesWithAge.value.reduce((acc, e) => acc + e.age, 0)
  return sum / allEmployeesWithAge.value.length
})

const minAge = computed(() => {
  if (allEmployeesWithAge.value.length === 0) return 0
  return Math.min(...allEmployeesWithAge.value.map(e => e.age))
})

const maxAge = computed(() => {
  if (allEmployeesWithAge.value.length === 0) return 0
  return Math.max(...allEmployeesWithAge.value.map(e => e.age))
})

const avgSeniority = computed(() => {
  const withSeniority = allEmployeesWithAge.value.filter(e => e.seniority !== null)
  if (withSeniority.length === 0) return 0
  const sum = withSeniority.reduce((acc, e) => acc + e.seniority, 0)
  return sum / withSeniority.length
})

const ageRiskRetirement = computed(() => {
  // Persone che hanno 62+ anni (10 anni prima dei 72)
  return allEmployeesWithAge.value.filter(e => e.age >= 62).length
})

const ageBands = computed(() => {
  const bands = [
    { min: 18, max: 30, label: '18-30', color: 'bg-blue-500' },
    { min: 31, max: 40, label: '31-40', color: 'bg-indigo-500' },
    { min: 41, max: 50, label: '41-50', color: 'bg-purple-500' },
    { min: 51, max: 60, label: '51-60', color: 'bg-orange-500' },
    { min: 61, max: 100, label: '60+', color: 'bg-red-500' }
  ]
  
  return bands.map(band => {
    const count = allEmployeesWithAge.value.filter(e => e.age >= band.min && e.age <= band.max).length
    const percent = allEmployeesWithAge.value.length > 0 ? (count / allEmployeesWithAge.value.length) * 100 : 0
    return { ...band, count, percent }
  })
})

const maxAgeBand = computed(() => Math.max(...ageBands.value.map(b => b.count), 1))

const ageByTeam = computed(() => {
  const teams = {}
  allEmployeesWithAge.value.forEach(emp => {
    if (!teams[emp.team]) {
      teams[emp.team] = { team: emp.team, ages: [], count: 0 }
    }
    teams[emp.team].ages.push(emp.age)
    teams[emp.team].count++
  })
  
  return Object.values(teams)
    .map(t => ({
      ...t,
      avgAge: t.ages.length > 0 ? t.ages.reduce((a, b) => a + b) / t.ages.length : 0
    }))
    .sort((a, b) => b.avgAge - a.avgAge)
})

const allCcnlLevels = computed(() => {
  const levels = new Set(store.employees.map(e => e.livelloCCNL).filter(l => l))
  return Array.from(levels).sort()
})

function getCcnlCountInAgeBand(minAge, maxAge, ccnlLevel) {
  return allEmployeesWithAge.value.filter(e => 
    e.age >= minAge && e.age <= maxAge && e.livelloCCNL === ccnlLevel
  ).length
}

function getContractCountInAgeBand(minAge, maxAge, contractType) {
  return allEmployeesWithAge.value.filter(e => 
    e.age >= minAge && e.age <= maxAge && e.tipoContratto === contractType
  ).length
}

function getHeatmapColor(ratio) {
  if (ratio >= 0.5) return 'bg-red-600'
  if (ratio >= 0.3) return 'bg-orange-500'
  if (ratio >= 0.1) return 'bg-yellow-500'
  return 'bg-gray-300'
}

</script>
