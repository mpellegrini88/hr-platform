import { useHrStore } from '@/stores/hrStore.js'
import { usePersistence } from './usePersistence.js'

/**
 * useDataMigration composable
 * Handles data migration and cleanup for 2026 reset
 * - Automatically migrate on boot if year >= 2026
 * - Removes all pre-2026 data silently
 * - Marks employee records as "data eliminated"
 */

const CUTOFF_YEAR = 2026
const MIGRATION_KEY = 'data_migration_completed'

export function useDataMigration() {
  const persistence = usePersistence()

  /**
   * Check if migration has already been done
   * @returns {boolean} True if migration was already completed
   */
  function hasMigrationCompleted() {
    const metadata = persistence.load('metadata', {})
    return metadata[MIGRATION_KEY] === true
  }

  /**
   * Eliminate all pre-2026 data silently
   * Called automatically on boot if year >= 2026
   */
  function eliminaDatiPre2026() {
    const store = useHrStore()
    const currentYear = new Date().getFullYear()

    if (currentYear < CUTOFF_YEAR) {
      return // Not time yet
    }

    console.log(`🗑️ Starting pre-${CUTOFF_YEAR} data elimination...`)

    let eliminated = {
      valutazioni360: 0,
      colloqui: 0,
      ferie: 0,
      colloquiPC: 0
    }

    // Eliminate valutazioni360 pre-2026
    if (store.valutazioni360 && Array.isArray(store.valutazioni360)) {
      store.valutazioni360 = store.valutazioni360.filter(val => {
        if (val.anno < CUTOFF_YEAR) {
          eliminated.valutazioni360++
          return false
        }
        return true
      })
    }

    // Eliminate colloqui pre-2026
    if (store.colloqui && Array.isArray(store.colloqui)) {
      const { colloqui: oldColloqui, retained: newColloqui } = store.colloqui.reduce(
        (acc, col) => {
          const colDate = new Date(col.date)
          if (colDate.getFullYear() < CUTOFF_YEAR) {
            acc.colloqui++
          } else {
            acc.retained.push(col)
          }
          return acc
        },
        { colloqui: 0, retained: [] }
      )
      store.colloqui = newColloqui
      eliminated.colloqui = oldColloqui
    }

    // Eliminate ferie pre-2026
    if (store.ferie && Array.isArray(store.ferie)) {
      const { ferie: oldFerie, retained: newFerie } = store.ferie.reduce(
        (acc, feria) => {
          const feriaDate = new Date(feria.dataDa)
          if (feriaDate.getFullYear() < CUTOFF_YEAR) {
            acc.ferie++
          } else {
            acc.retained.push(feria)
          }
          return acc
        },
        { ferie: 0, retained: [] }
      )
      store.ferie = newFerie
      eliminated.ferie = oldFerie
    }

    // Eliminate colloquiPC pre-2026
    if (store.colloquiPC && Array.isArray(store.colloquiPC)) {
      const { colloquiPC: oldPC, retained: newPC } = store.colloquiPC.reduce(
        (acc, pc) => {
          const pcDate = new Date(pc.date)
          if (pcDate.getFullYear() < CUTOFF_YEAR) {
            acc.colloquiPC++
          } else {
            acc.retained.push(pc)
          }
          return acc
        },
        { colloquiPC: 0, retained: [] }
      )
      store.colloquiPC = newPC
      eliminated.colloquiPC = oldPC
    }

    // Mark employees with pre-2026 data elimination
    if (store.employees && Array.isArray(store.employees)) {
      store.employees.forEach(emp => {
        const assunzioneYear = new Date(emp.dataAssunzione).getFullYear()
        if (assunzioneYear < CUTOFF_YEAR) {
          if (!emp.valutazioneMetadata) {
            emp.valutazioneMetadata = {}
          }
          emp.valutazioneMetadata.datiPre2026Eliminati = true
          emp.valutazioneMetadata.eliminazioneDatee = new Date().toISOString()
        }
      })
    }

    // Mark migration as completed
    const metadata = persistence.load('metadata', {})
    metadata[MIGRATION_KEY] = true
    metadata.migrationDate = new Date().toISOString()
    metadata.eliminatedData = eliminated
    persistence.save('metadata', metadata)

    // Sync to localStorage
    persistence.save('employees', store.employees)
    persistence.save('valutazioni360', store.valutazioni360)
    persistence.save('colloqui', store.colloqui)
    persistence.save('ferie', store.ferie)
    persistence.save('colloquiPC', store.colloquiPC)

    console.log(`✅ Pre-${CUTOFF_YEAR} data elimination completed:`, eliminated)
    console.log(`  📋 Valutazioni eliminate: ${eliminated.valutazioni360}`)
    console.log(`  📋 Colloqui eliminate: ${eliminated.colloqui}`)
    console.log(`  🌴 Ferie eliminate: ${eliminated.ferie}`)
    console.log(`  💬 Colloqui P&C eliminate: ${eliminated.colloquiPC}`)
  }

  /**
   * Auto-migrate on boot if needed
   * Call this in App.vue onMounted() - silent operation, no dialogs
   */
  function autoMigrateOnBootIfNeeded() {
    const currentYear = new Date().getFullYear()

    // Only run migration once per year, on first boot after cutoff
    if (currentYear >= CUTOFF_YEAR && !hasMigrationCompleted()) {
      eliminaDatiPre2026()
    }
  }

  /**
   * Check if employee has pre-2026 data
   * @param {number} employeeId - Employee ID
   * @returns {boolean} True if employee records have pre-2026 data
   */
  function hasEmployeePre2026Data(employeeId) {
    const store = useHrStore()
    const emp = store.employees?.find(e => e.id === employeeId)
    return emp?.valutazioneMetadata?.datiPre2026Eliminati === true
  }

  /**
   * Get info about elimination status
   * @returns {object} Info about data elimination
   */
  function getEliminationInfo() {
    const persistence = usePersistence()
    const metadata = persistence.load('metadata', {})

    return {
      hasMigrationCompleted: hasMigrationCompleted(),
      migrationDate: metadata.migrationDate || null,
      eliminatedData: metadata.eliminatedData || {},
      cutoffYear: CUTOFF_YEAR
    }
  }

  return {
    eliminaDatiPre2026,
    autoMigrateOnBootIfNeeded,
    hasMigrationCompleted,
    hasEmployeePre2026Data,
    getEliminationInfo,
    CUTOFF_YEAR
  }
}
