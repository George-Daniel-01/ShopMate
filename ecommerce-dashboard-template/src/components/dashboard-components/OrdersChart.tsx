import { useAppSelector } from "../../store/hooks";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

const statusColors: Record<string, string> = {
  Processing: "#facc15",
  Shipped: "#3b82f6",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
};

const OrdersChart = () => {
  const { orderStatusCounts } = useAppSelector((state) => state.admin);
  const orderStatusData = Object.keys(orderStatusCounts).map((status) => ({
    status,
    count: parseInt(String(orderStatusCounts[status] ?? 0)),
  }));

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h3 className="font-semibold mb-2">Order Status</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={orderStatusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
            {orderStatusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={statusColors[entry.status] || "#ccc"} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrdersChart;
