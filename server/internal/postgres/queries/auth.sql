-- name: GetCredentialsByEmail :one
SELECT id, name, email, password_hash, avatar
FROM users
WHERE email = sqlc.arg(email);

-- name: GetSessionByToken :one
SELECT u.id, u.name, u.email, u.avatar
FROM users u
JOIN user_tokens t ON t.user_id = u.id
WHERE t.token = sqlc.arg(token)
  AND t.sent_to = u.email
  AND (
    (t.context = 'api-token-short' AND t.created_at > sqlc.arg(short_cutoff))
    OR (t.context = 'api-token-long' AND t.created_at > sqlc.arg(long_cutoff))
  );

-- name: CreateUser :one
INSERT INTO users (name, email, password_hash, avatar, created_at, updated_at)
VALUES (
  sqlc.arg(name),
  sqlc.arg(email),
  sqlc.arg(password_hash),
  '01',
  sqlc.arg(created_at),
  sqlc.arg(updated_at)
)
RETURNING id, name, email, avatar;

-- name: CreateToken :exec
INSERT INTO user_tokens (user_id, token, context, sent_to, created_at)
VALUES (
  sqlc.arg(user_id),
  sqlc.arg(token),
  sqlc.arg(token_context),
  sqlc.arg(sent_to),
  sqlc.arg(created_at)
);

-- name: DeleteToken :exec
DELETE FROM user_tokens
WHERE token = sqlc.arg(token)
  AND context IN ('api-token-long', 'api-token-short', 'api-token');

-- name: UpdateAvatar :one
UPDATE users
SET avatar = sqlc.arg(avatar), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(user_id)
RETURNING id, name, email, avatar;
