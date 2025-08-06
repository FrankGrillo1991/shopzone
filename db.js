const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/messages.db');

db.serialize(() => {
    // Create messages table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        reply TEXT
    )`);
});