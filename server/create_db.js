const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Path to the .db file
const dbPath = path.join(__dirname, 'database.db');

// Path to the SQL file
const sqlFilePath = path.join(__dirname, 'sample_data.sql');

// Read the SQL file
const sqlCommands = fs.readFileSync(sqlFilePath, 'utf-8');

// Create and initialize the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    // Execute the SQL commands
    db.exec(sqlCommands, (err) => {
        if (err) {
            console.error('Error executing SQL commands:', err.message);
        } else {
            console.log('Database created and initialized successfully.');
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});