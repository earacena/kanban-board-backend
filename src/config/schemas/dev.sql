
-- Setup schema
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE,
  name TEXT,
  password_hash TEXT,
  date_registered TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label TEXT NOT NULL,
  date_created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  column_id uuid NOT NULL,
  brief TEXT NOT NULL,
  body TEXT,
  color TEXT,
  date_created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  board_id uuid NOT NULL,
  label TEXT NOT NULL,
  date_created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_ids uuid array DEFAULT '{}',
  user_id uuid NOT NULL,
  label TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL,
  user_id uuid NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  date_created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- session based auth middleware table
CREATE TABLE "session" (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "session" ("expire");
