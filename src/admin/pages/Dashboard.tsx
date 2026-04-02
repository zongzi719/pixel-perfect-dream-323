import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/admin/hooks/useDashboard";
import { Users, Coins, TrendingUp, Zap, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;
  }

  const statCards = [
    { title: "总用户数", value: (stats?.totalUsers ?? 0).toLocaleString(), icon: Users },
    { title: "活跃用户", value: (stats?.activeUsers ?? 0).toLocaleString(), icon: Zap },
    { title: "Token总消耗", value: ((stats?.totalTokens ?? 0) / 1000000).toFixed(1) + "M", icon: Coins },
    { title: "总收入(元)", value: "¥" + (stats?.revenue ?? 0).toLocaleString(), icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-neutral-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-neutral-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-neutral-200">
        <CardContent className="p-6 text-center text-neutral-500">
          图表数据将在数据积累后显示
        </CardContent>
      </Card>
    </div>
  );
}
