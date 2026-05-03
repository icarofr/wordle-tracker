import { redirect } from '@tanstack/solid-router'
import { authApi } from './api'
import { authStore } from './auth'

let validationPromise: Promise<boolean> | null = null

function clearAuthState() {
  authStore.setIsAuthenticated(false)
  authStore.setUser(null)
}

async function validateToken(): Promise<boolean> {
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
    // Optimistic: if we have no auth state, let them through to the guest page.
    // The login/register form will set auth state after a successful response.
    if (!authStore.isAuthenticated()) {
      return
    }

    const valid = await ensureValidated()
    if (valid) {
      throw redirect({ to: '/dashboard' })
    }
  },
}
