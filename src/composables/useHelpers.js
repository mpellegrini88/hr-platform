export function useHelpers() {
  function fmtDate(v) {
    if (!v) return '—'
    const d = typeof v === 'string' ? new Date(v) : v
    return isNaN(d) ? '—' : d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  function fmtDateShort(v) {
    if (!v) return '—'
    const d = new Date(v)
    return isNaN(d) ? '—' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  function toInput(v) {
    if (!v) return ''
    const d = new Date(v)
    return isNaN(d) ? '' : d.toISOString().split('T')[0]
  }
  function monthsAgo(v) {
    if (!v) return null
    const d = new Date(v), now = new Date()
    return Math.floor((now - d) / (1000 * 60 * 60 * 24 * 30.44))
  }
  function daysDiff(a, b) {
    if (!a || !b) return null
    return Math.round((new Date(b) - new Date(a)) / 86400000)
  }
  function statoClass(stato) {
    const map = { 'Attivo': 'badge-green', 'Dimissioni Volontarie': 'badge-red', 'Mancato Superamento Prova': 'badge-orange', 'In Uscita Concordata': 'badge-yellow', 'Licenziato': 'badge-red' }
    return map[stato] || 'badge-gray'
  }
  function burnoutClass(risk) {
    return risk === 'alto' ? 'text-red-600' : risk === 'medio' ? 'text-amber-600' : 'text-emerald-600'
  }
  function burnoutBadge(risk) {
    return risk === 'alto' ? 'badge-red' : risk === 'medio' ? 'badge-yellow' : 'badge-green'
  }
  function scoreColor(score, inverted = false) {
    if (score == null) return '#9ca3af'
    if (inverted) {
      if (score <= 2) return '#10b981'
      if (score <= 3) return '#f59e0b'
      return '#ef4444'
    }
    if (score >= 4) return '#10b981'
    if (score >= 3) return '#f59e0b'
    return '#ef4444'
  }
  function esitoCollClass(esito) {
    const map = { 'Positivo': 'badge-green', 'Da Monitorare': 'badge-yellow', 'Critico': 'badge-red', 'Urgente': 'badge-red' }
    return map[esito] || 'badge-gray'
  }
  function contractBadge(tipo) {
    const map = { 'indeterminato': 'badge-green', 'determinato': 'badge-blue', 'full-time': 'badge-indigo', 'part-time': 'badge-purple', 'apprendistato': 'badge-orange', 'stage': 'badge-gray', 'consulenza': 'badge-gray' }
    return map[tipo] || 'badge-gray'
  }
  return { fmtDate, fmtDateShort, toInput, monthsAgo, daysDiff, statoClass, burnoutClass, burnoutBadge, scoreColor, esitoCollClass, contractBadge }
}
