-- Only needed if you already ran the first schema.sql. Fresh databases already have this column.
ALTER TABLE sessions ADD COLUMN arch_until INTEGER NOT NULL DEFAULT 0;
