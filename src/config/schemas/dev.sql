-- Declare custom types
CREATE TYPE tag AS (
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Setup schema
CREATE TABLE users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT UNIQUE,
  name TEXT,
  password_hash TEXT,
  date_registered TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE boards (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER NOT NULL
  name TEXT NOT NULL,
  label TEXT NOT NULL,
);

CREATE TABLE cards (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  column_id INTEGER NOT NULL,
  brief TEXT NOT NULL,
  body TEXT,
  color TEXT,
  tags tag[]
);

CREATE TABLE columns (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  board_d INTEGER NOT NULL,
);

CREATE TABLE "session" (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "session" ("expire");
