import { useAppSelector } from "../../store/hooks";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { TopSellingProduct } from "../../types/index";

interface CustomYAxisTickProps { x?: number; y?: number; payload?: { value: string }; }
interface CustomTooltipProps { active?: boolean; payload?: { payload: TopSellingProduct }[]; }

const CustomYAxisTick = ({ x = 0, y = 0, payload }: CustomYAxisTickProps) => (
  <foreignObject x={x - 36} y={y - 16} width={32} height={32}>
    <img src={payload?.value} alt="product" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
  </foreignObject>
);

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const product = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow border text-sm">
        <p className="font-semibold">Title: {product.name}</p>
        <p>Sold: {product.total_sold}</p>
      </div>
    );
  }
  return null;
};

const TopProductsChart = () => {
  const { topSellingProducts } = useAppSelector((state) => state.admin);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h3 className="font-semibold mb-2">Top Selling Products</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart layout="vertical" data={topSellingProducts?.slice(0, 3)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barSize={50}>
          <XAxis type="number" />
          <YAxis dataKey="image" type="category" tick={<CustomYAxisTick />} width={50} />
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: "auto" }} />
          <Bar dataKey="total_sold" radius={[4, 4, 4, 4]} isAnimationActive={false}>
            {topSellingProducts?.slice(0, 3).map((_, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? "#3b82f6" : index === 1 ? "#10b981" : "#f59e0b"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart;
