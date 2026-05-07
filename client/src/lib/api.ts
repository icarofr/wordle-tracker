import type {
  ArchiveListPage,
  ArchiveWordle,
  AuthResponse,
  HeadToHeadStats,
  LeaderboardData,
  LoginRequest,
  ProblemDetail,
  RegisterRequest,
  UpdateAvatarRequest,
  User,
  WordleEntry,
  WordleStats,
  WordleSubmitRequest,
} from '../types'
import { API_URL } from '../config'

interface UsersListResponse {
  items: User[]
}

class ApiError extends Error {
  status: number
  code?: string
  fields?: { field: string, detail: string }[]

  constructor(problem: ProblemDetail) {
    super(problem.detail || problem.title)
    this.name = 'ApiError'
    this.status = problem.status
    this.code = problem.type
    this.fields = problem.errors
  }
}

const DEFAULT_TIMEOUT = 10_000

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
      signal: controller.signal,
    })

    if (!response.ok) {
      const problem: ProblemDetail = await response.json() as ProblemDetail
      throw new ApiError(problem)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return await response.json() as T
  }
  catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError({
        type: 'about:blank',
        title: 'Request Timeout',
        status: 408,
        detail: `Request to ${endpoint} timed out after ${timeout}ms`,
      })
    }
    throw err
  }
  finally {
    clearTimeout(timeoutId)
  }
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  logout: async (): Promise<void> => {
    await apiRequest('/sessions/current', {
      method: 'DELETE',
    })
  },

  me: async (): Promise<User> => apiRequest('/users/self'),

  updateAvatar: async (data: UpdateAvatarRequest): Promise<User> =>
    apiRequest('/users/self', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}

export const wordleApi = {
  getStats: async (): Promise<WordleStats> =>
    apiRequest<WordleStats>('/users/self/stats'),
  getUserStats: async (id: number): Promise<WordleStats> =>
    apiRequest<WordleStats>(`/users/${id}/stats`),
  submit: async (data: WordleSubmitRequest): Promise<WordleEntry> =>
    apiRequest<WordleEntry>('/wordle-submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getHeadToHeadConsolidated: async (id: number): Promise<HeadToHeadStats> =>
    apiRequest<HeadToHeadStats>(`/users/self/head-to-heads/${id}`),
  getArchive: async (cursor?: string, limit = 50): Promise<ArchiveListPage> => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (cursor)
      params.set('cursor', cursor)
    return apiRequest<ArchiveListPage>(`/wordles?${params}`)
  },
  getArchiveWordle: async (wordleId: number): Promise<ArchiveWordle> =>
    apiRequest<ArchiveWordle>(`/wordles/${wordleId}`),
  getLeaderboard: async (): Promise<LeaderboardData> =>
    apiRequest<LeaderboardData>('/leaderboards/current'),
}

export const userApi = {
  getUsers: async (): Promise<User[]> =>
    (await apiRequest<UsersListResponse>('/users')).items,
  getUser: async (id: number): Promise<User> =>
    apiRequest<User>(`/users/${id}`),
}

export { ApiError }
