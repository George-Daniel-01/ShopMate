import { useAppSelector } from "../../../app/hooks";
import type { TopSellingProduct } from "../../../types/index";

const TopSellingProducts = () => {
  const { topSellingProducts } = useAppSelector((state) => state.admin);

  return (
    <div className="bg-card rounded-xl p-6 shadow-card overflow-x-auto xl:col-span-2 max-h-[440px] scrollbar-hide">
      <h2 className="text-lg font-semibold mb-2">Top Products</h2>
      <p className="text-sm text-muted-foreground mb-4">Products having most sales</p>
      <table className="min-w-[600px] w-full text-sm text-left">
        <thead className="bg-muted text-foreground">
          <tr>
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Total Sold</th>
            <th className="px-4 py-2">Rating</th>
          </tr>
        </thead>
        <tbody>
          {topSellingProducts.length > 0 && topSellingProducts.map((element: TopSellingProduct, index: number) => (
            <tr key={index} className="border-b hover:bg-background transition">
              <td className="px-4 py-3"><img src={element.image} alt={element.name} className="w-12 h-12 object-cover rounded-md" /></td>
              <td className="px-4 py-3 font-medium">{element.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{element.category}</td>
              <td className="px-4 py-3 font-semibold">{element.total_sold}</td>
              <td className="px-4 py-3 text-yellow-500 font-semibold">{element.ratings}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopSellingProducts;
