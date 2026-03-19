import { Request, Response, NextFunction } from "express";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
import { database } from "../database/db.js";
import { getAIRecommendation } from "../utils/getAIRecommendation.js";
import { IProduct, IProductImage } from "../types/index.js";

export const createProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, description, price, category, stock } = req.body as {
      name: string; description: string; price: string; category: string; stock: string;
    };
    const created_by = req.user.id;
    if (!name || !description || !price || !category || !stock)
      return next(new ErrorHandler("Please provide complete product details.", 400));

    const uploadedImages: IProductImage[] = [];
    if (req.files?.images) {
      const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (const image of images) {
        const result = await cloudinary.uploader.upload((image as any).tempFilePath, {
          folder: "Ecommerce_Product_Images", width: 1000, crop: "scale",
        });
        uploadedImages.push({ url: result.secure_url, public_id: result.public_id });
      }
    }
    const product = await database.query<IProduct>(
      `INSERT INTO products (name, description, price, category, stock, images, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, parseFloat(price) / 283, category, stock, JSON.stringify(uploadedImages), created_by]
    );
    res.status(201).json({ success: true, message: "Product created successfully.", product: product.rows[0] });
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
        values.push(minPrice, maxPrice); index += 2;
      }
    }
    if (category) { conditions.push(`category ILIKE $${index}`); values.push(`%${category}%`); index++; }
    if (ratings) { conditions.push(`ratings >= $${index}`); values.push(ratings); index++; }
    if (search) { conditions.push(`(p.name ILIKE $${index} OR p.description ILIKE $${index})`); values.push(`%${search}%`); index++; }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const totalProductsResult = await database.query<{ count: string }>(
      `SELECT COUNT(*) FROM products p ${whereClause}`, values
    );
    const totalProducts = parseInt(totalProductsResult.rows[0].count);

    const limitPlaceholder = `$${index}`; values.push(limit); index++;
    const offsetPlaceholder = `$${index}`; values.push(offset);

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

    res.status(200).json({
      success: true, products: result.rows, totalProducts,
      newProducts: newProductsResult.rows, topRatedProducts: topRatedResult.rows,
    });
  }
);

export const updateProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId } = req.params;
    const product = await database.query<IProduct>("SELECT * FROM products WHERE id = $1", [productId]);
    if (product.rows.length === 0) return next(new ErrorHandler("Product not found.", 404));
    const existingProduct = product.rows[0];
    const bodyFields = (req.body ?? {}) as Record<string, string>;
    const hasBodyData = Object.keys(bodyFields).length > 0 &&
      Object.values(bodyFields).some((v) => v?.toString().trim() !== "");
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
    if (price && !isNaN(price)) updates.price = price / 283;
    if (category) updates.category = category;
    if (stock && !isNaN(stock)) updates.stock = stock;

    let uploadedImages: IProductImage[] = existingProduct.images ?? [];
    if (hasFiles) {
      if (existingProduct.images?.length > 0) {
        for (const img of existingProduct.images) await cloudinary.uploader.destroy(img.public_id);
      }
      const images = Array.isArray(req.files!.images) ? req.files!.images : [req.files!.images];
      uploadedImages = [];
      for (const image of images) {
        const result = await cloudinary.uploader.upload((image as any).tempFilePath, {
          folder: "Ecommerce_Product_Images", width: 1000, crop: "scale",
        });
        uploadedImages.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    const fields = [...Object.keys(updates), "images"];
    const vals: unknown[] = [...Object.values(updates), JSON.stringify(uploadedImages), productId];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await database.query<IProduct>(
      `UPDATE products SET ${setClause} WHERE id = $${vals.length} RETURNING *`, vals
    );
    res.status(200).json({ success: true, message: "Product updated successfully.", updatedProduct: result.rows[0] });
  }
);

export const deleteProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId } = req.params;
    const product = await database.query<IProduct>("SELECT * FROM products WHERE id = $1", [productId]);
    if (product.rows.length === 0) return next(new ErrorHandler("Product not found.", 404));
    const deleteResult = await database.query("DELETE FROM products WHERE id = $1 RETURNING *", [productId]);
    if (deleteResult.rows.length === 0) return next(new ErrorHandler("Failed to delete product.", 500));
    for (const image of product.rows[0].images ?? []) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    res.status(200).json({ success: true, message: "Product deleted successfully." });
  }
);

export const fetchSingleProduct = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { productId } = req.params;
    const result = await database.query(
      `SELECT p.*,
        COALESCE(json_agg(json_build_object(
          'review_id', r.id, 'rating', r.rating, 'comment', r.comment,
          'reviewer', json_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar)
        )) FILTER (WHERE r.id IS NOT NULL), '[]') AS reviews
       FROM products p
       LEFT JOIN reviews r ON p.id = r.product_id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE p.id = $1 GROUP BY p.id`,
      [productId]
    );
    res.status(200).json({ success: true, message: "Product fetched successfully.", product: result.rows[0] });
  }
);

export const postProductReview = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId } = req.params;
    const { rating, comment } = req.body as { rating: number; comment: string };
    if (!rating || !comment) return next(new ErrorHandler("Please provide rating and comment.", 400));

    const { rows } = await database.query(
      `SELECT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE o.buyer_id = $1 AND oi.product_id = $2 AND o.order_status = 'Delivered' LIMIT 1`,
      [req.user.id, productId]
    );
    if (rows.length === 0) {
      res.status(403).json({ success: false, message: "You can only review a product you've purchased." });
      return;
    }

    const product = await database.query("SELECT * FROM products WHERE id = $1", [productId]);
    if (product.rows.length === 0) return next(new ErrorHandler("Product not found.", 404));

    const isAlreadyReviewed = await database.query(
      `SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2`, [productId, req.user.id]
    );
    let review;
    if (isAlreadyReviewed.rows.length > 0) {
      review = await database.query(
        "UPDATE reviews SET rating = $1, comment = $2 WHERE product_id = $3 AND user_id = $4 RETURNING *",
        [rating, comment, productId, req.user.id]
      );
    } else {
      review = await database.query(
        "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
        [productId, req.user.id, rating, comment]
      );
    }
    const allReviews = await database.query<{ avg_rating: string }>(
      `SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id = $1`, [productId]
    );
    const updatedProduct = await database.query(
      `UPDATE products SET ratings = $1 WHERE id = $2 RETURNING *`,
      [allReviews.rows[0].avg_rating, productId]
    );
    res.status(200).json({ success: true, message: "Review posted.", review: review.rows[0], product: updatedProduct.rows[0] });
  }
);

export const deleteReview = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId } = req.params;
    const review = await database.query(
      "DELETE FROM reviews WHERE product_id = $1 AND user_id = $2 RETURNING *",
      [productId, req.user.id]
    );
    if (review.rows.length === 0) return next(new ErrorHandler("Review not found.", 404));
    const allReviews = await database.query<{ avg_rating: string }>(
      `SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id = $1`, [productId]
    );
    const updatedProduct = await database.query(
      `UPDATE products SET ratings = $1 WHERE id = $2 RETURNING *`,
      [allReviews.rows[0].avg_rating, productId]
    );
    res.status(200).json({ success: true, message: "Your review has been deleted.", review: review.rows[0], product: updatedProduct.rows[0] });
  }
);

export const fetchAIFilteredProducts = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userPrompt } = req.body as { userPrompt: string };
    if (!userPrompt) return next(new ErrorHandler("Provide a valid prompt.", 400));

    const stopWords = new Set(["the","they","them","then","I","we","you","he","she","it","is","a","an","of","and","or","to","for","from","on","who","whom","why","when","which","with","this","that","in","at","by","be","not","was","were","has","have","had","do","does","did","so","some","any","how","can","could","should","would","there","here","just","than","because","but","its","it's","if",".",",","!","?",">","<",";","`","1","2","3","4","5","6","7","8","9","10"]);
    const keywords = userPrompt
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => !stopWords.has(w))
      .map((w) => `%${w}%`);

    const result = await database.query<IProduct>(
      `SELECT * FROM products WHERE name ILIKE ANY($1) OR description ILIKE ANY($1) OR category ILIKE ANY($1) LIMIT 200;`,
      [keywords]
    );
    const filteredProducts = result.rows;

    if (filteredProducts.length === 0) {
      res.status(200).json({ success: true, message: "No products found matching your prompt.", products: [] });
      return;
    }

    const aiResult = await getAIRecommendation(req, userPrompt, filteredProducts);
    if (!aiResult.success) {
      res.status(500).json({ success: false, message: aiResult.message });
      return;
    }
    if (!Array.isArray(aiResult.products)) {
      res.status(200).json({ success: true, message: "AI returned invalid format, showing all matching products.", products: filteredProducts });
      return;
    }
    res.status(200).json({ success: true, message: "AI filtered products.", products: aiResult.products });
  }
);

