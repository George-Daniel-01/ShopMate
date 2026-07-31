import { useState, useEffect } from "react";
import { LoaderCircle, Plus, Search, AlertTriangle } from "lucide-react";
import CreateProductModal from "../modals/CreateProductModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Header from "./Header";
import UpdateProductModal from "../modals/UpdateProductModal";
import ViewProductModal from "../modals/ViewProductModal";
import { fetchAllProducts, deleteProduct } from "../store/slices/productsSlice";
import {
  toggleCreateProductModal,
  toggleUpdateProductModal,
  toggleViewProductModal,
} from "../store/slices/extraSlice";
import type { Product } from "../types/index";

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [maxPage, setMaxPage] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useAppDispatch();

  const {
    isViewProductModalOpened,
    isCreateProductModalOpened,
    isUpdateProductModalOpened,
  } = useAppSelector((state) => state.extra);

  // ✅ FIX: Destructure both loading (table fetch) and actionLoading (actions)
  const { products, totalProducts, loading, actionLoading } = useAppSelector(
    (state) => state.product
  );

  useEffect(() => {
    dispatch(fetchAllProducts(page));
  }, [dispatch, page]);

  useEffect(() => {
    if (totalProducts !== undefined)
      setMaxPage(Math.ceil(totalProducts / 10) || 1);
  }, [totalProducts]);

  useEffect(() => {
    if (maxPage && page > maxPage) setPage(maxPage);
  }, [maxPage, page]);

  // ✅ Clear deletingId once actionLoading finishes
  useEffect(() => {
    if (!actionLoading) setDeletingId(null);
  }, [actionLoading]);

  const handleDelete = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setDeletingId(product.id);
    dispatch(deleteProduct(product.id, page));
  };

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const visibleProducts = searchQuery.trim()
    ? products.filter((p) =>
        `${p.name} ${p.category}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <>
      <main className="p-[10px] pl-[10px] md:pl-[17rem] w-full">
        <div className="flex-1 md:p-6">
          <Header />
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold">All Products</h1>
              <p className="text-sm text-gray-600">
                Manage all your website products.
                {lowStockCount > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-amber-600 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> {lowStockCount} low in stock
                  </span>
                )}
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm w-64 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
          </div>
          <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
            <div
              className={`overflow-x-auto rounded-lg ${
                // ✅ FIX: Only `loading` (fetch) triggers the full table spinner.
                // `actionLoading` (delete/update) never hides the table.
                loading
                  ? "p-10 shadow-none"
                  : `${products && products.length > 0 && "shadow-lg"}`
              }`}
            >
              {loading ? (
                // Full-table spinner only on initial/page fetch
                <div className="w-40 h-40 mx-auto border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              ) : products && products.length > 0 ? (
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700">
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
                    {visibleProducts.map((product: Product, index: number) => (
                      <tr
                        key={product.id}
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(product);
                          dispatch(toggleViewProductModal());
                        }}
                      >
                        <td className="py-3 px-4">
                          <img
                            src={product?.images?.[0]?.url || "/placeholder.png"}
                            alt={product.name}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        </td>
                        <td className="px-3 py-4">{product.name}</td>
                        <td className="px-3 py-4">{product.category}</td>
                        <td className="px-3 py-4">
                          ${Number(product.price).toFixed(2)}
                        </td>
                        <td className="px-3 py-4">
                          {product.stock === 0 ? (
                            <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">Out of stock</span>
                          ) : product.stock <= 5 ? (
                            <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded">{product.stock} left</span>
                          ) : (
                            product.stock
                          )}
                        </td>
                        <td className="px-3 py-4 text-yellow-500">
                          {product.ratings}
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          {/* Update button — opens modal, no loading state needed here */}
                          <button
                            className="text-white rounded-md cursor-pointer px-3 py-2 font-semibold bg-[#111827] hover:bg-gray-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                              dispatch(toggleUpdateProductModal());
                            }}
                          >
                            Update
                          </button>

                          {/* ✅ Delete button — spinner only on its own row */}
                          <button
                            className="text-white rounded-md cursor-pointer px-3 py-2 font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-60 min-w-[72px] flex items-center justify-center"
                            disabled={deletingId === product.id}
                            onClick={(e) => handleDelete(e, product)}
                          >
                            {deletingId === product.id && actionLoading ? (
                              <LoaderCircle className="w-5 h-5 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <h3 className="text-2xl p-6 font-bold">No products found.</h3>
              )}
            </div>

            {/* ✅ Pagination stays visible during actionLoading too */}
            {!loading && products.length > 0 && (
              <div className="flex justify-center mt-6 gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-[#111827] hover:bg-gray-800 text-white rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={maxPage === page}
                  className="px-4 py-2 bg-[#111827] hover:bg-gray-800 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => dispatch(toggleCreateProductModal())}
          className="fixed bottom-6 right-6 bg-[#111827] hover:bg-gray-800 text-white p-4 rounded-full shadow-lg z-50"
          title="Create New Product"
        >
          <Plus size={20} />
        </button>
      </main>

      {isCreateProductModalOpened && <CreateProductModal />}
      {isUpdateProductModalOpened && (
        <UpdateProductModal selectedProduct={selectedProduct} />
      )}
      {isViewProductModalOpened && (
        <ViewProductModal selectedProduct={selectedProduct} />
      )}
    </>
  );
};

export default Products;