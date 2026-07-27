import { redirect } from '@tanstack/solid-router'
import { authApi } from './api'
import { authStore } from './auth'

let validationPromise: Promise<boolean> | null = null

/**
 * Validate the current session by calling /users/self.
 * Sets both isAuthenticated and user atomically on success.
 * This is the single source of truth for session validation.
 */
export async function validateToken(): Promise<boolean> {
  try {
    const user = await authApi.me()
    authStore.setUser(user)
    authStore.setIsAuthenticated(true)
    return true
  }
  catch {
    authStore.setIsAuthenticated(false)
    authStore.setUser(null)
    return false
  }
}

/**
 * Ensure the session has been validated (at most one in-flight request).
 * Returns immediately if the user is already authenticated with a loaded profile.
 */
async function ensureValidated(): Promise<boolean> {
  if (authStore.isAuthenticated() && authStore.user()) {
    return true
  }

  if (!validationPromise) {
    validationPromise = validateToken().finally(() => {
      validationPromise = null
    })
  }
  return validationPromise
}

/** Reset the validation dedup promise (called on logout). */
export function resetValidation() {
  validationPromise = null
}

export const authGuards = {
  requireAuth: async () => {
    const valid = await ensureValidated()
    if (!valid) {
      throw redirect({ to: '/login' })
    }
  },
  requireGuest: async () => {
    const valid = await ensureValidated()
    if (valid) {
      throw redirect({ to: '/dashboard' })
    }
  },
}
