from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
import datetime

app = Flask(__name__)
CORS(app)  # Cross Origin Resource Sharing enable karna

# ============================================
# CONFIGURATION & DATABASE (Simple Python Dictionary)
# ============================================

CONFIG = {
    "adminCode": "112233",
    "adminEmails": ["exewebgupta@gmail.com", "phdgamer444@gmail.com"]
}

# In-memory Database (Simple list for demo)
PRODUCTS_DB = [
    {"id": "prod_001", "name": "Luxury Chronograph Watch", "price": 299, "originalPrice": 549, "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "category": "Watches", "isFlash": True, "affiliateLink": "https://earnkaro.com/deals/watch"},
    {"id": "prod_002", "name": "Wireless Headphones Pro", "price": 249, "originalPrice": 399, "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", "category": "Electronics", "isFlash": True, "affiliateLink": "https://earnkaro.com/deals/headphones"},
    {"id": "prod_003", "name": "Designer Leather Handbag", "price": 449, "originalPrice": 899, "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400", "category": "Fashion", "isFlash": True, "affiliateLink": "https://earnkaro.com/deals/bag"},
    {"id": "prod_004", "name": "Smart Fitness Watch", "price": 179, "originalPrice": 299, "image": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400", "category": "Electronics", "isFlash": False, "affiliateLink": "https://earnkaro.com/deals/fitwatch"},
    {"id": "prod_005", "name": "Premium Aviator Sunglasses", "price": 149, "originalPrice": 249, "image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", "category": "Fashion", "isFlash": False, "affiliateLink": "https://earnkaro.com/deals/sunglasses"},
    {"id": "prod_006", "name": "Luxury Perfume Set", "price": 99, "originalPrice": 189, "image": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400", "category": "Beauty", "isFlash": True, "affiliateLink": "https://earnkaro.com/deals/perfume"}
]

ANALYTICS_DATA = {
    "totalClicks": 45678,
    "todayClicks": 234,
    "conversions": 892,
    "revenue": 12500.00
}

# ============================================
# ROUTES (Web Pages)
# ============================================

@app.route('/')
def home():
    """Serve the main HTML page"""
    return render_template('index.html')

# ============================================
# API ENDPOINTS (Backend Logic)
# ============================================

@app.route('/api/products')
def get_products():
    """Return all products or filter by category"""
    category = request.args.get('category')
    if category:
        filtered = [p for p in PRODUCTS_DB if p['category'].lower() == category.lower()]
        return jsonify(filtered)
    return jsonify(PRODUCTS_DB)

@app.route('/api/flash_deals')
def get_flash_deals():
    """Return only flash deal products"""
    deals = [p for p in PRODUCTS_DB if p['isFlash']]
    return jsonify(deals)

@app.route('/api/analytics')
def get_analytics():
    """Return analytics data for admin panel"""
    return jsonify(ANALYTICS_DATA)

@app.route('/api/admin_login', methods=['POST'])
def admin_login():
    """Check admin credentials"""
    data = request.json
    email = data.get('email')
    
    if email in CONFIG['adminEmails']:
        return jsonify({"success": True, "message": "Access Granted"})
    else:
        return jsonify({"success": False, "message": "Unauthorized email"}), 401

@app.route('/api/track_click', methods=['POST'])
def track_click():
    """Track affiliate clicks"""
    ANALYTICS_DATA['totalClicks'] += 1
    ANALYTICS_DATA['todayClicks'] += 1
    return jsonify({"status": "tracked"})

@app.route('/api/add_product', methods=['POST'])
def add_product():
    """Add new product (Admin feature)"""
    data = request.json
    new_product = {
        "id": f"prod_{len(PRODUCTS_DB) + 1}",
        "name": data.get('name'),
        "price": data.get('price'),
        "originalPrice": data.get('originalPrice'),
        "image": data.get('image'),
        "category": data.get('category'),
        "isFlash": data.get('isFlash', False),
        "affiliateLink": data.get('affiliateLink')
    }
    PRODUCTS_DB.append(new_product)
    return jsonify({"success": True, "product": new_product})

# ============================================
# RUN SERVER
# ============================================

if __name__ == '__main__':
    print("Server running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
