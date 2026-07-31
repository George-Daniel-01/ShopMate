import { Heart, ShoppingCart, Trash2, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { removeFromWishlist, clearWishlist } from "../store/slices/wishlistSlice";
import { addToCart } from "../store/slices/cartSlice";
import { toggleCart } from "../store/slices/popupSlice";

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

const Wishlist = () => {
  const dispatch = useAppDispatch();
  const { wishlist } = useAppSelector((state) => state.wishlist);

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-8">
            Save the products you love and find them here anytime.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-semibold"
          >
            Browse Products <MoveRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
            <p className="text-muted-foreground mt-1">
              {wishlist.length} item{wishlist.length !== 1 && "s"} saved
            </p>
          </div>
          <button
            onClick={() => dispatch(clearWishlist())}
            className="flex items-center gap-2 px-4 py-2 text-sm text-destructive border border-destructive/30 rounded-md hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const imageUrl = isValidImageUrl(product.images?.[0]?.url)
              ? product.images[0].url
              : FALLBACK_IMAGE;
            return (
              <div
                key={product.id}
                className="bg-card border border-border rounded-md p-4 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 group"
              >
                <Link to={`/product/${product.id}`} className="block relative overflow-hidden rounded-md mb-3">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-44 object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded">
                      Out of Stock
                    </span>
                  )}
                </Link>

                <h3 className="font-semibold text-foreground mb-1 truncate">
                  <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors">
                    {product.name}
                  </Link>
                </h3>
                <p className="text-xl font-bold text-primary mb-3">${product.price}</p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch(addToCart({ product, quantity: 1 }))}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                  <button
                    onClick={() => dispatch(removeFromWishlist(product.id))}
                    className="p-2 border border-border rounded-md text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
