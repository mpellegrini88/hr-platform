import { ref } from 'vue'
import { useToastNotification } from './useToastNotification.js'

/**
 * useLoading composable
 * Gestisce loading states con notifiche automatiche
 */

export function useLoading() {
  const toast = useToastNotification()

  /**
   * Esegue una funzione asincrona con loading state
   * @param {Function} asyncFn - Funzione asincrona da eseguire
   * @param {Object} options - { delay, successMsg, errorMsg }
   * @returns {Promise}
   */
  async function wrapAsync(asyncFn, options = {}) {
    const { delay = 500, successMsg = null, errorMsg = '❌ Errore' } = options
    
    try {
      const result = await new Promise((resolve) => {
        setTimeout(async () => {
          const res = await asyncFn()
          resolve(res)
        }, delay)
      })
      
      if (successMsg) {
        toast.showToast(successMsg, 'success', 1500)
      }
      return result
    } catch (err) {
      console.error('Async operation failed:', err)
      toast.showToast(errorMsg, 'error', 2000)
      throw err
    }
  }

  /**
   * Crea uno stato loading con funzioni helper
   * @returns { isLoading, startLoading, stopLoading, withLoading }
   */
  function createLoadingState() {
    const isLoading = ref(false)

    async function withLoading(asyncFn, delay = 500) {
      isLoading.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, delay))
        return await asyncFn()
      } finally {
        isLoading.value = false
      }
    }

    return {
      isLoading,
      startLoading: () => { isLoading.value = true },
      stopLoading: () => { isLoading.value = false },
      withLoading
    }
  }

  return {
    wrapAsync,
    createLoadingState
  }
}
