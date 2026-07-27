import type { User } from '../types'
import { createRoot, createSignal } from 'solid-js'
import { router } from '../main'
import { authApi } from './api'
import { resetValidation, validateToken } from './authGuards'

// --- Global reactive auth store (independent of component tree) ---
function createAuthStore() {
  const [isAuthenticated, setIsAuthenticated] = createSignal(false)
  const [user, setUser] = createSignal<User | null>(null)

  return {
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
  }
}

export const authStore = createRoot(createAuthStore)

export function useAuth() {
  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
  }
}

/**
 * Mark the user as authenticated and fetch their profile.
 * Called after a successful login/register API response (which sets the HttpOnly cookie).
 * This is the single entry point that sets both isAuthenticated and user atomically.
 */
export async function markAuthenticated() {
  authStore.setIsAuthenticated(true)
  await validateToken()
}

/**
 * Log out: delete the server session, then clear local state.
 * Server call comes first so the session is invalidated before the router re-evaluates guards.
 */
export async function logout() {
  try {
    await authApi.logout()
  }
  catch {
    // Best-effort — cookie will be cleared by the server on success,
    // and the local state is cleared below regardless.
  }
  authStore.setIsAuthenticated(false)
  authStore.setUser(null)
  resetValidation()
  await router.invalidate()
}
