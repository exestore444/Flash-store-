// static/js/script.py.js

// Configuration for Python Backend
const API_URL = 'http://127.0.0.1:5000/api';

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    setupScrollEffect();
    setupObserver();
    startCountdown();
    
    // Load data from Python Backend
    loadFlashDealsFromServer();
    loadCategoriesFromServer();
});

// ============================================
// SERVER COMMUNICATION (Fetch API)
// ============================================
async function loadFlashDealsFromServer() {
    try {
        const response = await fetch(`${API_URL}/flash_deals`);
        const products = await response.json();
        renderProducts(products, 'flashDealsGrid');
        
        // Update stats
        document.getElementById('statProducts').textContent = products.length + "+";
    } catch (error) {
        console.error("Python Server Error:", error);
        document.getElementById('flashDealsGrid').innerHTML = '<p class="loading-text" style="color:red;">Server not running? Start app.py</p>';
    }
}

async function loadCategoriesFromServer() {
    // Using static data for categories for now, but can be API driven
    const categories = [
        { name: 'Electronics', icon: 'fa-laptop', count: 12500 },
        { name: 'Fashion', icon: 'fa-tshirt', count: 8900 },
        { name: 'Watches', icon: 'fa-clock', count: 3200 },
        { name: 'Beauty', icon: 'fa-spa', count: 6700 }
    ];
    renderCategories(categories);
}

async function searchServer(query) {
    const container = document.getElementById('searchResultsContainer');
    container.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const response = await fetch(`${API_URL}/products?category=${query}`);
        const products = await response.json();
        displayResults(products, query);
    } catch (error) {
        container.innerHTML = '<p style="color:red; text-align:center;">Error connecting to Python Server</p>';
    }
}

async function checkApi() {
    try {
        const response = await fetch(`${API_URL}/analytics`);
        const data = await response.json();
        showToast(`API Live! Revenue: $${data.revenue}`);
    } catch (error) {
        showToast('Server Offline. Run app.py');
    }
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = products.map(p => createCard(p)).join('');
}

function renderCategories(categories) {
    const container = document.getElementById('categoryGrid');
    if (!container) return;
    container.innerHTML = categories.map(c => `
        <div class="category-card" onclick="searchCategory('${c.name}')">
            <div class="category-icon"><i class="fas ${c.icon}"></i></div>
            <div class="category-name">${c.name}</div>
            <div class="category-count">${c.count.toLocaleString()} items</div>
        </div>
    `).join('');
}

function createCard(product) {
    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
    return `
        <div class="product-card fade-in visible">
            <div class="product-image-wrap">
                <div class="product-badges">
                    ${product.isFlash ? '<span class="badge badge-flash"><i class="fas fa-bolt"></i> Flash</span>' : ''}
                    ${discount > 0 ? `<span class="badge badge-discount">-${discount}%</span>` : ''}
                </div>
                <button class="product-wishlist" onclick="toggleWishlist('${product.id}', this)"><i class="far fa-heart"></i></button>
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price-row">
                    <span class="price-current">$${product.price}</span>
                    ${product.originalPrice ? `<span class="price-original">$${product.originalPrice}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-buy" onclick="buyProduct('${product.affiliateLink}')"><i class="fas fa-shopping-bag"></i> Buy Now</button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// NAVIGATION & ACTIONS
// ============================================
function handleSearchKey(e) { if (e.key === 'Enter') executeSearch(); }

function executeSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (query === '112233') { openAdminLogin(); return; }
    if (!query) return;
    
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('flashSection').style.display = 'none';
    document.getElementById('categoriesSection').style.display = 'none';
    document.getElementById('searchResults').style.display = 'block';
    
    searchServer(query);
}

function displayResults(results, query) {
    const container = document.getElementById('searchResultsContainer');
    document.getElementById('searchCount').textContent = `Found ${results.length} products for "${query}"`;
    if (results.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-search empty-icon"></i><h3>No products found in Database</h3></div>';
        return;
    }
    container.innerHTML = `<div class="product-grid">${results.map(p => createCard(p)).join('')}</div>`;
}

function searchCategory(cat) {
    document.getElementById('searchInput').value = cat;
    executeSearch();
}

function navigateHome() {
    document.getElementById('heroSection').style.display = 'block';
    document.getElementById('flashSection').style.display = 'block';
    document.getElementById('categoriesSection').style.display = 'block';
    document.getElementById('searchResults').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showFlashDeals() { document.getElementById('flashSection').scrollIntoView({ behavior: 'smooth' }); }
function showCategories() { document.getElementById('categoriesSection').scrollIntoView({ behavior: 'smooth' }); }

function buyProduct(link) {
    trackClickServer();
    window.open(link, '_blank');
    showToast('Redirecting...');
}

async function trackClickServer() {
    try { await fetch(`${API_URL}/track_click`, { method: 'POST' }); } 
    catch (e) { console.log("Tracking failed"); }
}

function toggleWishlist(id, btn) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
    showToast(btn.classList.contains('active') ? 'Added!' : 'Removed');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastText').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

// ============================================
// ADMIN PANEL (Connects to Python)
// ============================================
function openAdminLogin() {
    const overlay = document.getElementById('adminOverlay');
    const body = document.getElementById('adminBody');
    body.innerHTML = `
        <div class="admin-login">
            <div class="admin-login-icon"><i class="fas fa-python"></i></div>
            <h2>Python Admin</h2>
            <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" id="adminEmail"></div>
            <button class="btn btn-primary" style="width:100%" onclick="attemptLogin()">Login via API</button>
        </div>
    `;
    overlay.classList.add('active');
}

async function attemptLogin() {
    const email = document.getElementById('adminEmail').value;
    showToast('Verifying with Python Server...');
    
    try {
        const response = await fetch(`${API_URL}/admin_login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        const data = await response.json();
        
        if (data.success) {
            showToast('Login Successful!');
            loadAdminDashboard();
        } else {
            showToast('Login Failed');
        }
    } catch (e) {
        showToast('Server Error');
    }
}

async function loadAdminDashboard() {
    const body = document.getElementById('adminBody');
    body.innerHTML = '<div class="loading-spinner"></div>';
    
    const response = await fetch(`${API_URL}/analytics`);
    const data = await response.json();
    
    body.innerHTML = `
        <div class="analytics-grid">
            <div class="analytics-card"><div class="analytics-value">${data.totalClicks}</div><div class="analytics-label">Total Clicks</div></div>
            <div class="analytics-card"><div class="analytics-value">$${data.revenue}</div><div class="analytics-label">Revenue</div></div>
        </div>
    `;
}

function closeAdmin() { document.getElementById('adminOverlay').classList.remove('active'); }

// ============================================
// PARTICLES & VISUALS (Same as before)
// ============================================
function createParticles() {
    const container = document.getElementById('particlesContainer');
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 25 + 's';
        container.appendChild(p);
    }
}
function setupScrollEffect() { window.addEventListener('scroll', () => { const header = document.getElementById('header'); if (window.scrollY > 50) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }); }
function setupObserver() { const obs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }); }, { threshold: 0.1 }); document.querySelectorAll('.fade-in').forEach(el => obs.observe(el)); }
function startCountdown() { setInterval(() => { const h = document.getElementById('hours'), m = document.getElementById('minutes'), s = document.getElementById('seconds'); if(s) s.textContent = Math.floor(Math.random() * 60); }, 1000); }

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAdmin(); });
document.getElementById('adminOverlay').addEventListener('click', e => { if (e.target === document.getElementById('adminOverlay')) closeAdmin(); });
