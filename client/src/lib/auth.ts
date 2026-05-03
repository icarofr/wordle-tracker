import type { User } from '../types'
import {
  createEffect,
  createResource,
  createRoot,
  createSignal,
  on,
} from 'solid-js'
import { router } from '../main'
import { authApi } from './api'
import { resetValidation } from './authGuards'

// --- Part 1: The Global, Non-Hook State Store ---
function createAuthStore() {
  const [isAuthenticated, setIsAuthenticated] = createSignal(false)
  const [user, setUser] = createSignal<User | null>(null)
  const [isLoading, setIsLoading] = createSignal(false)

  return {
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    isLoading,
    setIsLoading,
  }
}

export const authStore = createRoot(createAuthStore)

export function AuthProvider() {
  const [userData] = createResource(
    () => (!!authStore.isAuthenticated()),
    async () => authApi.me(),
  )

  createEffect(() => {
    authStore.setIsLoading(userData.loading)
  })

  createEffect(
    on(
      () => userData.state,
      (state) => {
        if (state === 'ready' && userData()) {
          authStore.setUser(userData()!)
        }
        if (state === 'errored') {
          authStore.setIsAuthenticated(false)
          authStore.setUser(null)
        }
      },
    ),
  )

  createEffect(
    on(
      () => authStore.isAuthenticated(),
      (isAuth) => {
        if (!isAuth) {
          authStore.setUser(null)
        }
      },
    ),
  )

  return null
}

export function useAuth() {
  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
  }
}

export function login() {
  authStore.setIsAuthenticated(true)
}

export async function logout() {
  authStore.setIsAuthenticated(false)
  resetValidation()
  await router.invalidate()
  try {
    await authApi.logout()
  }
  catch {
    // Best-effort server logout — cookie is already cleared by the server
  }
}
