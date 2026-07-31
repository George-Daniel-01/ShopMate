import { useState } from "react";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { closeQuickView } from "../../../app/popupSlice";
import { addToCart } from "../../cart/cartSlice";
import { toggleWishlist } from "../../wishlist/wishlistSlice";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";

const FALLBACK_IMAGE = "/avatar-holder.avif";

const QuickViewModal = () => {
  const dispatch = useAppDispatch();
  const { quickViewProduct } = useAppSelector((state) => state.popup);
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const [imageIndex, setImageIndex] = useState(0);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isWishlisted = wishlist.some((p) => p.id === product.id);
  const images = product.images?.length
    ? product.images
    : [{ url: FALLBACK_IMAGE, public_id: "" }];
  const currentImage = images[imageIndex % images.length]?.url || FALLBACK_IMAGE;

  return (
    <Modal
      isOpen={true}
      onClose={() => dispatch(closeQuickView())}
      title={product.name}
      size="xl"
      zIndex="z-[95]"
      panelClassName="max-h-[90vh] overflow-y-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* IMAGE */}
        <div className="flex flex-col items-center justify-center">
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-72 object-contain rounded-md"
          />
          {images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                    i === imageIndex % images.length ? "border-primary" : "border-border"
                  }`}
                >
                  <img
                    src={img.url || FALLBACK_IMAGE}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline">{product.category}</Badge>
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
                ? `Only ${product.stock} left`
                : "Out of Stock"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mb-3">
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
              {product.ratings} ({product.review_count || 0} reviews)
            </span>
          </div>

          <p className="text-2xl font-bold text-primary mb-4">${product.price}</p>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {product.description}
          </p>

          <div className="flex flex-col gap-2 mt-auto">
            <button
              onClick={() => dispatch(addToCart({ product, quantity: 1 }))}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch(toggleWishlist(product))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-md transition-colors text-sm font-medium ${
                  isWishlisted
                    ? "border-destructive/40 text-destructive"
                    : "border-border hover:border-primary/40 hover:text-primary"
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </button>
              <Link
                to={`/product/${product.id}`}
                onClick={() => dispatch(closeQuickView())}
                className="flex-1 flex items-center justify-center py-2.5 border border-border rounded-md hover:bg-secondary transition-colors text-sm font-medium"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuickViewModal;
