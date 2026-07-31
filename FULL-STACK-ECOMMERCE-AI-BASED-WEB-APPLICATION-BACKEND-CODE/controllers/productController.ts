import { Request, Response, NextFunction } from "express";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
import { database } from "../database/db.js";
import { IProduct, IProductImage } from "../types/index.js";

const parseProductImages = (product: any) => {
  if (product && typeof product.images === "string") {
    try { product.images = JSON.parse(product.images); } catch { product.images = []; }
  }
  return product;
};

const DEFAULT_IMAGE: IProductImage = {
  url: "https://res.cloudinary.com/dhljktf9k/image/upload/v1/Ecommerce_Product_Images/default-product",
  public_id: "Ecommerce_Product_Images/default-product",
};

const uploadToCloudinary = async (image: any) => {
  if (image.tempFilePath) {
    return await cloudinary.uploader.upload(image.tempFilePath, {
      folder: "Ecommerce_Product_Images", width: 1000, crop: "scale",
    });
  }
  const buffer = Buffer.isBuffer(image.data) ? image.data : Buffer.from(image.data);
  const b64 = buffer.toString("base64");
  const dataUri = `data:${image.mimetype};base64,${b64}`;
  return await cloudinary.uploader.upload(dataUri, {
    folder: "Ecommerce_Product_Images", width: 1000, crop: "scale",
  });
};

export const createProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, description, price, category, stock } = req.body as {
      name: string; description: string; price: string; category: string; stock: string;
    };
    const created_by = req.user.id;
    if (!name || !description || !price || !category || stock === undefined || stock === null || stock === "")
      return next(new ErrorHandler("Please provide complete product details.", 400));

    const uploadedImages: IProductImage[] = [];
    if (req.files?.images) {
      const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (const image of images) {
        try {
          const result = await uploadToCloudinary(image);
          uploadedImages.push({ url: result.secure_url, public_id: result.public_id });
        } catch (err) {
          console.error("Cloudinary upload failed:", err);
          uploadedImages.push(DEFAULT_IMAGE);
        }
      }
    } else if (req.body.imageUrls) {
      let urls: string[] = [];
      try {
        urls = JSON.parse(req.body.imageUrls as string);
      } catch {
        urls = String(req.body.imageUrls).split(",").map((u) => u.trim()).filter(Boolean);
      }
      for (const url of urls) uploadedImages.push({ url, public_id: "" });
    }
    if (uploadedImages.length === 0) uploadedImages.push(DEFAULT_IMAGE);

    const product = await database.query<IProduct>(
      `INSERT INTO products (name, description, price, category, stock, images, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, parseFloat(price), category, stock, JSON.stringify(uploadedImages), created_by]
    );
    res.status(201).json({ success: true, message: "Product created successfully.", product: parseProductImages(product.rows[0]) });
  }
);

export const fetchAllProducts = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { availability, price, category, ratings, search } = req.query as Record<string, string>;
    const page = parseInt(req.query.page as string) || 1;
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
    if (category) { conditions.push(`category ILIKE $${index}`); values.push(`%${category}%`); index++; }
    if (ratings) { conditions.push(`ratings >= $${index}`); values.push(parseFloat(ratings)); index++; }
    if (search) {
      conditions.push(`(p.name ILIKE $${index} OR p.description ILIKE $${index + 1})`);
      values.push(`%${search}%`, `%${search}%`);
      index += 2;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const totalProductsResult = await database.query<{ count: string }>(`SELECT COUNT(*) FROM products p ${whereClause}`, values);
    const totalProducts = parseInt(totalProductsResult.rows[0].count);

    const limitPlaceholder = `$${index}`; values.push(limit); index++;
    const offsetPlaceholder = `$${index}`; values.push(offset);

    const result = await database.query(
      `SELECT p.*, COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id ${whereClause} GROUP BY p.id ORDER BY p.created_at DESC LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`, values
    );
    const newProductsResult = await database.query(
      `SELECT p.*, COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id WHERE p.created_at >= NOW() - INTERVAL '30 days' GROUP BY p.id ORDER BY p.created_at DESC LIMIT 8`
    );
    const topRatedResult = await database.query(
      `SELECT p.*, COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id WHERE p.ratings >= 4.5 GROUP BY p.id ORDER BY p.ratings DESC, p.created_at DESC LIMIT 8`
    );

    res.status(200).json({
      success: true,
      products: result.rows.map(parseProductImages),
      totalProducts,
      newProducts: newProductsResult.rows.map(parseProductImages),
      topRatedProducts: topRatedResult.rows.map(parseProductImages),
    });
  }
);

export const updateProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId } = req.params;
    const product = await database.query<IProduct>("SELECT * FROM products WHERE id = $1", [productId]);
    if (product.rows.length === 0) return next(new ErrorHandler("Product not found.", 404));
    const existingProduct = parseProductImages(product.rows[0]);
    const bodyFields = (req.body ?? {}) as Record<string, string>;
    const hasBodyData = Object.keys(bodyFields).length > 0 && Object.values(bodyFields).some((v) => v?.toString().trim() !== "");
    const hasFiles = req.files?.images;

    if (!hasBodyData && !hasFiles) {
      res.status(200).json({ success: true, message: "Product details fetched for update.", product: existingProduct });
      return;
    }

    const updates: Record<string, string | number> = {};
    const name = bodyFields.name?.trim();
    const description = bodyFields.description?.trim();
    const price = bodyFields.price ? parseFloat(bodyFields.price) : null;
    const category = bodyFields.category?.trim();
    const stock = bodyFields.stock ? parseInt(bodyFields.stock) : null;

    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price !== null && !isNaN(price)) updates.price = price;
    if (category) updates.category = category;
    if (stock !== null && !isNaN(stock)) updates.stock = stock;

    let uploadedImages: IProductImage[] = existingProduct.images ?? [];
    if (hasFiles) {
      if (existingProduct.images?.length > 0) {
        for (const img of existingProduct.images) await cloudinary.uploader.destroy(img.public_id);
      }
      const images = Array.isArray(req.files!.images) ? req.files!.images : [req.files!.images];
      uploadedImages = [];
      for (const image of images) {
        const result = await uploadToCloudinary(image);
        uploadedImages.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    const fields = [...Object.keys(updates), "images"];
    const vals: unknown[] = [...Object.values(updates), JSON.stringify(uploadedImages), productId];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await database.query<IProduct>(`UPDATE products SET ${setClause} WHERE id = $${vals.length} RETURNING *`, vals);
    res.status(200).json({ success: true, message: "Product updated successfully.", updatedProduct: parseProductImages(result.rows[0]) });
  }
);

export const deleteProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId } = req.params;
    const product = await database.query<IProduct>("SELECT * FROM products WHERE id = $1", [productId]);
    if (product.rows.length === 0) return next(new ErrorHandler("Product not found.", 404));
    const deleteResult = await database.query("DELETE FROM products WHERE id = $1 RETURNING *", [productId]);
    if (deleteResult.rows.length === 0) return next(new ErrorHandler("Failed to delete product.", 500));
    const parsedProduct = parseProductImages(product.rows[0]);
    for (const image of parsedProduct.images ?? []) await cloudinary.uploader.destroy(image.public_id);
    res.status(200).json({ success: true, message: "Product deleted successfully." });
  }
);

export const fetchSingleProduct = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { productId } = req.params;
    const result = await database.query(
      `SELECT p.*, COALESCE(json_agg(json_build_object('review_id', r.id, 'rating', r.rating, 'comment', r.comment, 'reviewer', json_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar))) FILTER (WHERE r.id IS NOT NULL), '[]') AS reviews FROM products p LEFT JOIN reviews r ON p.id = r.product_id LEFT JOIN users u ON r.user_id = u.id WHERE p.id = $1 GROUP BY p.id`,
      [productId]
    );
    res.status(200).json({ success: true, message: "Product fetched successfully.", product: parseProductImages(result.rows[0]) });
  }
);

export const postProductReview = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId } = req.params;
    const { rating, comment } = req.body as { rating: number; comment: string };
    if (!rating || !comment) return next(new ErrorHandler("Please provide rating and comment.", 400));

    const { rows } = await database.query(
      `SELECT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.buyer_id = $1 AND oi.product_id = $2 AND o.order_status = 'Delivered' LIMIT 1`,
      [req.user.id, productId]
    );
    if (rows.length === 0) { res.status(403).json({ success: false, message: "You can only review a product you have purchased." }); return; }

    const product = await database.query("SELECT * FROM products WHERE id = $1", [productId]);
    if (product.rows.length === 0) return next(new ErrorHandler("Product not found.", 404));

    const isAlreadyReviewed = await database.query(`SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2`, [productId, req.user.id]);
    let review;
    if (isAlreadyReviewed.rows.length > 0) {
      review = await database.query("UPDATE reviews SET rating = $1, comment = $2 WHERE product_id = $3 AND user_id = $4 RETURNING *", [rating, comment, productId, req.user.id]);
    } else {
      review = await database.query("INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *", [productId, req.user.id, rating, comment]);
    }
    const allReviews = await database.query<{ avg_rating: string }>(`SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id = $1`, [productId]);
    const updatedProduct = await database.query(`UPDATE products SET ratings = $1 WHERE id = $2 RETURNING *`, [allReviews.rows[0].avg_rating, productId]);
    res.status(200).json({ success: true, message: "Review posted.", review: review.rows[0], product: parseProductImages(updatedProduct.rows[0]) });
  }
);

export const aiSearchProducts = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userPrompt } = req.body as { userPrompt: string };
    if (!userPrompt) return next(new ErrorHandler("Please provide a search prompt.", 400));

    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!nvidiaKey && !openRouterKey) return next(new ErrorHandler("AI search is not configured.", 503));

    // -------- helpers -------------------------------------------------
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
      const countResult = await database.query<{ count: string }>(`SELECT COUNT(*) FROM products p ${whereClause}`, values);
      const totalProducts = parseInt(countResult.rows[0].count);
      if (totalProducts === 0) return { totalProducts, products: [] as any[] };

      const result = await database.query(
        `SELECT p.*, COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id ${whereClause} GROUP BY p.id ORDER BY p.created_at DESC LIMIT 50`,
        values
      );
      return { totalProducts, products: result.rows.map(parseProductImages) };
    };

    // Layered relaxation so searches never silently return nothing:
    // 1) strict (AI params) -> 2) drop invented price bounds -> 3) detect category from words -> 4) OR-matching
    let searchResult = await runSearch(params, false);
    if (searchResult.totalProducts === 0 && (params.minPrice !== null || params.maxPrice !== null)) {
      searchResult = await runSearch({ ...params, minPrice: null, maxPrice: null }, false);
    }
    if (searchResult.totalProducts === 0 && !params.category) {
      const detected = detectCategory(params.search) || detectCategory(userPrompt);
      if (detected) {
        // Price bounds are dropped here too: step 2 already proved they caused the 0-result,
        // and re-applying them could still block e.g. "fashion under $10".
        const relaxed = { ...params, minPrice: null, maxPrice: null };
        // Try: original keywords OR-matched together with the detected category
        // (e.g. "running shoes" -> Fashion -> Running Sneakers only)
        searchResult = await runSearch({ ...relaxed, category: detected }, true);
        // If keywords matched nothing in that category, fall back to category alone
        // (e.g. "expensive electronics" -> all Electronics).
        if (searchResult.totalProducts === 0) {
          searchResult = await runSearch({ ...relaxed, search: null, category: detected }, false);
        }
      }
    }
    if (searchResult.totalProducts === 0) {
      searchResult = await runSearch({ ...params, minPrice: null, maxPrice: null }, true);
    }

    res.status(200).json({
      success: true,
      products: searchResult.products,
      totalProducts: searchResult.totalProducts,
    });
  }
);

export const deleteReview = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId } = req.params;
    const reviewId = req.query.reviewId as string;
    if (!reviewId) return next(new ErrorHandler("Review ID is required.", 400));
    const review = await database.query("DELETE FROM reviews WHERE id = $1 AND product_id = $2 AND user_id = $3 RETURNING *", [reviewId, productId, req.user.id]);
    if (review.rows.length === 0) return next(new ErrorHandler("Review not found.", 404));
    const allReviews = await database.query<{ avg_rating: string }>(`SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id = $1`, [productId]);
    const updatedProduct = await database.query(`UPDATE products SET ratings = $1 WHERE id = $2 RETURNING *`, [allReviews.rows[0].avg_rating, productId]);
    res.status(200).json({ success: true, message: "Your review has been deleted.", review: review.rows[0], product: parseProductImages(updatedProduct.rows[0]) });
  }
);