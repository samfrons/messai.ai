-- Create useful PostgreSQL extensions for development
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create a development user with limited privileges
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'messai_dev_user') THEN
        CREATE USER messai_dev_user WITH PASSWORD 'dev_password';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT CONNECT ON DATABASE messai_dev TO messai_dev_user;
GRANT USAGE ON SCHEMA public TO messai_dev_user;
GRANT CREATE ON SCHEMA public TO messai_dev_user;