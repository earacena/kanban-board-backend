-- Setup schema
CREATE TABLE users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT UNIQUE,
  name TEXT,
  password_hash TEXT,
  date_registered TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
);

select * from users;