-- Run once on existing databases (also included in schema.sql)
CREATE TABLE IF NOT EXISTS book_members (
  book_id   TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at  INTEGER NOT NULL,
  PRIMARY KEY (book_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_members_user ON book_members(user_id);
