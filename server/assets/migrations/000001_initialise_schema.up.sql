-- Initial schema: consolidated from Elixir/Phoenix migrations.
-- Uses IF NOT EXISTS so it's safe to run against an existing database.

-- Drop Ecto's schema_migrations table ONLY if it has Ecto's schema
-- (inserted_at column). This preserves golang-migrate's own table
-- (which has version + dirty columns) on fresh databases.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schema_migrations' AND column_name = 'inserted_at'
  ) THEN
    DROP TABLE schema_migrations;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified_at TIMESTAMP,
    avatar VARCHAR(255) NOT NULL DEFAULT '01',
    inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_index ON users (email);

CREATE TABLE IF NOT EXISTS user_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token BYTEA NOT NULL,
    context VARCHAR(255) NOT NULL,
    sent_to VARCHAR(255),
    inserted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_tokens_user_id_index ON user_tokens (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS user_tokens_context_token_index ON user_tokens (context, token);

CREATE TABLE IF NOT EXISTS wordles (
    number INTEGER PRIMARY KEY,
    solution VARCHAR(5),
    word VARCHAR(5),
    inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wordle_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    wordle_id INTEGER NOT NULL REFERENCES wordles (number) ON DELETE CASCADE,
    score VARCHAR(255) NOT NULL,
    raw_input TEXT,
    inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS wordle_entries_user_id_wordle_id_index ON wordle_entries (user_id, wordle_id);
CREATE INDEX IF NOT EXISTS wordle_entries_user_id_index ON wordle_entries (user_id);
CREATE INDEX IF NOT EXISTS wordle_entries_wordle_id_index ON wordle_entries (wordle_id);
