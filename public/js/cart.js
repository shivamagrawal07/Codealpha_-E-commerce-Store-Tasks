// Cart Logic

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
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Utils.updateAuthUI();

    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem;">Your cart is empty.</p>';
            subtotalEl.textContent = '$0.00';
            totalEl.textContent = '$0.00';
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.5';
            return;
        }

        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div style="text-align: right;">
                    <p class="cart-item-price">$${itemTotal.toFixed(2)}</p>
                    <button class="cart-item-remove" data-index="${index}"><i class="fas fa-trash"></i> Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });

        subtotalEl.textContent = `$${total.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';

        // Add remove listeners
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.dataset.index;
                cart.splice(idx, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
            });
        });
    }

    renderCart();

    // Checkout Process
    checkoutBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            Utils.showToast('Please login to place an order.', 'error');
            setTimeout(() => window.location.href = '/login.html', 1500);
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        checkoutBtn.disabled = true;

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ items: cart, total })
            });

            const data = await res.json();

            if (res.ok) {
                Utils.showToast('Order placed successfully!');
                localStorage.removeItem('cart');
                cart = [];
                renderCart();
            } else {
                Utils.showToast(data.error || 'Failed to place order.', 'error');
            }
        } catch (err) {
            Utils.showToast('Server error. Please try again.', 'error');
        } finally {
            checkoutBtn.innerHTML = 'Proceed to Checkout';
            if(cart.length > 0) checkoutBtn.disabled = false;
        }
    });
});
