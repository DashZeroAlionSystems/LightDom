-- Wrapper for bridge schema ordering
INSERT INTO schema_migrations(name) VALUES ('03-bridge')
ON CONFLICT (name) DO NOTHING;

