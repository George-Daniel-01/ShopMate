import React, { useEffect, useState } from "react";
import { Filter, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { Link, useNavigate } from "react-router-dom";
import { fetchMyOrders, cancelOrder } from "../orderSlice";
import { addToCart } from "../../cart/cartSlice";
import { openAuthPopup } from "../../../app/popupSlice";
import { toast } from "react-toastify";

const Orders = (): React.JSX.Element | null => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { myOrders } = useAppSelector((state) => state.order);
  const { authUser } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigateTo = useNavigate();

  useEffect(() => {
    // Only fetch orders while signed in
    if (!authUser) return;

    // Fetch immediately on mount
    dispatch(fetchMyOrders());

    // âœ… FIX: Auto-refresh every 30 seconds so admin status changes reflect here
    const interval = setInterval(() => {
      dispatch(fetchMyOrders());
    }, 30000);

    // Cleanup interval when user leaves the page
    return () => clearInterval(interval);
  }, [dispatch, authUser]);

  const handleReorder = (order: import("../../../types/index").Order) => {
    order?.order_items?.forEach((item) => {
      dispatch(addToCart({
        product: {
          id: item.product_id,
          name: item.title,
          description: "",
          price: Number(item.price),
          category: "",
          ratings: 0,
          images: item.image ? [{ url: item.image, public_id: "" }] : [],
          stock: 999,
          created_by: "",
          created_at: new Date().toISOString(),
        },
        quantity: item.quantity,
      }));
    });
    toast.success("Items added back to your cart");
    navigateTo("/cart");
  };

  const handleCancelOrder = (orderId: string) => {
    dispatch(cancelOrder(orderId));
  };

  const filterOrders = myOrders.filter(
    (order) => statusFilter === "All" || order.order_status === statusFilter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Processing":
        return <Package className="w-5 h-5 text-yellow-500" />;
      case "Shipped":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "Delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-500/20 text-yellow-400";
      case "Shipped":
        return "bg-blue-500/20 text-blue-400";
      case "Delivered":
        return "bg-green-500/20 text-green-400";
      case "Cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const statusArray = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

  if (!authUser) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center glass-panel max-w-md mx-4">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Please Sign In
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to view your order history, track deliveries, and reorder items.
          </p>
          <button
            onClick={() => dispatch(openAuthPopup())}
            className="w-full inline-flex justify-center items-center px-6 py-3 rounded-lg text-primary-foreground gradient-primary hover:glow-on-hover animate-smooth font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Orders
            </h1>
            <p className="text-muted-foreground">
              Track and manage your order history.
            </p>
          </div>

          {/* STATUS FILTER */}
          <div className="glass-card p-4 mb-8">
            <div className="flex items-center space-x-4 flex-wrap">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-primary" />
                <span className="font-medium">Filter by status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {statusArray.map((status) => {
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                        statusFilter === status
                          ? "gradient-primary text-primary-foreground"
                          : "glass-card hover:glow-on-hover text-foreground"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ORDERS LIST */}
          {filterOrders.length === 0 ? (
            <div className="text-center glass-panel max-w-md mx-auto">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No Orders Found
              </h2>
              <p className="text-muted-foreground">
                {statusFilter === "All"
                  ? "You haven't placed any orders yet."
                  : `No orders with status "${statusFilter}" found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filterOrders.map((order) => {
                return (
                  <div key={order.id} className="glass-card p-6">
                    {/* ORDER HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          Orders #{order.id}
                        </h3>
                        <p className="text-muted-foreground">
                          Placed on{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.order_status)}
                          <span
                            className={`px-3 py-1 rounded text-sm font-medium capitalize ${getStatusColor(
                              order.order_status
                            )}`}
                          >
                            {order.order_status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-xl font-bold text-primary">
                            ${order.total_price}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ORDER ITEMS */}
                    <div className="space-y-4">
                      {order?.order_items?.map((item) => {
                        return (
                          <div
                            key={item.product_id}
                            className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-secondary/50 rounded-lg"
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">
                                {item.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                ${item.price}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* ORDER ACTIONS */}
                    <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-[hsla(var(--glass-border))]">
                      <button
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        className="px-4 py-2 glass-card hover:glow-on-hover animate-smooth text-sm"
                      >
                        {expandedId === order.id ? "Hide Details" : "View Details"}
                      </button>
                      {order.order_status === "Delivered" && (
                        <>
                          {order?.order_items?.map((item) => (
                            <Link
                              key={item.product_id}
                              to={`/product/${item.product_id}`}
                              className="px-4 py-2 glass-card hover:glow-on-hover animate-smooth text-sm"
                            >
                              Write Review
                            </Link>
                          ))}
                          <button
                            onClick={() => handleReorder(order)}
                            className="px-4 py-2 glass-card hover:glow-on-hover animate-smooth text-sm"
                          >
                            Reorder
                          </button>
                        </>
                      )}
                      {order.order_status === "Processing" && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-4 py-2 glass-card hover:glow-on-hover animate-smooth text-sm text-destructive"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>

                    {expandedId === order.id && (
                      <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">Shipping Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p><span className="font-medium text-foreground">Name:</span> {order.shipping_info?.full_name}</p>
                            <p><span className="font-medium text-foreground">Phone:</span> {order.shipping_info?.phone}</p>
                            <p><span className="font-medium text-foreground">Email:</span> {order.shipping_info?.country}</p>
                          </div>
                          <div>
                            <p><span className="font-medium text-foreground">Address:</span> {order.shipping_info?.address}</p>
                            <p><span className="font-medium text-foreground">City:</span> {order.shipping_info?.city}, {order.shipping_info?.state}</p>
                            <p><span className="font-medium text-foreground">ZIP:</span> {order.shipping_info?.pincode}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;