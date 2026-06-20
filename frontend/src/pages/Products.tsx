import { Search, Sparkles, Star, Filter } from "lucide-react";
import { categories } from "../data/products";
import ProductCard from "../components/Products/ProductCard";
import Pagination from "../components/Products/Pagination";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { fetchAllProducts } from "../store/slices/productSlice";
import { toggleAIModal } from "../store/slices/popupSlice";

const Products = () => {
  const { products, totalProducts, loading } = useAppSelector((state) => state.product);

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  const query = useQuery();
  const searchTerm = query.get("search");
  const searchedCategory = query.get("category");

  const [searchQuery, setSearchQuery] = useState(searchTerm ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm ?? "");
  const [selectedCategory, setSelectedCategory] = useState(searchedCategory ?? "");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [availability, setAvailability] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    setSelectedCategory(searchedCategory ?? "");
    setCurrentPage(1);
  }, [searchedCategory]);

  useEffect(() => {
    setSearchQuery(searchTerm ?? "");
    setDebouncedSearch(searchTerm ?? "");
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    dispatch(
      fetchAllProducts({
        category: selectedCategory,
        price: `${priceRange[0]}-${priceRange[1]}`,
        search: debouncedSearch,
        ratings: selectedRating,
        availability: availability,
        page: currentPage,
      })
    );
  }, [dispatch, selectedCategory, priceRange, debouncedSearch, selectedRating, availability, currentPage]);

  const totalPages = Math.ceil(totalProducts / 10);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedCategory("");
    setPriceRange([0, 10000]);
    setSelectedRating(0);
    setAvailability("");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "" ||
    priceRange[1] !== 10000 ||
    selectedRating !== 0 ||
    availability !== "";

  return (
    <>
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* MOBILE FILTER TOGGLE */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden mb-4 p-3 glass-card hover:glow-on-hover animate-smooth flex items-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>

            {/* SIDEBAR FILTERS */}
            <div className={`lg:block ${isMobileFilterOpen ? "block" : "hidden"} w-full lg:w-80 space-y-6`}>
              <div className="glass-panel">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Filters</h2>
                  {hasActiveFilters && (
                    <button onClick={handleResetFilters} className="text-sm text-primary hover:underline">
                      Reset All
                    </button>
                  )}
                </div>

                {/* PRICE RANGE */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <input
                      type="range" min="0" max="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* RATING */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                        className={`flex items-center space-x-2 w-full p-2 rounded ${selectedRating === rating ? "bg-primary/20" : "hover:bg-secondary"}`}
                      >
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                        ))}
                        <span className="text-sm">& Up</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AVAILABILITY */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">Availability</h3>
                  <div className="space-y-2">
                    {["in-stock", "limited", "out-of-stock"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setAvailability(availability === status ? "" : status)}
                        className={`w-full p-2 text-left rounded ${availability === status ? "bg-primary/20" : "hover:bg-secondary"}`}
                      >
                        {status === "in-stock" ? "In Stock" : status === "limited" ? "Limited Stock" : "Out of Stock"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CATEGORY */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">Category</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`w-full p-2 text-left rounded ${!selectedCategory ? "bg-primary/20" : "hover:bg-secondary"}`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full p-2 text-left rounded ${selectedCategory === category.name ? "bg-primary/20" : "hover:bg-secondary"}`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1">
              {/* SEARCH BAR */}
              <div className="mb-8 flex max-[440px]:flex-col items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search Products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none text-foreground placeholder-muted-foreground"
                  />
                </div>
                <button
                  onClick={() => dispatch(toggleAIModal())}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Search</span>
                </button>
              </div>

              {/* LOADING / PRODUCTS */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="glass-card animate-pulse">
                      <div className="w-full h-48 bg-secondary rounded-lg mb-4" />
                      <div className="h-5 bg-secondary rounded w-3/4 mb-2" />
                      <div className="h-4 bg-secondary rounded w-1/2 mb-2" />
                      <div className="h-6 bg-secondary rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  )}

                  {products.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-lg mb-4">No products found matching your criteria.</p>
                      {hasActiveFilters && (
                        <button onClick={handleResetFilters} className="text-primary hover:underline text-sm">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;

