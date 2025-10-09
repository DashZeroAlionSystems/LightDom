-- Wrapper for optimization schema ordering
INSERT INTO schema_migrations(name) VALUES ('02-optimization')
ON CONFLICT (name) DO NOTHING;

