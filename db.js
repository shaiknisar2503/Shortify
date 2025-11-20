// db.js
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'shorty.db');
const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_FILE);

// Ensure necessary tables & columns
db.exec(`
CREATE TABLE IF NOT EXISTS ShortUrls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE,
  target_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  click_count INTEGER DEFAULT 0,
  health_status TEXT DEFAULT 'unknown'
);

CREATE TABLE IF NOT EXISTS Clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shorturl_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  FOREIGN KEY(shorturl_id) REFERENCES ShortUrls(id)
);
`);

module.exports = db;
