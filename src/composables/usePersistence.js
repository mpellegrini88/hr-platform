import { useHrStore } from '@/stores/hrStore.js'

/**
 * usePersistence composable
 * Manages localStorage persistence for MOVE HR Platform
 * - Saves/loads data from localStorage with versioning
 * - Handles quota exceeded errors
 * - Supports export/import JSON backups
 * - Cross-tab sync via 'storage' event
 */

const PREFIX = 'move-hr/'
const VERSION = '2.0'
const KEYS = {
  version: 'version',
  lastSync: 'lastSync',
  metadata: 'metadata',
  employees: 'employees',
  colloqui: 'colloqui',
  ferie: 'ferie',
  colloquiPC: 'colloquiPC',
  dimissioni: 'dimissioni',
  valutazioni360: 'valutazioni360'
}

export function usePersistence() {
  /**
   * Save data to localStorage
   * @param {string} key - Data key (e.g., 'employees')
   * @param {*} data - Data to save
   * @returns {boolean} Success status
   */
  function save(key, data) {
    try {
      const serialized = JSON.stringify(data)
      localStorage.setItem(PREFIX + key, serialized)
      localStorage.setItem(PREFIX + KEYS.lastSync, new Date().toISOString())
      return true
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Attempting cleanup...')
        // Try to clear older backup data if exists
        try {
          localStorage.removeItem(PREFIX + 'backup-old')
          localStorage.setItem(PREFIX + key, JSON.stringify(data))
          console.warn('Quota freed by removing old backup. Retry save succeeded.')
          return true
        } catch (e2) {
          console.error('Failed to save even after cleanup:', e2)
          return false
        }
      } else {
        console.error('Error saving to localStorage:', e)
        return false
      }
    }
  }

  /**
   * Load data from localStorage
   * @param {string} key - Data key
   * @param {*} defaultValue - Default value if not found or corrupted
   * @returns {*} Loaded data or default value
   */
  function load(key, defaultValue = null) {
    try {
      const stored = localStorage.getItem(PREFIX + key)
      if (!stored) return defaultValue
      return JSON.parse(stored)
    } catch (e) {
      console.error(`Error deserializing ${key}, using default:`, e)
      return defaultValue
    }
  }

  /**
   * Delete a key from localStorage
   * @param {string} key - Data key
   */
  function remove(key) {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch (e) {
      console.error('Error removing from localStorage:', e)
    }
  }

  /**
   * Clear all MOVE HR data from localStorage
   */
  function clearAll() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k))
      console.log('All MOVE HR data cleared from localStorage')
    } catch (e) {
      console.error('Error clearing localStorage:', e)
    }
  }

  /**
   * Export all data as JSON
   * @returns {string} JSON stringified backup
   */
  function exportJSON() {
    const data = {
      version: VERSION,
      timestamp: new Date().toISOString(),
      employees: load(KEYS.employees, []),
      colloqui: load(KEYS.colloqui, []),
      ferie: load(KEYS.ferie, []),
      colloquiPC: load(KEYS.colloquiPC, []),
      dimissioni: load(KEYS.dimissioni, []),
      valutazioni360: load(KEYS.valutazioni360, [])
    }
    return JSON.stringify(data, null, 2)
  }

  /**
   * Import data from JSON backup
   * @param {string} jsonData - Stringified JSON backup
   * @returns {boolean} Success status
   */
  function importJSON(jsonData) {
    try {
      const data = JSON.parse(jsonData)

      if (data.version !== VERSION) {
        console.warn(`Different schema version: ${data.version} vs ${VERSION}. Migration might be needed.`)
      }

      // Save each data type
      save(KEYS.employees, data.employees || [])
      save(KEYS.colloqui, data.colloqui || [])
      save(KEYS.ferie, data.ferie || [])
      save(KEYS.colloquiPC, data.colloquiPC || [])
      save(KEYS.dimissioni, data.dimissioni || [])
      save(KEYS.valutazioni360, data.valutazioni360 || [])

      // Mark import timestamp
      save(KEYS.metadata, {
        dataReset: new Date().toISOString(),
        importedFrom: data.timestamp
      })

      console.log('✅ Data imported successfully from JSON backup')
      return true
    } catch (e) {
      console.error('Error importing JSON:', e)
      return false
    }
  }

  /**
   * Get storage usage info
   * @returns {object} Storage info (version, lastSync, size estimate)
   */
  function getStorageInfo() {
    let totalSize = 0
    let keyCount = 0

    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => {
        totalSize += localStorage.getItem(k).length
        keyCount++
      })

    return {
      version: load(KEYS.version, VERSION),
      lastSync: load(KEYS.lastSync, 'Never'),
      estimatedSizeKB: (totalSize / 1024).toFixed(2),
      keyCount,
      available: keyCount > 0
    }
  }

  /**
   * Initialize storage (set version)
   */
  function initialize() {
    if (!load(KEYS.version)) {
      save(KEYS.version, VERSION)
    }
  }

  // Initialize on module load
  initialize()

  return {
    save,
    load,
    remove,
    clearAll,
    exportJSON,
    importJSON,
    getStorageInfo,
    initialize,
    PREFIX,
    VERSION,
    KEYS
  }
}

/**
 * useLocalStorageSync composable
 * Handles cross-tab synchronization via 'storage' event
 * Call this in App.vue onMounted()
 */
export function useLocalStorageSync() {
  function onStorageChange(e) {
    if (!e.key || !e.key.startsWith(PREFIX)) return

    // Re-load data from updated localStorage
    const store = useHrStore()
    const key = e.key.replace(PREFIX, '')

    try {
      const newValue = JSON.parse(e.newValue || 'null')

      // Update store state based on which key changed
      switch (key) {
        case 'employees':
          store.employees = newValue || []
          break
        case 'colloqui':
          store.colloqui = newValue || []
          break
        case 'ferie':
          store.ferie = newValue || []
          break
        case 'colloquiPC':
          store.colloquiPC = newValue || []
          break
        case 'dimissioni':
          store.dimissioni = newValue || []
          break
        case 'valutazioni360':
          store.valutazioni360 = newValue || []
          break
      }

      console.log(`📡 Synchronized from other tab:`, key)
    } catch (err) {
      console.error(`Error syncing ${key}:`, err)
    }
  }

  function setup() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorageChange)
    }
  }

  function teardown() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorageChange)
    }
  }

  return {
    setup,
    teardown,
    onStorageChange
  }
}
