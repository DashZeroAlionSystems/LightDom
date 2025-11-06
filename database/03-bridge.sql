-- Wrapper for bridge schema ordering
INSERT INTO schema_migrations(filename)
VALUES ('03-bridge.sql')
ON CONFLICT (filename) DO NOTHING;

