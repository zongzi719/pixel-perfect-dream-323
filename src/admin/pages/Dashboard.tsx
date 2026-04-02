import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardStats } from "@/admin/data/mockData";
import { Users, Coins, TrendingUp, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const statCards = [
  { title: "总用户数", value: dashboardStats.totalUsers.toLocaleString(), icon: Users, change: "+10.3%" },
  { title: "活跃用户", value: dashboardStats.activeUsers.toLocaleString(), icon: Zap, change: "+8.2%" },
  { title: "Token总消耗", value: (dashboardStats.totalTokens / 1000000).toFixed(1) + "M", icon: Coins, change: "+12.5%" },
  { title: "总收入(元)", value: "¥" + dashboardStats.revenue.toLocaleString(), icon: TrendingUp, change: "+8.9%" },
];

const COLORS = ["#171717", "#404040", "#737373", "#a3a3a3", "#d4d4d4"];

export default function Dashboard() {
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
                  <p className="text-xs text-emerald-600 mt-1">{stat.change} 较上月</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-neutral-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-neutral-200">
          <CardHeader><CardTitle className="text-base">用户增长</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboardStats.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#171717" strokeWidth={2} dot={{ fill: "#171717" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader><CardTitle className="text-base">Token消耗趋势</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardStats.tokenUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => (v / 1000000).toFixed(0) + "M"} />
                <Tooltip formatter={(v: number) => (v / 1000000).toFixed(2) + "M"} />
                <Bar dataKey="input" fill="#404040" name="输入" radius={[2, 2, 0, 0]} />
                <Bar dataKey="output" fill="#171717" name="输出" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader><CardTitle className="text-base">收入趋势</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboardStats.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => "¥" + (v / 1000).toFixed(0) + "k"} />
                <Tooltip formatter={(v: number) => "¥" + v.toLocaleString()} />
                <Line type="monotone" dataKey="amount" stroke="#171717" strokeWidth={2} dot={{ fill: "#171717" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader><CardTitle className="text-base">功能使用分布</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={dashboardStats.featureUsage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} ${value}%`} fontSize={12}>
                  {dashboardStats.featureUsage.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
