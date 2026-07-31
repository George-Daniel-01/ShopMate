import { Users, Package, Star, Truck } from "lucide-react";

const StatsBar = () => {
  const stats = [
    { icon: Users, value: "10K+", label: "Happy Customers" },
    { icon: Package, value: "5K+", label: "Products Delivered" },
    { icon: Star, value: "4.8/5", label: "Average Rating" },
    { icon: Truck, value: "50+", label: "Countries Served" },
  ];

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
