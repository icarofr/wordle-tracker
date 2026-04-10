import type { User } from '../types'
import {

  createEffect,
  createResource,
  createRoot,
  createSignal,
  on,
} from 'solid-js'
import { router } from '../main'
import { authApi, isValidToken } from './api'
import { resetValidation } from './authGuards'

// --- Token Helper Functions ---
const getAuthToken = (): string | null => localStorage.getItem('auth_token')
function setAuthToken(token: string) {
  return localStorage.setItem('auth_token', token)
}
const removeAuthToken = () => localStorage.removeItem('auth_token')

// --- Part 1: The Global, Non-Hook State Store ---
function createAuthStore() {
  const token = getAuthToken()
  const [isAuthenticated, setIsAuthenticated] = createSignal(
    token ? isValidToken(token) : false,
  )
  const [user, setUser] = createSignal<User | null>(null)
  const [isLoading, setIsLoading] = createSignal(isAuthenticated())

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
          removeAuthToken()
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

export function login(token: string) {
  setAuthToken(token)
  authStore.setIsAuthenticated(true)
}

export async function logout() {
  const token = getAuthToken()
  removeAuthToken()
  authStore.setIsAuthenticated(false)
  resetValidation()
  await router.invalidate()
  try {
    if (token) {
      await authApi.logout(token)
    }
  }
  catch {
    // Best-effort server logout — token is already cleared locally
  }
}
