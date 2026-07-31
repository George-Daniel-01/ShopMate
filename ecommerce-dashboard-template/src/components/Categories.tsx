import { useEffect, useState } from "react";
import { LoaderCircle, Plus, Search, Tags } from "lucide-react";
import CreateCategoryModal from "../modals/CreateCategoryModal";
import UpdateCategoryModal from "../modals/UpdateCategoryModal";
import Header from "./Header";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCategories, deleteCategory } from "../store/slices/categorySlice";
import {
  toggleCreateCategoryModal,
  toggleUpdateCategoryModal,
} from "../store/slices/extraSlice";
import type { Category } from "../types/index";

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useAppDispatch();

  const {
    isCreateCategoryModalOpened,
    isUpdateCategoryModalOpened,
  } = useAppSelector((state) => state.extra);
  const { categories, loading, actionLoading } = useAppSelector(
    (state) => state.category
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!actionLoading) setDeletingId(null);
  }, [actionLoading]);

  const handleDelete = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    if (!window.confirm(`Delete category "${category.name}"? Products in it will keep their current category label.`))
      return;
    setDeletingId(category.id);
    dispatch(deleteCategory(category.id));
  };

  const visibleCategories = searchQuery.trim()
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  return (
    <>
      <main className="p-[10px] pl-[10px] md:pl-[17rem] w-full">
        <div className="flex-1 md:p-6">
          <Header />
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold">All Categories</h1>
              <p className="text-sm text-gray-600">
                Manage your store categories.
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm w-full sm:w-64 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
          </div>
          <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
            {loading ? (
              <div className="w-40 h-40 mx-auto border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
            ) : visibleCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {visibleCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="h-32 bg-gray-100 overflow-hidden">
                      <img
                        src={category?.image?.url || "/placeholder.png"}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">{category.name}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {category.product_count ?? 0} products
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          className="flex-1 text-white rounded-md cursor-pointer px-3 py-2 text-sm font-semibold bg-[#111827] hover:bg-gray-800"
                          onClick={() => {
                            setSelectedCategory(category);
                            dispatch(toggleUpdateCategoryModal());
                          }}
                        >
                          Update
                        </button>
                        <button
                          className="flex-1 text-white rounded-md cursor-pointer px-3 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-60 flex items-center justify-center"
                          disabled={deletingId === category.id}
                          onClick={(e) => handleDelete(e, category)}
                        >
                          {deletingId === category.id && actionLoading ? (
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Tags className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-2xl font-bold text-gray-700">
                  {searchQuery ? "No categories match your search." : "No categories yet."}
                </h3>
                <p className="text-gray-500 mt-1 text-sm">
                  Click the + button to create your first category.
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => dispatch(toggleCreateCategoryModal())}
          className="fixed bottom-6 right-6 bg-[#111827] hover:bg-gray-800 text-white p-4 rounded-full shadow-lg z-30"
          title="Create New Category"
        >
          <Plus size={20} />
        </button>
      </main>

      {isCreateCategoryModalOpened && <CreateCategoryModal />}
      {isUpdateCategoryModalOpened && (
        <UpdateCategoryModal selectedCategory={selectedCategory} />
      )}
    </>
  );
};

export default Categories;
