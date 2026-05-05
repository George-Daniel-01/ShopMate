import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createNewProduct } from "../store/slices/productsSlice";
import { toggleCreateProductModal } from "../store/slices/extraSlice";
import { LoaderCircle } from "lucide-react";

const categoryOptions = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Beauty", "Automotive", "Kids & Baby"];

const CreateProductModal = () => {

  const { actionLoading } = useAppSelector((state) => state.product as any);
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", category: "Electronics", stock: "", images: [] as File[]
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Please enter a product title.");
    if (!formData.price) return alert("Please enter a price.");
    if (!formData.stock) return alert("Please enter stock quantity.");
    if (!formData.description.trim()) return alert("Please enter a description.");
    if (actionLoading) return; 

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("stock", formData.stock);
    formData.images.forEach((img) => data.append("images", img));
    dispatch(createNewProduct(data));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative">

        <button
          onClick={() => { if (!actionLoading) dispatch(toggleCreateProductModal()); }}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Create New Product</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border px-4 py-2 rounded"
            required
          />
          <select
            className="w-full border p-2 rounded-lg"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            {categoryOptions.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
          </select>
          <input
            type="number"
            placeholder="Price (₦) *"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="border px-4 py-2 rounded"
            min="0"
            required
          />
          <input
            type="number"
            placeholder="Stock *"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="border px-4 py-2 rounded"
            min="0"
            required
          />
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Product Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, images: Array.from(e.target.files ?? []) })}
              className="border px-4 py-2 rounded w-full"
            />
     
            {formData.images.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                 {formData.images.length} image(s) selected: {formData.images.map(f => f.name).join(", ")}
              </p>
            )}
          </div>
          <textarea
            placeholder="Description *"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border px-4 py-2 rounded col-span-1 md:col-span-2"
            rows={4}
            required
          />

          <button
            type="submit"
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-2 px-6 rounded col-span-1 md:col-span-2"
          >
            {actionLoading
              ? <><LoaderCircle className="w-6 h-6 animate-spin" /> Creating...</>
              : "Add New Product"
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;