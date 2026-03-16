import { useToastNotification } from './useToastNotification.js'

/**
 * useExport composable
 * Esporta dati in Excel e JSON
 */

export function useExport() {
  const toast = useToastNotification()

  /**
   * Esporta i dati come Excel file
   */
  function exportToExcel(storeData) {
    try {
      const XLSX = require('xlsx')
      const workbook = XLSX.utils.book_new()

      // Sheet 1: Anagrafica
      const aSheet = XLSX.utils.json_to_sheet(storeData.employees || [])
      XLSX.utils.book_append_sheet(workbook, aSheet, 'Anagrafica')

      // Sheet 2: Onboarding
      const onboardingData = (storeData.employees || []).map(e => ({
        nome: e.nome,
        cognome: e.cognome,
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
        backupVersion: '2.0'
      }]
      const mSheet = XLSX.utils.json_to_sheet(metadata)
      XLSX.utils.book_append_sheet(workbook, mSheet, 'Metadata')

      // Download file
      const filename = `MOVE_HR_backup_${new Date().toISOString().slice(0, 10)}.xlsx`
      XLSX.writeFile(workbook, filename)
      toast.showToast('✅ Excel scaricato: ' + filename, 'success', 2000)
    } catch (err) {
      console.error('Export Excel failed:', err)
      toast.showToast('❌ Errore esportazione Excel', 'error', 2000)
      throw err
    }
  }

  /**
   * Esporta i dati come JSON file
   */
  function exportToJSON(storeData) {
    try {
      const jsonData = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        exportedAt: new Date().toLocaleString('it-IT'),
        employees: storeData.employees || [],
        colloqui: storeData.colloqui || [],
        ferie: storeData.ferie || [],
        colloquiPC: storeData.colloquiPC || [],
        dimissioni: storeData.dimissioni || [],
        valutazioni360: storeData.valutazioni360 || [],
        allUrgenze: storeData.allUrgenze || []
      }

      const jsonString = JSON.stringify(jsonData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `MOVE_HR_backup_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.showToast('✅ JSON scaricato', 'success', 2000)
    } catch (err) {
      console.error('Export JSON failed:', err)
      toast.showToast('❌ Errore esportazione JSON', 'error', 2000)
      throw err
    }
  }

  /**
   * Esporta CSV del Kanban (per rapida vista)
   */
  function exportKanbanCSV(allUrgenze) {
    try {
      const headers = ['Nome Completo', 'Team', 'Tipo', 'Scadenza', 'Urgenza', 'Descrizione']
      const rows = (allUrgenze || []).map(item => [
        `${item.nome} ${item.cognome}`,
        item.team,
        item.tipo,
        item.scadenza || '',
        item.urgenza,
        item.descrizione || ''
      ])

      let csv = headers.join(',') + '\n'
      rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n'
      })

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Kanban_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.showToast('✅ CSV Kanban scaricato', 'success', 2000)
    } catch (err) {
      console.error('Export CSV failed:', err)
      toast.showToast('❌ Errore esportazione CSV', 'error', 2000)
      throw err
    }
  }

  return {
    exportToExcel,
    exportToJSON,
    exportKanbanCSV
  }
}
