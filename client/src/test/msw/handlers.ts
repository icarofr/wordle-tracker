import { http, HttpResponse } from 'msw'
import { API_URL } from '~/config'

import {
  mockArchivePage,
  mockArchiveWordle,
  mockEntry,
  mockHeadToHead,
  mockLeaderboard,
  mockSessionUser,
  mockStats,
  mockUsers,
  userStatsById,
} from '../fixtures'

export const handlers = [
  // Health
  http.get(`${API_URL}/health`, () =>
    HttpResponse.json({ status: 'ok' })),

  // Auth
  http.post(`${API_URL}/sessions`, () =>
    HttpResponse.json({ user: mockSessionUser, token: 'mock-token-showcase' })),

  http.post(`${API_URL}/users`, () =>
    HttpResponse.json({ user: mockSessionUser, token: 'mock-token-showcase' }, { status: 201 })),

  http.delete(`${API_URL}/sessions/current`, () =>
    new HttpResponse(null, { status: 204 })),

  // Users
  http.get(`${API_URL}/users/self`, () =>
    HttpResponse.json(mockSessionUser)),

  http.patch(`${API_URL}/users/self`, () =>
    HttpResponse.json(mockSessionUser)),

  http.get(`${API_URL}/users`, () =>
    HttpResponse.json({ items: mockUsers })),

  http.get(`${API_URL}/users/:id`, ({ params }) =>
    HttpResponse.json(mockUsers.find(u => u.id === Number(params.id)) ?? mockUsers[0])),

  // Wordle Stats — per-user stats from fixture data
  http.get(`${API_URL}/users/self/stats`, () =>
    HttpResponse.json(mockStats)),

  http.get(`${API_URL}/users/:id/stats`, ({ params }) =>
    HttpResponse.json(userStatsById[Number(params.id)] ?? mockStats)),

  // Wordle Submissions
  http.post(`${API_URL}/wordle-submissions`, () =>
    HttpResponse.json(mockEntry, { status: 201 })),

  // Archive
  http.get(`${API_URL}/wordles`, () =>
    HttpResponse.json(mockArchivePage)),

  http.get(`${API_URL}/wordles/:id`, () =>
    HttpResponse.json(mockArchiveWordle)),

  // Head to Head
  http.get(`${API_URL}/users/self/head-to-heads/:id`, () =>
    HttpResponse.json(mockHeadToHead)),

  // Leaderboard
  http.get(`${API_URL}/leaderboards/current`, () =>
    HttpResponse.json(mockLeaderboard)),

]
