const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./urls.db");

// create table automatically if not exists and migrate clicks column
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      long_url TEXT NOT NULL,
      clicks INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.all("PRAGMA table_info(urls)", (err, rows) => {
    if (err) {
      console.error("DB migration check failed:", err);
      return;
    }

    const hasClicks = rows.some((column) => column.name === "clicks");
    if (!hasClicks) {
      db.run("ALTER TABLE urls ADD COLUMN clicks INTEGER DEFAULT 0", (alterErr) => {
        if (alterErr) {
          console.error("Failed to add clicks column:", alterErr);
        } else {
          console.log("DB migrated: added clicks column to urls table");
        }
      });
    }
  });
});

module.exports = db;
