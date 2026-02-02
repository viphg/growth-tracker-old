-- Growth Tracker Database Creation Script
-- This script creates the database

-- Connect to the default postgres database first
\c postgres

-- Create the growth_tracker database if it doesn't exist
SELECT 'CREATE DATABASE growth_tracker' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'growth_tracker');

-- Create extensions in the postgres database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Display success message
SELECT 'Database creation completed successfully!' as status;