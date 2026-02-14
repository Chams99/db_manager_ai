const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const sqlPath = path.join(__dirname, 'sample_data.sql');

// Read SQL file
const sql = fs.readFileSync(sqlPath, 'utf8');

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database:', dbPath);
});

// Drop existing tables if they exist (to start fresh)
const dropTables = `
  DROP TABLE IF EXISTS order_items;
  DROP TABLE IF EXISTS orders;
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS users;
`;

db.exec(dropTables, (err) => {
  if (err) {
    console.error('Error dropping tables:', err.message);
    db.close();
    process.exit(1);
  }
  console.log('✅ Dropped existing tables (if any)');
  
  // Now execute the SQL script
  db.exec(sql, (err) => {
  if (err) {
    console.error('Error executing SQL:', err.message);
    db.close();
    process.exit(1);
  }
  console.log('✅ Sample data loaded successfully!');
  
  // Verify by counting records
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) {
      console.error('Error counting users:', err.message);
    } else {
      console.log(`📊 Users table: ${row.count} records`);
    }
    
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
      if (err) {
        console.error('Error counting products:', err.message);
      } else {
        console.log(`📊 Products table: ${row.count} records`);
      }
      
      db.get("SELECT COUNT(*) as count FROM orders", (err, row) => {
        if (err) {
          console.error('Error counting orders:', err.message);
        } else {
          console.log(`📊 Orders table: ${row.count} records`);
        }
        
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed.');
          }
          process.exit(0);
        });
      });
    });
  });
  });
});
