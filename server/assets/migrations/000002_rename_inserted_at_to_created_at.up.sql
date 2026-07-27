-- Rename Ecto's inserted_at convention to the standard created_at.
-- The updated_at columns already use standard naming.

ALTER TABLE users RENAME COLUMN inserted_at TO created_at;
ALTER TABLE user_tokens RENAME COLUMN inserted_at TO created_at;
ALTER TABLE wordles RENAME COLUMN inserted_at TO created_at;
ALTER TABLE wordle_entries RENAME COLUMN inserted_at TO created_at;
