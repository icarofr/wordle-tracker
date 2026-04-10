import { redirect } from '@tanstack/solid-router'
import { authApi, isValidToken } from './api'
import { authStore } from './auth'

let validationPromise: Promise<boolean> | null = null

const getStoredToken = (): string | null => localStorage.getItem('auth_token')

function clearAuthState() {
  localStorage.removeItem('auth_token')
  authStore.setIsAuthenticated(false)
  authStore.setUser(null)
}

async function validateToken(): Promise<boolean> {
  const token = getStoredToken()
  if (!token || !isValidToken(token)) {
    clearAuthState()
    return false
  }

  try {
    const res = await authApi.me()
    authStore.setUser(res)
    authStore.setIsAuthenticated(true)
    return true
  }
  catch {
    clearAuthState()
    return false
  }
}

async function ensureValidated(): Promise<boolean> {
  if (authStore.isAuthenticated() && authStore.user()) {
    return Promise.resolve(true)
  }

  if (!validationPromise) {
    validationPromise = validateToken().finally(() => {
      validationPromise = null
    })
  }
  return validationPromise
}

export function resetValidation() {
  validationPromise = null
}

export const authGuards = {
  isAuthenticated: () => authStore.isAuthenticated(),
  requireAuth: async () => {
    const valid = await ensureValidated()
    if (!valid) {
      throw redirect({ to: '/login' })
    }
  },
  requireGuest: async () => {
    if (!getStoredToken()) {
      return
    }

    const valid = await ensureValidated()
    if (valid) {
      throw redirect({ to: '/dashboard' })
    }
  },
}
