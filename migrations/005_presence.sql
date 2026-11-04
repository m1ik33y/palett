-- Last-seen heartbeat for global online presence.
CREATE TABLE IF NOT EXISTS presence (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_seen INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_presence_last_seen ON presence(last_seen);
