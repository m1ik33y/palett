-- Profile pictures. Run once on existing DBs (fresh databases from schema.sql already have the column).
ALTER TABLE users ADD COLUMN avatar TEXT;
