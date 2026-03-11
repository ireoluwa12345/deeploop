-- name: GetMemoryByUserID :one
SELECT * FROM memory WHERE user_id = $1;

-- name: GetMemoryByUserIDAndDate :one
SELECT * FROM memory WHERE user_id = $1 AND date = $2;

-- name: CreateMemory :one
INSERT INTO memory (id, user_id, date, created_at, updated_at)
VALUES ($1, $2, $3, NOW(), NOW())
RETURNING *;

-- name: GetMemoryDatesByMonth :many
SELECT date FROM memory
WHERE user_id = $1
  AND date >= $2
  AND date < $3;

-- name: GetTotalContentCountByUserID :one
SELECT COUNT(*) FROM content
JOIN memory ON content.memory_id = memory.id
WHERE memory.user_id = $1;

-- name: GetAllMemoryDatesByUserID :many
SELECT DISTINCT date FROM memory
WHERE user_id = $1
ORDER BY date DESC;