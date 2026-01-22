-- name: CreateContent :one
INSERT INTO content (id, memory_id, content_type, content, created_at, updated_at, content_url, metadata)
VALUES ($1, $2, $3, $4, NOW(), NOW(), $5, $6)
RETURNING *;

-- name: GetContentByMemoryID :many
SELECT * FROM content WHERE memory_id = $1;