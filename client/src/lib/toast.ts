import { createRoot, createSignal } from 'solid-js'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info' | 'default'
  duration?: number
  action?: ToastAction
  createdAt: number
}

function createToastStore() {
  const [toasts, setToasts] = createSignal<Toast[]>([])

  return {
    toasts,
    setToasts,
  }
}

const toastStore = createRoot(createToastStore)

// Function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11)

// Function to show a toast
export function showToast(message: string, type: Toast['type'] = 'default', duration: number = 5000, action?: ToastAction) {
  const id = generateId()
  const toast: Toast = { id, message, type, duration, action, createdAt: Date.now() }

  toastStore.setToasts(prev => [...prev, toast])

  // Auto-remove toast after duration
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

// Function to remove a toast
export function removeToast(id: string) {
  toastStore.setToasts(prev => prev.filter(toast => toast.id !== id))
}

// Function to clear all toasts
export function clearToasts() {
  toastStore.setToasts([])
}

// Export toasts signal for components to use
export const toasts = toastStore.toasts
