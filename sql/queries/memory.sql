-- name: GetMemoryByUserID :one
SELECT * FROM memory WHERE user_id = $1;

-- name: GetMemoryByUserIDAndDate :one
SELECT * FROM memory WHERE user_id = $1 AND date = $2;

-- name: CreateMemory :one
INSERT INTO memory (id, user_id, date, created_at, updated_at)
VALUES ($1, $2, $3, NOW(), NOW())
RETURNING *;