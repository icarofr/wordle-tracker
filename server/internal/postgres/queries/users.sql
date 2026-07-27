-- name: ListUsers :many
SELECT id, name, avatar
FROM users
ORDER BY id;

-- name: GetUserByID :one
SELECT id, name, avatar
FROM users
WHERE id = sqlc.arg(user_id);
