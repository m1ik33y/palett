-- Run once on existing DBs.

-- Collaboration
CREATE TABLE IF NOT EXISTS book_members (
  book_id     TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at    INTEGER NOT NULL,
  PRIMARY KEY (book_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_members_user ON book_members(user_id);

CREATE TABLE IF NOT EXISTS book_live (
  book_id     TEXT PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
  client_id   TEXT NOT NULL,
  state       TEXT NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS presence (
  user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  last_seen   INTEGER NOT NULL
);
