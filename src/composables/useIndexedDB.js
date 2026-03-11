/**
 * useIndexedDB composable
 * Manages IndexedDB persistence for MOVE HR Platform
 * - Persistent browser storage (survives session end, unlike localStorage)
 * - No data loss on browser close
 * - Supports complex JavaScript objects natively
 * - Async transactions for non-blocking operations
 */

const DB_NAME = 'move-hr-db'
const DB_VERSION = 1
const STORES = ['employees', 'colloqui', 'ferie', 'colloquiPC', 'dimissioni', 'valutazioni360']

export function useIndexedDB() {
  /**
   * Open/initialize IndexedDB database
   * Creates object stores if they don't exist
   * @returns {Promise<IDBDatabase>} Database instance
   */
  async function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('❌ IndexedDB open error:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        console.log('✅ IndexedDB opened:', DB_NAME)
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        console.log('🔧 Creating object stores in IndexedDB...')

        STORES.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' })
            console.log(`  ✓ Created store: ${storeName}`)
          }
        })
      }
    })
  }

  /**
   * Save batch of records to a specific object store
   * Clears existing data first (full sync)
   * @param {IDBDatabase} db - Database instance
   * @param {string} storeName - Object store name
   * @param {Array} records - Array of records to save
   * @returns {Promise<void>}
   */
  async function saveBatch(db, storeName, records) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)

      // Clear all existing records in this store
      const clearRequest = store.clear()

      clearRequest.onsuccess = () => {
        // Insert all new records
        if (records && Array.isArray(records)) {
          records.forEach(record => {
            try {
              store.put(record)
            } catch (err) {
              console.error(`Error putting record in ${storeName}:`, err)
            }
          })
        }
      }

      transaction.oncomplete = () => {
        console.log(`✓ Saved ${records?.length || 0} records to ${storeName}`)
        resolve()
      }

      transaction.onerror = () => {
        console.error(`Error in transaction for ${storeName}:`, transaction.error)
        reject(transaction.error)
      }
    })
  }

  /**
   * Save all collections to IndexedDB
   * Called after any data modification
   * @param {Object} data - Object containing all collections
   * @returns {Promise<void>}
   */
  async function saveAll(data) {
    try {
      const db = await initDB()

      // Save each collection
      await saveBatch(db, 'employees', data.employees || [])
      await saveBatch(db, 'colloqui', data.colloqui || [])
      await saveBatch(db, 'ferie', data.ferie || [])
      await saveBatch(db, 'colloquiPC', data.colloquiPC || [])
      await saveBatch(db, 'dimissioni', data.dimissioni || [])
      await saveBatch(db, 'valutazioni360', data.valutazioni360 || [])

      console.log('✅ All data saved to IndexedDB')
      return true
    } catch (err) {
      console.error('❌ Error saving to IndexedDB:', err)
      return false
    }
  }

  /**
   * Load all collections from IndexedDB
   * Called on app startup
   * @returns {Promise<Object>} Object with all collections (employees, colloqui, etc.)
   */
  async function loadAll() {
    try {
      const db = await initDB()
      const data = {}

      // Load each store
      for (const storeName of STORES) {
        data[storeName] = await loadStore(db, storeName)
      }

      console.log('✅ All data loaded from IndexedDB:', data)
      return data
    } catch (err) {
      console.error('❌ Error loading from IndexedDB:', err)
      return {
        employees: [],
        colloqui: [],
        ferie: [],
        colloquiPC: [],
        dimissioni: [],
        valutazioni360: []
      }
    }
  }

  /**
   * Load all records from a specific object store
   * @param {IDBDatabase} db - Database instance
   * @param {string} storeName - Object store name
   * @returns {Promise<Array>} Array of records
   */
  async function loadStore(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)

      const request = store.getAll()

      request.onsuccess = () => {
        const results = request.result || []
        console.log(`✓ Loaded ${results.length} records from ${storeName}`)
        resolve(results)
      }

      request.onerror = () => {
        console.error(`Error loading from ${storeName}:`, request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Clear all data from IndexedDB
   * Useful for reset/clear operations
   * @returns {Promise<boolean>} Success status
   */
  async function clearAll() {
    try {
      const db = await initDB()

      for (const storeName of STORES) {
        await new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite')
          const store = transaction.objectStore(storeName)
          const request = store.clear()

          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      }

      console.log('🗑️ All IndexedDB data cleared')
      return true
    } catch (err) {
      console.error('❌ Error clearing IndexedDB:', err)
      return false
    }
  }

  /**
   * Get database stats
   * @returns {Promise<Object>} Stats object with store names and record counts
   */
  async function getStats() {
    try {
      const db = await initDB()
      const stats = {}

      for (const storeName of STORES) {
        const count = await new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly')
          const store = transaction.objectStore(storeName)
          const request = store.count()

          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })
        stats[storeName] = count
      }

      return stats
    } catch (err) {
      console.error('Error getting stats:', err)
      return {}
    }
  }

  return {
    initDB,
    saveAll,
    loadAll,
    saveBatch,
    clearAll,
    getStats,
    DB_NAME,
    STORES
  }
}
