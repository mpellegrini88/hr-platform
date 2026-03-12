/**
 * useBackendAPI composable
 * Client API per il backend locale Express (server/server.js)
 *
 * Architettura:
 * - Oggi: Express + JSON file (server locale)
 * - Domani: swap con SQLite, PostgreSQL, o API cloud
 *   → basta cambiare API_BASE, l'interfaccia resta la stessa
 */

const API_BASE = 'http://localhost:3001/api'

export function useBackendAPI() {
  /**
   * Verifica se il backend è online
   * @returns {Promise<boolean>}
   */
  async function checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) })
      return res.ok
    } catch {
      return false
    }
  }

  /**
   * Carica tutti i dati dal backend
   * @returns {Promise<Object>} { employees, colloqui, ferie, colloquiPC, dimissioni, valutazioni360 }
   */
  async function loadAll() {
    const res = await fetch(`${API_BASE}/data`)
    if (!res.ok) throw new Error('Errore caricamento dati dal backend')
    return res.json()
  }

  /**
   * Salva tutti i dati nel backend (bulk save)
   * @param {Object} data - Snapshot completo dello store
   * @returns {Promise<Object>} { ok, timestamp }
   */
  async function saveAll(data) {
    const res = await fetch(`${API_BASE}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Errore salvataggio dati nel backend')
    return res.json()
  }

  /**
   * Crea un backup manuale
   * @returns {Promise<Object>} { ok, filename }
   */
  async function createBackup() {
    const res = await fetch(`${API_BASE}/backup`, { method: 'POST' })
    if (!res.ok) throw new Error('Errore creazione backup')
    return res.json()
  }

  /**
   * Lista backup disponibili
   * @returns {Promise<Array>} [{ name, sizeKB, date }]
   */
  async function listBackups() {
    const res = await fetch(`${API_BASE}/backups`)
    if (!res.ok) throw new Error('Errore lista backup')
    return res.json()
  }

  /**
   * Ripristina un backup specifico
   * @param {string} filename - Nome del file di backup
   * @returns {Promise<Object>} { ok }
   */
  async function restoreBackup(filename) {
    const res = await fetch(`${API_BASE}/restore/${filename}`, { method: 'POST' })
    if (!res.ok) throw new Error('Errore ripristino backup')
    return res.json()
  }

  return {
    checkHealth,
    loadAll,
    saveAll,
    createBackup,
    listBackups,
    restoreBackup
  }
}
