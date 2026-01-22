-- name: CreateRefreshToken :one
INSERT INTO refresh_tokens (token, user_id, created_at, expires_at)
VALUES ($1, $2, NOW(), $3)
RETURNING *;

-- name: GetRefreshTokenByToken :one
SELECT * FROM refresh_tokens WHERE token = $1;