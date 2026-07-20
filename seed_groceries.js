const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath);

const baseProducts = [
    { name: 'Bananas', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&q=80' },
    { name: 'Milk', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80' },
    { name: 'Bread', image: 'https://images.unsplash.com/photo-1585478259715-876a6a81fa0b?w=500&q=80' },
    { name: 'Avocados', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&q=80' },
    { name: 'Eggs', image: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=500&q=80' },
    { name: 'Spinach', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&q=80' },
    { name: 'Apples', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=500&q=80' },
    { name: 'Coffee Beans', image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80' },
    { name: 'Olive Oil', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80' },
    { name: 'Carrots', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&q=80' },
    { name: 'Tomatoes', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80' },
    { name: 'Oranges', image: 'https://images.unsplash.com/photo-1611080626919-7152bea23750?w=500&q=80' },
    { name: 'Cheese', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80' },
    { name: 'Chicken Breast', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&q=80' },
    { name: 'Salmon', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80' },
    { name: 'Pasta', image: 'https://images.unsplash.com/photo-1612888983196-173665cd981d?w=500&q=80' },
    { name: 'Honey', image: 'https://images.unsplash.com/photo-1587049352851-8d4e8913475d?w=500&q=80' },
    { name: 'Strawberries', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&q=80' },
    { name: 'Lemons', image: 'https://images.unsplash.com/photo-1590502593747-4229879f758f?w=500&q=80' },
    { name: 'Chocolate', image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&q=80' }
];

const adjectives = ['Organic', 'Premium', 'Local Farm', 'Value Pack', 'Fresh'];

const generateProducts = () => {
    let products = [];
    
    // 20 items * 5 adjectives = 100 unique products
    for (let i = 0; i < baseProducts.length; i++) {
        for (let j = 0; j < adjectives.length; j++) {
            const base = baseProducts[i];
            const adjective = adjectives[j];
            
            // Random price between 1.99 and 15.99
            const price = (Math.random() * (15 - 1) + 1).toFixed(2);
            
            products.push({
                name: `${adjective} ${base.name}`,
                description: `High-quality ${adjective.toLowerCase()} ${base.name.toLowerCase()} sourced for the best taste and nutrition. Perfect for your everyday grocery needs.`,
                price: parseFloat(price),
                image: base.image
            });
        }
    }
    return products;
};

db.serialize(() => {
    // Clear existing products
    db.run('DELETE FROM products');
    
    const products = generateProducts();
    const stmt = db.prepare("INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)");
    
    let count = 0;
    products.forEach(p => {
        stmt.run(p.name, p.description, p.price, p.image, (err) => {
            if (err) console.error(err);
        });
        count++;
    });
    
    stmt.finalize(() => {
        console.log(`Successfully seeded ${count} grocery products with real Unsplash images!`);
        db.close();
    });
});
