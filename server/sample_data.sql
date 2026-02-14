-- Sample Database Schema and Data for Testing
-- This script creates example tables with sample data

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    age INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample users
INSERT OR IGNORE INTO users (name, email, role, age) VALUES
    ('John Doe', 'john.doe@example.com', 'admin', 30),
    ('Jane Smith', 'jane.smith@example.com', 'user', 25),
    ('Bob Johnson', 'bob.johnson@example.com', 'manager', 35),
    ('Alice Williams', 'alice.williams@example.com', 'user', 28),
    ('Charlie Brown', 'charlie.brown@example.com', 'user', 22);

-- Insert sample products
INSERT OR IGNORE INTO products (name, description, price, stock, category) VALUES
    ('Laptop', 'High-performance laptop', 999.99, 15, 'Electronics'),
    ('Mouse', 'Wireless mouse', 29.99, 50, 'Electronics'),
    ('Keyboard', 'Mechanical keyboard', 79.99, 30, 'Electronics'),
    ('Monitor', '27-inch 4K monitor', 399.99, 10, 'Electronics'),
    ('Headphones', 'Noise-cancelling headphones', 199.99, 25, 'Electronics'),
    ('Desk Chair', 'Ergonomic office chair', 299.99, 8, 'Furniture'),
    ('Desk', 'Standing desk', 499.99, 5, 'Furniture');

-- Insert sample orders
INSERT INTO orders (user_id, total, status) VALUES
    (1, 1029.98, 'completed'),
    (2, 229.98, 'pending'),
    (3, 599.98, 'completed'),
    (4, 79.99, 'pending'),
    (1, 199.99, 'completed');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
    (1, 1, 1, 999.99),  -- Order 1: 1 Laptop
    (1, 2, 1, 29.99),   -- Order 1: 1 Mouse
    (2, 3, 1, 79.99),   -- Order 2: 1 Keyboard
    (2, 2, 5, 29.99),   -- Order 2: 5 Mice
    (3, 4, 1, 399.99),  -- Order 3: 1 Monitor
    (3, 2, 2, 29.99),  -- Order 3: 2 Mice
    (4, 3, 1, 79.99),  -- Order 4: 1 Keyboard
    (5, 5, 1, 199.99); -- Order 5: 1 Headphones
