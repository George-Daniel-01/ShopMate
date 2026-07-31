import Header from "../../layout/components/Header";
import MiniSummary from "../components/MiniSummary";
import TopSellingProducts from "../components/TopSellingProducts";
import Stats from "../components/Stats";
import MonthlySalesChart from "../components/MonthlySalesChart";
import OrdersChart from "../components/OrdersChart";
import TopProductsChart from "../components/TopProductsChart";

const Dashboard = () => (
  <main className="p-4 pl-4 md:pl-[17rem] w-full">
    <div className="md:p-6 space-y-6">
      <Header />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Check the sales and value.
        </p>
      </div>
      <Stats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <MonthlySalesChart />
        <OrdersChart />
        <TopProductsChart />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <TopSellingProducts />
        <div>
          <MiniSummary />
        </div>
      </div>
    </div>
  </main>
);

export default Dashboard;
