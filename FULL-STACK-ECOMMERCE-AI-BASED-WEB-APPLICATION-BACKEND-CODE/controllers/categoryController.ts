import { Request, Response, NextFunction } from "express";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
import { database } from "../database/db.js";
import { ICategory, IProductImage } from "../types/index.js";

const parseCategoryImage = (category: any) => {
  if (category && typeof category.image === "string") {
    try {
      category.image = JSON.parse(category.image);
    } catch {
      category.image = {};
    }
  }
  return category;
};

const DEFAULT_IMAGE: IProductImage = {
  url: "https://res.cloudinary.com/dhljktf9k/image/upload/v1/Ecommerce_Product_Images/default-product",
  public_id: "Ecommerce_Product_Images/default-product",
};

const uploadToCloudinary = async (image: any) => {
  if (image.tempFilePath) {
    return await cloudinary.uploader.upload(image.tempFilePath, {
      folder: "Ecommerce_Category_Images", width: 600, crop: "scale",
    });
  }
  const buffer = Buffer.isBuffer(image.data) ? image.data : Buffer.from(image.data);
  const b64 = buffer.toString("base64");
  const dataUri = `data:${image.mimetype};base64,${b64}`;
  return await cloudinary.uploader.upload(dataUri, {
    folder: "Ecommerce_Category_Images", width: 600, crop: "scale",
  });
};

export const createCategory = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, imageUrl } = req.body as { name: string; imageUrl?: string };
    if (!name || !name.trim())
      return next(new ErrorHandler("Please provide a category name.", 400));

    let image: IProductImage = { ...DEFAULT_IMAGE };
    if (req.files?.image) {
      try {
        const result = await uploadToCloudinary(req.files.image);
        image = { url: result.secure_url, public_id: result.public_id };
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        image = { ...DEFAULT_IMAGE };
      }
    } else if (imageUrl && imageUrl.trim()) {
      image = { url: imageUrl.trim(), public_id: "" };
    }

    const category = await database.query<ICategory>(
      `INSERT INTO categories (name, image) VALUES ($1, $2) RETURNING *`,
      [name.trim(), JSON.stringify(image)]
    );
    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category: parseCategoryImage(category.rows[0]),
    });
  }
);

export const fetchAllCategories = catchAsyncErrors(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await database.query(
      `SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category ILIKE c.name GROUP BY c.id ORDER BY c.name ASC`
    );
    res.status(200).json({
      success: true,
      categories: result.rows.map(parseCategoryImage),
    });
  }
);

export const updateCategory = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { categoryId } = req.params;
    const category = await database.query<ICategory>("SELECT * FROM categories WHERE id = $1", [categoryId]);
    if (category.rows.length === 0) return next(new ErrorHandler("Category not found.", 404));
    const existingCategory = parseCategoryImage(category.rows[0]);

    const bodyFields = (req.body ?? {}) as Record<string, string>;
    const hasBodyData = Object.keys(bodyFields).length > 0 && Object.values(bodyFields).some((v) => v?.toString().trim() !== "");
    const hasFiles = req.files?.image;
    if (!hasBodyData && !hasFiles) {
      res.status(200).json({ success: true, message: "Category details fetched for update.", category: existingCategory });
      return;
    }

    const updates: Record<string, string> = {};
    const name = bodyFields.name?.trim();
    if (name) updates.name = name;

    let image: IProductImage = existingCategory.image ?? { ...DEFAULT_IMAGE };
    if (hasFiles) {
      if (image.public_id) await cloudinary.uploader.destroy(image.public_id);
      try {
        const result = await uploadToCloudinary(req.files!.image);
        image = { url: result.secure_url, public_id: result.public_id };
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        image = { ...DEFAULT_IMAGE };
      }
    } else if (bodyFields.imageUrl?.trim()) {
      if (image.public_id) await cloudinary.uploader.destroy(image.public_id);
      image = { url: bodyFields.imageUrl.trim(), public_id: "" };
    }

    const fields = [...Object.keys(updates), "image"];
    const vals: unknown[] = [...Object.values(updates), JSON.stringify(image), categoryId];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await database.query<ICategory>(
      `UPDATE categories SET ${setClause} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category: parseCategoryImage(result.rows[0]),
    });
  }
);

export const deleteCategory = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { categoryId } = req.params;
    const category = await database.query<ICategory>("SELECT * FROM categories WHERE id = $1", [categoryId]);
    if (category.rows.length === 0) return next(new ErrorHandler("Category not found.", 404));
    const deleteResult = await database.query("DELETE FROM categories WHERE id = $1 RETURNING *", [categoryId]);
    if (deleteResult.rows.length === 0) return next(new ErrorHandler("Failed to delete category.", 500));
    const parsed = parseCategoryImage(category.rows[0]);
    if (parsed.image?.public_id) await cloudinary.uploader.destroy(parsed.image.public_id);
    res.status(200).json({ success: true, message: "Category deleted successfully." });
  }
);
