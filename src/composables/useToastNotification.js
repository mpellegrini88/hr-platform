import { ref } from 'vue'

export function useToastNotification() {
  const toastMessage = ref('')
  const toastVisible = ref(false)
  const toastType = ref('success') // 'success' | 'error' | 'info'

  function showToast(msg, type = 'success', duration = 2000) {
    toastMessage.value = msg
    toastType.value = type
    toastVisible.value = true

    setTimeout(() => {
      toastVisible.value = false
    }, duration)
  }

  return {
    toastMessage,
    toastVisible,
    toastType,
    showToast
  }
}
