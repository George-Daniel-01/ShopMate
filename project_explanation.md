# ShopMate — Full Architecture & Deep Code Explanation

## 1. OVERALL ARCHITECTURE

This project has **3 separate apps** that all work together:

```
┌─────────────────────────────┐     ┌──────────────────────┐
│   FRONTEND (Customer App)   │     │  ADMIN DASHBOARD     │
│   React + Vite + Redux      │     │  React + Vite + Redux│
│   Runs on :5173             │     │  Runs on :5174       │
└──────────┬──────────────────┘     └─────────┬────────────┘
           │ HTTP requests (axios)             │ HTTP requests
           ▼                                   ▼
┌──────────────────────────────────────────────────────────┐
│              BACKEND (Express.js + PostgreSQL)            │
│              Runs on :4000                                │
│              API base: /api/v1                            │
│              Routes: /auth, /product, /order, /admin      │
└──────────────────────────────────────────────────────────┘
```

**W3Schools Concepts**:
- [What is a REST API](https://www.w3schools.com/whatis/whatis_api.asp)
- [Client-Server Architecture](https://www.w3schools.com/whatis/whatis_clientserver.asp)

The **backend** (`FULL-STACK-ECOMMERCE-AI-BASED-WEB-APPLICATION-BACKEND-CODE/`) is the central brain. It connects to a **Neon PostgreSQL** database (cloud-hosted). Both the customer frontend and admin dashboard send HTTP requests to the same backend API.

---

## 2. BACKEND — DATABASE SETUP

### 2a. Database Connection (`database/db.ts`)

```typescript
import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

export const database = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const connectDB = async (): Promise<void> => {
  try {
    await database.query("SELECT 1");
    console.log("Connected to Neon PostgreSQL successfully");
  } catch (error) {
    console.error("DB connection failed:", error);
    throw error;
  }
};
```

**What this does**: Creates a **connection pool** to Neon PostgreSQL. A "pool" means multiple connections are kept alive so the app doesn't create a new one for every request (fast performance).

**What is Pool?** A pool holds a group of reusable database connections. Instead of connecting/disconnecting each time, you grab one from the pool.

**How it connects**: Reads `DATABASE_URL` from `config/config.env`. That URL looks like: `postgresql://user:password@host/database?sslmode=require`

**W3Schools Reference**:
- [Node.js MySQL (same concept as PostgreSQL)](https://www.w3schools.com/nodejs/nodejs_mysql.asp)
- [PostgreSQL Tutorial](https://www.w3schools.com/postgresql/index.php)

### 2b. Table Creation (`utils/createTables.ts`)

This function `createTables()` runs all table-creation files in order:

```typescript
export const createTables = async (): Promise<void> => {
  await createUserTable();        // users
  await createProductsTable();    // products
  await createProductReviewsTable(); // reviews
  await createOrdersTable();      // orders
  await createOrderItemTable();   // order_items
  await createShippingInfoTable();// shipping_info
  await createPaymentsTable();    // payments
};
```

This is called when the server starts, so tables exist before any request comes in.

### 2c. The 7 Database Tables

#### **users** (`models/userTable.ts`)
```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL CHECK (char_length(name) >= 3),
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(10) DEFAULT 'User' CHECK (role IN ('User', 'Admin')),
    avatar JSONB DEFAULT NULL,
    reset_password_token TEXT DEFAULT NULL,
    reset_password_expire TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Purpose |
|--------|---------|
| `id` | UUID primary key (auto-generated) |
| `name` | User's display name (min 3 chars) |
| `email` | Must be unique |
| `password` | Hashed with bcrypt (never plaintext!) |
| `role` | `'User'` or `'Admin'` — controls access |
| `avatar` | JSON object `{url, public_id}` for Cloudinary |
| `reset_password_token` | Hashed token for password reset flow |
| `reset_password_expire` | Expiration timestamp for reset token |
| `created_at` | Auto-set timestamp |

**Key concepts**:
- `UUID` = Universally Unique Identifier (like a really long random ID)
- `JSONB` = PostgreSQL's JSON type (store objects directly)
- `CHECK` = constraint/validation rule
- `DEFAULT` = default value if not provided

**W3Schools**: [SQL Constraints](https://www.w3schools.com/sql/sql_constraints.asp), [PostgreSQL Data Types](https://www.w3schools.com/postgresql/postgresql_datatypes.php)

#### **products** (`models/productTable.ts`)
```sql
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(7,2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    ratings DECIMAL(3,2) DEFAULT 0 CHECK (ratings BETWEEN 0 AND 5),
    images JSONB DEFAULT '[]'::JSONB,
    stock INT NOT NULL CHECK (stock >= 0),
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

**What is FOREIGN KEY?** It means `created_by` must reference an existing user's `id`. `ON DELETE CASCADE` means if the user is deleted, their products are also deleted.

**JSONB DEFAULT '[]'::JSONB** = stores an array of image objects `[{url, public_id}]`.

#### **reviews** (`models/productReviewsTable.ts`)
```sql
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    user_id UUID NOT NULL,
    rating DECIMAL(3,2) NOT NULL CHECK (rating BETWEEN 0 AND 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose**: Each user can review a product they've purchased. One review per user per product.

#### **orders** (`models/ordersTable.ts`)
```sql
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID NOT NULL,
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    tax_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    order_status VARCHAR(20) DEFAULT 'Processing'
        CHECK (order_status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')),
    paid_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Status flow**: `Processing` → `Shipped` → `Delivered` (or `Cancelled`)

#### **order_items** (`models/orderItemsTable.ts`)
```sql
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    image TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

**Why separate table?** An order can have multiple products. Each product is a row in `order_items`, linked to the same `order_id`.

#### **shipping_info** (`models/shippinginfoTable.ts`)
```sql
CREATE TABLE IF NOT EXISTS shipping_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

**1-to-1 with orders**: Each order has exactly one shipping address.

#### **payments** (`models/paymentsTable.ts`)
```sql
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL UNIQUE,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('Online')),
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('Paid', 'Pending', 'Failed')),
    payment_intent_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

**Stripe integration**: `payment_intent_id` stores Stripe's payment intent ID.

---

### **How Tables Connect (Relationships Diagram)**

```
users ──< orders ──< order_items >── products
  │        │             │
  │        └── shipping_info (1-to-1)
  │        └── payments (1-to-1)
  │
  └──< reviews >── products
  │
  └──< products (created_by)
```

**Type of relationships**:
- `users` **1-to-many** `orders` (one user, many orders)
- `orders` **1-to-1** `shipping_info`
- `orders` **1-to-many** `order_items`
- `products` **1-to-many** `order_items`
- `users` **1-to-many** `reviews`
- `products` **1-to-many** `reviews`

**W3Schools**: [SQL Joins](https://www.w3schools.com/sql/sql_join.asp), [SQL Foreign Key](https://www.w3schools.com/sql/sql_foreign_key.asp), [SQL Relationships](https://www.w3schools.com/sql/sql_relationship.asp)

---

## 3. BACKEND — EXPRESS SERVER SETUP

### 3a. Server Entry Point (`server.ts`)

```typescript
import dotenv from "dotenv";
dotenv.config({ path: "./FULL-STACK-ECOMMERCE-AI-BASED-WEB-APPLICATION-BACKEND-CODE/config/config.env" });

import { connectDB } from "./database/db.js";
import app from "./app.js";
import { v2 as cloudinary } from "cloudinary";
import { createTables } from "./utils/createTables.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

// Only listen when running locally, NOT on Vercel
if (process.env.VERCEL !== "1") {
  const start = async (): Promise<void> => {
    await connectDB();
    await createTables();
    app.listen(process.env.PORT || 4000, () => {
      console.log("Server running on port " + (process.env.PORT || 4000));
    });
  };
  start();
} else {
  // On Vercel: init DB and tables without listening
  connectDB().then(() => createTables());
}

export default app;
```

**What happens when server starts**:
1. Load environment variables from `config.env`
2. Configure Cloudinary (image uploads)
3. Connect to Neon PostgreSQL database
4. Create all 7 tables (if they don't exist)
5. Start Express server on port 4000
6. On Vercel (serverless): export `app` without listening

### 3b. Express App (`app.ts`)

```typescript
import express, { Request, Response } from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";
import Stripe from "stripe";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import authRouter from "./router/authRoutes.js";
import productRouter from "./router/productRoutes.js";
import adminRouter from "./router/adminRoutes.js";
import orderRouter from "./router/orderRoutes.js";
import { database } from "./database/db.js";

config({ path: "./FULL-STACK-ECOMMERCE-AI-BASED-WEB-APPLICATION-BACKEND-CODE/config/config.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

const app = express();

const allowedOrigins = [
  "https://shop-mate-six-azure.vercel.app",
  "https://shop-dashboard-tan.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Stripe webhook needs RAW body (before express.json() parses it)
app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;
    try {
      event = Stripe.webhooks.constructEvent(
        req.body as Buffer, sig, process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${(error as Error).message}`);
      return;
    }
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const clientSecret = paymentIntent.client_secret;
      try {
        const paymentResult = await database.query(
          `UPDATE payments SET payment_status = $1 WHERE payment_intent_id = $2 RETURNING *`,
          ["Paid", clientSecret]
        );
        const orderId = paymentResult.rows[0].order_id as string;
        await database.query(`UPDATE orders SET paid_at = NOW() WHERE id = $1`, [orderId]);
        const { rows: orderedItems } = await database.query(
          `SELECT product_id, quantity FROM order_items WHERE order_id = $1`, [orderId]
        );
        for (const item of orderedItems) {
          await database.query(`UPDATE products SET stock = stock - $1 WHERE id = $2`,
            [item.quantity, item.product_id]);
        }
      } catch {
        res.status(500).send("Error updating payment/order records.");
        return;
      }
    }
    res.status(200).send({ received: true });
  }
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
  limits: { fileSize: 10 * 1024 * 1024 },
  abortOnLimit: true
}));

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/order", orderRouter);

app.use(errorMiddleware);

export default app;
```

**Key Middleware in Order**:
1. `cors()` — Allows frontend apps from different origins to call the API
2. Stripe Webhook (BEFORE json parser!) — Needs raw body to verify signature
3. `cookieParser()` — Parse cookies from requests (for JWT token)
4. `express.json()` — Parse JSON request bodies
5. `express.urlencoded()` — Parse form data
6. `fileUpload()` — Handle file uploads (product images, avatars)
7. Route handlers
8. `errorMiddleware()` — Catch and format all errors

**W3Schools**: [Express.js Tutorial](https://www.w3schools.com/nodejs/nodejs_express.asp), [CORS](https://www.w3schools.com/nodejs/nodejs_cors.asp)

---

## 4. BACKEND — AUTH SYSTEM

### 4a. Auth Routes (`router/authRoutes.ts`)

```typescript
router.post("/register", register);              // Create account
router.post("/register-admin", registerAdmin);   // Create admin (needs secret key)
router.post("/login", login);                    // Sign in
router.get("/me", isAuthenticated, getUser);     // Get current user
router.get("/logout", isAuthenticated, logout);  // Sign out
router.post("/password/forgot", forgotPassword); // Send reset email
router.put("/password/reset/:token", resetPassword);// Reset password with token
router.put("/password/update", isAuthenticated, updatePassword); // Change password
router.put("/profile/update", isAuthenticated, updateProfile); // Update profile
```

### 4b. Auth Controller (`controllers/authController.ts`)

#### Register (`register`)

```typescript
export const register = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body;
    // 1. Validate: all fields required, password 8-16 chars
    if (!name || !email || !password)
      return next(new ErrorHandler("Please provide all required fields.", 400));
    if (password.length < 8 || password.length > 16)
      return next(new ErrorHandler("Password must be between 8 and 16 characters.", 400));
    // 2. Check if email already exists
    const existing = await database.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (existing.rows.length > 0)
      return next(new ErrorHandler("User already registered with this email.", 400));
    // 3. Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    // 4. Insert into database
    const user = await database.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );
    // 5. Send JWT token in response + cookie
    sendToken(user.rows[0], 201, "User registered successfully", res);
  }
);
```

**Flow**: Validate → Check duplicate → Hash password → Save to DB → Return JWT

#### Login (`login`)

```typescript
export const login = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    // 1. Validate
    if (!email || !password) return next(new ErrorHandler("...", 400));
    // 2. Find user by email
    const user = await database.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (user.rows.length === 0) return next(new ErrorHandler("Invalid email or password.", 401));
    // 3. Compare password with bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isPasswordMatch) return next(new ErrorHandler("Invalid email or password.", 401));
    // 4. Send JWT token
    sendToken(user.rows[0], 200, "Logged In.", res);
  }
);
```

**Flow**: Validate → Find user → Compare password → Return JWT

#### JWT Token Generation (`utils/jwtToken.ts`)

```typescript
export const sendToken = (user, statusCode, message, res) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,  // e.g., "7d"
  });
  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
      httpOnly: true,  // Cannot be accessed by JavaScript (security!)
      secure: true,    // Only sent over HTTPS
      sameSite: "none", // Works across different origins
    })
    .json({ success: true, user, message, token });
};
```

**What is JWT?** JSON Web Token — a signed string that proves identity. It contains `{id: user.id}` and is signed with a secret key. Anyone with the token can prove they are that user.

**Cookie vs LocalStorage**: The token is sent BOTH as an httpOnly cookie (automatically sent with requests) AND in the JSON body (frontend can store in localStorage for Authorization header).

#### Password Reset Flow

```
1. User clicks "Forgot Password" → enters email
2. Backend generates reset token (random 20 bytes)
3. Backend hashes the token, stores in DB (reset_password_token)
4. Backend emails user a link: /password/reset/UNHASHED_TOKEN
5. User clicks link → frontend opens reset form
6. User enters new password → sends to backend with token
7. Backend hashes the token from URL, finds matching DB record
8. If token valid + not expired → update password
```

**W3Schools**: [JWT Authentication](https://www.w3schools.com/nodejs/nodejs_jwt.asp), [bcrypt](https://www.w3schools.com/nodejs/nodejs_bcrypt.asp)

### 4c. Auth Middleware (`middlewares/authMiddleware.ts`)

```typescript
export const isAuthenticated = catchAsyncErrors(
  async (req, _res, next) => {
    // Get token from cookie OR Authorization header
    const token = req.cookies?.token ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token) return next(new ErrorHandler("Please login to access this resource.", 401));

    // Verify JWT signature and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Get user from database
    const user = await database.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [decoded.id]);
    if (user.rows.length === 0) return next(new ErrorHandler("User not found.", 404));

    // Attach user to request object
    req.user = user.rows[0];
    next();
  }
);

export const authorizedRoles = (...roles: string[]) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role: ${req.user.role} is not allowed.`, 403));
    }
    next();
  };
};
```

**Usage pattern**: Routes that require login use `isAuthenticated`. Routes that require admin role add `authorizedRoles("Admin")` after it.

**Error handlers used**:
- `catchAsyncErrors` — Wraps async functions to catch errors automatically
- `ErrorHandler` — Custom error class with status code + message
- `errorMiddleware` — Catches all errors and sends JSON response

**W3Schools**: [Express Middleware](https://www.w3schools.com/nodejs/nodejs_express_middleware.asp)

---

## 5. BACKEND — PRODUCT CONTROLLER

### 5a. Product Routes (`router/productRoutes.ts`)

```typescript
router.post("/admin/create", isAuthenticated, authorizedRoles("Admin"), createProduct);
router.get("/", fetchAllProducts);
router.get("/singleProduct/:productId", fetchSingleProduct);
router.put("/post-new/review/:productId", isAuthenticated, postProductReview);
router.delete("/delete/review/:productId", isAuthenticated, deleteReview);
router.put("/admin/update/:productId", isAuthenticated, authorizedRoles("Admin"), updateProduct);
router.delete("/admin/delete/:productId", isAuthenticated, authorizedRoles("Admin"), deleteProduct);
```

**Public routes**: `GET /` (list products), `GET /singleProduct/:id` (product details)
**Protected routes**: Create/update/delete require Admin role

### 5b. Create Product (`createProduct`)

```typescript
export const createProduct = catchAsyncErrors(async (req, res, next) => {
  // 1. Get fields from body
  const { name, description, price, category, stock } = req.body;
  const created_by = req.user.id; // from auth middleware

  // 2. Upload images to Cloudinary
  const uploadedImages = [];
  if (req.files?.images) {
    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "Ecommerce_Product_Images",
        width: 1000, crop: "scale",
      });
      uploadedImages.push({ url: result.secure_url, public_id: result.public_id });
    }
  }
  if (uploadedImages.length === 0) uploadedImages.push(DEFAULT_IMAGE);

  // 3. Insert product into database
  const product = await database.query(
    `INSERT INTO products (name, description, price, category, stock, images, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, description, parseFloat(price), category, stock, JSON.stringify(uploadedImages), created_by]
  );

  res.status(201).json({ success: true, message: "Product created successfully.", product });
});
```

**Image upload flow**:
1. Admin uploads images via form
2. `express-fileupload` saves to temp directory
3. Cloudinary uploads from temp file
4. Cloudinary returns `{secure_url, public_id}`
5. Images array stored in `products.images` as JSON

### 5c. Fetch Products with Filters (`fetchAllProducts`)

```typescript
export const fetchAllProducts = catchAsyncErrors(async (req, res) => {
  const { availability, price, category, ratings, search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Build dynamic WHERE clause
  const conditions = [];
  const values = [];
  // ... add conditions based on query params

  // Get total count
  const totalProductsResult = await database.query(
    `SELECT COUNT(*) FROM products p ${whereClause}`, values
  );
  const totalProducts = parseInt(totalProductsResult.rows[0].count);

  // Get paginated products with review count
  const result = await database.query(
    `SELECT p.*, COUNT(r.id) AS review_count
     FROM products p LEFT JOIN reviews r ON p.id = r.product_id
     ${whereClause}
     GROUP BY p.id
     ORDER BY p.created_at DESC
     LIMIT $X OFFSET $Y`, values
  );

  // Also fetch new products (last 30 days) and top rated (>= 4.5)
  res.status(200).json({
    products: result.rows,
    totalProducts,
    newProducts,
    topRatedProducts,
  });
});
```

**Dynamic query building**: The WHERE clause changes based on what filters the user selects. This prevents SQL injection by using parameterized queries (`$1, $2`).

**W3Schools**: [SQL Injection](https://www.w3schools.com/sql/sql_injection.asp), [Node.js MySQL WHERE](https://www.w3schools.com/nodejs/nodejs_mysql_where.asp)

### 5d. Reviews System

- **Post review**: User must have purchased + received the product. Checks order_items + order status = "Delivered"
- **Update review**: If user already reviewed, update instead of insert
- **Delete review**: Remove review, recalculate product rating average
- **Rating calculation**: `AVG(rating)` from all reviews → update `products.ratings`

---

## 6. BACKEND — ORDER CONTROLLER

### 6a. Order Routes (`router/orderRoutes.ts`)

```typescript
router.post("/new", isAuthenticated, placeNewOrder);
router.get("/orders/me", isAuthenticated, fetchMyOrders);
router.get("/admin/getall", isAuthenticated, authorizedRoles("Admin"), fetchAllOrders);
router.put("/admin/update/:orderId", isAuthenticated, authorizedRoles("Admin"), updateOrderStatus);
router.delete("/admin/delete/:orderId", isAuthenticated, authorizedRoles("Admin"), deleteOrder);
router.get("/:orderId", isAuthenticated, fetchSingleOrder);
```

### 6b. Place Order (`placeNewOrder`)

```typescript
export const placeNewOrder = catchAsyncErrors(async (req, res, next) => {
  // 1. Get shipping details + cart items from body
  const { full_name, state, city, country, address, pincode, phone, orderedItems } = req.body;

  // 2. Validate stock availability for each item
  const { rows: products } = await database.query(
    `SELECT id, price, stock, name FROM products WHERE id = ANY($1::uuid[])`, [productIds]
  );

  // 3. Calculate prices
  let total_price = 0;
  // For each item: total_price += product.price * quantity
  const tax_price = 0.18;  // 18% tax
  const shipping_price = total_price >= 50 ? 0 : 2;
  total_price = total_price + total_price * tax_price + shipping_price;

  // 4. Create order record
  const orderResult = await database.query(
    `INSERT INTO orders (buyer_id, total_price, tax_price, shipping_price) VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.user.id, total_price, tax_price, shipping_price]
  );

  // 5. Create order_items records
  await database.query(
    `INSERT INTO order_items (order_id, product_id, quantity, price, image, title) VALUES ...`
  );

  // 6. Create shipping_info record
  await database.query(
    `INSERT INTO shipping_info (order_id, full_name, state, ...) VALUES (...)`
  );

  // 7. Generate Stripe payment intent
  const paymentResponse = await generatePaymentIntent(orderId, total_price);

  res.status(200).json({
    success: true,
    orderId,
    paymentIntent: paymentResponse.clientSecret,  // For frontend Stripe
    total_price,
  });
});
```

**Flow**: Validate cart → Calculate pricing → Insert order → Insert items → Insert shipping → Get Stripe payment intent → Return client secret

### 6c. Stripe Payment Integration (`utils/generatePaymentIntent.ts`)

```typescript
export async function generatePaymentIntent(orderId, totalPrice) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100,  // Stripe uses cents
      currency: "usd",
    });
    await database.query(
      "INSERT INTO payments (order_id, payment_type, payment_status, payment_intent_id) VALUES ($1, $2, $3, $4)",
      [orderId, "Online", "Pending", paymentIntent.client_secret]
    );
    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (error) {
    return { success: false, message: "Payment Failed." };
  }
}
```

### 6d. Stripe Webhook (in `app.ts`)

The webhook is called by Stripe when payment succeeds. It must use `express.raw()` (before `express.json()`) to get the raw body for signature verification.

```typescript
app.post("/api/v1/payment/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  // 1. Verify webhook signature
  const event = Stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  // 2. If payment succeeded:
  if (event.type === "payment_intent.succeeded") {
    // Update payment status to "Paid"
    // Update order set paid_at = NOW()
    // Decrease product stock for each ordered item
  }
});
```

**W3Schools**: [Stripe Payment](https://www.w3schools.com/nodejs/nodejs_stripe.asp)

### 6e. Fetch Orders with Joins

```sql
SELECT o.*,
  json_agg(json_build_object(
    'order_item_id', oi.id, 'product_id', oi.product_id,
    'quantity', oi.quantity, 'price', oi.price, 'image', oi.image, 'title', oi.title
  )) AS order_items,
  json_build_object(
    'full_name', s.full_name, 'state', s.state, 'city', s.city,
    'address', s.address, 'pincode', s.pincode, 'phone', s.phone
  ) AS shipping_info
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN shipping_info s ON o.id = s.order_id
WHERE o.id = $1
GROUP BY o.id, s.id
```

**What this does**: Gets an order with all its items and shipping info in ONE query using SQL joins. Returns a nested JSON structure.

**W3Schools**: [SQL JOIN](https://www.w3schools.com/sql/sql_join.asp), [SQL GROUP BY](https://www.w3schools.com/sql/sql_groupby.asp)

---

## 7. BACKEND — ADMIN CONTROLLER

### 7a. Admin Routes (`router/adminRoutes.ts`)

```typescript
router.get("/getallusers", isAuthenticated, authorizedRoles("Admin"), getAllUsers);
router.delete("/delete/:id", isAuthenticated, authorizedRoles("Admin"), deleteUser);
router.get("/fetch/dashboard-stats", isAuthenticated, authorizedRoles("Admin"), dashboardStats);
```

All admin routes require **authentication + "Admin" role**.

### 7b. Get All Users (`getAllUsers`)

```typescript
export const getAllUsers = catchAsyncErrors(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * 10;

  const totalUsersResult = await database.query(
    "SELECT COUNT(*) FROM users WHERE role = $1", ["User"]
  );
  const totalUsers = parseInt(totalUsersResult.rows[0].count);

  const users = await database.query(
    "SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    ["User", 10, offset]
  );

  res.json({ success: true, totalUsers, currentPage: page, users: users.rows });
});
```

**Purpose**: Returns paginated list of regular users (not admins).

### 7c. Dashboard Stats (`dashboardStats`)

This is the most complex query — it calculates ALL dashboard metrics in a single request:

```typescript
export const dashboardStats = catchAsyncErrors(async (_req, res) => {
  // 1. Total revenue all time
  // 2. Today's revenue
  // 3. Yesterday's revenue
  // 4. Total user count
  // 5. Order status counts (Processing, Shipped, Delivered, Cancelled)
  // 6. Monthly sales (for chart)
  // 7. Top 5 selling products
  // 8. Current month sales
  // 9. Low stock products (stock <= 5)
  // 10. Revenue growth (% compared to last month)
  // 11. New users this month
});
```

**Each query independently fetches different stats**. The controller runs ~11 separate queries and combines them into one JSON response.

---

## 8. FRONTEND (Customer App)

### 8a. Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Home/          # Hero slider, category grid, product sliders
│   │   ├── Layout/        # Navbar, sidebar, cart sidebar, search, profile, login
│   │   ├── Products/      # ProductCard, Pagination, ReviewsContainer
│   │   └── PaymentForm.tsx
│   ├── contexts/          # ThemeContext (dark/light mode)
│   ├── data/              # Static data (categories)
│   ├── lib/               # Axios instance
│   ├── pages/             # Home, Products, ProductDetail, Cart, Orders, etc.
│   ├── store/
│   │   ├── slices/        # Redux slices (auth, cart, order, popup, product)
│   │   ├── hooks.ts       # Typed hooks (useAppDispatch, useAppSelector)
│   │   └── store.ts       # Redux store configuration
│   └── types/             # TypeScript interfaces
├── App.tsx                # Root component with routing
├── index.css              # Global styles + Tailwind
└── main.tsx               # Entry point
```

**Tech Stack**: React 18 + TypeScript + Vite + Redux Toolkit + Tailwind CSS + React Router

### 8b. Axios Instance (`lib/axios.ts`)

```typescript
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
  withCredentials: false,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**How frontend talks to backend**: Every API call goes through this axios instance. The `Authorization` header is automatically added from localStorage token.

**Key difference from backend's axios**: Frontend uses `Authorization` header (not cookies) because `withCredentials: false`.

### 8c. Redux Store Configuration (`store/store.ts`)

```typescript
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import popupReducer from "./slices/popupSlice";
import cartReducer from "./slices/cartSlice";
import productReducer from "./slices/productSlice";
import orderReducer from "./slices/orderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    popup: popupReducer,
    cart: cartReducer,
    product: productReducer,
    order: orderReducer,
  },
});
```

**5 slices**:
| Slice | Purpose |
|-------|---------|
| `auth` | User login/register/logout state |
| `popup` | UI toggles (sidebar, cart, search, auth modal) |
| `cart` | Shopping cart items |
| `product` | Product list, details, reviews |
| `order` | Order flow, payment |

### 8d. Auth Slice (Frontend) (`store/slices/authSlice.ts`)

Uses **Redux Toolkit's `createAsyncThunk`** for all API calls:

```typescript
export const login = createAsyncThunk<User, Record<string, string>>(
  "auth/login",
  async (data, thunkAPI) => {
    const res = await axiosInstance.post("/auth/login", data);
    toast.success(res.data.message);
    localStorage.setItem("token", res.data.token);  // Save JWT
    return res.data.user as User;
  }
);

export const getUser = createAsyncThunk<User>("auth/getUser", async (_, thunkAPI) => {
  const res = await axiosInstance.get("/auth/me");
  return res.data.user as User;
});
```

**Flow**: Dispatch `login()` → Redux sends POST to backend → Backend validates → Returns user + token → Redux saves token to localStorage + user to state.

### 8e. Product Slice (Frontend)

```typescript
export const fetchAllProducts = createAsyncThunk(
  "product/fetchAll",
  async ({ availability, price, category, ratings, search, page }) => {
    const params = new URLSearchParams();
    // Build query string from filters
    const res = await axiosInstance.get(`/product?${params.toString()}`);
    return res.data; // {products, totalProducts, newProducts, topRatedProducts}
  }
);
```

**Frontend sends filter params** → Backend builds dynamic SQL → Returns filtered + paginated results.

### 8f. Authentication Flow (LoginModal)

```
User clicks login → LoginModal opens
User enters email/password → dispatch(login({email, password}))
  → axiosInstance.post("/auth/login", data)
  → Backend validates credentials, returns JWT + user
  → Redux stores user in state, localStorage stores token
  → Modal closes, user is logged in
```

### 8g. Product Listing Flow (Products page)

```
Page loads → dispatch(fetchAllProducts({page: 1}))
  → axiosInstance.get("/product?page=1")
  → Backend queries PostgreSQL with filters + pagination
  → Returns products array + totalProducts
  → Redux updates state → UI re-renders with product cards
User changes filter → Re-dispatch with new params → Re-query backend
```

### 8h. Cart Flow

```
User clicks "Add to Cart" → dispatch(addToCart({product, quantity: 1}))
  → Redux updates cart state (client-side only, no API call)
  → Cart badge updates (navbar shows count)
  → CartSidebar shows items
User adjusts quantity → dispatch(updateCartQuantity({id, quantity}))
User removes item → dispatch(removeFromCart(id))
Checkout → Navigate to /payment
```

**Cart is entirely client-side**. No backend API for cart — it's stored in Redux state only.

### 8i. Order + Payment Flow

```
/Payment page:
  Step 1: Fill shipping details → dispatch(placeOrder(formData))
    → POST /order/new with shipping + cart items
    → Backend creates order + order_items + shipping_info + Stripe payment intent
    → Returns {orderId, paymentIntent, total_price}
    → Redux advances to Step 2

  Step 2: Stripe CardElement form
    → User enters card details
    → stripe.confirmCardPayment(clientSecret, {card: cardElement})
    → Stripe processes payment
    → Stripe calls backend webhook on success
    → Webhook updates payment_status = 'Paid', order.paid_at = NOW()
```

### 8j. App.tsx — Root Component

```typescript
const App = () => {
  // Check if user is authenticated on app load
  useEffect(() => { dispatch(getUser()); }, [dispatch]);

  // Fetch initial products
  useEffect(() => { dispatch(fetchAllProducts({})); }, [dispatch]);

  if (isCheckingAuth) return <Loader />;  // Show spinner while checking

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />           {/* Always visible */}
        <Sidebar />          {/* Toggle via hamburger */}
        <SearchOverlay />    {/* Toggle via search icon */}
        <CartSidebar />      {/* Toggle via cart icon */}
        <ProfilePanel />     {/* Toggle via user icon (when logged in) */}
        <LoginModal />       {/* Toggle via user icon (when logged out) */}
        <Routes>...</Routes>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  );
};
```

---

## 9. ADMIN DASHBOARD

### 9a. Structure

```
ecommerce-dashboard-template/
├── src/
│   ├── components/
│   │   ├── dashboard-components/  # Charts: MiniSummary, MonthlySalesChart, etc.
│   │   ├── Dashboard.tsx          # Main dashboard with stats
│   │   ├── Header.tsx             # Top bar
│   │   ├── Orders.tsx             # Order management
│   │   ├── Products.tsx           # Product CRUD
│   │   ├── Profile.tsx            # Admin profile
│   │   ├── SideBar.tsx            # Navigation sidebar
│   │   └── Users.tsx              # User management
│   ├── modals/                    # CreateProductModal, UpdateProductModal, ViewProductModal
│   ├── pages/                     # Login, ForgotPassword, ResetPassword
│   ├── store/slices/              # adminSlice, authSlice, extraSlice, orderSlice, productsSlice
│   ├── lib/                       # Axios instance + helpers
│   └── types/                     # TypeScript interfaces
```

### 9b. How Admin Dashboard Connects to Backend

Same backend API, same routes, but admin has additional endpoints:

```typescript
// Admin-specific API calls (from adminSlice.ts)
axiosInstance.get("/admin/getallusers?page=1")         // Get users
axiosInstance.delete("/admin/delete/:id")              // Delete user
axiosInstance.get("/admin/fetch/dashboard-stats")       // Get all stats

// Product management (from productsSlice.ts)
axiosInstance.post("/product/admin/create", data)       // Create product
axiosInstance.put("/product/admin/update/:id", data)    // Update product
axiosInstance.delete("/product/admin/delete/:id")       // Delete product

// Order management (from orderSlice.ts)
axiosInstance.get("/order/admin/getall")                // Get all orders
axiosInstance.put("/order/admin/update/:id", {status}) // Update order status
axiosInstance.delete("/order/admin/delete/:id")         // Delete order
```

**All these routes require**: `isAuthenticated` + `authorizedRoles("Admin")`

### 9c. Admin Auth Flow

```typescript
// adminSlice.ts
export const login = (data: FormData) => async (dispatch: AppDispatch) => {
  dispatch(loginRequest());
  const res = await axiosInstance.post("/auth/login", data);
  if (res.data.user.role === "Admin") {
    localStorage.setItem("token", res.data.token);
    dispatch(loginSuccess(res.data.user));
  } else {
    toast.error("Access denied. Admins only.");
  }
};
```

**Difference from customer app**: Admin app explicitly checks `role === "Admin"` after login. If the user is a regular customer, they cannot access the dashboard.

---

## 10. HOW ALL 3 PARTS CONNECT (END-TO-END FLOWS)

### Flow 1: Customer Buys a Product

```
1. CUSTOMER APP (frontend:5173)
   ├── User browses products (GET /product)
   ├── Adds to cart (Redux state only, no API)
   ├── Goes to /payment
   ├── Fills shipping info
   ├── Clicks "Continue to Payment"
   │
   ▼
2. BACKEND (express:4000)
   ├── POST /order/new
   │   ├── Creates order in DB
   │   ├── Creates order_items
   │   ├── Creates shipping_info
   │   ├── Creates Stripe payment intent
   │   └── Returns clientSecret
   │
   ▼
3. CUSTOMER APP (frontend)
   ├── Stripe CardElement form appears
   ├── User enters card details
   ├── Clicks "Complete Payment"
   │
   ▼
4. STRIPE
   ├── stripe.confirmCardPayment(clientSecret, card)
   ├── Processes payment
   ├── Sends webhook to backend
   │
   ▼
5. BACKEND WEBHOOK
   ├── Verifies webhook signature
   ├── Updates payments.status = 'Paid'
   ├── Updates orders.paid_at = NOW()
   ├── Decreases product stock
   │
   ▼
6. CUSTOMER APP
   ├── Redirects to / (home)
   └── User can view order in /orders
```

### Flow 2: Admin Manages Products

```
1. ADMIN DASHBOARD (frontend:5174)
   ├── Admin logs in
   │   └── POST /auth/login (with admin credentials)
   │
   ├── Views product list
   │   └── GET /product?page=1 (same endpoint as customer!)
   │
   ├── Creates product
   │   └── POST /product/admin/create (with images)
   │
   ├── Updates product
   │   └── PUT /product/admin/update/:id
   │
   └── Deletes product
       └── DELETE /product/admin/delete/:id
```

### Flow 3: Admin Views Dashboard Stats

```
1. ADMIN DASHBOARD
   └── GET /admin/fetch/dashboard-stats
       │
       ▼
2. BACKEND
   ├── Runs 11 separate SQL queries
   │   ├── SUM(total_price) for all-time revenue
   │   ├── Today's revenue (WHERE created_at::date = today)
   │   ├── Yesterday's revenue
   │   ├── COUNT users WHERE role = 'User'
   │   ├── GROUP BY order_status for status counts
   │   ├── Monthly sales (GROUP BY month)
   │   ├── Top 5 selling products
   │   ├── Current month sales
   │   ├── Low stock products (stock <= 5)
   │   ├── Revenue growth %
   │   └── New users this month
   │
   └── Returns JSON with all stats
       │
       ▼
3. ADMIN DASHBOARD
   └── Renders charts:
       ├── MonthlySalesChart (bar chart)
       ├── OrdersChart (pie chart for status)
       ├── TopSellingProducts (table)
       ├── MiniSummary (cards: revenue, users, orders)
       └── Stats (growth %, low stock count)
```

---

## 11. W3SCHOOLS TOPIC REFERENCE SUMMARY

| Concept | W3Schools Link |
|---------|---------------|
| HTML/CSS | [HTML Tutorial](https://www.w3schools.com/html/) |
| JavaScript | [JS Tutorial](https://www.w3schools.com/js/) |
| TypeScript | [TS Tutorial](https://www.w3schools.com/typescript/) |
| React | [React Tutorial](https://www.w3schools.com/react/) |
| Node.js | [Node.js Tutorial](https://www.w3schools.com/nodejs/) |
| Express.js | [Express Tutorial](https://www.w3schools.com/nodejs/nodejs_express.asp) |
| SQL/PostgreSQL | [SQL Tutorial](https://www.w3schools.com/sql/) |
| SQL JOINs | [SQL JOIN](https://www.w3schools.com/sql/sql_join.asp) |
| SQL GROUP BY | [SQL GROUP BY](https://www.w3schools.com/sql/sql_groupby.asp) |
| SQL FOREIGN KEY | [SQL FOREIGN KEY](https://www.w3schools.com/sql/sql_foreignkey.asp) |
| SQL Constraints | [SQL Constraints](https://www.w3schools.com/sql/sql_constraints.asp) |
| JWT Auth | [JWT](https://www.w3schools.com/nodejs/nodejs_jwt.asp) |
| bcrypt (password hashing) | [bcrypt](https://www.w3schools.com/nodejs/nodejs_bcrypt.asp) |
| CORS | [CORS](https://www.w3schools.com/nodejs/nodejs_cors.asp) |
| Stripe Payment | [Stripe](https://www.w3schools.com/nodejs/nodejs_stripe.asp) |
| REST API | [REST API](https://www.w3schools.com/whatis/whatis_api.asp) |
| Client-Server | [Client-Server](https://www.w3schools.com/whatis/whatis_clientserver.asp) |
| Promises/Async | [JS Async](https://www.w3schools.com/js/js_async.asp) |
| Redux | [Redux Tutorial](https://www.w3schools.com/react/react_redux.asp) |
| Tailwind CSS | [Tailwind](https://www.w3schools.com/tailwind/) |
| Environment Variables (.env) | [dotenv](https://www.w3schools.com/nodejs/nodejs_env.asp) |

---

## 12. TESTING FLOW (How to Test Each Feature)

### Test Auth
```
1. Start backend: node server.ts (runs on :4000)
2. Start frontend: npm run dev (runs on :5173)
3. Open browser to :5173
4. Click user icon → Login modal opens
5. Click "Sign up" → Enter name, email, password → Submit
6. Check backend logs: INSERT INTO users successful?
7. Check browser: localStorage has "token"? User is logged in?
8. Logout → Login again with same credentials → Works?
```

### Test Products
```
1. Login as admin in admin dashboard (:5174)
2. Click Products → Click "Create Product"
3. Fill form, upload image → Submit
4. Check backend: POST /product/admin/create
5. Check database: products table has new row?
6. Open customer app (:5173) → See product in list?
```

### Test Orders
```
1. Login as customer (:5173)
2. Add product to cart
3. Go to /payment → Fill shipping → Submit
4. Check backend: order created in DB?
5. Complete Stripe payment (use test card: 4242 4242 4242 4242)
6. Check backend webhook fires?
7. Check /orders page shows the order?
8. Login as admin (:5174) → Check Orders page → See new order?
```

### Test Admin Dashboard
```
1. Login as admin in admin dashboard (:5174)
2. Check Dashboard → Stats are loading?
3. Check Users → See list of customers?
4. Check Products → See all products?
5. Check Orders → See all orders?
```
