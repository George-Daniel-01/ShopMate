import { database } from "../database/db.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { parseCategoryImage } from "../utils/imageUpload.js";
import { ICategory, IProductImage } from "../types/index.js";

export const createCategoryInDb = async (
  name: string,
  image: IProductImage
): Promise<ICategory> => {
  const category = await database.query<ICategory>(
    `INSERT INTO categories (name, image) VALUES ($1, $2) RETURNING *`,
    [name.trim(), JSON.stringify(image)]
  );
  return parseCategoryImage(category.rows[0]);
};

export const fetchAllCategories = async (): Promise<ICategory[]> => {
  const result = await database.query(
    `SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category ILIKE c.name GROUP BY c.id ORDER BY c.name ASC`
  );
  return result.rows.map(parseCategoryImage);
};

export const getCategoryById = async (categoryId: string): Promise<ICategory> => {
  const category = await database.query<ICategory>("SELECT * FROM categories WHERE id = $1", [
    categoryId,
  ]);
  if (category.rows.length === 0) throw new ErrorHandler("Category not found.", 404);
  return parseCategoryImage(category.rows[0]);
};

export const updateCategoryInDb = async (
  categoryId: string,
  updates: Record<string, string>,
  image: IProductImage
): Promise<ICategory> => {
  const fields = [...Object.keys(updates), "image"];
  const vals: unknown[] = [...Object.values(updates), JSON.stringify(image), categoryId];
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const result = await database.query<ICategory>(
    `UPDATE categories SET ${setClause} WHERE id = $${vals.length} RETURNING *`,
    vals
  );
  return parseCategoryImage(result.rows[0]);
};

export const deleteCategoryFromDb = async (categoryId: string): Promise<void> => {
  const deleteResult = await database.query("DELETE FROM categories WHERE id = $1 RETURNING *", [
    categoryId,
  ]);
  if (deleteResult.rows.length === 0) throw new ErrorHandler("Failed to delete category.", 500);
};
