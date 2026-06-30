"use client";

import { useState, useEffect } from "react";
import { getSellerAnalytics } from "@/lib/action/action";
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: 12,
  color: "var(--foreground)",
};

function ChartCard({ title, description, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Fake fallback data — used when DB has no records yet ──────
const FAKE_MONTHLY = [
  { month: "Jan", count: 3 },
  { month: "Feb", count: 7 },
  { month: "Mar", count: 5 },
  { month: "Apr", count: 12 },
  { month: "May", count: 9 },
  { month: "Jun", count: 15 },
];
const FAKE_TOP_PRODUCTS = [
  { title: "Dell Laptop", sales: 8 },
  { title: "iPhone 13", sales: 5 },
  { title: "Office Chair", sales: 4 },
  { title: "Sony Headphones", sales: 3 },
];

export default function SellerAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await getSellerAnalytics();
      setAnalytics(res.success ? res.result : null);
      setLoading(false);
    };
    load();
  }, []);

  const monthlySales = analytics?.monthlySales?.length
    ? analytics.monthlySales
    : FAKE_MONTHLY;

  const topProducts = analytics?.topProducts?.length
    ? analytics.topProducts
    : FAKE_TOP_PRODUCTS;

  const usingFakeData = !analytics?.monthlySales?.length;

  if (loading) {
    return (
      <div className="space-y-5 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5">
              <div className="h-4 w-32 bg-muted rounded animate-pulse mb-4" />
              <div className="h-48 w-full bg-muted rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        {usingFakeData && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            Sample data — real data appears as orders come in
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Sales Trend */}
        <ChartCard
          title="Monthly Sales Trend"
          description="Number of sales per month"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySales} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false} tickLine={false} width={28}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--accent)" }} />
              <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Selling Products */}
        <ChartCard
          title="Top Selling Products"
          description="Your best performing listings"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="title"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false} tickLine={false} width={100}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="sales" radius={[0, 6, 6, 0]} name="Sales">
                {topProducts.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Empty state if no orders at all */}
      {usingFakeData && (
        <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Real analytics will appear here</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start receiving orders to see your actual performance data
          </p>
        </div>
      )}
    </div>
  );
}
