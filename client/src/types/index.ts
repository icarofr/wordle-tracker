import type { components } from './generated'

// --- API schemas ---
export type SessionUser = components['schemas']['SessionUser']
export type PublicUser = components['schemas']['PublicUser']
export type AuthResponse = components['schemas']['AuthResponse']
export type LoginRequest = components['schemas']['LoginRequest']
export type RegisterRequest = components['schemas']['RegisterRequest']
export type UpdateAvatarRequest = components['schemas']['UpdateAvatarRequest']
export type ProblemDetail = components['schemas']['ProblemDetail']

export type WordleStats = components['schemas']['WordleStats']
export type WordleEntry = components['schemas']['WordleEntry']
export type WordleSubmitRequest = components['schemas']['WordleSubmitRequest']

export type ArchiveEntryInfo = components['schemas']['ArchiveEntryInfo']
export type ArchiveSummary = components['schemas']['ArchiveSummary']
export type ArchiveListItem = components['schemas']['ArchiveListItem']
export type ArchiveListPage = components['schemas']['ArchiveListPage']
export type ArchiveStanding = components['schemas']['ArchiveStanding']
export type ArchiveWordle = components['schemas']['ArchiveWordle']

export type HeadToHeadRecord = components['schemas']['HeadToHeadRecord']
export type HeadToHeadStats = components['schemas']['HeadToHeadStats']
export type RecentMatch = components['schemas']['RecentMatch']

export type LeaderboardEntry = components['schemas']['LeaderboardEntry']
export type LeaderboardData = components['schemas']['LeaderboardData']

// --- Backwards-compatibility aliases ---
/** @deprecated Use SessionUser instead */
export type User = SessionUser
/** @deprecated Use PublicUser instead */
export type ArchivePlayer = PublicUser

// --- Client-only types (not in API schema) ---
export interface LookupSearch {
  wordleId?: number
  view?: 'list'
}

export interface UserData {
  name: string
  stats?: WordleStats
}
