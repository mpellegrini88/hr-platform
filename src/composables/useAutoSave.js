import { ref } from 'vue'
import { usePersistence } from './usePersistence.js'
import { useToastNotification } from './useToastNotification.js'

export function useAutoSave() {
  const persistence = usePersistence()
  const toast = useToastNotification()

  const changeCount = ref(0)
  const lastSaveTime = ref(Date.now())
  const CHANGE_THRESHOLD = 10
  const EXPORT_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
  const DEBOUNCE_DELAY_MS = 500

  let exportTimeout = null
  let debounceTimeout = null

  /**
   * Call after every store mutation
   * Increments counter, syncs localStorage, triggers debounced export
   */
  function trackChange(storeData) {
    changeCount.value++

    // Immediate localStorage sync
    syncToLocalStorage(storeData)

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
    manualExportToExcel,
    manualImportFromJSON
  }
}
