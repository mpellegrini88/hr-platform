import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { SEED_EMPLOYEES, SEED_COLLOQUI, SEED_FERIE, SEED_COLLOQUI_PC, SEED_DIMISSIONI, SEED_VALUTAZIONI_COMPLETE, TIPI_CONTRATTO_EXPANDED } from '@/seedData.js'
import { calcProvatione } from '@/composables/useCCNL.js'
import { usePersistence } from '@/composables/usePersistence.js'
import { useDataMigration } from '@/composables/useDataMigration.js'
import { useAutoSave } from '@/composables/useAutoSave.js'
import { useIndexedDB } from '@/composables/useIndexedDB.js'

export const useHrStore = defineStore('hr', () => {
  const toast = ref({ show: false, msg: '', type: 'success' })

  // ── Costanti ferie/permessi ──
  // Contratto proprio (Silicon/Move): solo ferie 21.96gg a 7.5h/giorno
  // CCNL Commercio: ferie 26gg + permessi ROL 56h + ex-festività 32h
  const FERIE_CONTRATTO_PROPRIO = 21.96
  const FERIE_CCNL_COMMERCIO = 26
  const PERMESSI_ROL_ORE = 56
  const EX_FESTIVITA_ORE = 32
  const PERMESSI_TOTALI_ORE = PERMESSI_ROL_ORE + EX_FESTIVITA_ORE // 88h
  const PERMESSI_TOTALI_GG = Math.round(PERMESSI_TOTALI_ORE / 8 * 100) / 100 // ~11gg

  // ── Categorizzazione team ──
  const SILICON_TEAMS = ['Silicon Milano', 'Silicon Lucca', 'Business Development Milano']

  function getSocieta(team) {
    if (!team) return 'Altro'
    if (SILICON_TEAMS.includes(team)) return 'Silicon'
    if (team.startsWith('Solutions >') || team === 'Freelance') return 'Move Solutions'
    return 'Altro'
  }

  function getDefaultContratto(team) {
    // Default: tutti con contratto proprio (21.96gg). Si può cambiare manualmente a CCNL.
    return 'proprio'
  }

  function getFerieSpettanti(tipoContrattoFerie, oreSettimana) {
    const ratio = (oreSettimana || 40) / 40
    if (tipoContrattoFerie === 'proprio') {
      return { ferie: Math.round(FERIE_CONTRATTO_PROPRIO * ratio * 100) / 100, permessiGg: 0, permessiOre: 0 }
    }
    return {
      ferie: Math.round(FERIE_CCNL_COMMERCIO * ratio * 100) / 100,
      permessiGg: Math.round(PERMESSI_TOTALI_GG * ratio * 100) / 100,
      permessiOre: Math.round(PERMESSI_TOTALI_ORE * ratio * 100) / 100
    }
  }

  // Normalizza schema dipendente: aggiunge campi mancanti
  function normalizeEmployeeSchema(emp) {
    // Assunti prima del 2026: FU già completati, non ha senso mostrare "Da Fare"
    const pre2026 = emp.dataAssunzione && new Date(emp.dataAssunzione) < new Date('2026-01-01')
    const fuDefault = pre2026 ? 'Fatto' : 'Da Fare'
    
    return {
      ...emp,
      // Onboarding scadenze
      statoFU1: emp.statoFU1 || fuDefault,
      noteFU1: emp.noteFU1 || (pre2026 ? 'Completato (pre-2026)' : ''),
      statoFU2Dip: emp.statoFU2Dip || fuDefault,
      noteFU2Dip: emp.noteFU2Dip || (pre2026 ? 'Completato (pre-2026)' : ''),
      statoFU2Manager: emp.statoFU2Manager || fuDefault,
      noteFU2Manager: emp.noteFU2Manager || (pre2026 ? 'Completato (pre-2026)' : ''),
      // Dimissioni
      dataUscita: emp.dataUscita || null,
      motivoUscita: emp.motivoUscita || '',
      noteUscita: emp.noteUscita || '',
      // Contract renewal (determinati)
      scadenzaRinnovo: emp.scadenzaRinnovo || null,
      statoRinnovo: emp.statoRinnovo || 'Da Fare',
      scadenzaDossierContratto: emp.scadenzaDossierContratto || null,
      statoDossierContratto: emp.statoDossierContratto || 'Da Fare',
      // Valutazione periodo di prova
      valutazionePeriodoProva: emp.valutazionePeriodoProva ? {
        faseCorrente: emp.valutazionePeriodoProva.faseCorrente || 'manager-pending',
        dataValutazioneManager: emp.valutazionePeriodoProva.dataValutazioneManager || null,
        dataValutazioneHR: emp.valutazionePeriodoProva.dataValutazioneHR || null,
        manager: emp.valutazionePeriodoProva.manager || null,
        hr: emp.valutazionePeriodoProva.hr || null
      } : {
        faseCorrente: 'manager-pending',
        dataValutazioneManager: null,
        dataValutazioneHR: null,
        manager: null,
        hr: null
      },
      // Metadata
      valutazioneMetadata: emp.valutazioneMetadata ? {
        anno: emp.valutazioneMetadata.anno || 2026,
        dataCreazione: emp.valutazioneMetadata.dataCreazione || null,
        dataUltimaModifica: emp.valutazioneMetadata.dataUltimaModifica || null,
        datiPre2026Eliminati: emp.valutazioneMetadata.datiPre2026Eliminati || false
      } : {
        anno: 2026,
        dataCreazione: null,
        dataUltimaModifica: null,
        datiPre2026Eliminati: false
      }
    }
  }

  const employees  = ref(SEED_EMPLOYEES.map((e, i) => normalizeEmployeeSchema({ ...e, id: i + 1 })))
  const colloqui   = ref(SEED_COLLOQUI)
  const ferie      = ref(SEED_FERIE)
  const colloquiPC = ref(SEED_COLLOQUI_PC)
  const dimissioni = ref(SEED_DIMISSIONI)
  const valutazioni360 = ref(SEED_VALUTAZIONI_COMPLETE)

  // Auto-populate ferie for all employees that don't have a record yet
  function ensureFerieForAll() {
    const existing = new Set(ferie.value.map(f => f.empId || f.nome))
    employees.value.forEach(e => {
      if (!existing.has(e.id) && !existing.has(e.nome)) {
        const nomeCompleto = `${e.nome} ${e.cognome}`
        const tipoContrattoFerie = getDefaultContratto(e.team)
        const spett = getFerieSpettanti(tipoContrattoFerie, e.oreSettimana)
        ferie.value.push({
          empId: e.id, nome: nomeCompleto, team: e.team, citta: e.citta,
          tipoContrattoFerie,
          societa: getSocieta(e.team),
          ferieSpettanti: spett.ferie,
          ferieGodute: 0, ferieResidue: spett.ferie,
          permessiSpettantiGg: spett.permessiGg,
          permessiSpettantiOre: spett.permessiOre,
          permessiGodutiGg: 0, permessiResiduiGg: spett.permessiGg,
          percGodute: 0, ggMalattia: 0, episodiMalattia: 0, ggMalattia3m: 0, assenzeNonGiust: 0,
          noteFerie: '', noteMalattia: '', noteAssenze: '',
          entries: []
        })
      }
    })
  }
  ensureFerieForAll()

  // Composables per persistenza e migrazione
  const persistence = usePersistence()
  const migration = useDataMigration()
  const autoSave = useAutoSave()
  const idb = useIndexedDB()

  // Save to IndexedDB (persistent storage that survives session end)
  async function saveToIndexedDB() {
    const snapshot = getStoreSnapshot()
    await idb.saveAll(snapshot)
  }

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
    saveToIndexedDB()
    return e
  }

  function updateEmployee(id, data) {
    const idx = employees.value.findIndex(e => e.id === id)
    if (idx === -1) return
    employees.value[idx] = recalcProva({ ...employees.value[idx], ...data })
    notify('Salvato ✓')
    autoSave.trackChange(getStoreSnapshot())
    saveToIndexedDB()
  }

  function deleteEmployee(id) {
    const emp = employees.value.find(e => e.id === id)
    if (!emp) return
    employees.value = employees.value.filter(e => e.id !== id)
    colloqui.value  = colloqui.value.filter(c => c.nome !== emp.nome)
    ferie.value     = ferie.value.filter(f => f.nome !== emp.nome)
    notify('Eliminato')
    saveToIndexedDB()
  }

  function saveColloquio(nome, data) {
    const idx = colloqui.value.findIndex(c => c.nome === nome)
    if (idx !== -1) colloqui.value[idx] = { ...colloqui.value[idx], ...data }
    else colloqui.value.push({ nome, ...data })
    notify('Colloquio salvato ✓')
    saveToIndexedDB()
  }

  function saveFerie(nome, data) {
    const idx = ferie.value.findIndex(f => f.nome === nome)
    if (idx !== -1) {
      ferie.value[idx] = { ...ferie.value[idx], ...data }
    } else {
      ferie.value.push({ nome, ...data })
    }
    notify('Ferie aggiornate ✓')
    saveToIndexedDB()
  }

  function addFerieEntry(nome, entry) {
    const idx = ferie.value.findIndex(f => f.nome === nome)
    if (idx === -1) return
    const rec = ferie.value[idx]
    if (!rec.entries) rec.entries = []
    rec.entries.push({ id: Date.now(), ...entry })
    recalcFerieSummary(rec)
    notify('Registro aggiunto ✓')
    saveToIndexedDB()
  }

  function updateFerieEntry(nome, entryId, data) {
    const rec = ferie.value.find(f => f.nome === nome)
    if (!rec || !rec.entries) return
    const eIdx = rec.entries.findIndex(e => e.id === entryId)
    if (eIdx === -1) return
    rec.entries[eIdx] = { ...rec.entries[eIdx], ...data }
    recalcFerieSummary(rec)
    notify('Registro aggiornato ✓')
    saveToIndexedDB()
  }

  function deleteFerieEntry(nome, entryId) {
    const rec = ferie.value.find(f => f.nome === nome)
    if (!rec || !rec.entries) return
    rec.entries = rec.entries.filter(e => e.id !== entryId)
    recalcFerieSummary(rec)
    notify('Registro eliminato ✓')
    saveToIndexedDB()
  }

  function recalcFerieSummary(rec) {
    if (!rec.entries) return
    const now = new Date()
    const tre = new Date(); tre.setMonth(tre.getMonth() - 3)
    let godute = 0, permGoduti = 0, malGg = 0, malEp = 0, mal3m = 0, assNg = 0
    const malEpSet = new Set()
    rec.entries.forEach(e => {
      const gg = e.giorni || 0
      if (e.tipo === 'ferie' && e.stato === 'approvata') godute += gg
      if (e.tipo === 'permesso' && e.stato === 'approvata') permGoduti += gg
      if (e.tipo === 'malattia') {
        malGg += gg; malEpSet.add(e.dataInizio)
        if (e.dataInizio && new Date(e.dataInizio) >= tre) mal3m += gg
      }
      if (e.tipo === 'assenza_ng') assNg += gg
    })
    malEp = malEpSet.size
    rec.ferieGodute = godute
    rec.ferieResidue = Math.round(((rec.ferieSpettanti || 0) - godute) * 100) / 100
    rec.percGodute = rec.ferieSpettanti > 0 ? Math.round(godute / rec.ferieSpettanti * 100) : 0
    rec.permessiGodutiGg = permGoduti
    rec.permessiResiduiGg = Math.round(((rec.permessiSpettantiGg || 0) - permGoduti) * 100) / 100
    rec.ggMalattia = malGg
    rec.episodiMalattia = malEp
    rec.ggMalattia3m = mal3m
    rec.assenzeNonGiust = assNg
  }

  // Aggiorna tipo contratto ferie per dipendente
  function updateContrattoFerie(nome, tipoContrattoFerie) {
    const rec = ferie.value.find(f => f.nome === nome)
    if (!rec) return
    rec.tipoContrattoFerie = tipoContrattoFerie
    const emp = employees.value.find(e => `${e.nome} ${e.cognome}` === nome)
    const spett = getFerieSpettanti(tipoContrattoFerie, emp?.oreSettimana)
    rec.ferieSpettanti = spett.ferie
    rec.permessiSpettantiGg = spett.permessiGg
    rec.permessiSpettantiOre = spett.permessiOre
    recalcFerieSummary(rec)
    notify('Contratto ferie aggiornato ✓')
    saveToIndexedDB()
  }

  function saveColloquioPC(idOrNome, data) {
    // Trova emp e nome
    let emp = null
    if (typeof idOrNome === 'number') {
      emp = employees.value.find(e => e.id === idOrNome)
    } else {
      emp = employees.value.find(e => e.nome === idOrNome || `${e.nome} ${e.cognome}` === idOrNome)
    }
    if (!emp) return
    const nomeCompleto = `${emp.nome} ${emp.cognome}`
    const idx = colloquiPC.value.findIndex(c => c.employeeId === emp.id || c.nome === nomeCompleto || c.nome === emp.nome)
    
    // Prepare the new entry with timestamp
    const entry = {
      id: Date.now(),
      date: data.date,
      esaur: data.esaur, carico: data.carico, motiv: data.motiv,
      supp: data.supp, equil: data.equil, intent: data.intent,
      esito: data.esito, note: data.note,
      engagementScore: calcEngagementScore(data)
    }

    if (idx !== -1) {
      const rec = colloquiPC.value[idx]
      // Ensure storico array exists
      if (!rec.storico) rec.storico = []
      // Archive current values to storico if they have data
      if (rec.date) {
        rec.storico.push({
          id: rec.storico.length + 1,
          date: rec.date,
          esaur: rec.esaur, carico: rec.carico, motiv: rec.motiv,
          supp: rec.supp, equil: rec.equil, intent: rec.intent,
          esito: rec.esito, note: rec.note,
          engagementScore: rec.engagementScore
        })
      }
      // Update current with new data
      Object.assign(rec, {
        employeeId: emp.id, nome: nomeCompleto, team: emp.team,
        ...entry
      })
    } else {
      colloquiPC.value.push({
        employeeId: emp.id, nome: nomeCompleto, team: emp.team,
        ...entry,
        storico: [],
        nextReviewDate: null
      })
    }
    notify('Colloquio P&C salvato ✓')
    autoSave.trackChange(getStoreSnapshot())
    saveToIndexedDB()
  }

  function deletePCEntry(empId, entryId) {
    const rec = colloquiPC.value.find(c => c.employeeId === empId)
    if (!rec || !rec.storico) return
    rec.storico = rec.storico.filter(e => e.id !== entryId)
    notify('Registro P&C eliminato ✓')
    saveToIndexedDB()
  }

  function calcEngagementScore(data) {
    if (!data.esaur && !data.motiv) return null
    const e = data.esaur || 3, c = data.carico || 3
    const m = data.motiv || 3, s = data.supp || 3
    const eq = data.equil || 3, i = data.intent || 3
    const burnout = (e * 1.5 + c) / 2.5
    const wellbeing = (m + s + eq + i) / 4
    return Math.round((burnout * 0.4 + (6 - wellbeing) * 0.6) * 10) / 10
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
    saveToIndexedDB()
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
    saveToIndexedDB()
  }

  function saveValutazioneManager(employeeId, managerReviewData) {
    const idx = employees.value.findIndex(e => e.id === employeeId)
    if (idx === -1) return
    const emp = employees.value[idx]
    emp.valutazionePeriodoProva = emp.valutazionePeriodoProva || { faseCorrente: 'manager-pending', dataValutazioneManager: null, dataValutazioneHR: null, manager: null, hr: null }
    emp.valutazionePeriodoProva.manager = managerReviewData
    emp.valutazionePeriodoProva.dataValutazioneManager = new Date().toISOString().split('T')[0]
    emp.valutazionePeriodoProva.faseCorrente = 'manager-complete'
    emp.valutazioneMetadata = emp.valutazioneMetadata || { anno: 2026, dataCreazione: null, dataUltimaModifica: null, datiPre2026Eliminati: false }
    emp.valutazioneMetadata.dataUltimaModifica = new Date().toISOString()
    notify('Valutazione Manager salvata ✓')
    autoSave.trackChange(getStoreSnapshot())
    saveToIndexedDB()
  }

  function saveValutazioneHR(employeeId, hrReviewData) {
    const idx = employees.value.findIndex(e => e.id === employeeId)
    if (idx === -1) return
    const emp = employees.value[idx]
    emp.valutazionePeriodoProva = emp.valutazionePeriodoProva || { faseCorrente: 'manager-pending', dataValutazioneManager: null, dataValutazioneHR: null, manager: null, hr: null }
    emp.valutazionePeriodoProva.hr = hrReviewData
    emp.valutazionePeriodoProva.dataValutazioneHR = new Date().toISOString().split('T')[0]
    emp.valutazionePeriodoProva.faseCorrente = 'hr-complete'
    emp.valutazioneMetadata = emp.valutazioneMetadata || { anno: 2026, dataCreazione: null, dataUltimaModifica: null, datiPre2026Eliminati: false }
    emp.valutazioneMetadata.dataUltimaModifica = new Date().toISOString()
    notify('Valutazione HR salvata ✓')
    autoSave.trackChange(getStoreSnapshot())
    saveToIndexedDB()
  }

  function updateContractRenewal(employeeId, renewalData) {
    const idx = employees.value.findIndex(e => e.id === employeeId)
    if (idx === -1) return
    const emp = employees.value[idx]
    Object.assign(emp, renewalData)
    notify('Scadenza contratto aggiornata ✓')
    autoSave.trackChange(getStoreSnapshot())
    saveToIndexedDB()
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

  // ── Ferie Analytics ──
  const ferieAnalytics = computed(() => {
    const byTeam = {}
    ferie.value.forEach(f => {
      const t = f.team || '—'
      if (!byTeam[t]) byTeam[t] = { team: t, n: 0, spettanti: 0, godute: 0, residue: 0, malattia: 0, mal3m: 0, assenze: 0, episodi: 0 }
      const m = byTeam[t]; m.n++
      m.spettanti += f.ferieSpettanti || 0; m.godute += f.ferieGodute || 0
      m.residue += f.ferieResidue || 0; m.malattia += f.ggMalattia || 0
      m.mal3m += f.ggMalattia3m || 0; m.assenze += f.assenzeNonGiust || 0
      m.episodi += f.episodiMalattia || 0
    })
    const teamArr = Object.values(byTeam).map(t => ({
      ...t,
      percGodute: t.spettanti > 0 ? Math.round(t.godute / t.spettanti * 100) : 0,
      avgMal: t.n > 0 ? Math.round(t.malattia / t.n * 10) / 10 : 0
    })).sort((a, b) => b.n - a.n)
    const totals = ferie.value.reduce((acc, f) => {
      acc.spettanti += f.ferieSpettanti || 0; acc.godute += f.ferieGodute || 0
      acc.residue += f.ferieResidue || 0; acc.malattia += f.ggMalattia || 0
      acc.mal3m += f.ggMalattia3m || 0; acc.assenze += f.assenzeNonGiust || 0
      acc.episodi += f.episodiMalattia || 0
      return acc
    }, { spettanti: 0, godute: 0, residue: 0, malattia: 0, mal3m: 0, assenze: 0, episodi: 0 })
    totals.percGodute = totals.spettanti > 0 ? Math.round(totals.godute / totals.spettanti * 100) : 0
    totals.n = ferie.value.length
    // Top assenteismo (most sick days)
    const topMalattia = [...ferie.value].sort((a, b) => (b.ggMalattia || 0) - (a.ggMalattia || 0)).slice(0, 5)
    // Most residual ferie (risk of accumulation)
    const topResidue = [...ferie.value].sort((a, b) => (b.ferieResidue || 0) - (a.ferieResidue || 0)).slice(0, 5)
    return { byTeam: teamArr, totals, topMalattia, topResidue }
  })
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

  // P&C Colloquio Status per employee
  const pcColloquiStatus = computed(() => {
    const map = {}
    employees.value.forEach(e => {
      if (e.stato !== 'Attivo') {
        map[e.id] = { status: 'N/A', lastDate: null, daysSinceColloquio: null, nextReviewDate: null }
        return
      }

      const coll = colloquiPCMap.value[e.nome]
      const lastDate = coll?.date ? new Date(coll.date) : null
      const today = new Date()
      const daysSinceColloquio = lastDate ? Math.floor((today - lastDate) / 86400000) : null

      let status = 'Non Fatto'
      if (coll?.date && daysSinceColloquio <= 180) {
        status = 'Aggiornato'
      } else if (coll?.date && daysSinceColloquio > 180) {
        status = 'Scaduto'
      }

      map[e.id] = {
        status,
        lastDate,
        daysSinceColloquio,
        nextReviewDate: coll?.nextReviewDate
      }
    })
    return map
  })

  // Enhanced P&C Coverage KPI
  const kpiPCCopertura = computed(() => {
    let pcAggiornati = 0, pcScaduti = 0, pcNonFatti = 0
    const attivi = enrichedEmployees.value.length
    enrichedEmployees.value.forEach(e => {
      const pc = pcColloquiStatus.value[e.id]
      if (pc.status === 'Aggiornato') pcAggiornati++
      else if (pc.status === 'Scaduto') pcScaduti++
      else pcNonFatti++
    })
    return {
      pcAggiornati,
      pcScaduti,
      pcNonFatti,
      totaleAttivi: attivi,
      percentualeCopertura: attivi > 0 ? Math.round((pcAggiornati / attivi) * 100) : 0
    }
  })

  const urgentiAlert = computed(() => {
    const today = new Date()
    const alerts = []

    // FU1 scaduti (CRITICA - red)
    enrichedEmployees.value.forEach(e => {
      if (e.fu1Scaduto && e.stato === 'Attivo') {
        alerts.push({
          id: e.id,
          tipo: 'FU1_SCADUTO',
          nome: e.nome,
          team: e.team,
          scadenza: e.scadenzaFU1,
          urgenza: 'CRITICA',
          color: 'red',
          giorni: Math.floor((new Date(e.scadenzaFU1) - today) / 86400000)
        })
      }
    })

    // FU2 Manager scaduti (ALTA - orange)
    enrichedEmployees.value.forEach(e => {
      if (e.scadenzaFU2Manager && e.stato === 'Attivo') {
        const scadDate = new Date(e.scadenzaFU2Manager)
        const daysUntil = Math.floor((scadDate - today) / 86400000)
        if (daysUntil <= 0) {
          // Already passed
          alerts.push({
            id: e.id,
            tipo: 'FU2_MANAGER_SCADUTO',
            nome: e.nome,
            team: e.team,
            scadenza: e.scadenzaFU2Manager,
            urgenza: 'CRITICA',
            color: 'red',
            giorni: daysUntil
          })
        } else if (daysUntil <= 7) {
          // Within 7 days
          alerts.push({
            id: e.id,
            tipo: 'FU2_MANAGER_URGENTE',
            nome: e.nome,
            team: e.team,
            scadenza: e.scadenzaFU2Manager,
            urgenza: 'ALTA',
            color: 'orange',
            giorni: daysUntil
          })
        } else if (daysUntil <= 30) {
          // Within 30 days
          alerts.push({
            id: e.id,
            tipo: 'FU2_MANAGER_MEDIA',
            nome: e.nome,
            team: e.team,
            scadenza: e.scadenzaFU2Manager,
            urgenza: 'MEDIA',
            color: 'yellow',
            giorni: daysUntil
          })
        }
      }
    })

    // P&C colloqui scaduti (ALTA - orange)
    nextPC.value.forEach(e => {
      alerts.push({
        id: e.id,
        tipo: 'PC_SCADUTO',
        nome: e.nome,
        team: e.team,
        scadenza: e.lastDate,
        urgenza: e.urgenza === 'Scaduto' ? 'ALTA' : 'MEDIA',
        color: e.urgenza === 'Scaduto' ? 'orange' : 'yellow',
        giorni: e.daysAgo
      })
    })

    // Sort by urgency (CRITICA first, then ALTA, then MEDIA, then BASSA) and days until deadline
    return alerts.sort((a, b) => {
      const urgencyOrder = { CRITICA: 0, ALTA: 1, MEDIA: 2, BASSA: 3 }
      if (urgencyOrder[a.urgenza] !== urgencyOrder[b.urgenza]) {
        return urgencyOrder[a.urgenza] - urgencyOrder[b.urgenza]
      }
      return (a.giorni ?? 999) - (b.giorni ?? 999)
    })
  })

  // Computed per onboarding urgencies (FU1, FU2Manager, FU2Dip)
  const onboardingUrgenze = computed(() => {
    const today = new Date()
    const cutoffDate = new Date('2026-01-01') // Start of 2026 - exclude FU before this
    const items = []

    enrichedEmployees.value.forEach(e => {
      if (e.stato !== 'Attivo') return

      // FU1 scaduti o urgenti (only if scadenza >= 2026-01-01)
      if (e.scadenzaFU1) {
        const fu1Date = new Date(e.scadenzaFU1)
        if (fu1Date < cutoffDate) return // Skip FU before 2026
        const daysUntil = Math.floor((fu1Date - today) / 86400000)
        if (daysUntil <= 0 && e.statoFU1 !== 'Fatto') {
          items.push({ id: e.id, tipo: 'FU1', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaFU1, urgenza: 'CRITICA', color: 'red', giorni: daysUntil, stato: e.statoFU1 })
        } else if (daysUntil >= 0 && daysUntil <= 7 && e.statoFU1 !== 'Fatto') {
          items.push({ id: e.id, tipo: 'FU1', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaFU1, urgenza: 'ALTA', color: 'orange', giorni: daysUntil, stato: e.statoFU1 })
        } else if (daysUntil >= 8 && daysUntil <= 30 && e.statoFU1 !== 'Fatto') {
          items.push({ id: e.id, tipo: 'FU1', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaFU1, urgenza: 'MEDIA', color: 'yellow', giorni: daysUntil, stato: e.statoFU1 })
        }
      }

      // FU2Manager scaduti o urgenti (only if scadenza >= 2026-01-01)
      if (e.scadenzaFU2Manager) {
        const fu2mDate = new Date(e.scadenzaFU2Manager)
        if (fu2mDate < cutoffDate) return // Skip FU before 2026
        const daysUntil = Math.floor((fu2mDate - today) / 86400000)
        if (daysUntil <= 0 && e.statoFU2Manager !== 'Fatto') {
          items.push({ id: e.id, tipo: 'FU2_MANAGER', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaFU2Manager, urgenza: 'CRITICA', color: 'red', giorni: daysUntil, stato: e.statoFU2Manager })
        } else if (daysUntil >= 0 && daysUntil <= 7 && e.statoFU2Manager !== 'Fatto') {
          items.push({ id: e.id, tipo: 'FU2_MANAGER', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaFU2Manager, urgenza: 'ALTA', color: 'orange', giorni: daysUntil, stato: e.statoFU2Manager })
        } else if (daysUntil >= 8 && daysUntil <= 30 && e.statoFU2Manager !== 'Fatto') {
          items.push({ id: e.id, tipo: 'FU2_MANAGER', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaFU2Manager, urgenza: 'MEDIA', color: 'yellow', giorni: daysUntil, stato: e.statoFU2Manager })
        }
      }

      // FU2 Dipendente scaduti o urgenti (only if scadenza >= 2026-01-01)
      if (e.scadenzaFU2) {
        const fu2Date = new Date(e.scadenzaFU2)
        if (fu2Date < cutoffDate) return // Skip FU before 2026
        const daysUntil = Math.floor((fu2Date - today) / 86400000)
        if (daysUntil <= 0 && e.statoFU2Dip !== 'Fatto') {
          items.push({ id: e.id, tipo: 'FU2_DIP', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaFU2, urgenza: 'CRITICA', color: 'red', giorni: daysUntil, stato: e.statoFU2Dip })
        } else if (daysUntil >= 0 && daysUntil <= 7 && e.statoFU2Dip !== 'Fatto') {
          items.push({ id: e.id, tipo: 'FU2_DIP', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaFU2, urgenza: 'ALTA', color: 'orange', giorni: daysUntil, stato: e.statoFU2Dip })
        } else if (daysUntil >= 8 && daysUntil <= 30 && e.statoFU2Dip !== 'Fatto') {
          items.push({ id: e.id, tipo: 'FU2_DIP', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaFU2, urgenza: 'MEDIA', color: 'yellow', giorni: daysUntil, stato: e.statoFU2Dip })
        }
      }

      // Employee Review Manager (if trial period, no review yet)
      if (e.inProva && (!e.valutazionePeriodoProva || !e.valutazionePeriodoProva.manager) && e.daysToProva && e.daysToProva <= 45 && e.daysToProva >= 0) {
        items.push({ id: e.id, tipo: 'REVIEW_MANAGER', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.fineProva, urgenza: e.daysToProva <= 7 ? 'ALTA' : 'MEDIA', color: e.daysToProva <= 7 ? 'orange' : 'yellow', giorni: e.daysToProva, stato: 'Da Fare' })
      }
    })

    return items.sort((a, b) => {
      const urgencyOrder = { CRITICA: 0, ALTA: 1, MEDIA: 2, BASSA: 3 }
      if (urgencyOrder[a.urgenza] !== urgencyOrder[b.urgenza]) {
        return urgencyOrder[a.urgenza] - urgencyOrder[b.urgenza]
      }
      return (a.giorni ?? 999) - (b.giorni ?? 999)
    })
  })

  // Computed per contract renewal urgencies (determinati)
  const contractUrgenze = computed(() => {
    const today = new Date()
    const cutoffDate = new Date('2026-01-01') // Start of 2026 - exclude contracts before this
    const items = []

    enrichedEmployees.value.forEach(e => {
      if (e.stato !== 'Attivo' || e.tipoContratto !== 'determinato') return

      // Rinnovo contratto scaditure (only if scadenza >= 2026-01-01)
      if (e.scadenzaRinnovo) {
        const rinnDate = new Date(e.scadenzaRinnovo)
        if (rinnDate < cutoffDate) return // Skip contracts before 2026
        const daysUntil = Math.floor((rinnDate - today) / 86400000)
        if (daysUntil <= 0 && e.statoRinnovo !== 'Fatto') {
          items.push({ id: e.id, tipo: 'RINNOVO', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaRinnovo, urgenza: 'CRITICA', color: 'red', giorni: daysUntil, stato: e.statoRinnovo })
        } else if (daysUntil >= 0 && daysUntil <= 30 && e.statoRinnovo !== 'Fatto') {
          items.push({ id: e.id, tipo: 'RINNOVO', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaRinnovo, urgenza: daysUntil <= 7 ? 'ALTA' : 'MEDIA', color: daysUntil <= 7 ? 'orange' : 'yellow', giorni: daysUntil, stato: e.statoRinnovo })
        }
      }

      // Dossier contratto scaditure (only if scadenza >= 2026-01-01)
      if (e.scadenzaDossierContratto) {
        const dosDate = new Date(e.scadenzaDossierContratto)
        if (dosDate < cutoffDate) return // Skip contracts before 2026
        const daysUntil = Math.floor((dosDate - today) / 86400000)
        if (daysUntil <= 0 && e.statoDossierContratto !== 'Fatto') {
          items.push({ id: e.id, tipo: 'DOSSIER', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaDossierContratto, urgenza: 'CRITICA', color: 'red', giorni: daysUntil, stato: e.statoDossierContratto })
        } else if (daysUntil >= 0 && daysUntil <= 30 && e.statoDossierContratto !== 'Fatto') {
          items.push({ id: e.id, tipo: 'DOSSIER', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: e.scadenzaDossierContratto, urgenza: daysUntil <= 7 ? 'ALTA' : 'MEDIA', color: daysUntil <= 7 ? 'orange' : 'yellow', giorni: daysUntil, stato: e.statoDossierContratto })
        }
      }

      // P&C colloqui scaduti o non ancora fatti (almeno 2 l'anno)
      const pcStatus = pcColloquiStatus.value[e.id]
      if (pcStatus && pcStatus.status === 'Scaduto') {
        items.push({ id: e.id, tipo: 'PC_SCADUTO', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: pcStatus.lastDate, urgenza: 'MEDIA', color: 'yellow', giorni: pcStatus.daysSinceColloquio, stato: 'Scaduto' })
      } else if (pcStatus && pcStatus.status === 'Non Fatto') {
        items.push({ id: e.id, tipo: 'PC_NON_FATTO', nome: e.nome, cognome: e.cognome, team: e.team, scadenza: null, urgenza: 'BASSA', color: 'gray', giorni: null, stato: 'Non Fatto' })
      }
    })

    return items.sort((a, b) => {
      const urgencyOrder = { CRITICA: 0, ALTA: 1, MEDIA: 2, BASSA: 3 }
      if (urgencyOrder[a.urgenza] !== urgencyOrder[b.urgenza]) {
        return urgencyOrder[a.urgenza] - urgencyOrder[b.urgenza]
      }
      return (a.giorni ?? 999) - (b.giorni ?? 999)
    })
  })

  // Merged list of all urgencies for Kanban
  const allUrgenze = computed(() => {
    const merged = [...onboardingUrgenze.value, ...contractUrgenze.value]
    return merged.sort((a, b) => {
      const urgencyOrder = { CRITICA: 0, ALTA: 1, MEDIA: 2, BASSA: 3 }
      if (urgencyOrder[a.urgenza] !== urgencyOrder[b.urgenza]) {
        return urgencyOrder[a.urgenza] - urgencyOrder[b.urgenza]
      }
      return (a.giorni ?? 999) - (b.giorni ?? 999)
    })
  })

  // KPI for onboarding
  const kpiOnboarding = computed(() => {
    let inCorso = 0, fu1Scaduti = 0, fu1Entro7 = 0, fu2ManagerScaduti = 0, provaScadenza = 0
    onboardingUrgenze.value.forEach(item => {
      if (item.tipo === 'FU1' && item.urgenza === 'CRITICA') fu1Scaduti++
      else if (item.tipo === 'FU1' && item.urgenza === 'ALTA') fu1Entro7++
      else if (item.tipo === 'FU2_MANAGER' && (item.urgenza === 'CRITICA' || item.urgenza === 'ALTA')) fu2ManagerScaduti++
      else if (item.tipo === 'REVIEW_MANAGER') provaScadenza++
    })
    enrichedEmployees.value.forEach(e => {
      if (e.inProva) inCorso++
    })
    return { inCorso, fu1Scaduti, fu1Entro7, fu2ManagerScaduti, provaScadenza }
  })

  // KPI for contracts
  const kpiContratti = computed(() => {
    let rinnoveScadute = 0, rinnoveEntro30 = 0, dossieriScaduti = 0, determinatiInScadenza = 0
    contractUrgenze.value.forEach(item => {
      if (item.tipo === 'RINNOVO') {
        if (item.urgenza === 'CRITICA') rinnoveScadute++
        else if (item.urgenza === 'MEDIA' || item.urgenza === 'ALTA') rinnoveEntro30++
      } else if (item.tipo === 'DOSSIER') {
        if (item.urgenza === 'CRITICA') dossieriScaduti++
      }
    })
    enrichedEmployees.value.forEach(e => {
      if (e.stato === 'Attivo' && e.tipoContratto === 'determinato') determinatiInScadenza++
    })
    return { rinnoveScadute, rinnoveEntro30, dossieriScaduti, determinatiInScadenza }
  })

  function notify(msg, type = 'success') {
    toast.value = { show: true, msg, type }
    setTimeout(() => toast.value.show = false, 3200)
  }

  // Helper: Create snapshot of current store data for persistence
  function getStoreSnapshot() {
    return {
      employees: employees.value,
      colloqui: colloqui.value,
      ferie: ferie.value,
      colloquiPC: colloquiPC.value,
      dimissioni: dimissioni.value,
      valutazioni360: valutazioni360.value,
      allUrgenze: allUrgenze.value,
      timestamp: Date.now()
    }
  }

  return {
    toast, employees, colloqui, ferie, colloquiPC, dimissioni,
    teams, enrichedEmployees, teamStats, kpiScadenze, colloquiMap, ferieMap, colloquiPCMap, dimissioniMap,
    burnoutRetentionQuadrants, pcStats, nextPC, kpiPC, kpiPCCopertura, pcColloquiStatus, urgentiAlert,
    onboardingUrgenze, contractUrgenze, allUrgenze, kpiOnboarding, kpiContratti,
    ferieAnalytics, ensureFerieForAll, getSocieta, getFerieSpettanti, updateContrattoFerie,
    FERIE_CONTRATTO_PROPRIO, FERIE_CCNL_COMMERCIO, PERMESSI_TOTALI_GG, PERMESSI_TOTALI_ORE,
    addEmployee, updateEmployee, deleteEmployee,
    saveColloquio, saveFerie, addFerieEntry, updateFerieEntry, deleteFerieEntry,
    saveColloquioPC, deletePCEntry, calcEngagementScore,
    saveDimissione, scheduleNextPC,
    saveValutazioneManager, saveValutazioneHR, updateContractRenewal,
    saveFile, notify
  }
})
