import { Request, Response, NextFunction } from "express";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { v2 as cloudinary } from "cloudinary";
import { DEFAULT_IMAGE, uploadToCloudinary } from "../utils/imageUpload.js";
import {
  createCategoryInDb,
  deleteCategoryFromDb,
  fetchAllCategories,
  getCategoryById,
  updateCategoryInDb,
} from "../services/categoryService.js";
import { IProductImage } from "../types/index.js";

export const createCategory = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { name, imageUrl } = req.body as { name: string; imageUrl?: string };

    let image: IProductImage = { ...DEFAULT_IMAGE };
    if (req.files?.image) {
      try {
        const result = await uploadToCloudinary(req.files.image, "Ecommerce_Category_Images", 600);
        image = { url: result.url, public_id: result.public_id };
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        image = { ...DEFAULT_IMAGE };
      }
    } else if (imageUrl && imageUrl.trim()) {
      image = { url: imageUrl.trim(), public_id: "" };
    }

    const category = await createCategoryInDb(name, image);
    res.status(201).json({ success: true, message: "Category created successfully.", category });
  }
);

export const fetchAllCategoriesController = catchAsyncErrors(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const categories = await fetchAllCategories();
    res.status(200).json({ success: true, categories });
  }
);

export const updateCategory = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { categoryId } = req.params as { categoryId: string };
    const existingCategory = await getCategoryById(categoryId);

    const bodyFields = (req.body ?? {}) as Record<string, string>;
    const hasBodyData =
      Object.keys(bodyFields).length > 0 &&
      Object.values(bodyFields).some((v) => v?.toString().trim() !== "");
    const hasFiles = req.files?.image;
    if (!hasBodyData && !hasFiles) {
      res.status(200).json({
        success: true,
        message: "Category details fetched for update.",
        category: existingCategory,
      });
      return;
    }

    const updates: Record<string, string> = {};
    const name = bodyFields.name?.trim();
    if (name) updates.name = name;

    let image: IProductImage = existingCategory.image ?? { ...DEFAULT_IMAGE };
    if (hasFiles) {
      if (image.public_id) await cloudinary.uploader.destroy(image.public_id);
      try {
        const result = await uploadToCloudinary(req.files!.image, "Ecommerce_Category_Images", 600);
        image = { url: result.url, public_id: result.public_id };
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        image = { ...DEFAULT_IMAGE };
      }
    } else if (bodyFields.imageUrl?.trim()) {
      if (image.public_id) await cloudinary.uploader.destroy(image.public_id);
      image = { url: bodyFields.imageUrl.trim(), public_id: "" };
    }

    const category = await updateCategoryInDb(categoryId, updates, image);
    res.status(200).json({ success: true, message: "Category updated successfully.", category });
  }
);

export const deleteCategory = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { categoryId } = req.params as { categoryId: string };
    const category = await getCategoryById(categoryId);
    await deleteCategoryFromDb(categoryId);
    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image!.public_id);
    }
    res.status(200).json({ success: true, message: "Category deleted successfully." });
  }
);
