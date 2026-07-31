import React, { useState } from "react";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addToCart } from "../../cart/cartSlice";
import { toggleWishlist } from "../../wishlist/wishlistSlice";
import { openQuickView } from "../../../app/popupSlice";
import Badge from "@/components/ui/Badge";

const FALLBACK_IMAGE = "/avatar-holder.avif";

const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return url.startsWith("/") && url.length > 1;
  }
};

const ProductCard = ({ product }: { product: import("../../../types/index").Product }) => {
  const dispatch = useAppDispatch();
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const [hovered, setHovered] = useState(false);

  const images = product.images?.filter((i) => isValidImageUrl(i.url)) || [];
  const imageUrl = images[0]?.url || FALLBACK_IMAGE;
  const hoverImage = images[1]?.url || images[0]?.url || FALLBACK_IMAGE;
  const isWishlisted = wishlist.some((p) => p.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      dispatch(addToCart({ product, quantity: 1 }));
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(openQuickView(product));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (target.src !== window.location.origin + FALLBACK_IMAGE) {
      target.src = FALLBACK_IMAGE;
    }
  };

  const isNewProduct = () => {
    const createdAt = product.created_at;
    if (!createdAt) return false;
    const diffTime = Math.abs(Date.now() - new Date(createdAt).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 30;
  };

  const isTopRated = () => product.ratings >= 4.5;

  return (
    <Link
      to={`/product/${product.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col w-full bg-card border border-border rounded-2xl p-4 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 animate-smooth"
    >
      <div className="relative overflow-hidden rounded-xl mb-4 aspect-[4/3] bg-secondary/40">
        <img
          src={hovered && images.length > 1 ? hoverImage : imageUrl}
          alt={product.name}
          onError={handleImageError}
          loading="lazy"
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {isNewProduct() && <Badge>NEW</Badge>}
          {isTopRated() && <Badge variant="gold">TOP RATED</Badge>}
        </div>

        {/* Wishlist heart */}
        <button
          onClick={handleWishlist}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
            isWishlisted
              ? "bg-destructive text-white shadow-[var(--shadow-glow)]"
              : "bg-background/80 backdrop-blur text-muted-foreground hover:text-destructive opacity-100 md:opacity-0 md:group-hover:opacity-100"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Quick view */}
        <button
          onClick={handleQuickView}
          title="Quick view"
          className="absolute bottom-3 left-3 p-2 rounded-full bg-background/80 backdrop-blur text-foreground shadow-[var(--shadow-glow)] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:text-primary"
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={product.stock === 0}
          title="Add to cart"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col flex-1">
        <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
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
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.review_count || 0})
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xl font-bold text-primary">${product.price}</span>
          <Badge
            variant={
              product.stock > 5
                ? "success"
                : product.stock > 0
                ? "warning"
                : "danger"
            }
          >
            {product.stock > 5
              ? "In Stock"
              : product.stock > 0
              ? "Low Stock"
              : "Sold Out"}
          </Badge>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
