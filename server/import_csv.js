const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { parse } = require('csv-parse');

// Path to the .db file
const dbPath = path.join(__dirname, 'database.db');

// Path to the CSV file
const csvFilePath = path.join(__dirname, 'mnist_784.csv');

// Open the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database.');
});

// Enhanced error handling and debugging logs
function importCSV() {
    const parser = fs.createReadStream(csvFilePath).pipe(
        parse({
            columns: true, // Use the first row as column headers
            skip_empty_lines: true, // Skip empty lines
            relax_quotes: true, // Handle improperly escaped quotes
            relax_column_count: true, // Allow rows with mismatched column counts
        })
    );

    db.serialize(() => {
        let columns;

        parser.on('readable', () => {
            let record;
            while ((record = parser.read())) {
                if (!columns) {
                    // Extract column names from the first record
                    columns = Object.keys(record);

                    // Drop the existing table if it exists
                    db.run(`DROP TABLE IF EXISTS case_files`, (err) => {
                        if (err) {
                            console.error('Error dropping table:', err.message);
                        }
                    });

                    // Create the table dynamically based on the CSV header
                    const createTableQuery = `CREATE TABLE case_files (${columns.map((col) => `${col} TEXT`).join(', ')});`;
                    console.log('Create Table Query:', createTableQuery); // Debugging log

                    db.run(createTableQuery, (err) => {
                        if (err) {
                            console.error('Error creating table:', err.message);
                            process.exit(1); // Stop the script if table creation fails
                        }
                    });
                }

                // Insert data into the table
                const placeholders = columns.map(() => '?').join(', ');
                const insertQuery = `INSERT INTO case_files (${columns.join(', ')}) VALUES (${placeholders});`;
                const values = columns.map((col) => record[col] || null); // Use null for missing values

                console.log('Insert Query:', insertQuery); // Debugging log
                console.log('Values:', values); // Debugging log

                db.run(insertQuery, values, (err) => {
                    if (err) {
                        console.error('Error inserting data:', err.message, 'Row:', record);
                    }
                });
            }
        });

        parser.on('end', () => {
            console.log('CSV data imported successfully.');
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed.');
                }
            });
        });

        parser.on('error', (err) => {
            console.error('Error parsing CSV file:', err.message);
        });
    });
}

importCSV();