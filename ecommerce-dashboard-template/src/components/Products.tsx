import { useState, useEffect } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import CreateProductModal from "../modals/CreateProductModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Header from "./Header";
import UpdateProductModal from "../modals/UpdateProductModal";
import ViewProductModal from "../modals/ViewProductModal";
import { fetchAllProducts, deleteProduct } from "../store/slices/productsSlice";
import { toggleCreateProductModal, toggleUpdateProductModal, toggleViewProductModal } from "../store/slices/extraSlice";
import type { Product } from "../types/index";

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [maxPage, setMaxPage] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const dispatch = useAppDispatch();
  const { isViewProductModalOpened, isCreateProductModalOpened, isUpdateProductModalOpened } = useAppSelector((state) => state.extra);
  const { products, totalProducts, loading } = useAppSelector((state) => state.product);

  useEffect(() => { dispatch(fetchAllProducts(page)); }, [dispatch, page]);
  useEffect(() => { if (totalProducts !== undefined) setMaxPage(Math.ceil(totalProducts / 10) || 1); }, [totalProducts]);
  useEffect(() => { if (maxPage && page > maxPage) setPage(maxPage); }, [maxPage, page]);

  return (
    <>
      <main className="p-[10px] pl-[10px] md:pl-[17rem] w-full">
        <div className="flex-1 md:p-6">
          <Header />
          <h1 className="text-2xl font-bold">All Products</h1>
          <p className="text-sm text-gray-600 mb-6">Manage all your website products.</p>
          <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
            <div className={`overflow-x-auto rounded-lg ${loading ? "p-10 shadow-none" : `${products && products.length > 0 && "shadow-lg"}`}`}>
              {loading ? (
                <div className="w-40 h-40 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : products && products.length > 0 ? (
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-blue-100 text-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left">Image</th>
                      <th className="py-3 px-4 text-left">Title</th>
                      <th className="py-3 px-4 text-left">Category</th>
                      <th className="py-3 px-4 text-left">Price</th>
                      <th className="py-3 px-4 text-left">Stock</th>
                      <th className="py-3 px-4 text-left">Ratings</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: Product, index: number) => (
                      <tr key={index} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedProduct(product); dispatch(toggleViewProductModal()); }}>
                        <td className="py-3 px-4"><img src={product?.images[0]?.url} alt={product.name} className="w-10 h-10 rounded-md object-cover" /></td>
                        <td className="px-3 py-4">{product.name}</td>
                        <td className="px-3 py-4">{product.category}</td>
                        <td className="px-3 py-4">${Number(product.price).toFixed(2)}</td>
                        <td className="px-3 py-4">{product.stock}</td>
                        <td className="px-3 py-4 text-yellow-500">{product.ratings}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <button className="text-white rounded-md cursor-pointer px-3 py-2 font-semibold bg-blue-500 hover:bg-blue-600"
                            onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); dispatch(toggleUpdateProductModal()); }}>Update</button>
                          <button className="text-white rounded-md cursor-pointer px-3 py-2 font-semibold bg-red-500 hover:bg-red-600"
                            onClick={(e) => { e.stopPropagation(); dispatch(deleteProduct(product.id, page)); }}>
                            {selectedProduct?.id === product.id && loading ? <LoaderCircle className="w-5 h-5 animate-spin" /> : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <h3 className="text-2xl p-6 font-bold">No products found.</h3>}
            </div>
            {!loading && products.length > 0 && (
              <div className="flex justify-center mt-6 gap-4">
                <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50">Previous</button>
                <span className="px-4 py-2 text-gray-700">Page {page}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={maxPage === page} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => dispatch(toggleCreateProductModal())} className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50" title="Create New Product">
          <Plus size={20} />
        </button>
      </main>
      {isCreateProductModalOpened && <CreateProductModal />}
      {isUpdateProductModalOpened && <UpdateProductModal selectedProduct={selectedProduct} />}
      {isViewProductModalOpened && <ViewProductModal selectedProduct={selectedProduct} />}
    </>
  );
};

export default Products;
