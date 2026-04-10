import type {
  ArchiveListItem,
  ArchiveListPage,
  ArchiveWordle,
  HeadToHeadStats,
  LeaderboardData,
  PublicUser,
  SessionUser,
  WordleEntry,
  WordleStats,
} from '~/types'

// --- Users ---
// 6 players with distinct personalities and avatars

export const mockSessionUser: SessionUser = {
  id: 1,
  name: 'Amor',
  email: 'amor@wordle.demo',
  avatar: '03',
}

export const mockPublicUser: PublicUser = {
  id: 1,
  name: 'Amor',
  avatar: '03',
}

export const mockOpponent: PublicUser = {
  id: 2,
  name: 'Baixinho',
  avatar: '07',
}

const coracao: PublicUser = { id: 3, name: 'Coração', avatar: '12' }
const docinho: PublicUser = { id: 4, name: 'Docinho', avatar: '15' }
const escola: PublicUser = { id: 5, name: 'Escola', avatar: '20' }
const feijao: PublicUser = { id: 6, name: 'Feijão', avatar: '24' }

export const mockUsers: PublicUser[] = [
  mockPublicUser,
  mockOpponent,
  coracao,
  docinho,
  escola,
  feijao,
]

// --- Wordle Stats (Amor — solid, well-rounded player) ---

export const mockStats: WordleStats = {
  games: 187,
  wins: 168,
  fails: 7,
  average_score: 3.6,
  win_percentage: 89.8,
  distribution: { 1: 3, 2: 18, 3: 52, 4: 58, 5: 27, 6: 10, X: 7 },
  current_streak: 23,
  max_streak: 41,
}

// Stats per player — keyed by user ID for handler lookups
export const baixinhoStats: WordleStats = {
  games: 192,
  wins: 171,
  fails: 9,
  average_score: 3.4,
  win_percentage: 89.1,
  distribution: { 1: 11, 2: 29, 3: 48, 4: 45, 5: 25, 6: 13, X: 9 },
  current_streak: 5,
  max_streak: 38,
}

export const coracaoStats: WordleStats = {
  games: 195,
  wins: 182,
  fails: 3,
  average_score: 3.5,
  win_percentage: 93.3,
  distribution: { 1: 1, 2: 14, 3: 62, 4: 68, 5: 30, 6: 7, X: 3 },
  current_streak: 52,
  max_streak: 52,
}

export const docinhoStats: WordleStats = {
  games: 143,
  wins: 112,
  fails: 15,
  average_score: 4.2,
  win_percentage: 78.3,
  distribution: { 1: 2, 2: 8, 3: 22, 4: 38, 5: 28, 6: 14, X: 15 },
  current_streak: 3,
  max_streak: 12,
}

export const escolaStats: WordleStats = {
  games: 34,
  wins: 24,
  fails: 5,
  average_score: 4.4,
  win_percentage: 70.6,
  distribution: { 1: 0, 2: 2, 3: 5, 4: 8, 5: 6, 6: 3, X: 5 },
  current_streak: 1,
  max_streak: 6,
}

export const feijaoStats: WordleStats = {
  games: 190,
  wins: 178,
  fails: 4,
  average_score: 3.3,
  win_percentage: 93.7,
  distribution: { 1: 5, 2: 24, 3: 65, 4: 55, 5: 22, 6: 7, X: 4 },
  current_streak: 67,
  max_streak: 67,
}

export const userStatsById: Record<number, WordleStats> = {
  1: mockStats,
  2: baixinhoStats,
  3: coracaoStats,
  4: docinhoStats,
  5: escolaStats,
  6: feijaoStats,
}

// --- Wordle Entry ---

export const mockEntry: WordleEntry = {
  id: 100,
  wordle_id: 1340,
  score: '3',
  raw_input: 'Wordle 1,340 3/6\n\n🟨⬛⬛🟩⬛\n⬛🟩🟩🟩⬛\n🟩🟩🟩🟩🟩',
  created_at: '2026-04-09T08:15:00Z',
}

// --- Archive (20 items across 2 pages for pagination demo) ---

function makeArchiveItem(wordleId: number, played: boolean, viewerScore?: string, bestScore?: string, solvedCount?: number, failedCount?: number, participantCount?: number): ArchiveListItem {
  if (!played) {
    return {
      wordle_id: wordleId,
      participant_count: participantCount ?? 4,
      viewer_has_played: false,
    }
  }
  return {
    wordle_id: wordleId,
    participant_count: participantCount ?? 6,
    viewer_has_played: true,
    viewer_entry: { score: viewerScore!, created_at: '2026-04-09T08:15:00Z' },
    summary: { best_score: bestScore ?? viewerScore!, solved_count: solvedCount ?? 5, failed_count: failedCount ?? 1 },
  }
}

const archiveItems: ArchiveListItem[] = [
  makeArchiveItem(1340, true, '3', '2', 5, 1),
  makeArchiveItem(1339, true, '4', '3', 6, 0),
  makeArchiveItem(1338, true, '2', '2', 4, 2),
  makeArchiveItem(1337, false, undefined, undefined, undefined, undefined, 5),
  makeArchiveItem(1336, true, '5', '3', 5, 1),
  makeArchiveItem(1335, true, '3', '3', 6, 0),
  makeArchiveItem(1334, true, '4', '2', 5, 1),
  makeArchiveItem(1333, true, '3', '3', 4, 0),
  makeArchiveItem(1332, true, '6', '3', 3, 2),
  makeArchiveItem(1331, true, '3', '2', 5, 1),
]

export const mockArchiveItem: ArchiveListItem = archiveItems[0]

export const mockArchiveItemUnplayed: ArchiveListItem = archiveItems[3]

export const mockArchivePage: ArchiveListPage = {
  self: '/wordles?limit=10',
  next: '/wordles?limit=10&cursor=eyJpZCI6MTMzMX0',
  items: archiveItems,
}

export const mockArchiveWordle: ArchiveWordle = {
  wordle_id: 1340,
  total_users: 6,
  played_count: 5,
  pending_count: 1,
  viewer_has_played: true,
  viewer_entry: { score: '3', created_at: '2026-04-09T08:15:00Z' },
  standings: [
    { user: mockOpponent, entry: { score: '2', created_at: '2026-04-09T07:30:00Z' } },
    { user: mockPublicUser, entry: { score: '3', created_at: '2026-04-09T08:15:00Z' } },
    { user: coracao, entry: { score: '3', created_at: '2026-04-09T06:45:00Z' } },
    { user: feijao, entry: { score: '4', created_at: '2026-04-09T09:00:00Z' } },
    { user: docinho, entry: { score: 'X', created_at: '2026-04-09T03:20:00Z' } },
  ],
  waiting_players: [escola],
}

// --- Head to Head (Amor vs Baixinho — close rivalry) ---

export const mockHeadToHead: HeadToHeadStats = {
  opponent: mockOpponent,
  record: { total_games: 156, wins: 72, losses: 68, ties: 16, win_percentage: 46.2 },
  stats: { self: mockStats, opponent: baixinhoStats },
  recent_matches: [
    { wordle_id: 1340, self_score: '3', opponent_score: '2', played_at: '2026-04-09T08:15:00Z', result: 'LOSS' },
    { wordle_id: 1339, self_score: '4', opponent_score: '4', played_at: '2026-04-08T09:00:00Z', result: 'TIE' },
    { wordle_id: 1338, self_score: '2', opponent_score: '5', played_at: '2026-04-07T08:30:00Z', result: 'WIN' },
    { wordle_id: 1336, self_score: '5', opponent_score: '3', played_at: '2026-04-05T10:00:00Z', result: 'LOSS' },
    { wordle_id: 1335, self_score: '3', opponent_score: '3', played_at: '2026-04-04T07:45:00Z', result: 'TIE' },
  ],
}

// --- Leaderboard ---

function leaderboardEntry(player: PublicUser, stats: WordleStats) {
  return { player, total_games: stats.games, average_score: stats.average_score, win_percentage: stats.win_percentage, current_streak: stats.current_streak, max_streak: stats.max_streak }
}

export const mockLeaderboard: LeaderboardData = {
  shared_wordles: 156,
  items: [
    leaderboardEntry(feijao, feijaoStats),
    leaderboardEntry(coracao, coracaoStats),
    leaderboardEntry(mockPublicUser, mockStats),
    leaderboardEntry(mockOpponent, baixinhoStats),
    leaderboardEntry(docinho, docinhoStats),
    leaderboardEntry(escola, escolaStats),
  ],
}
