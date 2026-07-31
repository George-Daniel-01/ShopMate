import { v2 as cloudinary } from "cloudinary";
import { IProductImage } from "../types/index.js";

export const DEFAULT_IMAGE: IProductImage = {
  url: "https://res.cloudinary.com/dhljktf9k/image/upload/v1/Ecommerce_Product_Images/default-product",
  public_id: "Ecommerce_Product_Images/default-product",
};

/** Uploads a single image (temp file or buffer) to Cloudinary. */
export const uploadToCloudinary = async (
  image: any,
  folder: string,
  width: number
): Promise<IProductImage> => {
  let result;
  if (image.tempFilePath) {
    result = await cloudinary.uploader.upload(image.tempFilePath, {
      folder,
      width,
      crop: "scale",
    });
  } else {
    const buffer = Buffer.isBuffer(image.data) ? image.data : Buffer.from(image.data);
    const b64 = buffer.toString("base64");
    const dataUri = `data:${image.mimetype};base64,${b64}`;
    result = await cloudinary.uploader.upload(dataUri, {
      folder,
      width,
      crop: "scale",
    });
  }
  return { url: result.secure_url, public_id: result.public_id };
};

/** Parses a product row whose `images` column may be a JSON string. */
export const parseProductImages = (product: any): any => {
  if (product && typeof product.images === "string") {
    try {
      product.images = JSON.parse(product.images);
    } catch {
      product.images = [];
    }
  }
  return product;
};

/** Parses a category row whose `image` column may be a JSON string. */
export const parseCategoryImage = (category: any): any => {
  if (category && typeof category.image === "string") {
    try {
      category.image = JSON.parse(category.image);
    } catch {
      category.image = {};
    }
  }
  return category;
};
