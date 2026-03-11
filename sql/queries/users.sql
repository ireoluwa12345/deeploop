-- name: CreateUser :one
INSERT INTO users (id, email, password, name, created_at, updated_at)
VALUES (
    $1, $2, $3, $4, NOW(), NOW()
) 
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: UpdateUserProfile :one
UPDATE users SET name = $2, profile_image = $3, updated_at = NOW()
WHERE id = $1
RETURNING *;