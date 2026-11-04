-- Usernames (unique, case-insensitive). Run once on existing databases.
ALTER TABLE users ADD COLUMN username TEXT;
-- Backfill existing accounts from the email name; later duplicates get a short id suffix.
UPDATE users SET username = lower(substr(email, 1, instr(email, '@') - 1)) WHERE username IS NULL;
UPDATE users SET username = username || '_' || substr(id, 1, 4)
  WHERE rowid NOT IN (SELECT MIN(rowid) FROM users GROUP BY username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username COLLATE NOCASE);
