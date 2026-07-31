import { X, Plus, Minus, Trash2, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  removeFromCart,
  updateCartQuantity,
} from "../../store/slices/cartSlice";
import { toggleCart } from "../../store/slices/popupSlice";

const FREE_SHIPPING_THRESHOLD = 50;

const CartSidebar = () => {
  const dispatch = useAppDispatch();
  const { isCartOpen } = useAppSelector((state) => state.popup);
  const { cart } = useAppSelector((state) => state.cart);

  const updateQuantity = (id: string, delta: number) => {
    const item = cart.find((item) => item.product.id === id);
    if (!item) return;
    
    const newQuantity = item.quantity + delta;
    
    if (newQuantity <= 0) {
      dispatch(removeFromCart({ id }));
    } else {
      dispatch(updateCartQuantity({ id, quantity: delta }));
    }
  };

  if (!isCartOpen) return null;

  const total = cart?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;
  const itemCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const shippingProgress = Math.min(total / FREE_SHIPPING_THRESHOLD, 1);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={() => dispatch(toggleCart())}
      />
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 max-w-[95vw] z-50 glass-panel animate-slide-in-right overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[hsla(var(--glass-border))]">
          <div>
            <h2 className="text-xl font-semibold text-primary">Shopping Cart</h2>
            <p className="text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 && "s"}</p>
          </div>
          <button
            onClick={() => dispatch(toggleCart())}
            className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        <div className="p-6">
          {!cart || cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Link
                to="/products"
                onClick={() => dispatch(toggleCart())}
                className="inline-block mt-4 px-6 py-2 gradient-primary text-primary-foreground rounded-lg hover:glow-on-hover animate-smooth"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <>
              {/* FREE SHIPPING PROGRESS */}
              <div className="mb-6 p-4 bg-secondary/50 border border-border rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-primary" />
                  {remainingForFreeShipping > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Add <span className="font-semibold text-foreground">${remainingForFreeShipping.toFixed(2)}</span> more for{" "}
                      <span className="font-semibold text-primary">FREE shipping</span>
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                      You've unlocked FREE shipping!
                    </p>
                  )}
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${shippingProgress * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.product.id} className="glass-card p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.images[0]?.url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-primary font-semibold">
                          ${item.product.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-2">
                      <button
                        className="p-1 rounded glass-card hover:glow-on-hover animate-smooth"
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus className="w-4 h-4 text-primary" />
                      </button>

                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        className="p-1 rounded glass-card hover:glow-on-hover animate-smooth"
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="w-4 h-4 text-primary" />
                      </button>

                      <button
                        className="p-1 rounded glass-card hover:glow-on-hover animate-smooth ml-2 text-destructive"
                        onClick={() => dispatch(removeFromCart({ id: item.product.id }))}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[hsla(var(--glass-border))] pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <Link
                  to="/cart"
                  onClick={() => dispatch(toggleCart())}
                  className="w-full block text-center gradient-primary text-primary-foreground rounded-lg hover:glow-on-hover animate-smooth font-semibold py-3"
                >
                  View Cart & Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;