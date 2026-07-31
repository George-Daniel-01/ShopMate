import {
  Wallet,
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  BarChart4,
  UserPlus,
} from "lucide-react";
import { useAppSelector } from "../../../app/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card";

const ICON_TONES = [
  "text-success bg-success/10",
  "text-primary bg-primary/10",
  "text-warning bg-warning/10",
  "text-destructive bg-destructive/10",
  "text-primary bg-primary/10",
  "text-success bg-success/10",
];

const MiniSummary = () => {
  const {
    topSellingProducts,
    lowStockCount,
    revenueGrowth,
    newUsersThisMonth,
    currentMonthSales,
    orderStatusCounts,
  } = useAppSelector((state) => state.admin);

  const totalOrders = Object.values(orderStatusCounts).reduce(
    (acc: number, count) => acc + (count ?? 0),
    0
  );

  const summary = [
    { text: "Total Sales this Month", subText: `$${currentMonthSales} this month`, icon: Wallet },
    { text: "Total Orders Placed", subText: `${totalOrders} orders in total`, icon: PackageCheck },
    {
      text: "Top Selling Product",
      subText: `${topSellingProducts[0]?.name || "—"} (${topSellingProducts[0]?.total_sold || 0} sold)`,
      icon: TrendingUp,
    },
    { text: "Low Stock Alerts", subText: `${lowStockCount} products running low`, icon: AlertTriangle },
    {
      text: "Revenue Growth Rate",
      subText: `Revenue ${revenueGrowth.includes("+") ? "up" : "down"} by ${revenueGrowth}`,
      icon: BarChart4,
    },
    { text: "New Customers This Month", subText: `${newUsersThisMonth} new customers`, icon: UserPlus },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>Key metrics for the current month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {summary.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${ICON_TONES[index]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.text}</p>
                <p className="text-sm text-muted-foreground truncate">{item.subText}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default MiniSummary;
