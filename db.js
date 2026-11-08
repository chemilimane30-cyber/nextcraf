// SQLite connection + schema. The database file lives in ./data and is created on first run.
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'nextcraft.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  role          TEXT NOT NULL CHECK (role IN ('student','trainer','admin')),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_profiles (
  user_id          INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  university       TEXT,
  field_of_study   TEXT,
  year_of_study    TEXT,
  skills           TEXT,            -- JSON array of strings
  preferred_format TEXT
);

CREATE TABLE IF NOT EXISTS trainer_profiles (
  user_id              INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  expertise            TEXT,
  experience           TEXT,
  format               TEXT,
  location             TEXT,
  bio                  TEXT,
  subjects             TEXT,        -- "What courses can you teach?"
  practical_experience TEXT,
  teaching_experience  TEXT,
  cert_name            TEXT,
  cert_issuer          TEXT,
  verification_status  TEXT NOT NULL DEFAULT 'pending'
                       CHECK (verification_status IN ('pending','verified','rejected')),
  reviewed_at          TEXT
);

CREATE TABLE IF NOT EXISTS courses (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  trainer_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  category     TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  learnings    TEXT NOT NULL DEFAULT '',   -- comma-separated takeaways
  level        TEXT NOT NULL DEFAULT 'Beginner',
  duration     TEXT,
  format       TEXT NOT NULL DEFAULT 'Online' CHECK (format IN ('Online','In-person','Both')),
  location     TEXT,
  max_students INTEGER NOT NULL DEFAULT 20,
  price        REAL NOT NULL DEFAULT 0,
  image        TEXT,
  schedule     TEXT,
  status       TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Published','Draft')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS enrollments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress    INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS saved_courses (
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id  INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  saved_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id  INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL,
  reply      TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  replied_at TEXT,
  UNIQUE (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  read_at     TEXT
);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages (sender_id, receiver_id, id);

CREATE TABLE IF NOT EXISTS verification_documents (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  trainer_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL CHECK (kind IN ('certificate','experience','portfolio')),
  file_path     TEXT,               -- stored file name inside ./uploads (null for links)
  original_name TEXT,
  url           TEXT,               -- for portfolio links
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

module.exports = db;
