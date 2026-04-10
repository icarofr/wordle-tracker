import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { server } from '~/test/msw/server'
import { ApiError, authApi, isValidToken, userApi, wordleApi } from './api'

const API = 'http://localhost:9999'

describe('isValidToken', () => {
  it('accepts valid tokens', () => {
    expect(isValidToken('abc123def456')).toBe(true)
    expect(isValidToken('a-b-c_d_e_f_1234')).toBe(true)
  })

  it('rejects tokens shorter than 10 chars', () => {
    expect(isValidToken('short')).toBe(false)
    expect(isValidToken('123456789')).toBe(false)
  })

  it('rejects tokens with special chars', () => {
    expect(isValidToken('token with spaces!')).toBe(false)
  })
})

describe('apiRequest (via API objects)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('injects Bearer token from localStorage', async () => {
    localStorage.setItem('auth_token', 'test-token-12345')

    let capturedAuth = ''
    server.use(
      http.get(`${API}/users/self/stats`, ({ request }) => {
        capturedAuth = request.headers.get('Authorization') ?? ''
        return HttpResponse.json({
          games: 0,
          wins: 0,
          fails: 0,
          average_score: 0,
          win_percentage: 0,
          distribution: {},
          current_streak: 0,
          max_streak: 0,
        })
      }),
    )

    await wordleApi.getStats()
    expect(capturedAuth).toBe('Bearer test-token-12345')
  })

  it('omits Authorization header when no token', async () => {
    let capturedAuth: string | null = 'initial'
    server.use(
      http.get(`${API}/users/self/stats`, ({ request }) => {
        capturedAuth = request.headers.get('Authorization')
        return HttpResponse.json({
          games: 0,
          wins: 0,
          fails: 0,
          average_score: 0,
          win_percentage: 0,
          distribution: {},
          current_streak: 0,
          max_streak: 0,
        })
      }),
    )

    await wordleApi.getStats()
    expect(capturedAuth).toBeNull()
  })

  it('returns undefined for 204 responses', async () => {
    localStorage.setItem('auth_token', 'test-token-12345')
    server.use(
      http.delete(`${API}/sessions/current`, () =>
        new HttpResponse(null, { status: 204 })),
    )

    const result = await authApi.logout('test-token-12345')
    expect(result).toBeUndefined()
  })

  it('throws ApiError with ProblemDetail fields on error', async () => {
    server.use(
      http.post(`${API}/wordle-submissions`, () =>
        HttpResponse.json(
          {
            type: '/problems/duplicate-entry',
            title: 'Duplicate Entry',
            status: 409,
            detail: 'You have already submitted this wordle',
          },
          { status: 409, headers: { 'Content-Type': 'application/problem+json' } },
        )),
    )

    localStorage.setItem('auth_token', 'test-token-12345')
    try {
      await wordleApi.submit({ raw_input: 'test' })
      expect.fail('Should have thrown')
    }
    catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      const err = e as InstanceType<typeof ApiError>
      expect(err.status).toBe(409)
      expect(err.code).toBe('/problems/duplicate-entry')
      expect(err.message).toBe('You have already submitted this wordle')
    }
  })

  it('throws ApiError with validation errors', async () => {
    server.use(
      http.post(`${API}/wordle-submissions`, () =>
        HttpResponse.json(
          {
            type: '/problems/validation-error',
            title: 'Validation Error',
            status: 400,
            detail: 'Input validation failed',
            errors: [{ field: 'raw_input', detail: 'is required' }],
          },
          { status: 400 },
        )),
    )

    localStorage.setItem('auth_token', 'test-token-12345')
    try {
      await wordleApi.submit({ raw_input: '' })
      expect.fail('Should have thrown')
    }
    catch (e) {
      const err = e as InstanceType<typeof ApiError>
      expect(err.fields).toHaveLength(1)
      expect(err.fields![0].field).toBe('raw_input')
    }
  })

  it('userApi.getUsers extracts items from response', async () => {
    const users = await userApi.getUsers()
    expect(Array.isArray(users)).toBe(true)
    expect(users.length).toBeGreaterThan(0)
    expect(users[0]).toHaveProperty('name')
  })
})
