import { Request, Response, NextFunction } from "express";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
import { DEFAULT_IMAGE, uploadToCloudinary } from "../utils/imageUpload.js";
import {
  aiSearchProducts,
  createProductInDb,
  deleteProductFromDb,
  deleteProductReview,
  fetchProducts,
  getProductById,
  getProductWithReviews,
  hasPurchasedProduct,
  updateProductInDb,
  upsertProductReview,
} from "../services/productService.js";
import { IProductImage } from "../types/index.js";

const collectUploadedImages = async (req: Request): Promise<IProductImage[]> => {
  const uploadedImages: IProductImage[] = [];
  if (req.files?.images) {
    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    for (const image of images) {
      try {
        const result = await uploadToCloudinary(image, "Ecommerce_Product_Images", 1000);
        uploadedImages.push({ url: result.url, public_id: result.public_id });
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        uploadedImages.push({ ...DEFAULT_IMAGE });
      }
    }
  } else if (req.body.imageUrls) {
    let urls: string[] = [];
    try {
      urls = JSON.parse(req.body.imageUrls as string);
    } catch {
      urls = String(req.body.imageUrls)
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
    }
    for (const url of urls) uploadedImages.push({ url, public_id: "" });
  }
  if (uploadedImages.length === 0) uploadedImages.push({ ...DEFAULT_IMAGE });
  return uploadedImages;
};

export const createProduct = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { name, description, price, category, stock } = req.body as {
      name: string;
      description: string;
      price: number;
      category: string;
      stock: number;
    };
    const uploadedImages = await collectUploadedImages(req);
    const product = await createProductInDb(
      {
        name,
        description,
        price,
        category,
        stock,
        images: uploadedImages,
      },
      req.user.id
    );
    res
      .status(201)
      .json({ success: true, message: "Product created successfully.", product });
  }
);

export const fetchAllProducts = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { availability, price, category, ratings, search } = req.query as Record<
      string,
      string
    >;
    const page = parseInt(req.query.page as string) || 1;
    const result = await fetchProducts({ availability, price, category, ratings, search, page });
    res.status(200).json({ success: true, ...result });
  }
);

export const updateProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId } = req.params as { productId: string };
    const existingProduct = await getProductById(productId);

    const bodyFields = (req.body ?? {}) as Record<string, string>;
    const hasBodyData =
      Object.keys(bodyFields).length > 0 &&
      Object.values(bodyFields).some((v) => v?.toString().trim() !== "");
    const hasFiles = req.files?.images;

    if (!hasBodyData && !hasFiles) {
      res.status(200).json({
        success: true,
        message: "Product details fetched for update.",
        product: existingProduct,
      });
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
        for (const img of existingProduct.images) {
          if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
        }
      }
      const images = Array.isArray(req.files!.images) ? req.files!.images : [req.files!.images];
      uploadedImages = [];
      for (const image of images) {
        const result = await uploadToCloudinary(image, "Ecommerce_Product_Images", 1000);
        uploadedImages.push({ url: result.url, public_id: result.public_id });
      }
    }

    const updatedProduct = await updateProductInDb(productId, updates, uploadedImages);
    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      updatedProduct,
    });
  }
);

export const deleteProduct = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { productId } = req.params as { productId: string };
    const product = await getProductById(productId);
    await deleteProductFromDb(productId);
    const parsedImages = Array.isArray(product.images) ? product.images : [];
    for (const image of parsedImages) {
      if (image.public_id) await cloudinary.uploader.destroy(image.public_id);
    }
    res.status(200).json({ success: true, message: "Product deleted successfully." });
  }
);

export const fetchSingleProduct = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { productId } = req.params as { productId: string };
    const product = await getProductWithReviews(productId);
    res
      .status(200)
      .json({ success: true, message: "Product fetched successfully.", product });
  }
);

export const postProductReview = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { productId } = req.params as { productId: string };
    const { rating, comment } = req.body as { rating: number; comment: string };

    const purchased = await hasPurchasedProduct(req.user.id, productId);
    if (!purchased) {
      res
        .status(403)
        .json({ success: false, message: "You can only review a product you have purchased." });
      return;
    }

    await getProductById(productId);
    const result = await upsertProductReview(productId, req.user.id, rating, comment);
    res
      .status(200)
      .json({ success: true, message: "Review posted.", review: result.review, product: result.product });
  }
);

export const aiSearch = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { userPrompt } = req.body as { userPrompt: string };
    const result = await aiSearchProducts(userPrompt);
    res.status(200).json({ success: true, ...result });
  }
);

export const deleteReview = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { productId } = req.params as { productId: string };
    const reviewId = req.query.reviewId as string;
    if (!reviewId) throw new ErrorHandler("Review ID is required.", 400);
    const result = await deleteProductReview(productId, reviewId, req.user.id);
    res
      .status(200)
      .json({ success: true, message: "Your review has been deleted.", review: result.review, product: result.product });
  }
);
