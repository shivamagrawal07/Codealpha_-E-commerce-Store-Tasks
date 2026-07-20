// Common Utilities
const Utils = {
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
        toast.innerHTML = `${icon} ${message}`;
        
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    updateAuthUI() {
        const authLinks = document.getElementById('auth-links');
        if (!authLinks) return;

        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            const user = JSON.parse(userStr);
            authLinks.innerHTML = `
                <span style="color: var(--text-secondary); margin-right: 1rem;">Hi, ${user.name}</span>
                <a href="#" id="logout-btn" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Logout</a>
            `;
            
            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
            });
        }
    },

    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (!badge) return;

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    },

    addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartBadge();
        this.showToast(`${product.name} added to cart!`);
    }
};

// Main App Logic for index.html and product.html
document.addEventListener('DOMContentLoaded', () => {
    Utils.updateAuthUI();
    Utils.updateCartBadge();

    // Home Page - Load Products
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        fetch('/api/products')
            .then(res => res.json())
            .then(products => {
                productsGrid.innerHTML = '';
                if (products.length === 0) {
                    productsGrid.innerHTML = '<p>No products found.</p>';
                    return;
                }

                products.forEach(product => {
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.innerHTML = `
                        <a href="/product.html?id=${product.id}" class="product-image-container">
                            <img src="${product.image}" alt="${product.name}" class="product-image">
                        </a>
                        <div class="product-info">
                            <a href="/product.html?id=${product.id}">
                                <h3 class="product-title">${product.name}</h3>
                            </a>
                            <p class="product-price">$${product.price.toFixed(2)}</p>
                            <p class="product-desc">${product.description.substring(0, 60)}...</p>
                            <button class="btn btn-primary add-to-cart-btn" style="width: 100%;">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                        </div>
                    `;

                    const addBtn = card.querySelector('.add-to-cart-btn');
                    addBtn.addEventListener('click', () => Utils.addToCart(product));

                    productsGrid.appendChild(card);
                });
            })
            .catch(err => {
                productsGrid.innerHTML = '<p class="toast error">Failed to load products.</p>';
                console.error(err);
            });
    }

    // Product Detail Page
    const detailContainer = document.getElementById('product-detail-container');
    if (detailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            detailContainer.innerHTML = '<h2>Product not found</h2>';
            return;
        }

        fetch(`/api/products/${productId}`)
            .then(res => {
                if (!res.ok) throw new Error('Product not found');
                return res.json();
            })
            .then(product => {
                detailContainer.innerHTML = `
                    <div class="product-detail-layout">
                        <img src="${product.image}" alt="${product.name}" class="detail-image">
                        <div>
                            <h1 style="font-size: 3rem; margin-bottom: 1rem;">${product.name}</h1>
                            <p class="product-price" style="font-size: 2.5rem; margin-bottom: 2rem;">$${product.price.toFixed(2)}</p>
                            <p style="color: var(--text-secondary); font-size: 1.1rem; line-height: 1.8; margin-bottom: 3rem;">
                                ${product.description}
                            </p>
                            <button id="detail-add-cart" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.25rem;">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                `;

                document.getElementById('detail-add-cart').addEventListener('click', () => {
                    Utils.addToCart(product);
                });
            })
            .catch(err => {
                detailContainer.innerHTML = '<h2>Product not found</h2>';
                console.error(err);
            });
    }
});
