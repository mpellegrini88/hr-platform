/**
 * CCNL Commercio (Confcommercio) rinnovo 22/03/2024 – Art.121
 * Calcolo automatico periodo di prova
 *
 * Q/I liv → 6 mesi calendario (EDATE)
 * II–V liv → 60 gg lavoro effettivo (WORKDAY)
 * VI–VII liv → 45 gg lavoro effettivo (WORKDAY)
 * Determinato → proporzionale D.Lgs 104/2022 (1gg/15gg cal, min 2gg)
 */

function addWorkdays(startDate, days) {
  let d = new Date(startDate)
  let count = 0
  while (count < days) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) count++
  }
  return d
}

function addMonths(date, months) {
  const d = new Date(date)
  const day = d.getDate()
  d.setMonth(d.getMonth() + months)
  // Handle end-of-month overflow
  if (d.getDate() < day) d.setDate(0)
  return d
}

export function calcProvatione(livello, tipoContratto, dataAssunzione, scadenzaContratto) {
  if (!livello || !dataAssunzione) return { durata: null, metodo: null, fineProva: null }

  const hire = new Date(dataAssunzione)
  let durata = null, metodo = null, fineProva = null

  if (tipoContratto === 'determinato' && scadenzaContratto) {
    // Proporzionale D.Lgs 104/2022: 1gg per ogni 15gg cal, min 2gg
    const scad = new Date(scadenzaContratto)
    const totalDays = Math.round((scad - hire) / 86400000)
    const probaDays = Math.max(2, Math.floor(totalDays / 15))
    durata = `${probaDays} gg (prop. D.Lgs 104/2022)`
    metodo = 'Giorni calendario'
    fineProva = new Date(hire)
    fineProva.setDate(fineProva.getDate() + probaDays)
    fineProva = fineProva.toISOString().split('T')[0]
  } else if (livello === 'Q/I Quadro' || livello === 'I livello') {
    // 6 mesi calendario
    durata = '6 mesi'
    metodo = 'Giorni calendario'
    fineProva = addMonths(hire, 6).toISOString().split('T')[0]
  } else if (['II livello', 'III livello', 'IV livello', 'V livello'].includes(livello)) {
    // 60 gg lavoro effettivo
    durata = '60 gg lav. eff.'
    metodo = 'Lavoro effettivo'
    fineProva = addWorkdays(hire, 60).toISOString().split('T')[0]
  } else if (['VI livello', 'VII livello'].includes(livello)) {
    // 45 gg lavoro effettivo
    durata = '45 gg lav. eff.'
    metodo = 'Lavoro effettivo'
    fineProva = addWorkdays(hire, 45).toISOString().split('T')[0]
  }

  return { durata, metodo, fineProva }
}

export function provaStatus(fineProva, esitoProva) {
  if (!fineProva) return { label: '—', color: 'gray', icon: '○' }
  const fp = new Date(fineProva)
  const today = new Date()
  const days = Math.round((fp - today) / 86400000)
  if (esitoProva === 'Superato') return { label: 'Superato', color: 'green', icon: '✓' }
  if (esitoProva === 'Non Superato') return { label: 'Non superato', color: 'red', icon: '✗' }
  if (fp < today) return { label: 'Scaduto – nessun esito', color: 'orange', icon: '!' }
  if (days <= 7) return { label: `${days}gg alla scadenza`, color: 'red', icon: '⚠' }
  if (days <= 30) return { label: `${days}gg alla scadenza`, color: 'amber', icon: '⚠' }
  return { label: `In corso (${days}gg)`, color: 'blue', icon: '●' }
}

export const LIVELLI_CCNL = [
  'Q/I Quadro', 'I livello', 'II livello', 'III livello',
  'IV livello', 'V livello', 'VI livello', 'VII livello'
]

export const TIPI_CONTRATTO = [
  { value: 'indeterminato', label: 'Indeterminato' },
  { value: 'determinato',   label: 'Determinato' },
  { value: 'full-time',     label: 'Full-time' },
  { value: 'part-time',     label: 'Part-time' },
  { value: 'apprendistato', label: 'Apprendistato' },
  { value: 'stage',         label: 'Stage / Tirocinio' },
  { value: 'consulenza',    label: 'Consulenza / P.IVA' },
]
