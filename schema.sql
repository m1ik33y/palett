-- Palett D1 schema. Safe to re-run (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  username    TEXT,                       -- unique login name (see idx_users_username)
  name        TEXT NOT NULL,
  pw_hash     TEXT NOT NULL,              -- pbkdf2$iterations$salt$hash
  theme       TEXT NOT NULL DEFAULT 'dark',
  tree_open   INTEGER NOT NULL DEFAULT 0,
  arch_hash   TEXT,                       -- bcrypt hash of the "secret folder" password (nullable until set)
  created_at  INTEGER NOT NULL,
  agreed_at   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,           -- SHA-256 of the cookie token (the raw token is never stored)
  arch_until  INTEGER NOT NULL DEFAULT 0, -- archive unlocked for this session until (ms epoch); 0 = locked
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exp  ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS books (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  title       TEXT NOT NULL DEFAULT '',
  fav         INTEGER NOT NULL DEFAULT 0,
  arch        INTEGER NOT NULL DEFAULT 0,
  w           INTEGER NOT NULL,
  h           INTEGER NOT NULL,
  scroll      INTEGER NOT NULL DEFAULT 0,
  thumb       TEXT NOT NULL DEFAULT '',
  size        INTEGER NOT NULL DEFAULT 0, -- length of the saved payload JSON
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id, updated_at DESC);

-- D1 rows are limited to 2 MB, so each paintbook's JSON is split into chunks.
CREATE TABLE IF NOT EXISTS book_chunks (
  book_id     TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  idx         INTEGER NOT NULL,
  data        TEXT NOT NULL,
  PRIMARY KEY (book_id, idx)
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key         TEXT PRIMARY KEY,
  count       INTEGER NOT NULL,
  reset_at    INTEGER NOT NULL
);

-- Collaboration: people invited to a paintbook
CREATE TABLE IF NOT EXISTS book_members (
  book_id   TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at  INTEGER NOT NULL,
  PRIMARY KEY (book_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_members_user ON book_members(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username COLLATE NOCASE);
