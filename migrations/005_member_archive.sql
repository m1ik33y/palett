-- Per-person archive for collaborators. Run once on existing DBs.
ALTER TABLE book_members ADD COLUMN arch INTEGER NOT NULL DEFAULT 0;
