ALTER TABLE users RENAME COLUMN created_at TO inserted_at;
ALTER TABLE user_tokens RENAME COLUMN created_at TO inserted_at;
ALTER TABLE wordles RENAME COLUMN created_at TO inserted_at;
ALTER TABLE wordle_entries RENAME COLUMN created_at TO inserted_at;
ALTER TABLE whatsapp_messages RENAME COLUMN created_at TO inserted_at;
