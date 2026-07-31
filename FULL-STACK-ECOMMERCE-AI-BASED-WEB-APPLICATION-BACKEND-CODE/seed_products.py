import json, sys, time, urllib.request

BASE = "https://shop-mate-backend.vercel.app/api/v1"
EMAIL = "georgeabiamakadaniel@gmail.com"
PASSWORD = "07060Dan!!"

def post(url, data, headers=None, timeout=90):
    req = urllib.request.Request(url, data=json.dumps(data).encode(), method="POST", headers={"Content-Type": "application/json", **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())

def post_form(url, fields, token, timeout=90):
    boundary = "----seedform"
    parts = []
    for k, v in fields.items():
        parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode())
    parts.append(f"--{boundary}--\r\n".encode())
    body = b"".join(parts)
    req = urllib.request.Request(url, data=body, method="POST", headers={"Content-Type": f"multipart/form-data; boundary={boundary}", "Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())

U = "https://images.unsplash.com/"

products = [
    # Electronics
    ("Ultrabook Pro 15", "Lightweight 15-inch laptop with 16GB RAM, 512GB SSD and all-day battery life.", "1299.99", "Electronics", 14, [U + "photo-1496181133206-80ce9b88a853?w=600"]),
    ("Wireless Noise-Cancelling Headphones", "Premium over-ear headphones with active noise cancelling and 30-hour battery.", "249.99", "Electronics", 32, [U + "photo-1505740420928-5e560c06d30e?w=600"]),
    ("Slim Smartphone X", "6.5-inch OLED display, dual camera, 256GB storage. Only a few left!", "899.99", "Electronics", 4, [U + "photo-1511707171634-5f897ff02aa9?w=600"]),
    # Fashion
    ("Classic Leather Jacket", "Timeless genuine leather jacket with a soft inner lining.", "189.99", "Fashion", 12, [U + "photo-1551028719-00167b16eac5?w=600"]),
    ("Running Sneakers", "Breathable lightweight sneakers built for comfort on every run.", "129.99", "Fashion", 45, [U + "photo-1542291026-7eec264c27ff?w=600"]),
    ("Minimalist Wrist Watch", "Elegant analog watch with stainless steel case and leather strap.", "349.99", "Fashion", 0, [U + "photo-1523275335684-37898b6baf30?w=600"]),
    # Home & Garden
    ("Modern Desk Lamp", "Adjustable LED desk lamp with warm and cool light modes.", "59.99", "Home & Garden", 22, [U + "photo-1507473885765-e6ed057f782c?w=600"]),
    ("Comfort Armchair", "Cozy upholstered armchair, perfect for your living room.", "459.99", "Home & Garden", 8, [U + "photo-1555041469-a586c61ea9bc?w=600"]),
    # Sports
    ("Adjustable Dumbbell Set", "Space-saving adjustable dumbbells from 5kg to 25kg.", "179.99", "Sports", 18, [U + "photo-1517836357463-d25dfeac3438?w=600"]),
    ("Mountain Bike 27.5", "Durable mountain bike with 21-speed gears and disc brakes.", "799.99", "Sports", 5, [U + "photo-1485965120184-e220f721d03e?w=600"]),
    # Books
    ("Bestseller Novel Collection", "Curated set of five international bestsellers in hardcover.", "49.99", "Books", 60, [U + "photo-1512820790803-83ca734da794?w=600"]),
    ("Classic Literature Box Set", "Beautiful boxed collection of timeless classic novels.", "79.99", "Books", 25, [U + "photo-1544716278-ca5e3f4abd8c?w=600"]),
    # Beauty
    ("Luxury Skincare Set", "Complete 4-step skincare routine with natural ingredients.", "119.99", "Beauty", 15, [U + "photo-1596462502278-27bfdc403348?w=600"]),
    ("Designer Eau de Parfum", "Long-lasting signature fragrance with floral notes.", "99.99", "Beauty", 9, [U + "photo-1541643600914-78b084683601?w=600"]),
    # Automotive
    ("Performance Car Wax Kit", "Showroom shine with this premium car care kit.", "39.99", "Automotive", 40, [U + "photo-1503376780353-7e6692767b70?w=600"]),
    ("4K Dashboard Camera", "Full HD front and rear recording with night vision.", "149.99", "Automotive", 11, [U + "photo-1486262715619-67b85e0b08d3?w=600"]),
    # Kids & Baby
    ("Wooden Toy Train Set", "Safe non-toxic wooden train set, 48 pieces.", "69.99", "Kids & Baby", 20, [U + "photo-1558060370-d644479cb6f7?w=600"]),
    ("Soft Teddy Bear XL", "Extra-soft cuddly teddy bear, 60cm tall.", "29.99", "Kids & Baby", 33, [U + "photo-1559454403-b8fb2f76c24a?w=600"]),
]

login = post(f"{BASE}/auth/login", {"email": EMAIL, "password": PASSWORD})
token = login.get("token") or login.get("user", {}).get("token")
print("login ok:", bool(token))

for i, (name, desc, price, category, stock, urls) in enumerate(products):
    body = {
        "name": name, "description": desc, "price": price,
        "category": category, "stock": stock,
        "imageUrls": json.dumps(urls),
    }
    try:
        r = post(f"{BASE}/product/admin/create", body, {"Authorization": f"Bearer {token}"})
        print(f"[{i+1}/{len(products)}] created: {r.get('product', {}).get('name')} ({category})")
    except Exception as e:
        print(f"[{i+1}/{len(products)}] FAILED: {name} => {e}")
        try:
            r = post(f"{BASE}/product/admin/create", body, {"Authorization": f"Bearer {token}"})
            print("  retry ok")
        except Exception as e2:
            print("  retry failed:", e2)
print("DONE")
