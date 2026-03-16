import { ref } from 'vue'

/**
 * useSyncStatus composable
 * Traccia lo stato della sincronizzazione e il timestamp del ultimo salvataggio
 */

let lastSyncTimestamp = ref(null)
let lastLocalSyncTimestamp = ref(null)
let syncStatus = ref('idle') // 'idle', 'syncing', 'error'
let syncErrorMsg = ref(null)

export function useSyncStatus() {
  /**
   * Aggiorna il timestamp dell'ultimo salvataggio sul backend
   */
  function recordBackendSync() {
    lastSyncTimestamp.value = Date.now()
    syncStatus.value = 'idle'
    syncErrorMsg.value = null
  }

  /**
   * Aggiorna il timestamp dell'ultimo salvataggio locale
   */
  function recordLocalSync() {
    lastLocalSyncTimestamp.value = Date.now()
  }

  /**
   * Registra un errore di sincronizzazione
   */
  function recordSyncError(msg) {
    syncStatus.value = 'error'
    syncErrorMsg.value = msg
  }

  /**
   * Formatta il timestamp relativo (es. "2 minuti fa")
   */
  function getTimeSinceSync() {
    if (!lastSyncTimestamp.value) return 'Mai'
    
    const diff = Date.now() - lastSyncTimestamp.value
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} giorno${days > 1 ? 'i' : ''} fa`
    if (hours > 0) return `${hours} ora${hours > 1 ? 'e' : ''} fa`
    if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 'i' : ''} fa`
    if (seconds > 0) return `${seconds} secondo${seconds > 1 ? 'i' : ''} fa`
    return 'Ora'
  }

  /**
   * Formatta il timestamp relativo (locale)
   */
  function getTimeSinceLocalSync() {
    if (!lastLocalSyncTimestamp.value) return 'Mai'
    
    const diff = Date.now() - lastLocalSyncTimestamp.value
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 'i' : ''} fa`
    if (seconds > 0) return `${seconds} secondo${seconds > 1 ? 'i' : ''} fa`
    return 'Ora'
  }

  return {
    lastSyncTimestamp,
    lastLocalSyncTimestamp,
    syncStatus,
    syncErrorMsg,
    recordBackendSync,
    recordLocalSync,
    recordSyncError,
    getTimeSinceSync,
    getTimeSinceLocalSync
  }
}
