-- Example role & user creation script for per-developer credentials
-- Run this as a superuser (e.g., postgres) then share only your own user/password.
-- Adjust usernames to match each developer.

-- Developer 1
create role dev_alice login password 'CHANGE_ME_ALICE';
-- Developer 2
create role dev_bob login password 'CHANGE_ME_BOB';

-- Create database if not exists
create database lastmile;

-- Grant privileges on database
grant all privileges on database lastmile to dev_alice;
grant all privileges on database lastmile to dev_bob;

-- Connect to lastmile to grant schema/table privileges (psql: \c lastmile)
-- Then run:
-- grant usage on schema public to dev_alice;
-- grant usage on schema public to dev_bob;
-- grant all privileges on all tables in schema public to dev_alice;
-- grant all privileges on all tables in schema public to dev_bob;
-- alter default privileges in schema public grant all on tables to dev_alice;
-- alter default privileges in schema public grant all on tables to dev_bob;

-- Rotate passwords periodically and avoid committing real passwords.
