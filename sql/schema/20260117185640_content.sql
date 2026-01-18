-- +goose Up
-- +goose StatementBegin
CREATE TYPE content_type AS ENUM ('audio', 'image', 'text');
CREATE TABLE content (
    id UUID PRIMARY KEY,
    memory_id UUID NOT NULL,
    content_type content_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    content_url TEXT,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL,

    FOREIGN KEY (memory_id) REFERENCES memory(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS content;
DROP TYPE IF EXISTS content_type;
-- +goose StatementEnd
