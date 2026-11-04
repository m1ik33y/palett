-- Latest shared canvas snapshot used by live collaboration.
CREATE TABLE IF NOT EXISTS book_live (
  book_id TEXT PRIMARY KEY NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  state TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
