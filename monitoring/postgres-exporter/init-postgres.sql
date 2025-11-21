-- PostgreSQL initialization script for observability
-- Required configurations for postgres-exporter

-- Enable pg_stat_statements extension for query tracking
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create specific user for monitoring (safer option)
-- For now we'll use the existing root user, but in production
-- it's recommended to create a specific user with limited permissions
-- CREATE USER postgres_exporter WITH PASSWORD 'exporter_password';

-- Grant necessary permissions for monitoring user
-- GRANT CONNECT ON DATABASE "connvertpay-db" TO postgres_exporter;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres_exporter;
-- GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres_exporter;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres_exporter;

-- Views to facilitate access to metrics (using root user)
-- View for user table statistics
CREATE OR REPLACE VIEW monitoring_table_stats AS
SELECT
    schemaname,
    tablename,
    n_tup_ins as total_inserts,
    n_tup_upd as total_updates,
    n_tup_del as total_deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    vacuum_count,
    autovacuum_count,
    analyze_count,
    autoanalyze_count
FROM pg_stat_user_tables;

-- View for index statistics
CREATE OR REPLACE VIEW monitoring_index_stats AS
SELECT
    schemaname,
    tablename,
    indexrelname as index_name,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes;

-- View for connection and transaction statistics per database
CREATE OR REPLACE VIEW monitoring_database_stats AS
SELECT
    datname as database_name,
    numbackends as active_connections,
    xact_commit as committed_transactions,
    xact_rollback as rolled_back_transactions,
    blks_read as disk_blocks_read,
    blks_hit as buffer_blocks_hit,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted,
    conflicts,
    temp_files,
    temp_bytes,
    deadlocks,
    blk_read_time,
    blk_write_time,
    stats_reset
FROM pg_stat_database
WHERE
    datname = 'connvertpay-db';

-- Function to get table sizes
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
    schema_name text,
    table_name text,
    table_size_bytes bigint,
    total_size_bytes bigint,
    index_size_bytes bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.schemaname::text,
        t.tablename::text,
        pg_relation_size(t.schemaname||'.'||t.tablename)::bigint,
        pg_total_relation_size(t.schemaname||'.'||t.tablename)::bigint,
        (pg_total_relation_size(t.schemaname||'.'||t.tablename) - pg_relation_size(t.schemaname||'.'||t.tablename))::bigint
    FROM pg_tables t
    WHERE t.schemaname NOT IN ('information_schema', 'pg_catalog');
END;
$$ LANGUAGE plpgsql;

-- Grant permissions on views and functions to root user (which will be used by exporter)
GRANT SELECT ON monitoring_table_stats TO root;

GRANT SELECT ON monitoring_index_stats TO root;

GRANT SELECT ON monitoring_database_stats TO root;

GRANT EXECUTE ON FUNCTION get_table_sizes () TO root;

-- Configure statistics collection
-- This is already done in postgres command, but we ensure it here as well
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

ALTER SYSTEM SET pg_stat_statements.track = 'all';

ALTER SYSTEM SET pg_stat_statements.max = 10000;

-- Initialization log
INSERT INTO
    pg_stat_statements_info (total_exec_time)
VALUES (0) ON CONFLICT DO NOTHING;

-- Confirm that extensions were created
SELECT 'Extensões instaladas:' as status;

SELECT extname, extversion
FROM pg_extension
WHERE
    extname IN ('pg_stat_statements');

-- Final confirmation log
DO $$ BEGIN RAISE NOTICE 'PostgreSQL monitoring configurations applied successfully!';

RAISE NOTICE 'pg_stat_statements enabled: %',
(
    SELECT count(*) > 0
    FROM pg_extension
    WHERE
        extname = 'pg_stat_statements'
);

RAISE NOTICE 'Monitoring views created: monitoring_table_stats, monitoring_index_stats, monitoring_database_stats';

RAISE NOTICE 'Function get_table_sizes() created successfully';

END $$;