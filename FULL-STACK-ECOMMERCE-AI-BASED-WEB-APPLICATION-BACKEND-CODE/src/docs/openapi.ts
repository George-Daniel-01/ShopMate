/**
 * ShopMate API — OpenAPI 3.0 specification.
 *
 * Served interactively at GET /api/v1/docs (Swagger UI).
 * Raw JSON at GET /api/v1/docs/swagger.json.
 */
export default {
  openapi: "3.0.3",
  info: {
    title: "ShopMate API",
    description:
      "REST API for the ShopMate e-commerce platform: authentication, products, categories, orders, admin management, Stripe payments and AI-powered product search.",
    version: "1.0.0",
    contact: {
      name: "Daniel George",
    },
  },
  servers: [
    { url: "https://shop-mate-backend.vercel.app/api/v1", description: "Production" },
    { url: "http://localhost:4000/api/v1", description: "Local development" },
  ],
  tags: [
    { name: "Health", description: "Service health and schema diagnostics" },
    { name: "Auth", description: "Registration, login, password and profile management" },
    { name: "Products", description: "Product listing, management, reviews and AI search" },
    { name: "Categories", description: "Store categories" },
    { name: "Orders", description: "Checkout and order management" },
    { name: "Admin", description: "Admin-only user and statistics endpoints" },
    { name: "Payments", description: "Stripe webhooks" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns service status, database connectivity, schema readiness and uptime. Auto-creates missing tables.",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    service: { type: "string" },
                    db: { type: "string", enum: ["up", "down"] },
                    schema: { type: "string" },
                    uptime: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        operationId: "registerUser",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "User registered; auth cookie set" },
          "400": { description: "Validation error" },
          "409": { description: "Email already registered" },
        },
      },
    },

    "/auth/register-admin": {
      post: {
        tags: ["Auth"],
        summary: "Register an admin",
        description: "Requires the ADMIN_SECRET_KEY configured on the server.",
        operationId: "registerAdmin",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "adminSecretKey"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  adminSecretKey: { type: "string", format: "password" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Admin registered" },
          "401": { description: "Invalid admin secret key" },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        operationId: "loginUser",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Logged in; token cookie set" },
          "401": { description: "Invalid credentials" },
        },
      },
    },

    "/auth/google": {
      get: {
        tags: ["Auth"],
        summary: "Continue with Google",
        description: "Redirects the user to Google's consent screen. After sign-in, the browser is redirected back to the frontend with an auth cookie set.",
        operationId: "googleAuth",
        responses: {
          "302": { description: "Redirect to Google consent screen" },
          "500": { description: "Google OAuth is not configured on the server" },
        },
      },
    },

    "/auth/google/callback": {
      get: {
        tags: ["Auth"],
        summary: "Google OAuth callback",
        description: "Exchanges the Google authorization code, finds or creates the user by email, sets the JWT cookie and redirects to the frontend.",
        operationId: "googleCallback",
        parameters: [
          { name: "code", in: "query", required: true, schema: { type: "string" } },
          { name: "state", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: {
          "302": { description: "Redirect to the frontend with ?google=success" },
          "400": { description: "Invalid OAuth state or cancelled sign-in" },
        },
      },
    },

    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the current user",
        security: [{ cookieAuth: [] }],
        operationId: "getMe",
        responses: {
          "200": { description: "Current user profile" },
          "401": { description: "Not authenticated" },
        },
      },
    },

    "/auth/logout": {
      get: {
        tags: ["Auth"],
        summary: "Log out",
        security: [{ cookieAuth: [] }],
        operationId: "logoutUser",
        responses: {
          "200": { description: "Logged out; cookie cleared" },
        },
      },
    },

    "/auth/password/forgot": {
      post: {
        tags: ["Auth"],
        summary: "Request a password reset email",
        operationId: "forgotPassword",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string", format: "email" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Reset email sent (if the account exists)" },
        },
      },
    },

    "/auth/password/reset/{token}": {
      put: {
        tags: ["Auth"],
        summary: "Reset the password with a token",
        operationId: "resetPassword",
        parameters: [
          {
            name: "token",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Reset token from the email link",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["password"],
                properties: { password: { type: "string", minLength: 6 } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Password updated" },
          "400": { description: "Invalid or expired token" },
        },
      },
    },

    "/auth/password/update": {
      put: {
        tags: ["Auth"],
        summary: "Update the password (authenticated)",
        security: [{ cookieAuth: [] }],
        operationId: "updatePassword",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["oldPassword", "newPassword"],
                properties: {
                  oldPassword: { type: "string" },
                  newPassword: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Password updated" },
          "400": { description: "Old password is incorrect" },
        },
      },
    },

    "/auth/profile/update": {
      put: {
        tags: ["Auth"],
        summary: "Update name, email or avatar",
        security: [{ cookieAuth: [] }],
        operationId: "updateProfile",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  avatar: { type: "string", description: "Public image URL" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Profile updated" },
        },
      },
    },

    "/product": {
      get: {
        tags: ["Products"],
        summary: "List products",
        description: "Supports filtering by category, price range, rating and availability, plus pagination.",
        operationId: "listProducts",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "rating", in: "query", schema: { type: "number" } },
          { name: "inStock", in: "query", schema: { type: "boolean" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          "200": { description: "Paginated product list" },
        },
      },
    },

    "/product/singleProduct/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get a single product with its reviews",
        operationId: "getSingleProduct",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Product detail" },
          "404": { description: "Product not found" },
        },
      },
    },

    "/product/admin/create": {
      post: {
        tags: ["Products"],
        summary: "Create a product",
        description: "Accepts multipart images or a plain JSON `imageUrls` array.",
        security: [{ cookieAuth: [] }],
        operationId: "createProduct",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  stock: { type: "integer" },
                  category: { type: "string" },
                  images: { type: "array", items: { type: "string", format: "binary" } },
                },
              },
            },
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  stock: { type: "integer" },
                  category: { type: "string" },
                  imageUrls: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Product created" },
          "401": { description: "Admin only" },
        },
      },
    },

    "/product/admin/update/{id}": {
      put: {
        tags: ["Products"],
        summary: "Update a product",
        security: [{ cookieAuth: [] }],
        operationId: "updateProduct",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  stock: { type: "integer" },
                  category: { type: "string" },
                  imageUrls: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Product updated" },
          "404": { description: "Product not found" },
        },
      },
    },

    "/product/admin/delete/{id}": {
      delete: {
        tags: ["Products"],
        summary: "Delete a product",
        security: [{ cookieAuth: [] }],
        operationId: "deleteProduct",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Product deleted" },
          "404": { description: "Product not found" },
        },
      },
    },

    "/product/post-new/review/{id}": {
      put: {
        tags: ["Products"],
        summary: "Post or update a review",
        description: "Allowed only for users with a delivered order containing the product.",
        security: [{ cookieAuth: [] }],
        operationId: "postReview",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Product id" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rating", "comment"],
                properties: {
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  comment: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Review saved" },
          "403": { description: "Only delivered-order buyers may review" },
        },
      },
    },

    "/product/delete/review/{id}": {
      delete: {
        tags: ["Products"],
        summary: "Delete your own review",
        security: [{ cookieAuth: [] }],
        operationId: "deleteReview",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Review id" },
        ],
        responses: {
          "200": { description: "Review deleted" },
        },
      },
    },

    "/product/ai-search": {
      post: {
        tags: ["Products"],
        summary: "AI-powered product search",
        description: "Turns a natural-language query into a structured product filter (NVIDIA NIM with OpenRouter fallback).",
        security: [{ cookieAuth: [] }],
        operationId: "aiSearch",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["query"],
                properties: { query: { type: "string", example: "wireless gaming mice under 50 dollars" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Filtered products matching the query" },
          "500": { description: "AI provider unavailable" },
        },
      },
    },

    "/category": {
      get: {
        tags: ["Categories"],
        summary: "List all categories",
        description: "Returns categories with images and per-category product counts.",
        operationId: "listCategories",
        responses: {
          "200": { description: "Category list" },
        },
      },
    },

    "/category/admin/create": {
      post: {
        tags: ["Categories"],
        summary: "Create a category",
        description: "Accepts a multipart image or a plain JSON `imageUrl` string.",
        security: [{ cookieAuth: [] }],
        operationId: "createCategory",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  image: { type: "string", format: "binary" },
                },
              },
            },
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  imageUrl: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Category created" },
          "409": { description: "Category name already exists" },
        },
      },
    },

    "/category/admin/update/{id}": {
      put: {
        tags: ["Categories"],
        summary: "Update a category",
        security: [{ cookieAuth: [] }],
        operationId: "updateCategory",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  imageUrl: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Category updated" },
          "404": { description: "Category not found" },
        },
      },
    },

    "/category/admin/delete/{id}": {
      delete: {
        tags: ["Categories"],
        summary: "Delete a category",
        security: [{ cookieAuth: [] }],
        operationId: "deleteCategory",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Category deleted" },
        },
      },
    },

    "/order/new": {
      post: {
        tags: ["Orders"],
        summary: "Place a new order",
        security: [{ cookieAuth: [] }],
        operationId: "createOrder",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["shippingInfo", "orderItems"],
                properties: {
                  shippingInfo: {
                    type: "object",
                    required: ["fullName", "address", "city", "state", "country", "pincode", "phone"],
                    properties: {
                      fullName: { type: "string" },
                      address: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      country: { type: "string" },
                      pincode: { type: "string" },
                      phone: { type: "string" },
                    },
                  },
                  orderItems: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["product", "quantity", "price", "title", "image"],
                      properties: {
                        product: { type: "string", description: "Product id" },
                        quantity: { type: "integer", minimum: 1 },
                        price: { type: "number" },
                        title: { type: "string" },
                        image: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Order created; returns order + client secret for Stripe" },
          "401": { description: "Not authenticated" },
        },
      },
    },

    "/order/orders/me": {
      get: {
        tags: ["Orders"],
        summary: "Get the current user's orders",
        security: [{ cookieAuth: [] }],
        operationId: "getMyOrders",
        responses: {
          "200": { description: "Order list" },
        },
      },
    },

    "/order/{orderId}": {
      get: {
        tags: ["Orders"],
        summary: "Get a single order",
        security: [{ cookieAuth: [] }],
        operationId: "getOrder",
        parameters: [
          { name: "orderId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Order detail" },
          "404": { description: "Order not found" },
        },
      },
    },

    "/order/admin/getall": {
      get: {
        tags: ["Orders"],
        summary: "Get all orders",
        security: [{ cookieAuth: [] }],
        operationId: "getAllOrders",
        responses: {
          "200": { description: "All orders" },
        },
      },
    },

    "/order/admin/update/{orderId}": {
      put: {
        tags: ["Orders"],
        summary: "Update order status",
        security: [{ cookieAuth: [] }],
        operationId: "updateOrderStatus",
        parameters: [
          { name: "orderId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderStatus"],
                properties: {
                  orderStatus: {
                    type: "string",
                    enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Order status updated" },
        },
      },
    },

    "/order/admin/delete/{orderId}": {
      delete: {
        tags: ["Orders"],
        summary: "Delete an order",
        security: [{ cookieAuth: [] }],
        operationId: "deleteOrder",
        parameters: [
          { name: "orderId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Order deleted" },
        },
      },
    },

    "/admin/getallusers": {
      get: {
        tags: ["Admin"],
        summary: "List all users",
        security: [{ cookieAuth: [] }],
        operationId: "getAllUsers",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          "200": { description: "Paginated user list" },
          "401": { description: "Admin only" },
        },
      },
    },

    "/admin/delete/{id}": {
      delete: {
        tags: ["Admin"],
        summary: "Delete a user",
        security: [{ cookieAuth: [] }],
        operationId: "deleteUser",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "User deleted" },
        },
      },
    },

    "/admin/fetch/dashboard-stats": {
      get: {
        tags: ["Admin"],
        summary: "Get dashboard statistics",
        description: "Revenue, monthly sales, order-status counts, top products and totals.",
        security: [{ cookieAuth: [] }],
        operationId: "getDashboardStats",
        responses: {
          "200": { description: "Dashboard statistics" },
        },
      },
    },

    "/payment/webhook": {
      post: {
        tags: ["Payments"],
        summary: "Stripe webhook",
        description: "Receives Stripe `payment_intent.succeeded` events: marks orders as paid and decrements stock.",
        operationId: "stripeWebhook",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "string", description: "Stripe event id" },
                  type: { type: "string", example: "payment_intent.succeeded" },
                  data: { type: "object" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Webhook acknowledged" },
          "400": { description: "Signature verification failed" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "HTTP-only JWT cookie set on login/register. Log in via the Auth endpoints to obtain it. Note: the in-browser Try it out cannot set cookies, so test authenticated endpoints with curl or after logging in from the real apps.",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["user", "admin"] },
          avatar: { type: "object", additionalProperties: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          image: { type: "object", additionalProperties: true },
          productCount: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          stock: { type: "integer" },
          category: { type: "string" },
          images: { type: "array", items: { type: "string" } },
          ratings: { type: "object", additionalProperties: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "string" },
          product: { type: "string" },
          user: { type: "object", additionalProperties: true },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "string" },
          buyer: { type: "object", additionalProperties: true },
          orderItems: { type: "array", items: { type: "object", additionalProperties: true } },
          totalPrice: { type: "number" },
          taxPrice: { type: "number" },
          shippingPrice: { type: "number" },
          orderStatus: { type: "string", enum: ["Processing", "Shipped", "Delivered", "Cancelled"] },
          paymentStatus: { type: "string", enum: ["pending", "paid"] },
          shippingInfo: { type: "object", additionalProperties: true },
          paidAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
};
