import { useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface UseToastReturn {
  showToast: (message: string, type?: ToastType) => void
}

export const useToast = (): UseToastReturn => {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    // Create toast element
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.textContent = message

    // Add toast styles
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      borderRadius: '4px',
      color: 'white',
      fontSize: '14px',
      zIndex: '1000',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      maxWidth: '400px',
      wordWrap: 'break-word',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    })

    // Set background color based on type
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b'
    }
    toast.style.backgroundColor = colors[type] || colors.info

    document.body.appendChild(toast)

    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1'
    }, 10)

    // Remove after duration
    const duration = type === 'error' ? 5000 : 3000
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, duration)
  }, [])

  return { showToast }
}
