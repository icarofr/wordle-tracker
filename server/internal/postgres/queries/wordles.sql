-- name: GetScoreDistribution :many
SELECT score, COUNT(*) AS count
FROM wordle_entries
WHERE user_id = sqlc.arg(user_id)
GROUP BY score
ORDER BY score;

-- name: GetWinningWordleIDs :many
SELECT wordle_id
FROM wordle_entries
WHERE user_id = sqlc.arg(user_id)
  AND score != 'X'
ORDER BY wordle_id DESC;

-- name: GetHeadToHeadMatches :many
SELECT we1.wordle_id, we1.score AS user_score, we2.score AS opponent_score, we1.created_at
FROM wordle_entries we1
JOIN wordle_entries we2 ON we1.wordle_id = we2.wordle_id
WHERE we1.user_id = sqlc.arg(user_id)
  AND we2.user_id = sqlc.arg(opponent_id)
ORDER BY we1.wordle_id DESC;

-- name: GetArchiveList :many
WITH summary AS (
  SELECT
    we.wordle_id,
    COUNT(*)::bigint AS participant_count,
    MIN(CASE WHEN we.score = 'X' THEN 7 ELSE CAST(we.score AS INTEGER) END)::int AS best_score,
    COUNT(*) FILTER (WHERE we.score != 'X')::bigint AS solved_count,
    COUNT(*) FILTER (WHERE we.score = 'X')::bigint AS failed_count
  FROM wordle_entries we
  WHERE (sqlc.arg(before_id)::int = 0 OR we.wordle_id < sqlc.arg(before_id)::int)
  GROUP BY we.wordle_id
)
SELECT
  s.wordle_id,
  s.participant_count,
  COALESCE(viewer.has_played, FALSE)::boolean AS viewer_has_played,
  COALESCE(viewer.score, '')::text AS viewer_score,
  viewer.created_at::timestamp AS viewer_created_at,
  s.best_score,
  COUNT(*) FILTER (
    WHERE CASE WHEN we.score = 'X' THEN 7 ELSE CAST(we.score AS INTEGER) END = s.best_score
  )::bigint AS best_count,
  s.solved_count,
  s.failed_count
FROM summary s
JOIN wordle_entries we ON we.wordle_id = s.wordle_id
LEFT JOIN LATERAL (
  SELECT TRUE::boolean AS has_played, score, created_at
  FROM wordle_entries viewer_entry
  WHERE viewer_entry.wordle_id = s.wordle_id
    AND viewer_entry.user_id = sqlc.arg(user_id)
  LIMIT 1
) AS viewer ON true
GROUP BY
  s.wordle_id,
  s.participant_count,
  viewer.has_played,
  viewer.score,
  viewer.created_at,
  s.best_score,
  s.solved_count,
  s.failed_count
ORDER BY s.wordle_id DESC
LIMIT sqlc.arg(page_limit);

-- name: GetArchiveEntries :many
SELECT user_id, score, raw_input, created_at
FROM wordle_entries
WHERE wordle_id = sqlc.arg(wordle_id);

-- name: EnsureWordle :exec
INSERT INTO wordles (number, created_at, updated_at)
VALUES (
  sqlc.arg(number),
  sqlc.arg(created_at),
  sqlc.arg(updated_at)
)
ON CONFLICT (number) DO NOTHING;

-- name: CreateWordleEntry :one
INSERT INTO wordle_entries (user_id, wordle_id, score, raw_input, created_at, updated_at)
VALUES (
  sqlc.arg(user_id),
  sqlc.arg(wordle_id),
  sqlc.arg(score),
  sqlc.arg(raw_input),
  sqlc.arg(created_at),
  sqlc.arg(updated_at)
)
ON CONFLICT (user_id, wordle_id) DO NOTHING
RETURNING id, wordle_id, score, raw_input, created_at;

-- name: GetSharedWordleIDsForUsers :many
SELECT wordle_id
FROM wordle_entries
WHERE user_id = ANY(sqlc.arg(user_ids)::bigint[])
GROUP BY wordle_id
HAVING COUNT(DISTINCT user_id) = sqlc.arg(user_count)
ORDER BY wordle_id DESC;

-- name: GetUserScoreDistributionForUsers :many
SELECT user_id, score, COUNT(*) AS count
FROM wordle_entries
WHERE user_id = ANY(sqlc.arg(user_ids)::bigint[])
  AND wordle_id = ANY(sqlc.arg(wordle_ids)::int[])
GROUP BY user_id, score;

-- name: GetUserWinningWordleIDsForUsers :many
SELECT user_id, wordle_id
FROM wordle_entries
WHERE user_id = ANY(sqlc.arg(user_ids)::bigint[])
  AND wordle_id = ANY(sqlc.arg(wordle_ids)::int[])
  AND score != 'X'
ORDER BY user_id, wordle_id DESC;
