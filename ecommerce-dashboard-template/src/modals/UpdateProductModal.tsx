import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleUpdateProductModal } from "../store/slices/extraSlice";
import { LoaderCircle } from "lucide-react";
import { updateProduct } from "../store/slices/productsSlice";
import { fetchCategories } from "../store/slices/categorySlice";
import type { Product } from "../types/index";

const fallbackCategories = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Beauty", "Automotive", "Kids & Baby"];

const UpdateProductModal = ({
  selectedProduct,
}: {
  selectedProduct: Product | null;
}) => {
  const { actionLoading } = useAppSelector((state) => state.product);
  const { categories } = useAppSelector((state) => state.category);
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [replacingImages, setReplacingImages] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name || "",
        description: selectedProduct.description || "",
        price: String(selectedProduct.price) || "",
        category: selectedProduct.category || "",
        stock: String(selectedProduct.stock) || "",
      });
      setImages([]);
      setPreviews(selectedProduct.images?.map((img) => img.url) ?? []);
      setReplacingImages(false);
    }
  }, [selectedProduct]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const categoryOptions = categories.length > 0 ? categories.map((c) => c.name) : fallbackCategories;

  const addImages = (files: File[]) => {
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    setReplacingImages(true);
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const imageFiles: File[] = [];
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) addImages(imageFiles);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("stock", formData.stock);
    images.forEach((img) => data.append("images", img));
    dispatch(updateProduct(data, selectedProduct.id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4" onPaste={handlePaste}>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full max-w-2xl p-6 relative">
        <button
          onClick={() => dispatch(toggleUpdateProductModal())}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Update Product</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Title"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border px-4 py-2 rounded"
          />
          <select
            className="w-full border p-2 rounded-lg"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          >
            {categoryOptions.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="border px-4 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Stock"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            className="border px-4 py-2 rounded"
          />
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Product Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors">
              <p className="text-gray-500 text-sm mb-2">
                {replacingImages
                  ? "New images will replace the current ones."
                  : "Paste (Ctrl+V) - Drag & Drop - or Choose Files"}
              </p>
              <input type="file" multiple accept="image/*" onChange={(e) => addImages(Array.from(e.target.files ?? []))} className="hidden" id="updateFileInput" />
              <label htmlFor="updateFileInput" className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded cursor-pointer text-sm">Choose Files</label>
            </div>
            {previews.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="" className="w-16 h-16 object-cover rounded border" />
                    {replacingImages && (
                      <button type="button" onClick={() => { setPreviews(p => p.filter((_, idx) => idx !== i)); setImages(prev => prev.filter((_, idx) => idx !== i - (selectedProduct?.images?.length ?? 0))); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">x</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border px-4 py-2 rounded col-span-1 md:col-span-2"
            rows={4}
          />
          <button
            type="submit"
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-2 px-6 rounded col-span-1 md:col-span-2"
          >
            {actionLoading ? (
              <>
                <LoaderCircle className="w-6 h-6 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Product"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProductModal;
