import { ref } from 'vue'
import { usePersistence } from './usePersistence.js'
import { useToastNotification } from './useToastNotification.js'
import { useBackendAPI } from './useBackendAPI.js'
import { useSyncStatus } from './useSyncStatus.js'

export function useAutoSave() {
  const persistence = usePersistence()
  const toast = useToastNotification()
  const backend = useBackendAPI()
  const syncStatus = useSyncStatus()

  const changeCount = ref(0)
  const lastSaveTime = ref(Date.now())
  const lastBackendSyncTime = ref(Date.now())
  const CHANGE_THRESHOLD = 10
  const EXPORT_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
  const BACKEND_SYNC_INTERVAL_MS = 30 * 1000 // 30 seconds
  const DEBOUNCE_DELAY_MS = 500

  let exportTimeout = null
  let debounceTimeout = null
  let syncTimeout = null

  /**
   * Call after every store mutation
   * Increments counter, syncs localStorage, triggers debounced backend sync & Excel export
   */
  function trackChange(storeData) {
    changeCount.value++

    // Immediate localStorage sync
    syncToLocalStorage(storeData)

    // Debounced backend sync
    clearTimeout(syncTimeout)
    syncTimeout = setTimeout(() => {
      if (Date.now() - lastBackendSyncTime.value >= BACKEND_SYNC_INTERVAL_MS) {
        syncToBackend(storeData)
      }
    }, DEBOUNCE_DELAY_MS)

    // Debounced Excel export check
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      if (changeCount.value >= CHANGE_THRESHOLD ||
          Date.now() - lastSaveTime.value >= EXPORT_INTERVAL_MS) {
        debouncedExportToExcel(storeData)
      }
    }, DEBOUNCE_DELAY_MS)
  }

  /**
   * Immediate sync to localStorage
   */
  function syncToLocalStorage(storeData) {
    try {
      persistence.save('hrStore', storeData)
      syncStatus.recordLocalSync()
      toast.showToast('💾 Dati salvati in locale', 'success', 1500)
    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        handleQuotaExceeded()
      } else {
        toast.showToast('❌ Errore salvataggio', 'error', 2000)
      }
    }
  }

  /**
   * Sync data to backend server
   */
  async function syncToBackend(storeData) {
    try {
      // Check backend health first
      const isHealthy = await backend.checkHealth()
      if (!isHealthy) {
        console.warn('Backend not available, skipping sync')
        return
      }

      await backend.saveAll(storeData)
      lastBackendSyncTime.value = Date.now()
      syncStatus.recordBackendSync()
      toast.showToast('☁️ Sincronizzato con server', 'success', 1000)
    } catch (err) {
      console.error('Backend sync failed:', err)
      syncStatus.recordSyncError(err.message)
      toast.showToast('⚠️ Errore sincronizzazione server', 'warning', 2000)
    }
  }

  /**
   * Periodic Excel export with debouncing
   */
  function debouncedExportToExcel(storeData) {
    clearTimeout(exportTimeout)
    exportTimeout = setTimeout(() => {
      try {
        exportToExcel(storeData)
        changeCount.value = 0
        lastSaveTime.value = Date.now()
        toast.showToast('📤 Backup Excel creato', 'info', 1500)
      } catch (err) {
        console.error('Export Excel failed:', err)
      }
    }, DEBOUNCE_DELAY_MS)
  }

  /**
   * Manual Excel export (triggered by button)
   */
  function manualExportToExcel(storeData) {
    try {
      exportToExcel(storeData)
      toast.showToast('📥 Backup Excel scaricato', 'success', 1500)
    } catch (err) {
      toast.showToast('❌ Errore export Excel', 'error', 2000)
      console.error('Manual export failed:', err)
    }
  }

  /**
   * Helper: Generate & download Excel file
   * Requires: npm install xlsx
   */
  function exportToExcel(storeData) {
    const XLSX = require('xlsx')
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Anagrafica
    const aSheet = XLSX.utils.json_to_sheet(storeData.employees || [])
    XLSX.utils.book_append_sheet(workbook, aSheet, 'Anagrafica')

    // Sheet 2: Onboarding
    const onboardingData = (storeData.employees || []).map(e => ({
      nome: e.nome,
      team: e.team,
      scadenzaFU1: e.scadenzaFU1,
      statoFU1: e.statoFU1,
      scadenzaFU2Manager: e.scadenzaFU2Manager,
      statoFU2Manager: e.statoFU2Manager
    }))
    const obSheet = XLSX.utils.json_to_sheet(onboardingData)
    XLSX.utils.book_append_sheet(workbook, obSheet, 'Onboarding')

    // Sheet 3: Kanban Tasks
    const kanbanData = storeData.allUrgenze || []
    const kSheet = XLSX.utils.json_to_sheet(kanbanData)
    XLSX.utils.book_append_sheet(workbook, kSheet, 'Kanban')

    // Sheet 4: Metadata
    const metadata = [{
      exportDate: new Date().toISOString(),
      totalEmployees: (storeData.employees || []).length,
      totalTasks: (storeData.allUrgenze || []).length,
      backupVersion: '1.0'
    }]
    const mSheet = XLSX.utils.json_to_sheet(metadata)
    XLSX.utils.book_append_sheet(workbook, mSheet, 'Metadata')

    // Download file
    const filename = `MOVE_HR_backup_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(workbook, filename)
  }

  /**
   * Manual import from uploaded JSON file
   */
  function manualImportFromJSON(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)
        persistence.save('hrStore', imported)
        toast.showToast('✅ Dati ripristinati', 'success', 2000)
        // Reload page so all data is fresh
        window.location.reload()
      } catch (err) {
        toast.showToast('❌ Errore importazione', 'error', 2000)
        console.error('Import failed:', err)
      }
    }
    reader.readAsText(file)
  }

  /**
   * Handle localStorage quota exceeded
   */
  function handleQuotaExceeded() {
    toast.showToast('💾 Memoria piena - archivio vecchi dati', 'error', 3000)
    // In future: implement archiving of old valutazioni/colloqui
  }

  return {
    trackChange,
    syncToLocalStorage,
    syncToBackend,
    manualExportToExcel,
    manualImportFromJSON
  }
}
