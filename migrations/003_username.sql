-- Usernames: unique, case-insensitive. Run once on existing databases.
ALTER TABLE users ADD COLUMN username TEXT;

-- Backfill existing accounts from their display name (spaces -> _, lowercase).
-- If two accounts would collide, the later one gets its row id appended.
UPDATE users SET username =
  lower(replace(name, ' ', '_')) ||
  CASE WHEN EXISTS (
    SELECT 1 FROM users u2
    WHERE lower(replace(u2.name, ' ', '_')) = lower(replace(users.name, ' ', '_')) AND u2.rowid < users.rowid
  ) THEN '_' || rowid ELSE '' END
WHERE username IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username COLLATE NOCASE);
