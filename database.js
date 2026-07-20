const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize tables
        db.serialize(() => {
            // Users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )`);

            // Products table
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                image TEXT
            )`);

            // Orders table
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                total REAL NOT NULL,
                date TEXT NOT NULL,
                items TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            // Seed products if empty
            db.get("SELECT count(*) AS count FROM products", (err, row) => {
                if (row && row.count === 0) {
                    const products = [
                        { name: 'Organic Bananas', description: 'Fresh, organic bananas packed with potassium.', price: 2.99, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&q=80' },
                        { name: 'Whole Milk', description: 'Gallon of fresh whole milk from local farms.', price: 3.49, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80' },
                        { name: 'Sourdough Bread', description: 'Freshly baked artisanal sourdough bread.', price: 5.99, image: 'https://images.unsplash.com/photo-1585478259715-876a6a81fa0b?w=500&q=80' },
                        { name: 'Avocados', description: 'Perfectly ripe Hass avocados, pack of 4.', price: 4.99, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&q=80' },
                        { name: 'Free-Range Eggs', description: 'Dozen large free-range brown eggs.', price: 4.29, image: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=500&q=80' },
                        { name: 'Fresh Spinach', description: 'Crisp, pre-washed baby spinach leaves.', price: 3.99, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&q=80' },
                        { name: 'Honeycrisp Apples', description: 'Sweet, crisp, and juicy organic apples.', price: 4.49, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=500&q=80' },
                        { name: 'Ground Coffee', description: 'Rich dark roast ground Arabica coffee.', price: 8.99, image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80' },
                        { name: 'Extra Virgin Olive Oil', description: 'Cold-pressed extra virgin olive oil from Italy.', price: 12.99, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80' },
                        { name: 'Organic Carrots', description: 'Freshly picked bunch of sweet organic carrots.', price: 2.49, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&q=80' }
                    ];

                    const stmt = db.prepare("INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)");
                    products.forEach(p => {
                        stmt.run(p.name, p.description, p.price, p.image);
                    });
                    stmt.finalize();
                    console.log('Seeded database with initial products.');
                }
            });
        });
    }
});

module.exports = db;
