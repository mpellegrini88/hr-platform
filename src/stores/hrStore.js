import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { SEED_EMPLOYEES, SEED_COLLOQUI, SEED_FERIE, SEED_COLLOQUI_PC, SEED_DIMISSIONI } from '@/seedData.js'
import { calcProvatione } from '@/composables/useCCNL.js'

export const useHrStore = defineStore('hr', () => {
  const toast = ref({ show: false, msg: '', type: 'success' })
  const employees  = ref(SEED_EMPLOYEES.map((e, i) => ({ ...e, id: i + 1 })))
  const colloqui   = ref(SEED_COLLOQUI)
  const ferie      = ref(SEED_FERIE)
  const colloquiPC = ref(SEED_COLLOQUI_PC)
  const dimissioni = ref(SEED_DIMISSIONI)

  function recalcProva(emp) {
    if (!emp.dataAssunzione || !emp.livelloCCNL) return emp
    const r = calcProvatione(emp.livelloCCNL, emp.tipoContratto, emp.dataAssunzione, emp.scadenzaContratto)
    emp.durataProva = r.durata; emp.metodoComputo = r.metodo; emp.fineProva = r.fineProva
    if (emp.dataAssunzione) {
      const h = new Date(emp.dataAssunzione)
      const fu1 = new Date(h); fu1.setDate(fu1.getDate() + 30)
      emp.scadenzaFU1 = fu1.toISOString().split('T')[0]
      const fu2mgr = new Date(h); fu2mgr.setDate(fu2mgr.getDate() + 45)
      emp.scadenzaFU2Manager = fu2mgr.toISOString().split('T')[0]
      if (r.fineProva) {
        const fu2 = new Date(r.fineProva); fu2.setDate(fu2.getDate() - 30)
        emp.scadenzaFU2 = fu2.toISOString().split('T')[0]
      }
    }
    return emp
  }

  function addEmployee(data) {
    const e = recalcProva({ ...data, id: Date.now(), statoFU1: 'Da Fare', statoFU2Dip: 'Da Fare', statoFU2Manager: 'Da Fare', esitoProva: 'In Corso', stato: data.stato || 'Attivo' })
    employees.value.push(e)
    colloqui.value.push({ nome: e.nome, team: e.team })
    ferie.value.push({ nome: e.nome, team: e.team, citta: e.citta, ferieSpettanti: 0, ferieGodute: 0, ferieResidue: 0, percGodute: 0, ggMalattia: 0, episodiMalattia: 0, ggMalattia3m: 0, assenzeNonGiust: 0 })
    notify('Dipendente aggiunto ✓')
    return e
  }

  function updateEmployee(id, data) {
    const idx = employees.value.findIndex(e => e.id === id)
    if (idx === -1) return
    employees.value[idx] = recalcProva({ ...employees.value[idx], ...data })
    notify('Salvato ✓')
  }

  function deleteEmployee(id) {
    const emp = employees.value.find(e => e.id === id)
    if (!emp) return
    employees.value = employees.value.filter(e => e.id !== id)
    colloqui.value  = colloqui.value.filter(c => c.nome !== emp.nome)
    ferie.value     = ferie.value.filter(f => f.nome !== emp.nome)
    notify('Eliminato')
  }

  function saveColloquio(nome, data) {
    const idx = colloqui.value.findIndex(c => c.nome === nome)
    if (idx !== -1) colloqui.value[idx] = { ...colloqui.value[idx], ...data }
    else colloqui.value.push({ nome, ...data })
    notify('Colloquio salvato ✓')
  }

  function saveFerie(nome, data) {
    const idx = ferie.value.findIndex(f => f.nome === nome)
    if (idx !== -1) ferie.value[idx] = { ...ferie.value[idx], ...data }
    notify('Ferie aggiornate ✓')
  }

  function saveColloquioPC(nome, data) {
    const idx = colloquiPC.value.findIndex(c => c.nome === nome)
    if (idx !== -1) {
      colloquiPC.value[idx] = { ...colloquiPC.value[idx], ...data }
    } else {
      colloquiPC.value.push({ nome, team: employees.value.find(e => e.nome === nome)?.team, ...data })
    }
    notify('Colloquio P&C salvato ✓')
  }

  function saveDimissione(id, data) {
    const emp = employees.value.find(e => e.id === id)
    if (!emp) return
    const idx = dimissioni.value.findIndex(d => d.nome === emp.nome)
    if (idx !== -1) {
      dimissioni.value[idx] = { ...dimissioni.value[idx], ...data }
    } else {
      dimissioni.value.push({ nome: emp.nome, team: emp.team, dataAssunzione: emp.dataAssunzione, ...data })
    }
    notify('Dimissione registrata ✓')
  }

  function scheduleNextPC(nome, daysFromNow = 180) {
    const idx = colloquiPC.value.findIndex(c => c.nome === nome)
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    const nextReviewDate = d.toISOString().split('T')[0]
    if (idx !== -1) {
      colloquiPC.value[idx].nextReviewDate = nextReviewDate
    } else {
      const team = employees.value.find(e => e.nome === nome)?.team
      colloquiPC.value.push({ nome, team, nextReviewDate })
    }
  }

  function saveFile() {
    const wb = XLSX.utils.book_new()
    const anaRows = [
      ['#','Nome','Società','Città','Team','Email','Data Assunzione','Tipo Contratto','Ore/Sett','Livello CCNL','Durata Prova','Metodo','Fine Prova','Esito Prova','FU1','Stato FU1','FU2','Stato FU2 Dip','Stato FU2 Mgr','Scad. Contratto','Stato'],
      ...employees.value.map(e => [e.id,e.nome,e.societa||'MOVE Solutions',e.citta,e.team,e.email,e.dataAssunzione,e.tipoContratto,e.oreSettimana||'',e.livelloCCNL,e.durataProva,e.metodoComputo,e.fineProva,e.esitoProva,e.scadenzaFU1,e.statoFU1,e.scadenzaFU2,e.statoFU2Dip,e.statoFU2Manager,e.scadenzaContratto||'',e.stato])
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(anaRows), 'Anagrafica')
    const collRows = [
      ['Nome','Team','C1 Data','C1 Esaur','C1 Carico','C1 Motiv','C1 Supp','C1 Equil','C1 Intent','C1 Esito','C2 Data','C2 Esaur','C2 Carico','C2 Motiv','C2 Supp','C2 Equil','C2 Intent','C2 Esito','C3 Data','C3 Esaur','C3 Carico','C3 Motiv','C3 Supp','C3 Equil','C3 Intent','C3 Esito','Note'],
      ...colloqui.value.map(c => [c.nome,c.team,c.c1_data,c.c1_esaur,c.c1_carico,c.c1_motiv,c.c1_supp,c.c1_equil,c.c1_intent,c.c1_esito,c.c2_data,c.c2_esaur,c.c2_carico,c.c2_motiv,c.c2_supp,c.c2_equil,c.c2_intent,c.c2_esito,c.c3_data,c.c3_esaur,c.c3_carico,c.c3_motiv,c.c3_supp,c.c3_equil,c.c3_intent,c.c3_esito,c.note_trasversali])
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(collRows), 'Onboarding')

    // P&C Colloqui sheet
    const pcRows = [
      ['Nome','Team','Data','Tipo','Supervisor','Esaurimento','Carico','Motivazione','Supporto','Equilibrio','Intenzione','Performance','Engagement','Note','Prossimo Colloquio'],
      ...colloquiPC.value.map(c => [c.nome,c.team,c.date,c.tipo,c.supervisor,c.esaur,c.carico,c.motiv,c.supp,c.equil,c.intent,c.performanceScore,c.engagementScore,c.noteColloquio,c.nextReviewDate])
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pcRows), 'Colloqui P&C')

    // Dimissioni sheet
    const dimRows = [
      ['Nome','Team','Data Assunzione','Data Uscita','Motivo','Note'],
      ...dimissioni.value.map(d => [d.nome,d.team,d.dataAssunzione,d.dataUscita,d.motivoUscita,d.noteUscita])
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dimRows), 'Dimissioni')

    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([out])), download: 'MOVE_HR_export.xlsx' })
    a.click(); URL.revokeObjectURL(a.href)
    notify('Excel esportato ✓')
  }

  const teams = computed(() => [...new Set(employees.value.map(e => e.team).filter(Boolean))].sort())
  const colloquiMap = computed(() => Object.fromEntries(colloqui.value.map(c => [c.nome, c])))
  const ferieMap    = computed(() => Object.fromEntries(ferie.value.map(f => [f.nome, f])))
  const colloquiPCMap = computed(() => Object.fromEntries(colloquiPC.value.map(c => [c.nome, c])))
  const dimissioniMap = computed(() => Object.fromEntries(dimissioni.value.map(d => [d.nome, d])))

  const enrichedEmployees = computed(() => employees.value.map(e => {
    const c = colloquiMap.value[e.nome] || {}
    const f = ferieMap.value[e.nome] || {}
    const lastC = c.c2_esaur
      ? { esaur: c.c2_esaur, carico: c.c2_carico, motiv: c.c2_motiv, supp: c.c2_supp, equil: c.c2_equil, intent: c.c2_intent }
      : c.c1_esaur
      ? { esaur: c.c1_esaur, carico: c.c1_carico, motiv: c.c1_motiv, supp: c.c1_supp, equil: c.c1_equil, intent: c.c1_intent }
      : null
    let scoreGlobale = null, burnoutRisk = null, rischioRitenzione = null
    if (lastC) {
      const b = (lastC.esaur * 1.5 + lastC.carico) / 2.5
      const w = (lastC.motiv + lastC.supp + lastC.equil + lastC.intent) / 4
      scoreGlobale = Math.round((b * 0.4 + (6 - w) * 0.6) * 10) / 10
      burnoutRisk = b >= 4 ? 'alto' : b >= 3 ? 'medio' : 'basso'
      rischioRitenzione = lastC.intent <= 2 ? 'alto' : lastC.intent <= 3 ? 'medio' : 'basso'
    }
    const today = new Date()
    const fp  = e.fineProva    ? new Date(e.fineProva)    : null
    const fu1 = e.scadenzaFU1  ? new Date(e.scadenzaFU1)  : null
    const fu2m = e.scadenzaFU2Manager ? new Date(e.scadenzaFU2Manager) : null
    const fu2 = e.scadenzaFU2  ? new Date(e.scadenzaFU2)  : null
    const daysDiff = d => d ? Math.round((d - today) / 86400000) : null
    return {
      ...e, _coll: c, _ferie: f, lastC, scoreGlobale, burnoutRisk, rischioRitenzione,
      inProva: fp && fp > today,
      daysToProva: daysDiff(fp), daysToFU1: daysDiff(fu1), daysToFU2Manager: daysDiff(fu2m), daysToFU2: daysDiff(fu2),
      fu1Scaduto: fu1 && fu1 < today && e.statoFU1 !== 'Fatto',
      fu1Urgente: fu1 && daysDiff(fu1) >= 0 && daysDiff(fu1) <= 7,
      fu2ManagerUrgente: fu2m && daysDiff(fu2m) >= 0 && daysDiff(fu2m) <= 7,
      fu2ManagerScaduto: fu2m && fu2m < today && e.statoFU2Manager !== 'Fatto',
      fu2Urgente: fu2 && daysDiff(fu2) >= 0 && daysDiff(fu2) <= 7,
      provaUrgente: fp && daysDiff(fp) >= 0 && daysDiff(fp) <= 30
    }
  }))

  const teamStats = computed(() => {
    const map = {}
    enrichedEmployees.value.forEach(e => {
      if (!e.team) return
      if (!map[e.team]) map[e.team] = { team: e.team, n: 0, attivi: 0, burnoutAlto: 0, atRisk: 0, esaur: [], carico: [], motiv: [], supp: [], equil: [], intent: [], ggMal: 0, ferRes: 0 }
      const m = map[e.team]; m.n++
      if (e.stato === 'Attivo') m.attivi++
      if (e.burnoutRisk === 'alto') m.burnoutAlto++
      if (e.rischioRitenzione === 'alto') m.atRisk++
      if (e.lastC) { m.esaur.push(e.lastC.esaur); m.carico.push(e.lastC.carico); m.motiv.push(e.lastC.motiv); m.supp.push(e.lastC.supp); m.equil.push(e.lastC.equil); m.intent.push(e.lastC.intent) }
      m.ggMal += (e._ferie.ggMalattia || 0); m.ferRes += (e._ferie.ferieResidue || 0)
    })
    const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : null
    return Object.values(map).map(m => ({ ...m, avgEsaur: avg(m.esaur), avgCarico: avg(m.carico), avgMotiv: avg(m.motiv), avgSupp: avg(m.supp), avgEquil: avg(m.equil), avgIntent: avg(m.intent) })).sort((a, b) => b.n - a.n)
  })

  const kpiScadenze = computed(() => {
    let ppInCorso = 0, fu1Scaduti = 0, fu1In7 = 0, fu2In30 = 0, provaIn30 = 0, burnoutUrgenti = 0
    enrichedEmployees.value.forEach(e => {
      if (e.inProva) ppInCorso++
      if (e.fu1Scaduto) fu1Scaduti++
      if (e.fu1Urgente && !e.fu1Scaduto) fu1In7++
      if (e.daysToFU2 != null && e.daysToFU2 >= 0 && e.daysToFU2 <= 30 && e.statoFU2Dip !== 'Fatto') fu2In30++
      if (e.provaUrgente) provaIn30++
      if (e.burnoutRisk === 'alto') burnoutUrgenti++
    })
    return { ppInCorso, fu1Scaduti, fu1In7, fu2In30, provaIn30, burnoutUrgenti }
  })

  const burnoutRetentionQuadrants = computed(() => {
    const quadrants = { engaged: [], atRisk: [], burnedOut: [], disengaged: [] }
    enrichedEmployees.value.forEach(e => {
      const coll = colloquiPCMap.value[e.nome]
      if (!coll || !coll.esaur || !coll.intent) return
      const esaurimento = coll.esaur // 1-5, high = bad
      const intenzione = coll.intent // 1-5, high = good retention
      // Quadranti: Y = esaurimento (basso/alto), X = intenzione (bassa/alta)
      if (esaurimento <= 2.5 && intenzione >= 3.5) quadrants.engaged.push(e)
      else if (esaurimento > 2.5 && intenzione >= 3.5) quadrants.atRisk.push(e)
      else if (esaurimento > 2.5 && intenzione < 3.5) quadrants.burnedOut.push(e)
      else quadrants.disengaged.push(e)
    })
    return quadrants
  })

  const pcStats = computed(() => {
    const map = {}
    enrichedEmployees.value.forEach(e => {
      if (!e.team || e.stato !== 'Attivo') return
      if (!map[e.team]) map[e.team] = { team: e.team, n: 0, engaged: 0, atRisk: 0, burnedOut: 0, disengaged: 0 }
      const m = map[e.team]; m.n++
      const q = burnoutRetentionQuadrants.value
      if (q.engaged.find(x => x.id === e.id)) m.engaged++
      if (q.atRisk.find(x => x.id === e.id)) m.atRisk++
      if (q.burnedOut.find(x => x.id === e.id)) m.burnedOut++
      if (q.disengaged.find(x => x.id === e.id)) m.disengaged++
    })
    return Object.values(map).sort((a, b) => b.n - a.n)
  })

  const nextPC = computed(() => {
    const today = new Date()
    const list = []
    enrichedEmployees.value.forEach(e => {
      if (e.stato !== 'Attivo') return
      const coll = colloquiPCMap.value[e.nome]
      const lastDate = coll?.date ? new Date(coll.date) : null
      const nextDate = coll?.nextReviewDate ? new Date(coll.nextReviewDate) : null
      const daysAgo = lastDate ? Math.round((today - lastDate) / 86400000) : null
      // P&C scaduto se: > 180 giorni dal colloquio, oppure nextReviewDate < today
      if ((daysAgo && daysAgo > 180) || (nextDate && nextDate < today)) {
        list.push({ ...e, lastDate, daysAgo, urgenza: nextDate && nextDate < today ? 'Scaduto' : 'Urgente' })
      }
    })
    return list.sort((a, b) => (a.daysAgo || 0) - (b.daysAgo || 0))
  })

  const kpiPC = computed(() => {
    let pcScaduti = nextPC.value.length
    let q = burnoutRetentionQuadrants.value
    return {
      pcScaduti,
      engaged: q.engaged.length,
      atRisk: q.atRisk.length,
      burnedOut: q.burnedOut.length,
      disengaged: q.disengaged.length
    }
  })

  function notify(msg, type = 'success') {
    toast.value = { show: true, msg, type }
    setTimeout(() => toast.value.show = false, 3200)
  }

  return {
    toast, employees, colloqui, ferie, colloquiPC, dimissioni,
    teams, enrichedEmployees, teamStats, kpiScadenze, colloquiMap, ferieMap, colloquiPCMap, dimissioniMap,
    burnoutRetentionQuadrants, pcStats, nextPC, kpiPC,
    addEmployee, updateEmployee, deleteEmployee,
    saveColloquio, saveFerie, saveColloquioPC, saveDimissione, scheduleNextPC, saveFile, notify
  }
})
