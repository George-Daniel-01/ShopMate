import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Plus,
  Minus,
  Loader,
  CircleDollarSign,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { toast } from "react-toastify";
import { openAuthPopup, setPendingCheckout } from "../../../app/popupSlice";
import ReviewsContainer from "../components/ReviewsContainer";
import ProductCard from "../components/ProductCard";
import { addToCart } from "../../cart/cartSlice";
import { toggleWishlist } from "../../wishlist/wishlistSlice";
import { fetchProductDetails, resetProductDetails } from "../productSlice";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigateTo = useNavigate();
  const product = useAppSelector((state) => state.product?.productDetails);
  const { loading, productReviews, products } = useAppSelector((state) => state.product);
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const { authUser } = useAppSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const isWishlisted = product ? wishlist.some((p) => p.id === product.id) : false;

  const handleAddToCart = () => dispatch(addToCart({ product: product!, quantity }));

  const handleCopyURL = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("URL Copied!"))
      .catch((err) => console.error("Failed to copy:", err));
  };

  const handleBuyNow = () => {
    // Add to cart first so the item is saved for a guest who signs in
    dispatch(addToCart({ product: product!, quantity }));
    if (!authUser) {
      dispatch(setPendingCheckout());
      dispatch(openAuthPopup());
      toast.info("Please sign in to complete your purchase.");
      return;
    }
    navigateTo("/payment");
  };

  useEffect(() => {
    dispatch(resetProductDetails());
    dispatch(fetchProductDetails(id!));
  }, [dispatch, id]);

  // âœ… loading BEFORE !product â€” spinner shows while API is in flight
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground">The product you're looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* BREADCRUMB */}
        <nav className="text-sm text-muted-foreground mb-6 flex flex-wrap items-center gap-1 sm:gap-2">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* IMAGES */}
          <div>
            <div className="glass-card p-4 mb-4">
              {product.images?.length ? (
                <img
                  src={product.images[selectedImage % product.images.length]?.url}
                  alt={product.name}
                  className="w-full h-56 sm:h-80 lg:h-96 object-contain rounded-lg"
                />
              ) : (
                <img
                  src="/avatar-holder.avif"
                  alt={product.name}
                  className="w-full h-56 sm:h-80 lg:h-96 object-contain rounded-lg"
                />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={image?.url} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* DETAILS */}
          <div>
            <div className="flex space-x-2 mb-4">
              {(new Date().getTime() - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 && (
                <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">NEW</span>
              )}
              {product.ratings >= 4.5 && (
                <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-rose-500 text-white text-xs font-semibold rounded">TOP RATED</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{product.name}</h1>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.ratings) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-foreground font-medium">{product.ratings}</span>
              <span className="text-muted-foreground">({productReviews?.length}) reviews</span>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <span className="text-2xl font-bold text-primary">${product.price}</span>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <span className="text-muted-foreground">Category: {product.category}</span>
              <span className={`px-3 py-1 rounded text-sm ${product.stock > 5 ? "bg-green-500/10 text-green-600 dark:text-green-400" : product.stock > 0 ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                {product.stock > 5 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} left in stock` : "Out of Stock"}
              </span>
            </div>

            <div className="glass-card p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-lg font-medium">Quantity:</span>
                <div className="flex items-center space-x-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 glass-card hover:glow-on-hover animate-smooth">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 glass-card hover:glow-on-hover animate-smooth">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex items-center justify-center space-x-2 py-3 gradient-primary text-primary-foreground rounded-lg hover:glow-on-hover animate-smooth font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  <ShoppingCart className="w-5 h-5" /><span>Add to Cart</span>
                </button>
                <button onClick={handleBuyNow} disabled={product.stock === 0} className="flex items-center justify-center space-x-2 py-3 bg-card border border-border text-foreground rounded-lg hover:bg-secondary animate-smooth font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  <CircleDollarSign className="w-5 h-5" /><span>Buy Now</span>
                </button>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <button
                  onClick={() => dispatch(toggleWishlist(product))}
                  className={`flex items-center space-x-2 animate-smooth transition-colors ${isWishlisted ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                  <span>{isWishlisted ? "In Wishlist" : "Add to Wishlist"}</span>
                </button>
                <button onClick={handleCopyURL} className="flex items-center space-x-2 text-muted-foreground hover:text-primary animate-smooth">
                  <Share2 className="w-5 h-5" /><span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="glass-panel">
          <div className="flex border-b border-[hsla(var(--glass-border))]">
            {["description", "reviews"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize transition-all ${activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "description" && (
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Product Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}
            {activeTab === "reviews" && (
              <ReviewsContainer product={product} productReviews={productReviews} />
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

