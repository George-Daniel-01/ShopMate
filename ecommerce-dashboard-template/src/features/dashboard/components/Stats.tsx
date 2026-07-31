import { useEffect, useState } from "react";
import { DollarSign, Users, Wallet } from "lucide-react";
import { formatNumber } from "../../../lib/helper";
import { useAppSelector } from "../../../app/hooks";
import StatCard from "../../../components/ui/StatCard";

const Stats = () => {
  const [revenueChange, setRevenueChange] = useState("");
  const {
    totalUsersCount,
    todayRevenue,
    yesterdayRevenue,
    totalRevenueAllTime,
  } = useAppSelector((state) => state.admin);

  useEffect(() => {
    const change =
      yesterdayRevenue === 0
        ? 100
        : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
    setRevenueChange(`${change >= 0 ? "+" : "-"}${change.toFixed(2)}%`);
  }, [todayRevenue, yesterdayRevenue]);

  const stats = [
    {
      title: "Today Revenue",
      value: `$${formatNumber(todayRevenue)}`,
      change: revenueChange,
      icon: Wallet,
      tone: "primary" as const,
    },
    {
      title: "Total Users",
      value: totalUsersCount || 0,
      icon: Users,
      tone: "accent" as const,
    },
    {
      title: "All Time Revenue",
      value: `$${formatNumber(totalRevenueAllTime)}`,
      icon: DollarSign,
      tone: "success" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default Stats;
