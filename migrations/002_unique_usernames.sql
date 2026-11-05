-- Make usernames unique (case-insensitive). Run once on existing DBs.
-- Rename later duplicates first so the unique index can be created.
UPDATE users SET name = name || '_' || substr(id, 1, 4)
 WHERE rowid NOT IN (SELECT MIN(rowid) FROM users GROUP BY lower(name));
ALTER TABLE users ADD COLUMN name_lc TEXT;
UPDATE users SET name_lc = lower(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_name_lc ON users(name_lc);
