import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Header from "./Header";
import { deleteOrder, fetchAllOrders, updateOrderStatus } from "../store/slices/orderSlice";
import type { Order, OrderItem } from "../types/index";

const exportOrdersCSV = (orders: Order[]) => {
  const header = "Order ID,Status,Customer,Email,Total,Placed At,Items";
  const rows = orders.map((o) => {
    const items = (o.order_items || [])
      .map((it) => `${it.title} x${it.quantity}`)
      .join("; ");
    return [
      `"${o.id}"`,
      `"${o.order_status}"`,
      `"${o.shipping_info?.full_name || ""}"`,
      `"${o.shipping_info?.phone || ""}"`,
      o.total_price,
      `"${new Date(o.created_at).toLocaleString()}"`,
      `"${items.replace(/"/g, '""')}"`,
    ].join(",");
  });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const Orders = () => {
  const statusFilters = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];
  const updateStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.auth);
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>({});
  const [filterByStatus, setFilterByStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  useEffect(() => { dispatch(fetchAllOrders()); }, [dispatch]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setSelectedStatus((prev) => ({ ...prev, [orderId]: newStatus }));
    dispatch(updateOrderStatus({ orderId, status: newStatus }));
  };

  const filteredOrders = (orders || []).filter((o: Order) => {
    if (filterByStatus !== "All" && o.order_status !== filterByStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      (o.shipping_info?.full_name || "").toLowerCase().includes(q) ||
      (o.shipping_info?.phone || "").includes(q) ||
      (o.order_items || []).some((it) => it.title.toLowerCase().includes(q))
    );
  });
  const confirmDelete = () => {
    if (deleteConfirm.id) dispatch(deleteOrder(deleteConfirm.id));
    setDeleteConfirm({ open: false, id: null });
  };

  return (
    <main className="p-[10px] pl-[10px] md:pl-[17rem] w-full">
      <div className="p-6">
        <Header />
        <h1 className="text-2xl font-bold mt-4">All Orders</h1>
        <p className="text-sm text-gray-600 mb-6">Manage all your orders.</p>
      </div>
      {loading ? (
        <div className="w-40 h-40 mx-auto border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center gap-3 p-6">
            <div className="flex flex-wrap gap-3 items-center">
              <select value={filterByStatus} onChange={(e) => setFilterByStatus(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
                {statusFilters.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders, customers, items..."
                  className="border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm w-64 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
            </div>
            <button
              onClick={() => exportOrdersCSV(filteredOrders)}
              disabled={filteredOrders.length === 0}
              className="flex items-center gap-2 bg-[#111827] hover:bg-gray-800 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV ({filteredOrders.length})
            </button>
          </div>
          {filteredOrders.length === 0 ? <p className="p-10">No orders found.</p> : (
            <>
              {filteredOrders.map((order: Order) => (
                <div key={order.id} className="bg-white shadow-lg rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <p><strong>Order ID:</strong> {order.id}</p>
                      <p><strong>Status:</strong> {order.order_status}</p>
                      <p><strong>Placed At:</strong> {new Date(order.created_at).toLocaleString()}</p>
                      <p><strong>Total Amount:</strong> ${order.total_price}</p>
                    </div>
                    <div>
                      <select value={selectedStatus[order.id] || order.order_status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="border p-2 rounded mb-2" disabled={user?.role !== "ADMIN"}>
                        {updateStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => setDeleteConfirm({ open: true, id: order.id })} className="ml-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1">Delete</button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-lg mb-1">Shipping Info</h4>
                    <p><strong>Name:</strong> {order.shipping_info?.full_name}</p>
                    <p><strong>Phone:</strong> {order.shipping_info?.phone}</p>
                    <p><strong>Address:</strong> {order.shipping_info?.address}, {order.shipping_info?.city}, {order.shipping_info?.state}, {order.shipping_info?.pincode}</p>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-lg mb-2">Ordered Items</h4>
                    {Array.isArray(order.order_items) && order.order_items.map((item: OrderItem) => (
                      <div key={item.order_item_id} className="flex items-center gap-4 mb-2 border-b pb-2">
                        {item.image && <img src={item.image} alt={item.title} className="w-16 h-16 object-cover cursor-pointer" onClick={() => setPreviewImage(item.image)} />}
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p><strong>Qty:</strong> {item.quantity} | <strong>Price:</strong> ${item.price} | <strong>Total:</strong> ${item.quantity * item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="preview" className="max-w-[90%] max-h-[90%] rounded shadow-xl" />
        </div>
      )}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50" onClick={() => setDeleteConfirm({ open: false, id: null })}>
          <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to delete this order?</h3>
            <div className="flex justify-center gap-4">
              <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Yes, Delete</button>
              <button onClick={() => setDeleteConfirm({ open: false, id: null })} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Orders;
