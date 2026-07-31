import { database } from "../database/db.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { parseProductImages } from "../utils/imageUpload.js";
import { IProduct, IProductImage } from "../types/index.js";

export const getProductById = async (productId: string): Promise<IProduct> => {
  const product = await database.query<IProduct>("SELECT * FROM products WHERE id = $1", [
    productId,
  ]);
  if (product.rows.length === 0) throw new ErrorHandler("Product not found.", 404);
  return parseProductImages(product.rows[0]);
};

export const createProductInDb = async (
  data: {
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    images: IProductImage[];
  },
  createdBy: string
): Promise<IProduct> => {
  const { name, description, price, category, stock, images } = data;
  const product = await database.query<IProduct>(
    `INSERT INTO products (name, description, price, category, stock, images, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, description, price, category, stock, JSON.stringify(images), createdBy]
  );
  return parseProductImages(product.rows[0]);
};

export interface ProductFilters {
  availability?: string;
  price?: string;
  category?: string;
  ratings?: string;
  search?: string;
  page?: number;
}

export const fetchProducts = async (filters: ProductFilters) => {
  const { availability, price, category, ratings, search } = filters;
  const page = filters.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let index = 1;

  if (availability === "in-stock") conditions.push(`stock > 5`);
  else if (availability === "limited") conditions.push(`stock > 0 AND stock <= 5`);
  else if (availability === "out-of-stock") conditions.push(`stock = 0`);

  if (price) {
    const [minPrice, maxPrice] = price.split("-");
    if (minPrice && maxPrice) {
      conditions.push(`price BETWEEN $${index} AND $${index + 1}`);
      values.push(parseFloat(minPrice), parseFloat(maxPrice));
      index += 2;
    }
  }
  if (category) {
    conditions.push(`category ILIKE $${index}`);
    values.push(`%${category}%`);
    index++;
  }
  if (ratings) {
    conditions.push(`ratings >= $${index}`);
    values.push(parseFloat(ratings));
    index++;
  }
  if (search) {
    conditions.push(`(p.name ILIKE $${index} OR p.description ILIKE $${index + 1})`);
    values.push(`%${search}%`, `%${search}%`);
    index += 2;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const totalProductsResult = await database.query<{ count: string }>(
    `SELECT COUNT(*) FROM products p ${whereClause}`,
    values
  );
  const totalProducts = parseInt(totalProductsResult.rows[0].count);

  const limitPlaceholder = `$${index}`;
  values.push(limit);
  index++;
  const offsetPlaceholder = `$${index}`;
  values.push(offset);

  const result = await database.query(
    `SELECT p.*, COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id ${whereClause} GROUP BY p.id ORDER BY p.created_at DESC LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    values
  );
  const newProductsResult = await database.query(
    `SELECT p.*, COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id WHERE p.created_at >= NOW() - INTERVAL '30 days' GROUP BY p.id ORDER BY p.created_at DESC LIMIT 8`
  );
  const topRatedResult = await database.query(
    `SELECT p.*, COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id WHERE p.ratings >= 4.5 GROUP BY p.id ORDER BY p.ratings DESC, p.created_at DESC LIMIT 8`
  );

  return {
    products: result.rows.map(parseProductImages),
    totalProducts,
    newProducts: newProductsResult.rows.map(parseProductImages),
    topRatedProducts: topRatedResult.rows.map(parseProductImages),
  };
};

export const updateProductInDb = async (
  productId: string,
  updates: Record<string, string | number>,
  images: IProductImage[]
): Promise<IProduct> => {
  const fields = [...Object.keys(updates), "images"];
  const vals: unknown[] = [...Object.values(updates), JSON.stringify(images), productId];
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const result = await database.query<IProduct>(
    `UPDATE products SET ${setClause} WHERE id = $${vals.length} RETURNING *`,
    vals
  );
  return parseProductImages(result.rows[0]);
};

export const deleteProductFromDb = async (productId: string): Promise<void> => {
  const deleteResult = await database.query(
    "DELETE FROM products WHERE id = $1 RETURNING *",
    [productId]
  );
  if (deleteResult.rows.length === 0) throw new ErrorHandler("Failed to delete product.", 500);
};

export const getProductWithReviews = async (productId: string): Promise<IProduct> => {
  const result = await database.query(
    `SELECT p.*, COALESCE(json_agg(json_build_object('review_id', r.id, 'rating', r.rating, 'comment', r.comment, 'reviewer', json_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar))) FILTER (WHERE r.id IS NOT NULL), '[]') AS reviews FROM products p LEFT JOIN reviews r ON p.id = r.product_id LEFT JOIN users u ON r.user_id = u.id WHERE p.id = $1 GROUP BY p.id`,
    [productId]
  );
  return parseProductImages(result.rows[0]);
};

export const hasPurchasedProduct = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  const { rows } = await database.query(
    `SELECT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.buyer_id = $1 AND oi.product_id = $2 AND o.order_status = 'Delivered' LIMIT 1`,
    [userId, productId]
  );
  return rows.length > 0;
};

export const upsertProductReview = async (
  productId: string,
  userId: string,
  rating: number,
  comment: string
): Promise<{ review: any; product: IProduct }> => {
  const isAlreadyReviewed = await database.query(
    `SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2`,
    [productId, userId]
  );
  let review;
  if (isAlreadyReviewed.rows.length > 0) {
    review = await database.query(
      "UPDATE reviews SET rating = $1, comment = $2 WHERE product_id = $3 AND user_id = $4 RETURNING *",
      [rating, comment, productId, userId]
    );
  } else {
    review = await database.query(
      "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [productId, userId, rating, comment]
    );
  }
  const allReviews = await database.query<{ avg_rating: string }>(
    `SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id = $1`,
    [productId]
  );
  const updatedProduct = await database.query<IProduct>(
    `UPDATE products SET ratings = $1 WHERE id = $2 RETURNING *`,
    [allReviews.rows[0].avg_rating, productId]
  );
  return { review: review.rows[0], product: parseProductImages(updatedProduct.rows[0]) };
};

export const deleteProductReview = async (
  productId: string,
  reviewId: string,
  userId: string
): Promise<{ review: any; product: IProduct }> => {
  const review = await database.query(
    "DELETE FROM reviews WHERE id = $1 AND product_id = $2 AND user_id = $3 RETURNING *",
    [reviewId, productId, userId]
  );
  if (review.rows.length === 0) throw new ErrorHandler("Review not found.", 404);
  const allReviews = await database.query<{ avg_rating: string }>(
    `SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id = $1`,
    [productId]
  );
  const updatedProduct = await database.query<IProduct>(
    `UPDATE products SET ratings = $1 WHERE id = $2 RETURNING *`,
    [allReviews.rows[0].avg_rating, productId]
  );
  return { review: review.rows[0], product: parseProductImages(updatedProduct.rows[0]) };
};

/** AI-powered product search (NVIDIA NIM -> OpenRouter fallback) with layered relaxation. */
export const aiSearchProducts = async (userPrompt: string) => {
  if (!userPrompt) throw new ErrorHandler("Please provide a search prompt.", 400);
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!nvidiaKey && !openRouterKey) throw new ErrorHandler("AI search is not configured.", 503);

  const CATEGORIES = [
    "Electronics", "Fashion", "Home & Garden", "Sports",
    "Books", "Beauty", "Automotive", "Kids & Baby",
  ];
  const CATEGORY_KEYWORDS: Record<string, string> = {
    electronics: "Electronics", gadget: "Electronics", gadgets: "Electronics", tech: "Electronics",
    phone: "Electronics", smartphone: "Electronics", laptop: "Electronics", computer: "Electronics",
    camera: "Electronics", headphone: "Electronics", headphones: "Electronics",
    fashion: "Fashion", clothes: "Fashion", clothing: "Fashion", dress: "Fashion", shirt: "Fashion",
    shoes: "Fashion", sneakers: "Fashion", watch: "Fashion", jacket: "Fashion",
    home: "Home & Garden", garden: "Home & Garden", furniture: "Home & Garden", decor: "Home & Garden",
    lamp: "Home & Garden", armchair: "Home & Garden",
    sports: "Sports", fitness: "Sports", gym: "Sports", bike: "Sports", running: "Sports",
    dumbbell: "Sports",
    books: "Books", book: "Books", novel: "Books", literature: "Books",
    beauty: "Beauty", skincare: "Beauty", perfume: "Beauty", makeup: "Beauty", cosmetics: "Beauty",
    automotive: "Automotive", car: "Automotive", auto: "Automotive", vehicle: "Automotive",
    toys: "Kids & Baby", toy: "Kids & Baby", baby: "Kids & Baby", kids: "Kids & Baby",
  };
  const STOPWORDS = new Set([
    "show", "give", "want", "need", "find", "get", "some", "with", "the", "for", "under",
    "over", "less", "more", "than", "cheap", "expensive", "affordable", "budget", "premium",
    "luxury", "items", "item", "products", "product", "me", "my", "a", "an", "and", "or", "please",
  ]);
  const tokenize = (phrase: string | null): string[] => {
    if (!phrase) return [];
    return phrase
      .split(/[^a-zA-Z0-9&'-]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 2)
      .filter((w) => !STOPWORDS.has(w.toLowerCase()));
  };
  const detectCategory = (text: string | null): string | null => {
    if (!text) return null;
    const lower = text.toLowerCase();
    for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
      if (lower.includes(keyword)) return category;
    }
    return null;
  };
  const parseAiJson = (raw: string): Record<string, any> => {
    const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const start = cleaned.lastIndexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
      throw new Error("AI returned an invalid response format.");
    }
  };

  const systemPrompt = `You are a product search assistant for the ShopMate e-commerce store. From the user's query, extract structured search parameters.

The store's categories are: ${CATEGORIES.join(", ")}.

Return ONLY a valid JSON object (no markdown, no backticks, no reasoning or explanation, no extra text) with these optional fields:
- "search": string (specific product name or description keywords, or null). Never put category words here.
- "category": string (an exact category from the list above, or null)
- "minPrice": number (only when the query states an explicit minimum like "over $500" or "more than $100"; otherwise null)
- "maxPrice": number (only when the query states an explicit maximum like "under $100" or "less than $50"; otherwise null)

Rules:
- Category words (electronics, gadgets, tech, fashion, clothes, shoes, sneakers, books, beauty, toys, baby, sports, garden, automotive, car, etc.) go into "category" with the exact store category name — never into "search".
- Only set minPrice/maxPrice when an explicit number appears in the query. Subjective words like "cheap", "expensive", "affordable", "luxury", "budget" do NOT create price bounds.

Examples:
Input: "show me affordable running shoes under $100"
Output: {"search": "running shoes", "category": null, "minPrice": null, "maxPrice": 100}

Input: "expensive electronics"
Output: {"search": null, "category": "Electronics", "minPrice": null, "maxPrice": null}

Input: "fashion items"
Output: {"search": null, "category": "Fashion", "minPrice": null, "maxPrice": null}

Input: "trendy sneakers"
Output: {"search": "sneakers", "category": null, "minPrice": null, "maxPrice": null}

Input: "a book cheaper than $30"
Output: {"search": null, "category": "Books", "minPrice": null, "maxPrice": 30}`;

  let params: { search: string | null; category: string | null; minPrice: number | null; maxPrice: number | null };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const provider = nvidiaKey
      ? { base: "https://integrate.api.nvidia.com/v1", key: nvidiaKey, model: "nvidia/nemotron-3-ultra-550b-a55b" }
      : { base: "https://openrouter.ai/api/v1", key: openRouterKey, model: "openai/gpt-4o-mini" };
    const response = await fetch(`${provider.base}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${provider.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        temperature: 0,
        max_tokens: 500,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${provider.base} API error: ${errorText}`);
    }
    const data: any = await response.json();
    const rawContent = data.choices[0].message.content;
    const parsed = parseAiJson(rawContent);
    const toNumber = (v: any): number | null => {
      if (typeof v === "number") return Number.isFinite(v) ? v : null;
      if (typeof v === "string" && v.trim() !== "") {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };
    params = {
      search: typeof parsed.search === "string" && parsed.search.trim() ? parsed.search.trim() : null,
      category: typeof parsed.category === "string" && parsed.category.trim() ? parsed.category.trim() : null,
      minPrice: toNumber(parsed.minPrice),
      maxPrice: toNumber(parsed.maxPrice),
    };
  } catch (error: any) {
    console.error("AI search fallback due to:", error.message);
    params = { search: userPrompt, category: null, minPrice: null, maxPrice: null };
  }

  const runSearch = async (p: typeof params, useOr: boolean) => {
    const conditions: string[] = [];
    const values: (string | number)[] = [];
    let index = 1;

    const keywords = tokenize(p.search);
    if (keywords.length) {
      const parts = keywords.map((k) => {
        const part = `(p.name ILIKE $${index} OR p.description ILIKE $${index + 1})`;
        values.push(`%${k}%`, `%${k}%`);
        index += 2;
        return part;
      });
      conditions.push(`(${parts.join(useOr ? " OR " : " AND ")})`);
    }
    if (p.category) {
      conditions.push(`p.category ILIKE $${index}`);
      values.push(`%${p.category}%`);
      index++;
    }
    if (p.minPrice !== null && p.minPrice !== undefined) {
      conditions.push(`p.price >= $${index}`);
      values.push(p.minPrice);
      index++;
    }
    if (p.maxPrice !== null && p.maxPrice !== undefined) {
      conditions.push(`p.price <= $${index}`);
      values.push(p.maxPrice);
      index++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const countResult = await database.query<{ count: string }>(
      `SELECT COUNT(*) FROM products p ${whereClause}`,
      values
    );
    const totalProducts = parseInt(countResult.rows[0].count);
    if (totalProducts === 0) return { totalProducts, products: [] as any[] };

    const result = await database.query(
      `SELECT p.*, COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id ${whereClause} GROUP BY p.id ORDER BY p.created_at DESC LIMIT 50`,
      values
    );
    return { totalProducts, products: result.rows.map(parseProductImages) };
  };

  // Layered relaxation so searches never silently return nothing:
  let searchResult = await runSearch(params, false);
  if (searchResult.totalProducts === 0 && (params.minPrice !== null || params.maxPrice !== null)) {
    searchResult = await runSearch({ ...params, minPrice: null, maxPrice: null }, false);
  }
  if (searchResult.totalProducts === 0 && !params.category) {
    const detected = detectCategory(params.search) || detectCategory(userPrompt);
    if (detected) {
      const relaxed = { ...params, minPrice: null, maxPrice: null };
      searchResult = await runSearch({ ...relaxed, category: detected }, true);
      if (searchResult.totalProducts === 0) {
        searchResult = await runSearch({ ...relaxed, search: null, category: detected }, false);
      }
    }
  }
  if (searchResult.totalProducts === 0) {
    searchResult = await runSearch({ ...params, minPrice: null, maxPrice: null }, true);
  }

  return searchResult;
};
