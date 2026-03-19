import React from "react";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { addToCart } from "../../store/slices/cartSlice";

const ProductCard = ({ product }: { product: import("../../types/index").Product }) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = (product: import("../../types/index").Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      dispatch(addToCart({ product, quantity: 1 }));
    }
  };

  // âœ… ADDED: Helper function to check if product is new (within 30 days)
  const isNewProduct = (product: import("../../types/index").Product) => {
    // Handle both camelCase and snake_case from backend
    const createdAt = product.created_at || product.created_at;
    if (!createdAt) return false;
    
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 30;
  };

  // âœ… ADDED: Helper function to check if product is top rated
  const isTopRated = (product: import("../../types/index").Product) => {
    return product.ratings >= 4.5;
  };

  return (
    <Link 
      key={product.id} 
      to={`/product/${product.id}`} 
      className="flex-shrink-0 w-80 glass-card hover:glow-on-hover animate-smooth group"
    >
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img 
          src={product.images?.[0]?.url} 
          alt={product.name} 
          className="w-full h-48 object-contain group-hover:scale-110 transition-transform duration-300"
        />
        
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {/* âœ… FIXED: Use helper function with proper field name handling */}
          {isNewProduct(product) && (
            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">
              NEW
            </span>
          )}
          {isTopRated(product) && (
            <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-rose-500 text-white text-xs font-semibold rounded">
              TOP RATED
            </span>
          )}
        </div>

        <button
          onClick={(e) => handleAddToCart(product, e)}
          className="absolute bottom-3 right-3 p-2 glass-card hover:glow-on-hover animate-smooth opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="w-5 h-5 text-primary" />
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.ratings || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.review_count || 0})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">
            ${product.price}
          </span>
        </div>

        <div>
          <span className={`text-xs px-2 py-1 rounded ${
            product.stock > 5
              ? "bg-green-500/20 text-green-400"
              : product.stock > 0
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-red-500/20 text-red-400"
          }`}>
            {product.stock > 5
              ? "In Stock"
              : product.stock > 0
              ? "Limited Stock"
              : "Out of Stock"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;